# Build handoff

This is the implementation specification and acceptance checklist. The native
cycle and receipt integration are now implemented and verified; read
[STATUS](STATUS.md) for evidence. The recommended next gate is G7, the integrated
browser demonstration, described in [FRONTEND_CONTRACT](FRONTEND_CONTRACT.md).

## Target and fixed scope

Track 1 Vanilla, open-ended vault, synthetic supplier request, test XRP, one
lender, one borrower, and one broker/vault-owner account. Lending V1 requires
the broker owner and vault owner to be the same account. Roles in the interface
may be separate views; do not invent separate ownership unsupported by the ledger.

The native demonstration is mandatory. Recognitium binds the private agreement
and actual execution. Optional MCP discovery makes the request accessible to an
agent. It must not become a dependency for finishing the basic lending cycle.

## Proposed implementation shape

Use TypeScript throughout: Node for the server/CLI and Vite + React for the small
frontend. Pin exact dependency versions after confirming the event SDK matrix.
No extra database service, production account system or paid LLM is required.
Use simple durable local run records with atomic writes for this single-process
prototype. Keep private run state under ignored data/ and wallets separately.

Implementation boundaries:

- `src/xrpl/`: connection, account setup, transaction preparation, co-signing,
  submit/lookup, vault/broker/loan reads and balance accounting.
- `src/recognitium/`: hash commitment, receipt call, verification and export.
- `src/requests/`: agreement versions, approval state and recovery journal.
- `src/server/`: local API; seeds and service credentials never enter frontend.
- `web/`: lender, request/reviewer and evidence screens.
- `scripts/`: health probe, native cycle and independent bundle verifier.
- `tests/`: meaningful state/recovery tests and gated Devnet integration tests.

These boundaries guided the implementation. Use the current README and frontend
contract for runnable commands; preserve the boundaries and evidence when editing.

## Build gates, in order

| Gate | Work | Pass condition |
|---|---|---|
| G0: environment | Review hook plan/consent; activate in this project; test connectivity and get server build/amendments; pin SDK | Hook capture and one real delivery checked; correct event ledger reachable, versions recorded |
| G1: accounts and vault | Fund only test accounts; owner creates vault and broker; lender deposits; configure/deposit needed cover | Validated hashes, object IDs, reserves and balances saved |
| G2: loan | Agree one immutable set of terms; both parties sign identical LoanSet; submit once | Validated success, LoanID and actual borrower funding verified |
| G3: repay and redeem | Repay through LoanPay; withdraw capital and nonzero realised yield | Debt/share/balance changes reconcile; fees and faucet funds kept separate |
| G4: native failure | Attempt a validly formed withdrawal or loan violating a documented liquidity/cover rule | Actual native rejection and unchanged relevant state retained; never replace with a UI-only refusal |
| G5: receipts | Create request-bound agreement commitment; bind its hash into signed metadata; issue execution receipt after validation | Document/receipt/transaction links verify; modifying any bound field fails |
| G6: recovery | Interrupt after XRPL validation and before receipt recording; also test uncertain submission | No duplicate loan/funding; recover same transaction and complete missing evidence |
| G7: visible product | Connect three role views to real adapter; show transaction links and proof export | Complete flow repeatable from clean setup; fixtures clearly separated |
| G8: optional AI | Use existing MCP to discover/consult a synthetic request, then prepare terms | Agent proposes, person approves exact operation, resulting transaction is tied to approved request |
| G9: submission | Reproduce independently, document setup and findings, rehearse | Human report, deck, README, links, disclosure and backup ready by official deadline |

Do not spend more than one short debugging cycle on an unconfirmed event endpoint.
Take the exact read-only error to a mentor. If Track 2 is selected, replace G1-G4
with its subscription/investment/redemption sequence and all required phase
rejections; see PROTOCOL_NOTES. Do not silently switch networks to get green output.

## Agreement and commitment contract

The agreement manifest must include a schema/version, a unique request ID,
document version, document commitment, relevant XRPL accounts, network identity,
VaultID, LoanBrokerID, asset, principal, all fee/rate/schedule fields, expiry and
policy version. Any change creates a new agreement version and invalidates
earlier approval. No money-valued float arithmetic: preserve exact protocol units
and use decimal strings or integer units with explicit conversion.

Define one deterministic serialization and test it across server and verifier.
Either use a reviewed canonical-JSON implementation or an exact fixed byte format;
do not hash arbitrary pretty-printed JSON. Salt sensitive document commitments
with cryptographically generated randomness and keep salts private. Hash the
exact final manifest bytes; save those bytes for independent verification.

Before either signature, place the agreement hash in supported signed transaction
metadata. The spec has LoanSet.Data (at most 256 bytes); common Memos are another
candidate. Pick one supported by the actual event SDK/server, then prove both
signers sign it and the validated transaction retains it. Do not mutate any
field after signing. The agreement hash is available before issuance of the
agreement receipt, avoiding circular receipt/transaction dependencies.

For this application's gated path, the agreement receipt must be verified before
loan submission. This is an application rule; the XRPL protocol does not require
a Recognitium receipt from every client. Native LoanSet already supplies dual
authorisation and atomic origination/funding.

## State, idempotency and evidence

Suggested separate states:

`DRAFT -> AGREEMENT_LOCKED -> AGREEMENT_RECEIPTED -> SIGNED -> SUBMITTED`

Then one of `VALIDATION_UNKNOWN`, `REJECTED`, or `VALIDATED_RECEIPT_PENDING`,
followed by `FUNDED_WITH_EVIDENCE`. Repayment and withdrawal have their own
transaction/evidence states. Never label a timeout as a failed transaction until
the signed transaction's status and LastLedgerSequence expiry are resolved.

Persist request/version, signed transaction hash and relevant last ledger bound
before submitting. Retain signed blobs only in private run storage; they may
remain executable until expiry. If a receipt request fails after XRPL succeeds,
retry only the missing evidence operation. Check whether the receipt API offers
idempotency before promising one charge on retry; duplicate evidence receipts
must never trigger duplicate lending. Keep the final execution manifest stable
across retries and label unresolved receipt issuance accurately.

Each public evidence bundle includes synthetic manifest bytes, permitted salts,
agreement/execution receipt objects, network identity, validated transaction JSON
and metadata, object IDs, balance snapshots, ledger index, and verification
instructions. Check for seeds/API keys before export. Bind event time to XRPL's
validated ledger data; keep receipt commitment time separate from execution time.

Display three checks independently: content/hash consistency, receipt authority
membership against a known anchor, and XRPL validation. Offline evidence can
recheck saved commitments; fresh authority/ledger status needs an online query.

## Essential tests

- Content, amount, borrower, network, expiry or metadata modification invalidates
  approval/verification. A different same-looking JSON encoding must not pass
  unless it is deliberately canonicalized by the documented format.
- A missing/invalid agreement receipt blocks this application's submission path.
- Broker/borrower signatures cover the same final transaction and commitment.
- Two submission clicks, timeout and process restart cannot originate twice for
  the same agreement. An unknown transaction remains unknown until resolved.
- Receipt failure after validation does not roll back history or re-lend funds.
- Native refusal is demonstrated on the event network with actual metadata.
- Reported yield is calculated from ledger changes, excluding all faucet money,
  fees and leftover principal. Nonzero yield must survive asset rounding.
- Mock, disconnected and validated states are visibly different.

Tests prove this implementation's behavior in their scope. Do not add claims
about quantum hardware, complete offline settlement or elimination of credit risk.

## Team and execution priorities

Integration lead with Codex: G0-G6, evidence and recovery. Frontend lead: role
screens against a shared fixture contract, user-facing status explanations,
observations, participant-written report and pitch. Share the state schema early.
Record start/end times as work happens; do not backfill invented timings.

Official submission schedule from the event page: Sunday 12:30 code freeze,
13:00 submission, 14:00 pitches. Saturday's original timetable in PLAN is a
planning target, not progress evidence; rebase it to the actual time at session
start. Complete the native cycle before optional AI/market discovery. Preserve
time for clean setup and one other person's reproduction before submission.
