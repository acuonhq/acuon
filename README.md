# Acuon

**Trust-calibration layer for AI-assisted coding.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![rules-MVP](https://img.shields.io/badge/rules--MVP-0.4.6-blue.svg)](./CHANGELOG.md)

> _Acuō_ (Latin) — to sharpen, to hone a skill.

When AI both writes and reviews code, someone — the developer, an AI reviewer, or an autonomous loop — still has to decide whether it can be accepted. Acuon plugs into agent workflows (Cursor, Claude Code) and measures on real code whether **that trust is deserved**, keeping an accountable human able to judge AI output.

At its core, each subtask goes one of two ways:

- **DO** — trust is deserved: the agent does it (routine, high skill).
- **VERIFY** — trust is still in question: the human checks AI output before integration.

To keep the human able to judge the code, Acuon adds three supporting modes — **DIAGNOSE**, **MANUAL**, **TUTORIAL** (debug coaching and skill maintenance). They come up less often.

## How it works — in brief

On a risky subtask Acuon switches to **VERIFY**: the agent produces a result and you give a verdict **before** the code enters the project.

To make this a real check rather than a rubber stamp, every so often — **at the design stage, before any code is written** — Acuon deliberately plants a plausible defect into its own proposal. That is a **seed**. You give your verdict, then a reveal follows: whether there was a defect and whether you caught it. This is how, on a real task, you see whether **your decision to accept AI code can be trusted**.

A seed lives only in the chat/proposal and **never** reaches your project — only the clean version lands on disk. Full mechanics and the other modes — in [templates/HOWITWORKS.md](./templates/HOWITWORKS.md).

---

## Quick start

Acuon is **not** an app you run. You copy files from this repository into **the project you actually code in**. Full guide: [templates/QUICKSTART.md](./templates/QUICKSTART.md)

**Two ways to install:**

- **Just try Acuon** (no telemetry) — the steps below, or copy the ready tree `install/cursor/`.
- **Join the pilot** (adds a local telemetry log) — Cursor or Claude Code, ready trees: **[install/PILOT.md](./install/PILOT.md)**.

The steps below are the plain install.

1. Clone this pack (or download the ZIP from **Code → Download ZIP**):

```bash
git clone https://github.com/acuonhq/acuon.git
```

2. Open a terminal in **your** project (not inside the clone above).
3. Copy the rule and profile (`/path/to/acuon` = where you cloned this repo):

```bash
# Cursor — macOS / Linux / Git Bash
mkdir -p .cursor/rules
cp /path/to/acuon/templates/acuon-cursor.mdc .cursor/rules/acuon-cursor.mdc
cp /path/to/acuon/templates/SKILL_PROFILE.md SKILL_PROFILE.md
```

```powershell
# Cursor — PowerShell (Windows)
New-Item -ItemType Directory -Force -Path .cursor\rules | Out-Null
Copy-Item C:\path\to\acuon\templates\acuon-cursor.mdc .cursor\rules\acuon-cursor.mdc
Copy-Item C:\path\to\acuon\templates\SKILL_PROFILE.md SKILL_PROFILE.md
```

4. Restart Cursor (or reload the window). Confirm the rule is on: **Settings → Rules**.
5. Ask the agent for a multi-step task (e.g. “add feature X”). If the profile is new, it will calibrate levels and language.

Claude Code: copy `SKILL_PROFILE.md` the same way; put the contents of `templates/acuon-claude.md` into `CLAUDE.md` at your project root (create the file if it does not exist).

Telemetry is **optional** and off until you copy the hook files. Copying them only writes a **local** log; nothing is sent to a server unless you later turn that on. Details in the Quick-start.

---

## What this is (and is not)

Acuon is **not** “yet another AI reviewer.” AI review answers “is there a bug in this code?” Acuon calibrates **who accepts** AI code — human, AI reviewer, or autonomous loop: can their decision to accept it be trusted?

**This is rules-MVP** — protocol and skill profile in markdown:

- ✅ DO / VERIFY / DIAGNOSE / MANUAL / TUTORIAL modes as agent rules
- ✅ Fits your existing plan: a ready plan is adopted as-is, only non-DO steps get in-file markup — no replanning
- ✅ Works in your language: one English pack, the agent replies in whatever language you write — commands are ASCII tokens, identical everywhere
- ✅ Local `SKILL_PROFILE.md`, updated by the agent
- ✅ Optional opt-in telemetry for the pilot
- ❌ No persistent Skill Engine, decay/spaced-repetition, or eval harness yet — next phases

**Safety:** seeding is possible only during **before-code** review and only in chat/proposal — **only the clean version** lands in the project. Details — [SECURITY.md](./SECURITY.md).

---

## Join the pilot

Acuon is in validation. If you actively code with AI and want to try it —
open an issue using **[Pilot signup](https://github.com/acuonhq/acuon/issues/new?template=pilot-signup.md)**
or write **[acuon.ai@gmail.com](mailto:acuon.ai@gmail.com)**.
Telemetry is **strictly opt-in**, no code or names (see [SECURITY.md](./SECURITY.md)).

---

## Roadmap

- **Phase 1 — Rules MVP** _(current)_ — rules templates + profile, VERIFY/DIAGNOSE modes, behavior validation.
- **Phase 2 — Skill Engine** — cloud personal engine: decay + spaced repetition.
- **Phase 3 — Assurance** — team calibration + eval harness for autonomous review pipelines.

---

## Contributing

PRs welcome (templates, examples, translations). DCO sign-off required — see [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

Questions and feedback: **[acuon.ai@gmail.com](mailto:acuon.ai@gmail.com)**.

## License

[MIT](./LICENSE) © 2026 Acuon
