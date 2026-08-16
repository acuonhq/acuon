# Acuon pilot telemetry (opt-in)

Behavioral event collection for Phase 1 validation: `issued`, `done`, `skip`, `switch`, `verdict`, `reveal`, `reject`, `dispute`, `credit`.
**No** skill levels, code, or task text. Privacy policy — in [../../SECURITY.md](../../SECURITY.md).

Tracked modes: **VERIFY**, **DIAGNOSE**, **MANUAL**, **TUTORIAL** (DO is not logged).

| Trigger | Event | Mode |
|---------|-------|------|
| Agent card `## [VERIFY]` | `issued` | VERIFY |
| User `[VERDICT]` | `verdict` | VERIFY |
| Agent block `[REVEAL]` | `reveal` | VERIFY |
| Agent card `## [DIAGNOSE]` | `issued` | DIAGNOSE |
| Agent card `## [MANUAL]` / `## [TUTORIAL]` | `issued` | MANUAL / TUTORIAL |
| User `[DONE] [MODE]` | `done` | per token |
| User `[SKIP] [MODE]` / `[SWITCH] [MODE]` | `skip` / `switch` | per token |
| User `[DISPUTE]` | `dispute` | per mode in the message |
| Agent `## [REVIEW] [NOT-ACCEPTED]` | `reject` | mode value in the block |
| Agent block `[CREDIT]` | `credit` | mode value in the block (default VERIFY) |
| Agent line `[ACUON] [TOKEN]` | as for that token | as for that token |

Commands outside this table — `[HYPOTHESIS]`, `[HINT]`, `[CALIBRATE]`, `[REPLAN]` — are protocol-only and produce no event.

**Language independence.** The hook matches ASCII tokens and mode values only, so it works whatever language you and the agent talk in. Three consequences worth knowing:

- The field label may be translated — `**Mode:**`, `**Режим:**`, `**Modo:**`, `**モード：**` (fullwidth colon OK) all resolve the same, because the *value* (`VERIFY`, `MANUAL`, …) is what is read. The label itself must be **bold** (`**…:**`); a bare `Status: MANUAL` line is prose, not a mode field.
- `[DISPUTE]` with no mode token in the message defaults to **VERIFY** (review context), not MANUAL.
- An agent `[ACUON] [TOKEN]` restatement is logged only on a **column-0** line (`[ACUON] …` at the start of the line). Lines inside ` ``` ` / `~~~` fences (including an unclosed fence), or indented examples, are ignored. A UTF-8 BOM at the very start of the response is stripped before matching.
- On hosts that omit `hook_event_name`, messages with agent block markers are read as agent output unless the **first non-empty line is a user question** (ends with `?` or starts with *what/how/why/explain/…*). A conversational quote of `[CREDIT]` / `[ACUON]` stays on the user path; prose before `[CREDIT]` in a real agent reply still logs. Cursor with named hooks is unaffected.
- Legacy 0.3.x phrasing (`Verified:`, `Task [MANUAL] completed:`) is still recognized in English. Phrasing in any other language — including Russian 0.3.x formulas — is **not** matched. That is what the `[ACUON] [TOKEN]` line is for: the rule has the agent restate a phrased command as its canonical token, and only then does the action reach the log. If the log looks thinner than the session felt, check that the agent is emitting those lines.

## Installation (Cursor)

```bash
# From your project root
mkdir -p .cursor/hooks
cp path/to/acuon/templates/pilot-telemetry/acuon-telemetry.mjs .cursor/hooks/
cp path/to/acuon/templates/pilot-telemetry/hooks.json .cursor/hooks.json
```

Requires **Node.js** (18+). Restart Cursor or check the Hooks tab.

## What gets created

| Path | Purpose |
|------|---------|
| `.acuon/acuon-events.jsonl` | Local event log (transparent, readable) |
| `.acuon/config.json` | Created by the hook on first event: `participant`, `repoId` (random local repo id), install date, opt-in |

Add `.acuon/` to `.gitignore` if you don't want to commit the log.

## Data transfer (hybrid)

1. **Default:** participant manually sends `acuon-events.jsonl` when the pilot organizer requests it.
2. **Opt-in auto-POST:** after the first event, edit the created `.acuon/config.json` — set `optInRemote: true` and `remoteUrl` (receiver URL, if the pilot organizer provided one).

## Event schema

```json
{
  "schema": 1,
  "ts": "2026-06-18T01:12:00Z",
  "participant": "anon-7f3a2c",
  "repo": "b4f9e1",
  "tool": "cursor",
  "week": 2,
  "session": "local",
  "mode": "MANUAL",
  "event": "skip"
}
```

`repo` is a **random local** repository id: generated at install, stored in `.acuon/config.json`, and **never** derived from the on-disk path.

Skill area is **not** transmitted (pilot privacy).

## Claude Code

Copy `acuon-telemetry.mjs` into Claude Code hooks and wire `UserPromptSubmit` and `Stop`/`PostToolUse` per tool docs. Set `ACUON_TOOL=claude-code` in the hook environment.

## Fallback

Without hooks the agent appends minimal events to `.acuon/agent-events.jsonl` (less reliable).
