# Current status

Updated September 12, 2026, during the Nanterre hackathon. Update this document
when evidence changes. The current time, not the original timetable, governs
remaining build time. Official event submission is Sunday 13:00, freeze 12:30.

## Completed and verified

- Separate Desktop workspace created; all 14 earlier hackathon files copied
  and verified against SHA-256 hashes before editing. Original bytes retained
  in the local migration backup; details in `.local/migration-manifest.json`.
- Five earlier planning documents retained and updated with the corrected team
  name, role-based responsibilities, source conflicts and report requirements.
- Three original workshop PDFs retained unchanged, with extracted text and
  visual previews, under ignored reference/.
- New start guide, agent instructions, build handoff, Recognitium integration
  context, protocol notes, source map and pilot proposal prepared.
- XLS-65/66 downloaded at pinned standards revision; relevant implementation
  sections reviewed. Snapshot is distinct from the actual event server version.
- Recognitium public chain-tip call succeeded. Engine reported classical software.
- DevEx hook downloaded at pinned revision; consent/privacy/install files read.
  Endpoint reachable, event invite accepted. User authorized activation after
  disclosure. Identity created, eight Codex hooks registered and trusted using
  the supported CLI review UI; four project skills installed. Runtime capture and
  accepted delivery verified: 4 lifecycle events at 11:15:55 UTC; the installed
  hook's flush API delivered 14 more real events with HTTP 200 at 11:30:36 UTC,
  18 cumulative and zero buffered at that observation. Later captured kinds
  include tool_result and package_install. Raw data and identities stay ignored.
- Public GitHub repository created at
  https://github.com/jninom8/recognitium-xrpl-hackathon . A teammate write-access
  invitation was issued and is awaiting acceptance. Names/handles stay local.
- Desktop project registered through the installed Codex app-server project API.
  The desktop project's tools list did not refresh immediately; use the exact
  repository path for the fresh session.

## Pending, not represented as completed

1. Teammate frontend integration and an interactive demonstration of the local
   approval/evidence screens. The adapter, shared contract and live evidence exist.
2. Direct Recognitium HTTP issuance access returned 403. Authorized MCP issuance
   plus application verification works; diagnose direct service access separately.
3. Participant-authored final report, pitch and eventual submission. The agent
   has not written the official manual report or submitted the event package.
4. Optional MCP discovery and pilot discussion after the native acceptance gates.

## Fresh implementation evidence, September 12

- Installed Node 24.19.0, npm 11.17.0, exact xrpl 5.2.0, TypeScript 7.0.2,
  ripple-binary-codec 2.11.0 and ripple-keypairs 3.1.0. Lockfile included with
  implementation. Workshop p.9 explicitly recommends JavaScript / TypeScript.
- Shared browser-safe contract: `src/shared/contract.ts`. Native transaction
  builders and adapter, durable operation journal, request approval/receipt
  state machine, CLI cycle, local role views and authenticated mutation API
  implemented. These are implementation milestones, not passed live gates.
- Latest complete run: 14 tests passed, zero failed, 5,620.1306 ms. Both actual SDK signatures cover Data and the full
  transaction; changed terms/documents reject; missing human approvals or
  agreement receipt block; simulated uncertain submission/restart/receipt outage
  recovers without signing or funding another loan. Additional tests cover API
  roles/origin, nanosecond precision, authority mismatches, stored signature
  integrity, exact repeat blobs, expired unknown history and writer locking.
- Receipt integration probe minted once through authorized MCP at 11:31:11 UTC,
  cost 1 tick, ID `DG-8ab218c99d844c4a92b0385f87475887`. Committed text explicitly
  says synthetic integration probe, no loan/payment asserted. Official public
  receipt lookup returned HTTP 200; historical authority sequence 166320 matches.
  The app's own verifier passed at 11:45:49 UTC. Nanoseconds remain exact.
- Builds compile to JavaScript and use Node directly. The initial tsx launch
  failed at uv_os_get_passwd in this host; it is not needed by the application.
- Repository remains isolated. No company code, credentials, documents, raw
  hook output, source decks or third-party personal data added to tracked code.

Gate summary: G0 verified with mentor-authorized event-specific trial; G1-G5 passed.
Despite the enabled V1.1 amendment and published restriction, open-ended broker
creation and LoanSet succeeded on the event server. Repayment and withdrawal
validated; gross realised yield is 20 drops. Agreement/execution receipts were
issued through the authorized MCP and independently verified by the application.
G6 local recovery tests pass; live submission followed by a new process's lookup
recovered the same funded transaction, and the execution receipt was attached
after funding without another loan. Forced transport-failure injection remains
simulated. G7 local UI/API
implemented, live demonstration pending. G8/G9 not completed.

## Live cycle completed, September 12

Network 4001, event server 3.4.0-rc1, stable xrpl.js 5.2.0. The founder approved
both synthetic roles against the exact agreement and transaction hashes. Real
test funds moved; the business document is explicitly synthetic.

| Operation | Ledger | Result |
|---|---:|---|
| VaultCreate | 66039 | tesSUCCESS |
| VaultDeposit, 200 XRP | 66041 | tesSUCCESS |
| LoanBrokerSet | 66043 | tesSUCCESS |
| LoanBrokerCoverDeposit, 20 XRP | 66044 | tesSUCCESS |
| Co-signed LoanSet, borrower receives 100 XRP | 66253 | tesSUCCESS |
| Withdrawal above available liquidity | See evidence bundle | tecINSUFFICIENT_FUNDS |
| Normal LoanPay after due date | 66325 | tecEXPIRED |
| LoanPay with explicit late-payment flag | 66381 | tesSUCCESS |
| Final lender withdrawal, 200.000020 XRP | 66407 | tesSUCCESS |

Realised interest is 20 drops before network fees; withdrawal fee is 12 drops.
This is not a claim of net profitability after all setup/test transaction fees.
The refused normal repayment is preserved, and the corrected late payment has
its own journal. Approved late fee and late interest rate are zero.

Agreement receipt: `DG-05926b4f9e004086811e36045a5ae5a2`.
Execution receipt: `DG-e3db6da409604aea9e120f3f8a9ad01f`.
Each authorized MCP seal cost one tick. Direct HTTP issuance returned 403;
direct public verification works. No blind retry of that issuance was made.

Reviewed synthetic evidence: [full bundle](../evidence/synthetic-supplier-001.json).
The standalone verifier passed both signature checks, commitment checks, receipt
chain checks, fresh official receipt lookups and fresh ledger lookups for every
cycle transaction. Reproduce with:

```sh
npm run verify -- evidence/synthetic-supplier-001.json --online --mentor-confirmed-open-ended
```

DevEx capture identity is Recognitium (`recognitium`) from activation at
11:05:54 UTC; earliest retained event 11:11:29 UTC. At 13:18:08 UTC, 106 events
had accepted delivery, zero buffered. Counts are timestamped observations.

## Open source discrepancy

The morning challenge slides specify 5 minutes plus 3 Q&A; Notion specifies
4 plus 2. Ask a mentor which applies. The pitch has a four-minute core and
optional fifth minute; neither source has been silently declared obsolete.

## Scope and repository boundary

This is the hackathon application repository. The company repository remains
separate and read-only. The user authorized the build, project-local hook and
GitHub sharing. Real-money actions, public IVM signals and event submission are
outside that authorization. The public Recognitium API was separately verified
live on Scalingo; the adapter and live synthetic receipt probe are implemented.
The real loan agreement/execution receipt gates are now verified. UI polish,
teammate integration, participant-authored report and final event package remain.
