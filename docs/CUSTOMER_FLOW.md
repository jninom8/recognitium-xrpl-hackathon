# Customer interface and working request flow

September 12, 2026. The founder identified that the earlier browser page exposed
operator information without providing a usable customer journey. The root page
now starts with customer tasks. The technical workspace is at /operator.
The terminal health script remains a third view of the same backend.

| View | Working actions and information |
|---|---|
| Borrower | Enter amount, purpose and requested term; review; send a synthetic request; track broker review; inspect existing loan terms and exact approval when eligible |
| Lender | Read validated deposit, redemption and gross interest separately from fees; inspect chronological activity |
| Broker | Open protected intake inbox; start review; request revision; mark intake reviewed; inspect and approve an existing eligible exact loan agreement |
| Operations | Native setup/sign/submit/repay/withdraw, receipt recovery, full evidence and system health |

Open http://127.0.0.1:3000/?mode=recorded for the completed real test-network
loan in customer language. Select demo views at the top. The role selector
changes presentation; it does not authenticate or approve. The completed
agreement is read-only, with expired approval and no repeat loan.

## Try the request journey

On the backend PC, run `npm run demo:access` once, then restart `npm start`.
This creates an ignored .env with separate random borrower, broker and operator
codes; it never prints them and leaves an existing .env untouched. Open .env
locally to use your assigned role value in **Demo access**. Keep the operator
code with the backend owner. No service key or wallet is copied by this command.

1. Choose Borrower and **Request financing**. New requests explicitly use the
   live local workspace, even when starting from the completed demo.
2. Enter 1 to 10,000 test XRP, one of three purposes and a requested repayment
   window. Only synthetic structured fields are collected; there is no document
   upload or personal-information field.
3. Review the amount and requested term. Interest, fees and the final repayment
   schedule have not been offered. Sending is an intake action, not approval.
4. Open demo access with the borrower role code configured in ignored .env,
   then choose **Send for review**. The code stays only in tab memory, cleared
   by locking the workspace, changing roles or reloading.
5. In another browser connected to the same backend, choose Broker and open
   demo access with the separate broker code. The request appears in its inbox.
6. Start review, then mark reviewed or request revision. The borrower sees the
   refreshed status. Open reviews become stale when the revision or backend
   instance changes. Connection failures do not remove saved records.

These prototype roles share one demo borrower identity and one broker identity.
This is not a multi-tenant account system or independent wallet custody.
Use the [two-PC guide](TEAM_TESTING.md) for the shared-backend prerequisite.
No private code, wallet, service key or hook identity belongs in GitHub.

## Backend contract and persistence

- Browser-safe intake types: src/shared/intake.ts.
- POST /api/intake: borrower capability; synthetic request with client UUID,
  exact integer drops, requested days and purpose. Returns the saved record.
- GET /api/intake?role=borrower|broker: matching capability required. Private
  intake records are excluded from unauthenticated /api/state.
- POST /api/intake/:id/review: broker capability, exact request digest,
  expected revision and decision. Server-enforced transitions.

Records live in ignored data/intake/, using the atomic store and process lock.
Retrying the same client UUID and identical details returns the existing record,
preserving later broker review. Reusing an ID with changed details is rejected.
A pending synthetic payload can be retained in browser local storage for retry
after reload; no access code is stored there. If storage is unavailable, keep
the tab open for recovery.

Intake states are AWAITING_REVIEW, UNDER_REVIEW, NEEDS_REVISION and REVIEWED.
They never imply signing, funding or an issued receipt. The intake service has
no ledger or receipt-service dependency.

## Remaining bridge to a fresh loan

Next: prepare a fresh isolated loan from a reviewed request, carry its
amount/purpose/version into the agreement, present exact proposed terms, and
obtain both role approvals. Implement the durable external MCP issuance handoff
at this boundary. No automatic conversion currently exists. Requested business
durations must not silently become a different test schedule.

Customer deposit/repayment controls, browser wallets, real customer identity,
AI discovery and public hosting remain outside this slice. The native operator
workflow and reviewed historical evidence are preserved.

## Observed validation

31 local tests passed, including two HTTP clients, role/origin enforcement,
immutable details, duplicate submission reconciliation, broker revision checks
and a real server restart with no wallet/loan creation. Chrome checks covered
borrower/lender views, validation, exact six-decimal review, access gating and
mobile layout at 390x844. Browser testing stopped before entering an access code;
authenticated create/review/restart used isolated HTTP tests with test-only role
values. A second participant has not yet reproduced this flow.
