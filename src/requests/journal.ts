import type { Transaction, Wallet } from 'xrpl';
import { digest } from './commitment.js';
import { Store } from './store.js';
import { type LedgerPort, type ValidatedTransaction } from '../xrpl/adapter.js';

export interface Operation {
  id: string;
  intentDigest: string;
  tx: Transaction;
  signed: { hash: string; tx_blob: string };
  lastLedgerSequence: number;
  status: 'SIGNED' | 'SUBMITTED' | 'VALIDATION_UNKNOWN' | 'VALIDATED' | 'EXPIRED_UNRESOLVED';
  result?: ValidatedTransaction;
}
/** Reuse the identical signed blob across retry/restart. Never re-autofill an existing ID. */
export class Journal {
  constructor(readonly store: Store<Operation>, readonly ledger: LedgerPort) {}
  async register(id: string, intent: Transaction, prepare: () => Promise<Transaction>, wallet: Wallet): Promise<Operation> {
    const prior = await this.store.read(id);
    if (prior) {
      if (prior.intentDigest !== digest(intent)) throw new Error('Operation ID already bound to another intent');
      return prior;
    }
    const tx = await prepare();
    if (!tx.LastLedgerSequence) throw new Error('Transaction missing expiry bound');
    const signed = wallet.sign(tx);
    const operation: Operation = { id, intentDigest: digest(intent), tx, signed, lastLedgerSequence: tx.LastLedgerSequence, status: 'SIGNED' };
    await this.store.write(id, operation);
    return operation;
  }
  async advance(id: string): Promise<Operation> {
    const op = await this.store.read(id);
    if (!op) throw new Error('Unknown operation');
    if (op.result) return op;
    try {
      const result = await this.ledger.lookup(op.signed.hash);
      if (result) {
        op.result = result; op.status = 'VALIDATED';
      } else if (await this.ledger.ledgerIndex() > op.lastLedgerSequence) {
        // A tx-not-found from a server without full history is insufficient to permit replacement.
        op.status = 'EXPIRED_UNRESOLVED';
      } else {
        op.status = 'SUBMITTED'; await this.store.write(id, op);
        await this.ledger.submit(op.signed.tx_blob);
        op.status = 'VALIDATION_UNKNOWN';
      }
    } catch { op.status = 'VALIDATION_UNKNOWN'; }
    await this.store.write(id, op);
    return op;
  }
}
