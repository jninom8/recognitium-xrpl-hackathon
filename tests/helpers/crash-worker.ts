/** Test-only process. The remote ledger and receipts are SIMULATED local files.
 * No adapter, network client, live wallet or receipt service is used here. */
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { decode } from 'xrpl';
import { LendingService, type PrivateRequest, type ReceiptPort } from '../../src/requests/service.js';
import { Store, processLock } from '../../src/requests/store.js';
import type { LedgerPort, ValidatedTransaction } from '../../src/xrpl/adapter.js';

export interface SimulatedRemote {
  simulated: true;
  submissions: number;
  result: ValidatedTransaction;
}

const [directory, requestId, mode] = process.argv.slice(2);
assert.ok(directory && requestId && ['after-accept', 'after-lookup', 'recover'].includes(mode!));

async function checkpoint() {
  process.send?.({ type: 'checkpoint', mode });
  // Stay alive until the parent terminates this exact child process.
  await new Promise<never>(() => { setInterval(() => {}, 1000); });
}

async function run() {
  const release = await processLock(directory);
  try {
    const requests = new Store<PrivateRequest>(join(directory!, 'requests'));
    const remote = new Store<SimulatedRemote>(join(directory!, 'simulated-remote'));
    const record = (await requests.read(requestId!))!;
    assert.equal(record.agreement.synthetic, true);
    assert.equal(record.agreement.network.serverBuild, 'FIXTURE-NOT-A-LIVE-SERVER');
    const receipts: ReceiptPort = {
      seal: async hash => ({ receiptId: 'SIMULATED-CRASH-TEST', commitmentHash: hash,
        receiptWire: '{}', verificationWire: '{}', authorityCheckedAt: new Date().toISOString() }),
      verify: async (evidence, hash) => { assert.equal(evidence.commitmentHash, hash); },
    };
    const ledger: LedgerPort = {
      ledgerIndex: async () => 110,
      lookup: async hash => {
        const stored = await remote.read('ledger');
        if (!stored) return undefined;
        assert.equal(hash, stored.result.hash);
        if (mode === 'after-lookup') await checkpoint();
        return stored.result;
      },
      submit: async blob => {
        assert.equal(blob, record.signed!.tx_blob);
        const previous = await remote.read('ledger');
        const result: ValidatedTransaction = {
          hash: record.signed!.hash, ledgerIndex: 110, resultCode: 'tesSUCCESS',
          raw: { simulated: true }, tx: decode(blob) as unknown as Record<string, unknown>,
          meta: { AffectedNodes: [
            { CreatedNode: { LedgerEntryType: 'Loan', LedgerIndex: 'C'.repeat(64) } },
            { ModifiedNode: { LedgerEntryType: 'AccountRoot', PreviousFields: { Balance: '200000000' },
              FinalFields: { Account: record.agreement.accounts.borrower, Balance: '300000000' } } },
          ] },
        };
        await remote.write('ledger', { simulated: true, submissions: (previous?.submissions ?? 0) + 1, result });
        if (mode === 'after-accept') await checkpoint();
      },
    };
    const service = new LendingService(requests, ledger, receipts);
    await service.advance(requestId!);
    await service.advance(requestId!);
    assert.equal(mode, 'recover', 'Crash checkpoints must be terminated by the parent');
    await service.receiptExecution(requestId!);
    const final = await service.advance(requestId!);
    process.send?.({ type: 'recovered', phase: final.phase });
  } finally { await release(); }
}

run().catch(() => {
  // Do not include private request fields in child diagnostics.
  process.send?.({ type: 'worker-error' });
  process.exitCode = 1;
}).finally(() => { process.disconnect?.(); });
