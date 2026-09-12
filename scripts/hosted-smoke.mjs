import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
if (!process.argv.includes('--write-synthetic')) throw Error('Pass --write-synthetic to create one synthetic hosted request. No funds move.');
const base='https://recognitium-xrpl-hackathon.vercel.app';
const a=undefined,b=undefined; // Public synthetic demo: no credentials sent.
async function call(path,token,input,origin){const r=await fetch(base+path,{method:input?'POST':'GET',headers:{...(token?{Authorization:'Bearer '+token}:{}),...(input?{'Content-Type':'application/json'}:{}),...(origin?{Origin:origin}:{})},...(input?{body:JSON.stringify(input)}:{})});const data=await r.json();return {status:r.status,data};}
const input={clientRequestId:'request-'+randomUUID(),requestedDrops:'100000001',requestedDays:30,purpose:'inventory',synthetic:true};
assert.equal((await call('/api/intake?role=invalid')).status,401);
assert.equal((await call('/api/intake',a,input,'https://untrusted.invalid')).status,403);
assert.equal((await call('/api/setup',a,{})).status,403);
const created=await call('/api/intake',a,input);assert.equal(created.status,200,JSON.stringify(created));
const inbox=await call('/api/intake?role=broker',b);assert.equal(inbox.status,200);const r=inbox.data.requests.find(r=>r.clientRequestId===input.clientRequestId);assert.ok(r);
const reviewed=await call('/api/intake/'+r.clientRequestId+'/review',b,{expectedRevision:1,requestDigest:r.requestDigest,decision:'start-review'});assert.equal(reviewed.status,200,JSON.stringify(reviewed));
const repeats=await Promise.all([call('/api/intake',a,input),call('/api/intake',a,input)]);for(const x of repeats)assert.equal(x.status,200);
const next=await call('/api/intake?role=borrower',a);const matches=next.data.requests.filter(r=>r.clientRequestId===input.clientRequestId);assert.equal(matches.length,1);assert.equal(matches[0].status,'UNDER_REVIEW');assert.equal(matches[0].revision,2);
assert.equal((await call('/api/intake',a,{...input,requestedDrops:'100000002'})).status,409);
assert.equal((await call('/api/intake/'+r.clientRequestId+'/review',b,{expectedRevision:1,requestDigest:r.requestDigest,decision:'finish-review'})).status,409);
const finished=await call('/api/intake/'+r.clientRequestId+'/review',b,{expectedRevision:2,requestDigest:r.requestDigest,decision:'finish-review'});assert.equal(finished.status,200);assert.equal(finished.data.status,'REVIEWED');assert.equal(finished.data.revision,3);
const final=await call('/api/intake?role=borrower',a);assert.equal(final.data.requests.find(x=>x.clientRequestId===r.clientRequestId).status,'REVIEWED');
const bad=await fetch(base+'/api/intake',{method:'POST',headers:{Authorization:'Bearer '+a,'Content-Type':'application/json'},body:'{'});assert.equal(bad.status,400);
const summary={checkedAt:new Date().toISOString(),base,requestId:input.clientRequestId,status:finished.data.status,revision:3,instanceId:next.data.instanceId,checks:'real deployed private storage: create, reviewer read/write, requester read, concurrent duplicate retry, role/origin/native refusals, changed-details rejection, stale-review rejection, completed review visible to requester, malformed JSON 400',fundsMoved:false};await writeFile('.local/hosted-smoke.json',JSON.stringify(summary,null,2));console.log(summary);
