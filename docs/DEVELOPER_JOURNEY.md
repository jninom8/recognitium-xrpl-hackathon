# Recognitium · Developer journey

**The shared reading page for the team.** September 12, 2026.
Evidence through **16:05 Paris time (UTC+2)**. About five minutes to read.

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
| Tests | 18 passing local tests; original implementation CI passed |
| Developer capture | Team **Recognitium**; 167 events accepted at the last recorded check |
| Still to finish | Frontend/demo integration and participant-written final report |

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

## 2. What we learned

### Connectivity: changing the network resolved the failure

On venue Wi-Fi, RPC timed out and the SDK reported a reset. TCP connected, but
TLS stalled. The same computer, endpoint and SDK succeeded on the hotspot:
HTTP **960 ms**, WebSocket **986 ms**, SDK **1,582 ms**.

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

## 3. Check the result

**Latest hardening:** a simulated authority outage exposed an unnecessary
dependency in funding recovery, and repeating an earlier receipt action exposed
a backwards state transition. Both were reproduced before correction. Four
regression checks now pass, including the rule that a new submission still needs
receipt verification and unresolved execution issuance cannot be silently reset.
[Exact before/after observations →](../DEVEX_LOG.md#recovery-001-targeted-simulated-failures-exposed-two-application-issues)

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

[Successful implementation CI →](https://github.com/jninom8/recognitium-xrpl-hackathon/actions/runs/34696591456)

## 4. The mandatory DevEx hook

Capture was associated with **Recognitium** from activation. Version **2.4.0**
is installed locally in this project, with eight trusted hooks. At **16:05:52**,
the last recorded delivery returned **HTTP 200**, with **167 accepted events**
cumulatively and zero buffered at that instant. These are timestamped counters,
not a claim that every action is captured: the hook selects relevant events.

This page is the team's readable evidence index. The organiser also receives
selected hook events. Private buffers, identities, invitations and raw hook logs
stay out of GitHub. Each teammate's own machine needs its own consent and setup.

[Hook setup and verification →](HOOK_SETUP.md)

## 5. Where the team continues

| Work | Starting point | Current state |
|---|---|---|
| Frontend and demo | [Shared API contract](FRONTEND_CONTRACT.md), `web/` | Starter UI/API implemented; polished shared demonstration pending |
| Backend and receipts | [Current status](STATUS.md), `src/` | Native cycle verified; direct receipt issuance access needs diagnosis |
| Mentor discussion | Problems and fixes above, linked evidence | Technical observations collected; unresolved causes stay labelled |
| Final developer report | [Participant writing template](../DEVELOPER_FEEDBACK.md) | **Participants must write the final account themselves** |
| Pitch and submission | [Pitch draft](../PITCH.md) | Confirm duration; no event submission made |

Keep this page as the common entry point. Add exact commands and new technical
observations to [DEVEX_LOG](../DEVEX_LOG.md), then update the relevant summary
here when the evidence changes. GitHub commits preserve the history so teammates
can see what changed without reading private hook data.

*Compiled with AI assistance from recorded project evidence. This shared
working journal is not the official participant-written final report.*
