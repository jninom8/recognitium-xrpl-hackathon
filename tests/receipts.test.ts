import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RecognitiumClient, checkReceiptContent, parseWire } from '../src/recognitium/client.js';
import { sha256 } from '../src/requests/commitment.js';
import { ceilDrops, floorDrops } from '../src/xrpl/cycle.js';

function receipt(hash: string) {
  const previous = 'a'.repeat(64), fingerprint = 'b'.repeat(64), payload = 'c'.repeat(64);
  const timestamp = '1789212671861463399'; const bytes = Buffer.alloc(8); bytes.writeBigUInt64BE(BigInt(timestamp));
  return {receipt_id:'DG-FIXTURE',sequence_number:1,prev_tip:previous,fingerprint,payload_hash:payload,
    timestamp_ns:timestamp,new_tip:sha256(Buffer.concat([Buffer.from(previous,'hex'),Buffer.from(fingerprint,'hex'),Buffer.from(payload,'hex'),bytes])),content_hash:hash,binding:'FIXTURE',entropy_tier:'FIXTURE'};
}
test('receipt parser preserves uint64 values without rounding', () => {
  assert.equal(parseWire('{"timestamp_ns":1789212671861463399}').timestamp_ns,'1789212671861463399');
  assert.throws(()=>parseWire('{"amount":1.25}'));
});
test('self-consistent fabricated receipt is rejected when authority record differs', async () => {
  const hash='a'.repeat(64); const fake=receipt(hash); checkReceiptContent(fake,hash);
  const transport: typeof fetch = async () => new Response(JSON.stringify({verified:true,receipt:{...fake,receipt_id:'DG-DIFFERENT'}}));
  const client = new RecognitiumClient(undefined,transport);
  await assert.rejects(client.verify({receiptId:fake.receipt_id,commitmentHash:hash,receiptWire:JSON.stringify(fake),verificationWire:'',authorityCheckedAt:''},hash),/Authority record differs/);
});
test('receipt verification rejects changed commitment and chain link', () => {
  const hash='a'.repeat(64); const original=receipt(hash);
  assert.throws(()=>checkReceiptContent(original,'d'.repeat(64)),/content hash/);
  assert.throws(()=>checkReceiptContent({...original,new_tip:'d'.repeat(64)},hash),/chain hash/);
});
test('ledger repayments round up and withdrawals down without money floats', () => {
  assert.equal(ceilDrops('9007199254740993.00001'),'9007199254740994');
  assert.equal(floorDrops('9007199254740993.99999'),'9007199254740993');
  assert.equal(ceilDrops('100.0000'),'100');
  assert.throws(()=>ceilDrops('1e8')); assert.throws(()=>floorDrops('-1'));
});
