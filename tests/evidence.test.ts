import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {verifyOffline,assertFreshTransaction,type Bundle} from '../src/recognitium/evidence.js';

test('recorded synthetic live cycle verifies offline and rejects changed document, yield and repayment history',async()=>{
  // Recorded event-ledger evidence, not a mocked successful cycle. No network calls.
  const bundle=JSON.parse(await readFile('evidence/synthetic-supplier-001.json','utf8')) as Bundle;
  assert.equal(verifyOffline(bundle).signatures,'both-valid');
  const document=structuredClone(bundle); document.document.base64=Buffer.from('changed document').toString('base64');
  assert.throws(()=>verifyOffline(document),/Changed document/);
  const yieldEdit=structuredClone(bundle); yieldEdit.nativeCycle!.realisedYieldDrops='200';
  assert.throws(()=>verifyOffline(yieldEdit),/yield/);
  const history=structuredClone(bundle); delete history.nativeCycle!.transactions.repay;
  assert.throws(()=>verifyOffline(history),/original validated refusal/);
});

test('fresh RPC comparison permits absent CTID but rejects altered location, payload and metadata', async () => {
  const bundle = JSON.parse(await readFile('evidence/synthetic-supplier-001.json', 'utf8')) as Bundle;
  const saved = bundle.transaction;
  const withoutCtid = structuredClone(saved);
  delete withoutCtid.tx.ctid;
  assertFreshTransaction(saved, withoutCtid, 4001);
  assertFreshTransaction(withoutCtid, saved, 4001);
  assert.throws(() => assertFreshTransaction(saved, withoutCtid, 4002), /CTID/);
  assert.throws(() => assertFreshTransaction(saved, undefined, 4001), /unavailable/);
  for (const field of ['ctid', 'Data', 'TxnSignature', 'unknown', 'metadata', 'ledger', 'hash', 'result']) {
    const changed = structuredClone(saved);
    if (field === 'metadata') changed.meta.TransactionIndex = 9;
    else if (field === 'ledger') changed.ledgerIndex++;
    else if (field === 'hash') changed.hash = '0'.repeat(64);
    else if (field === 'result') changed.resultCode = 'tecNO_PERMISSION';
    else changed.tx[field] = 'changed';
    assert.throws(() => assertFreshTransaction(saved, changed, 4001));
  }
  assert.equal(saved.tx.ctid, 'C00102CD00010FA1');
  assert.equal(verifyOffline(bundle).signatures, 'both-valid');
});
