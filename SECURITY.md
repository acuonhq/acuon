# Security and privacy

Acuon is about **trust**, so security and privacy are built into the design — not bolted on.

## How to report a vulnerability

Do not open a public issue for vulnerabilities. Use **GitHub Security Advisories** — *Security → Report a vulnerability* tab in this repository (private channel). You can also write **[acuon.ai@gmail.com](mailto:acuon.ai@gmail.com)** (please say it is a security report).

We aim to respond within a few business days and coordinate disclosure timing.

## Seed safety invariant (key)

**VERIFY** has two phases relative to code in the project:

| Phase | What is reviewed | Seed (intentional defect to test vigilance) |
|-------|------------------|---------------------------------------------|
| **Before code** — design review (approach, requirements, proposal) | no code in the repository yet | possible, **only** in chat or proposal |
| **After code** — real diff review | code already on disk | **never** |

Seeding is possible **only in the “before code” phase**. It **never** lands in your project:

1. **Seed lives only in the review artifact** — proposal or chat message. Never in project files, commits, or applied diff.
2. **Only the clean version goes to the project.** After disclosure (`[REVEAL]`) the agent writes the implementation without the defect.
3. **“After code” phase — no seed:** questions target only the diff on disk; defects cannot be planted after the fact.
4. If separation cannot be guaranteed in the “before code” phase — the challenge is **not created**.
5. **Stealth until `[REVEAL]`:** until your `[VERDICT]`, the card and proposal do not label or hint at a seed; any defect looks like ordinary text. First mention of planting is the `[REVEAL]` block.

If the tool ever suggests committing or merging a seeded defect — that's a bug; report it via Security Advisories.

## Telemetry privacy (opt-in)

Pilot telemetry (`templates/pilot-telemetry/`) is **strictly opt-in**: nothing runs until you copy the hook files into your project. Copying them writes a **local** log only. Sending data to a server is a **second**, separate switch (`optInRemote`) and stays off unless you set a URL. Install details — [QUICKSTART-telemetry.md](./templates/pilot-telemetry/QUICKSTART-telemetry.md).

**What is collected** (locally, in `.acuon/acuon-events.jsonl`):
- Event type: `issued` / `done` / `skip` / `switch` / `reject`.
- Mode: `MANUAL` / `TUTORIAL`.
- Anonymous `participant` id, a **random local** `repoId` (generated at install, not derived from the path), week number, tool.

**What is NEVER collected:**
- Your code, diff content, task text.
- File names or paths (not even a hash of them), skill levels.
- Personal data.

**Data transfer:**
- By default — **none**: log stays local; participant forwards the file manually when the pilot organizer requests it.
- Auto-send — only if you **explicitly** enabled it in local `.acuon/config.json` (see below).

**About `.acuon/config.json`:** this file is not in the Acuon repository. The hook **creates it automatically** on the first event in your project (along with the `.acuon/` directory). By default `optInRemote: false` — no network use. To enable auto-POST, manually edit the created file: `optInRemote: true` and `remoteUrl` (receiver URL, if the pilot organizer provided one).

The log is plain readable JSONL: open and inspect before any forwarding. To remove all local telemetry, delete `.acuon/acuon-events.jsonl` (or the whole `.acuon/` directory) — nothing is stored outside it. Add `.acuon/` to `.gitignore` (recommended by default).
