import { lookup } from 'node:dns/promises';
import { mkdir, writeFile } from 'node:fs/promises';
const hostname='lending-hackathon.dev.ripplex.io';
const startedAt=new Date().toISOString();
const system=await lookup(hostname,{all:true});
const answers=await Promise.all([
  ['Google Public DNS',`https://dns.google/resolve?name=${hostname}&type=A`],
  ['Cloudflare DNS',`https://cloudflare-dns.com/dns-query?name=${hostname}&type=A`],
].map(async([provider,url])=>{
  try{const response=await fetch(url,{headers:{Accept:'application/dns-json'},signal:AbortSignal.timeout(15000)});return{provider,httpStatus:response.status,result:await response.json()};}
  catch(error){return{provider,error:error.message,code:error.cause?.code??error.name};}
}));
const report={startedAt,endedAt:new Date().toISOString(),hostname,system,answers};
await mkdir('data/probes',{recursive:true});await writeFile(`data/probes/dns-${startedAt.replaceAll(/[:.]/g,'-')}.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
