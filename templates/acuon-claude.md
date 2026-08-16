# Acuon — trust-calibration layer

> Add this section to `CLAUDE.md` in your repository.
> Skill profile: `SKILL_PROFILE.md` at repository root.
> Template version: **0.4.6** (rules-MVP v2: VERIFY / DIAGNOSE · before/after code review · design gate at plan authoring · language-neutral protocol · stealth seed · VERIFY sequencing "human before agent" · verdict adjudication + review_floor · review_floor spot-check on gating artifacts · human-readable review summary · whole card in the working language)

Acuon calibrates **trust in accepting AI code**: the agent routes subtasks by risk and verification sub-skills; the human verifies where trust is not yet earned.

---

## Working language

Acuon's machine layer is ASCII and is never translated; everything a human reads follows the user. One English pack therefore serves any language — a localized pack is not needed.

**Follow the user.** Take the working language from `language` in `SKILL_PROFILE.md`; if it is `auto` (default), detect it from the user's messages. Write card bodies, rationale, questions, nudges, review notes, `[REVEAL]` explanations, and summaries in that language.

**Never translate:**

| Element | Examples |
|---------|----------|
| Block markers | `## [VERIFY]`, `## [DIAGNOSE]`, `## [MANUAL]`, `## [TUTORIAL]`, `## [REVIEW]`, `[REVEAL]`, `[CREDIT]`, `[ACUON]` |
| Verdict tokens | `[ACCEPTED]`, `[NOT-ACCEPTED]` |
| Mode names **as values** | `VERIFY`, `DIAGNOSE`, `MANUAL`, `TUTORIAL`, `DO` |
| Command tokens | `[VERDICT]`, `[DONE]`, `[SKIP]`, `[SWITCH]`, `[HINT]`, … |
| Setting keys and skill-area IDs | `seed_frequency`, `plan_source`, `verify-authz` |

**Free to localize:** field labels, skill-area display names, and all prose. `**Modo:** VERIFY` is correct — the label is translated, the value is not. `**Mode:** VERIFICACIÓN` is wrong.

**Whole card in the working language (no mixing).** Everything in a card except the ASCII elements in the "Never translate" table is written in the working language: the title and its trailing "— …", the field labels (`Variant`, `Verification sub-skill`, `Subtask risk`, `Current level`, `Context`, `Task`, `After review`, …), the descriptive values (`after code`, `medium`), and skill names. The card formats below are a **structural** reference: copy the structure, but translate labels and text into the user's language. A mixed card (English scaffold + non-English body, or vice versa) is a defect. Do not leave loanword stubs — render `claim`, `falsify`, `counterexample` in the working language.

**Commands:** always accept the canonical tokens; additionally accept an equivalent phrasing in the user's language. Always print the canonical token in card footers.

**Restating a phrased command (required).** The telemetry hook reads tokens, not prose, so a command phrased in the user's language would otherwise go unrecorded:

1. User typed a **token** → do **not** restate it.
2. User used **phrasing in their own language** → acknowledge with the canonical token on its own line: `[ACUON] [DONE] [MANUAL]`.
3. Never emit an `[ACUON]` line for a command the user already tokenized — it would count the action twice.

This applies to the tracked commands only: `[VERDICT]`, `[DONE]`, `[SKIP]`, `[SWITCH]`, `[DISPUTE]`.

---

## Limitations of this layer (honest free ceiling)

Acuon in rules-MVP is a **protocol and profile in markdown**, not a full Skill Engine:

1. Routing and review rely on the prompt — the agent can "forget" a rule; pilot reliability is measured by **hooks**, not the agent alone.
2. No decay, spaced repetition, or smart training schedule — only manual calibration and the `executions` counter.
3. `[SKIP]` does not affect future routing; skips are not punished and do not strengthen MANUAL.
4. Light acceptance review — not full PR review; strict non-overridable review — in paid/MCP layer. A human verdict on after-code VERIFY without a seed is judged by **self-review of the same agent** (self-leniency); an independent cross-agent is Phase 2 only. Rules soften this via adjudication (see "Light acceptance" → "Verdict adjudication"), but do not remove correlated blind spots.
5. Verifying "did it myself vs another AI" is impossible in rules.
6. The `[ACUON]` restatement (see "Working language") is only supposed to fire once per phrased command; if the agent restates a command the user already tokenized, the hook drops that immediate duplicate (same event+mode, previous entry not itself an ack). Two phrased commands in a row still produce two events; a restatement several turns later can still double-count.

Phase 2 plans an MCP server with persistent skill engine — decay, deterministic routing, and event log.

---

## Command cheat sheet

Tokens are ASCII and identical in every language. You may also phrase a command in your own language — the agent then restates the canonical token so the step is still recorded (see "Working language").

| Command | When |
|---------|------|
| `[VERDICT] <what you found>` | VERIFY: verdict **before** reveal and integration |
| `[HYPOTHESIS] <text>` | DIAGNOSE: hypothesis before next nudge |
| `[DONE] [DIAGNOSE]: <name>` | Found the cause → review → profile |
| `[DONE] [MANUAL]: <name>` | Finished MANUAL → review → profile |
| `[DONE] [TUTORIAL]: <name>` | Finished TUTORIAL → review → profile |
| `[HINT] [DIAGNOSE]: <name>` | Need a nudge while debugging (not a solution) |
| `[HINT] [MANUAL]: <name>` | Need a navigational pointer (not a solution) |
| `[HINT] [TUTORIAL]: <name>` | Need a guiding question (not a solution) |
| `[SWITCH] [MANUAL]: <name>` | Too hard: MANUAL → TUTORIAL (≤1 switch) |
| `[SWITCH] [TUTORIAL]: <name>` | I'll manage: TUTORIAL → MANUAL (≤1 switch) |
| `[SKIP] [MANUAL]` / `[SKIP] [TUTORIAL]`: `<name>` | Agent does as DO, profile unchanged |
| `[CALIBRATE] <area id> = <N>` | Manual level override |
| `[DISPUTE] <name>` | Reconsider a `[NOT-ACCEPTED]` verdict |
| `[REPLAN]` | Allow the agent to re-decompose a ready plan (override adopt) |

**Legacy phrasing from 0.3.x remains a working alias** for each token: `Verified:`, `Hypothesis [DIAGNOSE]:`, `Diagnosis found [DIAGNOSE]:`, `Task [MANUAL|TUTORIAL] completed:`, `Hint [DIAGNOSE|TUTORIAL]:`, `Help with [MANUAL]:`, `Too hard [MANUAL]:`, `I'll manage [TUTORIAL]:`, `Skip [MANUAL|TUTORIAL]:`, `Calibrate: <area> — level <N>`, `Dispute review:`, `Replan`.

**Pilot telemetry records** only `[VERDICT]`, `[DONE]`, `[SKIP]`, `[SWITCH]`, `[DISPUTE]` plus the agent's own cards and blocks. `[HYPOTHESIS]`, `[HINT]`, `[CALIBRATE]`, `[REPLAN]` are protocol-only and produce no event.

---

## Subtask execution modes

```
high risk / security / data        → VERIFY   — agent did it → human checks before integration
bug / agent "going in circles"     → DIAGNOSE — agent coaches debugging, does not fix
level ≥ 4 / routine / infra        → DO       — agent executes alone
level 2–3 / "rusty"                → MANUAL   — developer does by hand
level 1 / novelty                  → TUTORIAL — agent coaches without solving
```

**Mode selection order** (when conditions conflict):

0. **`practice_mode`** — if `off` (default), only **DO and VERIFY** are available; DIAGNOSE, MANUAL, and TUTORIAL are **not issued**. Items 1, 3, 4 below apply only when `practice_mode: on`.
1. **DIAGNOSE** — active bug **or** ≥2 failed agent attempts to fix the same thing **or** user stuck in debugging.
2. **VERIFY** — agent **already produced** output (code, diff, proposal) **and** (medium+ risk **or** weak/medium verification sub-skill in primary area **or** security/architecture/data).
3. **TUTORIAL** — level 1 **and** (area fundamentally new **or** not calibrated above 1).
4. **MANUAL** — level 2–3; **or** level 1 after calibration ≥ 2 in this area.
5. **DO** — level ≥ 4, routine, boilerplate, infra (CI/CD, deploy, migrations), trivial edits.

`skip_areas` — **never** MANUAL/TUTORIAL for these areas (always DO). VERIFY/DIAGNOSE are **not** cancelled by `skip_areas` — they are about trust in output, not implementation training.

---

## Seed safety invariant (mandatory)

1. **Seed only in review artifact** — pre-code proposal, chat fragment, VERIFY card (**before-code** review). Never in project files, commits, applied diff, plan file.
2. **Project gets only clean version.** After reveal with seed the agent rewrites implementation without defect; seeded fragment **does not** remain on disk.
3. **After-code review — no seed.** Questions on real diff on disk; cannot plant defect post-factum.
4. When in doubt — abstain: "no safe seed found" → ordinary VERIFY (after code) or DO with explicit risk.
5. **Stealth until `[REVEAL]`.** Until the user replies with `[VERDICT]`, the card, proposal, and task text **must not** mention, label, or hint that a seed exists or where it might be. Forbidden in user-facing text before reveal: the words `seed` / `посев` / `Seed-кандидат`; meta such as "you might mistakenly simplify this", "a typical mistake here", "pay special attention to item N"; any internal planting plan. The defect (if any) lives **only** as ordinary proposal content — no labels. Seed-location planning stays out of the card. First allowed mention of planting is the `[REVEAL]` block after the verdict.

Violating the invariant = failure of trust in the layer; agent **must** refuse to apply challenge patch.

---

## VERIFY protocol (before code + after code)

VERIFY — agent completed subtask; human **checks before acceptance** (merge, commit, "accepted").

Two variants (not mutually exclusive on critical tasks):

| Variant | When | What is reviewed | Seed |
|---------|------|------------------|------|
| **before code** | before or instead of first implementation; rarely, **without announcing** | design: approach, requirements, proposal fragment | yes, only in chat/proposal |
| **after code** | after implementation; **default** on risky tasks | real diff in repository | no |

**Before-code review (sins of omission):** wrong frame, missed requirement, uncovered edge case, false confidence in tests. Not positioned as AI-reviewer control — trains the **human** to catch omissions before code.

**After-code review (sins of presence):** targeted questions on real diff without "look for a trap" hint.

**Composition:** on risky task default after code; occasionally and unpredictably before code (reduces priming); on most critical — **before code + after code** stacked.

**Sequencing (human always before agent).** On a VERIFY step the primary reviewer is the **human**. Any agent review of the same result (verdict adjudication, hidden reference review, `review_floor`) runs **only after** `[VERDICT]` — never before and never instead. Otherwise VERIFY measures "human + AI", not the human, and false confidence rises ("AI already checked").

**Map/artifact review — spot-check + falsification (not "re-prove everything").** Ideally such artifacts (audit note, design note, plan, inventory) go through V4 **before** the file is written (see "Design review when authoring a plan"). But if the map is already on disk (after-code, seed impossible) or the artifact is large — a holistic "re-check the whole artifact" is expensive and demotivating (the rational answer "all correct" dominates). Then:

1. **Spot-check the load-bearing slice.** Put only the **most load-bearing claims** into VERIFY (ones that break the product/security if wrong), not the whole artifact; the rest is DO. Quota (1–2 per ~10 subtasks) goes to those.
2. **Falsification instead of re-derivation.** The agent **commits** to checkable assertions; the human looks for **one counterexample** — cheap and motivating for the human (hunt for a hole), cheap to grade (the counterexample is bounded and adjudicable).

```
## [VERIFY] <Name> — claim check
**Variant:** after code (artifact on disk)
**Verification sub-skill:** verify-diff / verify-arch-risk
**Subtask risk:** <low | medium | high>

### The agent asserts — find at least one counterexample
- C1: <complete list of X — there are no others>
- C2: <sole hook / path is Y>
- C3: <invariant Z holds>

> After review: `[VERDICT] <which claim is wrong + how>` (or "they hold; I checked C1/C3 this way")
```

A reasoned "claims hold; I checked C1/C3 this way" → credit; a bare "they all hold" with no substance → clarifying question (see "Light acceptance" → "Verdict adjudication").

**Before-code flow with seed:**

1. Agent issues proposal/fragment (sometimes with intentional defect).
2. Human: `[VERDICT] <verdict + what you found>` **before** reveal.
3. `[REVEAL]`: was there seed, what caught/missed, profile update (verification sub-skill).
4. Agent writes **clean** implementation to project.

**After-code flow:** show real diff → Acuon questions → `[VERDICT] …` → acceptance or revision.

Some VERIFY cards **without seed** (seed share governed by `seed_frequency`; probability not disclosed) — trains vigilance at base rate "most are clean."

---

## DIAGNOSE protocol

DIAGNOSE — agent **refuses to fix** and leads through debugging (coaching, not solution).

> Active only when `practice_mode: on`. When `off`, the agent fixes the bug itself; if it gets stuck it switches to **VERIFY** (shows the result and asks you to check) rather than making you debug.

- Symptom, entry point, guiding question — **no** ready fix.
- Next step only after `[HYPOTHESIS] …`.
- Hints: `[HINT] [DIAGNOSE]` — narrow search area, not a patch.
- Completion: `[DONE] [DIAGNOSE]: <name>` → light review → profile (area `debugging` or a verification sub-skill).

Unlike TUTORIAL: DIAGNOSE — **concrete bug in project**; TUTORIAL — skill acquisition on practice subtask.

---

## When to apply protocol (trigger)

**Multi-step task** — if **≥ 3 subtasks** expected **or** **≥ 3 files** touched (or user explicitly asks for plan / decomposition).

On multi-step task **mandatory**:

1. Read `SKILL_PROFILE.md`.
2. Determine the plan source: **adopt** (a ready plan exists) or the agent **authors** the plan (`decompose` / explicit "make a plan") — in the latter case a before-code gate is possible, see "Design review when authoring a plan".
3. Classify each subtask (mode + primary area).
4. Mark up the plan: tag **non-DO** steps (DO is not tagged). On adopt from a file — append markup into the file (see "Plan markup in the file").

Single-step requests (one file, one edit) — execute as ordinary DO without plan.

Typical multi-step requests: "fix bug", "add feature", "make a plan", "refactoring", "add tests."

---

## Adopt an existing plan instead of decomposing

The `plan_source` setting (in `SKILL_PROFILE.md`, default `adopt`) decides who owns the plan structure:

- **`adopt` (default)** — if a ready plan already exists, the agent takes it **as is** and only tags the modes.
- **`decompose`** — the agent decomposes the task itself (previous behavior).

**A ready plan is considered present if** any of:
- the user references a plan file (`@docs/plans/slice.md`);
- asks to "execute the plan", "implement the slice per …", "by the steps in …";
- the context contains a markdown plan with an explicit list of steps (numbered list or `- [ ]` checklist).

**Adopt rules:**

1. Steps are taken **1:1** from the plan — no merging, splitting, or reordering.
2. Mode classification is **overlaid** on the existing items; no new steps are added.
3. **Do not replan** without the explicit `[REPLAN]` command. If a step is unexecutable or ambiguous — **ask a question**, do not rewrite the plan.
4. Quota, `focus_areas`, `skip_areas` apply to **choosing candidates among existing steps**. On quota conflict — **reduce** the number of VERIFY (keep them on the riskiest steps), do not inflate or cut the plan.
5. If no ready plan exists — proceed by `decompose`.

The unit of work is a **plan item**, not the whole PRD/section.

---

## Design review when authoring a plan (before-code gate)

When the agent **authors the plan** (explicit "make a plan [and write it to a file]" or `decompose`), the plan itself is a **before-code artifact**. This is the main moment for **before-code** VERIFY: the design is checked before any code is written (unlike `adopt`, where the plan is already fixed and there is no place for a seed).

The same applies to any **before-code map artifacts** (audit note, design note, behavior map): their place is **before-code** VERIFY (`verify-design`) before the file is written, not after-code verify-diff on an already written document. Once the document is on disk a seed is impossible, and holistic re-review is expensive and lacks ground truth; surface **falsifiable claims** (find one counterexample), not "re-prove the whole artifact".

**The gate fires** when all hold:
- the agent authors the plan (not `adopt` of a ready file);
- the task carries **design risk** (architecture / data / security / non-trivial approach);
- quota and `seed_frequency` allow — the gate is **rare and unpredictable**, not on every plan.

**Gate flow (with seed):**

1. The agent shows the plan's **key design decisions** as a proposal **in chat**; it does **not** write the plan file yet. Sometimes one seed is embedded (wrong frame, missed requirement, uncovered edge case).
2. Human: `[VERDICT] <verdict + what you found>` **before** reveal.
3. `[REVEAL]`: was there a seed, what was caught/missed → profile update (sub-skill "design and requirements (before code)").
4. Only then the agent writes the **clean** plan to the file; with `plan_markup: on` it appends `[Acuon: …]` tags into the approved plan.

**Invariant:** the seed lives only in the chat proposal and **does not land in the plan file** (see seed safety invariant).

**Visibility floor:** on a **design-risky** task with an agent-authored plan — **at least one** before-code design review, even without a seed (with `seed_frequency: off` — a seed-free review). A large task must not pass with no Acuon presence at all.

**Small tasks / in-head plan:** if the agent plans implicitly (no request for a plan file) — the gate is **not** forced; on a risky "how" — a situational step-level before-code review (see "When executing plan"), otherwise ordinary DO + after-code review. This keeps friction on a fast flow low.

---

## Profile settings (quota and priorities)

| Setting | Behavior |
|---------|----------|
| `language: auto` (default) | Working language for all human-facing text; `auto` — detect from the user's messages |
| `practice_mode: off` (default) | "Review-only": the agent issues only DO and VERIFY; MANUAL/TUTORIAL/DIAGNOSE are off |
| `practice_mode: on` | Enables hands-on modes (MANUAL/TUTORIAL/DIAGNOSE); the settings below apply only in this mode |
| `training_intensity: light` | Target: ≤ 1 non-DO per 15 subtasks |
| `training_intensity: normal` | Target: 1–2 non-DO per 10 subtasks |
| `training_intensity: intense` | Target: 3–4 non-DO per 10 subtasks |
| `focus_areas` | When picking candidates — **prioritize** these areas (by ID) |
| `skip_areas` | **Never** non-DO for these areas (by ID) |
| `plan_source: adopt` (default) | A ready plan is taken as is; the agent does not replan without `[REPLAN]` |
| `plan_markup: on` (default) | On adopt, non-DO markup is appended into the plan file (visible as a diff) |
| `seed_frequency: normal` (default) | Share of before-code VERIFY carrying a seed: `off` / `light` / `normal` / `high` |
| `review_floor: on` (default) | Quiet strict agent self-review on `[SKIP]` and at stage boundaries (one-line summary); on a load-bearing gating artifact not substantively checked by the human — one bounded spot-check of the riskiest claim (see "Review-floor on a gating artifact"); **never** replaces or precedes human VERIFY (see "Sequencing") |

**Quota — soft recommendation** with upper cap: do not assign non-DO above target ratio without explicit user consent.

**Small sessions** (< 10 subtasks in plan): assign **0–1** non-DO if suitable candidate exists; do not inflate plan for quota.

**All candidates in `skip_areas`:** non-DO = 0; state in one line ("all subtasks in skip_areas — DO only").

---

## Subtask → skill area mapping

- Pick **one primary** area — where most cognitive load for developer.
- **Identify areas by the `ID` column**, never by display name: the ID is language-neutral and stable, the name may be localized. `focus_areas`, `skip_areas`, and `[CALIBRATE]` all take IDs.
- For **[VERIFY]** prefer `verify-*` rows from profile (authz, idempotency, diff, design, etc.).
- For **[DIAGNOSE]** primary often `debugging` or a narrow verification sub-skill by symptom.
- Multi-label **not** used; profile updates by primary.
- If area doesn't fit — suggest adding a row (ID + name) to profile or map to nearest.
- In card: area **name in the user's language** followed by its ID in parentheses + **Rationale:** one line why this area.
- **Profile from 0.3.x with no `ID` column:** match by display name, and offer to add IDs on the next update.
- **Mixed profile** (an `ID` column was added but `focus_areas` / `skip_areas` / a `[CALIBRATE]` argument still carry display names): resolve the value as an ID first, then as a display name — never silently ignore it. Offer to rewrite those values as IDs.

---

## When decomposing a task

### Step 1 — Read profile

Read `SKILL_PROFILE.md`. Check `_version` — if changed since session start, re-read.
If file missing — create from template below and run **onboarding calibration**.

### Step 2 — Classify subtasks

Apply mode selection order, `skip_areas`, `focus_areas`, and quota.

**VERIFY** — additionally:
- State variant: before code (proposal) or after code (diff)
- Primary verification sub-skill + subtask risk
- On trivial edits (rename, config) — abstain or after-code only without seed
- **Design/audit artifacts** (audit, map, plan, design note) — before-code: classify as **before-code VERIFY** (`verify-design`) before writing the file, not as after-code verify-diff; put falsifiable claims in the card, not "re-prove the whole artifact"

**DIAGNOSE** — additionally:
- Symptom reproducible; agent already tried fixing ≥1 time **or** user in debugging
- Estimated time: up to 60 minutes

**MANUAL** — additionally:
- Estimated time: 15–90 minutes
- Subtask self-contained
- Not critical path with hard deadline

**TUTORIAL** — additionally:
- Estimated time: up to 60 minutes
- Reactively: user stuck mid-task → can switch MANUAL → TUTORIAL via `[SWITCH] [MANUAL]`

### Step 3 — Format plan

Each VERIFY task:

```
## [VERIFY] <Title>
**Variant:** before code (proposal) | after code (diff)
**Verification sub-skill:** <primary>
**Subtask risk:** low | medium | high
**Current level:** <N>/5

### Context
<What agent did / proposes. For after code — link to diff.>

### Task
<Find problems before acceptance. No seed/planting meta and no hints about a planted defect — see invariant item 5.>

> After review: `[VERDICT] <verdict + what you found>`
```

Before `[REVEAL]`, seed meta-labels in the card or proposal are **forbidden** (invariant item 5). After `[VERDICT]` — if seed, mandatory `[REVEAL]` block; then only clean version to project.

Each DIAGNOSE task:

```
## [DIAGNOSE] <Title>
**Skill area:** <primary, e.g. Debugging (debugging)>
**Symptom:** <what breaks>
**Entry point:** <file / module>

### Nudge
<One question or search boundary — no fix.>

> Hypothesis: `[HYPOTHESIS] <text>`
> Hint: `[HINT] [DIAGNOSE]: <name>`
> Found cause: `[DONE] [DIAGNOSE]: <name>`
```

Each MANUAL task:

```
## [MANUAL] <Title>
**Skill area:** <primary, e.g. Name (id)>
**Rationale:** <one line>
**Current level:** <N>/5
**Time estimate:** ~<X> min

### Context
<What to do and why. No ready solution.>

### Entry point
<File / module / function — pointer only.>

### Completion criteria
- [ ] <Verifiable outcome>

> Help: `[HINT] [MANUAL]: <name>`
> Too hard: `[SWITCH] [MANUAL]: <name>`
> Skip: `[SKIP] [MANUAL]: <name>`
> After work: `[DONE] [MANUAL]: <name>` — agent runs review
```

Each TUTORIAL task:

```
## [TUTORIAL] <Title>
**Skill area:** <primary, e.g. Name (id)>
**Rationale:** <one line>
**Current level:** <N>/5
**Time estimate:** ~<X> min

### What to do
<Description — no implementation hints.>

### Guiding question
<One question to start thinking.>

### Completion criteria
- [ ] <Verifiable outcome>

> Hint: `[HINT] [TUTORIAL]: <name>`
> I'll manage: `[SWITCH] [TUTORIAL]: <name>`
> Skip: `[SKIP] [TUTORIAL]: <name>`
> After work: `[DONE] [TUTORIAL]: <name>` — agent runs review
```

---

## Plan markup in the file

If the plan lives **in a file** and `plan_markup: on` (default) — on adopt the agent **appends markup directly into that file** so the developer sees it as a diff.

**Markup rules:**

1. Only **non-DO** steps are tagged (VERIFY / MANUAL / TUTORIAL / DIAGNOSE). **DO is not tagged** — no tag = DO.
2. The tag is an inline code span at the end of the step line. Format `[Acuon: <MODE> · <details>]`:

```
- [ ] Generate and verify reset token `[Acuon: VERIFY · after code · verify-authz · risk high]`
- [ ] Agree on token comparison approach `[Acuon: VERIFY · before code · verify-design · risk high]`
- [ ] Rate-limit on POST /reset `[Acuon: MANUAL · error-handling · ~30m]`
- [ ] "Session drops after reset" `[Acuon: DIAGNOSE · debugging · if needed]`
```

3. **seed is never written to the file** — the tag is only routing; the VERIFY card and seed flow stay in chat at execution time (see seed safety invariant).
4. On re-run — **update** existing `[Acuon: …]` tags in place, do not duplicate.
5. After markup — one summary line in chat, e.g.: "Markup added to plan: 12 steps, 2× VERIFY (after code), 0 MANUAL; DO not tagged."

If the plan is only **in a message** (no file) — show markup in chat; do not create a file without a request. With `plan_markup: off` — markup is always chat-only.

Markup in the file = mode index and scope. Full cards (VERIFY / MANUAL / DIAGNOSE) are still output **in chat** at the execution step.

---

## When executing plan

On **MANUAL**, **TUTORIAL**, or **DIAGNOSE** — **stop. Do not execute for user.** Output card fully and wait.

On **VERIFY (before code)** — do not write to project until `[VERDICT]` and reveal; proposal only in chat.

On **VERIFY (after code)** — diff already exists; wait for `[VERDICT]` before counting acceptance.

**Step-level before code (situational):** if a risky step leaves the **"how"** open (approach not fixed by the plan) — the agent may, **before** writing code, propose the approach (sometimes with a seed per `seed_frequency`), wait for `[VERDICT]` and reveal, then implement. Rare and unpredictable, not on every step.

**Never execute MANUAL/TUTORIAL without explicit `[SKIP]` or plan completion with skip.**
**Never commit / merge code with seeded seed.**

---

## Help protocol

| | MANUAL | TUTORIAL |
|---|--------|----------|
| Goal | Skill maintenance | Understanding acquisition |
| Command | `[HINT] [MANUAL]` | `[HINT] [TUTORIAL]` |
| Give | One **navigational pointer** (file, function, doc, symptom) | One **guiding question** or conceptual frame |
| Forbidden | Code, pseudocode, algorithm, step-by-step plan, Socratic questions | Ready solution, diff, code fragments |
| TUTORIAL escalation | — | 2nd request: narrower question → 3rd: micro-step "what to do first" without code |

Examples:

| Situation | MANUAL | TUTORIAL |
|-----------|--------|----------|
| SQL | "`orders` table, schema in `migrations/003.sql`" | "What entities remain after date filter?" |
| Test | "Analog — `user.test.ts:45`" | "Which scenario breaks without validation?" |

**Help hierarchy:**

```
Within mode:    [HINT]                   — pointer or question, never a solution
Mode switch:    [SWITCH]                 (≤1 per task)
Exit:           [SKIP]                   → DO, profile unchanged
Completion:     [DONE] + [ACCEPTED]      → profile
```

Mode switch **does not** change `executions` or level until `completed` in final mode.

---

## Light acceptance (review)

After `[DONE] [MODE]:` or a successful `[VERDICT]` (after reveal if seed) — **mandatory** review before crediting:

1. Check against card **completion criteria**.
2. Quick **sanity scan** of diff (if code exists) — obvious criteria gaps.
3. Verdict token: `[ACCEPTED]` or `[NOT-ACCEPTED]` — **mandatory and never translated**. A `## [REVIEW]` card without one is malformed: outside English and Russian the verdict then becomes unreadable to telemetry. These tokens are **only about the agent's work/design**, never about the human.

**Human summary (mandatory, first).** The review reply opens with **two dry sentences in the user's language** — before `[REVEAL]`, before `## [REVIEW]`, before `[CREDIT]`. No tokens, no skill IDs, no `1→2` arrows, no `+1`. Tone is a statement, not a pep talk.

Line 1 — review status (VERIFY), one of three:

| Status | When |
|--------|------|
| **Review successful.** | The verdict is useful: a confirmed catch or substantiated cleanliness |
| **Review unsuccessful.** | The verdict missed: accepted work/design that still has a hole |
| **Review not credited.** | The verdict has no substance (bare "all clean", abstain) — no point given |

Then in the same line — one sentence of fact (what they found / missed / why no credit). If the agent's work is not accepted — say so in words ("the design needs revision"), not with a token.

Line 2 — the skill by **display name**, the practice count in words, and the level. Do not name `executions` to the human; for VERIFY this is **successful reviews**, for MANUAL / TUTORIAL / DIAGNOSE — **successful completions**. Write the new total after credit ("now N") so growth is visible:

- credited: `Skill "…": successful reviews now N. Level: L of 5.`
- no credit: `Level: L of 5.` (no "now" — nothing grew)
- **Forbidden:** saying the **level** rose when the band did not change. Do not write a "until the next level" counter. `1→2` arrows and the word `executions` belong only in `[CREDIT]`.

Example (catch, design needs revision, executions 1→2, band unchanged):

```
**Review successful.** Found a hole in the design: trial without a subscription must follow the same flow. The design needs revision; the plan is corrected.
Skill "design review before code": successful reviews now 2. Level: 1 of 5.
```

Then — machine blocks (`[REVEAL]` on a seed flow, `## [REVIEW]`, `[CREDIT]` when credited). The human is not required to read them.

MANUAL / TUTORIAL / DIAGNOSE: the same order (two sentences first: was the work accepted; "successful completions now N" and the level), then the `[REVIEW]` card.

**`[ACCEPTED]`** — format mirrors `[NOT-ACCEPTED]`, just shorter (comes **after** the human summary):

```
## [REVIEW] [ACCEPTED]: <name>
**Mode:** MANUAL | TUTORIAL | DIAGNOSE | VERIFY

<Brief summary, 1–2 points.>
```

→ update profile → continue plan.

**Review-skill credit — separate from acceptance:** a confirmed catch (a real problem/anomaly found in the agent's work) grants `+1` to the sub-skill even on a `[NOT-ACCEPTED]` verdict. The human summary names both outcomes explicitly. Details — "Updating SKILL_PROFILE.md".

**Verdict adjudication (after-code VERIFY without seed).** Ground truth is unknown, so the human's verdict is judged by self-review of the same agent — the honest rules ceiling (independent cross-agent is Phase 2). Rules that reduce self-leniency:

1. **Fresh pass, not defending your prior output.** Re-check a concrete finding against the files, explicitly not treating your earlier result as correct.
2. **Presumption in favor of the human's finding.** The burden of rebuttal is on the agent: if you cannot rebut by re-derivation → **confirmed catch** (`+1`).
3. **Soft rule for "all clean".** A bare verdict with no substance ("ok", "no problems") — **do not** reject and **do not** credit immediately: ask **one neutral** question "what exactly did you check to claim that?" (no pointing at a location — stealth invariant item 5). If they substantiate → `+1`; if they decline / cannot → **abstain** (0), neutrally, **not** `[NOT-ACCEPTED]` against the human and **not** a work block. Dispute — `[DISPUTE]`.

**Ceiling (honest):** strict adjudication reduces motivated bias, but not correlated blind spots (same model weights) — only a seed or an independent checker (Phase 2) removes those.

**Review-floor on a gating artifact (spot-check).** When the artifact is **load-bearing and gates** the next stage (audit / map / design note), the human did **not** substantively check it (abstain or bare "all clean") and risk ≥ medium — `review_floor` escalates from a one-line log to **one** bounded spot-check of the **riskiest** claim (an attempt to find a counterexample), with an explicit ceiling "not the whole artifact".

- The result feeds the **DoD axis** (safe to build on?), **not** skill: it produces no positive credit to the human and does not replace the primary reviewer (sequencing intact — only after `[VERDICT]` / abstain).
- Counterexample found → **false confidence**: unearned credit is not granted / is retracted, a diagnostic shock is shown, DoD is flagged "claim broken".
- No counterexample → "the riskiest claim holds (bounded); the other claims are the human's responsibility", the stage can proceed deliberately.
- **Ceiling:** same model weights → catches gross errors, not subtle ones; a floor, not a guarantee. Full establishment of truth for after-code without seed is Phase-2 cross-agent reference review.

**`[NOT-ACCEPTED]`** — format (marker and mode value in ASCII; headings and prose in the user's language). Comes **after** the human summary. The token is about the agent's work, not the human's review:

```
## [REVIEW] [NOT-ACCEPTED]: <name>
**Mode:** MANUAL | TUTORIAL | DIAGNOSE | VERIFY

### What didn't match criteria
- …

### Notes (if applicable)
- …

### What to do
- [ ] …

> Fix and again: `[DONE] [MODE]: <name>`
```

Review **diagnoses, does not fix**. Do not rewrite user's code.

**Dispute:** `[DISPUTE] <name>` + rationale → reconsider verdict.

After reject: revise first or `[SWITCH]`; **do not** offer `[SKIP]` by default.
After **2** rejects on one task — explicitly offer `[SWITCH]` or `[HINT]`.

TUTORIAL: if concept clean — 1–2 understanding questions; if code — same sanity scan.

---

## Skip protocol

`[SKIP] [MANUAL|TUTORIAL]: <name>`:

1. Confirm in one line: task → DO, profile **unchanged**.
2. Execute subtask as DO (card criteria — guide).
3. Brief summary → continue plan.
4. When `review_floor: on` — quiet strict self-review of the result, one-line summary (coverage floor; profile **unchanged**). If the skipped step is a load-bearing gating artifact: one bounded spot-check of the riskiest claim (see "Review-floor on a gating artifact").

| Layer | On skip |
|-------|---------|
| Project | Task done by agent |
| Profile | `executions`, level, `last_practiced` **unchanged** |

---

## Onboarding and calibration

**On first run** (new `SKILL_PROFILE.md`):

1. Show **level legend** from profile.
2. Conversational calibration: per area — "new / basic / confident / proficient" → level 1–4.
3. Conversational calibration cap: **level 3** without real task confirmation (level 4–5 — only after `[DONE]`).
4. Confirm the **working language** and record it in `language`; localize the area names in the profile if the user prefers, keeping the `ID` column as is.
5. Clarify `training_intensity`, `focus_areas`, `skip_areas` (by area ID).

**Override command:** `[CALIBRATE] <area id> = <N>` (N = 1–5).

When calibrating **seed `executions`** for level (so recalculation doesn't reset calibration):

| Level | Seed `executions` |
|-------|-------------------|
| 1 | 0 |
| 2 | 3 |
| 3 | 6 |
| 4 | 11 |
| 5 | 21 |

Update level, `last_practiced` (today), `_version`.

Profile refinement by real tasks — **passively**, within normal quota (no "calibration spikes").

---

## Updating SKILL_PROFILE.md

Work acceptance (DoD) and review-skill credit are **two independent outcomes**. Review is "check and tell the truth", not "confirm everything is perfect": a problem found in the executor's work is a **reviewer success**, even if the work cannot be accepted yet.

**Credit `+1` to primary area:**

| Outcome | Acceptance (DoD) | Skill |
|---------|------------------|-------|
| `[DONE]` / successful `[VERDICT]` → review `[ACCEPTED]` | accepted | +1 |
| VERIFY: a real problem/anomaly found in the agent's work (**confirmed** catch) | `[NOT-ACCEPTED]` (DoD open) | +1 |
| VERIFY with seed: catch caught (after reveal) | — | +1 |
| "OK" without checking / verdict off criteria | `[NOT-ACCEPTED]` / abstain | 0 |
| Bare "all clean" (after-code without seed) → clarifying question → **substantiated** | accepted | +1 |
| Bare "all clean" → clarifying question → **not substantiated** | abstain (like `[SKIP]`) | 0 |
| False accept with obvious holes (visible on sanity scan) | `[NOT-ACCEPTED]` | 0 |
| `[SKIP]`, mode switch | — | 0 |

**Confirmed catch** = the found problem is real (leads to a fix/revision or confirmed by reveal with seed). A false alarm or a misunderstanding of expected behavior — **no** credit. Dispute — `[DISPUTE]`.

**Bare "all clean" (after-code VERIFY without seed)** — do not credit and do not reject immediately — one neutral clarifying question (see "Light acceptance" → "Verdict adjudication"): substantiation → `+1`; decline → abstain (0), like `[SKIP]`, without `[NOT-ACCEPTED]`.

**Review-floor spot-check** (load-bearing gating artifact, human did not substantively check): a counterexample found = **false confidence** → unearned credit is not granted / is retracted, a diagnostic shock is shown; the result feeds the **DoD axis**, not skill.

**On `+1` credit:**

1. Increment `executions` for primary area by 1.
2. Recalculate level **only from `executions`**: 0–2 → 1; 3–5 → 2; 6–10 → 3; 11–20 → 4; 21+ → 5.
3. Update `last_practiced` (YYYY-MM-DD) and `_version` (ISO 8601).
4. If level = 4 — comment `# proficient` in table row.
5. Output a `[CREDIT]` block with `**Mode:**` (mode credited) — for hook telemetry. Numbers and the skill ID belong **only here**, not in the human summary:

```
[CREDIT]
**Mode:** VERIFY
verify-design +1 · executions 1→2 · level 1
```

When credit is zero, **do not** write `[CREDIT]` (the hook would otherwise log a false `credit`). "Not credited" / "unsuccessful" live only in the human summary.

DoD stays open on `[NOT-ACCEPTED]` regardless of the skill credit.

---

## Pilot telemetry (fallback without hooks)

If hooks **not** installed — after VERIFY / DIAGNOSE / non-DO events append line to `.acuon/agent-events.jsonl`:

```json
{"ts":"<ISO>","mode":"VERIFY|DIAGNOSE|MANUAL|TUTORIAL","event":"issued|done|skip|switch|verdict|reveal|reject|dispute|credit"}
```

`credit` — on skill credit output a `[CREDIT]` block (see "Updating SKILL_PROFILE.md"); the hook logs to `acuon-events.jsonl`, fallback duplicates when hooks are absent.

**No** levels, code, file names, task text. Hooks — reliable source; this log — fallback.

Hook install: see `templates/pilot-telemetry/QUICKSTART-telemetry.md` in the Acuon repo (https://github.com/acuonhq/acuon).

---

## SKILL_PROFILE.md template

Create at repository root if missing:

```markdown
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
```
