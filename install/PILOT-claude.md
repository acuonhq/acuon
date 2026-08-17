# Acuon Pilot — install for Claude Code

Pilot install for **Claude Code**. It sets up the rule, the skill profile, **and** the local telemetry hook. Using **Cursor**? See [PILOT-cursor.md](./PILOT-cursor.md) instead. Overview: [PILOT.md](./PILOT.md).

> Just want to try Acuon without telemetry? Use the normal [Quick start](../templates/QUICKSTART.md#claude-code).

## What you get

- `acuon-claude.md` — the trust-calibration rule (goes into your `CLAUDE.md`).
- `SKILL_PROFILE.md` — your local profile (the agent updates it).
- `.claude/hooks/acuon-telemetry.mjs` — the telemetry hook.
- `.claude/settings.json` — the hook wiring (`UserPromptSubmit` + `Stop`).

**What the hook captures on Claude Code — same as Cursor.** Claude Code fires `UserPromptSubmit` with your prompt text and `Stop` with the assistant's final message (`last_assistant_message`), so both your commands (`[VERDICT]`, `[DONE]`, `[SKIP]`, …) and the agent's cards, reveals, credits and rejections are logged. No transcript parsing needed.

**Telemetry is local.** The hook writes only to `.acuon/acuon-events.jsonl` on your disk. **Nothing is sent anywhere.** Sending to a server is a separate switch (`optInRemote`) that stays **off** unless a pilot organizer gives you a `remoteUrl` — see the end of this page.

## Requirements

- **Claude Code**.
- **Node.js 18+** (the hook runs on Node). Check: `node -v`.

## 0. Get this pack

Clone it (or **Code → Download ZIP** on GitHub and unzip):

```bash
git clone https://github.com/acuonhq/acuon.git
```

Remember the folder — below it is `/path/to/acuon` (Windows: `C:\path\to\acuon`).
Do **not** work inside that clone — you install *into your own project*.

Open a terminal in the **root of the project you code in**.

> **Fresh, empty project?** You can copy the whole tree in one step, then jump to step 4:
> ```bash
> cp -R /path/to/acuon/install/claude-pilot/. .
> mv acuon-claude.md CLAUDE.md      # only if you have no CLAUDE.md yet
> echo ".acuon/" >> .gitignore
> ```
> This overwrites an existing `CLAUDE.md` or `.claude/settings.json`, so on an established project do steps 1–5 instead.

## 1. Copy the skill profile

```bash
cp /path/to/acuon/install/claude-pilot/SKILL_PROFILE.md SKILL_PROFILE.md
```

PowerShell: `Copy-Item C:\path\to\acuon\install\claude-pilot\SKILL_PROFILE.md .\ -Force`

## 2. Add the rule to `CLAUDE.md`

- **No `CLAUDE.md` yet** — copy the rule as your `CLAUDE.md`:

```bash
cp /path/to/acuon/install/claude-pilot/acuon-claude.md CLAUDE.md
```

- **`CLAUDE.md` already exists** — **append** the rule (keep your existing instructions):

```bash
cat /path/to/acuon/install/claude-pilot/acuon-claude.md >> CLAUDE.md
```

PowerShell: `Get-Content C:\path\to\acuon\install\claude-pilot\acuon-claude.md | Add-Content CLAUDE.md`

## 3. Copy the hook script

```bash
mkdir -p .claude/hooks
cp /path/to/acuon/install/claude-pilot/.claude/hooks/acuon-telemetry.mjs .claude/hooks/
```

PowerShell:

```powershell
New-Item -ItemType Directory -Force -Path .claude\hooks | Out-Null
Copy-Item C:\path\to\acuon\install\claude-pilot\.claude\hooks\acuon-telemetry.mjs .claude\hooks\ -Force
```

## 4. Wire the hooks in `.claude/settings.json`

- **No `.claude/settings.json` yet** — copy the ready one:

```bash
cp /path/to/acuon/install/claude-pilot/.claude/settings.json .claude/settings.json
```

- **`.claude/settings.json` already exists** — merge these two entries into your existing `"hooks"` object (don't overwrite the file):

```json
{
  "hooks": {
    "UserPromptSubmit": [
      { "hooks": [ { "type": "command", "command": "node .claude/hooks/acuon-telemetry.mjs" } ] }
    ],
    "Stop": [
      { "hooks": [ { "type": "command", "command": "node .claude/hooks/acuon-telemetry.mjs" } ] }
    ]
  }
}
```

If you already have `UserPromptSubmit` or `Stop` arrays, add the Acuon `{ "hooks": [ … ] }` entry to them rather than replacing. Prefer not to commit hook config? Put the same block in `.claude/settings.local.json` instead.

## 5. Ignore the local log

```bash
echo ".acuon/" >> .gitignore
```

PowerShell: `Add-Content .gitignore ".acuon/"`

## 6. Restart and verify

1. Restart Claude Code (or start a new session in the project).
2. Run `/hooks` — you should see the Acuon `command` hook under **UserPromptSubmit** and **Stop**.
3. After your first exchange, the log appears: `.acuon/acuon-events.jsonl`.

If nothing is logged: confirm `node -v` works in that shell, that `CLAUDE.md` contains the Acuon rule, and that `/hooks` lists both events.

## 7. Use it

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
