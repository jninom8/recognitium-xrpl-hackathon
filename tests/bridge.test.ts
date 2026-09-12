import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bridgePlan,assertSamePlan} from '../src/bridge/plan.js';
import {IntakeService} from '../src/requests/intake.js';
import type {FinancingRequest} from '../src/shared/intake.js';
import {randomUUID} from 'node:crypto';
test('bridge preserves amount and duration, requires review, and rejects changes after binding', async()=>{
 let value:FinancingRequest|undefined;
 const service=new IntakeService({read:async()=>value,all:async()=>value?[value]:[],write:async(_id,v)=>{value=structuredClone(v);}});
 const input={clientRequestId:'request-'+randomUUID(),requestedDrops:'600000001',requestedDays:60,purpose:'inventory',synthetic:true};
 let r=await service.create(input);assert.throws(()=>bridgePlan(r,60),/Reviewed/);
 r=await service.review(r.clientRequestId,{expectedRevision:1,requestDigest:r.requestDigest,decision:'start-review'});
 r=await service.review(r.clientRequestId,{expectedRevision:2,requestDigest:r.requestDigest,decision:'finish-review'});
 const p=bridgePlan(r,60);assert.equal(p.request.requestedDays,60);assert.equal(p.paymentInterval,60);assert.equal(p.depositDrops,'1200000002');assert.equal(p.coverDrops,'120000001');
 assert.equal(bridgePlan(r,60*86400).paymentInterval,5184000);
 assert.throws(()=>bridgePlan({...r,requestedDrops:'600000002'},60),/consistent/);
 assert.throws(()=>bridgePlan(r,61),/Choose/);
 assertSamePlan(p,structuredClone(r));
 assert.throws(()=>assertSamePlan(p,{...r,revision:4}),/changed/);
 assert.throws(()=>assertSamePlan(p,{...r,clientRequestId:'request-'+randomUUID()}),/changed/);
});

test('SIMULATED ledger preparation binds intake and resumes the same offer after restart',async()=>{
 const {mkdtemp}=await import('node:fs/promises');const {tmpdir}=await import('node:os');const {join}=await import('node:path');
 const {Cycle}=await import('../src/xrpl/cycle.js');const {fixture}=await import('./fixtures.js');const {digest}=await import('../src/shared/canonical.js');
 const f=fixture(), dir=await mkdtemp(join(tmpdir(),'recognitium-bridge-'));let prepares=0;
 const adapter={identity:f.agreement.network,prepareLoan:async(tx:Parameters<typeof f.prepare>[0])=>{prepares++;return f.prepare(tx);},ledgerIndex:async()=>100} as unknown as import('../src/xrpl/adapter.js').NativeAdapter;
 const input={clientRequestId:'request-'+randomUUID(),requestedDrops:'600000001',requestedDays:60,purpose:'inventory' as const,synthetic:true as const};
 const r={...input,schema:'recognitium.intake.v1' as const,status:'REVIEWED' as const,revision:3,requestDigest:digest(input),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),history:[]};
 const first=new Cycle(adapter,dir,join(dir,'wallets'));await first.cycles.write('native',{schema:'recognitium.native-cycle.v1',network:f.agreement.network,accounts:f.agreement.accounts,vaultId:f.agreement.vaultId,loanBrokerId:f.agreement.loanBrokerId,depositDrops:'1200000002',coverDrops:'120000001',steps:{}});
 await first.prepareRequest(r,60);const saved=(await first.requests.read(r.clientRequestId))!;
 assert.equal(saved.agreement.terms.principalDrops,input.requestedDrops);assert.equal(saved.agreement.requestId,input.clientRequestId);assert.equal(saved.approvals.length,0);assert.equal(saved.signed,undefined);
 const second=new Cycle(adapter,dir,join(dir,'wallets'));await second.prepareRequest(r,60);assert.equal(prepares,1);assert.equal((await second.requests.read(r.clientRequestId))!.transactionDigest,saved.transactionDigest);
 await assert.rejects(second.prepareRequest({...r,requestedDays:30},60),/differs/);
});
