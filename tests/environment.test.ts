import{test}from'node:test';import assert from'node:assert/strict';import{createHash}from'node:crypto';
import{readTrackEnvironment}from'../src/server/environment.js';import{NativeAdapter}from'../src/xrpl/adapter.js';import{TRACK1}from'../src/shared/contract.js';
test('SIMULATED mentor event trial allows V1.1 but rejects wrong network, missing amendments and inconsistent ledger',async()=>{
 const original=globalThis.fetch;let v11=true,network=4001,missing=false,badHash=false;const hash='A'.repeat(64),half=(n:string)=>createHash('sha512').update(n).digest('hex').slice(0,64).toUpperCase();
 globalThis.fetch=async(_url,init)=>{const {method}=JSON.parse(String(init?.body));return new Response(JSON.stringify({result:method==='server_info'?{status:'success',info:{network_id:network,build_version:'fixture',validated_ledger:{seq:42,hash}}}:{status:'success',ledger_index:42,ledger_hash:badHash?'B'.repeat(64):hash,node:{LedgerEntryType:'Amendments',Amendments:[...(missing?[]:['SingleAssetVault','LendingProtocol']),...(v11?['LendingProtocolV1_1']:[])].map(half)}}}));};
 try{
  assert.equal((await readTrackEnvironment()).canOriginate,true);
  assert.equal((await readTrackEnvironment()).compatibilityMode,'mentor-event-trial');
  const adapter=new NativeAdapter();adapter.identity={track:TRACK1.track,websocket:TRACK1.websocket,networkId:4001,serverBuild:'fixture'};await adapter.assertCanOriginate();
  missing=true;assert.equal((await readTrackEnvironment()).canOriginate,false);await assert.rejects(()=>adapter.assertCanOriginate(),/missing/);missing=false;
  network=0;await assert.rejects(()=>readTrackEnvironment(),/4001/);network=4001;
  badHash=true;await assert.rejects(()=>readTrackEnvironment(),/match/);badHash=false;
  v11=false;assert.equal((await readTrackEnvironment()).compatibilityMode,'v1');await adapter.assertCanOriginate();
 }finally{globalThis.fetch=original;}
});
