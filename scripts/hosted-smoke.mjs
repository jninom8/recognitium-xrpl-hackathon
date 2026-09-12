import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
if (!process.argv.includes('--write-synthetic')) throw Error('Pass --write-synthetic to create one synthetic hosted request. No funds move.');
if (!process.env.HOSTED_BORROWER_TOKEN || !process.env.HOSTED_BROKER_TOKEN) throw Error('Load the private hosted access env file first.');
const base='https://recognitium-xrpl-hackathon.vercel.app';
const a=process.env.HOSTED_BORROWER_TOKEN,b=process.env.HOSTED_BROKER_TOKEN;
async function call(path,token,input,origin){const r=await fetch(base+path,{method:input?'POST':'GET',headers:{...(token?{Authorization:'Bearer '+token}:{}),...(input?{'Content-Type':'application/json'}:{}),...(origin?{Origin:origin}:{})},...(input?{body:JSON.stringify(input)}:{})});const data=await r.json();return {status:r.status,data};}
const input={clientRequestId:'request-'+randomUUID(),requestedDrops:'100000001',requestedDays:30,purpose:'inventory',synthetic:true};
assert.equal((await call('/api/intake',b,input)).status,401);
assert.equal((await call('/api/intake',a,input,'https://untrusted.invalid')).status,403);
assert.equal((await call('/api/setup',a,{})).status,403);
const created=await call('/api/intake',a,input);assert.equal(created.status,200,JSON.stringify(created));
const inbox=await call('/api/intake?role=broker',b);assert.equal(inbox.status,200);const r=inbox.data.requests.find(r=>r.clientRequestId===input.clientRequestId);assert.ok(r);
const reviewed=await call('/api/intake/'+r.clientRequestId+'/review',b,{expectedRevision:1,requestDigest:r.requestDigest,decision:'start-review'});assert.equal(reviewed.status,200,JSON.stringify(reviewed));
const repeats=await Promise.all([call('/api/intake',a,input),call('/api/intake',a,input)]);for(const x of repeats)assert.equal(x.status,200);
const next=await call('/api/intake?role=borrower',a);const matches=next.data.requests.filter(r=>r.clientRequestId===input.clientRequestId);assert.equal(matches.length,1);assert.equal(matches[0].status,'UNDER_REVIEW');assert.equal(matches[0].revision,2);
const summary={checkedAt:new Date().toISOString(),base,requestId:input.clientRequestId,status:matches[0].status,revision:2,instanceId:next.data.instanceId,checks:'real deployed private storage: create, reviewer read/write, requester read, concurrent duplicate retry, role/origin/native refusals',fundsMoved:false};await writeFile('.local/hosted-smoke.json',JSON.stringify(summary,null,2));console.log(summary);
