# Try the jury demo

Open https://recognitium-xrpl-hackathon.vercel.app/ . No access code is required for hosted synthetic requests or review.

1. Choose Request funding, enter made-up details, review and send.
2. Open Team review area in a second tab: https://recognitium-xrpl-hackathon.vercel.app/review . Start review, then mark the request reviewed.
3. Return to the request tab to see the updated state. Both views share saved data.
4. Open the completed example to show the separately verified native test-money loan and repayment.

Review completion does not create an offer or fund a new loan. Native signing and exact approvals remain on the local operator backend. Public hosted roles are presentation views, not authenticated identities. Use synthetic details only: visitors can read and review the shared demo requests. The existing 100-request limit and conditional-write checks remain.

For a solo presentation, use two tabs and switch between requester and reviewer. Rehearse the completed example and its records as the reliable fallback. Independent teammate reproduction remains pending. The participant writes the official feedback report.

Technical smoke check (creates one synthetic request, moves no funds):

```powershell
node scripts/hosted-smoke.mjs --write-synthetic
```

This tests creation through completed review, duplicate retry, changed-details and stale-review rejection, and refusal of native operations. No hosted role credentials are needed. Local operator authentication is unchanged. Private Vercel Blob storage persists through deployments.

Direct requester link: https://recognitium-xrpl-hackathon.vercel.app/borrow (mint). Reviewer: /review (lavender). Use the sidebar link to open the other role in a second tab.

The sidebar now preserves the selected request ID in the other role's link.
Share that complete link with the other participant to follow the same request.
The overview identifies the next actor; History & documents shows the review
and native operations. Admin & system status opens the same record, with
evidence and recovery controls separated from customer decisions. See the
[capability audit](UI_CAPABILITY_AUDIT.md) for coverage and remaining boundaries.
## Borrower balance check

Open a prepared request in `/borrow`, then choose **Check wallet balance**.
The card separates wallet funds from the loan's validated proceeds. It shows the
event network, account, ledger index/hash and check time. Recorded mode can read
the wallet now, explicitly separately from the saved loan history. A connection
failure retains a previous observation; an unknown balance is never shown as zero.
Run `node scripts/check-hosted-wallet.mjs` for the same read-only hosted check on
the two existing public synthetic runs. Its evidence file records the observation,
not a permanent balance. No signing keys or funds are needed for this check.
