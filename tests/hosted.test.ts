import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { HostedIntake, type IntakeDatabase, type IntakeSnapshot } from '../src/hosted/intake.js';
import { createHostedHandler } from '../src/hosted/api.js';
import type { FinancingRequest } from '../src/shared/intake.js';

// Explicitly simulated remote storage; the separate deployed smoke check uses Blob.
class Database implements IntakeDatabase {
  records: FinancingRequest[] = []; version = 0; writes = 0; loseResponse = false;
  async read() { return {records:structuredClone(this.records), ...(this.version ? {etag:String(this.version)} : {})}; }
  async compareAndSwap(snapshot: IntakeSnapshot, records: FinancingRequest[]) {
    if (snapshot.etag !== (this.version ? String(this.version) : undefined)) throw Error('SIMULATED conflict');
    this.records = structuredClone(records); this.version++; this.writes++;
    if (this.loseResponse) { this.loseResponse = false; throw Error('SIMULATED response lost after commit'); }
  }
}
const example = () => ({clientRequestId:'request-'+randomUUID(),requestedDrops:'100000001',requestedDays:30,purpose:'inventory',synthetic:true});
test('hosted CAS reconciles concurrent requests and a committed write with a lost response', async () => {
  const db = new Database(), a = new HostedIntake(db), b = new HostedIntake(db);
  const first = example(), second = example();
  await Promise.all([a.mutate(undefined,first),b.mutate(undefined,second)]);
  assert.equal(db.records.length,2); assert.equal(db.writes,2);
  const third = example(); db.loseResponse = true;
  await a.mutate(undefined,third);
  assert.equal(db.records.length,3); assert.equal(db.writes,3);
  await Promise.all([a.mutate(undefined,third), b.mutate(undefined,third)]);
  assert.equal(db.writes,3);
  const r = db.records[0]!;
  const review = {expectedRevision:1,requestDigest:r.requestDigest,decision:'start-review'};
  await a.mutate(r.clientRequestId,review);
  await b.mutate(r.clientRequestId,review);
  assert.equal(db.records[0]!.revision,2);
  await assert.rejects(b.mutate(r.clientRequestId,{...review,decision:'finish-review'}),/changed/);
  assert.equal(db.records[0]!.status,'UNDER_REVIEW');
});
test('hosted HTTP roles share intake; wrong roles, origins and native actions are refused', async () => {
  const borrower = 'fixture-requester-'.padEnd(40,'R'), broker = 'fixture-reviewer-'.padEnd(40,'B');
  process.env.HOSTED_BORROWER_TOKEN = borrower; process.env.HOSTED_BROKER_TOKEN = broker;
  const db = new Database(), server = createServer(createHostedHandler(new HostedIntake(db)));
  server.listen(0,'127.0.0.1'); await once(server,'listening');
  const base = 'http://127.0.0.1:'+(server.address() as {port:number}).port;
  const call = (path:string, token?:string, input?:unknown, origin?:string) => fetch(base+path, {method:input?'POST':'GET', headers:{...(token?{Authorization:'Bearer '+token}:{}),...(input?{'Content-Type':'application/json'}:{}),...(origin?{Origin:origin}:{})},...(input?{body:JSON.stringify(input)}:{})});
  try {
    assert.equal((await call('/api/intake?role=broker')).status,401);
    assert.equal((await call('/api/intake',broker,example())).status,401);
    assert.equal((await call('/api/intake',borrower,example(),'https://untrusted.invalid')).status,403);
    assert.equal((await call('/api/setup',borrower,{})).status,403);
    assert.equal((await call('/api/requests/example/sign',broker,{})).status,403);
    const malformed = await fetch(base+'/api/intake',{method:'POST',headers:{Authorization:'Bearer '+borrower,'Content-Type':'application/json'},body:'{'});
    assert.equal(malformed.status,400);
    const created = await call('/api/intake',borrower,example()); assert.equal(created.status,200);
    const r = await created.json();
    const inbox = await (await call('/api/intake?role=broker',broker)).json();
    assert.equal(inbox.requests.length,1);
    assert.equal((await call('/api/intake/'+r.clientRequestId+'/review',broker,{expectedRevision:1,requestDigest:r.requestDigest,decision:'start-review'})).status,200);
    const next = await (await call('/api/intake?role=borrower',borrower)).json();
    assert.equal(next.requests[0].status,'UNDER_REVIEW'); assert.equal(next.instanceId,inbox.instanceId);
    assert.equal('transaction' in next.requests[0],false);
  } finally { server.closeAllConnections(); await new Promise<void>(resolve=>server.close(()=>resolve())); delete process.env.HOSTED_BORROWER_TOKEN;delete process.env.HOSTED_BROKER_TOKEN; }
});

test('private storage requests identity encoding and refuses weak write versions', async () => {
 const {BlobIntakeDatabase} = await import('../src/hosted/blob.js');
 const {get} = await import('@vercel/blob');
 const response = (weak:boolean) => ({statusCode:200 as const,headers:new Headers(),stream:new Response(JSON.stringify({schema:'recognitium.hosted-intake.v1',records:[]})).body!,blob:{url:'https://fixture.invalid',downloadUrl:'https://fixture.invalid',pathname:'fixture',contentDisposition:'',cacheControl:'',contentType:'application/json',uploadedAt:new Date(),etag:weak?'W/"version"':'"version"',size:80}});
 const db = new BlobIntakeDatabase((async (_path, options) => response(new Headers(options.headers).get('Accept-Encoding') !== 'identity')) as typeof get);
 assert.equal((await db.read()).etag,'"version"');
 const weak = new BlobIntakeDatabase((async()=>response(true)) as typeof get);
 await assert.rejects(weak.read(),/non-authoritative version/);
});
