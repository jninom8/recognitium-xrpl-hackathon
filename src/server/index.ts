import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { timingSafeEqual } from 'node:crypto';
import { CONTRACT_VERSION, TRACK1, type AppState, type Role } from '../shared/contract.js';
import { NativeAdapter } from '../xrpl/adapter.js';
import { Cycle } from '../xrpl/cycle.js';
import { processLock } from '../requests/store.js';

const port = Number(process.env.PORT ?? 3000);
const adapter = new NativeAdapter(process.env.TRACK1_MENTOR_OPEN_ENDED_TRIAL === '1'); adapter.client.on('error', () => {});
const cycle = new Cycle(adapter);
const disclose = 'Development funds only. Recognitium is a pre-existing classical software receipt service. This application was built with AI assistance. No QCP hardware is used.';
function authorize(req: IncomingMessage, role: 'operator' | Role): void {
  const expected = process.env[`PROTOTYPE_${role.toUpperCase()}_TOKEN`];
  const supplied = req.headers.authorization?.replace(/^Bearer /, '') ?? '';
  if (!expected || !/^[A-Za-z0-9_-]{24,256}$/.test(expected) || !/^[A-Za-z0-9_-]{24,256}$/.test(supplied) || supplied.length !== expected.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) throw new Error('Unauthorized role');
  const capabilities = ['broker','borrower','operator'].map(r => process.env[`PROTOTYPE_${r.toUpperCase()}_TOKEN`]).filter(Boolean);
  if (new Set(capabilities).size !== capabilities.length) throw new Error('Role capabilities must be distinct');
  if (req.headers.origin && req.headers.origin !== `http://localhost:${port}` && req.headers.origin !== `http://127.0.0.1:${port}`) throw new Error('Origin rejected');
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
    const path = new URL(req.url ?? '/', `http://127.0.0.1:${port}`).pathname;
    if (req.method === 'GET' && path === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'" });
      return res.end(await readFile('web/index.html'));
    }
    if (req.method === 'GET' && (path === '/app.js' || path === '/style.css')) {
      res.writeHead(200, { 'Content-Type': path.endsWith('.js') ? 'text/javascript' : 'text/css', 'X-Content-Type-Options': 'nosniff' });
      return res.end(await readFile('web' + path));
    }
    if (req.method === 'GET' && path === '/api/state') {
      const state: AppState = { contractVersion: CONTRACT_VERSION, mode: 'live', network: TRACK1, connected: adapter.client.isConnected(),
        requests: (await cycle.requests.all()).map(r => cycle.service.view(r)), disclosure: disclose };
      return respond(res,200,{ ...state, cycle: await cycle.cycles.read('native') ?? null });
    }
    if (req.method === 'POST') {
      const approval = /^\/api\/requests\/([a-zA-Z0-9_-]+)\/approve\/(broker|borrower)$/.exec(path);
      authorize(req, approval ? approval[2] as Role : 'operator');
      const input = await body(req);
      const release = await processLock();
      try {
        let result: unknown;
        if (approval) {
          if (typeof input.agreementHash !== 'string' || typeof input.transactionDigest !== 'string') throw new Error('Exact hashes required');
          result = await cycle.service.approve(approval[1]!,approval[2] as Role,input.agreementHash,input.transactionDigest);
        } else {
          if (!adapter.client.isConnected() || !adapter.identity) await adapter.connect();
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
        return respond(res,200,result);
      } finally { await release(); }
    }
    return respond(res,404,{ error: 'Not found' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    respond(res, message === 'Unauthorized role' ? 401 : 409, { error: message });
  }
});
server.listen(port,'127.0.0.1',() => console.log(`Recognitium local development app: http://127.0.0.1:${port}`));
for (const signal of ['SIGINT','SIGTERM'] as const) process.on(signal, () => { server.close(); if (adapter.client.isConnected()) void adapter.disconnect(); });
