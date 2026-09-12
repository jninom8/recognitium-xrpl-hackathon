import { createHash, randomBytes } from 'node:crypto';
import { isValidClassicAddress } from 'xrpl';
import { CONTRACT_VERSION, TRACK1, type Agreement } from '../shared/contract.js';

/** Canonical format v1: sorted UTF-16 keys, JSON strings, finite safe integers only.
 * No undefined, floats, sparse arrays, custom prototypes, or implicit conversion.
 * Monetary and wide integer values are strings. UTF-8 bytes are hashed verbatim. */
export function canonical(value: unknown): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' && Number.isSafeInteger(value) && !Object.is(value, -0)) return String(value);
  if (Array.isArray(value)) {
    if (Object.keys(value).length !== value.length) throw new Error('Sparse or extended array');
    return '[' + value.map(canonical).join(',') + ']';
  }
  if (typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype) {
    const record = value as Record<string, unknown>;
    return '{' + Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${canonical(record[key])}`).join(',') + '}';
  }
  throw new Error('Unsupported canonical value');
}
export function sha256(bytes: string | Uint8Array): string { return createHash('sha256').update(bytes).digest('hex'); }
export function digest(value: unknown): string { return sha256(canonical(value)); }
export function documentCommitment(document: Uint8Array, salt = randomBytes(32).toString('hex')) {
  if (!/^[a-f0-9]{64}$/.test(salt)) throw new Error('Invalid document salt');
  return { salt, hash: sha256(Buffer.concat([Buffer.from('recognitium.document.v1\0'), Buffer.from(salt, 'hex'), document])) };
}
export function drops(value: string): bigint {
  if (!/^(0|[1-9][0-9]*)$/.test(value)) throw new Error('Expected nonnegative integer drops');
  return BigInt(value);
}
export function assertAgreement(a: Agreement, now = Date.now()): void {
  canonical(a);
  if (a.schema !== CONTRACT_VERSION || a.policyVersion !== 'human-exact-approval.v1' || a.asset !== 'XRP') throw new Error('Unsupported agreement');
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(a.requestId) || !Number.isSafeInteger(a.documentVersion) || a.documentVersion < 1) throw new Error('Invalid request/version');
  for (const hash of [a.documentCommitment, a.vaultId, a.loanBrokerId]) if (!/^[a-fA-F0-9]{64}$/.test(hash)) throw new Error('Invalid commitment/object ID');
  for (const account of Object.values(a.accounts)) if (!isValidClassicAddress(account)) throw new Error('Invalid account');
  if (new Set(Object.values(a.accounts)).size !== 3) throw new Error('Demo requires three distinct accounts');
  if (a.network.track !== TRACK1.track || a.network.websocket !== TRACK1.websocket || !Number.isSafeInteger(a.network.networkId) || a.network.networkId <= 0 || !a.network.serverBuild) throw new Error('Unconfirmed Track 1 identity');
  if (!Number.isFinite(Date.parse(a.expiresAt)) || Date.parse(a.expiresAt) <= now) throw new Error('Agreement expired');
  const t = a.terms;
  for (const value of [t.principalDrops, t.originationFeeDrops, t.serviceFeeDrops, t.latePaymentFeeDrops, t.closePaymentFeeDrops]) drops(value);
  if (drops(t.principalDrops) <= 0n || drops(t.originationFeeDrops) >= drops(t.principalDrops)) throw new Error('Invalid principal/origination fee');
  for (const rate of [t.interestRate, t.overpaymentFee, t.lateInterestRate, t.closeInterestRate, t.overpaymentInterestRate]) if (!Number.isInteger(rate) || rate < 0 || rate > 100000) throw new Error('Invalid rate');
  if (!Number.isInteger(t.paymentTotal) || t.paymentTotal < 1 || t.paymentTotal > 1000 || !Number.isInteger(t.paymentInterval) || t.paymentInterval < 60 || !Number.isInteger(t.gracePeriod) || t.gracePeriod < 60 || t.gracePeriod > t.paymentInterval) throw new Error('Invalid schedule');
  if (t.flags !== 0 && t.flags !== 0x00010000) throw new Error('Unsupported LoanSet flags');
}
