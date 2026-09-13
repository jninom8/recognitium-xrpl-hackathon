# One application, three intentions

Proposed September 13, 2026, around 10:35 Paris. This is an implementation plan,
not shipped functionality or a participant-authored report. The documented code
freeze is 12:30 Paris. Preserve the working Vanilla evidence and reserve time
for regression checks and rehearsal; do not attempt a new lending protocol.

## Product

One homepage asks: What would you like to do?

| Tab | Conversation | Persistent card |
| --- | --- | --- |
| Borrow | Purpose, exact amount, requested duration; ask only for missing facts | Request, proposed terms, next action, received funds and repayment |
| Provide liquidity | Intended amount and timing; explain the actual pool and its constraints | Contribution/return evidence, gross yield, fees and liquidity observation |
| Review | Summarize the selected request and missing evidence; reviewer chooses a decision | Exact version, wallet binding, identity evidence status and approval state |

Use a single shared shell and component set. Existing /borrow, /lend and /review
links select the corresponding tab. The operator view becomes advanced tools,
with local-only actions visibly distinguished. Evidence and system health live
in expandable sections. Keep live requests and the completed recorded example
explicitly separate. A role selector is a view selector, not authentication.

Ask one question at a time, offer useful answer chips, allow typed corrections,
and show a short deterministic review card before submission. A conversation
must not obscure money amounts, create acceptance from prose, or invent a rate.

## Backend findings that determine scope

- src/hosted/api.ts currently supports shared intake/review, published progress,
  recorded evidence and borrower wallet reads. It explicitly rejects native
  signing/actions. The assistant must obey the same boundary.
- src/shared/intake.ts has a borrower request schema only. A lender conversation
  needs a distinct non-binding intent record if persistence is required; it
  cannot silently treat a borrower request as a deposit. Actual deposits remain
  separate native actions with validated evidence.
- The per-request bridge provisions an isolated native run and handles exact
  approvals, receipts, signing, submission, repayment and withdrawal locally.
  Public review completion is not approval of LoanSet.
- Recognitium receipt issuance currently has a working authorized MCP handoff;
  direct API access previously returned 403. An API wrapper does not resolve that
  access issue. Preserve durable receipt-intent/recovery rather than blind retries.
- No KYC provider, identity schema or external wallet ownership proof is built.
  The backend currently manages synthetic test accounts.

## AI integration

Provider: Mistral, confirmed by the founder during planning. No API call has
been made with the supplied credential during this planning step. No credential belongs in this
plan, the bundle, browser storage, model messages, git or hook feedback.

Add a server-only assistant endpoint and a small configurable provider adapter.
Use MISTRAL_API_KEY and a configured supported model. Mistral supports structured
outputs and function calling; neither replaces application-side validation.
Sources: https://docs.mistral.ai/studio/conversations/structured-output and
https://docs.mistral.ai/studio/conversations/function-calling .

Allow bounded tools to read the selected request, fetch known vault information,
propose a validated draft and explain stored evidence. Submission requires the
user's explicit confirmation card and the existing validated endpoint. The model
does not receive approval, signing, arbitrary HTTP, shell or receipt-minting tools.
Review decisions and exact approval buttons also remain outside model authority.

Send only necessary synthetic fields and sanitized backend results to the model.
Do not send identity files, salts or private documents. Render model output as
text; claims such as funded/verified must come from typed backend state. Use
request/revision binding, timeouts, input/output limits, bounded tool turns,
server-side rate limits and a spend ceiling. Model failure falls back to the same
guided questions, labelled as a guided form rather than a live AI response.

## Wallet and identity evidence

The first implementation uses explicitly synthetic identity evidence. Display:
wallet address/network; wallet control evidence (demo backend-managed unless
actually proven otherwise); identity commitment; issuer/status; checked time;
agreement version and receipt. Show absent evidence as absent, never KYC passed.

For a new synthetic run, bind a domain-separated, canonically encoded commitment
to the identity document, wallet, network and random private salt inside the
agreement's committed document before sealing and approval. Keep the document
and salt outside public projections. Reuse reviewed commitment code; do not
invent a public identity scheme. A commitment proves a byte relationship, not
the truth of KYC or legal control of a wallet.

Changing a bound identity/wallet/document invalidates the proposed agreement
and requires a new version and fresh exact approvals. Never retrofit this into
the completed loan or mutate the expired 600-XRP offer. Browser self-approval is
not authenticated human identity. Real KYC and external-wallet authentication
remain future integrations.

## Small developer interface

Extract existing components behind an injected client/store, with explicit
setup and a runnable example. Two top-level functions can be convenient without
claiming there are no configuration or verification requirements:

    client.sealAgreement({ agreement, document, operationId })
    client.verifyLoan({ transactionHash, evidence, mode: 'online' })

The first canonicalizes/binds the existing agreement, journals issuance, stores
and verifies the receipt, and returns the agreement hash plus receipt/evidence
handle. It does not approve or sign the debt. The caller binds that hash in
LoanSet.Data before both signatures. Unknown issuance outcome requires recovery.

The second checks request/network/transaction bindings and returns separate
content, signature, receipt-authority and XRPL-inclusion results. A transaction
hash alone cannot locate a private receipt: evidence or an authorized resolver
is required. For offline mode, a saved bundle is required and authority/inclusion
remain unavailable unless supported proofs exist. Reading XRPL is an online
operation. Retain the current verifyOffline(bundle) helper and its honest limits.

## Delivery order and stop conditions

1. Shared shell and intention switch; reuse existing state, history, wallet and
   evidence components. Pass existing tests before adding AI. Keep current URLs.
2. Server-side assistant for borrower intake, exact review card, bounded tool
   validation and failure fallback. Verify one genuine provider response without
   any loan or receipt side effect. Extend the same interaction to lender intent
   and reviewer explanations only once the borrower path works.
3. Reviewer evidence card plus synthetic identity binding for new runs. Expose
   per-request bridge operations through the local operator UI, reusing service
   methods, not interpolated shell commands. Hosted viewers see actual progress
   and an explicit operator handoff. Do not expose local signing to public roles.
4. Extract the reusable evidence client if steps 1-3 are stable. Ship an exact
   setup/read-only verification example; label unresolved MCP issuance setup.
5. Freeze additions, test and rehearse before 12:30. If time is short, finish
   steps 1-2 and the existing evidence flow; leave new identity binding, local
   bridge UI and SDK conveniences documented as pending. Avoid a last-minute
   replacement of functioning signing/recovery infrastructure.

## Acceptance checks

- A new visitor can choose an intention, answer questions and see the exact
  request without visiting technical pages. Reload retains the same request ID.
- Two browsers observe the same request/review state; delayed or wrong-request
  model responses cannot replace another request's draft or final terms.
- Prompt injection, malformed tool calls and invented rates/amounts cannot
  approve, sign, mint receipts, fund a loan or change the bound agreement.
- Repeated confirmation creates one intake/intent. Backend retry/restart tests
  continue preventing duplicate funding and preserving receipt recovery.
- Reviewer sees identity evidence as synthetic/missing as appropriate. Changing
  a bound document or wallet fails verification and invalidates stale approval.
- The completed 100-XRP example still shows native refusal, repayment and the
  lender's 20-drop gross yield. The expired 600-XRP offer stays unfunded.
- AI timeout/rate limit displays a usable fallback without losing saved state.
- Public assets and logs contain no key, private document or salt. No metered
  public IVM publication or new financial commitment is implied by chat input.
- Chrome checks borrower, lender, reviewer and advanced evidence before deploy;
  keep a working rollback deployment. Record actual hook delivery separately
  from automatic capture, which remains unproven in this projectless context.

This plan does not authorize a new debt. A fresh native LoanSet still needs the
founder's explicit approval of its exact terms for the relevant demo roles.
