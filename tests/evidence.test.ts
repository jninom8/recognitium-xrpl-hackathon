import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {verifyOffline,type Bundle} from '../src/recognitium/evidence.js';

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
