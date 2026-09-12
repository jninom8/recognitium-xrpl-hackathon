import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Dashboard, readPublishedBundle, requestView, withReadiness, action } from '../src/server/dashboard.js';
import { initialHealth, HealthMonitor } from '../src/server/health.js';
import type { PrivateRequest } from '../src/requests/service.js';
import type { NativeAdapter } from '../src/xrpl/adapter.js';
import type { RecognitiumClient } from '../src/recognitium/client.js';

test('health reports connection loss separately and blocks changed network identity', async()=>{
  let connected=true, network=4001;
  const adapter={identity:{networkId:4001,serverBuild:'SIMULATED'},client:{isConnected:()=>connected,request:async()=>({result:{info:{network_id:network,build_version:'SIMULATED',validated_ledger:{seq:123}}}})}} as unknown as NativeAdapter;
  const monitor=new HealthMonitor(adapter,{} as RecognitiumClient,true);
  await monitor.checkLedger();assert.equal(monitor.snapshot().ledger.status,'ready');
  connected=false;assert.equal(monitor.snapshot().ledger.status,'unavailable');
  connected=true;network=1;await monitor.checkLedger();assert.equal(monitor.snapshot().ledger.status,'blocked');
  const actions=withReadiness([action('submit','Submit',true,''),action('recover-receipt','Recover',true,'')],monitor.snapshot());
  assert.equal(actions[0]!.allowed,false);assert.equal(actions[1]!.allowed,true,'Receipt recovery stays independent of ledger readiness');
});

test('published real evidence is read-only, exact, shared by clients and distinct from live empty state', async () => {
  const health=initialHealth();
  const d=new Dashboard({records:async()=>({cycle:null,requests:[]}),health:()=>health,connected:()=>false,published:readPublishedBundle});
  const [a,b]=await Promise.all([d.snapshot('recorded'),d.snapshot('recorded')]);
  assert.equal(a.instanceId,b.instanceId);assert.equal(a.revision,b.revision);
  assert.equal(a.mode,'recorded');assert.equal(a.cycle?.yield?.realisedYieldDrops,'20');
  assert.equal(a.requests[0]?.funding.borrowerFundingDrops,'100000000');
  assert.equal(a.requests[0]?.approvals.length,0,'Do not invent participant approval timestamps');
  assert.ok(a.actions.every(x=>!x.allowed));assert.ok(a.requests[0]!.actions.every(x=>!x.allowed));
  const before=a.requests[0]!.transaction!.hash;
  health.ledger={status:'unavailable',checkedAt:new Date().toISOString(),message:'SIMULATED outage'};
  const next=await d.snapshot('recorded');assert.ok(next.revision>a.revision);assert.equal(next.requests[0]!.transaction!.hash,before);
  assert.equal(next.requests[0]!.funding.status,'funded');assert.equal((await d.snapshot('live')).requests.length,0);
});
test('public request projection retains funded receipt-pending state and excludes private fields', async () => {
  const bundle=await readPublishedBundle();
  const r: PrivateRequest={contractVersion:'recognitium.lending.v1',mode:'live',phase:'VALIDATED_RECEIPT_PENDING',agreement:JSON.parse(bundle.agreementBytes),agreementHash:bundle.agreementHash,transactionDigest:bundle.transactionDigest,preparedTransaction:bundle.preparedTransaction,approvals:[],checks:{contentHash:'consistent',receiptAuthority:'online-verified',xrplValidation:'validated-success'},validated:bundle.transaction,documentSalt:'PRIVATE-SALT-SENTINEL',documentBase64:'PRIVATE-CONTENT-SENTINEL',signed:{hash:bundle.transaction.hash,tx_blob:'PRIVATE-BLOB-SENTINEL'},transaction:{hash:bundle.transaction.hash,lastLedgerSequence:Number(bundle.preparedTransaction.LastLedgerSequence)},executionManifest:JSON.parse(bundle.executionBytes),agreementReceipt:bundle.agreementReceipt,receiptAttempt:'execution'};
  const result=requestView(r,true);
  assert.equal(result.funding.status,'funded');assert.equal(result.receiptRecovery.pendingStage,'execution');
  assert.equal(result.actions.find(a=>a.id==='execution-receipt')?.allowed,false);
  assert.equal(result.actions.find(a=>a.id==='recover-receipt')?.allowed,true);
  assert.doesNotMatch(JSON.stringify(result),/PRIVATE-|documentSalt|documentBase64|tx_blob|validatedEvidenceHash/);
});
