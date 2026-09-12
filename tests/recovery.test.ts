import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { decode } from 'xrpl';
import { LendingService, type PrivateRequest, type ReceiptPort } from '../src/requests/service.js';
import { Store } from '../src/requests/store.js';
import { type LedgerPort, type ValidatedTransaction } from '../src/xrpl/adapter.js';
import { fixture } from './fixtures.js';
import type { ReceiptEvidence } from '../src/shared/contract.js';

async function setup() {
  const directory = await mkdtemp(join(tmpdir(), 'recognitium-test-'));
  const f = fixture(); let submissions = 0; let receiptCalls = 0;
  let found: ValidatedTransaction | undefined; let failReceipt = false; let failVerification = false;
  const ledger: LedgerPort = { lookup: async () => found, ledgerIndex: async () => 100, submit: async () => { submissions++; throw new Error('SIMULATED connection reset after accepted submission'); } };
  const receipts: ReceiptPort = {
    seal: async (hash) => { receiptCalls++; if (failReceipt) throw new Error('SIMULATED receipt outage'); return { receiptId: 'FIXTURE', commitmentHash: hash, receiptWire: '{}', verificationWire: '{}', authorityCheckedAt: new Date().toISOString() }; },
    verify: async (e, h) => { if (failVerification) throw new Error('SIMULATED authority lookup outage'); assert.equal(e.commitmentHash, h); },
  };
  const store = new Store<PrivateRequest>(directory); let service = new LendingService(store, ledger, receipts);
  const view = await service.create(f.agreement, f.document, f.salt, f.prepare);
  const id = f.agreement.requestId;
  const approve = async () => { for (const role of ['broker', 'borrower'] as const) await service.approve(id, role, view.agreementHash, view.transactionDigest); };
  return { f, store, get service() { return service; }, view, id, approve,
    restart: () => { service = new LendingService(new Store(directory), ledger, receipts); },
    cleanup: () => rm(directory, { recursive: true, force: true }),
    calls: () => ({ submissions, receiptCalls }), failReceipt: () => { failReceipt = true; },
    failVerification: () => { failVerification = true; },
    validate: async () => {
      const r = (await store.read(id))!;
      found = { hash: r.signed!.hash, ledgerIndex: 110, resultCode: 'tesSUCCESS', raw: { fixture: true },
        tx: decode(r.signed!.tx_blob) as unknown as Record<string, unknown>,
        meta: { AffectedNodes: [
          { CreatedNode: { LedgerEntryType: 'Loan', LedgerIndex: 'C'.repeat(64) } },
          { ModifiedNode: { LedgerEntryType: 'AccountRoot', PreviousFields: { Balance: '200000000' }, FinalFields: { Account: f.borrower.address, Balance: '300000000' } } },
        ] } };
    },
  };
}
test('approval is request-bound and both roles plus a verified receipt are required', async () => {
  const t = await setup(); try {
    await assert.rejects(t.service.approve(t.id, 'broker', 'wrong-request', t.view.transactionDigest));
    await assert.rejects(t.service.receiptAgreement(t.id));
    await t.approve(); await assert.rejects(t.service.sign(t.id, t.f.broker, t.f.borrower));
    assert.deepEqual(t.calls(), { submissions: 0, receiptCalls: 0 });
  } finally { await t.cleanup(); }
});

test('SIMULATED authority lookup outage does not hide already-validated borrower funding', async () => {
  const t = await setup(); try {
    await t.approve(); await t.service.receiptAgreement(t.id); await t.service.sign(t.id,t.f.broker,t.f.borrower);
    await t.service.advance(t.id); await t.validate(); t.failVerification(); t.restart();
    const recovered = await t.service.advance(t.id);
    assert.equal(recovered.phase,'VALIDATED_RECEIPT_PENDING');
    assert.equal(recovered.checks.xrplValidation,'validated-success');
    assert.equal(t.calls().submissions,1);
    assert.equal((await t.store.read(t.id))!.executionManifest!.borrowerFundingDrops,'100000000');
  } finally { await t.cleanup(); }
});

test('repeating an agreement receipt action cannot move a signed or funded request backwards', async () => {
  const t = await setup(); try {
    await t.approve(); await t.service.receiptAgreement(t.id); await t.service.sign(t.id,t.f.broker,t.f.borrower);
    const signed = (await t.store.read(t.id))!.signed;
    assert.equal((await t.service.receiptAgreement(t.id)).phase,'SIGNED');
    await t.service.advance(t.id);
    assert.equal((await t.service.receiptAgreement(t.id)).phase,'VALIDATION_UNKNOWN');
    await t.validate(); await t.service.advance(t.id);
    assert.equal((await t.service.receiptAgreement(t.id)).phase,'VALIDATED_RECEIPT_PENDING');
    await t.service.receiptExecution(t.id);
    assert.equal((await t.service.receiptAgreement(t.id)).phase,'FUNDED_WITH_EVIDENCE');
    await assert.rejects(t.service.approve(t.id,'broker',t.view.agreementHash,t.view.transactionDigest),/phase closed/);
    assert.deepEqual((await t.store.read(t.id))!.signed,signed);
    assert.deepEqual(t.calls(),{submissions:1,receiptCalls:2});
  } finally { await t.cleanup(); }
});

test('SIMULATED authority outage still blocks a new submission', async () => {
  const t = await setup(); try {
    await t.approve(); await t.service.receiptAgreement(t.id); await t.service.sign(t.id,t.f.broker,t.f.borrower);
    t.failVerification();
    await assert.rejects(t.service.advance(t.id),/SIMULATED authority lookup outage/);
    assert.equal(t.calls().submissions,0);
    assert.equal((await t.store.read(t.id))!.phase,'SIGNED');
  } finally { await t.cleanup(); }
});

test('rechecking an agreement receipt preserves unresolved execution issuance without another charge', async () => {
  const t = await setup(); try {
    await t.approve(); await t.service.receiptAgreement(t.id); await t.service.sign(t.id,t.f.broker,t.f.borrower);
    await t.service.advance(t.id); await t.validate(); await t.service.advance(t.id);
    t.failReceipt(); await assert.rejects(t.service.receiptExecution(t.id),/SIMULATED receipt outage/);
    t.restart(); await t.service.receiptAgreement(t.id);
    assert.equal((await t.store.read(t.id))!.receiptAttempt,'execution');
    assert.equal((await t.store.read(t.id))!.phase,'VALIDATED_RECEIPT_PENDING');
    await assert.rejects(t.service.receiptExecution(t.id),/unresolved/);
    assert.deepEqual(t.calls(),{submissions:1,receiptCalls:2});
  } finally { await t.cleanup(); }
});
test('changed document, amount, network, expiry, metadata invalidate existing approvals', async () => {
  for (const change of ['document', 'amount', 'network', 'expiry', 'metadata']) {
    const t = await setup(); try {
      await t.approve(); const r = (await t.store.read(t.id))!;
      if (change === 'document') r.documentBase64 = Buffer.from('changed').toString('base64');
      if (change === 'amount') r.agreement.terms.principalDrops = '100000001';
      if (change === 'network') r.agreement.network.networkId++;
      if (change === 'expiry') r.agreement.expiresAt = '2000-01-01T00:00:00Z';
      if (change === 'metadata') r.preparedTransaction.Data = 'D'.repeat(64);
      await t.store.write(t.id, r);
      await assert.rejects(t.service.receiptAgreement(t.id));
      assert.equal(t.calls().receiptCalls, 0);
    } finally { await t.cleanup(); }
  }
});
test('timeout, restart, validated funding and receipt outage do not originate another loan', async () => {
  const t = await setup(); try {
    await t.approve(); await t.service.receiptAgreement(t.id); await t.service.sign(t.id,t.f.broker,t.f.borrower);
    const before = (await t.store.read(t.id))!.signed!;
    assert.equal((await t.service.advance(t.id)).phase, 'VALIDATION_UNKNOWN');
    t.restart(); await t.validate();
    assert.equal((await t.service.advance(t.id)).phase, 'VALIDATED_RECEIPT_PENDING');
    t.failReceipt(); await assert.rejects(t.service.receiptExecution(t.id));
    t.restart(); await t.service.advance(t.id);
    await assert.rejects(t.service.receiptExecution(t.id), /unresolved/);
    const after = (await t.store.read(t.id))!;
    assert.deepEqual(after.signed, before); assert.equal(t.calls().submissions, 1);
    const evidence: ReceiptEvidence = { receiptId: 'RECOVERED-FIXTURE', commitmentHash: (await import('../src/requests/commitment.js')).digest(after.executionManifest), receiptWire: '{}', verificationWire: '{}', authorityCheckedAt: new Date().toISOString() };
    assert.equal((await t.service.attachRecoveredReceipt(t.id, 'execution', evidence)).phase, 'FUNDED_WITH_EVIDENCE');
    assert.equal(t.calls().submissions, 1);
    assert.ok(!('signed' in t.service.view(after))); assert.ok(!('documentSalt' in t.service.view(after)));
  } finally { await t.cleanup(); }
});

test('external receipt handoff requires approvals and survives restart without another issuance',async()=>{
 const t=await setup();try{
  await assert.rejects(t.service.prepareExternalReceipt(t.id,'agreement'));
  await t.approve();const intent=await t.service.prepareExternalReceipt(t.id,'agreement');assert.equal(intent.hash,t.view.agreementHash);
  t.restart();await assert.rejects(t.service.prepareExternalReceipt(t.id,'agreement'),/already prepared/);
  await assert.rejects(t.service.receiptAgreement(t.id),/unresolved/);
  assert.deepEqual(t.calls(),{submissions:0,receiptCalls:0});
  await t.service.attachRecoveredReceipt(t.id,'agreement',{receiptId:'FIXTURE',commitmentHash:intent.hash,receiptWire:'{}',verificationWire:'{}',authorityCheckedAt:new Date().toISOString()});
  await t.service.sign(t.id,t.f.broker,t.f.borrower);
  assert.deepEqual(t.calls(),{submissions:0,receiptCalls:0});
 }finally{await t.cleanup();}
});
