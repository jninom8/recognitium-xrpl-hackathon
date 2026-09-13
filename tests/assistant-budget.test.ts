import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reserveAssistantCall} from '../src/hosted/assistant-budget.js';
type Store=NonNullable<Parameters<typeof reserveAssistantCall>[1]>;
// Simulated Blob storage: verify quota and concurrent compare-and-swap behavior.
function storage(initial?:unknown) {
  let wire=initial===undefined?undefined:JSON.stringify(initial),version=0;
  const store={
    async get(){return wire===undefined?null:{blob:{etag:String(version),size:wire.length},stream:new Response(wire).body};},
    async put(_path:string,body:string,options:{ifMatch?:string;allowOverwrite?:boolean}){
      if(wire!==undefined && options.ifMatch!==String(version))throw Error('SIMULATED conflict');
      wire=String(body);version++;return {};
    }
  } as unknown as Store;
  return {store,read:()=>wire?JSON.parse(wire):null};
}
test('assistant quota serializes concurrent reservations and stops at session limit',async()=>{
  const db=storage();
  assert.deepEqual(await Promise.all([reserveAssistantCall('same',db.store),reserveAssistantCall('same',db.store)]),[true,true]);
  for(let n=2;n<20;n++)assert.equal(await reserveAssistantCall('same',db.store),true);
  assert.equal(await reserveAssistantCall('same',db.store),false);
  assert.equal(db.read().total,20);
  assert.equal(JSON.stringify(db.read()).includes('same'),false);
});
test('assistant quota fails closed on corrupt storage and daily limit',async()=>{
  await assert.rejects(reserveAssistantCall('x',storage({total:1,hours:{0:'bad'},sessions:{}}).store),/budget unavailable/);
  assert.equal(await reserveAssistantCall('x',storage({total:200,hours:{},sessions:{}}).store),false);
});
