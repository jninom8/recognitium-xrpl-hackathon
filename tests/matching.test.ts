import{test}from'node:test';
import assert from'node:assert/strict';
import{propose,decideMatch,type Availability}from'../src/requests/matching.js';
import type{FinancingRequest}from'../src/shared/intake.js';
const now=Date.parse('2026-09-13T10:00:00Z');
const request={clientRequestId:'request-test',requestDigest:'a'.repeat(64),requestedDrops:'100000000',requestedDays:30,status:'AWAITING_REVIEW'} as FinancingRequest;
const offer:Availability={id:'offer-test',account:'test-wallet',amountDrops:'100000000',maxDays:30,expiresAt:new Date(now+60000).toISOString(),source:'local-demo',networkId:4001,synthetic:true};
const balance={requestId:request.clientRequestId,account:offer.account,networkId:4001,serverBuild:'test fixture',ledgerIndex:1,ledgerHash:'b'.repeat(64),balanceDrops:'200000000',checkedAt:new Date(now).toISOString()};
test('SIMULATED matching rejects insufficient, expired, incompatible and stale evidence',()=>{
 assert.throws(()=>propose(request,{...offer,amountDrops:'99999999'},now,balance),/Amount/);
 assert.throws(()=>propose(request,{...offer,maxDays:29},now,balance),/duration/);
 assert.throws(()=>propose(request,offer,now+60000,{...balance,checkedAt:new Date(now+60000).toISOString()}),/expired/);
 assert.throws(()=>propose(request,offer,now,{...balance,networkId:1}),/ledger balance/);
 assert.throws(()=>propose(request,offer,now,{...balance,balanceDrops:'1'}),/ledger balance/);
 assert.throws(()=>propose(request,offer,now,{...balance,checkedAt:new Date(now-61000).toISOString()}),/ledger balance/);
});
test('SIMULATED match is immutable, bilateral approval is idempotent, receipt binds both taps',()=>{
 const m=propose(request,offer,now,balance);
 assert.equal(m.id,propose(request,offer,now,balance).id);
 assert.notEqual(m.id,propose({...request,requestedDrops:'99000000'},offer,now,balance).id);
 assert.throws(()=>decideMatch(m,request,'accepted',now),/receipt/);
 decideMatch(m,request,'borrower',now);decideMatch(m,request,'borrower',now+1);
 assert.equal(m.approvals.length,1);assert.equal(m.approvalTimes.borrower,new Date(now).toISOString());
 decideMatch(m,request,'lender',now+2);assert.ok(m.sealHash);
 assert.throws(()=>decideMatch(m,request,'accepted',now+3),/receipt/);
 assert.throws(()=>decideMatch(m,{...request,requestDigest:'changed'},'accepted',now+3),/changed/);
 m.receipt={receiptId:'fixture-only',commitmentHash:m.sealHash!,authorityCheckedAt:new Date(now).toISOString()};
 decideMatch(m,request,'accepted',now+3);decideMatch(m,request,'accepted',now+4);
 assert.equal(m.decision,'accepted');assert.throws(()=>decideMatch(m,request,'declined',now+4),/final/);
});
test('SIMULATED proposal decline and expired consent cannot release funds',()=>{
 const m=propose(request,offer,now,balance);decideMatch(m,request,'declined',now);
 assert.throws(()=>decideMatch(m,request,'borrower',now),/final/);
 assert.throws(()=>decideMatch(propose(request,offer,now,balance),request,'borrower',now+60000),/expired/);
 assert.equal('funded' in m,false);
});

test('SIMULATED matched plan preserves lender capacity and requires a receipt',async()=>{
 const {matchedBridgePlan}=await import('../src/bridge/plan.js');
 const {digest}=await import('../src/shared/canonical.js');
 const input={clientRequestId:'request-131184ce-3d73-4558-bdcb-7d7347cd84a1',requestedDrops:'100000000',requestedDays:30,purpose:'inventory' as const,synthetic:true as const};
 const r={...input,requestDigest:digest(input),status:'REVIEWED',revision:3} as FinancingRequest;
 const m=propose(r,offer,now,{...balance,requestId:r.clientRequestId});
 decideMatch(m,r,'borrower',now);decideMatch(m,r,'lender',now);
 assert.throws(()=>matchedBridgePlan(r,60,m,now),/receipted/);
 m.receipt={receiptId:'fixture-only',commitmentHash:m.sealHash!,authorityCheckedAt:new Date(now).toISOString()};decideMatch(m,r,'accepted',now);
 const p=matchedBridgePlan(r,60,m,now);assert.equal(p.depositDrops,'100000000');assert.equal(p.match.availability.account,offer.account);
 assert.throws(()=>matchedBridgePlan(r,60,m,now+60000),/Current/);
});

test('saved real match receipt verifies offline against both approval taps',async()=>{
 const{readFile}=await import('node:fs/promises');const{digest}=await import('../src/shared/canonical.js');const{parseWire,checkReceiptContent}=await import('../src/recognitium/client.js');
 const evidence=JSON.parse(await readFile('evidence/matching-131184ce.json','utf8'));const m=evidence.match;
 const manifest={balance:m.balance,requestId:m.requestId,requestDigest:m.requestDigest,availability:m.availability,amountDrops:m.amountDrops,days:m.days,expiresAt:m.expiresAt};assert.equal(digest(manifest),m.id);
 assert.equal(digest({schema:'recognitium.match-approval.v1',matchId:m.id,approvalTimes:m.approvalTimes}),m.sealHash);
 const record=parseWire(evidence.receiptVerificationWire);checkReceiptContent(record.receipt as Record<string,unknown>,m.sealHash);
 assert.notEqual(digest({...manifest,amountDrops:'100000001'}),m.id);
});
