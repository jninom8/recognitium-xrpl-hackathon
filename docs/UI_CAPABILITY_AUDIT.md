# User and admin interface: capability audit

September 13, 2026. This is implementation documentation and author-operated verification, not the participant-written developer report.

The borrower, reviewer, lender and admin use the same backend records and shared lifecycle presentation. The next-step panel says what happened, who acts next and what remains pending. Public roles are demo views, not authenticated identities. Test XRP and synthetic business details only.

## Where each capability appears

| Backend capability | User-facing view | Admin / execution boundary |
| --- | --- | --- |
| Exact request creation and durable retry | Borrower: two-step form, exact decimal amount, saved request selected after submission | Hosted intake persists one request per ID; changed details cannot reuse that ID |
| Start review, request revision, complete review | Reviewer inbox and request dialog; borrower sees the same history | Intake review does not authorize lending |
| Request-to-native bridge | Shared selected request and matching progress; requested days versus offered interval | Local bridge imports the reviewed request and publishes setup/offer progress |
| Vault, lender deposit, broker and cover | History: preparation summary and individual ledger records | Full setup history, including initial refusal and corrective top-up, remains inspectable |
| Both exact approvals and signed metadata | Offer: both role states, every rate/fee, expiry, accounts and commitment identifiers | Local operator records explicit approval before co-signing; hosted views never sign |
| LoanSet funding | Receive step and actual credited test XRP | Stored validated funding is distinct from a signature or submitted transaction |
| Borrower wallet and event network | On-demand balance card, separate loan proceeds, account, check time, validated ledger/hash and event explorer | Fixed network 4001 and an agreement-bound account; failed reads retain the previous observation instead of displaying zero |
| Unknown validation / expired unresolved history | Next step says to reconcile the same transaction | No automatic replacement loan; original history retained |
| Agreement and execution receipts | Separate authority evidence card, recorded check time and pending state | Receipt IDs, commitments, recovery state and native bridge guide remain accessible |
| Recovery after validated funding | Funding stays confirmed when its receipt is pending | Recover the missing receipt; do not repeat funding or blindly repeat metered issuance |
| LoanPay, including a declined attempt | Repayment progress and full transaction history | Scheduled refusal and later successful repayment both remain visible |
| Lender withdrawal and realised yield | Lender view: contribution, withdrawal, exact gross interest and withdrawal fee | Current withdrawable cash is explicitly not polled; no guaranteed return is claimed |
| Native refusal | Labelled ledger refusal in user and admin history, with hash/result code | Duplicate record labels for one transaction collapse to one entry while retaining ledger details |
| Changed-document and evidence verification | Exact agreement and three separate evidence explanations; example download | Existing verifier and failure tests; no claim of a new browser tamper-test button |
| Export and independent checks | Recorded example has its own download | Fresh per-request private export stays a local operator action; never mislabel the example as the selected live run |
| Health and DevEx hook | User progress excludes technical service internals | Admin health panel uses existing ledger/authority/hook observations; hosted capture is not falsely shown as local runtime health |

Optional AI discovery, Credentials, Permissioned Domains, browser-wallet integration and a general amendment lifecycle remain outside the implemented Vanilla flow. Their absence is not hidden by the UI. The existing backend-managed demo accounts and approval boundary are unchanged.

## Corrections made

- Removed obsolete claims that native offer preparation was not connected. The bridge exists; execution remains operated locally.
- Added consistent six-step progress, an explicit next actor, contextual links preserving the request ID, and direct links into admin evidence.
- Added an expired-offer explanation and distinguished a stored signed transaction from confirmed funding.
- Reused exact-hash approval matching; historical signatures no longer appear as invented human approval timestamps.
- Added pre-agreement request/review history and exposed vault/deposit/broker/cover operations to both views.
- Preserved native failures and the original repayment recovery. One successful deposit with two internal labels appears once.
- Fixed publication freshness leaking from a different request. Page refresh, selected-run publication, authority checks and ledger results remain separate.
- Fixed the initial loading state appearing as a failed inbox. Admin reads the selected public intake when no native agreement exists.
- Kept monetary units exact, public output allowlisted, local actions protected and all existing recovery controls available.
- Added borrower balance reads from the same validated ledger reported by `server_info`; network, account, ledger index/hash and integer drops must all match. A current wallet read in recorded mode is explicitly separate from historical loan evidence.
- Verified the original successful LoanSet in the custom explorer and corrected transaction links to its observed `/transactions/:hash` route. Mode changes clear the previous request selection.

## Actual verification

- `npm test`: 51 passed, zero failed. Includes real child-process termination with explicitly simulated ledger responses, request-bound approvals, changed-document rejection, receipt outage recovery, cross-request isolation, publication freshness, balance validation/failure handling and the original published evidence through the new presentation model.
- `npm run build:hosted`, JavaScript syntax checks and scoped publication checks passed. New shared modules are served by the local backend and included in the hosted asset allowlist.
- Chrome, deployed site: created `request-35dd9b3f-5d58-4b09-8067-cfa6dd68efab` for exactly 123.000002 test XRP, 30 days, synthetic inventory. Started and completed its review in the separate reviewer view. The borrower displayed “Review complete. Offer comes next.” for the same selected ID. No loan was approved or funded.
- Read-only local visual QA in connected Chrome used actual shared data, including 390-by-844 iframe viewports for borrower and recorded lender layouts. This was a responsive layout check, not a separate mobile device or independent teammate reproduction.
- Final deployed HTTP smoke at 02:37:07 UTC: `request-76e71762-9d1e-4e9f-8a61-3331d0c29b87` reached REVIEWED revision 3. Concurrent duplicate retries preserved one record; changed details/stale review returned 409, invalid role 401, wrong origin/native action 403, malformed JSON 400. No funds moved.
- Fresh online verification of the original completed bundle passed content consistency, both signatures, receipt-chain consistency, official authority-record comparison and all saved XRPL transaction comparisons.
- Event endpoint probe at 02:16 UTC: HTTP 571 ms, WebSocket 619 ms, xrpl.js 5.2.0 SDK 836 ms, network 4001, rippled 3.4.0-rc1, SDK-observed ledger 81898.
- Final UI and balance deployment: `dpl_5rn6fsLPRJRJTeyNrHhWgpNCaW3f`, Vercel READY, aliased to the existing public demo URL. This supersedes the balance checkpoint deployment `dpl_fWkCA48wquXzyqB85eiRy24ykJuk` and includes the mode-selection correction.
- `node scripts/check-hosted-wallet.mjs` at 02:53 UTC returned HTTP 200 for both known accounts, HTTP 404 for an unknown request. At validated ledger 82625, the original wallet held 999.999944 test XRP and its historical loan proceeds were 100 XRP; the newer wallet held 1,000 test XRP while its loan remained unfunded. Exact hashes, account bindings and timings are in [hosted-wallet-checks.json](../evidence/hosted-wallet-checks.json). This was a read-only integration check, not a new lending cycle.
- Chrome balance buttons: borrower showed 1,000 test XRP and “Not funded” at ledger 82639; admin recorded mode showed a current 999.999944 test XRP balance beside historical 100-XRP loan proceeds at ledger 82671. Admin exposed all nine distinct native operations, including both declined attempts. These were real deployed UI reads.
- Hook 2.4.0 at 02:53:39 UTC accepted 26 existing captured events with HTTP 200; 617 cumulative, zero buffered at that checkpoint. No fabricated feedback or manual report was generated.

## Remaining functional boundary

The original 100-test-XRP native cycle remains the completed, independently inspectable evidence. The separate 600-test-XRP request has validated setup, an expired unsigned offer and no recorded exact approvals or borrower funding. A fresh connected cycle still requires resolving that offer and obtaining fresh exact approval. Automatic offer renewal is not implemented. Current vault cash, production identity controls and unattended public signing are not supplied by this UI update.
