# Recognitium · Developer journey

**The shared reading page for the team.** September 12–13, 2026.
Latest planning/capture checkpoint: **September 13, 10:36 Paris time (UTC+2)**.
The overview below is current; dated entries preserve earlier observations.

[Timeline](#1-the-timeline) · [Problems and fixes](#2-what-we-learned) ·
[Proof](#3-check-the-result) · [Hook](#4-the-mandatory-devex-hook) ·
[Next work](#5-where-the-team-continues)

## At a glance

| Area | Observed status |
|---|---|
| Native lending | Complete real cycle on the event development network |
| Borrower funding | **100 test XRP** received through co-signed LoanSet |
| Lender return | **200.000020 test XRP** withdrawn after depositing 200 |
| Realised interest | **20 drops before network fees**, not net profit |
| Protocol refusals | Insufficient liquidity; normal repayment after its due date |
| Recognitium receipts | Real agreement and execution receipts verified |
| Customer interface | Borrower, reviewer, lender and admin share one six-step narrative; full operation history, separate evidence checks and live borrower balance |
| Tests | 52 passing local tests; deployed role views, request/review and wallet checks; failures explicitly distinguish simulated external systems |
| Developer capture | Team **Recognitium**; 629 events accepted at 10:36 Paris on September 13, including four explicit agent reflections; current projectless automatic capture is not proven |
| Last connection checkpoint | Vercel read both borrower accounts at validated event ledger 82625; HTTP 200, 273/267 ms |
| Still to finish | Resolve the expired unsigned 600-XRP offer, obtain fresh exact approval and complete that connected native run; independent reproduction and participant-written final report |

The business request and document are explicitly **synthetic**. The ledger
transactions and receipt calls are real observations. All XRP is test XRP.

## 1. The timeline

All times below are **Paris time on September 12**. Transaction times come from
the ledger close times saved in the evidence bundle; other times are observation
timestamps. They are not estimates of hours spent coding.

| Time | What happened | What it established |
|---|---|---|
| Before implementation | Reviewed the event brief, workshop slides and lending specifications | Track 1 Vanilla chosen; TypeScript uses the recommended JavaScript SDK |
| 13:05–13:15 | Activated the already-approved project hook; first capture at 13:11, first accepted delivery at 13:15 | Runtime capture worked under Recognitium |
| 13:19–13:59 | Repeated RPC, WebSocket, SDK, DNS and TLS checks on venue Wi-Fi | Ordinary HTTPS worked, but the event connection failed |
| 14:23 | Repeated the same checks using the phone hotspot | Event HTTP, WebSocket and SDK connections succeeded |
| 14:45 | Read enabled amendments on network 4001 | V1.1 was enabled despite the Track 1 brief; sought mentor guidance |
| Before 15:03 | Founder relayed mentor instruction to test open-ended lending there | Continued on the same endpoint and stable SDK with a scoped trial flag |
| 15:03:30–15:03:41 | Created vault, deposited 200 XRP, created broker and deposited 20 XRP cover | All four transactions validated successfully |
| Before 15:14 | Founder approved exact terms for both synthetic roles; obtained and verified the agreement receipt | The same agreement hash and prepared transaction governed both signatures |
| **15:14:10** | **LoanSet validated and credited 100 XRP to the borrower** | Atomic origination and funding worked on this event server |
| 15:16:51 | Attempted to withdraw 200 XRP while only 100 remained available | Native liquidity refusal, with unchanged vault state |
| 15:17:42 | Submitted normal LoanPay after the 60-second due date | Native `tecEXPIRED` refusal |
| 15:20:32 | Used the explicit late-payment flag after the confirmed refusal | LoanPay succeeded; approved late fee and late interest were zero |
| **15:21:51** | **Withdrew 200.000020 XRP** | The lender realised 20 drops of interest before fees |
| After the cycle | Verified saved signatures, receipts and transactions through fresh lookups; published reviewed code | Evidence was reproducible independently of the application UI |
| 15:36–15:40 | Refreshed the brief and compared mentor-recommended beta.1 with stable | Both SDKs verified the recorded cycle; stable already included the signing fix |
| By 16:05 | Added targeted simulated failure tests, observed two failures and fixed the application | Receipt outages no longer hide validated funding; stale receipt actions cannot rewind progress |
| 16:20 | Repeated the probe after returning to venue Wi-Fi | The same connection failures returned; ordinary HTTPS still worked |
| By 16:31 | Reviewed six external proposals and tested actual child-process crashes with simulated external systems | Recovery tests passed; several external claims needed correction; a deposit-formula documentation discrepancy was reproduced |
| 17:01:57 | Repeated the same probe after another Wi-Fi change | Event HTTP 573 ms, WebSocket 553 ms, SDK 766 ms; ledger 68408 |
| By 17:06 | Reverified the earlier cycle and corrected optional CTID handling | Loan and metadata matched; fresh responses omitted an optional RPC locator. All online evidence checks then passed |
| 17:07:31–17:08:01 | Ran the selected cap experiment in a separate 10-test-XRP vault | One competing deposit succeeded, the other and two cap violations were refused; full principal withdrawn |
| 17:11:24 | Used a separate verifier to look up all seven cap transactions and historical vault states | Cap evidence verified; original vault unchanged; empty experimental vault balance zero |
| By 18:05 | Researched and previewed the founder's clean white fintech direction in Chrome | Original concept labelled simulated; no new ledger evidence asserted |
| By 18:58 | Integrated the three views with shared state/health and tested two local clients plus browser reconnection | 27 tests passed; recorded funding survived an idle backend stop/restart; teammate reproduction still pending |
| 19:17–19:44 | Founder identified that the browser showed operator information, not a usable customer journey; added a customer home, request wizard and broker inbox | Persisted synthetic requests and reviews work; fresh loan creation from those requests remains a separate step; 31 tests passed |
| 21:39–21:49 | Founder challenged the financial jargon and confusing start; rebuilt entry around Request funding and Provide funding | The normal workspace starts without the historical loan; example and review area separate; 32 tests passed; final mobile check blocked by browser tool |

## 2. What we learned

### Connectivity: changing the network resolved the failure

On venue Wi-Fi, RPC timed out and the SDK reported a reset. TCP connected, but
TLS stalled. The same computer, endpoint and SDK succeeded on the hotspot:
HTTP **960 ms**, WebSocket **986 ms**, SDK **1,582 ms**.

Returning to venue Wi-Fi at 16:20 reproduced the failure. Another Wi-Fi change
at 17:01 restored all three connections in under one second, still on network
4001. The hook continued delivering captured events while ledger access failed.

This strongly implicates the venue network path. Congestion, filtering and
other intermediary behavior were **not individually isolated**. The separate
port-443 certificate mismatch was not the cause on the official event ports.

[Measurements, limits and reproduction commands →](NETWORK_FINDING.md)

### Environment: the mentor-guided test changed the conclusion

The enabled V1.1 amendment appeared incompatible with the documented
open-ended broker restriction. The application initially stopped. After mentor
guidance, the actual vault, broker and LoanSet all succeeded on **network 4001,
rippled 3.4.0-rc1**. The amendment label alone did not predict this event build's
behavior. We kept the original track and recorded the exception explicitly.

[Initial observation and subsequent trial →](../DEVEX_LOG.md#build-005-advertised-track-1-server-has-v11-enabled)

### Liquidity: withdrawal eligibility does not guarantee available cash

The lender owned shares corresponding to 200 XRP, but 100 XRP was lent out.
Withdrawing 200 returned `tecINSUFFICIENT_FUNDS`. This was expected protocol
protection. The frontend should distinguish total position value from available
liquidity so the refusal is understandable.

### Repayment: a short demo loan can become late during manual checks

The 60-second due date passed while we inspected evidence and receipts. Normal
LoanPay returned `tecEXPIRED`. A separate, journaled late payment then succeeded.
The refused transaction was preserved; an uncertain submission would not have
permitted a replacement. This is a useful example of recovery from a known
refusal, rather than a connection problem.

[Both refusal records and the correction →](../DEVEX_LOG.md#live-002-available-liquidity-refusal-then-late-payment-recovery)

### Receipts: a hash, an authority record and ledger validation answer different questions

Direct receipt issuance returned HTTP 403. The already-authorized Recognitium
MCP issued the agreement and execution receipts, each for one tick; the
application verified them through the official public API. Direct issuance
access remains an open integration item. The service is pre-existing classical
software.

| Check | What it establishes |
|---|---|
| Content hash and signed Data | The committed document/terms match the signed request |
| Official receipt lookup | The authority has the matching receipt record |
| Validated XRPL transaction and metadata | The test loan funded the borrower |

The execution receipt was attached after validated funding without originating
another loan. Forced network outages and restart scenarios were also tested
with explicitly simulated failures; they are not all live failure experiments.

[Integration boundaries →](RECOGNITIUM_INTEGRATION.md) · [Detailed observations →](../DEVEX_LOG.md#build-004-real-recognitium-adapter-probe-no-lending-claim)

### SDK update: beta.1 was useful information, but did not require migration

Beta.1 fixes beta.0's counterparty signing behavior. Our stable **5.2.0 already
has that fix**. Beta.1 also includes closed-ended vault models useful for
Track 2. In an isolated offline check, both versions reproduced the real loan
hash, verified both signatures, rejected modified Data and reproduced eight
other native transaction hashes.

At the recorded refresh, the public Notion response still listed beta.0 for
Track 2. We preserved that observation alongside the founder's mentor update;
the reason for the difference remains unresolved. The tested application stays
on stable 5.2.0.

[Package differences, timestamps and comparison commands →](SDK_UPDATE.md)

### External review: hypotheses became controlled tests

The six supplied proposals prompted useful tests of caps, cover and impairment.
They also contained unsupported claims, including missing borrower consent and
an asserted impairment exploit. We checked these against primary sources and
our real signatures before changing the application.

One actual discrepancy emerged: the current vault documentation and pinned
standard recalculate the deposit debit differently when paper loss is nonzero.
The earlier cycle had zero paper loss, so it does not settle that question.
[Comparison, sources and selected experiments →](EXTERNAL_REVIEW.md)

The first selected native experiment is now complete: a 10-XRP cap held under
competing deposits, a one-drop excess and an attempted cap reduction. Each
refusal was validated `tecLIMIT_EXCEEDED`. Full principal was returned; network
fees were accounted separately. The two competing deposits landed in consecutive
ledgers, so a same-ledger race remains untested.
[Recorded cap evidence →](../evidence/native-cap-001.json)

### User experience: evidence needs a customer task around it

The earlier browser page was the operator interface. Our diagram incorrectly
suggested that a separate customer experience already existed. The founder's
feedback made the missing work concrete: a borrower needs to request financing,
review terms and track progress; a lender needs to understand their position;
a broker needs an inbox. Technical state and health belong behind those tasks.

The root page now provides those views, while `/operator` preserves the native
controls and detailed evidence. New synthetic requests persist in a protected
intake store. Broker review changes their status, but **does not approve or fund
a loan**. A reviewed request still needs a fresh agreement and both exact
approvals. [Working flow and remaining boundary →](CUSTOMER_FLOW.md)

The handover check also found missing local role codes. A repeatable setup
command now creates them in ignored .env without printing them or overwriting
existing configuration. Both protected inbox reads returned HTTP 200 after the
local restart; the inbox stayed empty because no real intake was submitted.

A new restart test also exposed a local application defect: an HTTP success
response could be sent before releasing the writer lock. Stopping the server
immediately after the response could strand that lock. The response now follows
cleanup; the regression checks that an acknowledged write has released its lock.
This is an application finding, not an XRPL protocol defect.

## 3. Check the result

**21:49 usability checkpoint:** the entrance now asks what the person wants to
do, with plain-language request questions and a separate completed example.
Fresh visitors do not see the shared historical loan as their own. The new
regression brings the suite to 32 passing tests. Desktop form/review checks
passed; browser connectivity interrupted final mobile QA. The request-to-fresh-
offer bridge remains pending and is stated in the interface.
[Actual changes and checks →](../DEVEX_LOG.md#ux-002-start-with-the-persons-goal-keep-the-historical-loan-in-an-example)

**21:28 challenge alignment check:** all ten PDF pages were reread from the
founder's ZIP. The recorded native cycle covers page 3's six Track 1 gates;
the off-ledger agreement/receipt layer is consistent with page 5's Vanilla
description. Fresh online verification again passed both signatures, receipt
authority records and XRPL validation. This does not complete the remaining
fresh customer-request-to-loan bridge or participant-written submission.
[Exact review and command →](../DEVEX_LOG.md#alignment-001-complete-challenge-pdf-review-and-fresh-native-evidence-check)

**Customer interface checkpoint:** the root page now leads with customer tasks.
Authenticated intake tests cover duplicate requests, immutable details, broker
revision checks, two HTTP clients and a real server restart. They use isolated
test-only role values and create no wallet, loan or receipt. All **31 tests**
passed. Chrome checks covered desktop and mobile borrower/lender views, exact
six-decimal amount review, validation and the access gate. Browser automation
stopped before entering a role code; these checks are not a second participant's
reproduction. [Commands and results →](../DEVEX_LOG.md#customer-001-founder-feedback-turns-the-operator-page-into-a-customer-flow)

**Earlier synchronization checkpoint:** the technical page at `/operator` shows request,
lender position and evidence from the same state as the console. Source labels
separate private live records from read-only published real evidence. Backend
instance IDs and revisions let two reviewers check that they see the same run.
An open approval review is invalidated when its exact request or backend changes.
The 27-test suite includes two HTTP clients observing approvals and reconciling
concurrent writes with simulated external services. These are two clients on
the author's machine, not independent teammate reproduction. A separate real
idle backend stop/restart in Chrome retained the recorded funding and disabled
the open review. [Observations](../DEVEX_LOG.md#sync-001-shared-uiconsole-state-two-client-checks-and-wallet-clarification).

**Latest hardening:** a simulated authority outage exposed an unnecessary
dependency in funding recovery, and repeating an earlier receipt action exposed
a backwards state transition. Both were reproduced before correction. Four
regression checks now pass, including the rule that a new submission still needs
receipt verification and unresolved execution issuance cannot be silently reset.
[Exact before/after observations →](../DEVEX_LOG.md#recovery-001-targeted-simulated-failures-exposed-two-application-issues)

Two additional tests terminated a real child process at uncertain funding
checkpoints, then recovered in a new process with one submission. Their external
ledger and receipts are explicitly simulated. Later, a fresh live check exposed
an overly strict comparison of optional `ctid` data. The verifier now checks that
locator when present while comparing all other transaction fields and metadata.
The unchanged original evidence bundle passed fresh online verification again.

The [synthetic evidence bundle](../evidence/synthetic-supplier-001.json) contains
the actual transaction hashes, ledger metadata and receipts. The funded LoanSet
is at **ledger 66253**; successful repayment at **66381**; withdrawal at **66407**.

From a clone of the repository:

```sh
npm ci
npm test
npm run verify -- evidence/synthetic-supplier-001.json --online --mentor-confirmed-open-ended
```

The last command performs read-only checks. It does not fund wallets, create a
loan or mint a receipt. Without `--online`, the verifier explicitly distinguishes
offline consistency from fresh authority and ledger verification.

[Successful CI for commit 5807683, including the 21 local tests →](https://github.com/jninom8/recognitium-xrpl-hackathon/actions/runs/34701664050)

Live cap verification ran separately on the development machine. A teammate's
independent live reproduction remains a useful next check; CI did not move funds.

## 4. The mandatory DevEx hook

Capture was associated with **Recognitium** from activation. Version **2.4.0**
is installed locally in this project, with eight trusted hooks. At **21:49:08**,
the last recorded delivery returned **HTTP 200**, with **380 accepted events**
cumulatively and zero buffered at that instant. These are timestamped counters,
not a claim that every action is captured: the hook selects relevant events.

This page is the team's readable evidence index. The organiser also receives
selected hook events. Private buffers, identities, invitations and raw hook logs
stay out of GitHub. Each teammate's own machine needs its own consent and setup.

[Hook setup and verification →](HOOK_SETUP.md)

## 5. Where the team continues

The founder selected a clean white fintech direction inspired by OpenFX. The
[design brief](FRONTEND_DESIGN.md) led to an original simulated concept at port
3100 and then the integrated application at port 3000. Following the founder's
feedback, the [customer interface](CUSTOMER_FLOW.md) now occupies the root page;
the technical workspace remains at `/operator`. Both read the same lending
state. Private request intake adds borrower submission and broker review without
changing the signed native agreement contract. Money facts survive connectivity loss.
Fresh-clone users can immediately explore the published real cycle without keys.
The [two-PC guide](TEAM_TESTING.md) explains independent checks and the private
connection needed for two browsers to observe one backend's live approvals.

The demo uses three backend-managed xrpl.js wallets. A browser-wallet adapter
is a separate compatibility test for network 4001 and two-party native LoanSet
signing. [Custody and wallet choices](WALLETS.md).

The next shared task has a [fresh-clone reproduction guide and failure matrix](REPRODUCTION_AND_RECOVERY.md).
It distinguishes the original 21-test baseline, six state/UI/health/client
tests and what the four bounded extensions still must prove. Four customer
intake/view tests now bring the suite to 31. A teammate's independent outcome
remains pending.

**Recommended next gate:** try the borrower-to-broker request flow together,
then connect a reviewed request to a fresh isolated native agreement and the
durable external MCP issuance handoff. Independently reproduce the existing
evidence alongside that work. The old loan's approval has expired; deleting
its history is not a valid reset. The [frontend contract](FRONTEND_CONTRACT.md)
separates implemented behavior from these remaining requirements.

| Work | Starting point | Current state |
|---|---|---|
| Frontend and demo | [Customer flow](CUSTOMER_FLOW.md), [shared API contract](FRONTEND_CONTRACT.md), `web/` | Customer intake and broker review implemented; reviewed request to fresh loan and joint demonstration pending |
| Backend and receipts | [Current status](STATUS.md), `src/` | Native cycle verified; direct receipt issuance access needs diagnosis |
| Targeted experiments | [External review and test matrix](EXTERNAL_REVIEW.md) | Recovery and native cap tests passed; selected cover/impairment tests follow the integrated rehearsal |
| Mentor discussion | Problems and fixes above, linked evidence | Technical observations collected; unresolved causes stay labelled |
| Final developer report | [Participant writing template](../DEVELOPER_FEEDBACK.md) | **Participants must write the final account themselves** |
| Pitch and submission | [Pitch draft](../PITCH.md) | Confirm duration; no event submission made |

Keep this page as the common entry point. Add exact commands and new technical
observations to [DEVEX_LOG](../DEVEX_LOG.md), then update the relevant summary
here when the evidence changes. GitHub commits preserve the history so teammates
can see what changed without reading private hook data.

*Compiled with AI assistance from recorded project evidence. This shared
working journal is not the official participant-written final report.*

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

## September 13, 01:05 Paris: faucet sizing and durable recovery

Real observation: each fresh event faucet account held 1,000 test XRP. A 1,200-XRP VaultDeposit for the selected 600-XRP request returned validated tecINSUFFICIENT_FUNDS at ledger 77989, transaction 9B529B451F0137A9B2B6324B1C4D0EFE5FBD226DAEE6A31BEBACA53F7023776E. This was setup sizing, not a connectivity failure or lending-protocol defect. The recovery retained the failed transaction and used distinct journal IDs for a surplus setup-account top-up and corrected deposit. The deposit then validated at ledger 78032; broker and cover validated at 78034/78036. A second process repeated preparation with the same six operation hashes and unchanged agreement/transaction digests. No new LoanSet was signed or funded.

The deployed reviewer UI showed the original 600-XRP/60-day request linked to its explicit 60-second demo offer, both exact approvals pending. Local suite: 40 passed, zero failed. Hook 2.4.0 accepted 15 actual events at 23:05:15 UTC, HTTP 200; 518 cumulative, zero buffered. These notes describe observations and are not the required participant-written final report.

## September 13, 01:24 Paris: research and evidence-boundary experiment

Added a sourced strategy study in [RESEARCH_VERIFIABLE_LENDING.md](RESEARCH_VERIFIABLE_LENDING.md), comparing the build with historical payment instruments, smart contracts, timestamping, typed signing, Accord Project, FINOS CDM, AP2 and BIS Mandala. Recommendation: make existing per-loan evidence inspectable and portable before expanding features. The study distinguishes key signatures from independently authenticated human consent, authority lookup from offline hash consistency, and request retries from global duplicate-financing prevention. This is research, not the official participant-written report.

The new `scripts/check-evidence-boundaries.mjs` runs without the application. On the public original synthetic bundle, deliberately changed copies of the document, signed commitment, yield and refusal history were rejected. An internally consistent altered receipt still required authority lookup and was rejected against the actual authority record. Only the existing public receipt ID was sent in two read-only GETs; fake receipt bytes were never submitted. Original file hash unchanged. Evidence: `evidence/research-evidence-checks.json`, checked 23:23:06 UTC. A separate fresh online bundle check passed both signatures, authority-record comparison and all saved XRPL transactions. Author-operated, not independent reproduction. No signing, metered issuance or ledger writes occurred.

Read-only hosted check at 23:24 UTC: selected 600-XRP request still AGREEMENT_LOCKED, zero approvals, unfunded. Exact approval remains pending and transaction expiry must be rechecked before resuming. Hook accepted 12 actual events at 23:24:02 UTC with HTTP 200; 535 cumulative, zero buffered. No manual report or event submission generated.

## September 13: contract history and privacy claim review

Compared an external architectural argument against the original synthetic loan and primary sources. Both expected signing addresses and signatures verify. The useful direction is a versioned history with explicit evidence and authority for each event. Corrected stronger claims about off-chain finality, exact timestamps, automatic default handling, cover protection and salt destruction. The reviewed note includes a proposed amendment-history experiment, clearly distinguished from implemented behavior: [CONTRACT_HISTORY_FACT_CHECK.md](CONTRACT_HISTORY_FACT_CHECK.md). No KYC data, new financial transaction or manual participant report was generated. Hook accepted seven actual buffered events with HTTP 200 at 01:45:52 UTC, 547 cumulative and zero remaining.

## September 13, 04:53 Paris: one narrative, traceable balances

The borrower, reviewer, lender and admin now use one six-step model: request,
review, agree, receive, repay, return. Each view names the next actor. Setup,
co-signature approvals, receipt recovery, declined transactions and lender yield
remain inspectable. The full mapping is in [UI_CAPABILITY_AUDIT.md](UI_CAPABILITY_AUDIT.md).
A saved page refresh is not presented as a fresh authority or ledger check.

Author-operated Chrome testing created a synthetic request for exactly
123.000002 test XRP and completed its review in the separate reviewer tab. The
borrower and admin both showed review complete for that same request, without
claiming a loan existed. The deployed HTTP smoke also checked concurrent retries,
stale review, changed details and rejected native actions. 51 local tests passed.

The borrower balance card reads a known agreement's account on network 4001 at
one validated ledger. It separates wallet funds from the amount this loan actually
credited. Vercel returned 999.999944 test XRP for the completed example's wallet
and 1,000 test XRP for the newer wallet at ledger 82625. The latter is still
unfunded; faucet money does not establish loan funding. A failed refresh retains
its dated observation. Exact evidence and a repeatable read-only command are in
[evidence/hosted-wallet-checks.json](../evidence/hosted-wallet-checks.json).

The custom explorer displayed the original successful LoanSet. Testing exposed an
incorrect transaction-link path in the new UI; it now uses the observed
`/transactions/:hash` route. The original cycle satisfies all six Track 1 slide
items, including withdrawal with 20 drops of gross realised yield and a native
liquidity refusal. The separate 600-XRP offer expired unsigned and still requires
fresh exact approval after renewal is resolved. The UI does not erase that gap.

Hook 2.4.0 accepted 26 actual captured events at 02:53:39 UTC with HTTP 200;
617 cumulative, zero buffered at that checkpoint. This is implementation evidence,
not the official participant-written report. No new signing, receipt issuance,
loan transfer or public signal occurred during this UI milestone.

## September 13, 09:06 Paris: what survives a devnet reset

Re-ran the original bundle verifier offline: document/signatures/receipt consistency
passed, while receipt authority and XRPL validation explicitly require online
checks. No event-network reset was observed. Reviewed the organiser archive idea
and found XLS-41 (XPOP), which specifies stronger offline ledger proofs than our
saved JSON currently supplies. Also corrected the proposed private-vault credential
gate: depositor access does not automatically enforce an exact sealed borrower
agreement. See [DEVNET_EVIDENCE_RETENTION.md](DEVNET_EVIDENCE_RETENTION.md).
This is research and a proposal, not a new implementation or the manual report.

At 07:09:52 UTC the official hook accepted that explicit agent reflection with
HTTP 200: 626 cumulative events, zero buffered. It does not claim a reset occurred.

## September 13, 09:34 Paris: one explanation across four workspaces

The borrower, reviewer, lender and admin now see the same sequence: people
approve the exact offer, our broker verifies the agreement receipt, and XRPL
checks both signatures and lending rules. This is a guided application, not a
chatbot. The local operator still handles exact approvals and test-wallet signing.

Evidence cards now explain what survives offline and what still requires online
authority or event-ledger history. A missing or invalid authority-check timestamp
stays pending, even when funding is confirmed. The lender overview now includes
these proof cards alongside capital, gross interest and withdrawal fees.

52 tests passed. Chrome checked all four deployed views. The completed example
retains 200.000020 test XRP returned, 20 drops interest before fees and a separate
12-drop withdrawal fee. Cross-role navigation retains the same recorded request.
The live reviewer still shows the 600-test-XRP offer as expired, with no approval
or funding. No new loan, identity check or metered receipt was made.

Vercel CLI deployment returned Not authorized despite a successful whoami read.
The existing GitHub integration deployed main successfully; the Vercel dashboard
showed commit 14230d6 READY and the public site served it. This is deployment
evidence, not a new XRPL run or an independent teammate reproduction.

The hook's active identity matches Recognitium, but automatic counters did not
advance from this projectless chat. Official reflection submission and flush
accepted this genuine UI observation at 07:34:14.967 UTC with HTTP 200:
627 cumulative events, zero buffered, comprising 625 automatic events and two
explicit agent reflections. No raw capture or identity files were published.

The founder's proposed agent direction is documented separately in
[Agent assistance and authority](AGENT_AUTHORITY_DIRECTION.md): a linked approval
receipt, bounded repayment mandates and revocable permissions remain future work.
Validator trust, KYC issuer trust and the broker's lending decision stay distinct.
This journal supports the participants; it is not their official manual report.

## September 13, 10:27 Paris: check the shared-market framing against the slides

The three PDFs in the founder's new transfer ZIP match our ignored reference
PDFs by SHA-256. Reread all 56 pages of extracted text and inspected the relevant
track, role, lifecycle and judging diagrams. The lending introduction explicitly
puts underwriting and supporting documents off-chain. A shared information and
evidence interface could serve either vault lifecycle, but does not implement
Track 2's phase restrictions or required refused transactions.

The useful Recognitium claim is the link between a private approved version and
actual execution, with recoverable evidence. A receipt is not a marketplace match,
proof of document truth, or unconditional off-chain finality. Public IVM signals
remain distinct from private documents. No end-to-end receipt speed benchmark,
new loan, credential or general negotiation history was demonstrated in this
review. The existing [contract history review](CONTRACT_HISTORY_FACT_CHECK.md)
and [agent authority direction](AGENT_AUTHORITY_DIRECTION.md) retain these limits.

The official hook accepted the actual research reflection at 08:27:21.106 UTC:
HTTP 200, 628 cumulative, zero buffered. It is agent reflection, not automatic
capture from this projectless context or the participant-written final report.

## September 13, 10:36 Paris: plan a conversation-led application

The founder requested one interface with Borrow, Provide liquidity and Review
intentions, using Mistral to ask the right questions. Inspected the actual hosted
API, intake schema, native bridge and verifier before writing the
[implementation plan](CONVERSATIONAL_APP_PLAN.md). It preserves typed backend
state, exact human approval and the local signing boundary. Wallet/identity
evidence remains synthetic unless genuinely verified; an offline verification
call requires saved evidence, not only a transaction hash. No AI call or app
change was made during planning. Official reflection accepted at 08:35:57.011 UTC:
HTTP 200, 629 cumulative, zero buffered. The manual report remains human-written.

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
