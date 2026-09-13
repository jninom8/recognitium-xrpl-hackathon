# Recognitium pitch rehearsal

Seven slides. Five minutes including a 90-second evidence walkthrough.

## 1. Opening / 0:00–0:25

A supplier needs working capital. A lender can provide it. XRPL already gives us the native lending machinery. Recognitium connects the agreement the people approved to the transaction the ledger confirms.

This hackathon integration uses a pre-existing classical Recognitium service and AI-assisted development. No QCP hardware claim. Source: https://github.com/jninom8/recognitium-xrpl-hackathon/blob/main/docs/RECOGNITIUM_INTEGRATION.md

## 2. Use case / 0:25–0:55

The interface has three perspectives: Lender, Borrower and Admin. A lender declares availability, a borrower states a need, and the application proposes a match. Both demo roles approve that exact match before the administrator reviews it. The subsequent loan offer needs separate borrower and broker approval. An observed wallet balance does not reserve funds.

The match flow has a real Recognitium receipt. The fresh matched native cycle remains pending. The existing completed native loans predate that matching extension. Sources: https://github.com/jninom8/recognitium-xrpl-hackathon/blob/main/evidence/matching-131184ce.json and https://github.com/jninom8/recognitium-xrpl-hackathon/blob/main/docs/BACKEND_REVIEW.md

## 3. Architecture / 0:55–1:35

The separate receipt history has a different job from the XRP Ledger. Documents and negotiation records remain outside the public ledger. Recognitium records commitments in its authority history. Our broker verifies an agreement receipt and both people approve the exact terms before the demo wallets co-sign LoanSet. The LoanSet Data field carries the agreement fingerprint.

XRPL does not read the Recognitium receipt. Its validators enforce signatures and protocol rules. An execution receipt later links the agreement to the validated transfer. The separate history is a classical evidence service, not another decentralized XRPL consensus network. Every transition can have an evidence record, but this build has not sealed every transition.

IVM discovery and receipt issuance are operator-assisted; browser AI drafts requests. The diagram shows the integration boundary, not autonomous AI execution. Sources: https://github.com/jninom8/recognitium-xrpl-hackathon/blob/main/src/xrpl/transactions.ts , https://github.com/jninom8/recognitium-xrpl-hackathon/blob/main/src/requests/service.ts , https://github.com/jninom8/recognitium-xrpl-hackathon/blob/main/docs/RECOGNITIUM_INTEGRATION.md

## 4. Demo / 1:35–3:05

Open https://recognitium-xrpl-hackathon.vercel.app/borrow?mode=live&request=request-1708833c-9d9e-4a49-9fe2-6b9284842ecc

Say: This is a completed development-network run, not a new transfer happening as I click. Show Transactions & evidence: vault 90024, deposit 90026, broker 90028, cover 90030, funding 90068, repayment 90086 and withdrawal 90092. Then show the native refusal and the agreement and execution receipts. The lender deposited 200 XRP, withdrew 200.000020 XRP and paid a 12-drop withdrawal fee. Twenty drops is gross yield, not net profit after all setup and network fees.

For the off-chain match receipt, open Receipts and round 131184CE. That match expired before native execution. Identity preview is synthetic and unsealed. The current V1-only application policy blocks new loans on the advertised V1.1 endpoint; do not promise a fresh live loan during this walkthrough.

Funding hash: CABC51612A0478F935D0C82DF3102124FC2DDC7E7CAACD665BCF37FD836F08FD
Agreement receipt: DG-e2d41354140a451c855050f148b55da1
Execution receipt: DG-67bd66978e854f4e8d79d21862723ee4
Sources: https://github.com/jninom8/recognitium-xrpl-hackathon/blob/main/evidence/ai-request-1708833c.json and https://github.com/jninom8/recognitium-xrpl-hackathon/blob/main/docs/STATUS.md

## 5. Why AI-friendly / 3:05–3:35

An agent can prepare structured terms, compare the request with availability and carry the commitment between tools. Local hashing detects changed bytes without sending the private document to XRPL. We preserve the human approval boundary because a loan signature creates an obligation.

The benefit is separation of responsibilities: the public ledger does not need every negotiation message or identity file. This does not increase XRPL throughput, eliminate verification latency or make receipts prove identity truth. We have not measured a milliseconds-per-receipt performance claim. Verification of Recognitium authority still requires its online record in this build.

New native preparation includes a synthetic request-wallet identity commitment. It is not real KYC and no completed native run yet contains this addition. Sources: https://github.com/jninom8/recognitium-xrpl-hackathon/blob/main/src/shared/identity-fixture.ts , https://github.com/jninom8/recognitium-xrpl-hackathon/blob/main/src/server/assistant.ts , https://github.com/jninom8/recognitium-xrpl-hackathon/blob/main/docs/RECOGNITIUM_INTEGRATION.md

## 6. Developer journey / 3:35–4:30

Our limited tests did not identify a break in XRPL cryptography. We did not conduct an independent cryptographic or security audit. We do not claim that quantum computing is the only remaining risk, or that key protection alone makes an application secure. The observed friction concerns integration, coordination and state recovery.

First, the event endpoint ports repeatedly timed out while ordinary HTTPS worked. A phone hotspot restored access. That isolates a network-path difference, not a proven diagnosis of congestion or firewall policy. Proposal: provide an HTTP/WebSocket connectivity probe and known-good expected response before faucet setup.

Second, the advertised Track 1 endpoint reported LendingProtocolV1_1 enabled, while the closed-ended guide restricts new lending. Earlier mentor-guided open-ended cycles succeeded. We preserve those observations and now gate new origination under the founder's V1-only rule. Proposal: publish a versioned endpoint, enabled amendment list and compatible SDK matrix with the event track.

Third, our Vercel build succeeded but API startup failed with ERR_REQUIRE_ESM involving @xrplf/isomorphic and @noble/hashes. We removed unnecessary XRPL SDK imports from hosted receipt/address code and added a startup regression check. This was our integration failure, not a protocol bug. Proposal: include a serverless smoke test and minimal SDK-free hashing example.

Project hook delivery includes historical automatic events and explicitly submitted reflections. Automatic capture in this projectless task is unconfirmed. The participant-written manual report is a separate mandatory deliverable; these slides do not replace it. Sources: https://github.com/jninom8/recognitium-xrpl-hackathon/blob/main/DEVEX_LOG.md , https://github.com/jninom8/recognitium-xrpl-hackathon/blob/main/docs/DEVELOPER_JOURNEY.md , https://github.com/jninom8/recognitium-xrpl-hackathon/blob/main/evidence/environment-2026-09-13.json

## 7. Closing / 4:30–5:00

We want every XLS-65/66 builder to be able to connect a private commitment to a native loan without rebuilding the evidence and recovery layer. Our public repository contains the adapter and repeatable verification examples. This is our proposed missing developer tool, not a claim that no other evidence system exists.

The next proof is a fresh availability-matched loan with exact approvals, funding, repayment and return, once the environment issue is resolved. The longer-term direction is an agent-friendly interface with authenticated approval and a sealed record for every meaningful agreement transition. Today those are boundaries and next steps, not completed features.

Sources: https://github.com/jninom8/recognitium-xrpl-hackathon/blob/main/src/requests/service.ts , https://github.com/jninom8/recognitium-xrpl-hackathon/blob/main/scripts/verify-bundle.ts , https://github.com/jninom8/recognitium-xrpl-hackathon/blob/main/docs/NATIVE_BRIDGE.md

Q&A reminders: the current Recognitium engine is classical; a receipt is not KYC; a hash is not ledger validation; no measured XRPL throughput improvement; no identity documents on chain; existing synthetic fixtures stay labelled; no claim every transition already has a receipt.