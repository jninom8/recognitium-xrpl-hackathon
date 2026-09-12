# Connect hosted intake to native execution

The public website stores synthetic intake. A local operator bridge imports an exact reviewed request, creates an isolated run, prepares its agreement and publishes a filtered progress view back to the website. It does not place wallets or signing capabilities in Vercel. Public reviewer clicks never authorize a transfer.

## Start a run

Finish the request review first. Choose either its requested duration in seconds or an explicit 60-second demonstration counter-offer. The submitted request remains inside the private agreement document, including its original duration and digest. Principal equals the submitted amount; the proposed rate is 10% annually, one payment, grace 60 seconds, all additional loan fees/rates zero. Human approval binds the final agreement and prepared transaction, including ledger expiry and actual network fee.

Run from this repository with the existing ignored environment files:

```powershell
npm run build
node --env-file-if-exists=.env --env-file=.env.local dist/scripts/bridge.js prepare REQUEST_ID INTERVAL_SECONDS
```

Preparation provisions development-network wallets and creates a vault, lender deposit (twice principal), broker and cover (20% principal rounded up). It does not sign LoanSet. The isolated directories are data/runs/REQUEST_ID and wallets/runs/REQUEST_ID. Never delete them to retry or replace an expired offer. A repeat prepare returns the same offer; changed intake or duration is refused.

## Exact approval and receipts

Only after the human explicitly approves each role's displayed exact terms:

```text
bridge approve REQUEST_ID broker AGREEMENT_HASH TRANSACTION_DIGEST
bridge approve REQUEST_ID borrower AGREEMENT_HASH TRANSACTION_DIGEST
bridge receipt-intent REQUEST_ID agreement
```

Here bridge abbreviates the same Node command above. Receipt-intent persists the pending handoff and prints the exact commitment. Call the existing authorized Recognitium MCP seal_hash once with that hash (one tick). Preserve its receipt ID and recover it with:

```text
bridge recover REQUEST_ID agreement RECEIPT_ID HASH
bridge sign REQUEST_ID
bridge submit REQUEST_ID
```

Submit first looks up the existing transaction; repeat submit reconciles its identical signed blob. No replacement loan is created after an uncertain outcome or expired history. Once validated, prepare an execution receipt handoff, seal once and recover:

```text
bridge receipt-intent REQUEST_ID execution
bridge recover REQUEST_ID execution RECEIPT_ID HASH
```

An unresolved receipt-intent cannot be issued again. Recover its existing result; never blindly repeat the metered seal. No public IVM publication is involved.

## Finish and recover

Use bridge refusal REQUEST_ID before repayment for the native liquidity refusal. At the approved payment time, bridge repay REQUEST_ID, then bridge withdraw REQUEST_ID. The existing runner preserves a late-payment refusal separately and requires zero additional late costs before that recovery. Inspect the proposed payment schedule and ledger result; do not pretend 60 days have elapsed.

Every action publishes a filtered request/cycle snapshot. bridge publish REQUEST_ID retries only publication after a storage outage. The UI matches each loan to its submitted request and cycle. Private document bytes, salt, seeds, signed blobs and raw ledger responses are excluded. Hosted controls for native operations remain disabled; the local bridge executes explicit founder approvals. The frontend is not an unattended lending service.

## Evidence status

Implementation tests include simulated ledger preparation, preservation across restart and changed-intake rejection. Existing native service tests cover signature binding, funding reconciliation and receipt recovery. These tests do not prove a fresh live bridge run. The first connected live run is pending review of the selected request and exact human approvals.
