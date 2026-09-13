import { TRACK1, type NetworkIdentity, type WalletObservation } from '../shared/contract.js';

type Rpc = (method:string, params:Record<string,unknown>) => Promise<Record<string,any>>;
const httpRpc:Rpc = async(method,params) => {
  const response=await fetch(TRACK1.http,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({method,params:[params]}),redirect:'error',signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw Error('Event ledger balance check unavailable');
  const result=(await response.json() as {result?:Record<string,any>}).result;
  if(!result || result.status!=='success')throw Error('Event ledger balance check unavailable');
  return result;
};

/** The account is taken from a known agreement, never from an arbitrary browser address. */
export async function readBorrowerWallet(requestId:string, account:string, network:NetworkIdentity, rpc:Rpc=httpRpc):Promise<WalletObservation> {
  const info=(await rpc('server_info',{})).info;
  if(network.websocket!==TRACK1.websocket || info?.network_id!==network.networkId || network.networkId!==4001)throw Error('Event network identity mismatch');
  const ledger=info.validated_ledger;
  if(!Number.isSafeInteger(ledger?.seq) || ledger.seq<1 || !/^[A-Fa-f0-9]{64}$/.test(ledger.hash))throw Error('Validated ledger not available');
  const result=await rpc('account_info',{account,ledger_index:ledger.seq,strict:true});
  const balance=result.account_data?.Balance;
  if(result.validated!==true || result.ledger_index!==ledger.seq || result.ledger_hash!==ledger.hash || result.account_data?.Account!==account || typeof balance!=='string' || !/^\d+$/.test(balance))throw Error('Wallet observation did not match the validated ledger');
  return {requestId,account,networkId:info.network_id,serverBuild:String(info.build_version),ledgerIndex:ledger.seq,ledgerHash:ledger.hash,balanceDrops:balance,checkedAt:new Date().toISOString()};
}
