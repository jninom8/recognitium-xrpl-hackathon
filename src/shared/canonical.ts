import { createHash } from 'node:crypto';

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
