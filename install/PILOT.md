# Acuon Pilot — install

**This is the pilot install.** You were invited to the Acuon pilot, so this sets up everything in one place: the rule, the skill profile, **and** the local telemetry hook.

> Just found Acuon and only want to try it (no telemetry)? Use the normal [Quick start](../templates/QUICKSTART.md) — this pilot install is for invited participants.

## Pick your editor

- **Cursor** → [PILOT-cursor.md](./PILOT-cursor.md)
- **Claude Code** → [PILOT-claude.md](./PILOT-claude.md)

Both paths install the same protocol and log the same events. Requirements are the same too: your editor and **Node.js 18+** (`node -v`).

## What the pilot install adds

- The **rule** + your local **`SKILL_PROFILE.md`** — same as a plain install.
- A **telemetry hook** that writes a **local** log to `.acuon/acuon-events.jsonl`.

**Telemetry is local.** Nothing is sent anywhere. Sending to a server is a separate switch (`optInRemote`) that stays **off** unless a pilot organizer gives you a `remoteUrl`. There is **no** public backend in this release. Privacy details — [../SECURITY.md](../SECURITY.md).

## Feedback

Questions or issues: **[acuon.ai@gmail.com](mailto:acuon.ai@gmail.com)** or a [GitHub issue](https://github.com/acuonhq/acuon/issues/new?template=feedback.md).
