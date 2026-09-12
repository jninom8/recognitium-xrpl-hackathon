# Wallets used by this demo

The application uses `xrpl@5.2.0`'s `Wallet` objects on the Node backend. The event
faucet provisions the funded accounts; the backend loads the saved seed using
`Wallet.fromSeed`. There are three accounts: lender, broker/vault owner and
borrower. Accounts and transaction hashes appear in the reviewed public evidence.
Seeds stay in ignored local `wallets/`, outside the browser and GitHub.

This is **backend custody of demonstration keys**. The backend can technically
sign for both demo accounts. Application rules require exact human approval
before it signs; this is not independent user wallet custody or production
authentication. Two people can review through separate PCs without transferring
those wallet keys. Each uses a different application role capability.

The workshop's pages 10 and 12 show generating/importing SDK wallets and test
faucet funding. The event brief additionally lists `xrpl-connect` and a browser
wallet extension. The current [XRPL Connect documentation](https://xrpl-commons.github.io/xrpl-connect/guide/getting-started.html)
lists adapters including Xaman, Crossmark, GemWallet, Ledger and Otsu. An adapter
is a connection/signing integration, not a wallet account in itself. None has
been installed or used for this completed lending cycle.

Before adopting the mentor's preferred extension, verify its exact current
version against this event network and the required signing operation:

1. Explicit custom endpoint/network 4001 support, with no fallback to Mainnet.
2. Support for native Vault/Loan transactions in the pinned SDK/server version.
3. Broker and borrower `LoanSet` signatures over the exact approved fields and
   metadata, preserving the other signature and avoiding wallet-side autofill
   changes after review. Ordinary Payment signing is not sufficient evidence.
4. User rejection, wrong account/network, changed terms and expired transactions
   fail safely. A delayed response reconciles the same signed hash.

These compatibility checks are pending. Keep the proven backend signer for the
current rehearsal; evaluate one mentor-recommended wallet in isolation after
the shared state milestone. A future wallet integration should return signatures
to the same approval/journal flow, rather than bypass it with a separate send path.
Never import the existing demo seeds into a browser extension just to make a
connect button appear functional. Use new development accounts for that test.
