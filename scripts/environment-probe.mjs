import { Client } from 'xrpl';
import { createHash } from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
const endpoint='wss://lending-hackathon.dev.ripplex.io:51233';
const client=new Client(endpoint,{connectionTimeout:12000,timeout:15000});client.on('error',()=>{});
const startedAt=new Date().toISOString();
const half=value=>createHash('sha512').update(value).digest('hex').slice(0,64).toUpperCase();
try{
  await client.connect();
  const info=(await client.request({command:'server_info'})).result.info;
  const node=(await client.request({command:'ledger_entry',index:'7DB0788C020F02780A673DC74757F23823FA3014C1866E72CC4CD8B226CD6EF4',ledger_index:'validated'})).result.node;
  const amendments=['SingleAssetVault','LendingProtocol','LendingProtocolV1_1'].map(name=>({name,id:half(name),enabled:node.Amendments?.includes(half(name))??false}));
  let feature;
  try{feature=(await client.request({command:'feature',feature:'LendingProtocolV1_1'})).result;}catch(error){feature={error:error.data?.error??error.message};}
  const report={startedAt,endedAt:new Date().toISOString(),endpoint,serverBuild:info.build_version,networkId:info.network_id,validatedLedger:info.validated_ledger?.seq,amendments,feature};
  await mkdir('data/probes',{recursive:true});await writeFile(`data/probes/environment-${startedAt.replaceAll(/[:.]/g,'-')}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{if(client.isConnected())await client.disconnect();}
