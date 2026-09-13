# Current status

Latest verified milestone: September 13, 11:09 Paris. The AI-prepared hosted
request 1708833C completed all six native Track 1 gates, with real agreement and
execution receipts and 20 drops realised interest before fees. Online evidence
verification passed; 58 tests pass. See the final entry for exact evidence.
Earlier entries below are historical checkpoints, not current blockers.

Start with the [unified developer journey](DEVELOPER_JOURNEY.md) for the shared
team overview; this file retains implementation gates and outstanding work.

Latest milestone, September 13, 09:34 Paris: borrower/reviewer/lender/admin
share a deployed explanation of exact approval, the broker's receipt policy and
XRPL execution. Evidence cards separate offline consistency from online receipt
authority and ledger inclusion; missing authority timestamps stay pending.
52 tests pass. Connected Chrome checked all four deployed workspaces, including
the lender's return/fees, admin evidence export and the live expired offer.
Borrower and admin views retain separate current wallet balance and loan proceeds.
GitHub deployment of `14230d6` is READY at the existing Vercel URL; Vercel's
project page identified deployment `3thNG7eFY7woMPxRMWY4HoQVf1Qz`. Git deployment
worked after the CLI returned Not authorized. Later documentation-only commits
may supersede this deployment without changing the checked behavior.
Hook checkpoint 07:34:14.967 UTC: HTTP 200 accepted one explicit reflection,
627 cumulative, zero buffered. Identity is active under Recognitium. Automatic
capture has not advanced in the current projectless chat context; explicit
reflection delivery is not evidence of automatic runtime capture here.
See [UI_CAPABILITY_AUDIT.md](UI_CAPABILITY_AUDIT.md) for the complete mapping and
actual evidence. The fresh 600-test-XRP loan remains unfunded with an expired
unsigned offer; this UI milestone does not complete that remaining native run.
The [agent authority direction](AGENT_AUTHORITY_DIRECTION.md) keeps separate
approval receipts, repayment mandates, identity issuers and revocable autonomy
as proposed work, not implemented capabilities or compliance claims.
Research follow-up at 10:27 Paris reread the three original slide decks and
checked the shared-market framing; no code or lending state changed. Hook
accepted one more explicit reflection with HTTP 200: 628 total, zero buffered.
At 10:36 Paris, the founder requested a unified conversational app plan and
confirmed Mistral as the proposed AI provider. See
[CONVERSATIONAL_APP_PLAN.md](CONVERSATIONAL_APP_PLAN.md). Planning only: no
application change, provider request or new loan. Hook reflection accepted with
HTTP 200 at 08:35:57.011 UTC, 629 total, zero buffered.
Earlier checkpoints below are chronological history and may be superseded.

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

## September 13: contract-history claims checked

Added [CONTRACT_HISTORY_FACT_CHECK.md](CONTRACT_HISTORY_FACT_CHECK.md). Re-derived both signing addresses and verified both signatures in the original published 100-test-XRP bundle. Reviewed primary XRPL documentation, the C-413/23 P judgment and final July 2026 EDPB blockchain guidance. Preserve the lifecycle idea while separating recorded assertions, key authority, ledger validation, clock accuracy and legal effect. Salt deletion is not an automatic GDPR-erasure guarantee. This is research, not a new KYC feature or participant-written report; no new lending or receipt issuance occurred. Hook status at 01:45:52 UTC: seven existing events accepted, HTTP 200, 547 cumulative, zero buffered.

## September 13, 10:57 Paris: conversational application validation

Implemented one customer shell with Borrow, Provide liquidity and Review intentions,
Mistral draft assistance and a simple-form fallback. Secrets remain server-side.
The default model is ministral-3b-latest: actual inference HTTP 200, including
structured amount/purpose/duration output. mistral-small-latest previously returned
HTTP 429 on three bounded attempts; the valid API key alone did not prove inference
capacity. No alternate provider or paid subscription was added.

Connected Chrome exercised AI drafting of 100 test XRP for inventory over 30 days,
exact intake confirmation, persisted submission and the same request in reviewer
view: request-1708833c-9d9e-4a49-9fe2-6b9284842ecc. This used the loopback hosted-boundary
preview with actual shared Blob storage. It created intake only: no loan,
approval, signature, KYC result or receipt. Chat text has no authority tools.
A saved request cannot be silently rewritten through the assistant.

57 automated tests passed. New checks cover bounded model output, authority-field
rejection, persistent AI quota concurrency, corrupt quota data and limits. Existing
approval, recovery, funding and evidence checks also pass. The presentation test
checks all six Track 1 outcomes against the real published example and requires
zero inherited outcomes for a different request. The six-step evidence panel keeps
vault, deposit, broker/acceptance, funding/repayment, realised yield and native
refusal visible without crowding the conversational screen. Details, exact terms,
wallet observations, receipt checks and advanced controls remain accessible.

Official hook accepted an explicit implementation reflection at 08:57:17.313 UTC,
HTTP 200: 630 cumulative, zero buffered. Automatic runtime capture has not advanced
in this projectless chat. Explicit delivery is not automatic capture. This record
is agent-written implementation evidence, not the required participant report.

Deployment verification follows. Remaining boundaries: the fresh 600-XRP offer is
expired and unfunded; the new AI intake has no prepared offer. Native execution
requires the local operator, fresh exact role approvals and real receipt recovery.
No browser wallet or actual KYC issuer was added; lender chat is non-binding and
cannot make a deposit. The original real 100-XRP test cycle remains distinct.

### 11:00 Paris deployment and fresh verification

Commit 52b59ab deployed READY on Vercel (xtcoAeiSBYezdzPwKQKoSXSLJqGz).
The deployed assistant reached Mistral successfully. Its first reply unnecessarily
asked about precision and mentioned the wrong unit, while leaving amount unset;
no request was submitted from that incomplete draft. Added an explicit whole-XRP
rule and a structured extraction example. The same actual inference then returned
100 XRP / 30 days / inventory. This is a model reliability finding, not an XRPL bug.

Fresh Track 1 probe at 08:58:57 UTC succeeded over HTTP, WebSocket and xrpl.js 5.2.0.
Ledger 89940, rippled 3.4.0-rc1. The complete original bundle passed --online
verification: content consistent, both signatures valid, receipt hash chain
consistent, online receipt authority verified and XRPL validated success. These
are fresh read-only checks of the original cycle, not funding of a new request.

## September 13, 11:09 Paris: AI intake completed the full native cycle

The remaining connection was exercised with a NEW hosted request:
`request-1708833c-9d9e-4a49-9fe2-6b9284842ecc`. This is distinct from both the
original example and the expired 600-XRP offer. Mistral drafted 100 test XRP /
inventory / 30 requested days; the public reviewer completed intake review.
The founder then explicitly approved both synthetic roles, exact hashes and the
60-second accelerated counter-offer. No chat text was treated as a signature.

| Gate | Actual evidence |
| --- | --- |
| Open-ended vault | tesSUCCESS, ledger 90024 |
| Lender deposit | 200 XRP, tesSUCCESS, ledger 90026 |
| Broker and cover | tesSUCCESS, ledgers 90028 and 90030; cover 20 XRP |
| Co-signed LoanSet | tesSUCCESS, ledger 90068; borrower received 100 XRP |
| Native refusal | tecINSUFFICIENT_FUNDS before repayment |
| LoanPay | tesSUCCESS, ledger 90086; scheduled repayment, no late recovery needed |
| Lender withdrawal | tesSUCCESS, ledger 90092; 200.000020 XRP withdrawn |
| Realised yield | 20 drops before fees; withdrawal fee 12 drops |
| Agreement receipt | DG-e2d41354140a451c855050f148b55da1, one metered tick |
| Execution receipt | DG-67bd66978e854f4e8d79d21862723ee4, one metered tick |

Funding transaction:
`CABC51612A0478F935D0C82DF3102124FC2DDC7E7CAACD665BCF37FD836F08FD`.
Initial submit returned validation-unknown. Reconciliation retained the same signed
transaction and confirmed funding. A later submit after completion retained the
funded record. A deliberately changed document copy was rejected; the original
remained valid. Fresh online verification of the NEW bundle passed content,
both signatures, receipt authority and every saved XRPL transaction check.

The reviewed synthetic bundle is [ai-request-1708833c.json](../evidence/ai-request-1708833c.json).
Its document contains synthetic intake and the accelerated offer only. It has no
wallet seeds, identity documents or company secrets. It preserves original bytes.
The borrower and lender pages were checked in connected Chrome against this
request: repaid 100 XRP and withdrawn 200.000020 XRP respectively. The reviewer,
wallet observations, exact terms, receipts and transaction history use the same
request-matched backend snapshot. This is an operator-assisted real demo, not an
autonomous credit service. The frontend still cannot sign or make deposits alone.

58 tests pass. Mistral sometimes omitted a plainly stated draft field even after
prompt correction, so a narrow literal-field guard preserves explicit amounts,
days and known purposes; human confirmation remains required. Saved-request chat
now directs people to the existing record instead of suggesting another intake.

Hook accepted the milestone reflection with HTTP 200 at 09:09:27.628 UTC: 631
cumulative, zero buffered. Its first attempt used invalid taxonomy surface ledger
and was rejected locally without sending; the corrected tooling event succeeded.
Automatic capture has not advanced here. The mandatory personal report remains
participant-written and has not been generated or submitted.

### September 13: shorter screens with two visible evidence sources

The founder requested a much simpler first screen and explicit proof from both
systems. The customer views now show a short state, amount, XRPL proof card and
Recognitium proof card. Chat, request selection and technical explanations are
collapsed for saved loans. Exact terms, warnings, native history and controls are
retained. Recognitium links open the real agreement and execution receipt lookup
endpoints; both returned HTTP 200 during this check. The cards distinguish saved
XRPL confirmation from receipt authority, including failed and pending states.
Nine presentation tests passed and the hosted build passed. No loan, signature
or new receipt was created in this UI change.

### September 13: admin review, friendly colours and clean restart

Navigation is Borrower / Lender / Admin. Admin has no chatbot and keeps the
wallet/identity card visible beside the separate receipt and XRPL proofs. The
actual KYC commitment remains not provided: no KYC provider was added. Intake
can be accepted for offer preparation, returned for revision, or declined.
Decline is a durable REJECTED state; retry is idempotent and bridge preparation
refuses it. This application decline is not the native refusal used for Track 1.

Borrower uses a quiet peach accent and lender uses lavender. Restart demo clears
the selection and conversation through a fresh page, retaining all saved records
and session AI limits. It refuses to abandon a pending or active submission.
Chrome checked lender restart: no selected loan, chat open, and both existing
native records still selectable. Fixed old-loan fallback after restart. Admin
preview has no visible chatbot; Recognitium's name is protected from automatic
browser translation. 61 tests pass, including rejection persistence, no funding
plan for declined intake, safe retries and uncertain-submission restart blocking.
No new loan, receipt or real KYC assertion was created by these changes.

### September 13: availability matching and readiness checklist

Lender now opens with availability, not another customer's historical balance.
Borrower can propose a match to a shared synthetic availability. The service checks
an actual validated event ledger balance, amount and duration. Both demo roles
approve the immutable match fingerprint; their recorded tap times are sealed in a
second commitment. Admin has a backend-derived checklist and manual proposal
accept/decline. Acceptance requires both approvals and a verified receipt. A
seven-step progress bar separates matching, approvals, seal, admin, funding,
repayment and return. KYC remains explicitly absent, not inferred from a wallet.

Actual IVM search for XRP returned zero live signals. Founder approved the exact
public demand (1 tick, 1800 seconds); publication DG-572bb9f7ec7e41b888b3900147584189
succeeded at 09:39:48 UTC, expires 10:09:48 UTC. This is publication proof, not a
live lender match. The shared availability is labelled local-demo. Discovery and
receipt issuance currently use the operator's real Recognitium MCP, not browser
Mistral tool calls. No unsupported direct IVM API was invented.

Request 131184CE was matched to 100 test XRP availability for 30 days. Network
4001 balance observed at ledger 90875: 999999984 drops. Founder approved both
matching roles. Match receipt DG-208fc3251c6c4a64923cb035432c35b3 was issued (1 tick)
and independently recovered by official authority lookup. Evidence is in
[evidence/matching-131184ce.json](../evidence/matching-131184ce.json).
The match is awaiting the admin decision. This receipt does not fund a loan.

Backend review found and fixed repeated allocation of the same availability,
multiple proposals for one request, old native requests being eligible for new
matching, substituted lender risk in preparation, and duplicate/contradictory UI
status. Matched bridge preparation uses the actual controlled test lender wallet,
preserves the matched deposit amount and binds the match into the loan document.
It checks receipt and expiry before new approvals/signing. Already signed
transaction recovery retains the original evidence and does not re-sign.
The new matched-loan bridge path has unit coverage, but has not yet been run end
to end against the ledger. Existing two completed native cycles remain intact.

65 automated tests pass. Chrome preview checked lender availability entry, no
inherited loan balance, admin without chatbot, progress 3/7 and six backend
checks. New market assets are allowed explicitly in hosted build, preview and
local static server. The full local operator server does not expose shared market
mutations; use the hosted-boundary preview with its authorized Blob environment.
No Track 2 schedule refusal is claimed; the Track 1 native refusal remains the
actual recorded tecINSUFFICIENT_FUNDS case. The manual report remains participant-written.

Final checks: 67 tests passed, including all browser module syntax/asset boundaries and offline verification of the real match receipt. Navigation and landing cards now run Lender, Borrower, Admin. Header labels XLS-65 vaults/shares and XLS-66 loans/interest. Brik history marks individual lender/request/admin records unsealed; only the actual match receipt is shown as verified.

The old live/recorded dropdown was replaced by a top Reset button. Reset opens a fresh live draft and hides prior matches until explicitly selected; it does not erase shared requests, receipts or irreversible ledger transactions. Recorded evidence remains accessible separately.

### Vercel runtime failure found before readiness claim

Deployment 78c3487 built but all API routes returned 500 FUNCTION_INVOCATION_FAILED. Vercel runtime logs identified ERR_REQUIRE_ESM: @xrplf/isomorphic/dist/utils/shared.js required @noble/hashes/utils.js. Versions in the lockfile: xrpl 5.2.0, @xrplf/isomorphic 1.0.2, @noble/hashes 2.4.0. Importing the entire XRPL SDK for an address check, and indirectly through the receipt commitment helper, introduced the incompatible dependency graph. Hosted intake now screens address syntax only, then verifies the exact account through validated account_info before matching. Native wallet/address validation remains in the local SDK adapter. Receipt hashing imports the SDK-free canonical helper. A startup test disables require(ESM) to cover this deployment boundary. This is our integration failure with a specific dependency/runtime combination, not a fabricated protocol transaction failure.

Public recovery verified at 09:59 UTC: state, intake and market all HTTP 200 after fix 2645c72; two native records and one match retained. Chrome verified Lender/Borrower/Admin order, Track 1 labels, Reset without the old dropdown, admin no chatbot, 3/7 progress and manual Accept/Decline. Reset preserved shared records. Final screenshot review moved progress before secondary details and aligned the track banner. The SDK/runtime reflection was accepted HTTP 200 at 09:59:00 UTC; 635 sent (625 historical hook, 10 reflections), zero buffered.

### Final environment gate and per-round receipt register, September 13 12:06 Paris

Fresh ledger observations 91191 and 91211 on network 4001, rippled 3.4.0-rc1, confirmed SingleAssetVault, LendingProtocol AND LendingProtocolV1_1 enabled. This is not V1-only. In response to the founder's renewed V1-only requirement, new cycle setup, LoanBrokerSet/LoanSet preparation, fresh signatures and new sends now require a fresh V1-only check. The old mentor trial flag permits observation/recovery only; it cannot bypass origination gating. Existing validated execution is reconciled before any send gate. No replacement endpoint was invented; mentor confirmation remains required. The published Ripple V1.1 guide states the closed-ended lending restriction.

The frontend shows the actual network condition, includes a Check again control and keeps drafts/review/evidence available. Reset opens an empty live selection and retains ledger/receipt records. A new Receipts section groups IDs and SHA-256 commitments by original round, AI round 1708833C, match round 131184CE and IVM discovery. All six receipt hashes were checked against the official Recognitium authority successfully in this session. Links use https://api.recognitium.com/v1/verify/receipt/<id>, not an invented verification domain. Chrome preview checked all four groups and the network warning. 69 tests pass including V1.1 gating even with read/recovery allowed and SDK-free hosted startup.
## September 13: single-workspace audit and narrative cleanup

Removed the duplicate footer navigation and all customer links to the operator console. Saved rounds and Transactions & evidence stay inside the same frontend; the full six-step native-cycle evidence remains accessible. Added a short header narrative and receipt-stage explanations. Unsealed availability/request/admin records remain explicitly unsealed. Fixed matching amount formatting to retain six XRP decimals, a missing network retry control after connection failure, misleading submission wording, and the stale new=1 query after saving.

Chrome against the hosted-boundary preview using the real shared backend: rejected amount 0; reviewed and saved synthetic request 6AB91026 for 101.000001 test XRP / inventory / 30 days; started Admin review and declined it; Borrower displayed Request declined. Reset retained saved records and opened a fresh selection. No loan was signed or funded by this audit. Browser control timeouts were reconciled before retrying.

Also checked role navigation, simple-form shortcut, edit/review, matching refresh, Saved rounds selection, completed round 1708833C transaction history, exact agreement dialog and close, in-page receipt navigation and refresh. All six Track 1 stages remained in the completed round. This is bounded UI verification, not a claim that every mutation or external explorer was manually exercised. New availability/match approval/receipt issuance/funding were not rerun; prior match has expired. Backend automated coverage remains separate.

Remaining priority: resolve the V1-only policy versus the advertised V1.1 endpoint, then run a fresh accepted match through the controlled operator bridge with exact new loan approvals. A browser-only execution controller is not implemented. IVM discovery and sealing are operator-assisted; KYC is not implemented. Do not present saved completed cycles as a new matched end-to-end run.

### Synthetic identity commitment, September 13
Added an explicitly synthetic identity-to-wallet example in Admin. The read-only preview is bound to synthetic-identity-preview and a published demo wallet; its public fixture salt/data are not suitable for personal data. It is unsealed and does not amend any historical agreement. New native preparations now include a separately salted fictional profile/request/wallet commitment in the private document and reference it in the agreement hash that both LoanSet signatures cover. Service creation and subsequent content checks reject changed request, wallet or opening. Existing runs remain unchanged; no new loan or identity receipt was issued. Chrome exercised Show test commitment and verified the unsealed label/hash. Existing 69 tests passed plus the new identity-binding test; hosted build passed. No real KYC provider or real identity verification is claimed.

### Pitch deck prepared
Seven-slide editable presentation and timed speaker notes saved in docs/pitch. It covers the synthetic supplier use case, receipt/ledger architecture, observed native evidence, AI approval boundary and three concrete developer findings with proposed fixes. The deck distinguishes completed native cycles from the pending fresh matched flow, and keeps cryptographic content checks, receipt authority and ledger validation separate. No event submission or participant manual report was generated.
Pitch layout revision: enlarged architecture boxes, checked the corrected slide in Chrome, and added a standalone browser presentation with keyboard navigation. Updated editable file: docs/pitch/Recognitium-Pitch-v2.pptx. Browser file: docs/pitch/Recognitium-Pitch.html. Personal developer report awaits participant-authored text.

### Public network proof and fresh verification, September 13
Added an explicit event Devnet connection observation with check time, network ID, validated ledger index/hash, server build, explorer link and an independent JSON-RPC request. New-loan eligibility remains a separate status: V1.1 is still enabled and the requested V1-only gate still blocks origination.

Fresh online verification of evidence/ai-request-1708833c.json passed: exact content, both signatures, receipt-chain consistency, both official receipt authority records, funding and all saved native-cycle transactions matched the event ledger. A direct ledger RPC independently returned validated=true for ledger 92108 with hash 0B5DF1D354D753AE604151F9F51C4902072287A994AF44B5BBBFB83467A85A9A, matching the frontend observation. This checks the existing completed cycle, not a new availability-matched run. Pitch and one-page participant-dictated PDF opened through the Chrome extension.
