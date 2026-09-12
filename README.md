# Recognitium: XRPL lending hackathon

A small application connecting a private request and agreement to an actual XRPL
loan, repayment and checkable receipt. AI can help discover and prepare a request;
people approve the terms; XRPL moves test funds; Recognitium records commitments.

**Status: complete native test cycle and real receipts checked by the standalone
verifier. Teammate reproduction is pending.**

**Read together: [Recognitium developer journey](docs/DEVELOPER_JOURNEY.md)**
collects the timeline, problems, fixes, proof, hook status and next team work
in one page. Start there for the shared overview.

The hotspot resolved the venue connection failure. Following mentor guidance,
an explicit trial on the same event server succeeded despite its enabled V1.1
amendment and the documented open-ended broker restriction. See
[STATUS](docs/STATUS.md) for evidence and remaining live acceptance gates.

The borrower received 100 test XRP through co-signed LoanSet. After repayment,
the lender withdrew 200.000020 test XRP against a 200 XRP deposit: 20 drops
realised interest before network fees. Both a liquidity refusal and a late
payment refusal/recovery are recorded. Verify the published synthetic evidence:

```sh
npm ci
npm run build
npm run verify -- evidence/synthetic-supplier-001.json --online --mentor-confirmed-open-ended
```

For the next shared milestone, read the [frontend design and delivery plan](docs/FRONTEND_DESIGN.md)
and the [fresh-clone reproduction guide](docs/REPRODUCTION_AND_RECOVERY.md).
An original, simulated visual concept is available with `npm run design:preview`
at http://127.0.0.1:3100. It is separate from the live application below.

## Run the application

Requires Node 24+ and npm. This uses the JavaScript SDK `xrpl@5.2.0` with TypeScript
source, compiled to JavaScript. Dependencies and lockfile are pinned.

```sh
npm ci
npm test
npm start
```

Open http://127.0.0.1:3000. Empty/disconnected state is intentional until real
ledger objects exist. The frontend lead can replace `web/` against the documented
[shared API contract](docs/FRONTEND_CONTRACT.md), without importing signing code.

Copy `.env.example` to ignored `.env` and supply three distinct local prototype
capabilities and, for direct receipt issuance, an authorized Recognitium API key.
Keep these values private; never send wallet seeds to the browser. `npm start`
and `npm run cycle` load `.env` privately. No credentials are required for tests
or the disconnected view. Each developer installs and consents to the event hook
on their own machine; see [hook instructions](docs/HOOK_SETUP.md).

## Track 1 Vanilla, test funds only

The network is the **custom Lending V1 event Devnet**, not generic Testnet or
Track 2 public Devnet. Endpoints and matrix are in [protocol notes](docs/PROTOCOL_NOTES.md).
Run `npm run probe` or `node scripts/probe.mjs --long` to record exact timings in
ignored `data/probes/`. No automatic network fallback exists.

```sh
npm run cycle -- setup --mentor-confirmed-open-ended
npm run cycle -- prepare --mentor-confirmed-open-ended
```

`setup` persists test-only wallets provisioned by the event faucet under ignored
`wallets/`, waits for validated funding, then runs VaultCreate, VaultDeposit, LoanBrokerSet and
LoanBrokerCoverDeposit. Validated results, IDs and operation journals stay under
ignored `data/`. The first connection records server build, network ID and enabled
amendments; unsupported/incompatible environments fail closed. Add
`--mentor-confirmed-open-ended` to each subsequent cycle command and online
verification below for this mentor-authorized trial. The exception is scoped to
network 4001; it does not change the endpoint, track or SDK. For the local server,
set `TRACK1_MENTOR_OPEN_ENDED_TRIAL=1` in ignored `.env`.

`prepare` prints the synthetic agreement and exact prepared LoanSet. Both people
must review the amounts, fee, sequence, network, expiry, Data binding and schedule.
They approve using their own capability in the UI or personally run these CLI
commands with the exact displayed hashes:

```sh
npm run cycle -- approve synthetic-supplier-001 broker AGREEMENT_HASH TRANSACTION_DIGEST
npm run cycle -- approve synthetic-supplier-001 borrower AGREEMENT_HASH TRANSACTION_DIGEST
npm run cycle -- agreement-receipt synthetic-supplier-001
npm run cycle -- sign synthetic-supplier-001
npm run cycle -- submit synthetic-supplier-001
```

Repeat `submit` to look up validation. It reuses the identical signed blob if a
retry is needed, never autofills another LoanSet. Successful LoanSet both creates
and funds the loan; there is no separate LoanDraw here. This app requires a
verified agreement receipt before signing/submission; XRPL itself does not.

After validated borrower funding:

```sh
npm run cycle -- execution-receipt synthetic-supplier-001
npm run cycle -- refusal
npm run cycle -- repay
npm run cycle -- withdraw
npm run export -- synthetic-supplier-001
npm run verify -- data/exports/synthetic-supplier-001.json
npm run verify -- data/exports/synthetic-supplier-001.json --online
```

The refusal tries to withdraw the deposited principal while half the liquidity
is lent out. It records the actual native result and vault state; no result code
is fabricated. LoanPay uses the stored outstanding debt for the proposed single
scheduled payment. VaultWithdraw reconciles actual lender balance changes,
subtracting the initial deposit and separating the transaction fee. The measured
yield must be strictly positive. A zero or failed result does not pass the gate.

The live run exceeded its 60-second payment due date during receipt/evidence
checks. A normal LoanPay correctly returned `tecEXPIRED`. Rerunning `repay`
after that validated refusal uses a separate `repay-late` journal and
`tfLoanLatePayment`, only when approved late fee and interest rate are zero.
The original refusal remains in the evidence. Final withdrawal requires a
validated successful repayment.

If a connection drops, rerun the same operation. Signed transaction hash and
LastLedgerSequence were persisted first. An unresolved expired operation cannot
be replaced automatically. A leftover `data/writer.lock` after a crash requires
checking that its PID has exited before removing only that lock. Do not delete
the journals or wallets to resolve an uncertain submission.

Receipt issuance has no documented idempotency guarantee. An ambiguous receipt
call is marked unresolved and is not automatically charged again. Recover the
existing receipt ID through the operator recovery endpoint. It never triggers
another loan. The configured direct HTTP key is optional when using the existing
authorized Recognitium MCP to seal the displayed hash and then attach its receipt.

## Evidence and limits

The tests include real SDK serialization and cryptographic signatures plus
explicitly simulated ledger/failure tests. They are not live Devnet acceptance.
The verifier distinguishes content hashes, receipt chain consistency, official
authority record lookup and independent XRPL validation. Offline checks do not
claim fresh authority membership or ledger finality.

The public `api.recognitium.com` service is pre-existing classical software.
This repository contains a new adapter, not imported company source. QCP hardware
is outside the build. AI assistance was used. Official SDK and protocol examples
informed transaction construction; source links are in [SOURCES](docs/SOURCES.md).
No production deployment, real-money transfer or event submission is performed.

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
