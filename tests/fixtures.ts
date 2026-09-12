/** Generated local test wallets and simulated ledger evidence. NEVER live results. */
import { Wallet, type LoanSet } from 'xrpl';
import { CONTRACT_VERSION, TRACK1, type Agreement } from '../src/shared/contract.js';
import { documentCommitment, digest } from '../src/requests/commitment.js';
import { loanTransaction } from '../src/xrpl/transactions.js';
export function fixture() {
  const broker = Wallet.generate(), borrower = Wallet.generate(), lender = Wallet.generate();
  const document = Buffer.from('SYNTHETIC TEST FIXTURE: supplier inventory financing; no real invoice.');
  const commitment = documentCommitment(document);
  const agreement: Agreement = {
    schema: CONTRACT_VERSION, requestId: 'synthetic-test-1', documentVersion: 1, documentCommitment: commitment.hash,
    synthetic: true, network: { track: TRACK1.track, websocket: TRACK1.websocket, networkId: 21337, serverBuild: 'FIXTURE-NOT-A-LIVE-SERVER' },
    accounts: { broker: broker.address, borrower: borrower.address, lender: lender.address },
    vaultId: 'A'.repeat(64), loanBrokerId: 'B'.repeat(64), asset: 'XRP',
    terms: { principalDrops: '100000000', interestRate: 10000, paymentTotal: 1, paymentInterval: 60,
      gracePeriod: 60, originationFeeDrops: '0', serviceFeeDrops: '0', latePaymentFeeDrops: '0', closePaymentFeeDrops: '0',
      overpaymentFee: 0, lateInterestRate: 0, closeInterestRate: 0, overpaymentInterestRate: 0, flags: 0 },
    expiresAt: new Date(Date.now() + 3600000).toISOString(), policyVersion: 'human-exact-approval.v1',
  };
  const prepare = async (tx: LoanSet): Promise<LoanSet> => ({ ...tx, Sequence: 1, Fee: '24', LastLedgerSequence: 200, NetworkID: 21337 });
  return { broker, borrower, lender, document, salt: commitment.salt, agreement, prepare,
    transaction: prepare(loanTransaction(agreement, digest(agreement))) };
}
