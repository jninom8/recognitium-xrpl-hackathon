# Independent reproduction and bounded recovery round

September 12, 2026. This is an executable handoff and a proposed test matrix.
It does not claim the teammate has reproduced the application or that planned
failure cases have passed. See [status](STATUS.md) for actual completed checks.
The [two-PC guide](TEAM_TESTING.md) covers the integrated white interface and
console, independent published-evidence review and shared-backend requirements.

## Fresh clone, read-only evidence checks

Use Node 24+; the development machine used Node 24.19.0 and npm 11.17.0.
Run each command separately and retain its exit status. The commands below
verify published synthetic-business evidence from real event-network transfers.
They neither create loans nor issue metered receipts. No wallet, company source,
founder's environment file or service key is needed.

```sh
git clone https://github.com/jninom8/recognitium-xrpl-hackathon.git
cd recognitium-xrpl-hackathon
git rev-parse HEAD
node --version
npm --version
npm ci
npm test
npm run verify -- evidence/synthetic-supplier-001.json
node scripts/probe.mjs --long
npm run verify -- evidence/synthetic-supplier-001.json --online --mentor-confirmed-open-ended
node dist/scripts/verify-cap-test.js --mentor-confirmed-open-ended
```

`npm test` builds first. The current implementation has 27 passing tests,
including cryptographic checks, labelled simulated failures and six additional
UI/state/health/two-client tests. The latter do not replace the four remaining
failure cases below or a teammate's independent reproduction.
Offline verification checks the saved bundle's consistency and signatures;
only the online command adds fresh authority records and event-ledger checks.
The cap verifier additionally checks seven transactions and historical states.
The mentor flag is restricted to the recorded trial on network 4001.

If the probe fails, keep the offline result and record the online result as
blocked at that time. Preserve the actual error, endpoint and elapsed time;
do not call the entire implementation invalid or substitute another network.
If the server no longer retains historical ledgers, report the missing history
separately from transport failure or a substantive evidence mismatch.

The teammate records, in their own words, the exact commit, OS/Node/npm versions,
UTC check time, command/exit status, offline result, online result and any actual
friction. Include no machine username, network name, IP, credentials or raw hook
logs. A successful CI run or another check on the original developer's computer
does not replace this independent observation.

For development, each teammate follows [the hook setup](HOOK_SETUP.md) with their
own identity/consent. This repo does not distribute the founder's hook identity.
The [design preview](FRONTEND_DESIGN.md) can be reviewed with
`npm run design:preview`; it is separate from the live app at port 3000.

## Remaining failure cases

Use deterministic barriers rather than arbitrary sleeps. Use isolated test
directories and explicitly simulated remote services. Never kill the working
demo server or delete its data to run a failure experiment.

The balance invariant is about **one economic disbursement**, not exactly one
HTTP request: retransmission of an identical signed transaction can be safe.
For every case record the signed hash, request/approval digests, borrower funding
delta, vault principal movement, network fees and remote issuance count. A
simulated balance proves a local safety property, not native XRPL execution.

| Case and existing coverage | New controlled injection | Expected state and invariant | Result required before closing |
|---|---|---|---|
| Concurrent valid submissions. Writer exclusion is tested; simultaneous authorized HTTP requests are not. | Hold the first request at a barrier while two authorized requests target the same signed loan, then release and reconcile in a fresh process. | One writer; second request receives documented busy response or same reconciled outcome. One unique signed hash and one simulated 100-XRP borrower credit. Same request cannot create a second LoanSet. | HTTP outcomes, journal and simulated balance reconcile. A duplicate click must not require new approval or signing. |
| Process death around persistence. Actual child kills after remote acceptance and after lookup already pass. | Add test-only barriers before/after temporary-file sync and before/after rename for the request/journal checkpoints; kill the child and restart. | Each record is old complete JSON or new complete JSON; transitions reconcile across records. Unknown funding remains unknown until lookup. One unique LoanSet; no second principal credit. | Verified child exit; only that test's stale lock cleared. Preserve malformed/ambiguous state fail-closed. This does not prove power-loss durability or filesystem corruption tolerance. |
| Receipt issued, response lost. Current receipt-outage double fails before issuing a receipt. | Simulated authority durably records a receipt and increments issuance count, then loses the response. Also kill after the response arrives but before local receipt persistence. | Funding remains validated; receipt attempt remains unresolved. One remote issuance, no automatic remint. Recover the same ID, verify authority/commitment, attach it, retain the original funded hash. | One simulated charge and one funding delta. With no recoverable ID, remain pending rather than claiming hash-only recovery. |
| Expired transaction, incomplete history. Journal-level expired/unknown check already passes. | Exercise service and authorized HTTP reconciliation against a partial-history adapter: current ledger is past expiry, hash lookup cannot establish outcome. Later restore the original validated transaction. | `EXPIRED_UNRESOLVED`; no replacement signing/submission. An actually funded simulated loan may already have credited 100 XRP while the app is uncertain. After history returns, discover that same credit, never create another. | Unknown stays distinct from rejected. Restored history reconciles to the original hash and funded state, then receipt recovery. |

For persistence testing, `Store.write` currently writes a unique temporary file,
syncs it, closes it and renames it over the record. `processLock` leaves a stale
lock after a crash. Tests must observe the owner's exit before removing only
their own lock; they must not introduce a general automatic stale-lock bypass.

Stop this round when the four cases have a reproduced outcome and an honest
scope statement. If a defect is found, fix it and add its regression. Do not
manufacture an XRPL bug from a designed fixture failure or keep increasing the
test count without a new risk to resolve.

## Demo acceptance walkthrough

1. Start with a named run and visible mode: live event network or recorded real
   evidence. Fixtures use a different, persistent label.
2. Review exact terms/version, transaction, expiry and network. Show both human
   approvals and that both signatures cover the bound metadata.
3. Show validated borrower funding and the transaction hash. If receipt issuance
   is pending, retain the funding fact prominently.
4. Change a copy of the synthetic document. Reject its claimed match with the
   original commitment; preserve the original loan and approved version.
5. Recover the original receipt by ID and verify its authority. Show the same
   funded hash and borrower delta before and after recovery.
6. Show repayment, available liquidity, lender redemption and gross realised
   yield with fees separate. Explain one recorded native refusal with its code.
7. Have the teammate verify the exported evidence independently. The UI export
   and verifier integration are still work to complete.

Do not compress a new native cycle into a 60-second repayment window while
explaining the UI. Use recorded real evidence where appropriate, or obtain new
approval for a schedule suitable for rehearsal. The existing completed cycle
and its approvals are historical evidence, not authorization for a new loan.
