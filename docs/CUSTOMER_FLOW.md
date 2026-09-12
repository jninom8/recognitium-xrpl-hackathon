# Customer interface and working request flow

**Hosted demo:** https://recognitium-xrpl-hackathon.vercel.app/ · [Two-person access and testing](HOSTED_TESTING.md). Shared request review is live; native signing remains local.

September 12, 2026. The founder identified that the earlier browser page exposed
operator information without providing a usable customer journey. The root page
now starts with customer tasks. The technical workspace is at /operator.
The terminal health script remains a third view of the same backend.

The entrance now asks **What would you like to do?**: Request funding or
Provide funding. Technical roles and live/recorded switches are removed from
the normal customer path. New visitors do not inherit the shared historical
loan. A customer loan is displayed only when its request ID matches an intake
in the authenticated workspace. This is a presentation boundary, not a new
multi-tenant authentication system.

| View | Working actions and information |
|---|---|
| Request funding | Enter amount, purpose and preferred repayment time; review; send a synthetic request; track review. Fresh offer preparation remains pending |
| Provide funding | Plain-language explanation of interest, loss and withdrawal risks; link to the completed lender example. No new customer deposit action |
| Team review area | Separate entrance at /?view=review; protected inbox; start review, request revision, mark reviewed. Exact native agreement controls remain in /operator |
| Operations | Native setup/sign/submit/repay/withdraw, receipt recovery, full evidence and system health |

Open http://127.0.0.1:3000/?mode=recorded for the completed real test-network
loan in customer language. An explicit banner says this is an example, not
the visitor's loan. The example perspective selector changes presentation;
it does not authenticate or approve. The completed
agreement is read-only, with expired approval and no repeat loan.

## Try the request journey

On the backend PC, run `npm run demo:access` once, then restart `npm start`.
This creates an ignored .env with separate random borrower, broker and operator
codes; it never prints them and leaves an existing .env untouched. Open .env
locally to use your assigned role value in **Open my requests**. Keep the operator
code with the backend owner. No service key or wallet is copied by this command.

1. Open / and choose **Request funding**. The request form opens directly.
   Returning requesters can open /?view=borrow and choose Open my requests.
2. Enter 1 to 10,000 test XRP, one of three purposes and a requested repayment
   window. Only synthetic structured fields are collected; there is no document
   upload or personal-information field.
3. Review the amount and requested term. Interest, fees and the final repayment
   schedule have not been offered. Sending is an intake action, not approval.
4. Choose Continue with my code and use the borrower role code in ignored .env,
   then choose **Send for review**. The code stays only in tab memory, cleared
   by locking the workspace, changing roles or reloading.
5. In another browser connected to the same backend, open **Team review area**
   at /?view=review and use the separate broker code. The request appears there.
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

The simplification passed 32 tests, including new coverage that prevents a
historical demo loan from appearing as a new visitor's loan and requires a
matching request ID for the normal view. Chrome verified the new entrance,
borrower form and exact 250.000001-XRP / 60-day request review. The later mobile
check was interrupted by a browser-tool connection failure and is not claimed
as passed. No access code was typed by browser automation and no request or loan
was submitted in this UX pass. The checks below describe the prior interface.

31 local tests passed, including two HTTP clients, role/origin enforcement,
immutable details, duplicate submission reconciliation, broker revision checks
and a real server restart with no wallet/loan creation. Chrome checks covered
borrower/lender views, validation, exact six-decimal review, access gating and
mobile layout at 390x844. Browser testing stopped before entering an access code;
authenticated create/review/restart used isolated HTTP tests with test-only role
values. A second participant has not yet reproduced this flow.
