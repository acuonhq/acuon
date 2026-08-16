# How Acuon works

A short explanation of the mechanics. Installation — in [QUICKSTART.md](./QUICKSTART.md).

## The problem

When AI both writes and reviews code, the hard part is no longer writing it — it's **acceptance**: deciding whether the result can be trusted and merged. What matters isn't typing fast; it's being able to judge the output.

The catch: the more you lean on AI, the more **quietly** your own ability to read and judge code fades — the very skill you need to accept a result deliberately.

Acuon plugs into agent workflows and **trains and tests your ability to judge whether AI code can be accepted** — on a real task, in a real repository.

## Five modes

For each subtask the agent picks a mode by risk and your level:

| Mode | When | What you do |
|------|------|-------------|
| **DO** | routine, high skill | nothing — agent does it |
| **VERIFY** | medium+ risk, agent produced output | check **before** acceptance |
| **DIAGNOSE** | bug / agent "going in circles" | lead debugging; agent does not fix |
| **MANUAL** | skill "rusting" | write by hand (maintenance) |
| **TUTORIAL** | new domain | learn with coaching, no ready answer |

**DO and VERIFY are always on**: the agent either does the work itself or asks you to check the result before acceptance. **MANUAL, TUTORIAL, and DIAGNOSE are hands-on work** (implementing, learning, debugging); **they are off by default**.

## Making it fit your workflow

By default Acuon runs in **"review-only"** mode: the agent issues only DO and VERIFY and never makes you do anything by hand. Everything is controlled by settings in `SKILL_PROFILE.md` (overridable with a command anytime):

- **`practice_mode`** — the master switch: `off` (default) — DO + VERIFY only; `on` — enables hands-on modes (MANUAL / TUTORIAL / DIAGNOSE).
- **`training_intensity`** — how often to give hands-on tasks: `light` / `normal` / `intense` (applies when `practice_mode: on`).
- **`focus_areas`** — areas you want to keep sharp or learn: the agent prioritizes them.
- **`skip_areas`** — areas the agent always handles itself (DO only).

**VERIFY is not turned off** by these settings — review before acceptance always stays; that's the whole point of the layer.

| What you want | How to set it |
|---------------|---------------|
| Only review-quality calibration — no hands-on work (default) | `practice_mode: off` — you keep DO + VERIFY |
| Keep skills sharp by hand and debug yourself | `practice_mode: on`, `training_intensity: normal` or `intense`; put the areas in `focus_areas` |
| Learn new areas | `practice_mode: on`; put new areas in `focus_areas`; on a MANUAL card you can switch to a lesson with `[SWITCH]` |

On any subtask: **`[SKIP]`** — do it as DO; **`[CALIBRATE] <area id> = <N>`** — raise the level (higher = fewer MANUAL). Full command list — in [QUICKSTART.md](./QUICKSTART.md).

## One pack, your language

Acuon separates the layer a machine reads from the layer you read.

- **You read your own language.** Cards, review notes, explanations, and summaries come in whatever language you write to the agent in. Set it explicitly with `language` in the profile, or leave `auto` and the agent picks it up from your messages.
- **The protocol stays ASCII.** Command tokens (`[VERDICT]`, `[DONE]`, `[SKIP]`), block markers (`[VERIFY]`, `[REVEAL]`, `[CREDIT]`), verdicts (`[ACCEPTED]`, `[NOT-ACCEPTED]`), mode names, setting keys, and skill-area IDs are identical in every language. That is what makes the telemetry hook work without knowing your language.
- **Names you can translate.** Skill-area display names are yours to localize; the `ID` column is what the agent matches on, so translating a name breaks nothing.

You can also type commands as a phrase in your own language — the agent accepts it and then restates the canonical token on an `[ACUON]` line, because the token is what gets recorded. Card footers always print the token, so typing it is the shortest path.

## Existing plan and in-file markup

If you already have a plan in a file (e.g. a detailed slice plan), Acuon **does not replan** it: it takes the steps as is and only **appends mode markup** next to the non-DO items directly in the file — you see it as a diff. DO is not tagged. Controlled by the `plan_source` setting (default `adopt`) and `plan_markup` (default `on`); the `[REPLAN]` command allows re-decomposing the plan.

If instead the **agent authors the plan** ("make a plan and write it to a file"), the plan itself is a before-code design. On a risky task Acuon sometimes runs a **before-code review** here (a gate): it shows the key decisions in chat, sometimes with a seed; you give a `[VERDICT]`, `[REVEAL]` follows, and only then the **clean** plan is written to the file. How often such a seed occurs is the `seed_frequency` setting (default `normal`). This gives before-code checking a place even in a "plan first, then execute" flow.

The same applies to **audit / design maps**: prefer VERIFY **before** the file is written. If the map is already on disk, Acuon asks you to falsify a few load-bearing claims — not to re-prove the whole artifact. On every VERIFY step the human reviews first; any agent self-review (`review_floor`, verdict adjudication) comes only after your `[VERDICT]`. If you abstain on such a load-bearing gating artifact, `review_floor` runs one bounded spot-check of the riskiest claim — a safety check on whether it's safe to build on, not a grade of you.

## VERIFY: before-code and after-code review

VERIFY — the agent already proposed or did something; you **check before integration** (merge/commit/"accepted").

- **Before-code review (design, sometimes with a seed).** Sometimes, **without announcing**, the agent plants a plausible defect **in proposal/chat** — before code is written. You record a verdict (`[VERDICT] …`), then `[REVEAL]` shows whether there was a seed and what you caught/missed. Catches *sins of omission* (wrong frame, missed requirement, uncovered edge case) — the blind spot of diff review.
- **After-code review (real diff, no seed).** Targeted questions on code on disk. Trains review habit and catches *sins of presence* (bug in the line). Safe default on risky tasks.

On the most critical tasks — stack **before-code + after-code review**.

After your `[VERDICT]` the agent opens with **two plain sentences** (no tokens): whether the review succeeded, how many successful reviews are counted, and what your level is. The `[REVIEW]` / `[CREDIT]` blocks below are protocol; you do not have to read them.

- **Review successful** — the verdict is useful (you found a problem or substantiated cleanliness). If the agent's design then goes back for revision, that is a successful review, not a grade of you.
- **Review unsuccessful** — the verdict missed (you accepted work that still has a hole).
- **Review not credited** — the verdict has no substance (e.g. "all clean" without what you checked); no point given, level unchanged.

`[NOT-ACCEPTED]` refers to the **agent's work**, not to your review.

## Seed safety invariant

A seed (before-code review) **never** lands in your code:

1. Seed lives only in proposal/chat — not in files, commits, applied diff.
2. After `[REVEAL]` the agent writes a **clean** version — that's what you get.
3. After-code review uses the real diff and carries no seed.
4. If an honest safe seed isn't possible — the agent abstains.
5. Until your `[VERDICT]`, the card **must not** label or hint at a seed ("Seed candidate", "you might mistakenly simplify…", etc.) — any defect looks like ordinary proposal text; the first mention of planting is `[REVEAL]`.

Full details — in [../SECURITY.md](../SECURITY.md).

## How this differs from AI review

AI reviewers (CodeRabbit, Bugbot, etc.) answer **"is there a bug in this code?"** Acuon answers another: **"can you trust whoever accepts this code?"** — human, AI reviewer, or autonomous loop. It's a layer **on top**, not a replacement: it calibrates the acceptor, not "who finds bugs better."

## Skill profile

`SKILL_PROFILE.md` at your project root stores levels by area (including verification sub-skills: authorization boundaries, idempotency, races, trust in green tests, reading others' diffs, etc.). The agent updates it after confirmed tasks and adjusts mode selection.

## Honest ceiling (rules-MVP)

For now this is a set of instructions for the agent, not a separate program — hence the limits:

- **No execution guarantees.** The agent follows the rules via a text prompt and can "forget" or bypass them.
- **Skill isn't tracked over time.** The system doesn't notice a skill fading without practice, nor plan what to revisit.
- **The review is soft.** It can be skipped — it's not a hard gate before accepting code.

A full engine with skill memory, smart practice scheduling, and strict review — in later phases.
