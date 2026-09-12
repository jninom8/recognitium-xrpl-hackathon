# Recognitium: hackathon execution plan

12 September 2026. Team: the integration lead and frontend lead. Hardware work is paused.
This is the execution plan. The native lending/receipt cycle is implemented and
verified; [current status](docs/STATUS.md) supersedes the original planning baseline
retained below. The next recommended gate is the integrated frontend demonstration,
followed by a fresh rehearsal and participant report.

The canonical hackathon home is now the separate Desktop repository. Start a
fresh implementation session using [START_HERE.md](START_HERE.md), then read
[docs/BUILD_HANDOFF.md](docs/BUILD_HANDOFF.md). Current evidence and verified hook
activation are in [docs/STATUS.md](docs/STATUS.md). The timetable below began
before the morning-material review; rebase elapsed Saturday slots to the actual
time, preserving the Sunday submission deadline and the native-flow priority.

## The objective

Build a complete, reproducible lending experiment and give Ripple useful,
evidence-backed improvements to its tools. The score is 40% developer feedback,
30% XRPL execution, 20% use case/creativity and 10% presentation.

The **code freeze is Sunday 13 September at 12:30 CEST**, submission is at
13:00, and presentations start at 14:00. Presentation duration needs mentor
confirmation: Notion says four minutes plus two minutes of questions; the
morning challenge PDF, page 6, says five plus three. Rehearse a four-minute
core and an optional fifth minute while that discrepancy remains unresolved.
The event's 21:00 venue closing time is not the
submission deadline. These details come from the
[organizer's detailed brief](https://holly-pixie-8e9.notion.site/XRPL-Lending-Protocol-Hackathon-3152f6835886823ab31f01cd9d1f6ded),
read in full through its public page API on 12 September.

The [Luma registration terms](https://luma.com/t4ttb973) permit disclosed use
of existing code, libraries and AI assistance. Build and identify the new work
done during the event. The broad Luma announcement and detailed brief differ
on track/prize wording; confirm the current prize allocation with organizers.
This plan uses the detailed two-track technical brief for its build targets.
The three morning PDFs are preserved under [reference](reference/). They confirm
the two tracks, the scoring and the absence of an automatic Loaded bonus.
The challenge PDF adds an explicit rule for the manual report: "Written by you,
not generated." the integration lead and frontend lead must author that report in their own words.

## Recommended project

**Recognitium: private evidence, receipted agreements, XRPL lending.**

A small supplier needs working capital while waiting for a customer payment.
A lender supplies capital to a vault. A broker reviews the supplier's private
supporting documents and proposes a loan. Recognitium records commitments to
the precise document version, policy and agreed terms, then links that record
to the actual XRPL loan, repayment and withdrawal.

XRPL manages capital and the loan. Recognitium provides the evidence connecting
the off-chain request and decision to that loan. The useful addition is the
history behind the lending decision: the exact evidence reviewed, the accepted
version, and its relationship to the on-chain result. LoanSet already requires
both broker and borrower signatures; do not claim we invented that protection.
[Official co-signing tutorial](https://xrpl.org/docs/tutorials/defi/lending/use-the-lending-protocol/create-a-loan).

Use fictional businesses and test funds. Receipts establish commitments and
history, not invoice truth, creditworthiness or worldwide uniqueness of an
invoice. Underwriting remains a broker decision. The protocol's lending model
uses off-chain underwriting; it does not automatically enforce invoice collateral.
[Lending concepts](https://xrpl.org/docs/concepts/tokens/lending-protocol).

## Track and environment

Choose **Track 1, Vanilla**, subject to an immediate connectivity check with a
mentor. The open-ended vault fits a continuing working-capital market and avoids
the additional lifecycle dates of Track 2.

This describes the vault lifecycle, not document privacy or public access.
Each loan still has a fixed term. Open-ended withdrawal eligibility does not
guarantee available cash: the official VaultWithdraw reference documents an
insufficient-liquidity rejection. Show total value, deployed capital and available
liquidity separately. Confirm the exact behavior on the chosen event build.
[VaultWithdraw reference](https://xrpl.org/docs/references/protocol/transactions/types/vaultwithdraw).

The alternatives, business arguments and conditions for changing this decision
are in [TRACK_DECISION.md](TRACK_DECISION.md). Recognitium receipts alone do not
make the submission Loaded; that flavour requires another qualifying XRPL
primitive beyond XLS-65/66.

| Setting | Track 1 requirement from the brief |
|---|---|
| Protocol | Lending V1, open-ended Single Asset Vault |
| Network | Custom hackathon Devnet |
| WebSocket | `wss://lending-hackathon.dev.ripplex.io:51233` |
| RPC | `https://lending-hackathon.dev.ripplex.io:51234/` |
| Faucet | `https://lending-hackathon-faucet.dev.ripplex.io/accounts` |
| Explorer | `https://custom.xrpl.org/lending-hackathon.dev.ripplex.io:51233/` |
| Library | Stable xrpl.js, exact tested version pinned |

The npm registry reported stable `xrpl` 5.2.0 during planning. Verify this
combination against the V1 network before locking it in package-lock.json.
Track 2 instead specifies public Devnet and `xrpl.js@5.2.0-beta.0`; do not mix
the two environments. Track 1 must retain V1 behavior: the brief warns that
enabling V1.1 on that ledger changes eligibility for new loans.

Use test XRP for the first complete cycle. The brief explicitly says the
linked RLUSD test faucet is Testnet-only, not Devnet. A simulated business
amount must not be confused with real euros or a genuine RLUSD balance.

## Minimum demo and acceptance evidence

| Step | Visible result | Retain as evidence |
|---|---|---|
| 1. Create vault | Open-ended vault exists | Validated VaultCreate hash and VaultID |
| 2. Lender deposits | Shares issued, capital available | VaultDeposit hash and before/after values |
| 3. Configure broker | Broker attached to vault; cover configured | LoanBrokerSet and required cover transaction hashes |
| 4. Request and agreement | Supplier request, document commitment, broker approval, borrower acceptance | Versioned agreement and receipt, with synthetic input |
| 5. Originate and fund | Co-signed LoanSet succeeds; borrower receives proceeds | LoanID, transaction metadata and borrower balance change |
| 6. Repay | At least one LoanPay succeeds | Validated payment and updated debt |
| 7. Withdraw with yield | Lender receives capital and nonzero earned yield | VaultWithdraw, shares burned and fee-separated calculation |
| 8. Native refusal | Deliberate insufficient-liquidity or other documented guardrail rejects | Exact attempted transaction, actual result code and unchanged relevant balances |
| 9. Offline evidence check | Exported agreement/receipt verifies with network disabled; modified document fails | Proof bundle, verification output and tamper control |

Drawdown means actual funds reaching the borrower. Verify whether the selected
event server follows the inspected XLS-66 specification: LoanSet itself creates
the loan and transfers the principal less origination fees to the borrower.
There is no LoanDraw in its transaction list. Retain actual borrower balance
changes to demonstrate the required drawdown.

Complete steps 1-3 and 5-8 in a script before spending time on styling. Use a
short loan schedule with positive interest and enough precision for nonzero
yield. Check rate units, rounding and final balances against ledger results.
Do not count a faucet top-up as yield. Keep faucet funding visible separately.

The required failure must come from XRPL, not just a frontend validation error.
Record a rejected transaction as rejected, even if it is included in a ledger
and charges a transaction fee.

## Supply, demand and receipts

The initial prototype needs one lender and one borrower, not a large market.
Use a fixed pair or deterministic matching on asset, amount, term and expiry.
An optional MCP interaction can express and discover a request; no autonomous
credit approval or fund transfer is needed to demonstrate coordination.

The current Recognitium MCP exposes offer/demand publication, search, an
acknowledgement receipt and hash sealing. Its live lending search returned no
matching signals during this investigation. Seeded demo offers must be labelled
as demo data. Publishing and receipt minting may be metered; no public offer or
charge was made during planning.

Retain two kinds of evidence:

1. Agreement evidence: a salted commitment to the private evidence manifest,
   parties, agreed terms, policy version, expiry and request identifier.
2. Execution evidence: the loan ID, network, validated XRPL transaction hash,
   result and agreement reference, recorded after validation.

Where supported, commit the agreement reference in the co-signed transaction's
Memo and verify the round trip. Never put private invoices or salts on-chain.
The evidence packet must distinguish hash consistency, attachment to a known
authority history and XRPL validation. A self-consistent hash alone does not
authenticate a receipt's issuer. Use a known anchor/lineage or an independently
retained membership check for the claimed authority.

Receipt issuance and XRPL submission are separate operations. If XRPL succeeds
and the execution receipt call fails, show `VALIDATED_RECEIPT_PENDING` and retry
the receipt only. Do not disburse twice. If submission times out, query the same
transaction hash and its expiry before deciding whether another submission is
needed. This recovery path is a useful integration contribution.

Offline verification is a demo feature. New XRPL settlement still requires
network validation. The existing offline-payment model detects a cloned-state
double spend on reconciliation; it is not a basis for claiming unconditional
offline payment finality at this event.

## Responsibilities and schedule

the integration lead leads protocol integration, Recognitium adapter and test evidence, with
Codex supporting implementation and verification. the frontend lead leads frontend,
business narrative, the developer report and pitch. Agree the UI/API states
together, then work independently. Every blocker goes into the log immediately.

| Paris time | the integration lead / integration | the frontend lead / frontend, feedback, pitch | Exit condition |
|---|---|---|---|
| Now to 12:30 Saturday | Confirm track/network; obtain mentor-backed starter; first validated transaction | Confirm submission/form details; start feedback log and three-role wireframe | Correct environment and working basic transaction |
| 12:30-15:00 | Vault, deposit, broker, loan and repayment script | Implement screens against agreed fixture shape; capture each integration issue | First funded and repaid loan |
| 15:00-16:30 | Yield withdrawal and native rejected transaction | Evidence panels, result-code wording, first report draft | Entire mandatory Track 1 flow |
| 16:30-18:30 | Add agreement/execution receipts and offline export | Borrower-to-broker story, document-version/tamper view | Distinctive demo works end to end |
| 18:30-19:00 | Re-run clean fixture; triage failures | Select strongest three feedback findings | Recorded successful run |
| 19:00-20:00 | Dinner, then prepare stand-up | One-minute progress summary | Honest status and one precise mentor request |
| 20:00 | Team stand-up | Team stand-up | Feedback from mentors |
| 20:15-21:00 | Save working checkpoint and evidence | Draft slides and reproducible feedback | Backup ready before campus closes |
| Evening | Optional short remote cleanup; preserve sleep | Same | No new product scope |
| Sunday 08:30-10:30 | Run complete flow three times; fix blockers | Finish report; keep frontend focused | Reliable demonstration and evidence bundle |
| 10:30-11:30 | Validate explorer links and clean setup | Attend 11:00 pitch coaching; confirm duration and rehearse | Core narrative fits confirmed slot |
| 11:30-12:15 | Fresh-clone/setup check, no secrets, pinned dependencies | Final report at most three pages; slides at most ten | Submission package complete |
| 12:15-12:30 | Internal freeze and backup video | Submission checklist | No missing required artifact |
| 12:30-13:00 | Official freeze, then submit before 13:00 | Verify submission confirmation | Accepted submission |
| 14:00 onward | Technical answers and live evidence | Lead pitch at confirmed duration | Demo and Q&A |

If the custom network is unavailable, take the exact endpoint and error to a
mentor immediately. Do not spend the afternoon debugging an unconfirmed
endpoint. A track change requires replacing the environment, SDK and acceptance
checklist together. If the native cycle is late, cut optional AI, extra assets
and live market discovery first. Keep the required native flow and report.

## Developer feedback strategy

Use [DEVEX_LOG.md](DEVEX_LOG.md) during the work. The final
[DEVELOPER_FEEDBACK.md](DEVELOPER_FEEDBACK.md) is a maximum-three-page report at
the public repository root. The current file is a blank organizational template,
not a submission. The morning challenge PDF, page 7, explicitly requires human
authorship. Codex can preserve commands, results and reproduction evidence;
the integration lead and frontend lead write the personal experience and final assessment themselves.
Capture successes as well as friction. Three
specific findings with reproductions and proposed fixes are stronger than a
long list of complaints. A reusable co-signing/recovery example or documentation
correction is a useful bonus, if the full cycle is already complete.

At each milestone retain the starting documentation link, exact command and
versions, expected versus observed outcome, elapsed time, workaround and proposed
improvement. Never invent a bug to fill the report. A clear successful behavior
with a reproducible example is also useful feedback. the frontend lead owns the frontend
journey and records where users cannot understand a state; the integration lead owns the protocol
journey and records what the ledger actually accepts.

The strongest candidate contribution is a small public reproduction package for
the complete lending cycle and one failure/recovery path. It should let a second
developer reproduce the finding from a clean checkout. The event score gives
70% to feedback and execution together; the UI should expose evidence for both.

The required [DevEx hook](https://github.com/RippleDevRel/xrpl-devex-hook) runs
on each developer's machine. Its privacy documentation describes selected XRPL
prompts, output excerpts, retries and analyses sent to the organizer under a
pseudonym. It requires explicit consent and project-local installation.
Review and enable it for the isolated hackathon workspace, then verify capture
and delivery. The planning step did not enable it; subsequent activation and
accepted runtime delivery are recorded in STATUS and the shared developer journey.

## Submission inventory

- Public GitHub repository containing the event work and declared dependencies.
- README with track/flavour, exact network/library versions, setup and every
  XLS-65/66 transaction used.
- Verified on-chain transaction links, including the native rejection.
- Slides, at most ten; use six unless another slide earns its time.
- Manual developer report at repository root, at most three pages.
- Completed DevEx feedback form with the required team information.
- Local backup demo video and a clean, self-contained evidence export.

Use a new, public-safe repository for the adapter and prototype. Do not publish
the existing private Recognitium repository. Disclose Recognitium's pre-existing
software/API, sample code and AI assistance. No public repository or deployment
has been created by this planning step. Suspected protocol security issues go
privately to a mentor before presentation.

## Verified starting point

- Recognitium MCP responded live; the authority reports a classical engine.
- The existing offline model passed all 14 tests on this machine on 12 September.
  One test deliberately accepts two offline branches and detects the conflict
  at deposit; keep that boundary in any explanation.
- The local receipt verifier and commitment code exist in
  `C:\Recognitium - Black Hole Binary\recognitium_client`.
- The organizer's reference app is available, but its documented full setup
  includes Auth0 and MongoDB. Borrow focused examples after checking their
  licence/version instead of taking on that entire stack by default.
- An initial HTTP server_info request to the custom Track 1 endpoint timed out
  after 18 seconds; a separate WebSocket connection timed out after 10 seconds.
  This is a local connectivity observation, not a protocol bug. Have a mentor
  confirm the endpoint and test from the venue before choosing the final track.

That initial gate has passed, including repayment, yield and native refusals.
Continue with the [integrated UI milestone](docs/FRONTEND_CONTRACT.md), preserving
the proven cycle while making it understandable and repeatable.
