import { get, put } from '@vercel/blob';
import type { FinancingRequest } from '../shared/intake.js';
import type { IntakeDatabase, IntakeSnapshot } from './intake.js';

const path = 'recognitium/shared-intake-v1.json';
export class BlobIntakeDatabase implements IntakeDatabase {
  constructor(private readonly fetchBlob: typeof get = get) {}
  async read(): Promise<IntakeSnapshot> {
    // Compressed downloads can carry a weak ETag, which cannot satisfy If-Match.
    const result = await this.fetchBlob(path, { access: 'private', useCache: false, headers: { 'Accept-Encoding': 'identity' }, abortSignal: AbortSignal.timeout(8000) });
    if (!result) return { records: [] };
    if (!result.blob.etag || result.blob.etag.startsWith('W/')) throw new Error('Shared storage returned a non-authoritative version');
    if (!result.stream || (result.blob.size ?? Infinity) > 256000) throw new Error('Shared storage record is unavailable');
    const body: unknown = await new Response(result.stream).json();
    const data = body as { schema?: string; records?: FinancingRequest[] };
    if (data.schema !== 'recognitium.hosted-intake.v1' || !Array.isArray(data.records) || data.records.length > 100)
      throw new Error('Shared storage record is invalid');
    return { records: data.records, etag: result.blob.etag };
  }
  async compareAndSwap(snapshot: IntakeSnapshot, records: FinancingRequest[]): Promise<void> {
    await put(path, JSON.stringify({ schema: 'recognitium.hosted-intake.v1', records }), {
      access: 'private', addRandomSuffix: false, contentType: 'application/json',
      ...(snapshot.etag ? { ifMatch: snapshot.etag } : { allowOverwrite: false }),
      abortSignal: AbortSignal.timeout(8000),
    });
  }
}
