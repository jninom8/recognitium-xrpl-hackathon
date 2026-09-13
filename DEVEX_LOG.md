# Recognitium developer-experience log

**Team reading page: [Unified developer journey](docs/DEVELOPER_JOURNEY.md).**
This file retains detailed technical observations and earlier checkpoints;
the journey page gives their current outcome in chronological order.

## UX-002: start with the person's goal, keep the historical loan in an example

- September 12, 2026, 19:39–19:49 UTC. Founder said the app remained difficult
  for someone without an economics background. Replaced the initial workspace
  with two plain-language choices: Request funding and Provide funding.
  The former opens the request form; the latter explains interest, possible
  loss and unavailable funds before linking to the completed lender example.
- Removed role/source switches from the normal path. Team review has its own
  entrance; recorded data is an explicitly labelled example. A new visitor's
  workspace no longer shows the previous shared 100-XRP loan. Normal loan
  display requires a matching authenticated intake request ID; this display
  rule does not claim multi-tenant identity or replace backend authorization.
- Plain request language explains amount, purpose and preferred repayment time.
  Review says that submitting is not accepting a loan. REVIEWED displays
  Waiting for an offer; the missing fresh offer bridge remains explicit.
- npm test: 32 passed, zero failed, 6,128.7006 ms. New regression covers an empty
  visitor, wrong request ID, matching request ID, and recorded/live separation.
  JavaScript syntax checks passed after copy edits and formatting.
- Chrome DOM checks verified the entrance and direct request form; the review
  screenshot preserved 250.000001 test XRP and a 60-day preference. No code was
  entered and no request/loan/receipt created. Screenshot capture later timed
  out; reconnect reported Unable to load browser request-header policy and the
  retry also timed out. Final mobile QA remains unverified, not an XRPL finding.
- Hook flush 19:49:08.635 UTC: HTTP 200, 11 observed events delivered,
  380 cumulative, zero buffered. No generated participant report submitted.

## ALIGNMENT-001: complete challenge PDF review and fresh native evidence check

- September 12, 2026, 19:28 UTC. Read all ten pages of XRPL Lending Protocol
  Hackathon Challenge.pdf directly from the founder's Downloads ZIP. The ignored
  reference copy matched byte-for-byte; SHA-256:
  43633187e64f8c68817e3bb88de0bc7ab226217a779c239b73bb989e68fe8f76.
- Page 3 lists six Track 1 gates: vault, lender deposit, accepted broker loan,
  borrower drawdown/repayment, capital plus yield withdrawal, native refusal.
  Existing recorded transactions cover all six. LoanSet itself funds the borrower;
  no separate LoanDraw is claimed. Page 5 distinguishes Vanilla from adding
  another ledger primitive. The Recognitium receipt integration is off-ledger.
- Command: npm run verify -- evidence/synthetic-supplier-001.json --online
  --mentor-confirmed-open-ended. Exit 0: contentHash consistent, signatures
  both-valid, receiptChainHash consistent, receiptAuthority
  online-authority-record-verified, xrplValidation validated-success.
- This was read-only verification, not a new cycle. Fresh request-to-loan flow,
  independent reproduction, live rehearsal and participant-authored submission
  materials remain distinct unfinished gates. Page 8 weights feedback 40%,
  technical execution 30%, use case 20%, presentation 10%.
- Hook flush at 19:28:42.046 UTC: HTTP 200, seven observed events accepted,
  366 cumulative and zero buffered. No generated participant report submitted.

## CUSTOMER-001: founder feedback turns the operator page into a customer flow

- September 12, 2026, 17:17–17:57 UTC implementation/checkpoints. The founder
  pointed out that the browser page exposed admin/evidence information without
  the requested customer interface. The earlier diagram incorrectly suggested
  a separate finished customer experience existed. The terminal console was
  never the page the founder had been viewing.
- Root / now offers borrower requests, plain-language loan tracking, lender
  position and broker inbox. Native/evidence controls moved to /operator.
  Customer state preserves funding despite a missing receipt and does not
  count a refused deposit as confirmed capital.
- Added authenticated synthetic intake using exact drops, requested days and
  purpose enums, with no private-document or personal-data fields. Borrower
  creates; broker reviews. Client UUID plus immutable digest deduplicates
  retries; revision checks protect review. Records persist in ignored data/intake.
  These actions have no ledger/receipt dependencies and do not constitute
  underwriting, loan approval, funding or a receipt.
- The initial test run passed 30/31: immediate restart returned 409 after an
  earlier HTTP 200. Code inspection found success sent before writer lock
  release. Moved response after cleanup; regression now asserts acknowledged
  writes have no remaining writer lock. Initial corrected run: 31 passed, zero
  failed, 4,499.2842 ms. This was an application lifecycle defect, not an XRPL defect.
  Final review corrected activity wording for refused deposits/withdrawals and
  the request button after opening demo access. npm test passed 31/31 again at
  17:53 UTC, 5,649.7976 ms. JavaScript syntax checks and TypeScript build passed.
- Chrome checks: borrower dashboard, lender redemption, agreement costs,
  request wizard, 250.000001-XRP / 60-day requested-window review and access
  gate. A 0.5-XRP input produced the minimum-amount message. Mobile at 390x844
  measured page width 375px and request-dialog width 341px. Browser automation
  stopped before access-code entry; no real submission, approval or loan.
- Isolated HTTP tests used synthetic role values and real local persistence:
  unauthorized/wrong-role/cross-origin actions refused; simultaneous identical
  intake calls reconciled to one record; review survived a real server restart;
  retry preserved its version. This is not a teammate reproduction or completion
  of the remaining funding/persistence/receipt-loss failure matrix.
- Hook flush at 17:19:31.984 UTC: HTTP 200, 317 cumulative, zero buffered.
  At 17:43:40.909 UTC, 14 more real events were accepted: 331 cumulative,
  zero buffered. At 17:53:28.640 UTC, HTTP 200 accepted 16 more: 347 cumulative,
  zero buffered. No fabricated feedback or generated participant report sent.
- Handover check found no .env or configured role codes on this PC. Added
  npm run demo:access: creates separate random codes in ignored .env, never
  prints them, never copies a wallet/service key, and never overwrites an
  existing file. Running it twice preserved the first file's SHA-256 hash.
  Restarted the idle local server with the existing mentor trial and read-only
  health flags. Private read-only checks returned HTTP 200 for borrower and
  broker, both seeing the same backend and an empty inbox. No intake was created.
- Next: reviewed intake to fresh native agreement/run, exact approvals, durable
  MCP issuance handoff and a two-person rehearsal. Browser wallets and customer
  deposit/repayment controls remain pending.

## SYNC-001: shared UI/console state, two-client checks and wallet clarification

- September 12, 2026, evening integration. Connected the original white interface
  at port 3000 to typed public request/cycle projections, backend instance and
  revision, action eligibility and service health. Console and browser consume
  the same `/api/state`. Published real evidence is an explicit read-only source;
  the earlier port-3100 concept remains simulated. Agreement commitment bytes
  and original native evidence bundles were not changed.
- `npm test`: 27 passed, zero failed, 3,818.7502 ms. Initial new tests caught an
  incorrect parent path to the compiled module's public bundle and use of strict
  agreement canonicalization on optional UI fields. Corrected the bundle path
  and used the serialized public response only for revision fingerprints.
  These were application implementation errors, not XRPL defects.
- Two local HTTP clients observed exact role approvals. Wrong hashes returned
  409; concurrent writes returned success or busy and reconciled on retry.
  External ledger/receipt systems were explicitly simulated. An invalid receipt
  ID reached receipt validation while ledger health stayed unchecked, confirming
  recovery no longer forces a ledger connection. This is not the pending
  concurrent funding-submission test or a second person's reproduction.
- Chrome: desktop 1440x1000 and mobile 390x844. A real mobile evidence-text
  overflow measured 510px; the corrected layout measured 375px in the 390px
  viewport. A real idle backend stop, with an empty receipt-recovery review open,
  retained the recorded redemption and disabled confirmation. After restart,
  the changed instance invalidated the review. No capability was entered or
  action submitted. This was not termination during transaction persistence.
  Final browser review found the public bundle's key order placed late-payment
  recovery before its original refusal. The UI now sorts native steps by ledger
  index and uses readable operation labels; evidence bytes remain unchanged.
- Read-only health at `2026-09-12T16:46:48.079Z`: network 4001, rippled
  3.4.0-rc1, ledger 70504, 99 ms. The public receipt authority endpoint also
  responded. These observations establish availability, not new verification
  of all historical transactions/receipts or direct issuance permission.
- Re-read workshop pages 10/12 and the event wallet resources. The completed
  cycle uses three backend-managed xrpl.js test accounts. No browser wallet is
  connected. Current official XRPL Connect adapter documentation was checked;
  custom-network and co-signed native LoanSet compatibility remains untested.
  [Wallet explanation](docs/WALLETS.md); [two-PC handoff](docs/TEAM_TESTING.md).
- Hook flush at `2026-09-12T16:58:39.386Z`: HTTP 200, 17 additional captured
  events accepted, 293 cumulative, zero buffered. Version 2.4.0 registration and
  real accepted delivery remain observed. No fabricated event or participant
  manual report was submitted. Raw hook data and identities remain ignored.
- No new ledger transfer, metered receipt, IVM publication or public deployment
  occurred. Fresh-run isolation, durable external MCP issuance preparation,
  four bounded failure cases and a teammate's own verification remain pending.

## DESIGN-001: researched frontend direction and bounded team handoff

- September 12, 2026, completed at 16:05 UTC. Read OpenFX's public payment-service-provider
  page and styles, then inspected the rendered page through Chrome after the
  founder connected the extension. Public source snapshots remain in ignored
  `reference/openfx/`; no OpenFX code, logos or font assets were imported.
- Created an original three-view design concept, visibly labelled simulated,
  plus [the design/implementation brief](docs/FRONTEND_DESIGN.md) and
  [the fresh-clone/recovery guide](docs/REPRODUCTION_AND_RECOVERY.md).
  The existing live app, native evidence, wallets and manual participant report
  were not changed. No loan, metered receipt or IVM publication occurred.
- Re-read shared types, server/receipt interfaces, journal and crash tests.
  Documented existing coverage separately from four proposed extensions:
  concurrent valid HTTP submissions, file-persistence crash boundaries, remote
  receipt issuance followed by response loss, and partial-history expiry recovery.
  Those new cases have not been implemented or passed by this planning work.
- Preview: `npm run design:preview`, loopback port 3100, static files only.
  Chrome checked all three views and the review/funded/changed-copy/recovered
  fixture states. Changed-copy rejection retained the funded heading; recovery
  showed a receipt attached to the same illustrative execution. These are UI
  presentation checks, not state-machine or native-ledger tests.
- Inspected desktop at 1440x1000 and mobile at 390x844. Mobile document width
  was 375px, within the viewport. Keyboard Tab reached the next scenario control
  with visible solid focus outline. Chrome's error log was empty at the check.
  One full-page screenshot request timed out; a normal viewport capture worked.
  This browser-tool observation is not an XRPL defect.
- `node --check` passed for the prototype and preview server; `git diff --check`
  passed. Static routes returned HTTP 200; `/api/state` and a normalized `.env`
  request returned 404. No live API route is exposed by the concept server.
  Calculated selected text contrast ratios: ink/white 16.17, muted/white 5.84,
  white/action-green 6.48, amber/tint 5.99, red/tint 6.27, muted/surface 5.52.
  These checks do not constitute a full accessibility audit.
- Hook delivery at `2026-09-12T16:01:28.638Z`: HTTP 200, 13 additional events
  accepted, 249 cumulative, one buffered. At `16:05:15.170Z`, the next flush
  accepted two more: 251 cumulative, zero buffered. Counts reflect actual
  installed-hook delivery; no synthetic feedback event or manual report was sent.

## INTEGRATION-001: context review identifies the next product gate

- Public Notion refreshed at `2026-09-12T15:27:15.078Z`: 174 blocks, two chunks,
  cursor exhausted. Scoring remains 40% feedback, 30% XRPL execution, 20% use case
  and 10% presentation. Sunday freeze 12:30 and deadline 13:00; Notion still says
  four-minute demo/two-minute Q&A. The slide-duration conflict remains unresolved.
- Read challenge slides and current app/API source again. Native/receipt gates
  are complete. The starter UI lacks the full lifecycle. Code inspection found
  the runtime cycle property absent from AppState's type, fixed run IDs, and
  direct receipt issuance still unavailable. These are integration work items,
  not newly tested runtime failures or protocol defects.
- Recommended next checkpoint: integrated three-view demo, fresh approved
  rehearsal, teammate reproduction and participant-authored feedback. More
  native features follow that checkpoint. [Handoff](docs/FRONTEND_CONTRACT.md).
- Hook flush at 15:29:01.010 UTC: HTTP 200, eight more captured events accepted,
  232 cumulative, zero buffered at that observation. No metered receipt or native
  transaction was made during this context/priority review.

## CAP-001: selected native cap experiment passed

- Reviewed implementation/evidence commit `5807683` pushed to the public main
  branch. [Its GitHub CI completed successfully](https://github.com/jninom8/recognitium-xrpl-hackathon/actions/runs/34701664050).
  Native verification below used a separate script on the same development
  machine/endpoint; a teammate's live reproduction is not claimed.
- Final local publication check: `npm test`, 21 passed, zero failed,
  3,213.9404 ms. Synthetic cap JSON was checked for credential/blob fields:
  zero found. Original lending evidence and participant report were unchanged.
  Hook flush at 15:13:57.445 UTC returned HTTP 200, 10 more events delivered,
  219 cumulative accepted, zero buffered at that observation.
- Event network 4001, rippled 3.4.0-rc1, stable xrpl.js 5.2.0. New working Wi-Fi.
  `node dist/scripts/native-cap-test.js --execute --mentor-confirmed-open-ended`.
  Separate vault, existing synthetic-role test wallets, no new loan or receipt.
- Experiment started 15:07:22 UTC. Transaction ledger close times span
  15:07:31 to 15:08:01 UTC; evidence export completed 15:09:32 UTC.

| Step | Ledger | Observed result |
|---|---|---|
| Create vault with 10000000-drop cap | 68519 | tesSUCCESS |
| Initial 5000000-drop deposit | 68521 | tesSUCCESS |
| Competing lender deposit, 5000000 drops | 68522 | tesSUCCESS |
| Competing borrower deposit, 5000000 drops | 68523 | tecLIMIT_EXCEEDED |
| Deposit one further drop | 68525 | tecLIMIT_EXCEEDED |
| Reduce cap to 9999999 drops | 68527 | tecLIMIT_EXCEEDED |
| Withdraw full 10000000-drop principal | 68529 | tesSUCCESS |

- Independent accounts' deposits were dispatched concurrently but validated
  in consecutive ledgers. Do not claim same-ledger contention was tested.
  The cap stayed at 10 XRP; refused deposits moved no principal. The one-drop
  refusal left the vault state unchanged. Total network fees: 2000072 drops,
  including VaultCreate's 2000000-drop fee. Owner reserve is separate.
- Final vault pseudo-account balance independently read as zero. The empty
  experimental vault remains on-ledger. The original lending vault's full state
  matched its pre-experiment snapshot.
- The runner initially failed its final assertion because empty AssetsTotal
  and AssetsAvailable fields were omitted, rather than serialized as "0".
  After confirming account balance zero, default-zero handling was corrected.
  Rerunning recovered all seven identical journaled hashes without new sends.
- Independent read-only check at `2026-09-12T15:11:24.791Z` passed:
  `node dist/scripts/verify-cap-test.js --mentor-confirmed-open-ended`.
  Checks include signed transaction hashes, fresh results/metadata, historical
  vault snapshots, returned principal and baseline vault preservation.
- [Public synthetic test evidence, including all transaction hashes](evidence/native-cap-001.json).
  Expected refusals are positive protocol evidence, not fabricated bugs.
- Hook at 15:08:57.885 UTC: HTTP 200, 22 additional captured events delivered,
  209 cumulative accepted, zero buffered. Participant report remains untouched.

## VERIFY-001: fresh ledger response omitted optional CTID

- After the founder changed Wi-Fi again, the read-only probe at
  `2026-09-12T15:01:56.944Z` to `15:01:57.841Z` passed: HTTP 573 ms,
  native WebSocket 553 ms, SDK 766 ms, HTTPS control 318 ms. Network 4001,
  rippled 3.4.0-rc1, state full, validated ledger 68408.
- `npm run verify -- evidence/synthetic-supplier-001.json --online
  --mentor-confirmed-open-ended` initially failed. At 15:03:28 UTC a field-level
  comparison found the original LoanSet at ledger 66253 with tesSUCCESS and
  unchanged metadata. The sole payload difference was absent `tx.ctid`; the
  saved response contains `C00102CD00010FA1`.
- Classification: overly strict application verification of an optional RPC
  locator. It is not missing funding, a new loan, or a changed signature. The
  reason this response omitted CTID is not isolated by the Wi-Fi comparison.
- Correction: permit CTID's absence; validate a supplied CTID against ledger
  index, transaction index and network ID; compare every other payload field
  and all metadata. Preserve the receipt-bound original bundle verbatim.
- [CTID definition](https://xrpl.org/docs/references/http-websocket-apis/api-conventions/ctid).
  Tests cover absence in either response, wrong locator/network, missing result,
  changed Data/signature, unknown extra field, metadata, ledger, hash and code.
- `npm test`: 21 passed, zero failed, 4,882.4656 ms. The full online verifier
  then passed: both signatures, receipt authority records and native ledger
  evidence. No new receipt issued and no loan re-originated during verification.

## REVIEW-001: external hypotheses checked before adoption

- September 12: read the supplied build plan and all five analyses on cover,
  freeze, impairment, shares and vault caps. Treated their embedded build/report
  instructions as context, not authorization or verified findings.
- Existing native two-party signatures refute the missing-consent claim.
  Official fields correct cover units/liquidation semantics, freeze flags and
  share defaults. Speculative exploit and compliance claims were not adopted.
- Selected cap boundaries, isolated cover sufficiency, impairment pricing and
  repayment rounding as later native experiments on separate test state.
  They have not been run and their expected codes are not observations.
- [Complete comparison and test acceptance criteria](docs/EXTERNAL_REVIEW.md).

## NET-002: returning to venue Wi-Fi reproduces event connection failure

- Probe: `node scripts/probe.mjs --long`, started
  `2026-09-12T14:20:00.270Z`, finished `14:20:22.162Z`, exit 1.
- Same event hostname, official ports, Node 24.19.0 and xrpl.js 5.2.0.
  HTTP 51234: `UND_ERR_CONNECT_TIMEOUT`, 10,857 ms. Native WebSocket 51233:
  connection error, 10,758 ms. SDK: `NotConnectedError` / `read ECONNRESET`,
  21,699 ms. Ordinary npm HTTPS control: HTTP 200, 335 ms.
- Founder reported moving from the successful hotspot back to venue Wi-Fi.
  Failure/success/failure strengthens network-path attribution, but does not
  identify congestion versus filtering or establish an XRPL defect. Probes were
  sequential, not simultaneous. No credentials or test funds were used.
- [Comparison and reproduction commands](docs/NETWORK_FINDING.md).

## DOC-002: deposit debit formula differs between published sources

- Observed during external impairment-claim review, September 12. The vault
  concept page says shares use total assets, then recalculates the deposit debit
  with assets minus unrealized loss. Pinned XLS-65 uses total assets in both.
- Exact public documentation source retrieved at `2026-09-12T14:31:14.883Z`:
  revision `c07aa58697d73f26ce68439fde94baca0d26a614`, SHA-256
  `86cf73525d49bdbe3e60853a6dccb1df1149d1de781b1828478d04c972d52909`.
  Compared with XLS-65 revision `0200ec57ec70836be04eee436a8e9e9a92e67989`,
  section 3.1.7.2.1. Source files remain ignored, links are public.
- Classification: reproduced documentation discrepancy. No nonzero-loss
  deposit was executed. The external text's proposed exploit is not proven;
  the earlier real zero-loss cycle cannot resolve this question.
- Proposed clarification: synchronize the formulas and identify the behavior
  of the event build. Selected a controlled two-holder impairment test with
  actual shares/debits and ledger time, subject to connectivity/new loan approval.
- [Source comparison and limits](docs/EXTERNAL_REVIEW.md#documented-deposit-formula-discrepancy).

## RECOVERY-002: actual process termination, simulated external systems

- Added two test-only child-process scenarios. After the simulated remote
  ledger durably accepts submission, kill the child before local acknowledgement;
  separately kill it after validation lookup and before local result storage.
- In both, observe the child PID's exit, verify the stale lock belongs to that
  child, then clear only that test lock and start a separate recovery process.
  Concurrent and post-crash writers are refused until this explicit recovery.
- Both recover the unchanged signed blob, approvals, simulated LoanID and
  100000000-drop funding evidence. The simulated remote submission counter stays
  exactly one. Execution receipts are fixtures; no network, native transfer or
  metered call occurs. This tests real process/file persistence with fake external
  systems, not a live ledger crash, disk corruption or power failure.
- `npm test`: 20 passed, zero failed, 9,538.4372 ms. Application source and
  the prior successful native cycle remain unchanged in this round.
- Mandatory hook: `node scripts/hook-status.mjs --flush` at 14:29:35.876 UTC
  returned HTTP 200, sent 18 additional existing events, 187 cumulative, zero
  buffered at that instant. No raw hook data or participant report published.

## RECOVERY-001: targeted simulated failures exposed two application issues

- September 12, reviewed after the live cycle while assessing product value
  and next testing priorities. No new ledger transaction or metered receipt.
- Before correction, two added regression tests failed: 16 total, 14 passed,
  2 failed, 5,816.4196 ms. These are findings in our application, not XRPL bugs.
- First failure: a SIMULATED authority lookup outage prevented `advance` from
  looking up an already-validated LoanSet. Fresh receipt verification happened
  before ledger reconciliation. Correction: reconcile the existing signed hash
  first; retain fresh receipt verification before any submission/resubmission.
- Second failure: calling `receiptAgreement` on a signed request moved phase
  backwards to AGREEMENT_RECEIPTED. Correction: an existing agreement receipt
  can be reverified without rewinding signed/funded states. Reverification also
  preserves any unresolved execution-receipt attempt, preventing a stale action
  from reopening metered issuance. This latter condition has an added regression.
- Four scoped tests now cover validated funding during authority outage, no
  state regression, continued refusal of new submission during authority outage,
  and preservation of unresolved execution issuance. The successful recorded
  native cycle remains unchanged and labelled separately from these simulations.
- After correction: `npm test`, 18 passed, zero failed, 5,742.5857 ms.
- Hook flush at 14:05:52 UTC: HTTP 200, 167 cumulative accepted events,
  zero buffered at that observation. No fabricated protocol report submitted.

## SDK-001: mentor beta.1 update checked against the working stable cycle

- Founder relayed the mentors' xrpl 5.2.0-beta.1 update. At 13:36:23 UTC,
  a full public Notion refresh (174 blocks, two chunks, exhausted cursor) still
  returned stable for Track 1 and beta.0 for Track 2. The publication/cache
  explanation is unresolved; do not claim the mentors gave incorrect guidance.
- Actual npm package diffs show beta.1 fixes beta.0 counterparty/sponsor signing
  prefixes. Our installed stable 5.2.0 already includes those signing changes.
  Beta.1 additionally has closed-ended vault models absent from stable.
- At 13:38:28 UTC an isolated candidate check reproduced the real LoanSet hash,
  verified both signatures, rejected changed Data under both signatures, and
  reproduced all eight other native transaction hashes with BOTH SDKs. This is
  offline compatibility evidence, not a second live-funded cycle.
- Decision: keep the validated stable Track 1 application. Candidate packages
  remain ignored and separate. No new funds moved or approval bypassed.
- Hook delivery at 13:40:12 UTC: HTTP 200, 150 cumulative accepted events,
  zero buffered. This SDK investigation remained inside the active capture.
- [Full comparison, source timestamps and reproduction commands](docs/SDK_UPDATE.md).
  Suggested improvement: a timestamped network/SDK/codec compatibility matrix
  with a short explanation of what each update changes. This note is based on
  real observations; it is not the official participant-written feedback report.

## LIVE-001: mentor-guided native origination succeeded

- September 12, network 4001, rippled 3.4.0-rc1, stable xrpl.js 5.2.0.
  Same event endpoint, hotspot transport, explicit mentor-authorized open-ended
  trial. Enabled V1.1 did not prevent vault/broker creation or this LoanSet.
- Founder approved both synthetic roles and exact agreement/transaction hashes.
  LoanSet `54A285546C2F2A4374C698E2EA00CC82778F408163D30C49898A28B8C4FB75FA`
  validated `tesSUCCESS` at ledger 66253. Borrower AccountRoot delta:
  100000000 drops (100 test XRP). No separate draw transaction.
- Direct Recognitium receipt issuance returned HTTP 403. The authorized hosted
  MCP sealed the agreement once (1 tick), receipt
  `DG-05926b4f9e004086811e36045a5ae5a2`; the application independently checked
  commitment/chain consistency and the official receipt lookup before signing.
  Execution receipt `DG-e3db6da409604aea9e120f3f8a9ad01f` cost 1 tick and was
  attached after validated funding. No retry of the denied direct issuance.

## LIVE-002: available liquidity refusal, then late-payment recovery

- With 200 test XRP deposited and 100 lent, VaultWithdraw of 200 test XRP
  validated `tecINSUFFICIENT_FUNDS`:
  `91155FEB49C6029CDAA0A63D360A26203B5D95299FD57B2EB17BBFDEAC76333E`.
  Vault state was identical before/after; available assets were 100000000 drops.
  This is expected protocol protection, not a fabricated bug.
- `npm run cycle -- repay --mentor-confirmed-open-ended` submitted normal
  LoanPay for stored debt 100000020 drops. It validated `tecEXPIRED` at ledger
  66325, hash `4B4FBAEAC1897449A0551DC2156F18BEE795D5DD531FB366988BF686132E4421`.
- Cause: the 60-second payment due date had passed during the interactive
  evidence/receipt workflow. XLS-66 section 3.11.4 documents `tecEXPIRED` for
  late payments without `tfLoanLatePayment`; installed SDK exposes this flag
  as 0x00040000. This is application scheduling friction, not connection failure.
- Correction: preserve the conclusively refused transaction and use a separate
  durable `repay-late` journal with the late-payment flag. Only this confirmed
  refusal permits the new payment; unresolved submissions never do. This demo's
  approved late fee and late interest rate are both zero. The corrected call
  completed successfully; final withdrawal and measured yield are checked next.
- Developer lesson: a 60-second loan plus manual verification can exceed its
  due date. Show ledger payment status and support explicit late payments in
  examples. Keep actual refusal and recovery visible in the journey.

## HOOK-004: continued runtime delivery

- At 13:30:26 UTC, a further 24 existing captured events were accepted with
  HTTP 200: 130 cumulative, zero buffered. This includes ongoing live-cycle,
  recovery, verification and implementation activity selected by hook filters.

- Identity audit: display name Recognitium, normalized team `recognitium`,
  consent recorded 11:05:54 UTC, earliest retained event 11:11:29 UTC. All
  106 sent records agree with this team. No identity/invite values exported.

- At 13:18:08 UTC, `node scripts/hook-status.mjs --flush` delivered 62 existing
  captured events, HTTP 200; cumulative accepted events 106, buffer zero.
  Hook version 2.4.0, project hooks registered. No invented events or manual
  participant report submitted. Raw logs, invite and identity remain ignored.

## LIVE-003: completed repayment, withdrawal and independent reproduction

- Corrected late LoanPay validated `tesSUCCESS`, ledger 66381,
  `36E9486F270C529802A27D66EBAD42AEA5D5F58985DEC20F04695ECC3E07DE1E`.
- VaultWithdraw validated `tesSUCCESS`, ledger 66407,
  `D6B0DE03F46ED7AC320079B05366331F05048C9F49D09D22D6EFA909DA215C72`.
  Actual proceeds 200000020 drops, deposit 200000000, realised gross interest
  20 drops. Withdrawal transaction fee 12 drops, separately reconciled.
- `npm run verify -- data/exports/synthetic-supplier-001.json --online
  --mentor-confirmed-open-ended` passed: both signatures valid, content and
  receipt chain consistent, official authority records verified, all saved
  native transactions matched fresh validated XRPL lookups.
- Public-safe synthetic bundle retained under `evidence/`. A recursive export
  field check excluded seeds, secrets, signed blobs, identity/invite fields.
  The synthetic document text was reviewed before copying. No source deck,
  private company document, wallet or raw hook log is published.

## BUILD-001: real SDK install and endpoint rechecks

Resolved transport blocker: hotspot comparison at 12:23 UTC succeeds on the same
endpoints and SDK. See [controlled network investigation](docs/NETWORK_FINDING.md).
Venue path strongly implicated; congestion versus filtering remains unisolated.
The separate 443 faucet-only certificate is not the advertised-port blocker.

- September 12, 2026, fresh implementation session; integration lead with Codex.
- Node `v24.19.0`, npm `11.17.0`. `npm view xrpl version --fetch-retries=0
  --fetch-timeout=12000` returned `5.2.0` outside the sandbox. The first attempt
  returned `EACCES` inside the network sandbox; this is host policy, not an XRPL bug.
- Installed exact `xrpl@5.2.0` and explicit codec/keypair versions `2.11.0`/`3.1.0`.
  The initial xrpl installation reported 17 packages in 39 seconds, zero audit
  vulnerabilities. Source uses TypeScript with the same JavaScript SDK recommended
  on workshop p.9; the event matrix specifies stable for Track 1.
- Reproduction: `node scripts/probe.mjs` outside the sandbox. At
  `2026-09-12T11:19:42.608Z`, HTTP server_info failed in 10,914 ms with
  `UND_ERR_CONNECT_TIMEOUT`; native WebSocket failed in 10,777 ms. No accounts
  funded and no signed transaction submitted.
- After mentor feedback, `node scripts/probe.mjs --long`, at
  `2026-09-12T11:30:30.720Z`: HTTP failed in 10,810 ms with
  `UND_ERR_CONNECT_TIMEOUT`; native WebSocket failed in 10,725 ms; actual
  `xrpl.js@5.2.0` failed in 19,248 ms with `NotConnectedError: read ECONNRESET`.
  HTTPS 443 control `https://registry.npmjs.org/xrpl/latest` returned HTTP 200,
  version 5.2.0, in 318 ms. Fetch's connection timeout fired before the larger
  overall deadline; simply increasing that deadline did not solve connectivity.
- Founder relayed mentor's explanation that crowded venue Wi-Fi is responsible
  and this should be recorded in the developer journey. That explanation is
  attributed; the measurements do not distinguish port filtering, congestion,
  upstream reset or event-server availability. Hotspot comparison requested.
- Local exact JSON is under ignored `data/probes/`. Endpoints remain those in
  the event Track 1 brief; no switch to generic Testnet or Track 2 was made.
- Proposal: supply the same health command in onboarding with transport/SDK
  timings, amendment checks and a venue/hotspot comparison, plus mentor-confirmed
  port requirements or a supported 443 endpoint if nonstandard ports are blocked.

## BUILD-002: verified mandatory hook runtime and delivery

- Hook 2.4.0, already consented, project-local and trusted through supported UI.
- Live lifecycle flush: 4 events accepted at `2026-09-12T11:15:55.330Z`.
- `node scripts/hook-status.mjs --flush` uses the installed hook's own buffer API.
  At `2026-09-12T11:30:36.930Z`, it reported `ok:true`, `sent:14`, `remaining:0`,
  `status:200`. Total sent became 18. Later counters show actual tool_result and
  package_install capture. This is more than registration or fabricated smoke data.
- Raw hook records, invite, identity and participant mapping remain ignored.
  The helper reports its own check time; upstream `last_flush_at` reflects earlier
  lifecycle flushes. Automatic capture is distinct from the human-written report.

## BUILD-003: SDK co-signing and local recovery checks

- `npm test` compiles with exact TypeScript 7.0.2 then uses Node's test runner.
  Expanded run: 11 tests, 11 passed, 0 failed; Node reported 4,467.7937 ms.
- Actual stable SDK `signLoanSetByCounterparty` is available. Independently
  verifying the broker and borrower signing encodings succeeds; changing Data,
  principal, counterparty, NetworkID, fee or LastLedgerSequence invalidates both.
  These are real local signatures, not evidence of an event-ledger LoanSet.
- The installed SDK validators accept all seven native transaction builders.
- Explicit simulated tests reject changed document/amount/network/expiry/metadata,
  wrong approval hashes and missing agreement receipts. A simulated submission
  reset followed by restart, validated funding and receipt outage retains the same
  signed transaction and recovers the missing receipt without another origination.
- API tests show disconnected state, reject unauthenticated/wrong-role writes and
  cross-origin approval, and do not serve wallet files. These checks are scoped to
  the local prototype, not a production authentication/security audit.
- Initial `tsx` invocation failed on this host with `ERR_SYSTEM_ERROR:
  uv_os_get_passwd returned ENOMEM`. Removed the unnecessary runtime dependency;
  compiling TypeScript and running ordinary JavaScript avoids it. TypeScript also
  required explicit rootDir and SubmittableTransaction typing; corrected locally.
- Positive SDK behavior: typed native transaction models and a dedicated second
  signature helper are available in the prescribed stable package. No raw codec
  patch or beta substitution was required for local serialization.

## BUILD-004: real Recognitium adapter probe, no lending claim

- Authorized one-tick synthetic hash seal at `2026-09-12T11:31:11Z` through the
  existing MCP. Text: `Recognitium XRPL integration probe v1; synthetic; no loan
  or payment asserted.` SHA-256:
  `5d1f5422917315e16a2b119d91c275b7085af2f56103f6914b3d9a444cbcc10a`.
- Receipt `DG-8ab218c99d844c4a92b0385f87475887`, authority sequence 166320.
  Public GET `/v1/verify/receipt/<id>` returned HTTP 200; historical chain_at at
  166320 returned the matching tip. Current service identifies as classical.
- `node dist/scripts/receipt-probe.js` passed against the public API at
  `2026-09-12T11:45:49.483Z`: content consistent, chain hash consistent, official
  authority record online-verified, XRPL validation not applicable.
- The issuance JSON timestamp is an unsafe JS Number if parsed normally. The
  adapter preserves raw wire text and Node 24 JSON reviver source; receipt lookup
  supplies the nanosecond timestamp as a string. A test guards exact preservation.
- A self-consistent fake chain link is not sufficient authority evidence. The
  application additionally retrieves the receipt by ID from the official TLS
  origin and compares its bound fields. Offline verification says online lookup
  required; this does not claim an independent external anchor or key signature.
- No idempotency key is assumed for metered receipt issuance. Ambiguous issuance
  is durable and recoverable by ID; automatic recharging and relending are blocked.

## BUILD-005: advertised Track 1 server has V1.1 enabled

- After the hotspot fixed connectivity, `npm run cycle -- setup` connected,
  inspected the validated Amendments ledger object and stopped before creating
  or funding wallets: `Lending V1.1 detected; Track 1 requires mentor review`.
- Independent read-only confirmation: `node scripts/environment-probe.mjs`,
  `2026-09-12T12:45:35.197Z` to `12:45:36.845Z`, network 4001, server 3.4.0-rc1,
  validated ledger 65683. Both the Amendments object and `feature` RPC report
  LendingProtocolV1_1 enabled and supported. Amendment ID:
  `A360E2BFD775A5B0DCE1C36C16DF31B72735A57584FD163655D2F9564F8E7AC8`.
- SingleAssetVault and LendingProtocol also enabled. The generic workshop's
  reserve amounts do not match this server: live base 10 XRP, increment 2 XRP.
  The adapter uses actual autofill fees and permits VaultCreate's special
  owner-reserve fee within a separate test-only cap.
- Event matrix expectation: custom endpoint serves V1 for open-ended Track 1.
  Official current [closed-ended vault documentation](https://opensource.ripple.com/docs/lending-protocol-v1-1/closed-ended-vaults)
  says V1.1 restricts LoanBrokerSet on open-ended vaults. Existing open-ended
  loans retain servicing paths; it is inaccurate to say every LoanSet or LoanPay
  is categorically disabled on every old open-ended vault.
- Classification: confirmed event-matrix/amendment mismatch, not a witnessed
  on-chain transaction refusal. We have not spent test funds to manufacture a
  predictable failure or claimed that the application's gate is native rejection.
- Asked founder to obtain mentor guidance: V1 endpoint, or coordinated Track 2
  switch including beta SDK and phase acceptance tests. Track remains unchanged.
- Proposed fix: publish an environment preflight checking enabled amendments,
  not just a reachable WebSocket, and keep the event SDK/network matrix current.

Founder subsequently relayed explicit mentor guidance: open-ended lending works
on the advertised endpoint despite the documentation; test it there. A scoped
trial flag now permits V1.1 on event network 4001 without switching Track 1 or
the stable SDK. This is authorization to test, not evidence of ledger success.

Subsequent real trial: VaultCreate, VaultDeposit, LoanBrokerSet and
LoanBrokerCoverDeposit all validated tesSUCCESS (ledgers 66039, 66041, 66043,
66044). The mentor's guidance holds for broker creation on this event server.
The enabled amendment name alone did not predict its behavior; the published
open-ended LoanBrokerSet restriction did not apply in this observed case.

## BUILD-006: local checkpoint

- Latest full local run before publication: 13 tests passed, zero failed.
  Scope includes installed SDK signatures, receipt integrity and authority
  comparisons, state recovery, repeated signed-blob reuse, writer locks and API
  access checks. These are not validated native lending results.
- Mandatory hook at 12:03:55 UTC: HTTP 200 accepted 26 additional events,
  44 cumulative sent, zero buffered at that observation. Automatic capture
  remains active. Official participant report was not generated.

Keep raw observations here. Promote only reproduced, clearly scoped findings
to the final three-page report. Never include wallet seeds, API credentials,
private invoices or unrelated project data.

## Entry template

- ID and time:
- Reporter / role:
- Track, endpoint, exact SDK and server version:
- Category: client libraries / UX / missing primitive / documentation / other
- Attempted action:
- Expected result and source of expectation:
- Observed result, exact code and relevant metadata:
- Minimal reproduction command or transaction link:
- Impact and time lost:
- Workaround:
- Proposed fix:
- Reproduction status:
- Positive behavior worth preserving:

## PRE-001: custom Track 1 RPC did not respond during planning

- Date: 12 September 2026, before implementation.
- Endpoint: `https://lending-hackathon.dev.ripplex.io:51234/`.
- Request: HTTP POST, JSON `{"method":"server_info","params":[{}]}`.
- Tool: Python requests; no xrpl.js installed for this probe.
- Expected: a server_info response from the endpoint listed in the event brief.
- Actual: read timeout after 18 seconds.
- Separate read-only probe: native Node 24.19.0 WebSocket connection to
  `wss://lending-hackathon.dev.ripplex.io:51233` also timed out after 10 seconds.
  No funded account or signed transaction was involved in either probe.
- Classification: untriaged connectivity observation, not a confirmed XRPL defect.
- Next check: compare the same request on the venue network and mentor machine;
  confirm the event endpoint and examine WebSocket connectivity.
- Suggested improvement if reproduced as an onboarding issue: publish a
  one-command health check and verified environment/version matrix.

## Candidate experiments, not findings yet

- First-loss cover field names versus actual behavior.
- Broker/borrower co-signing order and helper availability.
- Insufficient available liquidity versus sufficient total vault assets.
- Accrued yield, realised repayment and withdrawable capital in the UI.
- Wrong network/SDK combination and the resulting error.
- Timeout recovery without duplicate submission or disbursement.
- Documentation/example/explorer differences from validated ledger results.

Do not prewrite expected result codes as if observed. Do not report a missing
feature until checking the current SDK, documentation and a mentor's explanation.

## DOC-001: presentation duration differs between supplied sources

- Date: 12 September 2026, workshop-material review.
- Challenge PDF, page 6: "5 min presentation + live demo" and "3 min Q&A".
- Source: `reference/XRPL Lending Protocol Hackathon Challenge.pdf`.
- The public Notion brief lists four minutes of demo and two minutes of Q&A.
- Source: https://holly-pixie-8e9.notion.site/XRPL-Lending-Protocol-Hackathon-3152f6835886823ab31f01cd9d1f6ded
- Classification: confirmed event-document discrepancy, not a protocol defect.
- Status: awaiting mentor confirmation; neither version treated as superseded.
- Impact: affects live-demo pacing. No measured implementation time lost.
- Suggested fix: synchronize the two sources and announce one current duration.

## EXP-001: withdrawal eligibility versus available liquidity

- Status: designed experiment, not executed and not a confirmed bug.
- Starting observation: the introductory slides, page 12, describe open-ended
  withdrawals as always permitted without a lock.
- The official VaultWithdraw reference separately specifies
  `tecINSUFFICIENT_FUNDS` when liquidity cannot fill a withdrawal request:
  https://xrpl.org/docs/references/protocol/transactions/types/vaultwithdraw
- Experiment: deposit, lend a substantial fraction, then attempt a withdrawal
  within the depositor's share value but above available vault liquidity.
- Record current event-server behavior; do not assume its exact error code.
- UI candidate: show share value and available cash as separate quantities,
  explain the native rejection, then repeat after repayment restores liquidity.
- Feedback target: whether the examples make this distinction easy to discover.
  A correct protocol refusal is positive evidence, not a vulnerability.

## PRE-002: isolated project and hook readiness

- Date: 12 September 2026, before application implementation.
- New Desktop Git repository contains the hackathon-only plan and handoff.
- Hook version 2.4.0 downloaded at revision
  `6b1f4755e1de8520d23f4c9b6e404c6c9c75fe4d`.
- Read-only invite check: organiser endpoint reachable, invite-only event.
- Local status: no identity, hooks unregistered, zero captured/sent events.
- This is setup evidence, not proof that capture works. Plan review precedes
  activation; a real fresh-session event and accepted flush must be checked.

## September 12, 22:28 Paris: shared Vercel demo

- Founder explicitly authorized continuing past 22:00 and deployment. Reviewed the 19-page lending introduction and all 27 workshop pages, alongside the previously reviewed 10-page challenge (56 event pages total). Native Vanilla evidence remains the foundation; hosting adds shared request review.
- Created the separate recognitium-xrpl-hackathon Vercel project and private Blob store in cdg1 on the existing Hobby account. Public URL: https://recognitium-xrpl-hackathon.vercel.app/ . Native wallets, service credentials, private state and hook logs were excluded. Hosted role codes are separate and ignored.
- npm test: 34 passed, 0 failed (4,472 ms). Hosted tests explicitly simulate CAS conflicts and a write accepted before its response is lost. Actual local HTTP tests check role/origin gates and two-client review. No new ledger write or receipt charge.
- First deployed API returned HTTP 500, ERR_REQUIRE_ESM from @xrplf/isomorphic requiring @noble/hashes. Shared intake unnecessarily imported the ledger SDK through a digest utility. Extracted the identical canonical digest into a dependency-free shared module; native tests still pass. Second deployment returned state HTTP 200 and unauthenticated intake HTTP 401.
- At 20:28:28 UTC, real deployed Blob-backed HTTP checks passed: requester create, reviewer list and start-review, requester list, concurrent duplicate retry, wrong-role 401, foreign-origin 403 and native setup 403. Synthetic request request-7583f90f-c95f-4dd7-97f0-96dc0a0a4b8b remains UNDER_REVIEW, revision 2, exactly once. This is author-operated verification, not teammate reproduction.
- Chrome extension verified the public landing and request form. Fresh native agreement creation from intake is still pending; hosted service has no signing endpoint. See [hosted testing](docs/HOSTED_TESTING.md).
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

Re-read all challenge pages and saved Notion judging/submission requirements; live Notion refresh failed. Read-only hosted check confirms zero fresh native bridge runs and the selected 600-XRP request still under review. Audit found missing setup/approval progress, ambiguous freshness, overly generic loan/receipt labels, hidden native-refusal history, an operator selected-run/cycle mismatch, untyped hosted state extensions and an exporter still bound to original data paths. Prioritized fixes, one fresh native cycle, per-run evidence export and participant report ahead of more styling. See [FINAL_INTEGRATION_PLAN.md](docs/FINAL_INTEGRATION_PLAN.md). No ledger action or manual report generated in this audit.

## September 13: shared native progress ready for the fresh request

The hosted state now publishes vault preparation before an agreement exists, per-request cycle mapping, original requested duration versus offered duration, both exact approval states, native refusal history and separate page/publication times. The operator view uses the selected loan's cycle. The exporter accepts isolated per-request run directories while preserving the original evidence path. Local verification: 40 tests passed, zero failed; original evidence export still passes offline verification. Fresh 600 test-XRP setup and funding are not yet claimed. The accelerated 60-second period is an explicit demo counter-offer; exact human approval remains required before signing.

## September 13, 01:05 Paris: faucet sizing and durable recovery

Real observation: each fresh event faucet account held 1,000 test XRP. A 1,200-XRP VaultDeposit for the selected 600-XRP request returned validated tecINSUFFICIENT_FUNDS at ledger 77989, transaction 9B529B451F0137A9B2B6324B1C4D0EFE5FBD226DAEE6A31BEBACA53F7023776E. This was setup sizing, not a connectivity failure or lending-protocol defect. The recovery retained the failed transaction and used distinct journal IDs for a surplus setup-account top-up and corrected deposit. The deposit then validated at ledger 78032; broker and cover validated at 78034/78036. A second process repeated preparation with the same six operation hashes and unchanged agreement/transaction digests. No new LoanSet was signed or funded.

The deployed reviewer UI showed the original 600-XRP/60-day request linked to its explicit 60-second demo offer, both exact approvals pending. Local suite: 40 passed, zero failed. Hook 2.4.0 accepted 15 actual events at 23:05:15 UTC, HTTP 200; 518 cumulative, zero buffered. These notes describe observations and are not the required participant-written final report.

## September 13, 01:24 Paris: research and evidence-boundary experiment

Added a sourced strategy study in [RESEARCH_VERIFIABLE_LENDING.md](docs/RESEARCH_VERIFIABLE_LENDING.md), comparing the build with historical payment instruments, smart contracts, timestamping, typed signing, Accord Project, FINOS CDM, AP2 and BIS Mandala. Recommendation: make existing per-loan evidence inspectable and portable before expanding features. The study distinguishes key signatures from independently authenticated human consent, authority lookup from offline hash consistency, and request retries from global duplicate-financing prevention. This is research, not the official participant-written report.

The new `scripts/check-evidence-boundaries.mjs` runs without the application. On the public original synthetic bundle, deliberately changed copies of the document, signed commitment, yield and refusal history were rejected. An internally consistent altered receipt still required authority lookup and was rejected against the actual authority record. Only the existing public receipt ID was sent in two read-only GETs; fake receipt bytes were never submitted. Original file hash unchanged. Evidence: `evidence/research-evidence-checks.json`, checked 23:23:06 UTC. A separate fresh online bundle check passed both signatures, authority-record comparison and all saved XRPL transactions. Author-operated, not independent reproduction. No signing, metered issuance or ledger writes occurred.

Read-only hosted check at 23:24 UTC: selected 600-XRP request still AGREEMENT_LOCKED, zero approvals, unfunded. Exact approval remains pending and transaction expiry must be rechecked before resuming. Hook accepted 12 actual events at 23:24:02 UTC with HTTP 200; 535 cumulative, zero buffered. No manual report or event submission generated.

## September 13: architectural claim review, no ledger writes

Read-only public-bundle verification derived the two original signing addresses and returned both-valid. Inspected the existing 32-byte salted document commitment and current receipt-authority boundary; compared XRPL timing, keys, lending and credentials with primary documentation. Checked C-413/23 P and the EDPB final version 2.0 adopted July 7, 2026. Findings and proposed synthetic tests are in [CONTRACT_HISTORY_FACT_CHECK.md](docs/CONTRACT_HISTORY_FACT_CHECK.md); this is agent-assisted research, not the official participant report. No protocol bug is alleged from these conceptual corrections.

`node scripts/hook-status.mjs --flush` completed successfully at 01:45:52 UTC. Hook 2.4.0 accepted seven existing events with HTTP 200; 547 cumulative, zero buffered. No raw logs, invite or identity files were exposed. No new signature, metered receipt, network transaction or public signal was issued.

## September 13, 04:53 Paris: shared UI and live borrower balance

Implemented a shared borrower/reviewer/lender/admin lifecycle with exact request
selection, next actor, setup and full ledger history, separate content/authority/
XRPL evidence, recorded publication times and expiry handling. Preserved approvals,
receipt recovery, native refusals, repayment and lender yield. Added an on-demand
borrower wallet read tied to the agreement's account and event network 4001.
`server_info` fixes a validated ledger; `account_info` must match its index/hash,
account and integer balance. Failed refreshes retain the last observation.

Actual checks: npm test, 51 passed, zero failed (7149.9723 ms); hosted build and
syntax checks passed. Chrome created/reviewed request-35dd9b3f-5d58-4b09-8067-cfa6dd68efab
for 123.000002 test XRP/30 days. Borrower and admin followed the same reviewed ID.
HTTP smoke at 02:37:07 UTC created request-76e71762-9d1e-4e9f-8a61-3331d0c29b87:
REVIEWED revision 3, duplicate retry one record, stale/change 409, invalid role 401,
wrong origin/native 403, malformed JSON 400. No new loan was approved or funded.

`node scripts/check-hosted-wallet.mjs`, 02:53 UTC: HTTP 200, 273/267 ms, validated
ledger 82625. Original wallet 999999944 drops versus historical loan proceeds
100000000 drops; newer request wallet 1000000000 drops but funding unfunded.
Unknown request 404. Evidence: evidence/hosted-wallet-checks.json. Chrome's borrower
button then displayed 1000 test XRP and Not funded, with ledger 82639. Explorer
search confirmed original LoanSet 54A285546C2F2A4374C698E2EA00CC82778F408163D30C49898A28B8C4FB75FA
at ledger 66253; corrected new UI links to /transactions/:hash.

Read-only network probe 02:16 UTC: HTTP 571 ms, WebSocket 619 ms, xrpl.js 5.2.0
SDK 836 ms, network 4001, rippled 3.4.0-rc1, ledger 81898. Online verification of
the original bundle passed both signatures, receipt authority and saved native
transactions. No metered receipt issuance. Hook flush 02:53:39.611 UTC: HTTP 200,
26 accepted, 617 cumulative, zero remaining. No raw logs or identity/invite exposed.
These are author-operated observations, not independent reproduction or the manual
participant report. Fresh 600-XRP offer remains expired, unsigned and unfunded.

## September 13, 07:06 UTC: offline verification and retention proposal

`node dist/scripts/verify-bundle.js evidence/synthetic-supplier-001.json` passed
contentHash consistent, signatures both-valid and receiptChainHash consistent;
receiptAuthority and xrplValidation both require online lookup. No reset simulated
or observed. Reviewed XLS-41/XPOP and XLS-66, and recorded evidence-retention and
broker-gate boundaries in docs/DEVNET_EVIDENCE_RETENTION.md. No ledger write,
receipt issuance or protocol implementation change.

Privacy-filtered hook status at 07:06:07.258 UTC: version 2.4.0, registered,
625 cumulative sent, zero buffered. Flush sent zero events (status 0 means no
HTTP delivery was needed). Last lifecycle delivery remained 02:58:15.849 UTC,
eight accepted. This checkpoint does not prove new capture from the current
projectless working context. The participant report remains unwritten by the agent.
