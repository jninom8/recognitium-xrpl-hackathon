# Recognitium: demo script

Draft narrative. Replace every promised behavior with what the final build
actually demonstrates. Team roles: the frontend lead presents; the integration lead operates the demo
and handles protocol questions. Rehearse the handoffs.

Timing is unresolved: Notion specifies 4 minutes plus 2 minutes of questions;
the morning challenge slides, page 6, specify 5 plus 3. This is a four-minute
core for rehearsal, not a decision about the official slot. Confirm with a
mentor. If five minutes is confirmed, use the optional segment below.

## 0:00-0:30: the problem

"A supplier needs capital before its customer pays. The lender needs to know
which request was approved, on which evidence and on which terms. XRPL provides
the loan machinery. Recognitium connects that machinery to the agreement and
evidence that made the loan possible."

## 0:30-1:10: supply, demand and agreement

Show the lender's vault capital, one fictional supplier request and the private
evidence commitment. Show the broker/borrower agreement on the same version.
Explain that documents stay off-chain. A receipt commits to the record; it does
not decide whether an invoice is truthful or a borrower is creditworthy.

## 1:10-2:10: actual XRPL flow

Show the validated vault deposit, broker configuration, LoanSet and borrower
funding, repayment, and lender withdrawal with nonzero yield. Open at least one
explorer transaction. Show the native protocol rejection and its precise cause.
Use retained validated transactions for long waits, explicitly labelled as the
recorded run. Never simulate an explorer success.

## 2:10-2:35: distinct contribution

Export the agreement and execution evidence. Disable network access for the
verification view. Verify the existing bundle, then change a document field
and show rejection. State the scope: offline evidence verification, with loan
settlement performed on XRPL when connected.

## 2:35-3:40: the three strongest feedback findings

For each finding: "We attempted X. The docs or UI led us to expect Y. The actual
result was Z. Here is the reproduction. This change would make it easier."
Show a concise result or patch. Include a positive observation if it explains
which behavior the proposed change should preserve.

## 3:40-4:00: close

"We delivered a reproducible lending cycle, an evidence trail for the agreement,
and three actionable improvements to the developer experience. The repository
contains the transactions, the reproduction steps and the contribution."

## Six-slide structure

1. Supplier working-capital problem and one-sentence solution.
2. Three roles: lender, broker, borrower.
3. XLS-65/66 flow and live demo.
4. Off-chain evidence linked to on-chain execution.
5. Three friction findings and proposed fixes.
6. Reproducibility, contribution and next step.

## Optional fifth minute, only if the slot is confirmed

Insert before the close: reproduce one concrete friction point, show its exact
result and proposed correction, and have another person follow the reproduction.
Prefer a validated liquidity rejection, co-signing example or recovery behavior
over another product feature. Use only a finding actually observed during the
event. This script is presentation planning; the separate manual developer
report must be written by the participants in their own words.

## Questions to prepare

- Why receipts if XRPL already signs transactions? They link off-chain evidence
  and its review history to the transaction; XRPL already protects signed terms.
- Can it work offline? Existing evidence can be checked offline. New XRPL loan
  settlement needs connectivity. The separate offline-payment model is not this MVP.
- Does the receipt prove the invoice is real? No. It proves a commitment to a
  version; the broker still evaluates its truth and lending risk.
- Is the QCP involved? This prototype uses the existing classical software
  receipt service. Hardware development is outside the hackathon demo.
- What was built this weekend? Identify the new XRPL adapter, coordination UI,
  proof export and reproductions; name the pre-existing dependencies honestly.

## One-minute Saturday stand-up

"We are Recognitium. We are building a working-capital lending flow using
Track 1. The lender funds a vault, the broker and borrower agree on a loan,
and receipts link their off-chain evidence to the XRPL execution. So far we
have [validated result]. Our main friction is [observed issue]. We need
[one precise mentor answer]. Our next milestone is [testable result]."
