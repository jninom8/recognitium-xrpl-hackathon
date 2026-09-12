# Project-local DevEx hook plan

Status: user approved activation after plan review on September 12. Consent
identity created, invite verified, project hooks registered and all eight trusted
through the supported Codex CLI review. Four Codex project skills installed.
Actual fresh-session capture and accepted delivery are verified. On September 12,
the lifecycle flush accepted 4 events at 11:15:55.330 UTC. During implementation,
the installed hook's own flush API accepted 14 further real events with HTTP 200
at 11:30:36.930 UTC: 18 cumulative, zero buffered at that check. Subsequent
capture includes tool results and an xrpl package install. No event was invented.

Latest verified flush, `2026-09-12T13:18:08.611Z`: 62 further events accepted,
HTTP 200, zero remaining, 106 cumulative sent. Capture continues during work;
these numbers are timestamped observations, not a claim that the buffer is always empty.

Use `npm run hook:status` for privacy-filtered counters. To flush existing
captured events with the installed hook's own API, use
`node scripts/hook-status.mjs --flush`. This emits only counts and HTTP status.
Its immediate flush result has its own timestamp; the upstream status field
`last_flush_at` records lifecycle-hook flushes and can therefore be older.
Registration/trust are unchanged. Invite, identity, buffers and sent records
remain ignored, as do any automatic analyses. The manual report is still human-written.

Source: https://github.com/RippleDevRel/xrpl-devex-hook

Downloaded revision: `6b1f4755e1de8520d23f4c9b6e404c6c9c75fe4d`, version 2.4.0.
Location: `.local/xrpl-devex-hook/` (ignored). Node 24.19.0 is available; this
installer requires Node 18+ and no npm dependencies. The organiser endpoint was
reachable and reports an invite-only event. Nothing has been submitted.
The official event page contains invite information; its matching source block
is preserved in `.local/invite-source-candidates.json`. Read it locally during
setup, extract only the explicitly labelled invite value and do not print it.

## Plan to review

Use team name **Recognitium**, already supplied by the founder. Register only
this Desktop project and this coding agent. The organiser receives selected
XRPL questions/error reports, truncated tool results, documentation references,
retry timings and structured feedback. The configured automatic session
analysis is every two hours; stated retention is 90 days. Team plus pseudonym
may identify a participant in a two-person team.

Use a fresh session rooted here so future hook activity concerns this build.
Do not copy the hardware/private company conversation into that session. The
installer describes redaction, but keep credentials and private documents out
of prompts and tool output independently of that filter.

## Exact organiser consent text

This project takes part in XRPL developer experience research for btf-paris-2026-09. If you consent, a hook in your coding agent records, first to a local file in this project and then to the organizer's server: the XRPL questions and error reports you ask your agent (prompts that name a transaction type or a result code, or that describe a problem), truncated; excerpts of tool outputs that carry an XRPL result, and the URLs of XRPL documentation you consult; XRPL packages you install; retry counts and time to first success per transaction type; short structured notes your agent writes about XRPL friction it observed; and anything you submit yourself with /xrpl-feedback or /xrpl-session-analysis. Nothing without an XRPL keyword is stored. File contents, git history, environment variables, names and emails are never collected, and a redaction pass removes seeds, keys and tokens before anything is written. You are identified only by a random pseudonym and your team name; in a small cohort that pair may still identify you to the organizer. Every 2 hour(s) of XRPL activity, your agent also writes a session analysis of that period and submits it after redaction; you can read every report in .xrpl-devex/reports/. Data is kept for 90 days and used for developer experience reporting only. You can stop at any time by deleting .xrpl-devex/identity.json in this project or removing the hooks from your agent settings.

This paragraph is the installer's disclosure, not a promise that no sensitive
text could ever pass its filters. The scripts themselves are available locally
for review. The plain consent text is also saved in `.local/HOOK_CONSENT.txt`.

## Activation sequence after the requested plan review

1. Show the disclosure above and resolve consent from the actual user reply.
   The installer requires a consent answer after disclosure. Do not invent it.
   Do not ask again for the already-known team name.
2. Use the official organiser-provided invite information saved locally, or ask
   the participant only if it is incomplete. Keep it in ignored storage, never in this document,
   git, chat output or a literal command argument. The installer verifies it.
3. Run the existing installer from the project root with `--non-interactive`,
   `--agent codex` and this project path. Supply consent/team/invite through
   task-scoped environment values without printing them. Review generated files.
4. Inspect `.codex/hooks.json`. Trust the reviewed project hooks through Codex's
   supported hooks UI, then start the fresh project session. Never bypass trust
   or edit internal trust databases to manufacture acceptance.
5. Run `node .local/xrpl-devex-hook/hook/status.mjs`. Confirm the project path,
   identity, registered hooks and counters. Registration is not proof of capture.
6. During a real, non-sensitive XRPL development action, confirm a hook event is
   buffered and a flush is accepted. Inspect local status and sent records without
   leaking their content. Do not send a fabricated faucet error as a smoke test.
7. Record capture/delivery evidence in STATUS. Each developer's machine needs
   its own setup and consent; one participant cannot consent for the other.

Official Codex documentation confirms that project hooks are subject to a trust
review and that changed hooks require renewed review:
https://developers.openai.com/codex/hooks

The current CLI's runtime capture and accepted delivery have been exercised.
If the host's tool-event names do not match the hook's
filters, record that observation and resolve it with the mentor rather than
claiming the hook works because setup returned successfully.

## What is kept out of git

`.local/`, `.xrpl-devex/` and `.codex/` are ignored. The hook's invite, pseudonym,
buffers, sent records, absolute-path registrations and local reports stay there.
Do not merge this setup into the company repo or the user's global configuration.

The manual developer report remains separate and participant-written. Automatic
hook analyses are part of the organiser's capture system, not a substitute for
the participants' account required in the final submission.
