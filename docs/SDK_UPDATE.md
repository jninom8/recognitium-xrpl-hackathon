# September 12 SDK update: beta.1 versus our validated stable baseline

At 13:36 UTC the founder relayed the mentors' updated package link:
[xrpl 5.2.0-beta.1](https://www.npmjs.com/package/xrpl/v/5.2.0-beta.1).
We inspected the actual published packages and refreshed the public event brief.
This is an observed development note, not the participant-written final report.

## What the sources actually returned

- The public Notion page API returned all 174 blocks in two chunks, with an
  exhausted cursor, at 13:36:23 UTC. Its library row still said stable xrpl.js
  for Track 1 and 5.2.0-beta.0 for Track 2. That row's last-edit timestamp was
  September 11, 20:09:59 UTC. The founder reported a mentor update to beta.1;
  the public response did not yet reflect it. Publication/cache propagation is
  a possible explanation, not an established cause.
- The library row properties SHA-256 was
  `c1764e9d98ecfb89b49ff812c6c6d38d8e7e4e9e29894cebcfac26f4e985fc82`.
  Raw Notion responses remain ignored under reference/, with no access details
  copied into public documentation.
- npm registry publication times: beta.0 September 10 at 13:42:46 UTC;
  beta.1 September 11 at 16:59:54 UTC; stable 5.2.0 September 11 at 22:20:39 UTC.
  A beta label does not mean the release is newer than the installed stable.

## Relevant code differences

Compared with beta.0, beta.1 changes counterparty and sponsor signing to use
role-specific prefixes for fixCleanup3_4_0, and updates the codec dependency
from ^2.11.0-beta.0 to ^2.11.0-beta.1. This matters directly to co-signed LoanSet.
The stable 5.2.0 package already contains that counterparty signing change.
The published codec 2.11.0 and 2.11.0-beta.1 packages differed only in package.json
in the observed npm diff, including identical source signing functions.

Compared with stable 5.2.0, beta.1 adds Lending V1.1 vault fields and validation:
VaultKind, SubscriptionDate, RedemptionDate, and a minimum 180-second investment
period; it also adds withdrawal credential fields and VaultDelete MemoData.
These are useful for the closed-ended Track 2 lifecycle. Our completed Track 1
cycle does not require them. Stable also includes stricter Wallet.fromEntropy
input validation that was absent from this beta; this app does not call it.

## Actual compatibility test

The candidate was installed only in ignored .local/sdk-beta-check. Application
dependencies, lockfile, chosen track and native journal remained unchanged.
At 13:38:28 UTC, both SDK/codec pairs passed the same checks:

| Check | 5.2.0 / codec 2.11.0 | beta.1 / codec 2.11.0-beta.1 |
|---|---|---|
| Recorded funded LoanSet hash reproduced | Pass | Pass |
| Broker and borrower signatures verified | Pass | Pass |
| Changing Data invalidates both signatures | Pass | Pass |
| Eight other native transaction hashes reproduced | Pass | Pass |

This is offline replay of genuine recorded event-ledger evidence. It is not a
claim that a new loan was submitted with beta.1. Our live acceptance evidence
continues to identify stable 5.2.0 as the SDK that submitted the transactions.

Reproduce from the repository root:

```sh
npm install --prefix .local/sdk-beta-check --no-package-lock --ignore-scripts --no-audit --no-fund --save-exact xrpl@5.2.0-beta.1 ripple-binary-codec@2.11.0-beta.1 ripple-keypairs@3.1.0
node scripts/compare-sdk.mjs
npm diff --diff=xrpl@5.2.0-beta.0 --diff=xrpl@5.2.0-beta.1 -- src/Wallet package.json
npm diff --diff=xrpl@5.2.0 --diff=xrpl@5.2.0-beta.1 -- src/models src/Wallet package.json
```

Decision: retain exact stable 5.2.0 for the validated Track 1 baseline. Record
beta.1 as the mentor-recommended replacement for the earlier beta.0 guidance
when evaluating Track 2. A track migration must change environment and lifecycle
acceptance together. No migration was needed to complete our native cycle.

Developer-experience proposal: publish a timestamped track/network/SDK/codec
matrix and explain whether an update fixes signing, adds new transaction fields,
or both. This would make the consequence of the beta update easier to assess.

Sources: [event brief](https://holly-pixie-8e9.notion.site/XRPL-Lending-Protocol-Hackathon-3152f6835886823ab31f01cd9d1f6ded),
[npm beta.1](https://www.npmjs.com/package/xrpl/v/5.2.0-beta.1),
[npm stable](https://www.npmjs.com/package/xrpl/v/5.2.0),
[npm registry metadata](https://registry.npmjs.org/xrpl).
