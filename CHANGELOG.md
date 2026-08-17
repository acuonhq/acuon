# Changelog

All notable changes to Acuon templates. Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow semantic versioning for rules-MVP.

## [0.4.6] — 2026-08-16 — First public release

Rules-MVP for Cursor and Claude Code: a protocol and skill profile in markdown that calibrates whether trust in accepting AI code is deserved.

- **Modes:** DO (agent does it) and VERIFY (human checks before acceptance); DIAGNOSE, MANUAL, and TUTORIAL as supporting modes (`practice_mode: off` by default — review-only).
- **VERIFY** in two forms: before-code review of the design (seed possible, only in chat/proposal) and after-code review of the real diff (no seed).
- **Seed safety invariant:** a planted defect never lands in project files, commits, or applied diffs — only the clean version goes to disk. Details — [SECURITY.md](./SECURITY.md).
- **Language-neutral protocol:** one English pack; the agent replies in the user's language; commands are ASCII tokens (`[VERDICT]`, `[DONE]`, `[SKIP]`, …), identical everywhere.
- **Ready plans adopted as-is** (`plan_source: adopt`); only non-DO steps get in-file markup.
- **Local `SKILL_PROFILE.md`**, updated by the agent after credited review.
- **Optional opt-in pilot telemetry** (local JSONL; random `repoId`, no code, paths, or skill levels). Privacy — [SECURITY.md](./SECURITY.md).
- **Install docs:** clone this pack, copy files into *your* project (macOS/Linux and Windows), restart the editor. Telemetry: local log vs remote send are separate; remote is off unless you set a URL.
- **Install trees:** ready-to-copy `install/cursor` (plain), `install/cursor-pilot` (Cursor + local telemetry) and `install/claude-pilot` (Claude Code + local telemetry), plus a pilot install page ([install/PILOT.md](./install/PILOT.md)) that routes to per-editor guides ([PILOT-cursor.md](./install/PILOT-cursor.md), [PILOT-claude.md](./install/PILOT-claude.md)).
- **Claude Code telemetry parity:** the hook reads `UserPromptSubmit` (your commands) and `Stop` (`last_assistant_message`), so agent cards, reveals, credits and rejections are logged on Claude Code just like Cursor. The tool tag (`cursor` / `claude-code`) is auto-detected from the hook payload.
- **Feedback:** [acuon.ai@gmail.com](mailto:acuon.ai@gmail.com).

Pre-release 0.2.0–0.4.5 iterated internally (VERIFY/DIAGNOSE, seed safety, language-neutral protocol, telemetry).

[0.4.6]: https://github.com/acuonhq/acuon/releases/tag/v0.4.6
