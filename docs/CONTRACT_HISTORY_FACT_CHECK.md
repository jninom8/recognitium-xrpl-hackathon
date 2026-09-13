# Contract history: claim review

Reviewed September 13, 2026 against the public synthetic loan, current implementation and primary sources. This is an agent-assisted technical research note, not the participant-written developer report. No real identity documents were used, and no new transaction was signed or submitted.

## Keep the lifecycle model, distinguish the evidence

A contract can be represented as events and derived states. An amendment should preserve earlier versions and identify the approvals that make the new version applicable. A reported delivery, acknowledgement and disputed delivery are different events. Recording a statement does not establish that its content is true or legally effective.

The useful product direction is a history connecting the exact approved version to financial execution and subsequent evidence. It should expose who asserted each event, which authority checked it and any remaining uncertainty. This is a proposed extension, not a claim that a complete contract lifecycle already exists in the application.

| Evidence | Supported conclusion | Boundary |
| --- | --- | --- |
| Salted document commitment | The disclosed bytes and salt reproduce a commitment | No proof that the document is true |
| Valid transaction signatures | The signing keys authorized the signed payload | Human identity and lawful authority require additional evidence |
| Validated XRPL transaction | The network accepted the transaction and resulting state | No exact timestamp for the human act or off-chain performance |
| Recognitium authority lookup | The service recognizes the compared receipt record | An issuer assertion, not independent proof of physical events or legal finality |

## What this build actually verifies

An author-operated check of `evidence/synthetic-supplier-001.json` derived both expected account addresses from the signing public keys and returned `both-valid`. The external text's broker and borrower addresses match this original completed 100-test-XRP loan. This does not establish approval or funding of the separate 600-test-XRP request.

The signed LoanSet Data field binds the agreement hash. `src/requests/commitment.ts` already uses a 32-byte random secret salt and a domain prefix for document commitments. It does not implement a KYC attestation schema. The current co-signature verifier supports the demonstrated master-key case; a generalized verifier would need historical account authority for regular keys and multisigning. XRPL accounts can retain their addresses while signing authority changes. [XRPL cryptographic keys](https://xrpl.org/docs/concepts/accounts/cryptographic-keys).

Our receipt authority check uses the official HTTPS service. It must remain separate from local receipt/hash consistency and XRPL transaction validation. The classical service is not demonstrated here as an independently verifiable consensus ledger or nanosecond-accurate clock.

## Time and ordering

XRPL documents a currently 10-second close-time resolution with adjustment to keep ledger timestamps increasing. A ledger index establishes sequence; a hash chain does not independently establish wall-clock time. A nanosecond-formatted receipt timestamp establishes neither nanosecond accuracy nor the moment a human signed. [XRPL ledger close times](https://xrpl.org/docs/concepts/ledgers/ledger-close-times).

## Credit and credentials

Repayment needs a submitted LoanPay. Default recording requires an authorized LoanManage action after the applicable conditions; the due date does not automatically debit a borrower. First-loss cover is bounded by available capital and protocol parameters, and vault shares retain credit and liquidity exposure. [LoanManage](https://xrpl.org/docs/references/protocol/transactions/types/loanmanage), [Lending Protocol](https://xrpl.org/docs/concepts/tokens/lending-protocol).

Identity and overcollateralization are not an exhaustive taxonomy of credit arrangements. Collateral can also be a noncash asset that its owner wants to retain while borrowing liquidity. [Aave borrowing documentation](https://aave.com/help/borrowing/borrow-tokens).

Credentials are XLS-70 issuer attestations, not a universal identity check by Ripple. Credential-based access can be used for private vaults through Permissioned Domains; issuer trust and public metadata still matter. These features are not part of this application's current Vanilla flow. [XLS-70](https://xls.xrpl.org/xls/XLS-0070-credentials.html), [Single-Asset Vaults](https://xrpl.org/docs/concepts/tokens/single-asset-vaults).

## Privacy claims to qualify

C-413/23 P supports assessing identifiability in the recipient's circumstances. It does not certify this architecture as outside data-protection law. The judgment applies Regulation 2018/1725, and collection-time transparency remains assessed from the controller's perspective. [CJEU judgment, paragraphs 79-87 and 110-115](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:62023CJ0413).

The EDPB's final July 2026 guidance makes unlinkability conditional: deleting a secret does not remove leaked copies or identifying metadata. Assess the complete data flow before claiming effective anonymisation or erasure. [Guidelines 02/2025, version 2.0, paragraphs 52-53 and 103-104](https://www.edpb.europa.eu/system/files/2026-07/edpb_guidelines_202502_blockchain_v2_en.pdf).

Engineering implication: losing the only salt can also remove the ability to demonstrate an opening of that commitment. Privacy, evidence retention and disclosure need an explicit policy. Do not promise automatic GDPR erasure or hardware-backed destruction.

## Bounded next experiment

After completing the fresh native cycle, add a synthetic amendment-history experiment: fund against approved version A, introduce version B, retain A's funding evidence and require fresh approval before treating B as accepted. Expected invariant: neither changing the document nor recovering a receipt creates another funding transaction. Separately test a submitted notice versus acknowledged receipt; do not equate the two.

Suggested positioning: "XRPL settles the loan. Recognitium connects the agreement and subsequent evidence to that execution." The application must demonstrate the added verification and recovery value beyond simply placing a hash on XRPL.
