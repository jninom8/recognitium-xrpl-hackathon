import type { IncomingMessage, ServerResponse } from 'node:http';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readPublicRuns } from './runs.js';
import { HostedIntake } from './intake.js';
import { BlobIntakeDatabase } from './blob.js';
import { checkHostedOrigin } from './security.js';

const instanceId = 'hosted-' + createHash('sha256').update(process.env.VERCEL_URL ?? 'local-hosted-test').digest('hex').slice(0,24);
const reply = (res: ServerResponse, status: number, value: unknown) => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(value));
};
export function createHostedHandler(intake: HostedIntake) {
return async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  try {
    checkHostedOrigin(req.headers.origin, req.headers.host);
    const url = new URL(req.url ?? '/', 'https://hosted.invalid');
    const path = url.pathname;
    if (req.method === 'GET' && path === '/api/state') {
      const mode = url.searchParams.get('mode') === 'recorded' ? 'recorded' : 'live';
      const state = JSON.parse(await readFile(join(process.cwd(), 'hosted', mode + '.json'), 'utf8'));
      const progress = mode === 'live' ? await readPublicRuns() : undefined;
      if (progress?.runs.length) { state.requests = progress.runs.map(r=>r.request); state.cyclesByRequest = Object.fromEntries(progress.runs.map(r=>[r.request.agreement.requestId,r.cycle])); state.cycle = progress.runs[0]!.cycle; state.revision = progress.revision; }
      return reply(res, 200, { ...state, instanceId, observedAt: new Date().toISOString(), hosting: { sharedIntake: true, nativeActions: false, openDemo: true } });
    }
    if (req.method === 'GET' && path === '/api/evidence/published') {
      return reply(res, 200, JSON.parse(await readFile(join(process.cwd(), 'hosted', 'bundle.json'), 'utf8')));
    }
    const review = /^\/api\/intake\/(request-[a-f0-9-]+)\/review$/.exec(path);
    const isList = req.method === 'GET' && path === '/api/intake';
    const isWrite = req.method === 'POST' && (path === '/api/intake' || review);
    if (!isList && !isWrite) return reply(res, 403, { error: 'This hosted service supports request review and the completed example. Native wallet actions run only on the local operator backend.' });
    const role = isList ? url.searchParams.get('role') : review ? 'broker' : 'borrower';
    if (role !== 'broker' && role !== 'borrower') throw new Error('Unauthorized role');
    // Founder-authorized public synthetic demo; these roles are views, not identities.
    if (isList) return reply(res, 200, { instanceId, observedAt: new Date().toISOString(), requests: await intake.list() });
    if (req.headers['content-type'] !== 'application/json') throw new Error('application/json required');
    let input: unknown;
    // Vercel parses body lazily; malformed client JSON is not a storage outage.
    try { input = req.body; } catch { throw new Error('Invalid request body'); }
    if (input === undefined) {
      let wire = ''; for await (const chunk of req) { wire += String(chunk); if (wire.length > 16000) throw new Error('Request too large'); }
      try { input = JSON.parse(wire); } catch { throw new Error("Invalid request body"); }
    }
    if (!input || typeof input !== 'object' || Array.isArray(input) || JSON.stringify(input).length > 16000) throw new Error('Invalid request body');
    return reply(res, 200, await intake.mutate(review?.[1], input as Record<string, unknown>));
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'Unauthorized role') return reply(res,401,{error:message});
    if (message === 'Invalid request body' || message === 'application/json required') return reply(res,400,{error:message});
    if (message === 'Request too large') return reply(res,413,{error:message});
    if (message === 'Origin rejected') return reply(res,403,{error:message});
    // Do not return provider errors, store URLs, tokens or raw exceptions.
    const safe = /^(Only synthetic|A valid|Request between|Choose |This request ID|This demo workspace|Exact request|Unknown financing|Request changed|This review action|application\/json|Request too large|Invalid request body|Shared storage could)/.test(message);
    return reply(res, safe ? 409 : 503, { error: safe ? message : 'Shared request storage is temporarily unavailable. Your existing requests are retained; retry the same request.' });
  }
};
}
export default createHostedHandler(new HostedIntake(new BlobIntakeDatabase()));
