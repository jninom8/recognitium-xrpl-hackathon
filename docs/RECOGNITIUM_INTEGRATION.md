# Recognitium context for the implementation agent

## What the service adds

The current public primitive is: hash private content locally, send its SHA-256
commitment to the service, receive a receipt, and verify its relationship to the
authority history. The event application will connect an agreement commitment
to a validated XRPL loan and its later repayment. It will not replace XRPL's
signatures, validation or account balances.

Documents and private business details remain with the application/participants.
Publishing a demand to the public IVM is a different disclosure decision from
sending only a hash to the receipt API. Keep demo descriptions synthetic.

The source of the project name and hardware research is the QCP. That work is
paused for this hackathon. A live read on September 12 reported the production
authority engine as `native_c_ext (classical)`. Do not present this application
as a quantum hardware demonstration or an implementation of one-shot signatures.

## Verified existing interfaces

Tool names below are the logical service names; host-specific connector prefixes
can differ. Discover tools in the new session instead of assuming connections
carry over automatically.

| Existing interface | What it does | Use in this build |
|---|---|---|
| `ivm_search({query})` | Searches live, unexpired public signals | Optional discovery of a synthetic request or offer |
| `ivm_publish({kind,description,ttl_s,in_reply_to?})` | Publishes a fact, offer or demand and mints a receipt | Optional demo after approval of exact public text, expiry and cost |
| `ivm_read({receipt_id})` | Receipts the fact that a signal was consulted | Can show what an agent consulted; does not show agreement or payment |
| `seal_hash({data_hash})` | Seals a 64-hex SHA-256 commitment | Agreement and execution receipts |
| `verify_receipt({receipt_id})` or `{receipt}` | Verifies an existing receipt | Authority verification, with independent content check |
| `chain_tip({})` | Reads the public authority head | Retain a known checkpoint with its observation time |

The connected tools expose these schemas. A public `chain_tip` request succeeded
during this handoff. No new public signal or metered receipt was created by the
handoff work. Earlier planning found no lending signals; do not treat that old
query as a current market inventory.

`ivm_publish` and `ivm_read` cost one tick each; `seal_hash` costs one tick.
Ticks are a service meter, not money transferred between users. Search is free
to browse but may require authenticated access. Recheck the active account and
tool descriptions before paid calls. Publishing defaults to 30-minute expiry,
with allowed duration 60 seconds to 24 hours and a 500-character description.

## Simplest integration path

Use the existing hosted service through a small server-side adapter. The local
company MCP implementation confirms these routes:

- `POST https://api.recognitium.com/v1/digital-clock`, JSON
  `{"data_hash":"<64 hex SHA-256>"}`, with `X-API-Key` supplied privately.
- `GET https://api.recognitium.com/v1/authority/tip`, public head read.
- `GET https://api.recognitium.com/v1/verify/receipt/<receipt_id>`, receipt lookup
  and verification. Confirm the current response schema with a read-only call.
- Hosted MCP endpoint: `https://api.recognitium.com/mcp`. Use the installed
  connector when available. A separately built MCP client needs its own verified
  authentication/initialization flow; do not invent a bearer token or copy the
  desktop application's credentials.

Existing company references were checked at commit `1f8232c`:
`Tools/recognitium_mcp_server.py` and `recognitium_client/README.md`.
Those private implementation files are not copied into this repository.

There is also a Python client layer for receipt-gated local writes, state audit
and verification. It is separate from the hosted Authority API. Reuse that layer
only if its packaging/licence and receipt version fit the public demo; avoid
copying the whole company tree or coupling the JavaScript app to a private path.
The minimal adapter can use the verified API without importing private code.

Keep credentials in the host environment or an ignored local file, server-side.
Document only variable names in `.env.example` when code is written. No API key
has been added to this repository. Do not print environment values for diagnosis.

## Proposed AI-assisted demonstration

1. A fictional business has a request with an asset, amount, purpose and expiry.
2. An agent discovers the request and explains a candidate match. Use existing
   MCP search if a suitable approved synthetic signal exists; otherwise use a
   clearly labelled local fixture. Do not fabricate a live match.
3. The agent prepares the exact agreement. People review and approve it.
4. The application locks the version, seals its commitment and verifies the
   receipt. Broker and borrower sign LoanSet including that commitment.
5. XRPL validates the loan and transfers funds. The adapter obtains the actual
   transaction result and creates an execution receipt linked to the agreement.
6. Repayment, withdrawal and the evidence check complete the demonstration.

This reuses the information/receipt rail for coordination around a money flow.
It does not turn the IVM itself into a payment network. An AI model is optional:
the already connected agent can demonstrate discovery without adding a paid
model API or granting autonomous authority over funds.

## Verification boundaries the UI must preserve

The current local MCP helper rederives the receipt's `new_tip` as SHA-256 of:

`hex(prev_tip) || hex(fingerprint) || hex(payload_hash) || uint64_be(timestamp_ns)`

Here `hex(...)` means decode the hex string into bytes, not concatenate its text.
Retain nanosecond timestamps as exact integers; JavaScript Number cannot preserve
arbitrary uint64 values. Inspect the actual JSON representation before parsing.

That calculation checks internal consistency only. A fabricated self-consistent
receipt can also satisfy a public hash formula. The verifier must separately
check the receipt's payload against the agreement and its membership/authenticity
against a known authority record or supported proof. Never display all of these
as a single unexplained green check. Preserve the distinction in offline mode.

An agreement receipt does not prove the documents are truthful. A read receipt
does not prove acceptance. An execution receipt committed after a transfer does
not prove the transfer by itself; check the XRPL transaction and signed binding.
An on-chain loan can be created outside this application's receipt gate, so the
application must not claim protocol-wide enforcement of Recognitium usage.
