/** Isolated test-XRP experiment. Stable IDs resume the same signed operations.
 * No loan, agreement approval, receipt issuance or main-cycle vault mutation. */
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { type SubmittableTransaction, type Wallet } from 'xrpl';
import { Store, processLock } from '../src/requests/store.js';
import { Journal, type Operation } from '../src/requests/journal.js';
import { digest } from '../src/requests/commitment.js';
import { NativeAdapter, createdId, balanceDelta, type ValidatedTransaction } from '../src/xrpl/adapter.js';
import { Cycle } from '../src/xrpl/cycle.js';
import { native } from '../src/xrpl/transactions.js';
import type { NetworkIdentity } from '../src/shared/contract.js';

if (!process.argv.includes('--execute') || !process.argv.includes('--mentor-confirmed-open-ended')) {
  throw new Error('Requires --execute --mentor-confirmed-open-ended; uses existing event test wallets and up to 10 test XRP of vault principal');
}

const release = await processLock();
const adapter = new NativeAdapter(true);
adapter.client.on('error', () => {});
const journal = new Journal(new Store<Operation>('data/experiments/cap-001/operations'), adapter);
const manifest = new Store<{
  startedAt: string; network: NetworkIdentity; originalVaultId: string; originalVaultBefore: unknown;
}>('data/experiments/cap-001');
const results: Record<string, ValidatedTransaction> = {};

async function waitResult(id: string) {
  const end = Date.now() + 45000;
  while (Date.now() < end) {
    const operation = await journal.advance(id);
    if (operation.result) {
      results[id] = operation.result;
      console.log(JSON.stringify({ step: id, hash: operation.result.hash, ledger: operation.result.ledgerIndex, code: operation.result.resultCode }));
      return operation.result;
    }
    if (operation.status === 'EXPIRED_UNRESOLVED') throw new Error(`${id}: unresolved expiry; no replacement allowed`);
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  throw new Error(`${id}: unresolved; rerun this command to reconcile the same signed hash`);
}
async function register(id: string, tx: SubmittableTransaction, wallet: Wallet) {
  return journal.register(id, tx, () => adapter.prepare(tx), wallet);
}
async function execute(id: string, tx: SubmittableTransaction, wallet: Wallet, code = 'tesSUCCESS') {
  await register(id, tx, wallet);
  const result = await waitResult(id);
  assert.equal(result.resultCode, code, `${id}: actual result differs from hypothesis; inspect journal`);
  return result;
}

try {
  const network = await adapter.connect();
  assert.equal(network.networkId, 4001, 'Only the advertised event test network is permitted');
  const cycle = new Cycle(adapter);
  const original = await cycle.cycles.read('native');
  assert.ok(original?.vaultId && digest(original.network) === digest(network), 'Verified original cycle required');
  const broker = await cycle.wallet('broker'), lender = await cycle.wallet('lender'), borrower = await cycle.wallet('borrower');
  let start = await manifest.read('manifest');
  if (!start) {
    start = { startedAt: new Date().toISOString(), network, originalVaultId: original.vaultId,
      originalVaultBefore: (await adapter.object(original.vaultId)).node };
    await manifest.write('manifest', start);
  }
  assert.equal(digest(start.network), digest(network), 'Review changed network/build before resuming');
  const vaultResult = await execute('create', { ...native.vault(broker.address), AssetsMaximum: '10000000' } as SubmittableTransaction, broker);
  const vaultId = createdId(vaultResult, 'Vault');
  assert.notEqual(vaultId, original.vaultId);
  await execute('initial-deposit', native.deposit(lender.address, vaultId, '5000000'), lender);

  // Independent accounts avoid account Sequence contention. Register durably
  // before dispatching both deposits; canonical ledger order decides the winner.
  await register('competing-lender', native.deposit(lender.address, vaultId, '5000000'), lender);
  await register('competing-borrower', native.deposit(borrower.address, vaultId, '5000000'), borrower);
  const competition = await Promise.all([waitResult('competing-lender'), waitResult('competing-borrower')]);
  assert.deepEqual(competition.map(r => r.resultCode).sort(), ['tecLIMIT_EXCEEDED', 'tesSUCCESS']);
  const atCap = (await adapter.object(vaultId, Math.max(...competition.map(r => r.ledgerIndex)))).node;
  if (atCap.LedgerEntryType !== 'Vault') throw new Error('Expected cap experiment vault');
  assert.equal(atCap.AssetsTotal, '10000000');
  assert.equal(atCap.AssetsAvailable, '10000000');
  for (const result of competition) {
    const principal = -balanceDelta(result, String(result.tx.Account)) - BigInt(String(result.tx.Fee));
    assert.equal(principal, result.resultCode === 'tesSUCCESS' ? 5000000n : 0n);
  }
  const over = await execute('one-drop-over', native.deposit(lender.address, vaultId, '1'), lender, 'tecLIMIT_EXCEEDED');
  const afterOver = (await adapter.object(vaultId, over.ledgerIndex)).node;
  assert.equal(digest(afterOver), digest(atCap), 'Rejected deposit must not change vault');
  assert.equal(balanceDelta(over, lender.address) + BigInt(String(over.tx.Fee)), 0n);
  await execute('cap-below-assets', { TransactionType: 'VaultSet', Account: broker.address, VaultID: vaultId, AssetsMaximum: '9999999' }, broker, 'tecLIMIT_EXCEEDED');

  // Return the full contributed test principal, calculating each holder's amount
  // from validated deposits. No guessed account balance or receipt is involved.
  for (const [role, wallet] of [['lender', lender], ['borrower', borrower]] as const) {
    const successful = [results['initial-deposit']!, ...competition].filter(r => r.resultCode === 'tesSUCCESS' && r.tx.Account === wallet.address);
    const deposited = successful.reduce((sum, r) => sum + BigInt(String(r.tx.Amount)), 0n);
    if (deposited === 0n) continue;
    const withdrawal = await execute(`return-${role}`, native.withdraw(wallet.address, vaultId, deposited.toString()), wallet);
    assert.equal(balanceDelta(withdrawal, wallet.address) + BigInt(String(withdrawal.tx.Fee)), deposited);
  }
  const finalVault = (await adapter.object(vaultId)).node;
  if (finalVault.LedgerEntryType !== 'Vault') throw new Error('Expected cap experiment vault');
  // rippled omits these default-zero fields on the empty vault. Independently
  // reconcile the vault pseudo-account's XRP balance as well.
  assert.equal(finalVault.AssetsAvailable ?? '0', '0');
  assert.equal(finalVault.AssetsTotal ?? '0', '0');
  const settledVaultAccountBalanceDrops = (await adapter.account(finalVault.Account)).account_data.Balance;
  assert.equal(settledVaultAccountBalanceDrops, '0');
  const originalVaultAfter = (await adapter.object(original.vaultId)).node;
  assert.equal(digest(originalVaultAfter), digest(start.originalVaultBefore), 'Baseline vault changed');
  const evidence = { schema: 'recognitium.native-cap-experiment.v1', synthetic: true, mode: 'live',
    startedAt: start.startedAt, completedAt: new Date().toISOString(), network,
    vaultId, capDrops: '10000000', competition: competition.map(r => ({ hash: r.hash, code: r.resultCode, ledger: r.ledgerIndex })),
    atCap, afterOver, finalVault, settledVaultAccountBalanceDrops, originalVaultId: original.vaultId,
    originalVaultUnchanged: true, originalVaultBefore: start.originalVaultBefore, originalVaultAfter,
    transactions: results, principalReturnedDrops: '10000000',
    disclaimer: 'Real native experiment on event network 4001 using synthetic roles and test XRP. Transaction fees and reserves are separate from returned principal. No loan or receipt minted.' };
  await writeFile('evidence/native-cap-001.json', JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify({ completed: true, vaultId, principalReturnedDrops: '10000000', evidence: 'evidence/native-cap-001.json' }));
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Cap experiment failed; private journal retained');
  process.exitCode = 1;
} finally {
  if (adapter.client.isConnected()) await adapter.disconnect();
  await release();
}
