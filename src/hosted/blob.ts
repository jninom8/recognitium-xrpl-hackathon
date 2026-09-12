import { get, put } from '@vercel/blob';
import type { FinancingRequest } from '../shared/intake.js';
import type { IntakeDatabase, IntakeSnapshot } from './intake.js';

const path = 'recognitium/shared-intake-v1.json';
export class BlobIntakeDatabase implements IntakeDatabase {
  async read(): Promise<IntakeSnapshot> {
    const result = await get(path, { access: 'private', useCache: false, abortSignal: AbortSignal.timeout(8000) });
    if (!result) return { records: [] };
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
