import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fork, type ChildProcess } from 'node:child_process';
import { mkdtemp, readFile, rm, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { LendingService, type PrivateRequest, type ReceiptPort } from '../src/requests/service.js';
import { Store, processLock } from '../src/requests/store.js';
import { fixture } from './fixtures.js';
import type { SimulatedRemote } from './helpers/crash-worker.js';

function worker(directory: string, id: string, mode: string) {
  const child = fork(new URL('./helpers/crash-worker.js', import.meta.url), [directory, id, mode], {
    stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
  });
  const message = new Promise<Record<string, unknown>>((accept, reject) => {
    child.once('message', value => accept(value as Record<string, unknown>));
    child.once('error', reject);
    child.once('exit', () => reject(new Error('Child exited before its checkpoint/result')));
  });
  const exited = new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((accept, reject) => {
    child.once('exit', (code, signal) => accept({ code, signal }));
    child.once('error', reject);
  });
  return { child, message, exited };
}

async function stop(child: ChildProcess) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = new Promise<void>(accept => child.once('exit', () => accept()));
  child.kill('SIGKILL');
  await exited;
}

for (const mode of ['after-accept', 'after-lookup'] as const) {
  test(`REAL child-process termination ${mode}; SIMULATED ledger recovery submits once`, { timeout: 25000 }, async () => {
    const directory = await mkdtemp(join(tmpdir(), 'recognitium-crash-test-'));
    const children: ChildProcess[] = [];
    try {
      const f = fixture();
      const requests = new Store<PrivateRequest>(join(directory, 'requests'));
      const receipts: ReceiptPort = {
        seal: async hash => ({ receiptId: 'SIMULATED-AGREEMENT', commitmentHash: hash,
          receiptWire: '{}', verificationWire: '{}', authorityCheckedAt: new Date().toISOString() }),
        verify: async (evidence, hash) => { assert.equal(evidence.commitmentHash, hash); },
      };
      const service = new LendingService(requests, {
        ledgerIndex: async () => 100,
        lookup: async () => { throw new Error('Parent must not look up or submit'); },
        submit: async () => { throw new Error('Parent must not look up or submit'); },
      }, receipts);
      const view = await service.create(f.agreement, f.document, f.salt, f.prepare);
      const id = f.agreement.requestId;
      for (const role of ['broker', 'borrower'] as const) {
        await service.approve(id, role, view.agreementHash, view.transactionDigest);
      }
      await service.receiptAgreement(id);
      await service.sign(id, f.broker, f.borrower);
      const before = (await requests.read(id))!;

      const first = worker(directory, id, mode); children.push(first.child);
      assert.deepEqual(await first.message, { type: 'checkpoint', mode });
      const interrupted = (await requests.read(id))!;
      assert.equal(interrupted.phase, mode === 'after-accept' ? 'SUBMITTED' : 'VALIDATION_UNKNOWN');
      assert.equal(interrupted.validated, undefined);
      await assert.rejects(processLock(directory), /Writer locked/);
      const lockPath = join(directory, 'writer.lock');
      const lock = JSON.parse(await readFile(lockPath, 'utf8')) as { pid: number };
      assert.equal(lock.pid, first.child.pid);
      await stop(first.child);
      const termination = await first.exited;
      assert.ok(termination.code !== 0 || termination.signal !== null);

      // The crash leaves a fail-closed lock. Only clear this test's exact lock
      // after observing this known owner's exit, as a real operator must do.
      await assert.rejects(processLock(directory), /Writer locked/);
      assert.equal(JSON.parse(await readFile(lockPath, 'utf8')).pid, first.child.pid);
      await unlink(lockPath);
      const restarted = worker(directory, id, 'recover'); children.push(restarted.child);
      assert.deepEqual(await restarted.message, { type: 'recovered', phase: 'FUNDED_WITH_EVIDENCE' });
      assert.deepEqual(await restarted.exited, { code: 0, signal: null });
      const after = (await requests.read(id))!;
      const remote = (await new Store<SimulatedRemote>(join(directory, 'simulated-remote')).read('ledger'))!;
      assert.equal(remote.simulated, true);
      assert.equal(remote.submissions, 1);
      assert.deepEqual(after.signed, before.signed);
      assert.deepEqual(after.approvals, before.approvals);
      assert.equal(after.loanId, 'C'.repeat(64));
      assert.equal(after.executionManifest!.borrowerFundingDrops, '100000000');
      assert.equal(after.checks.xrplValidation, 'validated-success');
      const release = await processLock(directory); await release();
    } finally {
      await Promise.all(children.map(stop));
      const target = resolve(directory);
      assert.ok(target.startsWith(resolve(tmpdir()) + sep) && target.includes('recognitium-crash-test-'));
      await rm(target, { recursive: true, force: true });
    }
  });
}
