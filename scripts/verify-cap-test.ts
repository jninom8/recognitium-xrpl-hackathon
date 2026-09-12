/** Read-only reproduction of the recorded native cap experiment. */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { encode, hashes, type Transaction } from 'xrpl';
import { canonical } from '../src/requests/commitment.js';
import { assertFreshTransaction } from '../src/recognitium/evidence.js';
import { NativeAdapter, balanceDelta, type ValidatedTransaction } from '../src/xrpl/adapter.js';

interface CapEvidence {
  schema: string; synthetic: boolean; mode: string; network: { networkId: number };
  vaultId: string; capDrops: string; transactions: Record<string, ValidatedTransaction>;
  atCap: unknown; afterOver: unknown; finalVault: { Account: string };
  originalVaultId: string; originalVaultBefore: unknown; originalVaultAfter: unknown;
  settledVaultAccountBalanceDrops: string; principalReturnedDrops: string;
}
if (!process.argv.includes('--mentor-confirmed-open-ended')) throw new Error('Add --mentor-confirmed-open-ended for the recorded event-specific trial');
const bundle = JSON.parse(await readFile('evidence/native-cap-001.json', 'utf8')) as CapEvidence;
assert.equal(bundle.schema, 'recognitium.native-cap-experiment.v1');
assert.equal(bundle.synthetic, true); assert.equal(bundle.mode, 'live');
assert.equal(bundle.capDrops, '10000000'); assert.equal(bundle.network.networkId, 4001);
const get = (id: string) => { const result = bundle.transactions[id]; assert.ok(result, `Missing ${id}`); return result; };
assert.equal(get('create').resultCode, 'tesSUCCESS');
assert.equal(get('initial-deposit').resultCode, 'tesSUCCESS');
const competition = [get('competing-lender'), get('competing-borrower')];
assert.deepEqual(competition.map(r => r.resultCode).sort(), ['tecLIMIT_EXCEEDED', 'tesSUCCESS']);
assert.equal(get('one-drop-over').resultCode, 'tecLIMIT_EXCEEDED');
assert.equal(get('cap-below-assets').resultCode, 'tecLIMIT_EXCEEDED');
const withdrawals = Object.entries(bundle.transactions).filter(([id]) => id.startsWith('return-')).map(([, r]) => r);
assert.ok(withdrawals.length >= 1);
for (const r of withdrawals) assert.equal(r.resultCode, 'tesSUCCESS');
const returned = withdrawals.reduce((sum, r) => sum + balanceDelta(r, String(r.tx.Account)) + BigInt(String(r.tx.Fee)), 0n);
assert.equal(returned.toString(), bundle.principalReturnedDrops);
assert.equal(returned, 10000000n);
assert.equal(canonical(bundle.originalVaultBefore), canonical(bundle.originalVaultAfter));
assert.equal(canonical(bundle.atCap), canonical(bundle.afterOver));
const adapter = new NativeAdapter(true); adapter.client.on('error', () => {});
try {
  const network = await adapter.connect(); assert.equal(network.networkId, bundle.network.networkId);
  for (const saved of Object.values(bundle.transactions)) {
    assert.equal(hashes.hashSignedTx(encode(saved.tx as unknown as Transaction)), saved.hash);
    assertFreshTransaction(saved, await adapter.lookup(saved.hash), network.networkId);
  }
  const atCap = (await adapter.object(bundle.vaultId, Math.max(...competition.map(r => r.ledgerIndex)))).node;
  assert.equal(canonical(atCap), canonical(bundle.atCap));
  const afterOver = (await adapter.object(bundle.vaultId, get('one-drop-over').ledgerIndex)).node;
  assert.equal(canonical(afterOver), canonical(bundle.afterOver));
  const finalLedger = Math.max(...withdrawals.map(r => r.ledgerIndex));
  const final = (await adapter.object(bundle.vaultId, finalLedger)).node;
  assert.equal(canonical(final), canonical(bundle.finalVault));
  const balance = (await adapter.account(bundle.finalVault.Account, finalLedger)).account_data.Balance;
  assert.equal(balance, '0'); assert.equal(balance, bundle.settledVaultAccountBalanceDrops);
  const baseline = (await adapter.object(bundle.originalVaultId, finalLedger)).node;
  assert.equal(canonical(baseline), canonical(bundle.originalVaultAfter));
  console.log(JSON.stringify({ checkedAt: new Date().toISOString(), networkId: network.networkId,
    transactionsVerified: Object.keys(bundle.transactions).length, transactionHashes: 'consistent',
    ledgerTransactionsAndStates: 'freshly-verified', principalReturnedDrops: returned.toString(),
    originalVaultUnchanged: true }, null, 2));
} finally { if (adapter.client.isConnected()) await adapter.disconnect(); }
