# Acuon Pilot — install (Cursor)

**This is the pilot install.** You were invited to the Acuon pilot, so this page sets up everything in one step: the rule, the skill profile, **and** the local telemetry hook.

> Just found Acuon and only want to try it (no telemetry)? Use the normal [Quick start](../templates/QUICKSTART.md) instead — this pilot page is for invited participants.

## What you get

Copying the pilot tree gives you three things at once:

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

1. Restart Cursor, or **Developer: Reload Window**.
2. **Settings → Rules** — `acuon-cursor` is listed and enabled.
3. **Settings → Hooks** — the Acuon hook is listed (no error).
4. After your first agent exchange, the log appears: `.acuon/acuon-events.jsonl`.

If the Hooks tab shows an error, it is almost always Node.js missing or not on PATH — re-check `node -v` and restart Cursor.

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

## Claude Code

The ready tree above is for Cursor. On Claude Code, install the rule/profile per the [Quick start](../templates/QUICKSTART.md#claude-code), then wire the same hook manually following [pilot telemetry — Claude Code](../templates/pilot-telemetry/QUICKSTART-telemetry.md#claude-code).

## Feedback

Questions or issues: **[acuon.ai@gmail.com](mailto:acuon.ai@gmail.com)** or a [GitHub issue](https://github.com/acuonhq/acuon/issues/new?template=feedback.md).
