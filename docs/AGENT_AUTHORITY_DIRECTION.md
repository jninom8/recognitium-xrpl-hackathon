# Agent assistance and authority

September 13, 2026. Design direction discussed with the founder, not an
implemented agent or a participant-authored event report.

Automate preparation and follow-through. Keep explicit approval of the exact
commitment before the borrower signs. One simple approval screen can present
the amount, counterparty, schedule, fees, expiry and agreement version together.
Simplicity must not hide changes or turn a viewed offer into consent.

## What exists today

The application has guided borrower, reviewer, lender and admin workspaces,
request-bound role approvals, an agreement receipt check, co-signed LoanSet,
native execution evidence and receipt recovery. The local backend manages test
wallets. The hosted website supports request/review and displays published native
progress; it does not independently sign loans. Role views are not authenticated
legal identities. The original 100-test-XRP cycle is complete; the separate
600-test-XRP offer is expired, unsigned and unfunded.

There is no AI chatbot, wallet MCP integration, KYC service, separate human
approval receipt, delegated credit limit or automatic repayment scheduler.

## Proposed next boundary

An agent can gather supported facts, prepare a request, compare terms, coordinate
receipt checks and recover evidence. Missing business facts must remain unknown;
external documents and signals cannot grant permission or instruct the signer.

A separate approval record could bind the authenticated approver, role, exact
agreement and transaction hashes, challenge, expiry and policy version. Its
Recognitium receipt would preserve evidence of that recorded approval. It would
not, by itself, prove a human was present, understood the terms or controlled the
account. Authentication and a trusted confirmation/signing path are prerequisites.
Receipt retries must recover the same approval, never authorize another loan.

Scheduled repayments require an explicit mandate identifying the loan, permitted
amounts, dates, fees and limits. Insufficient funds or uncertain submission must
stop for reconciliation; they must not create a new loan. A deterministic
scheduler can handle this without giving an AI unrestricted wallet keys.

Repayment history may inform a human or organisation's decision to grant more
autonomy. The resulting authority must be bounded, expiring and revocable,
including after key compromise. A history is not an automatic right to borrow.
Revoking future authority cannot undo a validated transaction or an existing debt.
Use "verifiable history" or "tamper-evident records", not an unconditional
"unerasable record" or a claim that only Recognitium can provide this pattern.

## Identity issuers and validators have different jobs

An exchange or custodian that already checks customers is a plausible identity
issuer. Operating a validator does not itself establish KYC competence, a checked
customer relationship or willingness to issue credentials. This project has no
such issuer partnership.

XRPL's documented credential model separates issuer, user and authorizer. A
broker would explicitly accept an issuer and credential type, verify the subject
account and current validity, and apply its own lending policy. The issuer can
revoke the credential. Private identity documents stay with the checking party.
See the official [Credentials documentation](https://xrpl.org/docs/concepts/decentralized-storage/credentials).

Ledger consensus, identity attestation, receipt authority and lending permission
are separate checks. A consensus validator verifies ledger rules, not the truth
of a borrower's identity documents. See [Consensus Structure](https://xrpl.org/docs/concepts/consensus-protocol/consensus-structure).

## Human oversight claim

The AI Act's Annex III 5(b) addresses systems evaluating natural persons'
creditworthiness or credit scores, with a financial-fraud exception; classification
and applicable obligations depend on the system and context. Article 14 requires
effective oversight for covered high-risk systems, including understanding,
monitoring, overriding outputs and stopping operation. Article 26 addresses the
competence and authority of those assigned oversight. A sealed approval record
could support audit evidence, but one tap or receipt does not establish compliance.
Source: [EU AI Act, consolidated July 27, 2026, Articles 14 and 26 and Annex III](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A02024R1689-20260727).

For this hackathon, preserve the verified Vanilla flow and present these ideas as
future work. Do not add credential gates or autonomous signatures merely to make
the narrative appear more complete.
