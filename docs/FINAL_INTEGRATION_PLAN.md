# Final integration audit and next-step plan

Audit: September 13, approximately 00:30 Paris. This is an implementation plan, not the participant's manual feedback report.

## Verdict

The original Track 1 Vanilla cycle has real validated evidence. Hosted intake works. The new request-to-native bridge exists and has simulated preparation/restart tests, but no fresh connected run is currently published. The customer frontend is not yet a complete reflection of the backend lifecycle, and it is not a browser-operated lending service. Keep one local operator bridge for this hackathon; do not put signing keys into the public deployment to remove a presentation inconvenience.

Read-only live check: /api/state returned HTTP 200 in both modes. Live native requests: zero. Recorded mode: synthetic-supplier-001, FUNDED_WITH_EVIDENCE, with completed cycle. Request E0403F17 remains UNDER_REVIEW for 600 test XRP. HTTP response time is not evidence-validation time.

## What the event asks for

Re-read the complete 10-page challenge extraction in reference/XRPL Lending Protocol Hackathon Challenge.txt, plus the sanitized September 12 Notion snapshot and source index. A fresh attempt to open the public Notion page failed in the web tool; do not claim that the current Notion was refreshed successfully.

- Track 1 minimum: open-ended vault; lender deposit; broker and borrower-accepted loan; actual funding and at least one repayment; withdrawal with accrued yield; one native rejection (challenge p.3).
- Vanilla is XLS-65/66 with a credible use case; Loaded has no automatic scoring advantage (p.5).
- Feedback 40%, technical XRPL execution 30%, use case 20%, presentation 10% (p.8).
- Working development-network implementation, public repository/setup instructions, verifiable transactions, at most 10 slides, hook capture and participant-written report of at most 3 pages (pp.6–7).
- The saved Notion brief adds the root report, environment/SDK/transaction details in README, and feedback form. It gives September 13 code freeze 12:30 and submission 13:00 CEST. It says 4-minute demo plus 2-minute Q&A; the PDF says 5 plus 3. Prepare a four-minute core and confirm the slot with a mentor. Do not spend time padding a fifth minute.

Source index: [SOURCES.md](SOURCES.md). PDFs and snapshots stay ignored; they are not submission attachments.

## Requirement-to-screen audit

| Requirement / backend fact | Current frontend | Verdict / next correction |
|---|---|---|
| Request and reviewer are different roles | /borrow mint, /review lavender; same public synthetic inbox | Clear views; openly labelled demonstration roles, not authenticated people |
| Vault, lender deposit, broker and cover setup | Recorded evidence/operator can show parts; fresh bridge publishes nothing until a prepared request exists | Add preparation-stage progress with run ID before the offer exists; include actual deposit and cover, not defaults |
| Exact borrower/broker agreement approval | Exact terms can be inspected; hosted native actions are all disabled; approval happens through local bridge | Show approval status for each role and explicitly say who operates the next step; do not imply a browser click has signed |
| Requested duration versus offered duration | Request shows days, agreement shows seconds in another dialog | Put requested and offered terms together; prominently label an accelerated counter-offer |
| Funding pending, unknown, refused, funded | Backend distinguishes these; customer model partly does | Request rows currently reduce every linked run to “Loan agreement available”; use actual phase and next step |
| Funding before receipt recovery | Backend preserves validated funds and pending receipt separately | Make two visible statuses: money received; receipt pending/verified. Avoid generic “receipt pending” before any funding exists |
| Repayment and lender withdrawal/yield | Recorded views show the amounts and distinguish gross interest from fees | Verify the new selected run through all three views; add due/payment date and actual repayment amount without inventing totals |
| Native liquidity refusal | Saved in cycle; operator evidence can show it; customer history filters it out | Add one understandable guardrail event with exact code and link/details |
| Changed-document rejection | Tested in verifier/service, no customer demonstration control | Provide a clearly labelled local tamper-verification demonstration; do not modify the actual accepted record |
| Evidence freshness / system health | Hosted health unchecked; generated build snapshot retained; API stamps current observedAt and UI says Updated | Separate page refresh, last bridge publication, last ledger validation and receipt authority check. Never show a green fresh-ledger claim from a successful HTTP response |
| Multiple runs | Customer cycle mapping added; operator still uses state.cycle even when another request is selected | P0 correctness bug: map operator cycle by selected request ID; never combine loan A with repayments/yield from B |
| Shared state contract | API adds hosting and cyclesByRequest outside AppState declarations | Type these fields and test the producer/consumers together |
| New-run export | Existing exporter reads data/requests, data/cycles and data/operations only | P0 completion gap: add safe per-run export path support, preserve old evidence, verify the fresh bundle |
| Expired offer / restart | Same offer is retained; no blind replacement signing | Safe refusal exists, but no same-intake revised-offer flow. Rehearse within the review window; define explicit versioned replacement only after proving no unresolved funding, never delete history |
| Receipt handoff | Durable receipt-intent, external MCP seal, recover by ID | Explain the assisted operator step; do not call this automatic integration. Existing receipt IDs must survive lost responses |

Code inspected: src/hosted/api.ts, src/hosted/runs.ts, scripts/bridge.ts, src/shared/contract.ts, scripts/export-bundle.ts, web/customer.js, web/customer-model.mjs, web/app.js, native cycle/service and integration docs.

## Execute in this order

### 1. Fix the minimum presentation correctness gaps (target 45–60 minutes)

Bind all views to one selected request and its cycle. Add typed public bridge stage, publication timestamp and available/blocked next action. Show requested versus offered terms and both approval statuses. Correct the stale generic labels, receipt-before-funding wording and operator health-check button that calls an unavailable hosted endpoint. Add the native refusal to customer activity. Keep advanced IDs under details.

Acceptance: with clearly labelled local fixtures for two different runs, switching runs never mixes capital, repayment or yield; stale bridge publication stays visibly stale; a validated payment remains received during receipt outage. These fixtures never become public live evidence.

### 2. Run one fresh connected synthetic cycle (target 45–90 minutes, ledger-dependent)

Finish review of the selected request. Choose requested duration or explicit 60-second counter-offer. Prepare the isolated run; inspect its exact agreement, accounts, amount, fees and expiries. Founder approves both demonstration roles explicitly. Persist the receipt intent, issue once through the authorized MCP, recover and verify, co-sign, submit and reconcile. Show the same request ID and funding in /borrow and /review. Exercise the native liquidity refusal, repay at the actual due time, withdraw and measure gross realised yield plus fees.

Acceptance: real borrower balance increase from this LoanSet; same request/digests throughout; one loan on retry; nonzero realised withdrawal yield; one native refusal; both receipt authority checks pass. No new funding is claimed before this gate passes.

### 3. Export, replay and prove the failure boundaries (target 30–45 minutes)

Extend export to the isolated run and run the independent verifier online. Perform one bounded retry/restart check, one receipt-publication recovery check, and a changed-document verification rejection using a copy. No unbounded failure matrix and no destructive mutation of funded records. Local tests already cover many simulated failures; distinguish those from any actual remote interruption.

Acceptance: clean verifier output for the fresh bundle; tampered copy fails; retry/restart preserves one loan and the existing receipt issuance attempt; all three screens still agree. Produce a recording or screenshots as a fallback, honestly labelled with the recorded time.

### 4. Give feedback its proper share of preparation time

Reserve 45–60 minutes for the founder's own manual report before final presentation polish. It is currently still a template. Select three strong XRPL-facing findings with exact reproduction and proposed fixes: event connectivity/preflight diagnosis without claiming proven Wi-Fi port blocking; documentation/amendment/SDK versus mentor-guided runtime behavior; repayment timing and explicit native result handling. Use the evidence to choose, not this list as predetermined conclusions. The Blob weak-ETag issue is useful application experience but should not displace stronger XRPL tooling feedback without a reason.

The assistant can organize evidence and check facts; the participant writes the experience/report. No generated replacement report. No issue, mentor message or event form is sent without authorization. Hook counts are delivery evidence, not judging points or a substitute for the report.

### 5. Solo rehearsal and submission readiness

Update the stale two-presenter PITCH.md instructions. Use three tabs: requester, reviewer and lender; show one request. Rehearse a four-minute core: 30s problem, 90s flow/evidence, 60s three findings, 40s recovery/contribution, 20s close. This is a proposed timing budget, not the official confirmed slot. Prepare six concise slides, staying below ten. Avoid spending live-demo time waiting on the faucet; show honestly prepared setup and execute the bounded loan step live when conditions permit.

Checklist before the saved 12:30 freeze: clean checkout build/tests, public URLs, reviewed synthetic evidence, clear README track/SDK/network/transaction list, final participant report, slide deck, disclosure of existing classical Recognitium service and AI help, hook delivery and fallback. Feedback form/event submission still require applicable founder authorization. Another person's independent reproduction remains unverified; a founder fresh-clone check is useful but must not be relabelled as independent teammate verification.

## What to stop adding

No further aesthetic overhaul, Loaded primitives, new assets, AI marketplace discovery, production account system, wallet migration or public signing infrastructure before the connected cycle and report are complete. The smallest convincing product is one request with truthful, consistent state and inspectable evidence.

## Current stopping point

This audit does not authorize a new transfer or replace pending exact approval. The selected 600-XRP request was still under review at the read-only check; duration choice and exact loan approval remain pending. No application fixes or ledger mutations were performed during this planning audit.
