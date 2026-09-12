import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { timingSafeEqual } from 'node:crypto';
import { join } from 'node:path';
import { type Role } from '../shared/contract.js';
import { NativeAdapter } from '../xrpl/adapter.js';
import { Cycle } from '../xrpl/cycle.js';
import { processLock, Store } from '../requests/store.js';
import { IntakeService } from '../requests/intake.js';
import type { FinancingRequest } from '../shared/intake.js';
import { Dashboard, readPublishedBundle, repositoryBundlePath } from './dashboard.js';
import { HealthMonitor } from './health.js';

const port = Number(process.env.PORT ?? 3000);
const adapter = new NativeAdapter(process.env.TRACK1_MENTOR_OPEN_ENDED_TRIAL === '1'); adapter.client.on('error', () => {});
const cycle = new Cycle(adapter, process.env.RECOGNITIUM_DATA_DIR ?? 'data', process.env.RECOGNITIUM_WALLET_DIR ?? 'wallets');
const intake = new IntakeService(new Store<FinancingRequest>(join(cycle.dataDirectory, 'intake')));
const health = new HealthMonitor(adapter, cycle.receipts, process.env.TRACK1_MENTOR_OPEN_ENDED_TRIAL === '1');
const dashboard = new Dashboard({ records: async () => ({ cycle: await cycle.cycles.read('native') ?? null, requests: await cycle.requests.all() }),
  health: () => health.snapshot(), connected: () => adapter.client.isConnected(), published: readPublishedBundle });
function checkOrigin(req: IncomingMessage): void {
  if (req.headers.origin && req.headers.origin !== `http://localhost:${port}` && req.headers.origin !== `http://127.0.0.1:${port}`) throw new Error('Origin rejected');
}
function authorize(req: IncomingMessage, role: 'operator' | Role): void {
  const expected = process.env[`PROTOTYPE_${role.toUpperCase()}_TOKEN`];
  const supplied = req.headers.authorization?.replace(/^Bearer /, '') ?? '';
  if (!expected || !/^[A-Za-z0-9_-]{24,256}$/.test(expected) || !/^[A-Za-z0-9_-]{24,256}$/.test(supplied) || supplied.length !== expected.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) throw new Error('Unauthorized role');
  const capabilities = ['broker','borrower','operator'].map(r => process.env[`PROTOTYPE_${r.toUpperCase()}_TOKEN`]).filter(Boolean);
  if (new Set(capabilities).size !== capabilities.length) throw new Error('Role capabilities must be distinct');
  checkOrigin(req);
}
async function body(req: IncomingMessage): Promise<Record<string, unknown>> {
  if (req.headers['content-type'] !== 'application/json') throw new Error('application/json required');
  let wire = ''; for await (const chunk of req) { wire += String(chunk); if (wire.length > 16000) throw new Error('Body too large'); }
  const parsed: unknown = JSON.parse(wire); if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('JSON object required');
  return parsed as Record<string, unknown>;
}
function respond(res: ServerResponse, status: number, value: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(value));
}
const server = createServer(async (req, res) => {
  try {
    const host = req.headers.host;
    if (host !== `127.0.0.1:${port}` && host !== `localhost:${port}`) return respond(res,403,{ error: 'Local host required' });
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);
    const path = url.pathname;
    if (req.method === 'GET' && (path === '/' || path === '/operator')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'" });
      return res.end(await readFile(path === '/operator' ? 'web/operator.html' : 'web/index.html'));
    }
    if (req.method === 'GET' && ['/app.js','/state-client.mjs','/style.css','/customer.js','/customer-model.mjs','/customer.css'].includes(path)) {
      res.writeHead(200, { 'Content-Type': path.endsWith('.css') ? 'text/css' : 'text/javascript', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      return res.end(await readFile('web' + path));
    }
    if (req.method === 'GET' && path === '/api/state') {
      return respond(res,200,await dashboard.snapshot(url.searchParams.get('mode') === 'recorded' ? 'recorded' : 'live'));
    }
    if (req.method === 'GET' && path === '/api/intake') {
      const role = url.searchParams.get('role');
      if (role !== 'borrower' && role !== 'broker') return respond(res,401,{ error: 'Choose a demo role' });
      authorize(req, role);
      return respond(res,200,{ instanceId: dashboard.instanceId, observedAt: new Date().toISOString(), requests: await intake.list() });
    }
    if (req.method === 'GET' && path === '/api/evidence/published') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Disposition': 'attachment; filename="synthetic-supplier-001.json"', 'Cache-Control': 'no-store' });
      return res.end(await readFile(repositoryBundlePath));
    }
    if (req.method === 'POST' && path === '/api/health/check') {
      checkOrigin(req); await body(req); await health.check();
      return respond(res,200,health.snapshot());
    }
    if (req.method === 'POST') {
      const approval = /^\/api\/requests\/([a-zA-Z0-9_-]+)\/approve\/(broker|borrower)$/.exec(path);
      const intakeReview = /^\/api\/intake\/([a-zA-Z0-9_-]+)\/review$/.exec(path);
      authorize(req, path === '/api/intake' ? 'borrower' : intakeReview ? 'broker' : approval ? approval[2] as Role : 'operator');
      const input = await body(req);
      const release = await processLock(cycle.dataDirectory);
      let result: unknown;
      try {
        if (path === '/api/intake') result = await intake.create(input);
        else if (intakeReview) result = await intake.review(intakeReview[1]!, input);
        else if (approval) {
          if (typeof input.agreementHash !== 'string' || typeof input.transactionDigest !== 'string') throw new Error('Exact hashes required');
          result = await cycle.service.approve(approval[1]!,approval[2] as Role,input.agreementHash,input.transactionDigest);
        } else {
          // Receipt recovery/verification does not require ledger connectivity.
          const needsLedger = ['/api/connect','/api/setup','/api/prepare','/api/refusal','/api/repay','/api/withdraw'].includes(path) || /\/(sign|submit)$/.test(path);
          if (needsLedger) {
            await health.checkLedger();
            if (health.snapshot().ledger.status !== 'ready') throw new Error(health.snapshot().ledger.message);
          }
          switch (path) {
            case '/api/connect': result = adapter.identity; break;
            case '/api/setup': result = await cycle.setup(); break;
            case '/api/prepare': result = await cycle.prepareRequest(); break;
            case '/api/refusal': result = await cycle.refusal(); break;
            case '/api/repay': result = await cycle.repay(); break;
            case '/api/withdraw': result = await cycle.withdraw(); break;
            default: {
              const match = /^\/api\/requests\/([a-zA-Z0-9_-]+)\/(agreement-receipt|sign|submit|execution-receipt|recover-receipt)$/.exec(path);
              if (!match) throw new Error('Unknown action');
              const id = match[1]!;
              if (match[2] === 'agreement-receipt') result = await cycle.service.receiptAgreement(id);
              if (match[2] === 'sign') result = await cycle.service.sign(id,await cycle.wallet('broker'),await cycle.wallet('borrower'));
              if (match[2] === 'submit') result = await cycle.service.advance(id);
              if (match[2] === 'execution-receipt') result = await cycle.service.receiptExecution(id);
              if (match[2] === 'recover-receipt') {
                if ((input.stage !== 'agreement' && input.stage !== 'execution') || typeof input.receiptId !== 'string' || typeof input.hash !== 'string') throw new Error('Stage, receipt ID and hash required');
                const evidence = await cycle.receipts.recover(input.receiptId,input.hash);
                result = await cycle.service.attachRecoveredReceipt(id,input.stage,evidence);
              }
            }
          }
        }
      } finally { await release(); }
      // A successful response means both the durable write and writer cleanup
      // finished. An immediate restart must not strand an acknowledged lock.
      return respond(res,200,result);
    }
    return respond(res,404,{ error: 'Not found' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    respond(res, message === 'Unauthorized role' ? 401 : 409, { error: message });
  }
});
server.listen(port,'127.0.0.1',() => console.log(`Recognitium local development app: http://127.0.0.1:${port}`));
const healthTimer = setInterval(() => { if (process.env.DASHBOARD_LIVE_CHECKS === '1') void health.check(); }, 30000); healthTimer.unref();
if (process.env.DASHBOARD_LIVE_CHECKS === '1') void health.check();
for (const signal of ['SIGINT','SIGTERM'] as const) process.on(signal, () => { clearInterval(healthTimer); server.close(); if (adapter.client.isConnected()) void adapter.disconnect(); });
