import {mkdir,open,access} from 'node:fs/promises';
import {Cycle} from '../src/xrpl/cycle.js';
import {NativeAdapter} from '../src/xrpl/adapter.js';
import {TRACK1} from '../src/shared/contract.js';
const adapter=new NativeAdapter(true);adapter.client.on('error',()=>{});
try{await access('wallets/faucet-diagnostic.private.json');throw new Error('Diagnostic response already exists; do not issue another faucet request');}
catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
try{
  await adapter.connect();const cycle=new Cycle(adapter);const wallet=await cycle.wallet('broker');
  try{await adapter.account(wallet.address);throw new Error('Destination already funded; no diagnostic funding needed');}
  catch(error){if((error as {data?:{error?:string}}).data?.error!=='actNotFound')throw error;}
  const response=await fetch(TRACK1.faucet,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({destination:wallet.address,xrpAmount:'1000',userAgent:'Recognitium event integration diagnostic'}),signal:AbortSignal.timeout(20000),redirect:'error'});
  const wire=await response.text();await mkdir('wallets',{recursive:true});
  const file=await open('wallets/faucet-diagnostic.private.json','wx',0o600);
  try{await file.writeFile(wire);await file.sync();}finally{await file.close();}
  const parsed=JSON.parse(wire) as Record<string,unknown>;const account=parsed.account as Record<string,unknown>|undefined;
  console.log(JSON.stringify({httpStatus:response.status,topLevelKeys:Object.keys(parsed),accountKeys:account?Object.keys(account):[],destination:wallet.address,returnedAddress:account?.classicAddress??account?.address??null,privateResponseSaved:true,observedAt:new Date().toISOString()}));
}finally{if(adapter.client.isConnected())await adapter.disconnect();}
