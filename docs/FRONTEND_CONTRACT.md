# Frontend integration contract

Import types from `src/shared/contract.ts`. This file is browser-safe and has no
wallet or service dependency. Coordinate changes to its version before changing
field names. The white `web/` interface now consumes the shared snapshot for its
request, lender position, evidence and system-status views.

The [white fintech design brief](FRONTEND_DESIGN.md) now provides an original
interactive concept, the proposed field additions and ordered delivery gates.
Use the [reproduction and recovery handoff](REPRODUCTION_AND_RECOVERY.md) for the
teammate's checks and the four remaining bounded failure cases. The concept's
fixture controls are not live API implementations. For the implemented interface
and two-PC workflow, start with [TEAM_TESTING](TEAM_TESTING.md).

## Implemented synchronization, September 12 at 19:00 Paris

`GET /api/state?mode=live|recorded` returns `recognitium.dashboard.v1`, a backend
instance ID, revision, observation time, public cycle summary, request evidence,
action eligibility and service health. The agreement format remains
`recognitium.lending.v1`; dashboard changes do not change signed commitments.
Private documents, salts, signed blobs, keys and internal records are excluded.

The browser polls every three seconds while visible and after an action. It
discards delayed snapshots and invalidates an open review if its request hashes,
eligibility or backend instance change. Exact terms in a review never update
silently. Backend loss preserves displayed funding and pauses actions. Ledger
health gates native actions; receipt recovery can proceed without ledger access.
`npm run health -- --watch` consumes the same endpoint and revision contract.

Published mode verifies the reviewed real bundle offline and disables mutations.
It never becomes the live source automatically. Its stored signatures do not
invent human approval timestamps. Fresh online verification remains a separate
CLI operation. Current available vault cash and share value are not polled.

System status reports event-server identity, public receipt-service availability
and whitelisted hook registration/counters. `POST /api/health/check` is a
rate-limited read-only check, subject to Host/Origin controls. It neither flushes
the hook nor signs, submits or mints receipts. A reachable receipt service does
not establish issuance permission or validate an individual receipt.

Validation: 27 local tests pass, including two HTTP clients observing exact role
approvals and reconciling concurrent writes. Browser checks covered desktop and
mobile, plus a real idle backend stop/restart with a review open. These are not
a teammate reproduction, concurrent funding test or fresh native loan run.

## Recommended next milestone, September 12 at 17:29 Paris

Prioritize G7: a complete, understandable browser demonstration of the proven
lending/evidence flow. Native cover and impairment experiments remain selected,
but follow the first successful integrated rehearsal. The table below retains
the original handoff; the checkpoint above records the parts now implemented.

The refreshed event brief at 15:27 UTC still weights feedback 40%, technical
execution 30%, use case 20% and presentation 10%. The challenge slides say Loaded
receives no automatic advantage. The interface should expose the evidence and
the user's decisions; visual polish alone does not satisfy this milestone.

| Owner | Next work | Acceptance condition |
|---|---|---|
| Frontend lead | Three views: lender position, exact request/approval, execution/evidence | A reviewer follows the request, both approvals, funding, repayment and withdrawal without reading raw JSON |
| Integration lead | Complete the state contract and connect operator actions | Actions target the selected run; amounts, accounts, phases and errors remain consistent with the API |
| Integration lead | Make new runs and receipt handoff usable | A fresh rehearsal cannot reuse completed approvals/journal IDs; MCP issuance and receipt recovery are explicit while direct issuance returns 403 |
| Both | Rehearse a fresh synthetic flow and verify from a clean clone | No hidden terminal repair; funding reconciles once; changed-document rejection and native refusal are understandable |
| Participants | Select three observed feedback items and write the manual account | Precise reproductions and proposed improvements support the human-written final report |

### Current integration gaps

- The interface now exposes operator actions, receipt-ID recovery and a typed
  public cycle. Published browser evidence checks are offline; fresh online
  transaction and receipt verification remains in the standalone CLI.
- The native runner uses fixed cycle/request/operation IDs. Add explicit run
  isolation for another rehearsal, preserving previous evidence and requiring
  fresh exact approvals. Do not simulate a new run by deleting history.
- The live cycle used authorized MCP receipt issuance and receipt-ID recovery.
  Receipt-ID recovery is now visible. External MCP issuance still needs a
  durable prepared-attempt handoff, or direct access must be fixed before
  describing the workflow as fully automated.
- Distinguish connection status, fresh validation, recorded real runs and
  fixtures. A readable recorded-evidence mode is a useful connection fallback;
  label offline checks by their actual limits.

The views should answer: what did the lender deposit and redeem; what exact
terms did each person approve; which document commitment and receipt link to
which validated transaction? Show XRP amounts, ledger timestamps, due status,
native result codes and separate content/authority/ledger checks. Keep JSON
available under details rather than making it the primary workflow.

The checkpoint is one complete story, one native refusal and changed-document
rejection, with verification from a second checkout. Additional assets, DEX,
freeze workflows and AI discovery remain optional after that checkpoint. Live
IVM publication still needs approval of its exact text, cost and expiry.

## Existing API

Run `npm ci`, `npm run build`, `npm start`; open http://127.0.0.1:3000.
`GET /api/state` returns the live local view, including disconnected/empty state.
It never turns a failed connection into a fixture. Unit fixtures are explicitly
labelled in `tests/fixtures.ts`; no mock loan is loaded into the live UI.

| Endpoint | Capability | Purpose |
|---|---|---|
| GET /api/state | local read | roles, requests, checks, native cycle evidence |
| GET /api/state?mode=recorded | local read | verified offline, read-only published real evidence |
| GET /api/evidence/published | local read | fixed reviewed public bundle download |
| POST /api/health/check | local read with Host/Origin checks | rate-limited service availability checks |
| POST /api/connect | operator | connect and read event server identity |
| POST /api/setup | operator | test faucet, vault, lender deposit, broker, cover |
| POST /api/prepare | operator | prepare synthetic request and exact LoanSet |
| POST /api/requests/:id/approve/broker | broker | approve both exact hashes |
| POST /api/requests/:id/approve/borrower | borrower | approve both exact hashes |
| POST /api/requests/:id/agreement-receipt | operator | receipt approved commitment |
| POST /api/requests/:id/sign | operator | both test wallets sign approved payload |
| POST /api/requests/:id/submit | operator | lookup, then submit/recover same blob |
| POST /api/requests/:id/execution-receipt | operator | receipt validated execution |
| POST /api/requests/:id/recover-receipt | operator | attach verified receipt by ID |
| POST /api/refusal | operator | native liquidity refusal before repayment |
| POST /api/repay | operator | one scheduled LoanPay using stored debt |
| POST /api/withdraw | operator | lender redemption and realised-yield accounting |

Mutation POST requests require `Content-Type: application/json` and a Bearer capability.
Ordinary actions have `{}` bodies; approval bodies are
`{"agreementHash":"...","transactionDigest":"..."}`. Recovery takes
`{"stage":"agreement|execution","receiptId":"DG-...","hash":"..."}`.
The private capabilities are three distinct environment values, each at least
24 ASCII letters/digits/underscore/hyphen characters. They are prototype access
controls, not production user authentication. Never store them in the frontend
bundle, source control, URL or persistent browser storage. A role switch is not
an approval. Explicit human approval is required even with an operator capability.

The server binds loopback, checks Host and Origin, and does not enable CORS.
For Vite, proxy `/api` through the same local origin; do not relax role checks.
All writes use the same process lock as the CLI, preventing overlapping writers.
Busy writes fail with 409 and may be retried; approval hashes stay unchanged.

Amounts are integer drops as strings. Interest rates are tenths of a basis point:
10000 means 10% annually. The prepared synthetic demo proposes 100 test XRP,
one 60-second payment, no broker fees, 200 test XRP deposited and 20 test XRP cover.
Those are proposed parameters until humans approve and the ledger validates.
Theoretical interest is about 19 drops; acceptance requires measured nonzero
withdrawal yield, not that estimate.

Show content consistency, authority lookup and XRPL validation separately.
`VALIDATION_UNKNOWN` is not failure. `EXPIRED_UNRESOLVED` never permits a replacement
loan automatically. `VALIDATED_RECEIPT_PENDING` means funding happened but its
receipt is missing. `FUNDED_WITH_EVIDENCE` requires reconciled borrower funding.
Receipt issuance time and XRPL execution time are separate facts.
