import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { DashboardHealth } from '../shared/contract.js';
import type { NativeAdapter } from '../xrpl/adapter.js';
import type { RecognitiumClient } from '../recognitium/client.js';

const exec = promisify(execFile);
export function initialHealth(): DashboardHealth {
  return {
    ledger: { status: 'unchecked', checkedAt: null, message: 'Use Check services for a read-only event-network check.' },
    receipts: { status: 'unchecked', checkedAt: null, message: 'Public receipt service has not been checked.', issuance: 'operator-mcp-or-configured-rest' },
    hook: { status: 'unchecked', checkedAt: null, message: 'Project-local capture has not been checked.' },
  };
}
/** Health reads never sign, submit, issue receipts or flush hook events. */
export class HealthMonitor {
  private value = initialHealth();
  private pending?: Promise<void>;
  private ledgerPending?: Promise<void>;
  private lastRun = 0;
  constructor(readonly adapter: NativeAdapter, readonly receipts: RecognitiumClient, readonly enabled: boolean) {}
  snapshot(): DashboardHealth {
    const result = structuredClone(this.value);
    if (result.ledger.status === 'ready' && !this.adapter.client.isConnected()) {
      result.ledger.status = 'unavailable'; result.ledger.message = 'Connection lost. Previously validated funding is retained.';
    }
    if (result.ledger.status === 'ready' && result.ledger.checkedAt && Date.now() - Date.parse(result.ledger.checkedAt) > 60000) {
      result.ledger.status = 'unchecked'; result.ledger.message = 'Last ledger observation is stale. Check services again.';
    }
    return result;
  }
  check(force = false): Promise<void> {
    if (this.pending) return this.pending;
    if (!force && Date.now() - this.lastRun < 30000) return Promise.resolve();
    this.lastRun = Date.now();
    this.pending = Promise.allSettled([this.checkLedger(), this.checkReceipts(), this.checkHook()]).then(() => {}).finally(() => { this.pending = undefined; });
    return this.pending;
  }
  checkLedger(): Promise<void> {
    if (this.ledgerPending) return this.ledgerPending;
    this.ledgerPending = this.readLedger().finally(() => { this.ledgerPending = undefined; }); return this.ledgerPending;
  }
  private async readLedger(): Promise<void> {
    if (!this.enabled) {
      this.value.ledger = { status: 'blocked', checkedAt: new Date().toISOString(), message: 'Set TRACK1_MENTOR_OPEN_ENDED_TRIAL=1 for the documented event-network trial.' }; return;
    }
    this.value.ledger = { ...this.value.ledger, status: 'checking', message: 'Checking event ledger identity and availability.' };
    const started = Date.now();
    try {
      if (!this.adapter.client.isConnected() || !this.adapter.identity) await this.adapter.connect();
      const info = (await this.adapter.client.request({ command: 'server_info' })).result.info;
      if (info.network_id !== 4001 || info.network_id !== this.adapter.identity?.networkId || info.build_version !== this.adapter.identity?.serverBuild || info.amendment_blocked || !info.validated_ledger) {
        this.value.ledger = { status: 'blocked', checkedAt: new Date().toISOString(), message: 'Ledger identity/build or validated-ledger availability changed; review required.' }; return;
      }
      this.value.ledger = { status: 'ready', checkedAt: new Date().toISOString(), message: 'Event ledger responded. This is connectivity, not validation of a particular transaction.', networkId: info.network_id, serverBuild: info.build_version, ledgerIndex: info.validated_ledger.seq, latencyMs: Date.now() - started };
    } catch {
      this.value.ledger = { ...this.value.ledger, status: 'unavailable', checkedAt: new Date().toISOString(), latencyMs: Date.now() - started, message: 'Event ledger check failed. Retain existing transaction history; run npm run probe for transport diagnostics.' };
    }
  }
  private async checkReceipts(): Promise<void> {
    this.value.receipts.status = 'checking';
    try {
      await this.receipts.tip();
      this.value.receipts = { status: 'ready', checkedAt: new Date().toISOString(), message: 'Public authority endpoint reachable. Issuance access and individual receipts require separate checks.', issuance: 'operator-mcp-or-configured-rest' };
    } catch {
      this.value.receipts = { status: 'unavailable', checkedAt: new Date().toISOString(), message: 'Authority endpoint unavailable. Validated funding remains recorded.', issuance: 'operator-mcp-or-configured-rest' };
    }
  }
  private async checkHook(): Promise<void> {
    try {
      const { stdout } = await exec(process.execPath, ['scripts/hook-status.mjs'], { timeout: 5000, windowsHide: true, maxBuffer: 64000 });
      const status = JSON.parse(stdout) as Record<string, unknown>;
      this.value.hook = { status: status.hooks_registered === true ? 'ready' : 'blocked', checkedAt: new Date().toISOString(), message: 'Local registration and delivery counters only; no raw events or identity exposed.', accepted: Number(status.sent_events), buffered: Number(status.buffered_events), version: String(status.client_version) };
    } catch { this.value.hook = { status: 'unavailable', checkedAt: new Date().toISOString(), message: 'Local hook status unavailable. Follow docs/HOOK_SETUP.md on this machine.' }; }
  }
}
