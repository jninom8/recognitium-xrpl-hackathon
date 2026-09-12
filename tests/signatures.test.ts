import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeForSigning, encodeForSigningCounterparty } from 'ripple-binary-codec';
import { verify } from 'ripple-keypairs';
import { validate } from 'xrpl';
import { fixture } from './fixtures.js';
import { assertSigned, cosign, native } from '../src/xrpl/transactions.js';
import { canonical, digest, documentCommitment } from '../src/requests/commitment.js';

test('real xrpl.js codec: both signature roles cover Data and the full transaction', async () => {
  const f = fixture(); const tx = await f.transaction;
  const signed = cosign(tx, f.broker, f.borrower).tx;
  const check = (value: typeof signed) => [
    verify(encodeForSigning(value), signed.TxnSignature!, f.broker.publicKey),
    verify(encodeForSigningCounterparty(value), signed.CounterpartySignature!.TxnSignature!, f.borrower.publicKey),
  ];
  assert.deepEqual(check(signed), [true, true]);
  for (const mutation of [{ Data: 'C'.repeat(64) }, { PrincipalRequested: '100000001' }, { Counterparty: f.lender.address }, { NetworkID: 21338 }, { Fee: '25' }, { LastLedgerSequence: 201 }]) {
    assert.deepEqual(check({ ...signed, ...mutation }), [false, false]);
  }
});
test('native cycle builders are accepted by the installed stable SDK validators', () => {
  const f = fixture(); const a = f.broker.address; const id = 'A'.repeat(64);
  for (const tx of [native.vault(a), native.deposit(a,id,'100000000'),native.broker(a,id),native.cover(a,id,'20000000'),native.repay(a,id,'100000020'),native.withdraw(a,id,'100000020')]) validate(tx as unknown as Record<string, unknown>);
});
test('stored co-signed blob and bounds must match approved transaction before replay', async()=>{
  const f=fixture();const prepared=await f.transaction;const signed=cosign(prepared,f.broker,f.borrower);
  assert.doesNotThrow(()=>assertSigned(prepared,signed));
  assert.throws(()=>assertSigned({...prepared,LastLedgerSequence:201},signed));
  assert.throws(()=>assertSigned(prepared,{...signed,hash:'0'.repeat(64)}));
});
test('canonical bytes, large integers, private salts and document changes', () => {
  assert.equal(canonical({ z: '9007199254740993', a: 1 }), '{"a":1,"z":"9007199254740993"}');
  assert.equal(digest({ z: 2, a: 1 }), digest({ a: 1, z: 2 }));
  for (const value of [NaN, 1.5, undefined, -0, 9007199254740992, [undefined]]) assert.throws(() => canonical(value));
  const original = documentCommitment(Buffer.from('invoice'));
  assert.notEqual(documentCommitment(Buffer.from('invoice changed'), original.salt).hash, original.hash);
  assert.notEqual(documentCommitment(Buffer.from('invoice')).hash, original.hash);
});
