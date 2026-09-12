// Read-only diagnostic. Never changes the application's chosen track/network.
import {Client} from 'xrpl';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const privateResponse=JSON.parse(await readFile('wallets/broker-faucet.private.json','utf8'));
const address=privateResponse.account.address;const startedAt=new Date().toISOString();
const results=await Promise.all([
  ['Chosen Track 1','wss://lending-hackathon.dev.ripplex.io:51233'],
  ['Track 2 diagnostic only','wss://s.devnet.rippletest.net:51233/'],
  ['Workshop Testnet diagnostic only','wss://s.altnet.rippletest.net:51233'],
].map(async([label,endpoint])=>{
  const client=new Client(endpoint,{connectionTimeout:10000,timeout:10000});client.on('error',()=>{});
  try{
    await client.connect();const info=(await client.request({command:'server_info'})).result.info;
    try{const account=(await client.request({command:'account_info',account:address,ledger_index:'validated'})).result;return{label,endpoint,networkId:info.network_id,serverBuild:info.build_version,address,found:true,balanceDrops:account.account_data.Balance,previousTransaction:account.account_data.PreviousTxnID,ledgerIndex:account.ledger_index};}
    catch(error){return{label,endpoint,networkId:info.network_id,serverBuild:info.build_version,address,found:false,error:error.data?.error??error.message};}
  }catch(error){return{label,endpoint,error:error.message};}
  finally{if(client.isConnected())await client.disconnect();}
}));
const report={startedAt,endedAt:new Date().toISOString(),results};await mkdir('data/probes',{recursive:true});await writeFile(`data/probes/faucet-network-${startedAt.replaceAll(/[:.]/g,'-')}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
