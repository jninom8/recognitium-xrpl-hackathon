import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readBorrowerWallet} from '../src/server/wallet.js';
import {TRACK1} from '../src/shared/contract.js';
const network={track:TRACK1.track,websocket:TRACK1.websocket,networkId:4001,serverBuild:'SIMULATED'};
const ledgerHash='A'.repeat(64);
test('wallet read uses one validated ledger and preserves exact drops',async()=>{
  const calls:string[]=[];
  const rpc=async(method:string,params:Record<string,unknown>)=>{
    calls.push(method);
    if(method==='server_info')return {info:{network_id:4001,build_version:'SIMULATED',validated_ledger:{seq:42,hash:ledgerHash}}};
    assert.equal(params.ledger_index,42);assert.equal(params.account,'fixture-account');
    return {validated:true,ledger_index:42,ledger_hash:ledgerHash,account_data:{Account:'fixture-account',Balance:'1000000001'}};
  };
  const result=await readBorrowerWallet('fixture-request','fixture-account',network,rpc);
  assert.equal(result.balanceDrops,'1000000001');assert.equal(result.ledgerIndex,42);assert.deepEqual(calls,['server_info','account_info']);
});
test('wrong network and unvalidated or mismatched wallet results never become a displayed balance',async()=>{
  await assert.rejects(readBorrowerWallet('r','a',network,async()=>({info:{network_id:0}})),/identity mismatch/);
  for(const change of [{validated:false},{ledger_index:43},{ledger_hash:'B'.repeat(64)},{account_data:{Account:'other',Balance:'1'}},{account_data:{Account:'a',Balance:'1.2'}}]){
    await assert.rejects(readBorrowerWallet('r','a',network,async(method)=>method==='server_info'?{info:{network_id:4001,build_version:'SIMULATED',validated_ledger:{seq:42,hash:ledgerHash}}}:{validated:true,ledger_index:42,ledger_hash:ledgerHash,account_data:{Account:'a',Balance:'100'},...change}),/did not match/);
  }
});
