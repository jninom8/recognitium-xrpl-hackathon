import { IntakeService } from '../requests/intake.js';
import type { FinancingRequest } from '../shared/intake.js';

export interface IntakeSnapshot { records: FinancingRequest[]; etag?: string }
export interface IntakeDatabase {
  read(): Promise<IntakeSnapshot>;
  compareAndSwap(snapshot: IntakeSnapshot, records: FinancingRequest[]): Promise<void>;
}
export class HostedIntake {
  constructor(readonly database: IntakeDatabase) {}
  async list() { return (await this.database.read()).records.sort((a,b) => b.createdAt.localeCompare(a.createdAt)); }
  async mutate(id: string | undefined, input: Record<string, unknown>): Promise<FinancingRequest> {
    // Re-read after a conflict or an uncertain write response. The same input's
    // request ID/review digest reconciles a prior success without rewinding it.
    for (let attempt = 0; attempt < 3; attempt++) {
      const snapshot = await this.database.read();
      const records = structuredClone(snapshot.records);
      const service = new IntakeService({
        read: async key => records.find(r => r.clientRequestId === key),
        all: async () => records,
        write: async (key, value) => {
          const index = records.findIndex(r => r.clientRequestId === key);
          if (index < 0) records.push(value); else records[index] = value;
        },
      });
      const result = id ? await service.review(id, input) : await service.create(input);
      if (JSON.stringify(records) === JSON.stringify(snapshot.records)) return result;
      try { await this.database.compareAndSwap(snapshot, records); return result; }
      catch { if (attempt === 2) throw new Error('Shared storage could not confirm this change. Refresh and retry the same request.'); }
    }
    throw new Error('Shared storage unavailable');
  }
}
