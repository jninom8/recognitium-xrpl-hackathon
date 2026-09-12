# Recognitium: XRPL lending hackathon

A small application connecting a private request and agreement to an actual XRPL
loan, repayment and checkable receipt. AI can help discover and prepare a request;
people approve the terms; XRPL moves test funds; Recognitium records commitments.

**Status: build authorized; implementation starting.** The native XRPL lending
cycle has not yet been validated. See the live milestone record in docs/STATUS.

Start with [START_HERE.md](START_HERE.md). The next agent's implementation contract
is [BUILD_HANDOFF.md](docs/BUILD_HANDOFF.md). The readable overall plan remains
[PLAN.md](PLAN.md), with alternatives in [TRACK_DECISION.md](TRACK_DECISION.md).

## What belongs here

This is a separate local Git repository on the Desktop. It contains the work
specific to the September 12-13 XRPL hackathon. It has no relationship to the
company repository's git history. Team repository:
https://github.com/jninom8/recognitium-xrpl-hackathon

| Need | File |
|---|---|
| Agent rules and scope | [AGENTS.md](AGENTS.md) |
| Start a clean implementation session | [START_HERE.md](START_HERE.md) |
| Build order, acceptance criteria and interfaces | [Build handoff](docs/BUILD_HANDOFF.md) |
| Existing Recognitium service and MCP boundary | [Integration context](docs/RECOGNITIUM_INTEGRATION.md) |
| XLS-65/66 details and environment differences | [Protocol notes](docs/PROTOCOL_NOTES.md) |
| Hook consent, setup and verification | [Hook setup](docs/HOOK_SETUP.md) |
| Pilot proposal after the demonstration | [Pilot proposal](docs/PILOT_PROPOSAL.md) |
| Current evidence and next actions | [Status](docs/STATUS.md) |
| Source URLs, pinned revisions and local archive | [Sources](docs/SOURCES.md) |
| Developer observations | [DEVEX_LOG.md](DEVEX_LOG.md) |
| Participant-written report prompts | [DEVELOPER_FEEDBACK.md](DEVELOPER_FEEDBACK.md) |
| Demo narrative | [PITCH.md](PITCH.md) |

Downloaded workshop PDFs, standards, previews and the event-page snapshot are
under `reference/`. They are preserved locally and excluded from git; source URLs
are in the tracked source document. Local team details, the original migration
copy and the downloaded hook are under `.local/`, also excluded from git.

The eventual event submission needs a public-safe application repository,
reproducible setup, validated transaction links, slides and a participant-authored
developer report. GitHub publication is authorized; event submission has not
been made. Teammates can clone the public repository and use feature branches.
