# XLS-65/66: implementation notes

Primary source supplied by the founder: XRPLF/XRPL-Standards, master resolved on
September 12 to `0200ec57ec70836be04eee436a8e9e9a92e67989`. Both full READMEs
are downloaded under ignored `reference/standards/`. The notes below come from
review of the relevant introductions, transaction fields, failures and rationale;
they are not a claim of a full mathematical audit of both specifications.

## What to reuse

XLS-65 provides the Vault object, creation/settings/deletion, deposits, share
accounting and withdrawals. Distinguish `AssetsTotal` from `AssetsAvailable`.
Open-ended withdrawal eligibility does not manufacture available cash.

XLS-66 provides LoanBroker, Loan, broker cover operations, LoanSet and LoanPay.
Its architecture uses off-chain underwriting. The application should record
what evidence was reviewed, not claim that the ledger authenticates invoices.

## Details that prevent expensive mistakes

- The current specification requires the vault owner and broker owner to be the
  same account. Model three economic roles with this ownership restriction.
- LoanSet requires both parties' signatures and creates/funds the loan in the
  same transaction. There is no separate LoanDraw in the listed transaction set.
- The optional LoanSet `Data` field holds at most 256 bytes. An agreement hash
  fits. Test support in the selected SDK/server and coverage by both signatures.
  Common transaction Memos are another candidate; choose one demonstrated path.
- `InterestRate` is annualized in tenths of a basis point. A value of 500 means
  0.5% annually, not 5% and not interest per payment interval.
- `PaymentInterval` is seconds with a documented minimum of 60. GracePeriod
  must be at least 60 and no greater than PaymentInterval in this snapshot.
- Very short/small test loans can fail with precision loss or yield rounded to
  zero. Select feasible test amounts/rates, document the calculation and compare
  against actual ledger metadata. No zero-interest shortcut for a yield demo.
- Cover is optional in the model but configuration may require it. Insufficient
  required cover and insufficient vault liquidity can both reject LoanSet.
  Avoid presenting one code as uniquely identifying a cause without the state.
- Native rejection may still incur a transaction fee. A validated `tec` result
  must not be labelled a successful loan.
- Capture reserves, fees, faucet transfers and lending flows separately.

## Event environment is a separate requirement

The current master standards are design sources, not proof of which amendments
the event server runs. Pin the SDK and record server_info/amendments first.

| Setting | Track 1 (current choice) | Track 2 (fallback if deliberately selected) |
|---|---|---|
| Mode | Open-ended, Lending V1 | Closed-ended, Lending V1.1 |
| WSS | `wss://lending-hackathon.dev.ripplex.io:51233` | `wss://s.devnet.rippletest.net:51233/` |
| HTTP | `https://lending-hackathon.dev.ripplex.io:51234/` | `https://s.devnet.rippletest.net:51234/` |
| Faucet | `https://lending-hackathon-faucet.dev.ripplex.io/accounts` | `https://faucet.devnet.rippletest.net/accounts` |
| SDK guidance | Exact stable `xrpl@5.2.0`, live cycle verified | Mentor update relayed: `xrpl@5.2.0-beta.1`; public brief refresh still returned beta.0 |
| Explorer | `https://custom.xrpl.org/lending-hackathon.dev.ripplex.io:51233/` | `https://devnet.xrpl.org/` |

The generic workshop Payment example uses Testnet. It is not the Lending V1
network. The listed RLUSD faucet is also Testnet-only; use test XRP initially.

Track 2 requires fixed SubscriptionDate and RedemptionDate and a complete timed
phase demonstration. Deposits/withdrawals are blocked during investment, and
new LoanSet is blocked during redemption. Demonstrate all specified rejected
actions. Final loan payment must be scheduled before redemption. Consult the
event V1.1 guide for realized-interest/donation accounting; do not mix that with
V1's accounting. The public Devnet wall clock cannot be accelerated locally.

## Sources

- [XLS-65](https://github.com/XRPLF/XRPL-Standards/tree/master/XLS-0065-single-asset-vault)
- [XLS-66](https://github.com/XRPLF/XRPL-Standards/tree/master/XLS-0066-lending-protocol)
- [Event-specific V1.1 guide](https://opensource.ripple.com/docs/lending-protocol-v1-1)
- [Co-signing tutorial](https://xrpl.org/docs/tutorials/defi/lending/use-the-lending-protocol/create-a-loan)
- [VaultWithdraw reference](https://xrpl.org/docs/references/protocol/transactions/types/vaultwithdraw)

Track 1 connectivity initially timed out on the venue network, then worked on
the hotspot. The complete native cycle passed on network 4001, server 3.4.0-rc1,
with mentor-authorized open-ended testing despite enabled V1.1. See STATUS.
The September 12 [SDK update comparison](SDK_UPDATE.md) explains beta.1 versus
the stable SDK already used successfully, with an isolated compatibility check.
