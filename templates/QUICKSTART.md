# Quick-start — Acuon rules-MVP 0.4.6

Pilot bundle: trust-calibration rule + profile with verification sub-skills + optional telemetry.

Acuon **trains and tests your ability to judge whether AI code can be accepted**: DO / **VERIFY** / **DIAGNOSE** / MANUAL / TUTORIAL modes. VERIFY comes in two forms: before-code review (design; seed only in chat) and after-code review (on the real diff; no seed).

> **Working in another language?** Use this pack as is — there is no localized version to hunt for. Acuon answers in whatever language you write in, and commands are ASCII tokens (`[VERDICT]`, `[DONE]`, `[SKIP]`) that are identical everywhere. To read the docs in your language, ask your agent: *"explain Acuon and its commands in <your language>"* — the rule is in your repository, so it can.

## 1. Install rule and profile

### Cursor

```bash
mkdir -p .cursor/rules
cp templates/acuon-cursor.mdc .cursor/rules/acuon-cursor.mdc
cp templates/SKILL_PROFILE.md SKILL_PROFILE.md
```

### Claude Code

```bash
cp templates/SKILL_PROFILE.md SKILL_PROFILE.md
# Paste templates/acuon-claude.md into your project's CLAUDE.md
```

## 2. Onboarding

1. Open the project in Cursor / Claude Code.
2. Ask the agent for a multi-step task (e.g. "add feature X").
3. If `SKILL_PROFILE.md` is new — the agent runs **conversational calibration** (level legend + areas, including `verify-*`) and confirms your working language.
4. Set `focus_areas`, `skip_areas`, `training_intensity` in the profile (areas are given by ID).

Manual calibration: `[CALIBRATE] verify-diff = 3`

## 3. Modes (brief)

| Mode | You |
|------|-----|
| **DO** | Agent does it |
| **VERIFY** | Check output before acceptance (`[VERDICT] …`); before-code or after-code review (on diff) |
| **DIAGNOSE** | Lead debugging; agent does not fix (`[HYPOTHESIS] …`) |
| **MANUAL** | Do it by hand |
| **TUTORIAL** | Learn with coaching, no ready solution |

> By default the **"review-only"** mode is active (`practice_mode: off`): the agent issues only DO and VERIFY. To enable hands-on work, lessons, and debug coaching (MANUAL / TUTORIAL / DIAGNOSE) — set `practice_mode: on` in `SKILL_PROFILE.md`.

**Safety:** seed (before-code review) only in chat/proposal; only clean code lands in the project.

## 4. Pilot telemetry (opt-in)

For Phase 1 validation participants only:

```bash
mkdir -p .cursor/hooks
cp templates/pilot-telemetry/acuon-telemetry.mjs .cursor/hooks/
cp templates/pilot-telemetry/hooks.json .cursor/hooks.json
echo ".acuon/" >> .gitignore
```

Details: [pilot-telemetry/QUICKSTART-telemetry.md](./pilot-telemetry/QUICKSTART-telemetry.md)

## 5. Smoke test

- Request "add auth endpoint" with ≥3 steps → plan with `[VERIFY]` / `[DIAGNOSE]` / `[MANUAL]` / DO.
- "Make a plan and write it to a file" on a risky task → sometimes a before-code VERIFY on the design (`seed_frequency`): proposal in chat → `[VERDICT]` → reveal → **clean** plan into the file.
- A ready plan in a file → the agent takes the steps as is (`plan_source: adopt`) and appends non-DO markup directly into the file (visible as a diff); DO is not tagged.
- VERIFY card (before-code review) → proposal in chat, **not** on disk until `[VERDICT]`.
- DIAGNOSE card → agent **does not fix**, waits for hypothesis.
- `[VERDICT] …` → if seed, `[REVEAL]` block → clean implementation → profile update.
- Write to the agent in your own language → cards and reviews come back in it, while tokens and mode names stay ASCII.

## Commands (cheat sheet)

See the "Command cheat sheet" section in `acuon-cursor.mdc` / `acuon-claude.md`.

## Free-layer limitations

See "Limitations of this layer" in the rule — honest ceiling without promising paid Skill Engine / eval harness (Phase 3).

## Feedback

Questions or impressions: **[acuon.ai@gmail.com](mailto:acuon.ai@gmail.com)** or a [GitHub issue](https://github.com/acuonhq/acuon/issues/new?template=feedback.md).
