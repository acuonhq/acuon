# Quick-start — Acuon rules-MVP 0.4.6

Pilot bundle: trust-calibration rule + profile with verification sub-skills + optional telemetry.

Acuon **trains and tests your ability to judge whether AI code can be accepted**: DO / **VERIFY** / **DIAGNOSE** / MANUAL / TUTORIAL modes. VERIFY comes in two forms: before-code review (design; seed only in chat) and after-code review (on the real diff; no seed).

> **Working in another language?** Use this pack as is — there is no localized version to hunt for. Acuon answers in whatever language you write in, and commands are ASCII tokens (`[VERDICT]`, `[DONE]`, `[SKIP]`) that are identical everywhere. To read the docs in your language, ask your agent: *"explain Acuon and its commands in <your language>"* — the rule is in your repository, so it can.

**What you are doing:** this GitHub repo is a **file pack**, not your app. You copy a rule + a skill profile into the project where you write code. After that, Cursor / Claude Code reads them automatically.

> **Pilot participant?** Install everything (rule + profile + local telemetry) in one step with the ready tree — see **[../install/PILOT.md](../install/PILOT.md)**. The steps below are the plain install (no telemetry).

---

## 0. Get this pack

Clone (or **Code → Download ZIP** on GitHub and unzip):

```bash
git clone https://github.com/acuonhq/acuon.git
```

Remember the folder — below it is `/path/to/acuon` (Windows: `C:\path\to\acuon`).

Do **not** treat that clone as your product repo unless you really work there.

---

## 1. Copy the rule and profile into **your** project

Open a terminal in the **root of the project you code in** (the folder that already has your source, or an empty folder you will open in Cursor).

### Cursor — macOS / Linux / Git Bash

```bash
mkdir -p .cursor/rules
cp /path/to/acuon/templates/acuon-cursor.mdc .cursor/rules/acuon-cursor.mdc
cp /path/to/acuon/templates/SKILL_PROFILE.md SKILL_PROFILE.md
```

### Cursor — PowerShell (Windows)

```powershell
New-Item -ItemType Directory -Force -Path .cursor\rules | Out-Null
Copy-Item C:\path\to\acuon\templates\acuon-cursor.mdc .cursor\rules\acuon-cursor.mdc
Copy-Item C:\path\to\acuon\templates\SKILL_PROFILE.md SKILL_PROFILE.md
```

You should now have:

- `.cursor/rules/acuon-cursor.mdc`
- `SKILL_PROFILE.md` at the project root

### Claude Code

```bash
cp /path/to/acuon/templates/SKILL_PROFILE.md SKILL_PROFILE.md
```

Then:

- If your project has **no** `CLAUDE.md` yet — copy `templates/acuon-claude.md` to `CLAUDE.md` at the project root.
- If `CLAUDE.md` already exists — open `templates/acuon-claude.md` and **append** its contents to your `CLAUDE.md` (do not delete your existing instructions).

### After copying

1. Reload Cursor: `Ctrl+Shift+P` (`Cmd+Shift+P` on macOS) → type `Reload Window` → Enter. Or quit and reopen the project. (Claude Code: start a new session.)
2. In Cursor, rules are under **Customize**, not Settings: sidebar (or Command Palette → `Open Customize`) → **Rules**. The project rule `acuon-cursor` should be listed and on.
3. You do **not** need telemetry for Acuon to work (see §4). If you did install the hook: same **Customize** panel → **Hooks** — you should see `node .cursor/hooks/acuon-telemetry.mjs` with no error.

---

## 2. Onboarding

1. Open **your** project (the one you copied files into) in Cursor / Claude Code.
2. Ask the agent for a multi-step task (e.g. "add feature X").
3. If `SKILL_PROFILE.md` is new — the agent runs **conversational calibration** (level legend + areas, including `verify-*`) and confirms your working language.
4. Optionally set `focus_areas`, `skip_areas`, `training_intensity` in the profile (areas are given by ID).

Manual calibration: `[CALIBRATE] verify-diff = 3`

---

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

---

## 4. Pilot telemetry (optional)

Acuon **works without this**. Two separate things:

| | Default | What you do |
|---|---------|-------------|
| **Local log** | Off — files are not copied | Copy the hook files below. After that, events are written only to `.acuon/acuon-events.jsonl` on your disk. Nothing is sent over the network. |
| **Send to a server** | Off (`optInRemote: false`) | Only if a pilot organizer gives you a `remoteUrl`. Then edit `.acuon/config.json` (created on the first event). There is **no** public backend in this release; leave this off unless you were given a URL. |

> **Pilot participants:** instead of the commands below, copy the whole pilot tree in one step (rule + profile + hook) — see **[../install/PILOT.md](../install/PILOT.md)**.

To turn on the **local** log (Cursor). Needs **Node.js** 18+.

macOS / Linux / Git Bash:

```bash
mkdir -p .cursor/hooks
cp /path/to/acuon/templates/pilot-telemetry/acuon-telemetry.mjs .cursor/hooks/
cp /path/to/acuon/templates/pilot-telemetry/hooks.json .cursor/hooks.json
echo ".acuon/" >> .gitignore
```

PowerShell:

```powershell
New-Item -ItemType Directory -Force -Path .cursor\hooks | Out-Null
Copy-Item C:\path\to\acuon\templates\pilot-telemetry\acuon-telemetry.mjs .cursor\hooks\
Copy-Item C:\path\to\acuon\templates\pilot-telemetry\hooks.json .cursor\hooks.json
Add-Content .gitignore ".acuon/"
```

Reload Cursor (`Ctrl+Shift+P` → `Reload Window`), then check **Customize → Hooks**. Details: [pilot-telemetry/QUICKSTART-telemetry.md](./pilot-telemetry/QUICKSTART-telemetry.md).

---

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
