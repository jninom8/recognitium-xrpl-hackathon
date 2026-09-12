import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {join,resolve,sep} from 'node:path';
import {tmpdir} from 'node:os';
import {Journal,type Operation} from '../src/requests/journal.js';
import {Store,processLock} from '../src/requests/store.js';
import {fixture} from './fixtures.js';
import {native} from '../src/xrpl/transactions.js';
test('repeated operation and restart reuse exactly one signature, and expired unknown history never re-signs',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'recognitium-journal-'));const f=fixture();let prepares=0,index=100;const blobs:string[]=[];
  try{
    const ledger={lookup:async()=>undefined,ledgerIndex:async()=>index,submit:async(blob:string)=>{blobs.push(blob);}};
    let journal=new Journal(new Store<Operation>(dir),ledger);
    const intent=native.deposit(f.lender.address,'A'.repeat(64),'100000000');
    const prepare=async()=>{prepares++;return {...intent,Sequence:1,Fee:'12',LastLedgerSequence:200};};
    const original=await journal.register('deposit',intent,prepare,f.lender);
    await journal.advance('deposit');
    journal=new Journal(new Store<Operation>(dir),ledger);
    const repeated=await journal.register('deposit',intent,prepare,f.lender);await journal.advance('deposit');
    assert.deepEqual(repeated.signed,original.signed);assert.equal(prepares,1);assert.equal(new Set(blobs).size,1);
    await assert.rejects(journal.register('deposit',{...intent,Fee:'20'},prepare,f.lender),/another intent/);
    index=201;assert.equal((await journal.advance('deposit')).status,'EXPIRED_UNRESOLVED');assert.equal(blobs.length,2);
    const unlock=await processLock(join(dir,'lock'));
    await assert.rejects(processLock(join(dir,'lock')),/Writer locked/);await unlock();
  }finally{if(!resolve(dir).startsWith(resolve(tmpdir())+sep))throw new Error('Unsafe cleanup');await rm(dir,{recursive:true,force:true});}
});
