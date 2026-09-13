import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';

// Read-only, author-operated check. These IDs refer to public synthetic demo runs.
const base='https://recognitium-xrpl-hackathon.vercel.app';
const checks=[];
for(const [mode,id] of [['recorded','synthetic-supplier-001'],['live','request-e0403f17-c5f4-4af5-a2a6-2b2cd3c57eeb']]) {
  const stateResponse=await fetch(base+'/api/state?mode='+mode,{signal:AbortSignal.timeout(20000)});
  assert.equal(stateResponse.status,200);
  const state=await stateResponse.json();
  const request=state.requests.find(r=>r.agreement.requestId===id);
  assert.ok(request,'Expected prepared demo request');
  const started=performance.now();
  const response=await fetch(base+'/api/requests/'+id+'/balance?mode='+mode,{signal:AbortSignal.timeout(25000)});
  assert.equal(response.status,200,'Hosted event ledger lookup must succeed');
  const observation=await response.json();
  assert.equal(observation.requestId,id);
  assert.equal(observation.account,request.agreement.accounts.borrower);
  assert.equal(observation.networkId,4001);
  assert.match(observation.balanceDrops,/^\d+$/);
  assert.ok(Number.isSafeInteger(observation.ledgerIndex));
  assert.match(observation.ledgerHash,/^[A-F0-9]{64}$/i);
  checks.push({mode,httpStatus:response.status,latencyMs:Math.round(performance.now()-started),fundingStatus:request.funding.status,loanReceivedDrops:request.funding.borrowerFundingDrops??null,observation});
}
const unknown=await fetch(base+'/api/requests/unknown-synthetic-request/balance?mode=recorded',{signal:AbortSignal.timeout(20000)});
assert.equal(unknown.status,404);
const report={schema:'recognitium.hosted-wallet-checks.v1',checkedAt:new Date().toISOString(),operator:'author-operated',scope:'Read-only hosted balance integration. Test network and synthetic accounts. No signing, issuance or transfer.',base,checks,unknownRequestStatus:unknown.status};
await writeFile('evidence/hosted-wallet-checks.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
