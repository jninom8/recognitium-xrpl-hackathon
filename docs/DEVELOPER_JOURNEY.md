# Recognitium · Developer journey

**The shared reading page for the team.** September 12, 2026.
Evidence through **21:28 Paris time (UTC+2)**. About eight minutes to read.

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
| Customer interface | Borrower request form and tracking, lender position, protected broker inbox at `/`; technical workspace at `/operator` |
| Tests | 31 passing local tests, including process crashes with simulated external systems, two-client state checks and durable request intake |
| Developer capture | Team **Recognitium**; 366 events accepted at the last recorded check |
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
is installed locally in this project, with eight trusted hooks. At **21:28:42**,
the last recorded delivery returned **HTTP 200**, with **366 accepted events**
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
