import type { Cycle } from './cycle.js';
import { rippleTimeToUnixTime } from 'xrpl';

/** One durable step per tick. Caller owns the existing process lock.
 * Never creates approvals, changes terms, or replaces an uncertain transaction.
 */
export async function advanceAutomaticRound(cycle: Cycle): Promise<string> {
  const native = await cycle.cycles.read('native');
  if (!native?.requestId) return 'WAITING_FOR_OFFER';
  const id = native.requestId;
  const r = await cycle.requests.read(id);
  if (!r) return 'WAITING_FOR_OFFER';
  if (!['broker', 'borrower'].every(role => r.approvals.some(a =>
    a.role === role && a.agreementHash === r.agreementHash && a.transactionDigest === r.transactionDigest))) return 'WAITING_FOR_APPROVALS';
  if (['REJECTED', 'EXPIRED_UNRESOLVED'].includes(r.phase)) return r.phase;
  // Funding facts must remain recoverable even after agreement expiry.
  if (!r.signed) {
    if (!r.agreementReceipt || r.receiptAttempt === 'agreement') {
      await cycle.service.receiptAgreement(id); return 'AGREEMENT_RECEIPTED';
    }
    await cycle.service.sign(id, await cycle.wallet('broker'), await cycle.wallet('borrower'));
    return 'SIGNED';
  }
  if (!r.validated) { await cycle.service.advance(id); return 'CHECKING_FUNDING'; }
  if (r.validated.resultCode !== 'tesSUCCESS') return 'REJECTED';
  if (!r.executionReceipt || r.receiptAttempt === 'execution') {
    await cycle.service.receiptExecution(id); return 'EXECUTION_RECEIPTED';
  }
  if (native.yield) return BigInt(native.yield.realisedYieldDrops) > 0n ? 'COMPLETE' : 'YIELD_CHECK_FAILED';
  if (!native.refusal) { await cycle.refusal(); return 'NATIVE_REFUSAL_RECORDED'; }
  if (native.refusal.resultCode === 'tesSUCCESS') throw Error('Expected refusal succeeded; inspect ledger evidence');
  const repaid = native.steps.repay?.resultCode === 'tesSUCCESS' || native.steps['repay-late']?.resultCode === 'tesSUCCESS';
  if (!repaid) {
    if (!r.loanId) throw Error('Validated loan ID missing');
    const loan = (await cycle.adapter.object(r.loanId)).node;
    if (loan.LedgerEntryType !== 'Loan') throw Error('Validated loan object missing');
    if (typeof loan.NextPaymentDueDate !== 'number' || !Number.isSafeInteger(loan.NextPaymentDueDate)) throw Error('Validated repayment schedule missing');
    if (Date.now() < rippleTimeToUnixTime(loan.NextPaymentDueDate)) return 'WAITING_FOR_REPAYMENT_DATE';
    await cycle.repay(); return 'REPAYMENT_SUBMITTED';
  }
  await cycle.withdraw(); return 'COMPLETE';
}
