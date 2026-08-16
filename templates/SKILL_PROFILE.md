# Skill Profile — Acuon
_version: 2026-01-01T00:00:00Z_

> Updated by the agent after confirmed [MANUAL], [TUTORIAL], [DIAGNOSE], and successful [VERIFY].
> Manual edits allowed — the agent respects changes on re-read.
> `ID` is the stable, language-neutral key — do not change or translate it.
> `Skill area` is a display name — translate it into your language if you prefer.

| ID                 | Skill area                                          | Level | Executions | Last practiced |
|--------------------|-----------------------------------------------------|-------|------------|----------------|
| verify-authz       | Verification: authorization boundaries (authz)      | 1     | 0          | —              |
| verify-idempotency | Verification: idempotency                           | 1     | 0          | —              |
| verify-concurrency | Verification: races and concurrency                 | 1     | 0          | —              |
| verify-green-tests | Verification: trust in green tests                  | 1     | 0          | —              |
| verify-diff        | Verification: reading others' diffs                 | 1     | 0          | —              |
| verify-design      | Verification: design and requirements (before code) | 1     | 0          | —              |
| verify-arch-risk   | Verification: architectural risk                    | 1     | 0          | —              |
| tests              | Writing tests                                       | 1     | 0          | —              |
| sql                | SQL queries                                         | 1     | 0          | —              |
| refactoring        | Code refactoring                                    | 1     | 0          | —              |
| debugging          | Debugging                                           | 1     | 0          | —              |
| git                | Git workflows                                       | 1     | 0          | —              |
| api-design         | API design                                          | 1     | 0          | —              |
| error-handling     | Error handling                                      | 1     | 0          | —              |

## Training settings

language: auto               # auto | any language name, e.g. "ru", "es", "ja"
# auto (default) — the agent detects your language from your messages.
# Cards, reviews, and explanations come in this language; protocol tokens
# ([VERDICT], [DONE], [SKIP], [NOT-ACCEPTED], mode names) always stay ASCII.

practice_mode: off           # off | on
# off (default) — "review-only": the agent issues only DO and VERIFY.
#                 MANUAL / TUTORIAL / DIAGNOSE are off — nothing to do by hand.
# on            — enables hands-on modes (MANUAL / TUTORIAL / DIAGNOSE)
#                 per training_intensity and focus_areas below.

training_intensity: normal   # light | normal | intense
# light    — 1 non-DO task per 15 subtasks
# normal   — 1-2 non-DO tasks per 10 subtasks
# intense  — 3-4 non-DO tasks per 10 subtasks

focus_areas: []
# If set — agent prioritizes these areas for MANUAL/TUTORIAL/VERIFY. Use area IDs.
# Example: ["verify-diff", "debugging"]

skip_areas: []
# Implementation areas that never get MANUAL/TUTORIAL (always DO). Use area IDs.
# VERIFY/DIAGNOSE are not disabled by skip_areas.
# Example: ["git"]

plan_source: adopt           # adopt | decompose
# adopt (default) — if a ready plan already exists (file or message),
#                   the agent takes its steps as is and does not replan.
# decompose       — the agent decomposes the task itself.

plan_markup: on              # on | off
# on (default) — on adopt the agent appends non-DO markup directly into the plan file
#                (visible as a diff); DO is not tagged. seed is not written to the file.
# off          — markup is chat-only; the plan file is not modified.

seed_frequency: normal       # off | light | normal | high
# Share of before-code VERIFY that carry a seed (a planted defect). Does not affect how often VERIFY fires.
# off    — never seed; before-code review is seed-free.
# light  — rare; normal (default) — baseline; high — more often (training under load).

review_floor: on             # on | off
# on (default) — on [SKIP] and at stage completion the agent runs a quiet strict
#                self-review and writes a one-line result (coverage floor).
#                Runs ONLY after human VERIFY, never instead of / before it.
#                On a load-bearing gating artifact not substantively checked by the
#                human — one bounded spot-check of the riskiest claim (DoD axis, not skill).
# off          — self-review coverage floor off.

## Levels (reference)

| Level | Executions | Description                          |
|-------|------------|--------------------------------------|
| 1     | 0–2        | New area / barely practiced          |
| 2     | 3–5        | Basic familiarity                    |
| 3     | 6–10       | Confident, not automatic             |
| 4     | 11–20      | Proficient — MANUAL appears less     |
| 5     | 21+        | Mastery — DO only                    |
