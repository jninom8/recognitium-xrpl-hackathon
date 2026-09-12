# Recognitium: choosing the lending experiment

Decision reviewed against all three morning slide decks on 12 September 2026.
This is planning, not a completed implementation or participant feedback report.

## Recommendation

**Track 1, open-ended, Vanilla: working-capital lending with evidence linked to
the loan.** Keep this choice if a mentor confirms the custom network is usable.

Open-ended means the pool keeps operating as new deposits and loan requests
arrive. Each loan still has a fixed term. Closed-ended means a dated funding
cycle: subscription, investment, then redemption. Neither term says whether
documents are private, nor whether access to the pool is permissioned.

The project has three distinct roles. A lender supplies capital, a supplier
needs a short loan while awaiting payment, and a broker reviews the request.
Recognitium binds a private evidence version and approval record to the actual
XRPL loan. XRPL performs the native lending transactions. Receipts do not turn
an unverified invoice into a truthful invoice or remove the broker's credit risk.

## Alternatives and their tradeoffs

| Option | Business fit | Useful developer questions | Weekend tradeoff |
|---|---|---|---|
| Track 1: continuous working-capital lending | Repeated supplier requests and reusable lender capital | Agreement-to-LoanSet mapping, co-signing, cover, liquidity, repayment and yield | Recommended: relevant to Recognitium and fewer phase constraints |
| Track 2: dated supplier-credit fund | Raise money for a fixed batch, lend during a defined period, redeem afterward | Phase transitions, immutable dates, rejected actions and realised-interest accounting | Strongest alternative: attractive feedback surface, but requires timed end-to-end execution |
| Track 1: minimal treasury lending console | One organisation lends idle assets and monitors repayment | Fastest path through the same native transactions and explorer evidence | Fallback if time is short; less differentiation unless the developer tooling is particularly useful |
| Either track, Loaded: restricted-access lending | Participation depends on explicit credentials or another concrete access rule | Credential issuance, access errors and interaction with vault/lending rules | Add only after the Vanilla cycle works and the extra primitive solves an actual use case |

The slides explicitly give Loaded no automatic scoring advantage. Recognitium's
external receipt API is not, by itself, an additional qualifying XRPL primitive.
Do not choose Loaded simply to make the architecture look larger.

Closed-ended is not inferior. Choose it when the real product is a fixed credit
campaign, or if the Track 1 environment cannot be made usable promptly and a
mentor demonstrates a working Track 2 starter. Replace the whole network, SDK
and acceptance checklist together. Do not claim both tracks after testing one.
The public Devnet clock cannot be accelerated from the application; schedule
the closed-ended demonstration to finish before submission.

## Why this fits what the organisers want

The challenge weights feedback at 40%, execution at 30%, use case/creativity at
20%, and presentation at 10%. Our strongest strategy is to build a narrow
complete loan journey and make its developer experience reproducible.

1. **It exercises the core protocol.** The deposit, loan, repayment and withdrawal
   are real validated transactions on the required development network.
2. **The product question belongs to this architecture.** The introduction puts
   underwriting off-chain and funding on-chain. Our experiment asks how a
   developer keeps the evidence and approval version attached to the resulting
   loan through signing, validation and recovery.
3. **It tests what a user can understand.** The lender must distinguish total
   value from available cash; the borrower must know whether a loan is proposed,
   signed or funded; the broker must know which evidence version was approved.
4. **The result can help the next team.** A focused example, an exact reproduction
   and a proposed correction are reusable even if the organiser never adopts
   Recognitium's product.

The existing LoanSet co-signing protects transaction terms. The additional
experiment is the history and version of off-chain evidence and its connection
to that signed transaction, not a replacement for native authorisation.

## The concrete journey

Build one native cycle before adding visual polish:

**Create vault -> deposit -> configure broker -> co-sign and fund a loan ->
repay -> withdraw capital and earned yield -> demonstrate one native refusal.**

Add a fictional supplier request and an agreement commitment before LoanSet.
After validation, link an execution receipt to the agreement, network, LoanID
and transaction hash. Export the evidence and show that altering the committed
document fails verification. This is offline verification of existing evidence;
the XRPL loan is settled online.

If a transaction succeeds but receipt issuance fails, the application should
show that precise state and recover the receipt without creating a second loan.
This is a useful integration test and a candidate reusable example. It remains
a proposed experiment until executed.

## Developer journey as evidence

For each milestone, record what we tried, the documentation we followed, the
exact versions and input, the actual ledger result, the time taken, what helped,
what obstructed us, and the smallest useful improvement. Select the strongest
reproduced findings rather than accumulating complaints.

the integration lead and Codex handle the protocol implementation and raw technical evidence.
the frontend lead leads frontend, business story and the participant-written report, with
the integration lead contributing his own experience. The required hook captures selected
developer activity; it does not replace the manual report. Its external data
collection needs participant consent before activation. It is not enabled yet.

The manual report rule is explicit: "Written by you, not generated."
Codex may organise the evidence, but the integration lead and frontend lead author the final account.

## Arguments to use with mentors and judges

"We chose an open-ended vault because small businesses need funding continuously.
Each loan has a repayment date, but the pool does not need to close whenever a
new supplier arrives."

"Your protocol already separates off-chain underwriting from on-chain funding.
We are testing the join between them: which evidence version was approved, which
loan was signed, and what the ledger actually executed."

"Our contribution is a working cycle another developer can reproduce, including
one refusal and the explanation a user needs to understand it. We will report
what worked, what cost us time, and the precise change that would help the next
developer."

These are proposed positioning statements. Use past tense only after the
corresponding implementation and verification have actually succeeded.

## Current blocker and rules to confirm

The custom Track 1 endpoint timed out in the initial read-only probes. It is
not a confirmed protocol bug. Ask a mentor for a known-working connection and
version combination before investing further in that environment.

There is a presentation-duration conflict. The challenge PDF, page 6, says
"5 min presentation + live demo" and "3 min Q&A". The Notion brief says four
minutes and two minutes. Keep both passages recorded in DEVEX_LOG; ask which
governs. Prepare a four-minute core with a detachable fifth minute meanwhile.

## Sources

- [Morning challenge slides](reference/XRPL%20Lending%20Protocol%20Hackathon%20Challenge.pdf), pages 2-8: tracks, required flows, Vanilla/Loaded, deliverables and scoring.
- [Lending introduction](reference/final%20lending%20intro.pdf), pages 4, 8, 10, 12 and 16: hybrid architecture, application role and vault lifecycles.
- [Developer workshop](reference/XRPL%20Workshop%20-%20Lending%20Protocol%20Hackathon.pdf), pages 7 and 25: network distinctions and reference application.
- [Detailed event brief](https://holly-pixie-8e9.notion.site/XRPL-Lending-Protocol-Hackathon-3152f6835886823ab31f01cd9d1f6ded): network/SDK matrix, submission schedule and detailed requirements.
- [Official VaultWithdraw reference](https://xrpl.org/docs/references/protocol/transactions/types/vaultwithdraw): insufficient-liquidity behavior, checked 12 September 2026. Verify the selected event server separately.
