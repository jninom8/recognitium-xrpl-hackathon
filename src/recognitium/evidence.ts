import { decode, encode, hashes, type LoanSet, type Transaction } from 'xrpl';
import { encodeForSigning, encodeForSigningCounterparty } from 'ripple-binary-codec';
import { deriveAddress, verify } from 'ripple-keypairs';
import { canonical, digest, documentCommitment } from '../requests/commitment.js';
import type { PrivateRequest } from '../requests/service.js';
import { type Agreement, type ReceiptEvidence } from '../shared/contract.js';
import { checkReceiptContent, object, parseWire } from './client.js';
import { assertPrepared } from '../xrpl/transactions.js';
import { balanceDelta, createdId, type ValidatedTransaction } from '../xrpl/adapter.js';

export interface Bundle {
  schema: 'recognitium.evidence.v1';
  synthetic: true;
  agreementBytes: string;
  agreementHash: string;
  preparedTransaction: Record<string, unknown>;
  transactionDigest: string;
  document: { base64: string; salt: string };
  agreementReceipt: ReceiptEvidence;
  executionBytes: string;
  executionReceipt: ReceiptEvidence;
  transaction: ValidatedTransaction;
  signedTransaction: Record<string, unknown>;
  nativeCycle?: {
    depositDrops: string;
    realisedYieldDrops: string;
    transactions: Record<string, ValidatedTransaction>;
    refusal: { resultCode: string; hash: string; vaultBefore: unknown; vaultAfter: unknown };
  };
  disclaimer: string;
}

/** CTID is an optional RPC locator, not a signed field. Check its contents when
 * supplied, then compare every other payload field and all ledger metadata.
 * Never rewrite the saved bundle: its original bytes are receipt-bound. */
export function assertFreshTransaction(saved: ValidatedTransaction, fresh: ValidatedTransaction | undefined, networkId: number): void {
  if (!fresh || fresh.hash !== saved.hash || fresh.ledgerIndex !== saved.ledgerIndex || fresh.resultCode !== saved.resultCode) {
    throw new Error(`Fresh XRPL identity/result mismatch or unavailable: ${saved.hash}`);
  }
  const payload = (result: ValidatedTransaction) => {
    const { ctid, ...tx } = result.tx;
    if (ctid !== undefined) {
      const index = result.meta.TransactionIndex;
      if (!Number.isSafeInteger(result.ledgerIndex) || result.ledgerIndex < 0 || result.ledgerIndex > 0x0fffffff ||
          typeof index !== 'number' || !Number.isInteger(index) || index < 0 || index > 0xffff ||
          !Number.isInteger(networkId) || networkId < 0 || networkId > 0xffff) throw new Error('CTID bounds unsupported');
      const expected = 'C' + result.ledgerIndex.toString(16).padStart(7, '0') + index.toString(16).padStart(4, '0') + networkId.toString(16).padStart(4, '0');
      if (ctid !== expected.toUpperCase()) throw new Error('CTID does not match validated ledger position/network');
    }
    return tx;
  };
  if (canonical(payload(saved)) !== canonical(payload(fresh)) || canonical(saved.meta) !== canonical(fresh.meta)) {
    throw new Error(`Fresh XRPL payload/metadata mismatch: ${saved.hash}`);
  }
}

export function exportBundle(r: PrivateRequest): Bundle {
  if (!r.agreement.synthetic || r.phase !== 'FUNDED_WITH_EVIDENCE' || !r.agreementReceipt || !r.executionReceipt || !r.executionManifest || !r.validated || !r.signed) throw new Error('Complete synthetic evidence required for public export');
  const bundle: Bundle = { schema:'recognitium.evidence.v1',synthetic:true,
    agreementBytes:canonical(r.agreement),agreementHash:r.agreementHash,
    preparedTransaction:r.preparedTransaction,transactionDigest:r.transactionDigest,
    document:{base64:r.documentBase64,salt:r.documentSalt},agreementReceipt:r.agreementReceipt,
    executionBytes:canonical(r.executionManifest),executionReceipt:r.executionReceipt,
    transaction:r.validated,signedTransaction:decode(r.signed.tx_blob) as unknown as Record<string,unknown>,
    disclaimer:'Synthetic demonstration. Offline checks establish content and signature consistency; fresh authority and XRPL status require independent online lookups. No executable signed blob, seeds, or service credentials are exported.' };
  verifyOffline(bundle);
  return bundle;
}
export function verifyOffline(bundle: Bundle) {
  if (bundle.schema !== 'recognitium.evidence.v1' || bundle.synthetic !== true) throw new Error('Unsupported bundle');
  const agreement = JSON.parse(bundle.agreementBytes) as Agreement;
  if (canonical(agreement) !== bundle.agreementBytes || digest(agreement) !== bundle.agreementHash) throw new Error('Agreement bytes mismatch');
  if (documentCommitment(Buffer.from(bundle.document.base64,'base64'),bundle.document.salt).hash !== agreement.documentCommitment) throw new Error('Changed document');
  if (digest(bundle.preparedTransaction) !== bundle.transactionDigest) throw new Error('Prepared transaction changed');
  assertPrepared(agreement,bundle.preparedTransaction as unknown as LoanSet);
  const tx = bundle.signedTransaction as unknown as LoanSet;
  for (const [key,value] of Object.entries(bundle.preparedTransaction)) if (canonical(bundle.signedTransaction[key]) !== canonical(value)) throw new Error('Signed transaction differs from approval');
  if (!tx.SigningPubKey || !tx.TxnSignature || !tx.CounterpartySignature?.SigningPubKey || !tx.CounterpartySignature.TxnSignature) throw new Error('Missing signatures');
  if (deriveAddress(tx.SigningPubKey) !== agreement.accounts.broker || deriveAddress(tx.CounterpartySignature.SigningPubKey) !== agreement.accounts.borrower) throw new Error('Wrong signing identities');
  if (!verify(encodeForSigning(tx),tx.TxnSignature,tx.SigningPubKey) || !verify(encodeForSigningCounterparty(tx),tx.CounterpartySignature.TxnSignature,tx.CounterpartySignature.SigningPubKey)) throw new Error('Signature mismatch');
  if (hashes.hashSignedTx(encode(tx)) !== bundle.transaction.hash) throw new Error('Transaction hash mismatch');
  for (const [key,value] of Object.entries(bundle.signedTransaction)) if (canonical(bundle.transaction.tx[key]) !== canonical(value)) throw new Error('Saved validated payload mismatch');
  const execution = JSON.parse(bundle.executionBytes) as Record<string,unknown>;
  if (canonical(execution) !== bundle.executionBytes || execution.agreementHash !== bundle.agreementHash || execution.transactionHash !== bundle.transaction.hash || execution.ledgerIndex !== bundle.transaction.ledgerIndex || execution.resultCode !== 'tesSUCCESS' || bundle.transaction.resultCode !== 'tesSUCCESS') throw new Error('Execution link mismatch');
  if (digest(execution.network) !== digest(agreement.network) || execution.validatedEvidenceHash !== digest({tx:bundle.transaction.tx,meta:bundle.transaction.meta})) throw new Error('Execution evidence mismatch');
  if (execution.loanId !== createdId(bundle.transaction,'Loan') || execution.borrowerFundingDrops !== balanceDelta(bundle.transaction,agreement.accounts.borrower).toString()) throw new Error('Funding evidence mismatch');
  for (const [evidence,hash] of [[bundle.agreementReceipt,bundle.agreementHash],[bundle.executionReceipt,digest(execution)]] as const) {
    const wire = parseWire(evidence.receiptWire); const receipt = object(wire.receipt ?? wire);
    if (evidence.commitmentHash !== hash || evidence.receiptId !== receipt.receipt_id) throw new Error('Receipt binding mismatch');
    checkReceiptContent(receipt,hash);
  }
  if (bundle.nativeCycle) {
    const cycle = bundle.nativeCycle;
    const repaymentName = cycle.transactions['repay-late'] ? 'repay-late' : 'repay';
    if (repaymentName === 'repay-late' && cycle.transactions.repay?.resultCode !== 'tecEXPIRED') throw new Error('Late retry requires original validated refusal');
    const required = ['vault','deposit','broker','cover','native-refusal',repaymentName,'withdraw'];
    for (const name of required) {
      const result=cycle.transactions[name]; if(!result) throw new Error(`Missing native cycle step: ${name}`);
      // tx_json from API v2 is the signed transaction, metadata is separate.
      if(hashes.hashSignedTx(encode(result.tx as unknown as Transaction)) !== result.hash) throw new Error('Cycle transaction hash mismatch');
      if(name !== 'native-refusal' && result.resultCode !== 'tesSUCCESS') throw new Error(`Native step not successful: ${name}`);
    }
    const deposit=cycle.transactions.deposit!,withdraw=cycle.transactions.withdraw!,repay=cycle.transactions[repaymentName]!;
    if(deposit.tx.Account !== agreement.accounts.lender || deposit.tx.VaultID !== agreement.vaultId || deposit.tx.Amount !== cycle.depositDrops || withdraw.tx.Account !== agreement.accounts.lender || withdraw.tx.VaultID !== agreement.vaultId || repay.tx.LoanID !== execution.loanId || repay.tx.Account !== agreement.accounts.borrower) throw new Error('Native cycle belongs to different accounts or objects');
    if(repay.ledgerIndex < bundle.transaction.ledgerIndex || withdraw.ledgerIndex < repay.ledgerIndex) throw new Error('Invalid native cycle ordering');
    const proceeds=balanceDelta(withdraw,agreement.accounts.lender)+BigInt(String(withdraw.tx.Fee));
    const realised=proceeds-BigInt(cycle.depositDrops);
    if(realised <= 0n || realised.toString() !== cycle.realisedYieldDrops) throw new Error('Realised yield does not reconcile');
    const refusal=cycle.transactions['native-refusal']!;
    if(!refusal.resultCode.startsWith('tec') || refusal.hash !== cycle.refusal.hash || refusal.resultCode !== cycle.refusal.resultCode || canonical(cycle.refusal.vaultBefore) !== canonical(cycle.refusal.vaultAfter)) throw new Error('Native refusal evidence mismatch');
  }
  return {contentHash:'consistent',signatures:'both-valid',receiptChainHash:'consistent',receiptAuthority:'requires-online-lookup',xrplValidation:'requires-online-lookup'} as const;
}
