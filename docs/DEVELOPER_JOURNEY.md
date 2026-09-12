# Recognitium · Developer journey

**The shared reading page for the team.** September 12, 2026.
Evidence through **22:48 Paris time (UTC+2)**. About eight minutes to read.

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
| Customer interface | Plain-language task entrance, request form and tracking; separate completed example and team inbox; technical workspace at `/operator` |
| Tests | 36 passing local tests, including process crashes with simulated external systems, two-client state checks, durable intake and example separation |
| Developer capture | Team **Recognitium**; 432 events accepted at the last recorded check |
| Last connection checkpoint | Read-only health reached network 4001, ledger 70504, in 99 ms at 18:46 |
| Still to finish | Reviewed request to fresh loan, independent reproduction, fresh joint rehearsal and participant-written final report |

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
