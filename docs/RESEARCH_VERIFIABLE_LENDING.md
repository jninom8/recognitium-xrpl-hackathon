# Recognitium and verifiable lending

**Recommendation.** Make each loan come with a portable record that connects the exact agreement to its signatures and observed execution. Give participants a simple “Verify this loan” action. The strongest immediate contribution is a small, inspectable reference implementation around native XRPL lending, with evidence that remains useful outside the application.

This is a product hypothesis supported by the implementation and by prior work. It is not a claim that Recognitium invented digital signatures, timestamping, programmable contracts, payment mandates or cryptographic evidence. It is also not proof of demand, patent novelty, legal enforceability or production readiness.

**The concrete problem**

A borrower requests financing for 60 days. A broker prepares an offer. Someone changes the period, amount, recipient or supporting document. A transfer eventually appears on the ledger. A payment hash alone does not tell an ordinary participant whether those are the terms they intended to accept. An application status alone leaves the participant dependent on the application's interpretation and continued availability.

The current synthetic request illustrates this precisely: it requested 600 test XRP for 60 days, while the prepared demonstration offer uses a 60-second repayment interval. That difference is legitimate only as a visible counter-offer followed by exact approval. Hiding it would make a technically successful transfer commercially misleading. Recognitium's useful unit is therefore the entire relationship between the request, accepted version and execution, with the limits of each check visible.

The product sentence should be: **“See what was agreed, see what happened, and verify that they belong together.”** For a future AI-assisted workflow: “AI can prepare the proposal; people control the permission; the ledger records the money movement.” The production version would need an independently authenticated consent surface and signer boundary to make that second sentence an enforceable security property.

**Historical foundations**

The history does not show an uninterrupted march toward removing trust. It shows repeated attempts to specify which party, record or institution can establish a particular fact. This distinction helps place the prototype accurately.

| Development | Historical fact | Design lesson for this application |
|---|---|---|
| Bills of exchange | Section 3 of the original UK Bills of Exchange Act 1882 described a signed written payment order, with a specified sum, beneficiary and payment timing.[^1] | Amount, recipient, timing and acceptance belong in the instrument. A financing product needs more than a transfer status. This prototype is not asserted to be a legally negotiable bill. |
| Standard financial messaging | Swift was formed in 1973 and its messaging service went live in 1977.[^2] | Shared conventions and coordination are valuable infrastructure. Information services and money movements have distinct responsibilities. |
| Smart contracts before blockchains | Nick Szabo's 1997 paper discussed protocols and interfaces for securing relationships, including credit and payment arrangements.[^3] | The approval interface and completeness of the specification are part of the system, not decoration around it. |
| Evidence accompanying requests | Appel and Felten published Proof-Carrying Authentication in 1999.[^4] | Requiring checkable evidence with a request is longstanding computer-security work. The present bundle is not a formal proof in that system. |
| Hash-based timestamping | RFC 3161, published in 2001, describes timestamping a data imprint and signing the resulting token.[^5] | Sending a hash rather than a private document is established practice. Issuer authentication must be distinguished from recomputing a hash. Recognitium is not claimed to implement RFC 3161. |
| Shared transaction history | Bitcoin's 2008 paper combines signatures with a network history to address double-spending.[^6] | A consistent history can establish a payment outcome under its trust assumptions. It does not establish the truth of every external commercial assertion. |
| Typed signing and digital documents | EIP-712, created in 2017, addresses structured signing and human-readable review, while explicitly leaving replay protection outside its scope. UNCITRAL's 2017 MLETR addresses electronic transferable records through integrity and control requirements.[^7][^8] | Meaningful signing, replay handling and exclusive control are different problems. One hash does not solve all three. |
| Modern programmable finance | FINOS CDM standardizes trade/lifecycle representations; Accord Project connects contract prose, data and executable logic.[^9][^10] | Reusable schemas and deterministic interpretation matter more than inventing another application-specific status vocabulary. |

This reading leads to a narrow insight: the useful advance is reducing the work needed to reconcile an agreement with its execution. A lender should not need one person to interpret a PDF, another to interpret a transaction explorer, and a third to explain a receipt before they can tell whether the records match. Whether this reduction is large enough to support a business remains an empirical question.

**The strongest prior art and adjacent systems**

Accord Project already supports machine-readable and machine-executable contracts, including fixed-rate loan examples. FINOS CDM already represents financial products and their lifecycle events. Those are important precedents against claiming that a shared state contract or computable agreement is new.[^9][^10]

The AP2 specification currently identifies itself as v0.2. It defines Checkout and Payment Mandates and linked receipts, requires deterministic verification, and describes their use as dispute evidence. Its direct mode obtains explicit approval on a trusted surface. It also notes the utility of retrieving a checkout mandate by a transaction reference.[^11] These are close conceptual neighbors. Recognitium currently implements neither AP2's formats nor its interoperability requirements.

AP2's security document explicitly includes agents in its threat model and addresses altered payments, unrelated checkout reuse and repeated mandate use.[^12] This supports keeping AI outside the trusted decision boundary. It does not justify claiming that this prototype is safe against all prompt injection: the local operator and its keys still have significant authority.

BIS Project Mandala demonstrated compliance checks and accompanying proofs in an experimental cross-border setting, including lending. That is a stronger precedent than a generic claim that finance lacks verifiable workflows.[^13] Recognitium is not performing Mandala's regulatory checks and must not call its agreement receipt a compliance certificate.

Swift also already provides payment tracking through shared references and status reporting.[^14] Therefore, a synchronized timeline is useful UX, but cannot carry the novelty claim by itself.

| Existing approach | Capability that must be credited | Candidate Recognitium contribution |
|---|---|---|
| XRPL native lending | Loan creation, transaction signatures, native funding/repayment and vault accounting | Document-bound coordination, receipt integration and a comprehensible evidence export around those primitives |
| Accord Project | Connections between prose, typed terms and executable contract logic | An opinionated, small XRPL lending integration; future interoperability is a proposal |
| FINOS CDM | Common financial product and lifecycle semantics | A limited event-native workflow with explicit mappings and observable failures |
| AP2 | Payment authorization mandates, reference binding and dispute evidence | Potential future lending-specific adapter, after a standards mapping and tests |
| Mandala | Experimental programmable compliance and verifiable checks | No equivalent compliance claim; retain a narrower agreement-to-execution focus |
| Swift tracking | Shared payment references and status visibility | Participant-held verification material in addition to a hosted progress view |

The research does not establish that no other product combines these features. It establishes that the components and much of the architecture already have prior art. The plausible differentiation is delivery quality, integration effort, a useful lending-specific workflow and evidence that another developer can reproduce.

**What the repository actually supports**

The relevant implementation is `src/requests/service.ts`, `src/xrpl/transactions.ts`, `src/recognitium/evidence.ts`, `src/recognitium/client.ts`, `scripts/verify-bundle.ts` and `scripts/bridge.ts`. The current implementation was inspected at commit `db977ff`; the research helper added with this document does not change lending behavior.

1. A private document has a salted commitment. The structured agreement contains that commitment, terms, accounts, network and object identifiers.
2. The prepared LoanSet contains the agreement hash in its signing data. The application stores the complete prepared transaction digest, including fee and ledger expiry.
3. The application records separate broker/borrower approval entries for that exact pair of hashes. Its signing service checks those entries, document consistency and receipt state.
4. Both XRPL transaction signatures bind the prepared transaction. The exporter and verifier check those signatures and their account relationships.
5. Funding is established from the validated transaction and its metadata, including the borrower balance change and created loan object.
6. A separate execution manifest links that ledger result to the agreement. Recognitium receipts are checked for content consistency and against the authority record.
7. Repayment, withdrawal, realised gross yield and native refusal are retained in the cycle evidence. The original published cycle has these records; the new 600-XRP run has not completed them.

XRPL's lending architecture explicitly relies on off-chain underwriting and risk management.[^15] The application's natural location is therefore around the broker's preparation, approval and evidence workflow. It should not present native ledger validation as an invoice or creditworthiness check. LoanSet already supports counterparty signing; that protocol capability belongs to XRPL.[^16]

At the read-only hosted checkpoint of September 13, 01:24 Paris, request E0403F17 remained `AGREEMENT_LOCKED`, with zero approvals and funding marked `unfunded`. Its setup had validated a vault, a corrected 1,200-XRP deposit, broker and 120-XRP cover. Its original deposit refusal and recovery are documented in STATUS. The earlier original cycle remains the completed evidence example. An expiring prepared offer must be checked again before execution; research does not extend its ledger bound or constitute approval.

**Four trust boundaries that change the strategy**

First, an exact signature proves an action by a key, not independently informed human consent. Both demo keys are held on the operator backend, and the public roles are presentation views. The approval records themselves are application records. An operator able to bypass the application and use both keys could originate a different loan. Production consent would require separate participant-controlled keys or a signer/custodian that independently verifies authenticated exact approvals. That is a substantial trust improvement, not a cosmetic wallet-connect button.

Second, deterministic computation of a receipt's chain hash does not authenticate its issuer. The current client establishes the authority's record by HTTPS lookup of the receipt ID. It does not validate an independently anchored or issuer-signed offline certificate. The record can be portable for content and XRPL-signature checking while still depending on the authority for a fresh authority verdict. A future externally verifiable authority-signature/checkpoint design requires its own threat model, key handling and verification work.

Third, request-level replay protection is not a universal registry of financed obligations. The journal can preserve one attempted transaction across restart and retry. It does not prove that the same invoice was never financed through a different request, another broker or another system. MLETR's distinction between copies and control is a useful warning against that leap; its legal model is not satisfied merely by adding a receipt.[^8]

Fourth, evidence can make an incorrect assertion durable. A supplier can issue a false invoice; a borrower can default; an authorized person can approve a bad deal. The useful claim is narrower: a verifier can test whether the supplied document, signed transaction and claimed outcome are consistent, under stated source and identity assumptions. No amount of hash checking makes inventory exist or creates repayment capacity.

The current service is classical software. Quantum hardware and one-shot-signature claims are outside this build. The intended contribution is observable coordination and evidence, without borrowing guarantees from another research project.

**The hard counterfactual: remove Recognitium**

If the application only needs to put a document commitment into LoanSet and later check the ledger, XRPL plus the application can already do much of that work. This is the most important objection to test with a potential user. Adding a paid receipt does not automatically create new value.

Recognitium's candidate additional value is a consistent service record for agreement and execution events, including events outside the ledger, plus reusable retrieval and verification behavior. The agreement receipt can exist before settlement; the execution receipt connects a specific outcome to that agreement. A receiving organization might prefer that stable interface to implementing its own document/transaction reconciliation. This is an adoption hypothesis, not measured cost reduction.

The honest technical design should therefore expose separate verifiers. A user should be able to see that the transaction signatures check even while the receipt authority is unavailable. Removing the receipt service must not cause already validated funding to disappear from the displayed financial state. Conversely, the receipt service returning “verified” must not make missing XRPL validation appear successful.

A small team should initially test this with the people who already reconcile lending records: broker operations, servicing teams or developers integrating native lending. A two-sided marketplace would add borrower acquisition, lender acquisition and underwriting obligations before evidence demand has been established. This is a sequencing recommendation, not evidence that these organizations will buy.

**Research experiment completed on the existing evidence**

`scripts/check-evidence-boundaries.mjs` runs without the website or an application session. It reads the already-public synthetic original-cycle bundle. It never signs, issues receipts or writes to the ledger. All adversarial changes occur in in-memory copies and are explicitly labelled simulations. With `--online-authority`, only the existing public receipt ID is sent in two read-only lookups; altered receipt bytes are never submitted.

| Case | Observed result |
|---|---|
| Original recorded bundle, offline | Content and both signatures consistent; authority and ledger require online lookup |
| Changed document copy | `Changed document` |
| Altered signed agreement commitment | `Signed transaction differs from approval` |
| Inflated yield | `Realised yield does not reconcile` |
| Erased original late-payment refusal | `Late retry requires original validated refusal` |
| Self-consistent altered receipt, offline | Still explicitly requires authority lookup |
| That altered receipt compared locally to the real authority record | `Authority record differs: new_tip` |

The original file remained unchanged, SHA-256 `107fbd6134c66091c2677cb31a0082b67628e63fe4375016eb41f7ad13679b57`. The experiment completed at 01:23:06 Paris on September 13. A separate fresh online verification of the original bundle also returned both-valid signatures, an authority-record verification and validated XRPL success, including comparisons of the cycle transaction records.

These are author-operated experiments using the repository's verifier. They are not independent implementation, independent participant reproduction, a formal security proof or an exhaustive audit. The altered receipt case is a deliberate boundary check, not an observed fraudulent receipt or a fabricated bug report. The machine-readable observations are retained in `evidence/research-evidence-checks.json`.

Reproduce from the public repository with the documented Node/SDK environment:

```powershell
npm ci
npm run build
node scripts/check-evidence-boundaries.mjs
node scripts/check-evidence-boundaries.mjs --online-authority
node dist/scripts/verify-bundle.js evidence/synthetic-supplier-001.json --online --mentor-confirmed-open-ended
```

The offline run requires no service access. Online results depend on the real authority and event endpoint remaining available and retaining the necessary history. Failure to reach either source must yield an unavailable/unknown status, not a positive verification result.

**The smallest product addition**

Expose the existing verification capability through a compact “Verify this loan” view. The screen should answer three separate questions in ordinary language:

| Question | Check | Possible result |
|---|---|---|
| Is this the same agreement and document? | Canonical agreement, local document commitment, prepared transaction and both signatures | Matches, differs, or required material missing |
| Does Recognitium recognize these receipts? | Exact receipt content compared with the authority source, with check time | Verified at a stated time, mismatch, or unavailable |
| Did the ledger execute this loan and its later payments? | Correct network, transaction result/metadata, loan relationship, repayment and withdrawal accounting | Validated result, refusal, incomplete history, or unavailable |

A public demo can use the reviewed synthetic bundle. Real private documents and salts must stay with authorized participants; the current public exporter is deliberately restricted to synthetic agreements. A future private-document browser verifier should hash locally, minimize disclosure and avoid pretending that on-chain amounts/accounts are private.

The UI should include a controlled “Try a changed copy” demonstration that changes only an in-memory synthetic copy. It should also offer the evidence file and the standalone verification command. A QR code may improve convenience, but the linked data and verifier matter more than the code itself. A hosted verification page alone is not independence: users need the downloadable record and inspectable verifier as well.

This is one addition to the same product, not a fourth operating role. Borrower and reviewer continue using their existing views. Verification is a shared action on a particular loan; it must never silently select a different cycle or imply that an unavailable authority means the borrower did not receive money.

**A demonstration that tests the claim**

The essential sequence is: show the request and explicit counter-offer; obtain exact approval; show native funding; verify the resulting record outside the application; alter a copy; show rejection; retain the true funded state during receipt recovery. Repayment and lender withdrawal complete the required native cycle, with actual observed amounts and yield.

The presentation should visibly distinguish the founder acting in two synthetic roles from two independently authenticated participants. It should identify which evidence belongs to the original completed run and which belongs to the fresh request. A claimed outage should either be a controlled, labelled interruption or a genuine observed one. It is unnecessary to disable the public site merely to show a verifier that makes no application HTTP calls.

The downloaded challenge, page 8, assigns 40% to developer feedback, 30% to XRPL technical execution, 20% to use case and 10% to presentation; it also mentions contribution back. Page 5 explicitly permits Vanilla. The saved Notion brief emphasizes a working experiment with reproducible friction, rather than a polished startup.[^17] This favors a completed cycle, reproducible verifier and precise findings over a last-minute marketplace, new asset or standards-integration claim.

Recommended order: complete the selected native cycle after fresh exact approval; export and check its evidence; add the compact verification view; rehearse one controlled rejection and recovery; reserve time for the participant-written feedback report. The present research is a strategy document and does not replace that report.

**What would falsify the product thesis**

The first test is practical: can another developer use a clean clone and supplied evidence to reach the same result without help? Measure setup time, manual steps and ambiguities. The second is adversarial: can a changed amount, recipient, duration, document or ledger outcome survive verification? The third is operational: after a lost response or restart, can the system reconcile the original result without creating another loan?

The commercial test is whether a broker or receiving operations team actually needs this evidence format. Compare their existing investigation time and required records with the proposed workflow. Ask which disputed fact a receipt changes. If a transaction explorer, signed agreement and existing case-management system already answer their question adequately, the integration has not earned a place in their workflow.

The thesis also weakens if verification requires trusting an unexplained Recognitium badge, if exposing private data is necessary to obtain useful results, or if the signer can bypass all business approval checks. Those findings should direct the next engineering work. A result that rejects the business hypothesis is more useful than adding features to avoid testing it.

The most ambitious defensible direction is reusable evidence for authorized financial execution, starting with one native XRPL lending flow. The immediate deliverable is much smaller and measurable: one loan whose agreement, signatures and execution can be inspected together, whose failures remain visible, and whose record participants can keep.

**Sources and evidence**

Web sources were accessed September 13, 2026. Version-specific statements refer to the retrieved material, not all earlier versions. Historical sources are used for lineage, not as current legal advice. Local source decks remain ignored and are not reproduced or redistributed.

[^1]: UK Parliament. [Bills of Exchange Act 1882, original enactment, section 3](https://www.legislation.gov.uk/ukpga/1882/61/pdfs/ukpga_18820061_en.pdf).
[^2]: Swift. [Our story](https://www.swift.com/about-us/who-we-are/our-story), sections on 1973 and 1977.
[^3]: Nick Szabo. [Formalizing and Securing Relationships on Public Networks](https://firstmonday.org/ojs/index.php/fm/article/view/548). First Monday 2(9), September 1, 1997.
[^4]: Andrew W. Appel and Edward W. Felten. [Proof-Carrying Authentication](https://collaborate.princeton.edu/en/publications/proof-carrying-authentication/). ACM CCS, November 1999; Princeton publication record.
[^5]: C. Adams, P. Cain, D. Pinkas and R. Zuccherato. [RFC 3161: Internet X.509 Public Key Infrastructure Time-Stamp Protocol](https://www.rfc-editor.org/info/rfc3161/), August 2001, sections 2.1–2.2. Cited as historical protocol design, not an endorsement of legacy hash algorithms.
[^6]: Satoshi Nakamoto. [Bitcoin: A Peer-to-Peer Electronic Cash System](https://bitcoin.org/bitcoin.pdf), 2008, sections 1–2.
[^7]: Remco Bloemen, Leonid Logvinov and Jacob Evans. [EIP-712: Typed structured data hashing and signing](https://eips.ethereum.org/EIPS/eip-712), created September 12, 2017; motivation and security scope.
[^8]: UNCITRAL. [Model Law on Electronic Transferable Records](https://uncitral.un.org/en/texts/ecommerce/modellaw/electronic_transferable_records), adopted July 13, 2017; purpose and key provisions. No compliance or legal-status claim is made for this prototype.
[^9]: FINOS. [Common Domain Model](https://cdm.finos.org/), current project overview. Historical design reference: ISDA, [CDM Design Definition, October 2017](https://www.isda.org/a/N31EE/ISDA-CDM-Design-Definition-Oct-2017.pdf).
[^10]: Accord Project. [Smart Legal Contracts](https://docs.accordproject.org/docs/accordproject-slc/), current documentation and fixed-rate loan example.
[^11]: AP2 project. [Agentic Payment Protocol specification v0.2](https://ap2-protocol.org/ap2/specification/), sections on mandates, direct mode and dispute evidence.
[^12]: AP2 project. [Security and Privacy Considerations](https://ap2-protocol.org/ap2/security_and_privacy_considerations/), current threat model and binding requirements.
[^13]: BIS Innovation Hub. [Project Mandala proof-of-concept announcement](https://www.bis.org/media-releases/20241028-bis-and-central-bank-partners-demonstrate-policy-compliance-can-be-embedded-cross-border), October 28, 2024. This is an experimental-system comparison.
[^14]: Swift. [Corporates: frequently asked questions](https://www.swift.com/corporates/faqs), Tracking for Corporates and GPI sections.
[^15]: XRPL documentation. [Lending Protocol](https://xrpl.org/docs/concepts/tokens/lending-protocol), current overview; off-chain underwriting. Also compared with the project-local pinned XLS-66 reference in `docs/PROTOCOL_NOTES.md`.
[^16]: XRPL documentation. [LoanSet](https://xrpl.org/docs/references/protocol/transactions/types/loanset), current transaction and CounterpartySignature documentation; the live page was retrieved over HTTPS when the web reader could not handle its Markdown content type.
[^17]: Event organizers. *XRPL Lending Protocol Hackathon Challenge*, supplied PDF, complete 10-page local text extraction; pages 3, 5–8. *XRPL Lending Protocol Hackathon*, saved September 12 Notion brief, `reference/EVENT_BRIEF_2026-09-12.txt`. These are local event references; no fresh Notion revision is claimed. See `docs/SOURCES.md` for provenance.
