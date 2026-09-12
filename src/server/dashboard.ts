import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { CONTRACT_VERSION, TRACK1, type ActionView, type AppState, type CycleView, type DashboardHealth, type DashboardRequest } from '../shared/contract.js';
import type { PrivateRequest } from '../requests/service.js';
import type { CycleRecord } from '../xrpl/cycle.js';
import { digest, sha256 } from '../requests/commitment.js';
import { verifyOffline, type Bundle } from '../recognitium/evidence.js';
import { balanceDelta } from '../xrpl/adapter.js';

// Compiled module lives in dist/src/server; public files live in the repository.
export const repositoryBundlePath = new URL('../../../evidence/synthetic-supplier-001.json', import.meta.url);
export const action = (id: string, label: string, allowed: boolean, reason: string, role: ActionView['role'] = 'operator'): ActionView => ({ id, label, allowed, reason: allowed ? '' : reason, role });
export function withReadiness(actions: ActionView[], health: DashboardHealth): ActionView[] {
  const ledgerActions = new Set(['setup','prepare','refusal','repay','withdraw','sign','submit']);
  return actions.map(a => a.allowed && ledgerActions.has(a.id) && health.ledger.status !== 'ready'
    ? { ...a, allowed: false, reason: `Check services before this ledger action. ${health.ledger.message}` } : a);
}

export function cycleView(record: CycleRecord | null): CycleView | null {
  if (!record) return null;
  return {
    requestId: record.requestId, vaultId: record.vaultId, loanBrokerId: record.loanBrokerId,
    depositDrops: record.depositDrops, coverDrops: record.coverDrops,
    steps: Object.fromEntries(Object.entries(record.steps).map(([id, s]) => [id, { hash: s.hash, ledgerIndex: s.ledgerIndex, resultCode: s.resultCode }])),
    ...(record.refusal ? { refusal: { hash: record.refusal.hash, resultCode: record.refusal.resultCode } } : {}),
    ...(record.yield ? { yield: { withdrawnDrops: record.yield.withdrawnDrops, depositedDrops: record.yield.depositedDrops, realisedYieldDrops: record.yield.realisedYieldDrops, withdrawalFeeDrops: record.yield.withdrawalFeeDrops, calculation: record.yield.calculation } } : {}),
  };
}

export function requestView(r: PrivateRequest, live: boolean, now = Date.now()): DashboardRequest {
  const approved = ['broker', 'borrower'].every(role => r.approvals.some(a => a.role === role && a.agreementHash === r.agreementHash && a.transactionDigest === r.transactionDigest));
  const unexpired = Date.parse(r.agreement.expiresAt) > now;
  const approvalOpen = ['AGREEMENT_LOCKED', 'AGREEMENT_RECEIPTED'].includes(r.phase) && unexpired;
  const funded = r.validated?.resultCode === 'tesSUCCESS' && r.checks.xrplValidation === 'validated-success';
  const signed = Boolean(r.signed || r.transaction);
  const actions = [
    ...(['broker', 'borrower'] as const).map(role => action(`approve/${role}`, `Approve as ${role}`, approvalOpen && !r.approvals.some(a => a.role === role), 'Already approved, review window expired or approval phase closed.', role)),
    action('agreement-receipt', r.agreementReceipt ? 'Recheck agreement receipt' : 'Issue agreement receipt (1 tick)', approved && unexpired && !signed && (!r.receiptAttempt || Boolean(r.agreementReceipt)), 'Needs both current approvals and a resolved issuance attempt.'),
    action('sign', 'Sign approved transaction', approved && unexpired && Boolean(r.agreementReceipt) && !signed, 'Needs both current approvals and an agreement receipt; already signed requests keep their signature.'),
    action('submit', r.phase === 'SIGNED' ? 'Submit approved loan' : 'Reconcile existing transaction', signed && !r.validated && (r.phase !== 'SIGNED' || unexpired), 'Already resolved, unsigned or first-submission consent expired.'),
    action('execution-receipt', r.executionReceipt ? 'Recheck execution receipt' : 'Issue execution receipt (1 tick)', funded && (!r.receiptAttempt || Boolean(r.executionReceipt)), 'Needs validated funding and a resolved issuance attempt.'),
    action('recover-receipt', 'Recover receipt by ID', (!signed && approved && unexpired) || funded, 'Needs approved terms for an agreement receipt, or validated funding for an execution receipt.'),
  ].map(a => live ? a : { ...a, allowed: false, reason: 'Published evidence is read-only.' });
  // Explicit allowlist: private content, salts, executable blobs and arbitrary stored fields never cross this boundary.
  return {
    contractVersion: r.contractVersion, mode: r.mode, phase: r.phase,
    agreement: structuredClone(r.agreement), agreementHash: r.agreementHash, transactionDigest: r.transactionDigest,
    preparedTransaction: structuredClone(r.preparedTransaction), approvals: structuredClone(r.approvals),
    transaction: r.transaction ? { hash: r.transaction.hash, lastLedgerSequence: r.transaction.lastLedgerSequence, ledgerIndex: r.transaction.ledgerIndex, resultCode: r.transaction.resultCode } : undefined,
    loanId: r.loanId, checks: structuredClone(r.checks),
    agreementReceipt: r.agreementReceipt ? structuredClone(r.agreementReceipt) : undefined,
    executionReceipt: r.executionReceipt ? structuredClone(r.executionReceipt) : undefined,
    receiptRecovery: { agreementHash: r.agreementHash, executionHash: r.executionManifest ? digest(r.executionManifest) : undefined, pendingStage: r.receiptAttempt },
    funding: { status: funded ? 'funded' : r.validated ? 'refused' : signed ? 'unknown' : 'unfunded', ...(funded ? { borrowerFundingDrops: balanceDelta(r.validated!, r.agreement.accounts.borrower).toString() } : {}) }, actions,
  };
}

export function cycleActions(record: CycleRecord | null, requests: PrivateRequest[], live: boolean): ActionView[] {
  const prepared = record?.requestId ? requests.find(r => r.agreement.requestId === record.requestId) : undefined;
  const funded = prepared?.validated?.resultCode === 'tesSUCCESS';
  const repaid = record?.steps.repay?.resultCode === 'tesSUCCESS' || record?.steps['repay-late']?.resultCode === 'tesSUCCESS';
  return [
    action('setup', 'Set up test vault and cover', record?.steps.cover?.resultCode !== 'tesSUCCESS', 'Setup already complete.'),
    action('prepare', 'Prepare exact agreement', record?.steps.cover?.resultCode === 'tesSUCCESS' && !requests.length, 'Needs complete setup and an unused request slot. Existing history is preserved.'),
    action('refusal', 'Try native liquidity refusal', Boolean(funded) && !record?.refusal && !record?.steps.repay, 'Requires funding before repayment and before a recorded refusal.'),
    action('repay', 'Repay loan', Boolean(funded) && !repaid, 'Requires a funded, unpaid loan.'),
    action('withdraw', 'Redeem lender position', repaid && record?.steps.withdraw?.resultCode !== 'tesSUCCESS', 'Requires repayment and no completed redemption.'),
  ].map(a => live ? a : { ...a, allowed: false, reason: 'Published evidence is read-only.' });
}

export interface DashboardSource {
  records(): Promise<{ cycle: CycleRecord | null; requests: PrivateRequest[] }>;
  health(): DashboardHealth;
  connected(): boolean;
  published(): Promise<Bundle>;
}
export class Dashboard {
  readonly instanceId = randomUUID();
  private revision = 0;
  private fingerprints = new Map<string, { fingerprint: string; revision: number }>();
  private inFlight = new Map<string, Promise<AppState>>();
  constructor(readonly source: DashboardSource) {}
  snapshot(mode: 'live' | 'recorded' = 'live'): Promise<AppState> {
    const existing = this.inFlight.get(mode); if (existing) return existing;
    const work = this.read(mode).finally(() => this.inFlight.delete(mode)); this.inFlight.set(mode, work); return work;
  }
  private async read(mode: 'live' | 'recorded'): Promise<AppState> {
    const now = new Date().toISOString();
    let records: Awaited<ReturnType<DashboardSource['records']>>;
    if (mode === 'recorded') {
      const bundle = await this.source.published(); verifyOffline(bundle);
      const agreement = JSON.parse(bundle.agreementBytes) as PrivateRequest['agreement'];
      const execution = JSON.parse(bundle.executionBytes) as Record<string, unknown>;
      const r: PrivateRequest = {
        contractVersion: CONTRACT_VERSION, mode: 'live', phase: 'FUNDED_WITH_EVIDENCE', agreement,
        agreementHash: bundle.agreementHash, transactionDigest: bundle.transactionDigest, preparedTransaction: bundle.preparedTransaction,
        // The published bundle proves signatures, but does not export human approval timestamps.
        approvals: [], checks: { contentHash: 'consistent', receiptAuthority: 'unchecked', xrplValidation: 'validated-success' },
        transaction: { hash: bundle.transaction.hash, lastLedgerSequence: Number(bundle.preparedTransaction.LastLedgerSequence), ledgerIndex: bundle.transaction.ledgerIndex, resultCode: bundle.transaction.resultCode },
        loanId: String(execution.loanId), agreementReceipt: bundle.agreementReceipt, executionReceipt: bundle.executionReceipt,
        executionManifest: execution, validated: bundle.transaction, documentBase64: '', documentSalt: '',
      };
      const c = bundle.nativeCycle;
      const withdrawal = c?.transactions.withdraw;
      records = { requests: [r], cycle: c ? {
        schema: 'recognitium.native-cycle.v1', network: agreement.network, accounts: agreement.accounts,
        requestId: agreement.requestId, vaultId: agreement.vaultId, loanBrokerId: agreement.loanBrokerId,
        depositDrops: c.depositDrops, coverDrops: String(c.transactions.cover?.tx.Amount ?? '0'),
        steps: Object.fromEntries(Object.entries(c.transactions).map(([key, tx]) => [key, { hash: tx.hash, ledgerIndex: tx.ledgerIndex, resultCode: tx.resultCode }])), refusal: c.refusal,
        ...(withdrawal ? { yield: { depositedDrops: c.depositDrops, withdrawnDrops: (BigInt(c.depositDrops) + BigInt(c.realisedYieldDrops)).toString(), realisedYieldDrops: c.realisedYieldDrops, withdrawalFeeDrops: String(withdrawal.tx.Fee), calculation: 'Recorded withdrawal delta plus withdrawal fee minus deposited principal; offline bundle checks passed.' } } : {}),
      } : null };
    } else records = await this.source.records();
    const health = structuredClone(this.source.health());
    const content = {
      stateVersion: 'recognitium.dashboard.v1' as const, instanceId: this.instanceId,
      contractVersion: CONTRACT_VERSION, mode, network: TRACK1, connected: this.source.connected(),
      requests: records.requests.map(r => { const view = requestView(r, mode === 'live'); view.actions = withReadiness(view.actions, health); return view; }), cycle: cycleView(records.cycle), health,
      actions: withReadiness(cycleActions(records.cycle, records.requests, mode === 'live'), health),
      disclosure: 'Test funds only. Synthetic business documents. Recognitium is pre-existing classical software; AI assisted this build. No QCP hardware. Published evidence checks are offline unless explicitly verified online.',
    };
    // This is only a UI revision fingerprint of the actual JSON response. It is
    // not an agreement/receipt commitment, whose strict canonical format is unchanged.
    const fingerprint = sha256(JSON.stringify(content)); let entry = this.fingerprints.get(mode);
    if (!entry || entry.fingerprint !== fingerprint) { entry = { fingerprint, revision: ++this.revision }; this.fingerprints.set(mode, entry); }
    return { ...content, revision: entry.revision, observedAt: now, verification: { scope: mode === 'recorded' ? 'published-bundle-offline' : 'local-records', checkedAt: now } };
  }
}
export async function readPublishedBundle(): Promise<Bundle> { return JSON.parse(await readFile(repositoryBundlePath, 'utf8')) as Bundle; }
