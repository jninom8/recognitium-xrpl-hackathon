import { lookup } from 'node:dns/promises';
import tls from 'node:tls';
import { performance } from 'node:perf_hooks';
import { mkdir, writeFile } from 'node:fs/promises';
const host='lending-hackathon.dev.ripplex.io';
const startedAt=new Date().toISOString();
const addresses=await lookup(host,{all:true});
const results=await Promise.all([51233,51234].map(port=>new Promise(resolve=>{
  const start=performance.now();const stages=[];let settled=false;
  const socket=tls.connect({host,port,servername:host,rejectUnauthorized:true});
  const finish=(outcome,code)=>{if(settled)return;settled=true;socket.destroy();resolve({port,stages,outcome,code,milliseconds:Math.round(performance.now()-start)});};
  socket.on('connect',()=>stages.push({stage:'TCP connected',milliseconds:Math.round(performance.now()-start)}));
  socket.on('secureConnect',()=>finish('TLS connected with valid certificate',null));
  socket.on('error',error=>finish('connection error',error.code??error.name));
  socket.setTimeout(15000,()=>finish('timeout','SOCKET_TIMEOUT'));
})));
const report={startedAt,endedAt:new Date().toISOString(),host,addresses,results};
await mkdir('data/probes',{recursive:true});await writeFile(`data/probes/transport-${startedAt.replaceAll(/[:.]/g,'-')}.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
