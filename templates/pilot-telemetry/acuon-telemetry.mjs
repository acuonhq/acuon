#!/usr/bin/env node
/**
 * Acuon pilot telemetry — Cursor hook script.
 * Writes validation events to .acuon/acuon-events.jsonl (no skill levels, no code).
 *
 * Install: copy to .cursor/hooks/acuon-telemetry.mjs and wire in .cursor/hooks.json
 */

import { randomBytes } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const ACUON_DIR = ".acuon";
const EVENTS_FILE = join(ACUON_DIR, "acuon-events.jsonl");
const CONFIG_FILE = join(ACUON_DIR, "config.json");

function readStdin() {
  try {
    const raw = readFileSync(0, "utf8").trim();
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function ensureConfig() {
  mkdirSync(ACUON_DIR, { recursive: true });
  if (!existsSync(CONFIG_FILE)) {
    const config = {
      participant: `anon-${randomBytes(3).toString("hex")}`,
      repoId: randomBytes(4).toString("hex"),
      installedAt: new Date().toISOString(),
      optInRemote: false,
      remoteUrl: null,
    };
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    return config;
  }
  const config = JSON.parse(readFileSync(CONFIG_FILE, "utf8"));
  // Backfill a random repo id for configs created before this field existed.
  // The id is never derived from the working-directory path: a short path hash
  // is weakly reversible and could deanonymize the repository.
  if (!config.repoId) {
    config.repoId = randomBytes(4).toString("hex");
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  }
  return config;
}

function weekSinceInstall(config) {
  const installed = new Date(config.installedAt);
  const elapsed = Date.now() - installed.getTime();
  return Math.max(1, Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000)) + 1);
}

const DEDUPE_WINDOW_MS = 2 * 60 * 1000;

// A phrased command is supposed to be restated on an `[ACUON]` line only when
// the user did NOT already type the token — but if the agent breaks that rule,
// the token event and the restatement would double-count the same action.
// Guard against it: an `[ACUON]`-sourced event is dropped when the immediately
// preceding entry (same participant + session) is the identical event/mode
// within a short window, since that shape only arises from this double path.
// Drop an `[ACUON]`-sourced event only when it immediately follows a direct user
// token for the same action — not when it follows another ack (two phrased
// commands in a row) or unrelated agent noise.
function isDuplicateAck(config, record) {
  if (!existsSync(EVENTS_FILE)) return false;
  const lines = readFileSync(EVENTS_FILE, "utf8").trim().split("\n").filter(Boolean);
  if (!lines.length) return false;
  let prev;
  try {
    prev = JSON.parse(lines[lines.length - 1]);
  } catch {
    return false;
  }
  if (prev.via === "ack") return false;
  const session = process.env.CURSOR_SESSION_ID || "local";
  return (
    prev.event === record.event &&
    prev.mode === record.mode &&
    prev.participant === config.participant &&
    prev.session === session &&
    Date.now() - new Date(prev.ts).getTime() < DEDUPE_WINDOW_MS
  );
}

function appendEvent(record) {
  const config = ensureConfig();
  if (record.dedupe && isDuplicateAck(config, record)) return;

  const event = {
    schema: 1,
    ts: new Date().toISOString(),
    participant: config.participant,
    repo: config.repoId,
    tool: process.env.ACUON_TOOL || "cursor",
    week: weekSinceInstall(config),
    session: process.env.CURSOR_SESSION_ID || "local",
    mode: record.mode,
    event: record.event,
  };
  if (record.via) event.via = record.via;

  writeFileSync(EVENTS_FILE, `${JSON.stringify(event)}\n`, { flag: "a" });

  if (config.optInRemote && config.remoteUrl) {
    postRemote(config.remoteUrl, event).catch(() => {});
  }
}

async function postRemote(url, event) {
  if (typeof fetch !== "function") return;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
}

function modeFromText(text) {
  if (/\[MANUAL\]/i.test(text)) return "MANUAL";
  if (/\[TUTORIAL\]/i.test(text)) return "TUTORIAL";
  return null;
}

// Mode names are protocol constants, so they can be found without knowing the
// language of the label the agent wrote them behind ("**Mode:**", "**Режим:**",
// "**Modo:**"). The template always bolds the label, so requiring that markup
// is what tells a real mode field apart from an unrelated "Status: MANUAL" or
// "Priority: VERIFY" line — no need to know every language's word for "mode".
// The value itself may pick up incidental emphasis too (`**VERIFY**`, `` `VERIFY` ``).
// ASCII or fullwidth colon after the label — CJK agents often use ：.
function modeInScope(scope, fallback) {
  const afterLabel = scope.match(/\*\*[^*\n:：]*[:：]\*\*[ \t*_`]*(VERIFY|DIAGNOSE|MANUAL|TUTORIAL)\b/i);
  return afterLabel ? afterLabel[1].toUpperCase() : fallback;
}

function parseReviewMode(block) {
  return modeInScope(block, "TUTORIAL");
}

function reviewHeaderRejected(headerLine) {
  if (!/\[REVIEW\]/i.test(headerLine)) return false;
  if (/\[NOT[- ]?ACCEPTED\]/i.test(headerLine)) return true;
  if (/\[ACCEPTED\]/i.test(headerLine)) return false;
  return /Not accepted/i.test(headerLine);
}

// Scope of one review card — stops before the next top-level block.
function reviewBlockScope(text, startIndex) {
  const slice = text.slice(startIndex);
  const block = slice.match(/\[REVIEW\][\s\S]*?(?=\n##\s|\[(?:CREDIT|REVEAL|ACUON)\]|$)/i);
  return block ? block[0] : slice;
}

function rejectedReviewBlocks(text) {
  const headers = [...text.matchAll(/##\s+\[REVIEW\][^\n]*/gi)];
  if (headers.length) {
    return headers
      .filter((m) => reviewHeaderRejected(m[0]))
      .map((m) => reviewBlockScope(text, m.index));
  }
  const legacy = text.match(/\[REVIEW\][^\n]*/i);
  if (legacy && reviewHeaderRejected(legacy[0])) {
    return [reviewBlockScope(text, legacy.index)];
  }
  return [];
}

// The verdict token wins over legacy prose: an accepted review whose title
// happens to contain "Not accepted" must not be logged as a rejection.
function reviewRejected(text) {
  return rejectedReviewBlocks(text).length > 0;
}

// A [CREDIT] block ends at a blank line, the next heading/separator, or EOF —
// so a mode mentioned elsewhere in the response cannot be attributed to it.
function creditBlocks(text) {
  const re = /\[CREDIT\]([\s\S]*?)(?=\n\s*\n|\n#{1,6}\s|\n---|\[CREDIT\]|$)/gi;
  const blocks = [];
  let match;
  while ((match = re.exec(text)) !== null) blocks.push(match[1]);
  return blocks;
}

function modeFromBlock(block) {
  return modeInScope(block, "VERIFY");
}

// Canonical tokens are ASCII and identical in every language, so a user working
// in any language reports reliably. English 0.3.x phrases stay as aliases;
// other languages reach the log via the agent's `[ACUON] [TOKEN]` restatement.
// `[DISPUTE]` is listed first: a message that quotes an
// earlier verdict while disputing it is about the dispute.
const COMMANDS = [
  { event: "dispute", mode: null, defaultMode: "VERIFY", token: /\[DISPUTE\]/i, legacy: [/dispute review/i] },
  { event: "verdict", mode: "VERIFY", token: /\[VERDICT\]/i, legacy: [/verified\s*:/i] },
  { event: "done", mode: "DIAGNOSE", token: /\[DONE\]\s*\[DIAGNOSE\]/i, legacy: [/diagnosis found\s+\[diagnose\]/i] },
  { event: "done", mode: "MANUAL", token: /\[DONE\]\s*\[MANUAL\]/i, legacy: [/task\s+\[manual\]\s+completed/i] },
  { event: "done", mode: "TUTORIAL", token: /\[DONE\]\s*\[TUTORIAL\]/i, legacy: [/task\s+\[tutorial\]\s+completed/i] },
  { event: "skip", mode: "MANUAL", token: /\[SKIP\]\s*\[MANUAL\]/i, legacy: [/skip\s+\[manual\]/i] },
  { event: "skip", mode: "TUTORIAL", token: /\[SKIP\]\s*\[TUTORIAL\]/i, legacy: [/skip\s+\[tutorial\]/i] },
  { event: "switch", mode: "MANUAL", token: /\[SWITCH\]\s*\[MANUAL\]/i, legacy: [/too hard\s+\[manual\]/i] },
  { event: "switch", mode: "TUTORIAL", token: /\[SWITCH\]\s*\[TUTORIAL\]/i, legacy: [/i[’']ll manage\s+\[tutorial\]/i] },
];

function matchCommand(text, { tokenOnly = false } = {}) {
  for (const command of COMMANDS) {
    if (command.token.test(text)) return command;
    if (!tokenOnly && command.legacy.some((pattern) => pattern.test(text))) return command;
  }
  return null;
}

function logCommand(command, scope, options = {}) {
  appendEvent({
    mode: command.mode || modeFromText(scope) || command.defaultMode || "MANUAL",
    event: command.event,
    dedupe: options.dedupe,
    via: options.via,
  });
}

function handleUserPrompt(text) {
  // A user question may quote an `[ACUON]` example line — that is not a command.
  const scope = text.replace(/^\[ACUON\][^\n]*/gim, "");
  const command = matchCommand(scope);
  if (command) logCommand(command, scope);
}

// Fenced code blocks (` ``` ` / `~~~`, any length ≥3) quote a bare `[ACUON] …` line
// without performing the action. Unclosed fences strip only through the example
// body: a paragraph break counts only when the next line is prose (not more code),
// and a column-0 `[ACUON]` counts only after a prose-exit line or such a break.
function nextNonemptyLine(text) {
  return text.split("\n").find((line) => line.trim())?.trim() ?? "";
}

function isProseExitLine(line) {
  const t = line.trim();
  if (!t) return false;
  if (/^\[ACUON\]/i.test(t)) return true;
  if (/^#{1,6}\s/.test(t)) return true;
  if (/^(Done|Noted|Real|Here|OK|Anotado|Registrado)\b[.:!]?\s*$/i.test(t)) return true;
  if (/^[A-Z][a-z]{2,}.+[.:!?]\s*$/.test(t)) return true;
  if (/^[A-Z]/.test(t) && /\s/.test(t) && !/^\[/.test(t)) return true;
  return false;
}

function unclosedFenceCut(tail) {
  const stops = [];
  const heading = tail.search(/\n#{1,6}\s/);
  if (heading !== -1) stops.push(heading);

  for (const m of tail.matchAll(/\n\s*\n/g)) {
    const after = tail.slice(m.index + m[0].length);
    if (isProseExitLine(nextNonemptyLine(after))) stops.push(m.index);
  }

  const acuon = tail.search(/\n\[ACUON\]/i);
  if (acuon !== -1) {
    const before = tail.slice(0, acuon).replace(/^\n+/, "");
    const linesBefore = before.split("\n").filter((line) => line.trim());
    if (linesBefore.length > 0 && linesBefore.some((line) => isProseExitLine(line))) {
      stops.push(acuon);
    } else if (stops.some((stop) => stop < acuon)) {
      stops.push(acuon);
    }
  }

  return stops.length ? Math.min(...stops) : tail.length;
}

function stripPairedFencesOnce(text) {
  return text.replace(/(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\1\s*(?:\n|$)/g, "\n");
}

function stripUnclosedFences(text) {
  let result = text;
  let searchFrom = 0;
  while (searchFrom < result.length) {
    const slice = result.slice(searchFrom);
    const open = slice.match(/(`{3,}|~{3,})/);
    if (!open || open.index === undefined) break;
    const start = searchFrom + open.index;
    const fence = open[1];
    const afterFence = start + fence.length;
    const lineEnd = result.indexOf("\n", afterFence);
    if (lineEnd === -1) break;
    const bodyStart = lineEnd + 1;
    const escaped = fence.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const closeRe = new RegExp(`\\n${escaped}(?:\\s*)\\n`);
    const rest = result.slice(bodyStart);
    const close = rest.match(closeRe);
    if (close && close.index !== undefined) {
      searchFrom = bodyStart + close.index + close[0].length;
      continue;
    }
    const tail = rest;
    const end = unclosedFenceCut(tail);
    result = result.slice(0, start) + tail.slice(end);
    searchFrom = start;
  }
  return result;
}

function stripQuotedCode(text) {
  let result = text;
  let prev;
  do {
    prev = result;
    result = stripPairedFencesOnce(result);
  } while (result !== prev);
  return stripUnclosedFences(result);
}

function stripBom(text) {
  return text.replace(/^\uFEFF/, "");
}

// Real restatements start at column 0 (`[ACUON] …`). Indented or quoted lines are
// illustrative; inline backticks already fail the line-start match.
function ackedCommands(text) {
  const lines = stripQuotedCode(stripBom(text)).match(/^\[ACUON\][^\n]*/gim) || [];
  return lines
    .map((line) => ({ line, command: matchCommand(line, { tokenOnly: true }) }))
    .filter((entry) => entry.command);
}

function handleAgentResponse(rawText) {
  // Cards, credit and reveal examples live in docs, rules and onboarding replies
  // inside code fences (or indented); strip those first so an illustration is
  // never logged as a real event. Real cards are live markdown, not quoted.
  const text = stripQuotedCode(stripBom(rawText));

  // Card headers must start at column 0 — an inline `## [VERIFY]` mention inside
  // prose or backticks is a reference, not an issued card.
  const manualCards = text.match(/^##\s+\[MANUAL\]/gim) || [];
  const tutorialCards = text.match(/^##\s+\[TUTORIAL\]/gim) || [];
  const verifyCards = text.match(/^##\s+\[VERIFY\]/gim) || [];
  const diagnoseCards = text.match(/^##\s+\[DIAGNOSE\]/gim) || [];

  for (let i = 0; i < manualCards.length; i++) {
    appendEvent({ mode: "MANUAL", event: "issued" });
  }
  for (let i = 0; i < tutorialCards.length; i++) {
    appendEvent({ mode: "TUTORIAL", event: "issued" });
  }
  for (let i = 0; i < verifyCards.length; i++) {
    appendEvent({ mode: "VERIFY", event: "issued" });
  }
  for (let i = 0; i < diagnoseCards.length; i++) {
    appendEvent({ mode: "DIAGNOSE", event: "issued" });
  }

  if (/\[REVEAL\]/i.test(text)) {
    appendEvent({ mode: "VERIFY", event: "reveal" });
  }

  if (reviewRejected(text)) {
    for (const block of rejectedReviewBlocks(text)) {
      appendEvent({ mode: parseReviewMode(block), event: "reject" });
    }
  }

  for (const block of creditBlocks(text)) {
    appendEvent({ mode: modeFromBlock(block), event: "credit" });
  }

  for (const { line, command } of ackedCommands(text)) {
    logCommand(command, line, { dedupe: true, via: "ack" });
  }
}

function firstNonemptyLine(text) {
  return text.trimStart().split("\n").find((line) => line.trim())?.trim() ?? "";
}

// Heuristic path (no hook_event_name): agent markers route to the agent unless the
// first line is clearly a user question quoting the protocol (N30). Prose before
// [CREDIT] in an agent reply still routes agent (N47).
function looksLikeUserProtocolQuestion(text) {
  const lead = firstNonemptyLine(text);
  if (/\?\s*$/.test(lead)) return true;
  return /^(what|how|why|explain|help|can you|could you|what's|что|как|зачем|почему|объясни)\b/i.test(lead);
}

function hasHeuristicAgentMarkers(text) {
  return (
    /##\s+\[(MANUAL|TUTORIAL|VERIFY|DIAGNOSE)\]/i.test(text) ||
    /\[(REVEAL|CREDIT|REVIEW)\]/i.test(text)
  );
}

function extractText(input) {
  const fields = [
    "prompt",
    "user_message",
    "userPrompt",
    "text",
    "response",
    "agent_message",
    "assistant_message",
    "content",
  ];
  for (const key of fields) {
    const value = input[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

const input = readStdin();
const text = extractText(input);

if (text) {
  const hookEvent = input.hook_event_name || input.event || "";
  if (hookEvent.includes("beforeSubmitPrompt") || hookEvent.includes("UserPromptSubmit")) {
    handleUserPrompt(text);
  } else if (hookEvent.includes("afterAgentResponse") || hookEvent.includes("Stop")) {
    handleAgentResponse(text);
  } else {
    if (hasHeuristicAgentMarkers(text) && !looksLikeUserProtocolQuestion(text)) {
      handleAgentResponse(text);
    } else {
      handleUserPrompt(text);
    }
  }
}

process.exit(0);
