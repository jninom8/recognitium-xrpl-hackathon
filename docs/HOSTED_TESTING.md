# Test the hosted application together

Open **https://recognitium-xrpl-hackathon.vercel.app/** on both computers.
No clone, local server or shared Wi-Fi is required for this hosted workflow.

## Two people, one request

1. José opens **Request funding**, enters made-up details and reviews the request.
2. At the access-code step, use the value of HOSTED_BORROWER_TOKEN from the ignored local file `.local/hosted-access.env` on José's PC.
3. Privately share only HOSTED_BROKER_TOKEN with the teammate. They open **Team review area**, unlock it with that code, and refresh the inbox.
4. Compare the same amount, purpose and requested term. The teammate starts review; José refreshes and sees the changed status. Background refresh takes approximately 10–12 seconds while the tab is visible.
5. Finish the review and compare the next state on both PCs. Review is not loan approval or funding. Record each person's observed result in the shared journey, including discrepancies.

These are separate hosted demo codes, not the local application's codes. Never put them in GitHub, URLs, screenshots or the public journey. They authenticate demo roles, not individual customers. All requests in this bounded demo are synthetic and visible to the corresponding shared role. Do not enter personal or confidential business details.

## What is live here

Request creation and review use private Vercel Blob storage, fresh reads and conditional writes. Retries retain the same request ID and do not rewind review. The store permits up to 100 synthetic requests. An error after a write must be retried with the same request, not a newly invented ID.

The **completed example** shows the already-published, real native test cycle and receipts. It does not fund a new request. Native signing, ledger actions and receipt issuance remain on the local operator backend. The bridge from reviewed intake to a fresh native agreement is still pending. Hosted health descriptions explain these boundaries.

Do not run a local app on each PC and expect their private state to synchronize. Use this hosted URL for shared intake; use [TEAM_TESTING.md](TEAM_TESTING.md) for local evidence reproduction and the separate native operator workflow.

## Repeatable technical smoke check

The founder can run this explicitly writing check from the repository:

```powershell
node --env-file=.local/hosted-access.env scripts/hosted-smoke.mjs --write-synthetic
```

It creates one synthetic request, verifies requester/reviewer visibility, reviews it, retries submission concurrently and checks that only one revision-2 request remains. It also checks wrong-role, cross-origin and native-operation refusals. It uses existing demo codes without printing them and moves no funds. The result is saved under ignored .local/. This is an author-operated HTTP check; independent teammate browser reproduction is still required.

## Deployment boundary

This is a separate Vercel project, recognitium-xrpl-hackathon, on the existing Hobby account. No company website or custom domain was changed. The Vercel production alias is a public test-money demo, not a production lending service. Private Blob storage is in cdg1. The deployment allowlist excludes private state, wallet files, source decks, hook logs and credentials. Only the two hosted role tokens and the platform's storage access are configured for the application.

Local checks: npm test and npm run build:hosted. Deployment: vercel deploy --prod after review. GitHub is connected; main-branch pushes may redeploy the site. Private storage survives application deployments. Do not delete or replace the store during a routine deploy.
