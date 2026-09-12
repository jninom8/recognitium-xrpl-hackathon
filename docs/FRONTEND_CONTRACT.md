# Frontend integration contract

Import types from `src/shared/contract.ts`. This file is browser-safe and has no
wallet or service dependency. Coordinate changes to its version before changing
field names. The small `web/` interface is a functional starting point for the
frontend lead; replace its presentation without replacing the backend semantics.

Run `npm ci`, `npm run build`, `npm start`; open http://127.0.0.1:3000.
`GET /api/state` returns the live local view, including disconnected/empty state.
It never turns a failed connection into a fixture. Unit fixtures are explicitly
labelled in `tests/fixtures.ts`; no mock loan is loaded into the live UI.

| Endpoint | Capability | Purpose |
|---|---|---|
| GET /api/state | local read | roles, requests, checks, native cycle evidence |
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

POST requests require `Content-Type: application/json` and a Bearer capability.
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
