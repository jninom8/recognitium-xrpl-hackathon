# Backend readiness, September 13

| Capability | Current evidence / limitation |
| --- | --- |
| Native Track 1 cycle | Two completed runs: vault, deposit, broker/cover, co-signed funding, repayment, positive gross yield and native refusal. |
| Request/receipt/XRPL binding | Original and AI intake run verified; signatures bind Data; altered document rejected. |
| New matching | Durable private Blob state, CAS retries, exact request/availability, actual balance observation, both demo approvals and authority-checked match receipt. |
| Shared frontend | Borrower/Lender progress and admin checklist read the same API. No chatbot on Admin. Historical native evidence remains selectable. |
| Matched native execution | Implemented bridge binding and controlled lender check, tested locally. New real matched loan awaits admin and exact loan approvals; not an end-to-end claim yet. |
| IVM | Real search and authorized public demand published. Browser AI is not connected to live IVM tool execution; operator MCP provides discovery/issuance. Local availability is labelled. |
| Wallet/identity | Backend-managed development wallets. A typed address does not prove wallet control. No real KYC provider, KYC commitment or authenticated separate humans. |
| Liquidity | Total validated wallet balance is an observation, not spendable funds or vault capacity. Application allocation is not an XRPL reservation. Native validation and controlled lender deposit remain required. |
| Receipt recovery | Official authority lookup verifies exact content; no blind trust in a self-consistent hash. New matching receipt issuance is operator-assisted, not an unbounded public metered endpoint. |
| Track 2 | Not implemented or claimed. Expiry rejection in matching is an application guardrail, not a native Track 2 window refusal. |
| Roles | Public synthetic demo views, not authentication. Do not use for real credit. |
| Capture | Project hooks registered; historical automatic events exist. Current projectless task automatic capture has not advanced; explicit genuine reflections are delivered separately. |

## Running matched preparation

After both matching approvals, receipt recovery and Admin Accept, prepare through
an operator with the existing controlled lender source run. The third argument is
the source run ID, never a seed. Use the current bridge CLI environment documented
in NATIVE_BRIDGE.md. It refuses a source wallet whose address differs from the match.
Preparing a 60-second demonstration offer still requires a fresh explicit human
approval of that counter-offer before either loan signature. Match approval is not
loan approval. Reusing an existing plan cannot replace its matched lender or terms.

## Next verification gate

Run a new accepted matched proposal through exact loan approval, signing, funding,
repayment and return, and export its bundle. Do not substitute the earlier completed
loan as evidence that the new matching path has run. Keep the historical demo usable
while this separate path is checked. Real IVM offer discovery and authenticated KYC
remain separate integration work; neither is required to claim the existing Vanilla
native-cycle evidence, and neither should be presented as already done.
