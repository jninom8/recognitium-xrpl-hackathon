# Test together from two PCs

The white interface now runs in the actual application at **port 3000**.
Port 3100 remains the separate simulated design concept. The console and app
consume the same `/api/state` snapshot; health checks never sign or mint receipts.

## First: independently read the same real evidence

On the teammate's PC, from a new directory:

```sh
git clone https://github.com/jninom8/recognitium-xrpl-hackathon.git
cd recognitium-xrpl-hackathon
npm ci
npm test
npm start
```

Requires Node 24+. From an existing clean checkout, use `git pull --ff-only`
first. Preserve any local changes and coordinate branches before updating.

Both participants open http://127.0.0.1:3000/?mode=recorded on their own PC.
Choose Request, Lender position and Evidence. Compare:

- Same commit: `git rev-parse HEAD`.
- Request `synthetic-supplier-001`, version 1, borrower funding 100 test XRP.
- LoanSet `54A285546C2F2A4374C698E2EA00CC82778F408163D30C49898A28B8C4FB75FA`.
- Lender deposit 200 XRP; redemption 200.000020 XRP; gross realised yield 20
  drops; withdrawal fee 12 drops. Other native transaction fees are separate.
- Native refusal, original late repayment refusal and successful corrected
  repayment remain visible. Published evidence is read-only and not a fixture.

No `.env`, wallet files, service credentials or founder hook identity are needed
for these checks. Each PC has its own backend ID and local state. **GitHub shares
code and reviewed evidence; it does not synchronize private live loan state.**

In a second terminal:

```sh
npm run health -- --recorded
npm run verify -- evidence/synthetic-supplier-001.json
node scripts/probe.mjs --long
npm run verify -- evidence/synthetic-supplier-001.json --online --mentor-confirmed-open-ended
```

The browser verifies the published bundle offline. A green connectivity status
does not add fresh verification of every transaction or receipt. The final CLI
command performs those online checks, without transferring funds or charging
for receipts. Retain actual results as described in [the reproduction guide](REPRODUCTION_AND_RECOVERY.md).

The teammate writes their own outcome and any failure: exact commit/time,
commands, result and limits. Neither our CI nor two clients on the author's PC
counts as the teammate's independent reproduction.

## Then: two browsers observing one shared live request

This needs **one backend**, running on the PC that keeps the demo wallets. Both
browsers and the console connect to that backend. Two separate local servers
will not share approvals merely because they use the same XRPL endpoint.

The server remains bound to `127.0.0.1`. No public deployment, venue-LAN listener,
firewall change or tunnel has been activated by this implementation.

Use a private authenticated SSH local forward if an owner-approved SSH service
is available. The owner/admin must configure a dedicated tunnel-only account/key
limited to forwarding port 3000, with no shell or access to wallet files. Do not
give the teammate the founder's general SSH account or private key. Verify the
host key fingerprint through the owner. This access setup is a prerequisite,
not something this application provisions; an SSH server was not detected on
the author's PC during the implementation check.

With `recognitium-demo` configured as that verified SSH host alias, the teammate
runs the following instead of starting their own server on port 3000:

```sh
ssh -N -o ExitOnForwardFailure=yes -L 127.0.0.1:3000:127.0.0.1:3000 recognitium-demo
```

`recognitium-demo` above is a configuration placeholder, not a public hostname.
Both open http://127.0.0.1:3000/ and select the backend's live records. Keeping
the same local port preserves the existing Host/Origin checks. The SSH client
encrypts the forwarded connection; see [OpenSSH's local forwarding reference](https://man.openbsd.org/ssh#L).
Do not disable host-key checks, relax CORS or bind the wallet app to all interfaces.

Before attempting actions, compare the backend **instance ID** in System status.
It must match on both PCs. A revision can advance between refreshes; after state
settles, both should display the same revision and request/transaction hashes.
The console on either PC can consume that same backend:

```sh
npm run health -- --watch
```

The operator configures three distinct local capabilities using `.env.example`.
Give each reviewer only their assigned demo role's capability through a private
channel. Keep the operator capability on the backend operator's PC. These are
prototype access controls, not wallet ownership or production authentication.
The browser clears the entered value and does not persist it in local storage,
URLs or bundles. Each person reviews the exact terms/hashes and approves their
own role; background refresh never approves for them.

Read-only service checks are available through System status → Check services.
For the existing mentor-confirmed network-4001 trial, set
`TRACK1_MENTOR_OPEN_ENDED_TRIAL=1` in the backend's ignored `.env`. Optional
`DASHBOARD_LIVE_CHECKS=1` checks service health every 30 seconds. All browser
snapshots refresh every three seconds while visible, and immediately after an
action. Hook status exposes only registration/counters, never its identity,
invite or raw logs. Each participant sets up their own mandatory development
hook with their own consent; see [HOOK_SETUP](HOOK_SETUP.md).

## What to test as a pair

1. Open the same request on both PCs. Check version, amount, network, expiry,
   agreement hash and transaction digest.
2. Approve one role. The peer's view should update without a manual refresh.
   Use the other role separately; a wrong-role capability must fail.
3. Keep an approval review open while the request changes in an isolated test.
   The review must become unavailable, retaining the originally displayed terms.
4. Reconnect after a dropped browser/backend connection. Stored funding stays
   visible with a stale-data message until fresh state returns. A changed backend
   instance invalidates an open review.
5. Compare console/UI instance, revision and transaction hash. If they differ,
   first check whether one browser is on its own server or in published mode.
6. Recover an existing execution receipt by ID. It must remain attached to the
   same funded transaction; receipt recovery no longer requires a live ledger
   connection, although it still requires authority access and correct binding.

The completed run is historical: its approval expired and it cannot be approved
again. The runner still uses fixed cycle/request/operation IDs. A second live
run needs the planned run-isolation milestone and fresh exact terms/approval.
Do not delete journals or wallet files to manufacture a reset. Until that gate
is complete, use published evidence for the shared walkthrough and isolated
automated fixtures for new approval/concurrency tests.

The remaining [bounded failure round](REPRODUCTION_AND_RECOVERY.md) includes
concurrent *submission*, persistence-boundary termination, receipt response loss
and partial-history expiry. The new two-client approval test does not replace
those cases. No new loan or metered receipt was made for this UI integration.
