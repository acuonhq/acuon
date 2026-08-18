# Acuon Pilot — install for Cursor

Pilot install for **Cursor**. One tree sets up everything: the rule, the skill profile, **and** the local telemetry hook. Using **Claude Code**? See [PILOT-claude.md](./PILOT-claude.md) instead. Overview: [PILOT.md](./PILOT.md).

> Just want to try Acuon without telemetry? Use the normal [Quick start](../templates/QUICKSTART.md).

## What you get

- `acuon-cursor.mdc` — the trust-calibration rule.
- `SKILL_PROFILE.md` — your local profile (the agent updates it).
- `acuon-telemetry.mjs` + `hooks.json` — the telemetry hook.

**Telemetry is local.** The hook writes only to `.acuon/acuon-events.jsonl` on your disk. **Nothing is sent anywhere.** Sending to a server is a separate switch (`optInRemote`) that stays **off** unless a pilot organizer gives you a `remoteUrl` — see the end of this page.

## Requirements

- **Cursor**.
- **Node.js 18+** (the hook runs on Node). Check: `node -v`.

## 1. Get this pack

Clone it (or **Code → Download ZIP** on GitHub and unzip):

```bash
git clone https://github.com/acuonhq/acuon.git
```

Remember the folder — below it is `/path/to/acuon` (Windows: `C:\path\to\acuon`).
Do **not** work inside that clone — you install *into your own project*.

## 2. Copy the pilot tree into **your** project

Open a terminal in the **root of the project you code in** (existing sources, or an empty folder you will open in Cursor).

### macOS / Linux / Git Bash

```bash
cp -R /path/to/acuon/install/cursor-pilot/. .
echo ".acuon/" >> .gitignore
```

### Windows — PowerShell

```powershell
New-Item -ItemType Directory -Force -Path .cursor\rules, .cursor\hooks | Out-Null
Copy-Item C:\path\to\acuon\install\cursor-pilot\.cursor\rules\acuon-cursor.mdc .cursor\rules\ -Force
Copy-Item C:\path\to\acuon\install\cursor-pilot\.cursor\hooks\acuon-telemetry.mjs .cursor\hooks\ -Force
Copy-Item C:\path\to\acuon\install\cursor-pilot\.cursor\hooks.json .cursor\hooks.json -Force
Copy-Item C:\path\to\acuon\install\cursor-pilot\SKILL_PROFILE.md .\ -Force
Add-Content .gitignore ".acuon/"
```

You should now have, in your project root:

```
.cursor/rules/acuon-cursor.mdc
.cursor/hooks/acuon-telemetry.mjs
.cursor/hooks.json
SKILL_PROFILE.md
```

## 3. Restart and verify

Rules and hooks are **not** under Settings. They live in **Customize**.

1. Reload Cursor: `Ctrl+Shift+P` (`Cmd+Shift+P` on macOS) → type `Reload Window` → Enter. Or quit Cursor and open this project again.
2. Open **Customize** (sidebar, or Command Palette → `Open Customize`) → **Rules**. The project rule `acuon-cursor` should be listed and on (Always Apply).
3. Same panel → **Hooks**. You should see `node .cursor/hooks/acuon-telemetry.mjs` with no error. (The UI shows the command, not the name “Acuon”.) If the tab is empty, also check the bottom **Output** panel → dropdown **Hooks**.
4. After your first agent exchange, the log appears: `.acuon/acuon-events.jsonl`.

If Hooks shows an error, it is almost always Node.js missing or not on PATH — re-check `node -v` and reload the window.

## 4. Use it

1. Ask the agent for a multi-step task (e.g. "add feature X").
2. If `SKILL_PROFILE.md` is new, the agent runs a short calibration (levels + working language). Answer in your own language — the agent replies in it; commands stay ASCII (`[VERDICT]`, `[DONE]`, `[SKIP]`).
3. Give verdicts on VERIFY cards. Events land in `.acuon/acuon-events.jsonl` as you go.

Full protocol and modes — [../templates/QUICKSTART.md](../templates/QUICKSTART.md) and [../templates/HOWITWORKS.md](../templates/HOWITWORKS.md).

## Sending data to a server (only if asked)

Off by default and unnecessary for the pilot unless the organizer says so.

1. After the first event, open `.acuon/config.json` (the hook creates it).
2. Set `optInRemote: true` and `remoteUrl` to the URL the organizer gave you.

There is **no** public backend in this release. With remote off, you simply send `.acuon/acuon-events.jsonl` when asked. Privacy details — [../SECURITY.md](../SECURITY.md).

## Feedback

Questions or issues: **[acuon.ai@gmail.com](mailto:acuon.ai@gmail.com)** or a [GitHub issue](https://github.com/acuonhq/acuon/issues/new?template=feedback.md).
