import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assistantInput,assist,assistantDraft} from '../src/server/assistant.js';
const input=()=>({role:'borrower',sessionId:'12345678-1234-4234-8234-123456789012',messages:['100.000001 test XRP for inventory for 30 days'],draft:{amount:null,days:null,purpose:null}});
test('assistant rejects authority fields, arbitrary roles and out-of-range financial drafts',()=>{
  for(const bad of [{...input(),approve:true},{...input(),role:'operator'},{...input(),messages:['x'.repeat(801)]},{...input(),draft:{amount:'1e3'}},{...input(),draft:{amount:'10000.000001'}},{...input(),draft:{days:0}},{...input(),draft:{purpose:'passport'}}])assert.throws(()=>assistantInput(bad));
  assert.deepEqual(assistantDraft({amount:'100.000001',days:30,purpose:'inventory'}),{amount:'100.000001',days:30,purpose:'inventory'});
});
test('model call is bounded and returns a draft, with no executable tool channel',async()=>{
  let calls=0;
  const result=await assist(assistantInput(input()),{key:'test-only-provider-key',transport:async(url,init)=>{
    calls++;assert.equal(url,'https://api.mistral.ai/v1/chat/completions');assert.equal(init?.redirect,'error');
    const body=JSON.parse(String(init?.body));assert.equal(body.max_tokens,450);assert.equal(body.tools,undefined);assert.equal(body.messages.some((m:{content:string})=>m.content.includes('test-only-provider-key')),false);
    return Response.json({choices:[{message:{content:JSON.stringify({reply:'Review your request.',draft:{amount:'100.000001',days:30,purpose:'inventory'}})}}]});
  }});
  assert.equal(calls,1);assert.equal(result.draft.amount,'100.000001');assert.deepEqual(Object.keys(result).sort(),['draft','reply','source']);
});
test('untrusted model authority fields and provider failures never become actions',async()=>{
  await assert.rejects(assist(assistantInput(input()),{key:'test-key',transport:async()=>Response.json({choices:[{message:{content:JSON.stringify({reply:'Approved',draft:{amount:'100',days:30,purpose:'inventory'},sign:true})}}]})}),/Invalid assistant response/);
  await assert.rejects(assist(assistantInput(input()),{key:'test-key',transport:async()=>Response.json({choices:[{message:{content:JSON.stringify({reply:'Ready',draft:{amount:'1000000',days:30,purpose:'inventory'}})}}]})}),/Invalid assistant amount/);
  await assert.rejects(assist(assistantInput(input()),{key:'test-key',transport:async()=>Response.json({error:'do not expose provider details'},{status:429})}),/^Error: Assistant unavailable$/);
});
