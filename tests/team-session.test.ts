import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { LendingService, type PrivateRequest } from '../src/requests/service.js';
import { Store } from '../src/requests/store.js';
import { fixture } from './fixtures.js';

test('two HTTP clients share exact approvals; concurrent role writes reconcile; recovery route needs no ledger', {timeout:25000}, async()=>{
  const directory=await mkdtemp(join(tmpdir(),'recognitium-team-test-'));
  const f=fixture();const requests=new Store<PrivateRequest>(join(directory,'requests'));
  const service=new LendingService(requests,{ledgerIndex:async()=>100,lookup:async()=>{throw Error('No ledger in this simulated approval test');},submit:async()=>{throw Error('No submission authorized in test');}}, {seal:async()=>{throw Error('No receipt issuance in test');},verify:async()=>{}});
  const request=await service.create(f.agreement,f.document,f.salt,f.prepare);
  const privateRecord=(await requests.read(f.agreement.requestId))!;privateRecord.mode='fixture';await requests.write(f.agreement.requestId,privateRecord);
  const port=36000+Math.floor(Math.random()*10000);const tokens={broker:'B'.repeat(32),borrower:'R'.repeat(32),operator:'O'.repeat(32)};
  const child=spawn(process.execPath,['dist/src/server/index.js'],{env:{...process.env,PORT:String(port),RECOGNITIUM_DATA_DIR:directory,RECOGNITIUM_WALLET_DIR:join(directory,'wallets'),DASHBOARD_LIVE_CHECKS:'0',TRACK1_MENTOR_OPEN_ENDED_TRIAL:'0',RECOGNITIUM_API_KEY:'',PROTOTYPE_BROKER_TOKEN:tokens.broker,PROTOTYPE_BORROWER_TOKEN:tokens.borrower,PROTOTYPE_OPERATOR_TOKEN:tokens.operator},stdio:['ignore','pipe','pipe']});
  try {
    await Promise.race([once(child.stdout!,'data'),once(child,'exit').then(()=>{throw Error('Server exited');}),new Promise((_,reject)=>{const timer=setTimeout(()=>reject(Error('Server startup timeout')),10000);timer.unref();})]);
    const base=`http://127.0.0.1:${port}`;const snapshot=async()=>{const response=await fetch(base+'/api/state');assert.equal(response.status,200);return response.json();};
    const [a,b]=await Promise.all([snapshot(),snapshot()]);assert.equal(a.instanceId,b.instanceId);assert.equal(a.revision,b.revision);
    const approve=(role:'broker'|'borrower',hash=request.agreementHash)=>fetch(base+`/api/requests/${f.agreement.requestId}/approve/${role}`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${tokens[role]}`},body:JSON.stringify({agreementHash:hash,transactionDigest:request.transactionDigest})});
    assert.equal((await approve('broker','0'.repeat(64))).status,409);
    const outcomes=await Promise.all([approve('broker'),approve('borrower')]);
    for(const [i,response] of outcomes.entries()){
      assert.ok([200,409].includes(response.status));
      if(response.status===409)assert.equal((await approve(i===0?'broker':'borrower')).status,200);
    }
    const [updated,peer]=await Promise.all([snapshot(),snapshot()]);
    assert.equal(updated.requests[0].approvals.length,2);assert.equal(updated.revision,peer.revision);assert.ok(updated.revision>a.revision);
    assert.equal(updated.requests[0].funding.status,'unfunded');assert.equal(updated.connected,false);
    assert.doesNotMatch(JSON.stringify(updated),/documentSalt|documentBase64|tx_blob|PRIVATE_/);
    const recovery=await fetch(base+`/api/requests/${f.agreement.requestId}/recover-receipt`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${tokens.operator}`},body:JSON.stringify({stage:'agreement',receiptId:'INVALID-ID',hash:request.agreementHash})});
    assert.equal(recovery.status,409);assert.equal((await recovery.json()).error,'Invalid receipt ID');
    assert.equal((await snapshot()).health.ledger.status,'unchecked','Receipt route did not start a ledger connection');
  } finally {
    if(child.exitCode===null){const exited=once(child,'exit');child.kill();await exited;}
    const target=resolve(directory);assert.ok(target.startsWith(resolve(tmpdir())+sep)&&target.includes('recognitium-team-test-'));await rm(target,{recursive:true,force:true});
  }
});
