# External proposals: evidence review and selected tests

September 12, 2026. Team Recognitium. AI-assisted technical working note.
This is not the participant-written final feedback report.

## Decision

Keep the completed Track 1 test-XRP cycle and strengthen its recovery and
accounting evidence. The six supplied texts are useful sources of hypotheses;
several proposed findings are factually incorrect or untested. They do not
justify changing networks, replacing the SDK, or claiming a vulnerability.

The strongest product hypothesis remains: a reviewer can trace the exact private
agreement approved by both parties to the transaction that funded the borrower,
then recover the execution receipt after an interruption. XRPL already supplies
co-signing and settlement. Recognitium adds the application workflow and its
pre-existing classical receipt service. This demonstrates integration value;
market uniqueness, invoice truth, credit quality and customer demand remain
unproven. A receipt does not insure a loan or make its issuer independent.

## What each supplied text contributes

### Pasted build plan

**Retain:** exact agreement binding, a readable lifecycle, evidence export and
failure recovery. These are already implemented, with a real synthetic cycle.

**Correct:** its Track 1 label conflicts with its public Devnet, beta/closed-ended
phase proposals. Our environment is the advertised custom server, network 4001,
with a documented mentor-authorized open-ended trial. Its claim of missing
borrower consent is contradicted by the [LoanSet specification](https://xrpl.org/docs/references/protocol/transactions/types/loanset)
and our actual two signatures. Account ownership also does not imply that one
person must hold a single key for every role. Our server-held demo keys are a
prototype custody choice.

**Do not adopt:** automatic acceptance from an AI or receipt, a protocol-repair
story for consent that already exists, or instructions to prewrite findings in
the participant report. JavaScript/TypeScript time-conversion helpers already
exist in installed xrpl.js 5.2.0 (`isoTimeToRippleTime`, `rippleTimeToISOTime`).
Our existing amendment RPC observations likewise disprove the claim that no
ledger query can reveal enabled amendments.

### FIRST_LOSS_CAPITAL_ANALYSIS.md

**Retain:** test minimum-cover boundaries and immutable broker parameters.
**Correct:** rates use tenths of a basis point: 10000 means 10%. Minimum cover
relates to debt, including relevant interest, rather than vault deposits alone.
`CoverRateLiquidation` controls how much minimum required cover can be used on
default; it is not a threshold that triggers liquidation.
[Field definitions](https://xrpl.org/docs/references/protocol/transactions/types/loanbrokerset).

In the pinned standard's example, 10% minimum and 10% liquidation combine to
cover 1% of relevant debt, subject to the default calculation. Our two fields
are both 10000. The demo deposited 20 test XRP of cover, but has **not** tested
default or established a 20-XRP depositor guarantee.
[First-loss example](https://github.com/XRPLF/XRPL-Standards/blob/0200ec57ec70836be04eee436a8e9e9a92e67989/XLS-0066-lending-protocol/README.md#3111-first-loss-capital).

The proposed second 150-XRP loan after lending 100 of a 200-XRP vault confounds
cover with insufficient liquidity. An isolated cover test must leave ample
cash, cap headroom and reserves. The documented insufficient-cover result is
`tecINSUFFICIENT_FUNDS`; `tecNO_AUTH` is not a cover diagnosis.
[LoanSet error cases](https://xrpl.org/docs/references/protocol/transactions/types/loanset#error-cases).

### FREEZE_FEATURE_ANALYSIS.md

**Retain for later:** a controlled issued-token freeze, refusal and recovery
experiment, with ledger status visible to users.
**Correct:** native XRP has no issuer freeze, but vault shares are separate MPT
objects. MPT locking uses `lsfMPTCanLock`, not `lsfMPTCanFreeze`. `TrustSet` uses
transaction `Flags`, including `tfSetFreeze` or `tfClearFreeze`, rather than
`SetFlag`/`ClearFlag` fields.
[TrustSet flags](https://xrpl.org/docs/references/protocol/transactions/types/trustset#trustset-flags),
[MPT flags](https://xrpl.org/docs/references/protocol/ledger-data/ledger-entry-types/mptokenissuance#mptokenissuance-flags).

Not every frozen-asset operation is forbidden: withdrawals to the underlying
issuer have a documented exception. Freezes do not establish their legal cause,
and an app cannot pause the ledger's clock or another authorized actor's
transactions. The protocol is uncollateralized; automatic collateral seizure is
not this loan lifecycle. Do not turn these proposals into compliance guarantees.
[Vault freeze behavior](https://xrpl.org/docs/concepts/tokens/single-asset-vaults#frozen-assets),
[lending scope](https://xrpl.org/docs/concepts/tokens/lending-protocol).

### IMPAIRMENT_AND_PAPER_LOSS_ANALYSIS.md

**Retain:** test impairment timing, actual share pricing and the cure path.
**Correct:** `tfLoanImpair` is the transaction flag; `lsfLoanImpaired` describes
stored state. The pinned standard adds remaining value less outstanding
management fees to paper loss, not simply principal. The due-date boundary
depends on amendments and must use ledger close time.
[LoanManage](https://xrpl.org/docs/references/protocol/transactions/types/loanmanage),
[pinned lending standard](https://github.com/XRPLF/XRPL-Standards/blob/0200ec57ec70836be04eee436a8e9e9a92e67989/XLS-0066-lending-protocol/README.md).

Its claim that impairment discounts deposits while leaving withdrawal pricing
unchanged conflicts with the pinned vault standard. That standard distinguishes
deposit pricing from loss-adjusted withdrawals, with a sole-holder exception.
The quoted gaming example motivates a mitigation in the following paragraph;
it does not establish an existing exploit.
[Pinned exchange algorithm](https://github.com/XRPLF/XRPL-Standards/blob/0200ec57ec70836be04eee436a8e9e9a92e67989/XLS-0065-single-asset-vault/README.md#317-exchange-algorithm).

**Actual new observation:** the current documentation itself differs from that
pinned standard when recalculating assets charged after deposit share rounding.
Both first calculate shares from total assets; the website then subtracts loss
when recalculating the deposit debit. The pinned standard does not. This is a
reproducible documentation discrepancy, not demonstrated ledger behavior. See
[the precise source comparison below](#documented-deposit-formula-discrepancy).

### TRANSFERABLE_SHARES_ANALYSIS.md

**Retain for later:** transfer shares between test accounts and check the
recipient's redemption rights, permissions and actual liquidity.
**Correct:** non-transferability is selected at creation with
`tfVaultShareNonTransferable`; it is not the general default described in the
analysis. The pinned share issuance sets `TransferFee` to zero, so the proposed
share transfer-fee distribution ambiguity is not established.
[VaultCreate flags](https://xrpl.org/docs/references/protocol/transactions/types/vaultcreate#vaultcreate-flags),
[share issuance fields](https://github.com/XRPLF/XRPL-Standards/blob/0200ec57ec70836be04eee436a8e9e9a92e67989/XLS-0065-single-asset-vault/README.md#3162-mptokenissuance).

Transfer/trade capability is not evidence of a funded secondary market or
instant exit at face value. A share buyer supplies liquidity; transferring
shares does not replenish the vault. Keep DEX/escrow and regulated-token claims
outside the current demonstrated scope.

### VAULT_CAP_AND_LIMITS_ANALYSIS.md

**Retain:** exact cap boundaries and concurrent deposits. `AssetsMaximum` is
mutable, with zero meaning unlimited; an over-cap deposit has a documented
`tecLIMIT_EXCEEDED` refusal.
[VaultSet](https://xrpl.org/docs/references/protocol/transactions/types/vaultset),
[VaultDeposit](https://xrpl.org/docs/references/protocol/transactions/types/vaultdeposit).

**Correct:** the pinned lending standard also checks expected interest against
the cap during origination. Therefore, automatically setting the cap equal to
the approved invoice pipeline could obstruct lending. Interest headroom is a
testable requirement, not a quantity to infer from principal alone. The current
short LoanSet error table omits that detailed cap condition, so event behavior
must be measured before implementing a cap policy.
[LoanSet protocol checks, section 3.8.5.2](https://github.com/XRPLF/XRPL-Standards/blob/0200ec57ec70836be04eee436a8e9e9a92e67989/XLS-0066-lending-protocol/README.md).

## Selected experiments and acceptance evidence

Each native experiment uses a separate test vault/request and records network,
amendments, exact signed terms, ledger time, hashes, result codes and before/after
balances. A simulation cannot resolve a discrepancy in event-server behavior.
Do not infer cause from a shared error code: isolate one constraint at a time.

| Priority | Experiment | Evidence required | Status |
|---|---|---|---|
| 1 | Terminate process after remote acceptance, before local acknowledgement | Same signed blob and approvals after restart; one submission; recovered funding; stale writer lock blocks another writer | **Passed locally**, real process termination with explicitly simulated ledger and receipts |
| 1 | Terminate after validation lookup, before storing its result | Restart recovers the existing loan and receipt state without submission | **Passed locally**, same simulation boundary |
| 2 | Cap boundary and competing deposits | Exact cap fits; one drop beyond refuses; two independent depositors competing for one remaining slot cannot both exceed the cap; rejected principal stays put, network fees measured separately | **Passed on event network 4001**, seven real transactions, principal returned; competition landed in consecutive ledgers |
| 2 | Cover boundary with ample cash and cap headroom | Below-threshold refusal; sufficient-cover success under separately approved exact loan terms; read actual debt/cover changes, not just result code | Selected, native execution pending new exact loan approval |
| 3 | Impairment pricing and cure | At least two holders to avoid sole-holder exception; compare actual shares and deposit debit against both published formulas; measure withdrawal and repayment/cure state | Selected to resolve DOC-002; not a confirmed exploit or executed test |
| 3 | Interest/cap and final-payment rounding | Read debt and interest headroom; reconcile final payment, remaining debt, shares burned and actual cash; distinguish gross yield from all network fees | Selected extension of the existing repayment evidence |
| Later | Issued-asset freeze or share transfer | Separate issuer/recipient setup; exact permissions, refusal, recovery and balances | Useful optional scope; does not delay the working demo |

For timing experiments, `fixCleanup3_4_0` makes impairment require a close time
strictly after the due date. Public-network timing cannot guarantee an exact
equality ledger; record what actually closed and use a controlled ledger harness
if an exact boundary is required. Never report an unobserved equality test.

The new process tests live in `tests/process-crash.test.ts` and its test-only
worker. That test round passed **20 tests, zero failures, 9,538.4372 ms**. They kill an
actual child process after an IPC checkpoint, observe its exit, verify the stale
lock owner, then restart a separate process. The application code was unchanged
for those process tests. This does not establish behavior under disk corruption, power
loss, every concurrency pattern, or a live ledger crash.

After the next Wi-Fi change, real ledger access returned. A fresh verification
exposed optional `ctid` comparison friction; a narrow correction and regression
brought the suite to 21 passing tests, and the original cycle passed online
verification again. This was observed application hardening, not a protocol
funding fault. See VERIFY-001 in [DEVEX_LOG](../DEVEX_LOG.md).

The isolated cap experiment then passed on the real event server. Two deposits
competed for the last 5 test XRP of a 10-XRP cap: one succeeded at ledger 68522,
the other returned `tecLIMIT_EXCEEDED` at 68523. A further one-drop deposit and
lowering the cap below held assets also returned that code. All 10 XRP of
principal was withdrawn, with a separately verified zero vault-account balance.
The two competing transactions did not land in the same ledger, so this is not
evidence of a same-ledger ordering test. Fees totalled 2.000072 test XRP, including
the 2-XRP VaultCreate fee. The empty experimental vault remains; its owner
reserve is separate. The original vault's state was unchanged.

[Public cap evidence](../evidence/native-cap-001.json) contains all seven hashes,
metadata and state snapshots. Independent fresh verification passed at
15:11:24 UTC:

```sh
npm run build
node dist/scripts/verify-cap-test.js --mentor-confirmed-open-ended
```

That command is read-only. `scripts/native-cap-test.ts` is the separate mutating
runner; its stable operation IDs recover recorded transactions on restart.
The final-state assertion initially expected explicit zero fields, while the
server omitted them. After checking the zero account balance, the runner was
corrected and rerun; it recovered the same seven hashes without new transactions.

## Documented deposit formula discrepancy

Checked September 12 at 14:31:14 UTC. Let A be pre-deposit total assets, S shares
outstanding, L unrealized loss and q the newly minted, rounded share count.

| Source | Recalculated assets charged after shares are rounded |
|---|---|
| XLS-65, pinned revision `0200ec57ec70836be04eee436a8e9e9a92e67989`, section 3.1.7.2.1 | `q * A / S` |
| Current xrpl.org vault concepts, source revision `c07aa58697d73f26ce68439fde94baca0d26a614`, Deposit tab | `q * (A - L) / S` |

[Pinned standard](https://github.com/XRPLF/XRPL-Standards/blob/0200ec57ec70836be04eee436a8e9e9a92e67989/XLS-0065-single-asset-vault/README.md#31721-deposit),
[pinned documentation source](https://github.com/XRPLF/xrpl-dev-portal/blob/c07aa58697d73f26ce68439fde94baca0d26a614/docs/concepts/tokens/single-asset-vaults.md).
The downloaded documentation source has SHA-256
`86cf73525d49bdbe3e60853a6dccb1df1149d1de781b1828478d04c972d52909`;
the snapshot stays in ignored `reference/source-review/`.

Our previous real cycle had zero unrealized loss, so it cannot distinguish the
formulas. Proposed mentor question: which deposit debit formula should this
event build implement, and which documentation should be corrected? No message
has been sent and no protocol/security report submitted.

## Product additions worth carrying into the shared UI

Show total position value, available cash, paper loss and realised return as
separate fields, with ledger freshness. Display a specific validated refusal
without guessing its legal or business cause. Show receipt recovery separately
from funding so an unavailable authority cannot make completed funding appear
unfunded. Keep changes to terms/documents visible as a new approval request.

A later dispute receipt could link an authorized management action to its stated
reason, but would not prove the dispute is true or turn an app notification into
permission to impair. The current frontend/approval demo remains the next
delivery milestone alongside the selected native experiments.
