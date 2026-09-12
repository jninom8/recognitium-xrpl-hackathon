import { canonical, sha256 } from '../requests/commitment.js';
import type { ReceiptEvidence } from '../shared/contract.js';
import type { ReceiptPort } from '../requests/service.js';

const ORIGIN = 'https://api.recognitium.com';
type RecordValue = Record<string, unknown>;
export function object(value: unknown): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected response object');
  return value as RecordValue;
}
/** Node 24 reviver source prevents silent rounding of wire uint64 timestamps. */
export function parseWire(wire: string): RecordValue {
  const parsed: unknown = JSON.parse(wire, (_key: string, value: unknown, context?: { source?: string }) => {
    if (typeof value === 'number' && !Number.isSafeInteger(value)) {
      if (!context?.source || !/^[0-9]+$/.test(context.source)) throw new Error('Unsafe JSON number');
      return context.source;
    }
    return value;
  });
  return object(parsed);
}
function receiptOf(wire: string): RecordValue { const parsed = parseWire(wire); return object(parsed.receipt ?? parsed); }
export function checkReceiptContent(receipt: RecordValue, hash: string): void {
  if (receipt.content_hash !== hash) throw new Error('Receipt content hash mismatch');
  const chunks = ['prev_tip', 'fingerprint', 'payload_hash'].map(key => {
    const value = receipt[key]; if (typeof value !== 'string' || !/^[0-9a-f]{64}$/.test(value)) throw new Error('Malformed chain field');
    return Buffer.from(value, 'hex');
  });
  const timestamp = String(receipt.timestamp_ns);
  if (!/^[0-9]+$/.test(timestamp)) throw new Error('Malformed nanosecond timestamp');
  const timeBytes = Buffer.alloc(8); timeBytes.writeBigUInt64BE(BigInt(timestamp));
  if (sha256(Buffer.concat([...chunks, timeBytes])) !== receipt.new_tip) throw new Error('Receipt chain hash mismatch');
}
export class RecognitiumClient implements ReceiptPort {
  constructor(private readonly apiKey = process.env.RECOGNITIUM_API_KEY, private readonly transport: typeof fetch = fetch) {}
  private async request(path: string, body?: unknown): Promise<string> {
    if (body && !this.apiKey) throw new Error('Set server-side RECOGNITIUM_API_KEY, or attach an authorized MCP receipt by ID');
    const response = await this.transport(ORIGIN + path, {
      method: body ? 'POST' : 'GET', redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: body ? { 'Content-Type': 'application/json', 'X-API-Key': this.apiKey! } : {},
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) throw new Error(`Recognitium HTTP ${response.status}; receipt issuance may be unresolved`);
    return response.text();
  }
  async seal(hash: string): Promise<ReceiptEvidence> {
    if (!/^[a-f0-9]{64}$/.test(hash)) throw new Error('Invalid commitment');
    const receiptWire = await this.request('/v1/digital-clock', { data_hash: hash });
    const receipt = receiptOf(receiptWire); checkReceiptContent(receipt, hash);
    if (typeof receipt.receipt_id !== 'string') throw new Error('Missing receipt ID');
    // Return issuance immediately for durable storage. Caller verifies by official lookup next.
    return { receiptId: receipt.receipt_id, commitmentHash: hash, receiptWire, verificationWire: '', authorityCheckedAt: '' };
  }
  async recover(receiptId: string, hash: string): Promise<ReceiptEvidence> {
    if (!/^DG-[a-zA-Z0-9_-]{1,100}$/.test(receiptId)) throw new Error('Invalid receipt ID');
    const wire = await this.request('/v1/verify/receipt/' + encodeURIComponent(receiptId));
    const evidence = { receiptId, commitmentHash: hash, receiptWire: wire, verificationWire: '', authorityCheckedAt: '' };
    await this.verify(evidence, hash); return evidence;
  }
  async verify(evidence: ReceiptEvidence, hash: string): Promise<void> {
    if (!/^DG-[a-zA-Z0-9_-]{1,100}$/.test(evidence.receiptId) || evidence.commitmentHash !== hash) throw new Error('Receipt binding mismatch');
    const supplied = receiptOf(evidence.receiptWire); checkReceiptContent(supplied, hash);
    if (supplied.receipt_id !== evidence.receiptId) throw new Error('Receipt ID mismatch');
    const verificationWire = await this.request('/v1/verify/receipt/' + encodeURIComponent(evidence.receiptId));
    const verified = parseWire(verificationWire); const authorityRecord = object(verified.receipt);
    checkReceiptContent(authorityRecord, hash);
    // Official TLS lookup by ID establishes the current authority's record, not
    // an independent offline anchor or a cryptographic signature by a key.
    for (const key of ['receipt_id','sequence_number','prev_tip','new_tip','fingerprint','payload_hash','timestamp_ns','content_hash','binding','entropy_tier']) {
      if (String(supplied[key]) !== String(authorityRecord[key])) throw new Error(`Authority record differs: ${key}`);
    }
    if (verified.verified !== true) throw new Error('Authority lookup rejected receipt');
    evidence.verificationWire = verificationWire; evidence.authorityCheckedAt = new Date().toISOString();
  }
  async tip(): Promise<string> { return this.request('/v1/authority/tip'); }
}
