import { NativeAdapter } from '../src/xrpl/adapter.js';
import { Cycle } from '../src/xrpl/cycle.js';
const adapter=new NativeAdapter(true);adapter.client.on('error',()=>{});
try{
  await adapter.connect();const cycle=new Cycle(adapter);
  for(const role of ['broker','lender','borrower'] as const){
    try{const wallet=await cycle.wallet(role);const account=await adapter.account(wallet.address);console.log(JSON.stringify({role,address:wallet.address,balanceDrops:account.account_data.Balance,ledgerIndex:account.ledger_index}));}
    catch(error){console.log(JSON.stringify({role,error:error instanceof Error?error.message:'check failed'}));}
  }
}finally{if(adapter.client.isConnected())await adapter.disconnect();}
