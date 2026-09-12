# Current status

Start with the [unified developer journey](DEVELOPER_JOURNEY.md) for the shared
team overview; this file retains implementation gates and outstanding work.

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

Customer simplification: the root entrance now offers Request funding and
Provide funding, with the completed example and team review area separate.
Normal visitors start without the historical loan. 32 tests passed, including
request-matched loan display; Chrome checked the request/review path. Final
mobile QA was interrupted by the browser connection. Fresh native offer
preparation from a new request remains pending, explicitly stated in the UI.

The founder's customer-UX correction is implemented: / now provides borrower,
lender and broker task views, while /operator retains technical controls.
Borrower intake submission and broker review are durable authenticated actions;
local demo role codes were generated into ignored .env and loaded by the server.
Both role inbox reads returned HTTP 200. The repeatable setup command is
npm run demo:access; it leaves existing configuration untouched.
The [customer flow](CUSTOMER_FLOW.md) documents their limits. Connecting reviewed
intake to a fresh isolated native agreement is still pending. No new loan or
receipt was created during this milestone.

The white frontend is now integrated into the actual application at port 3000.
Its request, lender position, evidence and system-status views consume the same
typed snapshot as `npm run health`. Live local records and published real evidence
are explicitly separate sources. The [two-PC guide](TEAM_TESTING.md) covers
independent evidence review and the private connection needed for shared actions.
The earlier concept at port 3100 remains visibly simulated.

Teammate reproduction, the four extended failure cases, fresh-run isolation,
private two-PC connection setup and a complete new joint rehearsal remain pending.
The current wallets are backend-managed xrpl.js test accounts; browser-wallet
compatibility is a separate pending check. See [wallet notes](WALLETS.md).

At 17:29 Paris, context review recommends G7 frontend integration and rehearsal
before further cover/impairment experiments. The [frontend handoff](FRONTEND_CONTRACT.md)
lists the three views, current API/run/receipt gaps and acceptance criteria.
That earlier planning checkpoint is superseded by the UI implementation below;
the official human report remains unwritten by the agent.

The event probe failed again on venue Wi-Fi at 14:20 UTC, then succeeded after
another Wi-Fi change at 15:01:57 UTC: HTTP 573 ms, WebSocket 553 ms and SDK 766 ms,
network 4001, ledger 68408. Native experiment access is restored at this check.
See [the network comparisons](NETWORK_FINDING.md).

1. Teammate independent reproduction and a fresh joint demonstration. The
   synchronized interface exists; the runner still needs new-run isolation and
   an explicit durable handoff for external MCP issuance.
2. Direct Recognitium HTTP issuance access returned 403. Authorized MCP issuance
   plus application verification works; diagnose direct service access separately.
3. Participant-authored final report, pitch and eventual submission. The agent
   has not written the official manual report or submitted the event package.
4. Optional MCP discovery and pilot discussion after the native acceptance gates.

## Fresh implementation evidence, September 12

- Customer interface/intake: 31 tests passed, zero failed; final local run at
  17:53 UTC took 5,649.7976 ms.
  Two HTTP clients share immutable intake and broker review across a real server
  restart; no wallet or loan was created. An initial restart regression returned
  409 after acknowledged success. The server now releases its writer lock before
  HTTP 200, with a regression assertion. Chrome checked exact six-decimal
  requests, validation, access gating and mobile borrower/lender views at
  390x844 with no horizontal page overflow. Native/evidence tests still pass.
  Hook at 17:53:28.640 UTC: HTTP 200, 347 cumulative, zero buffered.
  See CUSTOMER-001 in DEVEX_LOG.

- Shared UI/console integration: 27 local tests passed, zero failed, 3,818.7502 ms.
  New coverage includes safe public projections, stale snapshots, exact review
  invalidation, read-only published evidence and two HTTP clients observing role
  approvals/concurrent-write reconciliation with simulated external systems.
  Receipt recovery no longer forces a ledger connection. Chrome desktop/mobile
  checks passed; a real idle backend stop/restart retained recorded funding,
  disabled confirmation and invalidated the open review on the new instance.
  No capability was entered and no new loan or metered receipt was made.
  At 16:46:48 UTC, read-only health observed network 4001, build 3.4.0-rc1,
  ledger 70504, 99 ms. Public authority availability is separate from issuance
  permission and from fresh transaction/receipt verification.
  Hook flush at 16:58:39.386 UTC: HTTP 200, 17 more accepted, 293 cumulative,
  zero buffered. See SYNC-001 in DEVEX_LOG.

- Isolated native cap experiment passed after the Wi-Fi change. At cap 10 test
  XRP, one competing deposit succeeded and one returned `tecLIMIT_EXCEEDED` in
  consecutive ledgers. A one-drop excess and cap reduction below current assets
  were also refused. All 10 XRP of principal returned; 2.000072 XRP network fees
  are separate. Seven transactions and historical state snapshots independently
  verified online at 15:11:24 UTC. Original vault unchanged; experimental vault
  remains empty. [Evidence](../evidence/native-cap-001.json).
  Reproduce read-only: `node dist/scripts/verify-cap-test.js --mentor-confirmed-open-ended`.
  Hook at 15:13:57 UTC: HTTP 200, 219 cumulative accepted events, zero buffered.

- Read and evaluated six external proposal texts. Kept the working track and
  selected isolated cap, cover and impairment experiments. Found a reproducible
  deposit-formula discrepancy between current docs and pinned XLS-65; no exploit
  or nonzero-loss ledger behavior has been demonstrated. [Review](EXTERNAL_REVIEW.md).
- Two actual child-process termination/restart tests passed with explicitly
  simulated ledger and receipt systems, preserving one submission and unchanged
  signatures/approvals. Stale writer locks remain fail-closed. No new funds moved.
  Hook delivery at 14:29:35 UTC reached 187 accepted events, zero buffered.

- Mentor beta.1 update evaluated. Both stable and beta.1 reproduced the real
  signed cycle offline; no new transfer or dependency migration. Stable already
  includes beta.1's counterparty signing fix. [Comparison](SDK_UPDATE.md).
  The public Notion refresh still served beta.0 for Track 2 at 13:36 UTC.

- Installed Node 24.19.0, npm 11.17.0, exact xrpl 5.2.0, TypeScript 7.0.2,
  ripple-binary-codec 2.11.0 and ripple-keypairs 3.1.0. Lockfile included with
  implementation. Workshop p.9 explicitly recommends JavaScript / TypeScript.
- Shared browser-safe contract: `src/shared/contract.ts`. Native transaction
  builders and adapter, durable operation journal, request approval/receipt
  state machine, CLI cycle, local role views and authenticated mutation API
  implemented. The native results and passed acceptance gates are listed below.
- Earlier baseline: 21 tests passed, zero failed, 3,213.9404 ms. Both actual SDK signatures cover Data and the full
  transaction; changed terms/documents reject; missing human approvals or
  agreement receipt block; simulated uncertain submission/restart/receipt outage
  recovers without signing or funding another loan. Additional tests cover API
  roles/origin, nanosecond precision, authority mismatches, stored signature
  integrity, exact repeat blobs, expired unknown history and writer locking.
  Commit `5807683` was pushed and its [GitHub CI passed](https://github.com/jninom8/recognitium-xrpl-hackathon/actions/runs/34701664050).
  CI covers the build/local tests; live cap verification was a separate run on
  this development machine, not a claimed teammate reproduction.
- Fresh live verification initially rejected a response missing optional
  `tx.ctid`; loan hash, ledger 66253, result and metadata matched. The comparison
  now validates CTID's ledger position/network if present and permits its absence,
  retaining every other field/metadata check and the original receipt-bound
  bundle bytes. A new regression rejects changed locators and substantive fields.
  The complete original cycle passed online verification again after correction.
- Targeted simulated regressions exposed and fixed two application issues:
  authority availability blocked recovery of already-validated funding, and
  replaying an agreement-receipt action rewound signed/funded phase. Four new
  checks preserve ledger recovery, submission gates and unresolved execution
  receipt attempts. No live funds moved during this test round. See RECOVERY-001
  in DEVEX_LOG. Hook delivery reached 167 accepted events at 14:05:52 UTC.
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
simulated. G7 synchronized local UI/API implemented; a fresh joint demonstration
and teammate reproduction remain pending. G8/G9 not completed.

## Live cycle completed, September 12

Implementation commit `1e4c07935ff73515849ad95cb54e9c5ec0cda1b4` pushed to
public origin/main; remote hash independently matched. Working tree was clean
at that check. Local test suite: 14 passed. At 13:30:26 UTC another 24 captured
hook events were accepted (HTTP 200), 130 cumulative, zero buffered.
GitHub Actions also completed successfully for that implementation commit:
https://github.com/jninom8/recognitium-xrpl-hackathon/actions/runs/34696591456 .

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
The real loan agreement/execution receipt gates are now verified. Fresh joint
rehearsal, teammate reproduction, participant-authored report and final event
package remain.

## September 12, 22:28 Paris: shared Vercel demo

- Founder explicitly authorized continuing past 22:00 and deployment. Reviewed the 19-page lending introduction and all 27 workshop pages, alongside the previously reviewed 10-page challenge (56 event pages total). Native Vanilla evidence remains the foundation; hosting adds shared request review.
- Created the separate recognitium-xrpl-hackathon Vercel project and private Blob store in cdg1 on the existing Hobby account. Public URL: https://recognitium-xrpl-hackathon.vercel.app/ . Native wallets, service credentials, private state and hook logs were excluded. Hosted role codes are separate and ignored.
- npm test: 34 passed, 0 failed (4,472 ms). Hosted tests explicitly simulate CAS conflicts and a write accepted before its response is lost. Actual local HTTP tests check role/origin gates and two-client review. No new ledger write or receipt charge.
- First deployed API returned HTTP 500, ERR_REQUIRE_ESM from @xrplf/isomorphic requiring @noble/hashes. Shared intake unnecessarily imported the ledger SDK through a digest utility. Extracted the identical canonical digest into a dependency-free shared module; native tests still pass. Second deployment returned state HTTP 200 and unauthenticated intake HTTP 401.
- At 20:28:28 UTC, real deployed Blob-backed HTTP checks passed: requester create, reviewer list and start-review, requester list, concurrent duplicate retry, wrong-role 401, foreign-origin 403 and native setup 403. Synthetic request request-7583f90f-c95f-4dd7-97f0-96dc0a0a4b8b remains UNDER_REVIEW, revision 2, exactly once. This is author-operated verification, not teammate reproduction.
- Chrome extension verified the public landing and request form. Fresh native agreement creation from intake is still pending; hosted service has no signing endpoint. See [hosted testing](HOSTED_TESTING.md).
- Hook 2.4.0: registered; flush accepted 27 actual events with HTTP 200 at 20:27:52 UTC, 412 cumulative, zero remaining. No generated participant report was submitted.

Deployment follow-up at 20:30:48 UTC: commit 84a51cb pushed to main; GitHub Actions run 34717285392 passed. GitHub-triggered redeployment changed the hosted instance from hosted-8c26095fdd828f824ef61d5a to hosted-ae81fdc89039880a14fdb8b8. A same-origin authenticated read returned HTTP 200 and retained the same single synthetic request at UNDER_REVIEW revision 2. This verifies persistence across an actual application deployment, not only a simulated restart. Chrome also rendered the completed repayment example successfully.

## September 12, 22:48 Paris: friendly UI and deployed failure testing

- Refreshed customer screens with mint, lavender and apricot on warm white; rounded controls, visible keyboard focus and reduced-motion support. Chrome desktop and 390px mobile checks exercised the entrance, exact 125.000001 XRP request review and recorded repayment screen. Brand links now resist automatic translation.
- Corrected misleading review-complete and repaid labels, explicit test-XRP amounts, and the hosted request-to-offer boundary. New hosted requests still do not originate a loan. A sequence guard prevents delayed inbox responses or mode changes from restoring stale private state.
- Expanded the deployed smoke script through completed review, changed-details rejection and stale-review rejection. It exposed a genuine Blob concurrency failure: get() returned a weak ETag W/ while head() returned the strong equivalent. Repeated conditional writes failed even without another writer. An identity-encoding GET returned a strong ETag and the previously blocked request advanced. The adapter now requests identity encoding and refuses weak ETags; it never removes the conditional-write guard. See the provider's [conditional-write documentation](https://vercel.com/docs/vercel-blob).
- The first expanded run stopped at review with HTTP 409; the next passed review completion but exposed malformed JSON returning 503 because Vercel parses req.body lazily. Body-access parsing errors now return 400, separate from storage errors. Synthetic test records are retained; no ledger money moved.
- Local suite: 36 passed, 0 failed at 20:48 UTC; includes weak-ETag and delayed-response regression cases. Build and frontend syntax checks pass. Fresh online evidence verification returned both-valid signatures, online-authority-record-verified and validated-success, with content/receipt-chain hashes checked separately.
- DevEx hook 2.4.0 flushed 10 actual events with HTTP 200 at 20:44:12 UTC: 432 cumulative, zero buffered at that checkpoint. No participant report generated. Final deployed smoke outcome follows below.

Final hosted check, 20:48:40 UTC: all expanded smoke assertions passed on the public site. Synthetic request request-882bee49-e65f-4c93-8894-e34f6c0ac582 reached REVIEWED revision 3, visible to the requester. Duplicate retries retained one request; changed details and stale review returned 409; malformed JSON returned 400; role/origin/native refusals passed. No funds moved. Code commit fee185e is published. These are author-operated HTTP and browser checks, not independent teammate reproduction.

## September 12, 23:43 Paris: open jury demo and solo rehearsal

Founder explicitly requested removal of hosted access codes. Hosted synthetic intake and review are now public presentation views; native signing and local operator authorization remain separate. Updated the solo two-tab rehearsal guide. Independent teammate reproduction is pending; no personal circumstances are published. Local tests: 36 passed. Hook 2.4.0 delivered four more real events with HTTP 200 at 21:43:25 UTC, 445 cumulative, zero buffered. Final deployed check pending below.

At 21:44:31 UTC, the deployed smoke passed without loading or sending any role credentials: synthetic request request-49c45765-8e63-4e2e-b63a-bad69dad3647 reached REVIEWED revision 3. Chrome confirmed the final request button says Send for review, with no code prompt. Native operations remain refused.

## September 13: distinct jury workspaces

Added /borrow (requester, mint), /review (reviewer, lavender) and /lend routes, with explicit role labels and a second-tab link between request and review. Both views use the same backend; colors and routes do not authenticate identities. Existing query links remain compatible. Local suite: 36 passed, 0 failed. The fresh intake-to-native-loan bridge remains the main functional gap; no new native funding is claimed.

## September 13: request-to-native bridge implemented, first live run pending

Added a local bridge with per-request data/wallet isolation, exact reviewed-intake binding, unchanged submitted principal, explicit duration/counter-offer, existing native setup/sign/submit/repay/withdraw recovery, durable external receipt handoff and filtered progress publication to the website. Public users cannot sign or approve through this bridge. 39 tests pass, including simulated fresh preparation/restart and changed-intake rejection. The actual event endpoint probe succeeded at 22:16 UTC on network 4001, rippled 3.4.0-rc1; SDK call 867 ms. No new loan has been funded. Request E0403F17 (600 test XRP, 60 days) is still UNDER_REVIEW at the last check. Founder review and duration choice are pending before preparing exact transaction approval. See NATIVE_BRIDGE.md for repeatable commands.

Bridge deployment checkpoint: commit cbb5480 reached Vercel Ready; GET /api/state?mode=live returned HTTP 200 with zero native requests (no fresh run is claimed). Hook accepted 19 actual events at 22:23:37 UTC, 475 cumulative, zero remaining. Lender view will use the matching published run after one exists.

## September 13, 00:30 Paris: final requirement/UI audit

Re-read all challenge pages and saved Notion judging/submission requirements; live Notion refresh failed. Read-only hosted check confirms zero fresh native bridge runs and the selected 600-XRP request still under review. Audit found missing setup/approval progress, ambiguous freshness, overly generic loan/receipt labels, hidden native-refusal history, an operator selected-run/cycle mismatch, untyped hosted state extensions and an exporter still bound to original data paths. Prioritized fixes, one fresh native cycle, per-run evidence export and participant report ahead of more styling. See [FINAL_INTEGRATION_PLAN.md](FINAL_INTEGRATION_PLAN.md). No ledger action or manual report generated in this audit.

## September 13: shared native progress ready for the fresh request

The hosted state now publishes vault preparation before an agreement exists, per-request cycle mapping, original requested duration versus offered duration, both exact approval states, native refusal history and separate page/publication times. The operator view uses the selected loan's cycle. The exporter accepts isolated per-request run directories while preserving the original evidence path. Local verification: 40 tests passed, zero failed; original evidence export still passes offline verification. Fresh 600 test-XRP setup and funding are not yet claimed. The accelerated 60-second period is an explicit demo counter-offer; exact human approval remains required before signing.

## September 13, 01:05 Paris: selected request prepared on the real event ledger

Selected intake E0403F17 (600 test XRP, 60 days, synthetic inventory) reached REVIEWED revision 3. Prepared the explicit 60-second demo counter-offer, preserving the original request. Each new faucet account received 1,000 test XRP. The 1,200-XRP deposit was genuinely refused with tecINSUFFICIENT_FUNDS at ledger 77989 (9B529B451F0137A9B2B6324B1C4D0EFE5FBD226DAEE6A31BEBACA53F7023776E). Recovery preserves that operation and journals a separate setup-account top-up and corrected deposit. Top-up validated at 78030; deposit succeeded at 78032 (877A494AC3E527A09C72AEC844EB17DC9CF63FC2A71185D08A8BA0258D7D248E), broker at 78034 and 120-XRP cover at 78036. This was test setup capital, not borrower funding.

Repeated bridge prepare in a new process retained all six original operation hashes and the same agreement/transaction digests; no duplicate operation was created. The latest local suite passed 40 tests. Chrome on the deployed reviewer screen showed 600 XRP, requested 60 days, offered 60 seconds, both approvals pending and the native publication time. Agreement a932d0dd96836f4eabd0561a53dcb7a2c87d1c324015831e5233105217906625; transaction digest 449b98ba9ba4981ff12b14c25da3e9eb54822bf722fd4653a0a7698cf1251158. No LoanSet signature, fresh funding, new receipt, repayment or yield is claimed. Exact founder approval is now required. Public progress code eecfb87 was pushed and deployed Ready. Hook accepted 18 events at 23:00:14 UTC, HTTP 200, 503 cumulative and zero buffered at that checkpoint. The official participant report remains unwritten by the agent.

## September 13, 01:24 Paris: research and evidence-boundary experiment

Added a sourced strategy study in [RESEARCH_VERIFIABLE_LENDING.md](RESEARCH_VERIFIABLE_LENDING.md), comparing the build with historical payment instruments, smart contracts, timestamping, typed signing, Accord Project, FINOS CDM, AP2 and BIS Mandala. Recommendation: make existing per-loan evidence inspectable and portable before expanding features. The study distinguishes key signatures from independently authenticated human consent, authority lookup from offline hash consistency, and request retries from global duplicate-financing prevention. This is research, not the official participant-written report.

The new `scripts/check-evidence-boundaries.mjs` runs without the application. On the public original synthetic bundle, deliberately changed copies of the document, signed commitment, yield and refusal history were rejected. An internally consistent altered receipt still required authority lookup and was rejected against the actual authority record. Only the existing public receipt ID was sent in two read-only GETs; fake receipt bytes were never submitted. Original file hash unchanged. Evidence: `evidence/research-evidence-checks.json`, checked 23:23:06 UTC. A separate fresh online bundle check passed both signatures, authority-record comparison and all saved XRPL transactions. Author-operated, not independent reproduction. No signing, metered issuance or ledger writes occurred.

Read-only hosted check at 23:24 UTC: selected 600-XRP request still AGREEMENT_LOCKED, zero approvals, unfunded. Exact approval remains pending and transaction expiry must be rechecked before resuming. Hook accepted 12 actual events at 23:24:02 UTC with HTTP 200; 535 cumulative, zero buffered. No manual report or event submission generated.
