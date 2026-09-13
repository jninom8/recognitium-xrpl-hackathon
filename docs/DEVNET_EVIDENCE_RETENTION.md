# Evidence after the event network disappears

September 13, 2026. Agent-assisted research and an actual offline verifier check.
No shutdown or reset of the event network was observed in this investigation.
This note is not the participant-written developer report.

## What survives in the current bundle

The original synthetic bundle was checked with:

```powershell
node dist/scripts/verify-bundle.js evidence/synthetic-supplier-001.json
```

Result: contentHash=consistent, signatures=both-valid,
receiptChainHash=consistent, receiptAuthority=requires-online-lookup,
xrplValidation=requires-online-lookup.

The document commitment, demonstrated signing-key signatures and internal links
remain checkable from saved bytes. Saved transaction metadata is an observation
of execution; transaction signatures alone do not authenticate that metadata or
prove ledger inclusion. The saved Recognitium receipt's hash formula similarly
checks consistency, not independent issuer authenticity. Our current verifier
compares it with the official authority record online.

XRPL documents that test networks have no availability guarantee and can reset.
An actual February 2025 Devnet reset removed transaction history. These sources
establish the general risk, not a closure schedule for network 4001.
[Parallel networks](https://xrpl.org/docs/concepts/networks-and-servers/parallel-networks),
[2025 Devnet reset](https://xrpl.org/blog/2025/devnet-reset).

## A better archive proposal

Ask organisers to preserve the event's historical transaction data and metadata,
ledger headers, amendment/network configuration and a published archive manifest.
Only retaining the final account-state snapshot does not retain earlier transaction
history. An organiser-signed manifest identifies the organiser's assertion; its
signature alone is not a consensus proof.

XLS-41 (XPOP), an ecosystem standard marked Final, describes offline transaction
and metadata proofs using ledger inclusion evidence, signed validator validations
and validator-list evidence. Verification retains a trust assumption in the list
publisher. Thus validators need not remain online if sufficient proof was captured.
Our bundle does not contain or verify an XPOP. Availability of these proofs on the
event server has not been tested.
[XLS-41](https://xls.xrpl.org/xls/XLS-0041-xpop.html).

## What the receipt gate actually enforces

`src/requests/service.ts` requires both exact role approvals and verifies the
agreement receipt before `cosign`. `src/xrpl/transactions.ts` places the agreement
hash in LoanSet Data. This is the participating broker application's signing
policy. XRPL enforces account authorization and loan rules, not Recognitium receipt
verification. Another broker, or the same keys used outside this application,
can bypass that application policy. Intake review alone does not authorize signing.

The endpoint must follow the same network with the required amendments. An
arbitrary public XRPL server cannot serve this event's loans. The current build
uses backend-managed test wallets, not an implemented wallet MCP. An agent may
prepare requests, while exact human approval remains the signing gate. The app
collects the terms; the existing receipt service seals their commitment.
[XLS-66, LoanSet](https://xls.xrpl.org/xls/XLS-0066-lending-protocol.html#383-multi-signing).

Private-vault domains restrict deposits and share access. This does not establish
a per-agreement borrower gate: a generic credential does not bind the exact loan,
amount, version or one-time execution. The reviewed XLS-66 LoanSet conditions do
not define a Recognitium-receipt or vault-DomainID check on borrowers. Credentials
and wallet-MCP integration remain proposed extensions, outside the current Vanilla
implementation.
[Single Asset Vaults](https://xrpl.org/docs/concepts/tokens/single-asset-vaults).

Recommended priority: keep the exact approval/receipt/signature gate, preserve
evidence with its trust boundaries, and ask about archive/proof availability.
Do not turn this risk into a fabricated protocol bug or claim completed XPOP support.
