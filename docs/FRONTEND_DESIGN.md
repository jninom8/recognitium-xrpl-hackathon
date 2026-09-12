# Frontend direction and delivery plan

Research and design proposal, September 12, 2026. This is a team implementation
brief, compiled with AI assistance, not the participant-written event report.
This records the original proposal. Subsequent implementation now connects the
white interface at port 3000 to shared state and health. See the current
[contract](FRONTEND_CONTRACT.md) and [two-PC guide](TEAM_TESTING.md). Existing
native evidence remains unchanged; the concept at port 3100 stays simulated.

**Direction: a white, calm fintech workspace that makes one loan easy to explain
and independently check.** Build the frontend now, alongside a bounded recovery
round. Additional protocol features follow a successful integrated rehearsal.

## Visual reference and original concept

[OpenFX's payment-service-provider page](https://www.openfx.com/solutions/payment-service-providers)
was read from its public HTML/CSS and visually inspected through connected Chrome
on September 12. Its generous white space, regular-weight headings, green action,
fine separators and timestamped transaction timeline are useful references.
The source also contains dark comparison and code sections. Our application
should stay predominantly white, following the founder's preference.

Adapt the clarity to an operational workspace: a compact header, one request,
one next action and an expandable evidence trail. Large marketing heroes, volume
claims, logos, proprietary font files and source components are not reused.
OpenFX's marketing claims are not claims about Recognitium.

The [interactive design concept](design/index.html) is original HTML/CSS/JavaScript.
Run `npm run design:preview`, then open http://127.0.0.1:3100. It has no API,
wallet, receipt issuance or ledger connection. Every state and amount is a
labelled **simulated design fixture**. Its controls illustrate a proposed UI;
they do not test the lending state machine. The frontend lead can borrow these
tokens and components without replacing the live starter until integration.

| Element | Proposed treatment | Reason |
|---|---|---|
| Canvas | White `#FFFFFF`; secondary surface `#F7F9F8` | Clear financial workspace |
| Text | Ink `#18231F`; secondary `#5B6861` | Readable numbers and explanations |
| Action | Deep green `#176B4B`, white text | One obvious next action |
| Status | Green, amber `#855400`, red `#B42318`, each with text/icon | Distinguish complete, pending and rejected |
| Layout | 1160px content maximum, 24px gutters; 8px spacing rhythm | Room for review without a marketing-sized hero |
| Type | System sans initially; 32px title, 16px body, 13px metadata | No font download or licensing dependency |
| Surfaces | 1px neutral borders, 12px corners, minimal shadow | Calm hierarchy without a grid of decorative cards |
| Amounts | Tabular numerals; integer drops preserved internally | 20 drops must never round to zero in evidence |
| Mobile | One column; facts before actions; hashes wrap | Review remains usable at 390px |

Target at least 4.5:1 for ordinary text; keep keyboard focus visible and announce
state changes without moving focus. These follow W3C guidance on
[contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and
[status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).
Check the integrated UI at desktop/mobile widths and with keyboard-only use;
the design proposal is not a claim of full WCAG conformance.

## Three views, one request history

**Request.** Show the synthetic document version, amount, annual rate, payment
schedule, all fees, borrower, network and both expiries before approval. Let each
role review the exact agreement and transaction hashes under details. Approval
must use that role's capability and both exact hashes. A role tab is navigation,
not authentication. Changed or expired terms require a new approval.

**Position.** Show deposit, share value and available cash separately. After
repayment, show redemption and realised yield with network fees separate. Use
the recorded 20-drop result precisely: gross realised interest, not net profit
or an invented annual return. The insufficient-liquidity refusal belongs next
to available cash, with its native code under details.

**Evidence.** Show document consistency, receipt authority and XRPL validation
as separate checks, with observation time and source. Group agreement approval,
funding, repayment and redemption in chronological order. Full JSON, hashes,
receipt records and export stay accessible under details.

The persistent request header carries two independent facts:

- Money: awaiting approval, awaiting validation, funded, repaid, redeemed, or
  outcome unknown. Derive this from ledger evidence and cycle state.
- Evidence: agreement receipt status and execution receipt status. Derive each
  from its stored attempt, receipt and last authority check.

`VALIDATED_RECEIPT_PENDING` should read **“Funding confirmed. Execution receipt
pending.”** Offer recovery, not a second funding button. Connection loss changes
freshness and available actions; it does not erase a previously validated loan.
`EXPIRED_UNRESOLVED` should say **“Transaction expired; outcome still unknown.”**
It must not offer an automatic replacement.

For the document demonstration, compare a modified copy with the locked version.
Reject the copy's association with the original approval. Keep the original
funded request and its receipts intact. Do not display “loan rejected” for a
document mismatch discovered after the loan was funded.

## What must exist before wiring the design to live actions

The [API contract](FRONTEND_CONTRACT.md) remains authoritative for current routes.
The following are proposed additions, not fields already shipped:

1. A browser-safe `CycleView` in `AppState`, including transaction summaries,
   lender cash/share/redemption facts and observation timestamps. Runtime `cycle`
   currently exists without the corresponding shared type.
2. Explicit run IDs and immutable request versions across routes, stores and
   journal operation IDs. Preserve the completed run; never reset by deleting
   history or reusing old signatures/approvals.
3. Per-check freshness and source, an execution-receipt-attempt summary, and
   allowed actions with a reason when blocked. The server enforces every gate.
4. Distinct modes: live event network, recorded real evidence, simulated fixture.
   Recorded evidence must identify its run and last verification time. Going
   offline must never silently activate simulated success.
5. Operator controls for setup, prepare, sign, submit/reconcile, receipt recovery,
   native refusal, repay and withdraw. Disable repeated clicks while pending;
   reconcile state after 409/timeouts. Client disabling complements server locking.
6. A read-only evidence verifier/export flow with a clear boundary between local
   consistency checks, fresh authority lookup and fresh XRPL validation.

Keep the current server and pinned xrpl.js adapter. A framework migration is not
a prerequisite. If the frontend lead uses a build tool, preserve same-origin
API access, server-side keys, role checks and the content security policy.

## Repeatable receipt integration

Direct issuance previously returned HTTP 403. The supported connected MCP
`seal_hash` path issued the real receipts, and public lookup verified them.
This request made no new metered calls. An authenticated MCP session does not
establish that the same account has direct REST issuance access.

Timebox direct-access diagnosis to 30 minutes: verify the documented credential
scope and route with the service operator, preserve only sanitized status/time
and request identifiers, and avoid repeated mint attempts. A 403 alone does not
identify an invalid key, scope restriction or gateway policy as its cause.

Meanwhile make the supported MCP handoff explicit in the application:

1. Display the stage, request version and exact commitment to seal. Persist an
   external issuance attempt before handing it off. This UI/attempt entry is
   still to implement; an execution commitment comes from validated execution.
2. An operator with their own authorized connector invokes the documented
   `seal_hash({data_hash: ...})` once. Show the current one-tick cost. Never
   paste service credentials into the frontend or copy desktop auth material.
3. Enter the returned receipt ID in the app. The existing recovery route accepts
   stage, ID and commitment; it obtains and checks the official record before
   association with the request. A recorded fixture receipt may be verified
   read-only, but cannot stand in for a new request's receipt.
4. If issuance is ambiguous, preserve the attempt. Recover an existing ID from
   the authorized connector result or supported service history. If the ID is
   unavailable, remain unresolved and request service assistance. The current
   app has no documented lookup-by-commitment or exactly-once mint guarantee.

Done means a second developer follows written steps with their own authorized
access, without private company code, shell improvisation or a second charge
after an ambiguous response. A manual MCP handoff should be described as manual.

## Delivery order and ownership

Timeboxes are planning estimates, not promises or measured completion times.
The participants choose task ownership through GitHub; no teammate message was sent.

| Order | Owner | Bounded milestone | Exit criterion |
|---|---|---|---|
| 1 | Teammate | Fresh-clone reproduction, 20–30 min excluding network delay | Their own recorded offline/online results at an exact commit; see [reproduction guide](REPRODUCTION_AND_RECOVERY.md) |
| 2 | Integration lead | Four targeted failure cases, 60–90 min | Explicit states, balance invariants and supported limits recorded; no native feature expansion |
| Parallel with 1–2 | Frontend lead | White three-view shell, 60–90 min | Recorded evidence readable; synthetic previews clearly marked |
| 3 | Both | Contract, run isolation, actions and receipt handoff | One fresh synthetic request, exact human approvals and no hidden terminal repairs |
| 4 | Both | Four-minute rehearsal with recorded fallback | Approval → native funding → changed-copy rejection → recovery → repayment/redemption proof |
| 5 | Participants | Select three findings and write their report | Each claim has evidence, scope and a useful proposed improvement |

Prepare a four-minute core because the event sources still disagree on pitch
duration. Suggested pacing: 30s problem, 60s agreement/approval, 45s funding,
45s changed-copy/recovery, 30s repayment/redemption, 30s evidence and limits.
Use the already-recorded real cycle for any step not safely completed during
the live window. A fresh loan needs new explicit approval and a repayment
schedule that leaves time for the demo. Do not reuse the expired approved loan.

Three candidate discussions, for participants to evaluate and write themselves:
event connectivity and a usable health probe; SDK/documentation/server alignment;
recovering uncertain funding while keeping receipt status separate. These are
evidence topics, not a generated report or a promise of judging points.

The final checkpoint is a teammate explaining which version was approved, how
much moved, what the changed copy invalidates, and why recovery cannot fund a
second loan. More assets, AI discovery, cover/impairment and styling extensions
can wait until that checkpoint passes.
