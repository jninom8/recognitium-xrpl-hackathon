# Public execution runner

The hosted Admin button queues only a published loan whose exact borrower and broker approvals are present. It does not convert request review or match approval into permission to borrow. The local worker checks the queue hashes against its own private request and uses the existing journal and process lock. Wallet seeds remain local.

Start from this repository after building:

```powershell
node --env-file=data/execution-worker.env --env-file-if-exists=.env dist/scripts/execution-worker.js
```

The ignored worker environment contains authorized Blob access. Never publish it. Vercel may export placeholders for sensitive values; verify the heartbeat instead of assuming exported credentials work. The receipt service must also have working authorized issuance access; a connected worker does not prove issuance availability.

Keep the operator computer awake and this process running. The public /api/runner returns connected only while its heartbeat is recent. The worker polls outbound; no inbound port or wallet key is deployed. On process failure, inspect the existing writer lock before removing it. Receipt ambiguity pauses the job; do not issue a second receipt blindly.

Queue status is durable. Completed jobs are not repeated. Fresh offer preparation and exact approval collection remain required before the Run approved loan button can enable. This connection does not implement those missing public preparation controls.

Verified September 13: deployment dpl_5pHgCqwxevkQW8EGJ4d1eArvV5Xi READY; hosted heartbeat connected. Public queue accepted the already-completed request 1708833C and local worker marked it complete. This was an idempotent completed-run check, not a new funding cycle. Chrome displayed Local runner connected for current request 467AD12F, which correctly remained ineligible without a prepared offer. 73 tests and hosted build passed.
