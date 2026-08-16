# Changelog

All notable changes to Acuon templates. Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow semantic versioning for rules-MVP.

## [0.4.6] — 2026-08-16

### Added
- Contact email for feedback and reports: **acuon.ai@gmail.com** (README, SECURITY, CONTRIBUTING, Code of Conduct, Quick-start).

### Changed
- **Pilot telemetry privacy:** `repo` in events is now a random local `repoId` (stored in `.acuon/config.json`), never derived from the working-directory path. Existing configs are backfilled on first run after upgrade.
- **Pilot telemetry accuracy:** card `issued` / `[REVEAL]` / `[CREDIT]` in fenced code blocks, inline mentions, and indented examples are no longer logged as real events (fixes install-time false-positive from onboarding card samples). Live cards at column 0 still count.
- Template version header (`acuon-cursor.mdc`, `acuon-claude.md`) raised to **0.4.6** to match the pack.
- **EN pack hook:** 0.3.x command aliases are English-only. Russian 0.3.x phrases (`Проверено:`, `Не принято`, …) are no longer matched; a Russian-speaking user of this pack still logs via ASCII tokens or the agent's `[ACUON] [TOKEN]` restatement. Translated field labels (`**Режим:** VERIFY`) are unchanged.

## [0.4.5] — 2026-08-16

### Changed
- **Whole card in the working language.** The language rule is strengthened: field labels, the title with its trailing "— …", descriptive values, and skill names are translated into the working language; ASCII tokens/markers/mode values/setting keys are not. A mixed card (English scaffold + non-English body, or vice versa) is declared a defect; loanword stubs (`claim`, `falsify`, `counterexample`) must not be left untranslated.
- **Claim cards reworded.** The unclear `I commit to (find at least one counterexample)` becomes `The agent asserts — find at least one counterexample`: explicit subject (the agent asserts) and action (the human hunts a counterexample). Card title `— falsify the claims` → `— claim check`.

## [0.4.4] — 2026-08-13

### Added
- **Human review summary:** after `[VERDICT]` the agent opens with two dry sentences in the user's language (review successful / unsuccessful / not credited, then the practice count in words — "successful reviews now N" — and level L of 5). `[REVIEW]` / `[CREDIT]` follow as protocol; `[ACCEPTED]` / `[NOT-ACCEPTED]` are only about the agent's work. Saying the **level** rose when the band did not change is forbidden. `[CREDIT]` carries numbers and the skill ID; it is omitted when credit is zero.

## [0.4.3] — 2026-08-12

### Changed
- **`review_floor` escalates on load-bearing gating artifacts.** When an artifact gates the next stage (audit / map / design note), the human did not substantively check it (abstain or bare "all clean"), and risk ≥ medium, the quiet self-review escalates from a one-line log to one bounded spot-check of the single riskiest claim (an attempt to find a counterexample), with an explicit ceiling "not the whole artifact".
- The spot-check feeds the **DoD axis** (safe to build on?), not skill: it never grants positive credit and never replaces the primary reviewer (sequencing intact — runs only after `[VERDICT]` / abstain). A counterexample found = false confidence → unearned credit is not granted / is retracted, a diagnostic shock is shown, DoD flagged "claim broken". No counterexample → the riskiest claim holds (bounded); the stage proceeds deliberately.
- Honest ceiling reaffirmed: same model weights catch gross, not subtle errors; full after-code truth without seed is Phase-2 cross-agent reference review.

## [0.4.2] — 2026-08-12

### Added
- **VERIFY sequencing (human before agent):** on a VERIFY step the human is always the primary reviewer; any agent review of the same result (verdict adjudication, hidden reference review, `review_floor`) runs only after `[VERDICT]`.
- **Verdict adjudication** for after-code VERIFY without seed: fresh pass (not defending prior output), presumption in favor of the human's finding, soft rule for bare "all clean" (one neutral clarifying question → credit or abstain, never `[NOT-ACCEPTED]` against the human).
- **Spot-check + falsification** for map/audit artifacts: put only load-bearing claims into VERIFY; agent commits to checkable assertions; human looks for one counterexample. Design/audit artifacts classify as before-code VERIFY (`verify-design`) before the file is written.
- **`review_floor`** (`on` / `off`, default `on`): quiet strict agent self-review on `[SKIP]` and at stage boundaries (one-line summary); never replaces or precedes human VERIFY.

### Changed
- Credit table: bare "all clean" (after-code without seed) now routes through the clarifying question — substantiated → `+1`, not substantiated → abstain (0).
- Limitations: honest ceiling that after-code grading without seed relies on same-agent self-review; independent cross-agent is Phase 2.

## [0.4.1] — 2026-08-01

### Fixed
- **VERIFY card could self-reveal a seed:** the agent leaked meta such as "Seed candidate" / "you might mistakenly simplify this step" into the proposal, breaking priming. Seed safety invariant now has item 5 (stealth until `[REVEAL]`): before the verdict, labels and hints about planting are forbidden; any defect lives only as ordinary proposal content. Card task template and `HOWITWORKS.md` updated.

## [0.4.0] — 2026-08-01

One English pack now serves developers working in any language: the machine-readable layer was separated from the human-readable one.

### Added
- **Working-language directive**: cards, review notes, `[REVEAL]` explanations, and summaries follow the user's language; block markers, mode values, command tokens, setting keys, and skill-area IDs stay ASCII. New `language` setting (`auto` by default — detected from the user's messages).
- **Language-neutral command tokens**: `[VERDICT]`, `[HYPOTHESIS]`, `[DONE]`, `[HINT]`, `[SWITCH]`, `[SKIP]`, `[CALIBRATE]`, `[DISPUTE]`, `[REPLAN]` — identical in every language. Phrasing in the user's own language is also accepted, and the agent then restates the canonical token on an `[ACUON]` line — that restatement is what telemetry records, so a command phrased in any language still counts. Only `[VERDICT]`, `[DONE]`, `[SKIP]`, `[SWITCH]`, and `[DISPUTE]` produce events; the rest are protocol-only.
- **Verdict tokens** `[ACCEPTED]` / `[NOT-ACCEPTED]` in the review card, replacing a prose verdict that only parsed in English and Russian. The token is now mandatory: a review card without one is malformed.
- **`ID` column in `SKILL_PROFILE.md`**: a stable, language-neutral key per skill area (`verify-authz`, `debugging`, …). Display names are free to translate; `focus_areas`, `skip_areas`, and `[CALIBRATE]` take IDs. Profiles from 0.3.x without the column keep working — the agent matches by name — and in a half-migrated profile a setting value is resolved as an ID first, then as a display name.
- **`dispute` event**, separating "I disagree with your review verdict" from `reject` ("this work does not meet the criteria"); until now both landed in the log as `reject`.
- Localized-card example in `examples/verify-plan-example.md` (Spanish card, ASCII protocol, `[ACUON]` restatement).
- **Ack dedupe guard**: if the agent restates a command the user already typed as a token — the rule forbids it, but agents can slip — the hook now drops the immediate duplicate `[ACUON]`-sourced event instead of double-counting the action. See Limitations for the residual case this doesn't catch.
- Dev utilities: `scripts/test-telemetry-hook.mjs` (67 hook cases, including a same-session sequence harness) and `scripts/sync-templates.mjs` (derives `acuon-claude.md` and `SKILL_PROFILE.md` from `acuon-cursor.mdc`).

### Fixed
- **Hook silently mis-attributed events outside English and Russian.** The mode field was matched by its label (`Mode`/`Режим` only), so `**Modo:** VERIFY` fell through and a rejection was logged as `TUTORIAL`. Worse, the rejection *trigger* itself was English/Russian prose, so "No aceptado" produced no event at all. The hook now reads the ASCII mode value regardless of the label's language, and keys rejection off the `[NOT-ACCEPTED]` token.
- **An accepted review could be logged as a rejection** when its title happened to contain the legacy phrase — `## [REVIEW] [ACCEPTED]: previously Not accepted case`. The verdict token now wins, and legacy prose is consulted only when no token is present.
- **A mode merely named in prose was read as the mode field**, so `[CREDIT]` describing a catch "during MANUAL investigation" was credited to MANUAL. Only a labelled value counts now; a block without one defaults to VERIFY.
- **An unrelated bolded label could still supply a mode word** — `Status: MANUAL` was read the same as `**Mode:** MANUAL`. The label itself must now be bold (matching what every template already does), which tells a real mode field apart from incidental prose without hardcoding a word for "mode" in every language.
- **A mode value with its own emphasis fell through to the fallback** — `**Mode:** **VERIFY**` or `` **Mode:** `VERIFY` `` produced no match, so a `[NOT-ACCEPTED]` review defaulted to `TUTORIAL` instead of reading `VERIFY`. Surrounding `**`/`` ` `` around the value is now ignored.
- A message that quoted an earlier `[VERDICT]` while disputing it was logged as the verdict, not the dispute.
- **A bare `[ACUON] …` line in a doc example** (` ``` ` / `~~~` fences, or leading spaces) was read as a real restatement — those are now stripped or ignored; only a column-0 `[ACUON]` line counts.
- **The heuristic path (hosts without `hook_event_name`)** mis-routed protocol quotes as agent output and later dropped agent replies that opened with prose before `[CREDIT]`. Untagged messages with block markers now route to the agent path unless the first non-empty line is a user question (`?` or *what/how/why/explain/…*). Cursor's named hooks are unaffected.
- **`isDuplicateAck` could drop a second legitimate phrased ack** — dedupe now fires only when the immediately preceding event was a direct user token (`via` absent), not another ack.
- **`[CREDIT]` blocks could absorb a `###` heading** and read `**Mode:**` from below — stop at any ATX heading (`\n#{1,6}\s`).
- **Fullwidth colon `：` after a bold mode label** (common in Japanese) fell through to the VERIFY fallback — `[:：]` is now accepted.
- `[DISPUTE]` with no mode token in the message defaulted to `MANUAL`; it now defaults to `VERIFY`, matching the review context a dispute is normally raised in.
- **`parseReviewMode` could read `**Mode:**` from a following `[CREDIT]` block** when the review card omitted its own mode field — reject mode now stops at `[CREDIT]` / `[REVEAL]` / `[ACUON]`, not only at the next `##` heading.
- **An unclosed ` ``` ` / `~~~` fence** left a quoted `[ACUON]` line loggable as a real ack — unclosed fences are now stripped only through the example body (paragraph break, ATX heading, or a column-0 `[ACUON]` after other lines), so a real ack after forgotten close is preserved.
- **A UTF-8 BOM before the first `[ACUON]` line** prevented a real ack from matching — the BOM is stripped before column-0 matching.
- **Only the first `[REVIEW] [NOT-ACCEPTED]` in a response was logged as `reject`** when several appeared in one message — each rejected review card now emits its own event.
- **A blank line inside an unclosed fence could make a trailing `[ACUON]` in the same example log as a real ack** — paragraph breaks inside a fence no longer end the strip unless the next line is prose; `[ACUON]` after prose still counts.
- **Fences longer than three backticks / tildes** (` ```` `, etc.) were not stripped — any run of 3+ matching fence characters is now handled.

### Compatibility
- Non-breaking: every 0.3.x command phrase remains a working alias, and 0.3.x profiles are still read. Updating means copying the new rule and, optionally, adding the `ID` column and `language` to an existing profile.
- **Update the rule, not just the hook.** The `[ACUON]` restatement that gets a phrased command into telemetry (see "Working language") is defined in the rule, not the hook — an updated hook paired with an 0.3.x rule silently loses non-English/Russian phrased commands again.

## [0.3.2] — 2026-07-26

### Added
- **Before-code gate at plan authoring**: when the agent authors the plan (`decompose` / "make a plan"), the design is put up for VERIFY **before** the file is written — on risky tasks, rare and unpredictable; the seed never lands in the plan file.
- **`seed_frequency`** (`off` / `light` / `normal` / `high`, default `normal`): share of before-code VERIFY that carry a seed. Does not affect how often VERIFY itself fires.
- **Visibility floor**: on a design-risky task with an agent-authored plan — at least one before-code design review (even without a seed).
- **Step-level before-code**: situational approach proposal on a risky step where the plan does not fix the "how".

### Changed
- **Review-skill credit decoupled from work acceptance**: a confirmed catch (a real problem found in the agent's work) grants `+1` to the subskill even when the verdict is "not accepted". DoD stays open regardless of the credit. The agent outputs a `[CREDIT]` block; the hook logs a `credit` event to `acuon-events.jsonl`.
- Hook `acuon-telemetry.mjs`: unified script with RU+EN user-command patterns.

## [0.3.1] — 2026-07-21

### Added
- **Adopt** mode (`plan_source: adopt`, default): a ready plan in a file or chat is taken **as is**, without replanning; override — `Replan` command.
- **In-file plan markup** (`plan_markup: on`, default): `[Acuon: …]` tags for non-DO steps are appended directly into the markdown plan — visible as a diff; DO is not tagged; seed is never written to the file.
- Adopt + diff-markup example in `examples/verify-plan-example.md`.
- Pilot telemetry: `acuon-telemetry.mjs` extended for VERIFY/DIAGNOSE (`verdict`, `reveal`, `issued`, `done`); `reject` parses all four modes.

### Changed
- V1/V4 labels replaced with **before code** / **after code** in all user-facing templates.
- Profile area "design and requirements (V4)" → "design and requirements (before code)".
- Root `templates/` synced with `public-ru/` staging pack (including `practice_mode`, adopt, in-file markup).

## [0.3.0] — 2026-07-08

### Added
- **VERIFY** mode: before-code review (design; a seed is possible — only in chat) and after-code review (on the real diff; no seed).
- **DIAGNOSE** mode (agent coaches debugging, does not fix).
- **Seed safety invariant**: the seed lives only in proposal/chat; only the clean version goes to the project.
- Verification sub-skills in `SKILL_PROFILE.md` (authz-scope, idempotency, races, trust in green tests, reading others' diffs, before-code design, architectural risk).
- Commands: `Verified:`, `Hypothesis [DIAGNOSE]:`, `Diagnosis found [DIAGNOSE]:`, `Hint [DIAGNOSE]:`.

### Changed
- Head frame: skill-adaptive → **trust-calibration layer**.
- `QUICKSTART.md` rewritten for v2 modes and onboarding with verification areas.
- Cursor and Claude Code templates synchronized (one protocol, two targets).

## [0.2.0] — 2026-06-19

### Added
- First public rules-MVP iteration: DO / MANUAL / TUTORIAL modes.
- Templates `acuon-cursor.mdc`, `acuon-claude.md`, `SKILL_PROFILE.md`, `QUICKSTART.md`.
- Optional pilot telemetry (hooks).

[0.4.6]: https://github.com/acuonhq/acuon/releases/tag/v0.4.6
[0.4.0]: https://github.com/acuonhq/acuon/releases/tag/v0.4.0
[0.3.2]: https://github.com/acuonhq/acuon/releases/tag/v0.3.2
[0.3.1]: https://github.com/acuonhq/acuon/releases/tag/v0.3.1
[0.3.0]: https://github.com/acuonhq/acuon/releases/tag/v0.3.0
[0.2.0]: https://github.com/acuonhq/acuon/releases/tag/v0.2.0
