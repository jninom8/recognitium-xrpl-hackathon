import {matchChecklist} from '../requests/matching.js';
import { market } from './market.js';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readPublicRuns } from './runs.js';
import { HostedIntake } from './intake.js';
import { BlobIntakeDatabase } from './blob.js';
import { checkHostedOrigin } from './security.js';
import { readBorrowerWallet } from '../server/wallet.js';
import type { Agreement } from '../shared/contract.js';
import { assist, assistantInput } from '../server/assistant.js';
import { reserveAssistantCall } from './assistant-budget.js';

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
    if(path==='/api/market' && (req.method==='GET'||req.method==='POST')) {
      let command:Record<string,unknown>|undefined;
      if(req.method==='POST'){
        if(req.headers['content-type']!=='application/json')return reply(res,400,{error:'application/json required'});
        try {let raw=req.body;if(raw===undefined){let wire='';for await(const chunk of req){wire+=String(chunk);if(wire.length>3000)throw Error();}raw=JSON.parse(wire);}
          if(!raw||typeof raw!=='object'||Array.isArray(raw)||JSON.stringify(raw).length>3000)throw Error();command=raw as Record<string,unknown>;
        }catch{return reply(res,400,{error:'Invalid market request'});}
      }
      try{
        const all=await intake.list();
        const runs=await readPublicRuns();
        const eligible=all.filter(r=>!runs.runs.some(run=>run.requestId===r.clientRequestId));
        if(command?.action==='match'&&!eligible.some(r=>r.clientRequestId===command!.requestId))throw Error('This request already has a native run; create a new request for matching');
        const result=await market(command,all);
        if(command?.action==='decision'&&command.decision==='accepted'){
          const match=result.matches.find(m=>m.id===command!.matchId);
          let request=(await intake.list()).find(r=>r.clientRequestId===match?.requestId);
          if(!match||!request||request.requestDigest!==match.requestDigest)throw Error('Request changed during review');
          if(request.status==='AWAITING_REVIEW')request=await intake.mutate(request.clientRequestId,{expectedRevision:request.revision,requestDigest:request.requestDigest,decision:'start-review'});
          if(request.status==='UNDER_REVIEW')request=await intake.mutate(request.clientRequestId,{expectedRevision:request.revision,requestDigest:request.requestDigest,decision:'finish-review'});
          if(request.status!=='REVIEWED')throw Error('Match saved but intake not accepted; operator must reconcile');
        }
        return reply(res,200,{...result,eligibleRequests:eligible,checks:Object.fromEntries(result.matches.map(m=>[m.id,matchChecklist(m,all.find(r=>r.clientRequestId===m.requestId))])),progress:Object.fromEntries(runs.runs.map(r=>[r.requestId,{funded:r.request?.funding.status==='funded',repaid:r.cycle?.steps.repay?.resultCode==='tesSUCCESS'||r.cycle?.steps['repay-late']?.resultCode==='tesSUCCESS',withdrawn:Boolean(r.cycle?.yield)}]))});
      }
      catch(error){return reply(res,409,{error:error instanceof Error?error.message:'Market unavailable'});}
    }
    if(req.method==='POST' && path==='/api/assistant') {
      if(req.headers['content-type']!=='application/json')return reply(res,400,{error:'application/json required'});
      let input;
      try {
        let raw=req.body;
        if(raw===undefined){let wire='';for await(const chunk of req){wire+=String(chunk);if(wire.length>12000)throw Error();}raw=JSON.parse(wire);}
        if(JSON.stringify(raw).length>12000)throw Error();
        input=assistantInput(raw);
      } catch {return reply(res,400,{error:'Invalid assistant request'});}
      try {
        if(!process.env.MISTRAL_API_KEY)return reply(res,503,{error:'AI is unavailable. Use the guided form.'});
        if(!await reserveAssistantCall(input.sessionId))return reply(res,429,{error:'Demo AI limit reached. Use the guided form.'});
        return reply(res,200,await assist(input));
      } catch {return reply(res,503,{error:'AI is unavailable. Your saved request is unchanged. Use the guided form.'});}
    }
    const balanceMatch=/^\/api\/requests\/([a-zA-Z0-9_-]+)\/balance$/.exec(path);
    if(req.method==='GET' && balanceMatch) {
      const id=balanceMatch[1]!;
      let agreement:Agreement|undefined;
      if(url.searchParams.get('mode')==='recorded') {
        const bundle=JSON.parse(await readFile(join(process.cwd(),'hosted','bundle.json'),'utf8'));
        const candidate=JSON.parse(bundle.agreementBytes) as Agreement;
        if(candidate.requestId===id)agreement=candidate;
      } else agreement=(await readPublicRuns()).runs.find(r=>r.requestId===id)?.request?.agreement;
      if(!agreement)return reply(res,404,{error:'No prepared borrower account for this request'});
      try{return reply(res,200,await readBorrowerWallet(id,agreement.accounts.borrower,agreement.network));}
      catch{return reply(res,503,{error:'The event ledger balance could not be confirmed. Keep the last observation and try again.'});}
    }
    if (req.method === 'GET' && path === '/api/state') {
      const mode = url.searchParams.get('mode') === 'recorded' ? 'recorded' : 'live';
      const state = JSON.parse(await readFile(join(process.cwd(), 'hosted', mode + '.json'), 'utf8'));
      const progress = mode === 'live' ? await readPublicRuns() : undefined;
      if (progress?.runs.length) {
        state.requests = progress.runs.flatMap(r=>r.request?[r.request]:[]);
        state.cyclesByRequest = Object.fromEntries(progress.runs.map(r=>[r.requestId,r.cycle]));
        state.bridgeByRequest = Object.fromEntries(progress.runs.map(({request,cycle,updatedAt,...p})=>[p.requestId,p]));
        state.cycle = progress.runs[0]!.cycle; state.revision = progress.revision;
      }
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
