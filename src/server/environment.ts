import{createHash}from'node:crypto';
import{TRACK1}from'../shared/contract.js';
export interface TrackEnvironment{observedAt:string;networkId:number;serverBuild:string;ledgerIndex:number;ledgerHash:string;amendments:Record<string,boolean>;canOriginate:boolean;reason:string}
export async function readTrackEnvironment():Promise<TrackEnvironment>{
 const rpc=async(method:string,params:Record<string,unknown>)=>{const r=await fetch(TRACK1.http,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({method,params:[params]}),redirect:'error',signal:AbortSignal.timeout(7000)});if(!r.ok)throw Error('Event network check unavailable');const b=await r.json() as {result:Record<string,any>};if(b.result?.status!=='success')throw Error('Event network check unavailable');return b.result;};
 const half=(x:string|Buffer)=>createHash('sha512').update(x).digest('hex').slice(0,64).toUpperCase();
 const info=(await rpc('server_info',{})).info;const ledger=info?.validated_ledger;
 if(info?.network_id!==4001||info.amendment_blocked||!Number.isSafeInteger(ledger?.seq)||!ledger.hash)throw Error('Expected validated event network 4001');
 const result=await rpc('ledger_entry',{index:half(Buffer.from([0,102])),ledger_index:ledger.seq});
 if(result.node?.LedgerEntryType!=='Amendments'||result.ledger_hash!==ledger.hash||result.ledger_index!==ledger.seq||!Array.isArray(result.node.Amendments))throw Error('Amendments do not match the validated ledger');
 const amendments=Object.fromEntries(['SingleAssetVault','LendingProtocol','LendingProtocolV1_1'].map(n=>[n,result.node.Amendments.includes(half(n))]));
 const canOriginate=amendments.SingleAssetVault===true&&amendments.LendingProtocol===true&&amendments.LendingProtocolV1_1===false;
 return{observedAt:new Date().toISOString(),networkId:info.network_id,serverBuild:info.build_version,ledgerIndex:ledger.seq,ledgerHash:ledger.hash,amendments,canOriginate,reason:canOriginate?'V1-only environment confirmed for new Track 1 loans':'New Track 1 loans blocked: final V1-only event configuration required'};
}
