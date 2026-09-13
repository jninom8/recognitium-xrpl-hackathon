import { decode, type LoanSet, type Wallet } from 'xrpl';
import { CONTRACT_VERSION, type Agreement, type Approval, type ReceiptEvidence, type RequestView, type Role } from '../shared/contract.js';
import { assertAgreement, canonical, digest, documentCommitment } from './commitment.js';
import { Store } from './store.js';
import { assertPrepared, assertSigned, cosign, loanTransaction } from '../xrpl/transactions.js';
import { balanceDelta, createdId, type LedgerPort, type ValidatedTransaction } from '../xrpl/adapter.js';

export interface ReceiptPort {
  seal(hash: string): Promise<ReceiptEvidence>;
  verify(evidence: ReceiptEvidence, hash: string): Promise<void>;
}
export interface PrivateRequest extends RequestView {
  documentSalt: string;
  documentBase64: string;
  signed?: { hash: string; tx_blob: string };
  validated?: ValidatedTransaction;
  executionManifest?: Record<string, unknown>;
  receiptAttempt?: 'agreement' | 'execution';
}
export class LendingService {
  constructor(readonly store: Store<PrivateRequest>, readonly ledger: LedgerPort, readonly receipts: ReceiptPort) {}
  private async get(id: string): Promise<PrivateRequest> {
    const r = await this.store.read(id); if (!r) throw new Error('Unknown request'); return r;
  }
  async create(agreement: Agreement, document: Uint8Array, salt: string, prepare: (tx: LoanSet) => Promise<LoanSet>): Promise<RequestView> {
    assertAgreement(agreement);
    if (await this.store.read(agreement.requestId)) throw new Error('Request already exists; use a new request ID for a revision');
    if (documentCommitment(document, salt).hash !== agreement.documentCommitment) throw new Error('Document commitment mismatch');
    const agreementHash = digest(agreement);
    const tx = await prepare(loanTransaction(agreement, agreementHash));
    assertPrepared(agreement, tx);
    const r: PrivateRequest = {
      contractVersion: CONTRACT_VERSION, mode: 'live', phase: 'AGREEMENT_LOCKED', agreement: structuredClone(agreement),
      agreementHash, preparedTransaction: tx as unknown as Record<string, unknown>, transactionDigest: digest(tx),
      approvals: [], checks: { contentHash: 'consistent', receiptAuthority: 'unchecked', xrplValidation: 'unchecked' },
      documentSalt: salt, documentBase64: Buffer.from(document).toString('base64'),
    };
    await this.store.write(agreement.requestId, r); return this.view(r);
  }
  private assertContent(r: PrivateRequest, requireUnexpired = true): void {
    if (requireUnexpired) assertAgreement(r.agreement);
    if (digest(r.agreement) !== r.agreementHash || digest(r.preparedTransaction) !== r.transactionDigest) throw new Error('Changed agreement or transaction');
    if (documentCommitment(Buffer.from(r.documentBase64, 'base64'), r.documentSalt).hash !== r.agreement.documentCommitment) throw new Error('Changed document');
    assertPrepared(r.agreement, r.preparedTransaction as unknown as LoanSet);
    if(r.signed) {
      assertSigned(r.preparedTransaction as unknown as LoanSet,r.signed);
      if(r.transaction?.hash !== r.signed.hash || r.transaction.lastLedgerSequence !== r.preparedTransaction.LastLedgerSequence) throw new Error('Stored transaction bounds mismatch');
    }
  }
  async approve(id: string, role: Role, agreementHash: string, transactionDigest: string): Promise<RequestView> {
    const r = await this.get(id); this.assertContent(r);
    if (!['AGREEMENT_LOCKED', 'AGREEMENT_RECEIPTED'].includes(r.phase)) throw new Error('Approval phase closed');
    if (role !== 'broker' && role !== 'borrower') throw new Error('Unknown role');
    if (agreementHash !== r.agreementHash || transactionDigest !== r.transactionDigest) throw new Error('Approval does not match exact request');
    const approval: Approval = { role, agreementHash, transactionDigest, approvedAt: new Date().toISOString() };
    r.approvals = [...r.approvals.filter(a => a.role !== role), approval];
    await this.store.write(id, r); return this.view(r);
  }
  private assertApprovals(r: PrivateRequest): void {
    for (const role of ['broker', 'borrower']) if (!r.approvals.some(a => a.role === role && a.agreementHash === r.agreementHash && a.transactionDigest === r.transactionDigest)) throw new Error('Both humans must approve exact terms and prepared transaction');
  }
  async receiptAgreement(id: string): Promise<RequestView> {
    const r = await this.get(id); this.assertContent(r); this.assertApprovals(r);
    if (r.agreementReceipt) {
      await this.receipts.verify(r.agreementReceipt, r.agreementHash);
      // Rechecking an earlier receipt must not rewind signing/funding or clear
      // an unresolved execution-receipt issuance (which could charge twice).
      if (r.receiptAttempt === 'agreement') delete r.receiptAttempt;
      if (r.phase === 'AGREEMENT_LOCKED') r.phase = 'AGREEMENT_RECEIPTED';
      r.checks.receiptAuthority = 'online-verified';
      await this.store.write(id, r); return this.view(r);
    }
    if (r.receiptAttempt) throw new Error('Receipt issuance unresolved. Recover the receipt by ID; do not blindly charge again.');
    r.receiptAttempt = 'agreement'; await this.store.write(id, r);
    const evidence = await this.receipts.seal(r.agreementHash);
    // Store the returned receipt before an additional online check can fail.
    r.agreementReceipt = evidence; await this.store.write(id, r);
    await this.receipts.verify(evidence, r.agreementHash);
    delete r.receiptAttempt; r.phase = 'AGREEMENT_RECEIPTED'; r.checks.receiptAuthority = 'online-verified';
    await this.store.write(id, r); return this.view(r);
  }
  async sign(id: string, broker: Wallet, borrower: Wallet): Promise<RequestView> {
    const r = await this.get(id); this.assertContent(r); this.assertApprovals(r);
    if (r.signed) return this.view(r);
    await this.ledger.assertCanOriginate?.();
    if (!r.agreementReceipt) throw new Error('Verified agreement receipt required');
    await this.receipts.verify(r.agreementReceipt, r.agreementHash);
    const prepared = r.preparedTransaction as unknown as LoanSet;
    if (await this.ledger.ledgerIndex() > prepared.LastLedgerSequence!) throw new Error('Prepared transaction expired');
    const signed = cosign(prepared, broker, borrower);
    r.signed = { hash: signed.hash, tx_blob: signed.tx_blob };
    r.transaction = { hash: signed.hash, lastLedgerSequence: prepared.LastLedgerSequence! };
    r.phase = 'SIGNED'; await this.store.write(id, r); return this.view(r);
  }
  async advance(id: string): Promise<RequestView> {
    const r = await this.get(id); this.assertContent(r, !r.signed); this.assertApprovals(r);
    if (!r.signed || !r.transaction || !r.agreementReceipt) throw new Error('Signed receipted request required');
    if (r.validated) return this.view(r);
    // An authority outage cannot change an already-executed ledger result.
    // Reconcile first; still require fresh receipt verification before any send.
    const result = await this.ledger.lookup(r.signed.hash);
    if (result) {
      // Compare every prepared field with validated signed payload, not just Data.
      for (const [key, value] of Object.entries(r.preparedTransaction)) if (canonical(result.tx[key]) !== canonical(value)) throw new Error(`Validated transaction mismatch: ${key}`);
      const decoded = decode(r.signed.tx_blob) as unknown as Record<string, unknown>;
      for (const key of ['SigningPubKey', 'TxnSignature', 'CounterpartySignature']) if (canonical(result.tx[key]) !== canonical(decoded[key])) throw new Error('Validated signatures differ');
      r.validated = result;
      r.transaction.ledgerIndex = result.ledgerIndex; r.transaction.resultCode = result.resultCode;
      if (result.resultCode !== 'tesSUCCESS') { r.phase = 'REJECTED'; r.checks.xrplValidation = 'validated-refusal'; }
      else {
        r.loanId = createdId(result, 'Loan');
        const funded = balanceDelta(result, r.agreement.accounts.borrower);
        if (funded !== BigInt(r.agreement.terms.principalDrops) - BigInt(r.agreement.terms.originationFeeDrops)) throw new Error('Borrower funding does not reconcile');
        r.phase = 'VALIDATED_RECEIPT_PENDING'; r.checks.xrplValidation = 'validated-success';
        r.executionManifest = { schema: 'recognitium.execution.v1', agreementHash: r.agreementHash,
          transactionHash: result.hash, ledgerIndex: result.ledgerIndex, network: r.agreement.network,
          loanId: r.loanId, borrowerFundingDrops: funded.toString(), resultCode: result.resultCode,
          validatedEvidenceHash: digest({ tx: result.tx, meta: result.meta }) };
      }
    } else if (await this.ledger.ledgerIndex() > r.transaction.lastLedgerSequence) {
      r.phase = 'EXPIRED_UNRESOLVED'; r.checks.xrplValidation = 'unknown';
    } else {
      // Expiry prevents a first submission after consent expires. Already-submitted blobs
      // may validate regardless, so always perform lookup above, including after expiry.
      if (r.phase === 'SIGNED' && Date.parse(r.agreement.expiresAt) <= Date.now()) throw new Error('Consent expired before submission');
      await this.receipts.verify(r.agreementReceipt, r.agreementHash);
      r.phase = 'SUBMITTED'; await this.store.write(id, r);
      await this.ledger.assertCanOriginate?.();
      try { await this.ledger.submit(r.signed.tx_blob); } catch { /* uncertainty remains */ }
      r.phase = 'VALIDATION_UNKNOWN'; r.checks.xrplValidation = 'unknown';
    }
    await this.store.write(id, r); return this.view(r);
  }
  async prepareExternalReceipt(id: string, stage: 'agreement'|'execution') {
    const r=await this.get(id);this.assertContent(r,stage==='agreement');
    if(stage==='agreement'){this.assertApprovals(r);if(r.signed||r.agreementReceipt)throw Error('Agreement receipt already resolved or signed');}
    else if(!r.validated || r.validated.resultCode!=='tesSUCCESS' || !r.executionManifest || r.executionReceipt)throw Error('Unreceipted validated execution required');
    if(r.receiptAttempt)throw Error('Receipt issuance already prepared. Recover its result; do not issue again.');
    r.receiptAttempt=stage;await this.store.write(id,r);
    return {requestId:id,stage,hash:stage==='agreement'?r.agreementHash:digest(r.executionManifest),tickCost:1,recovery:'Record the returned receipt ID, then attach through recover. Never repeat issuance after a lost response.'};
  }
  async receiptExecution(id: string): Promise<RequestView> {
    const r = await this.get(id); this.assertContent(r, false);
    if (!r.validated || r.validated.resultCode !== 'tesSUCCESS' || !r.executionManifest) throw new Error('Validated funding required');
    const hash = digest(r.executionManifest);
    if (r.executionReceipt) { await this.receipts.verify(r.executionReceipt, hash); r.phase = 'FUNDED_WITH_EVIDENCE'; delete r.receiptAttempt; await this.store.write(id, r); return this.view(r); }
    if (r.receiptAttempt) throw new Error('Receipt issuance unresolved. Recover by receipt ID.');
    r.receiptAttempt = 'execution'; await this.store.write(id, r);
    r.executionReceipt = await this.receipts.seal(hash); await this.store.write(id, r);
    await this.receipts.verify(r.executionReceipt, hash);
    delete r.receiptAttempt; r.phase = 'FUNDED_WITH_EVIDENCE';
    await this.store.write(id, r); return this.view(r);
  }
  async attachRecoveredReceipt(id: string, stage: 'agreement' | 'execution', evidence: ReceiptEvidence): Promise<RequestView> {
    const r = await this.get(id); this.assertContent(r, stage === 'agreement');
    if (stage === 'execution' && !r.executionManifest) throw new Error('No execution to receipt');
    await this.receipts.verify(evidence, stage === 'agreement' ? r.agreementHash : digest(r.executionManifest));
    if (stage === 'agreement') {
      if (r.signed) throw new Error('Cannot replace agreement receipt after signing');
      r.agreementReceipt = evidence; r.phase = 'AGREEMENT_RECEIPTED'; r.checks.receiptAuthority = 'online-verified';
    }
    else { r.executionReceipt = evidence; r.phase = 'FUNDED_WITH_EVIDENCE'; }
    delete r.receiptAttempt; await this.store.write(id, r); return this.view(r);
  }
  view(r: PrivateRequest): RequestView {
    const { documentSalt: _salt, documentBase64: _document, signed: _signed, validated: _validated, executionManifest: _execution, receiptAttempt: _attempt, ...view } = r;
    return structuredClone(view);
  }
}
