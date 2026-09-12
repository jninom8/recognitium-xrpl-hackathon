/** Read-only transport diagnosis. Never used by the lending adapter.
 * No credentials, wallets, faucet calls or signed transactions. */
import { lookup } from 'node:dns/promises';
import net from 'node:net';
import tls from 'node:tls';
import { performance } from 'node:perf_hooks';
import { mkdir, writeFile } from 'node:fs/promises';
const host='lending-hackathon.dev.ripplex.io';
const startedAt=new Date().toISOString();
const addresses=await lookup(host,{all:true});
const address=addresses.find(a=>a.family===4)?.address;
function probe({port,ip,version,plain=false}) {
  return new Promise(resolve=>{
    const started=performance.now();const stages=[];let settled=false,received='';
    const options={host:ip??host,port,servername:host,rejectUnauthorized:true,...(version?{minVersion:version,maxVersion:version}:{})};
    const socket=plain?net.connect(options):tls.connect(options);
    const finish=(outcome,code)=>{
      if(settled)return;settled=true;clearTimeout(deadline);
      const result={port,address:ip??'DNS-selected',mode:plain?'plaintext HTTP diagnostic':version??'TLS default',stages,outcome,code,
        bytesRead:socket.bytesRead,bytesWritten:socket.bytesWritten,
        ...(received?{responsePreview:received.slice(0,1500)}:{}),milliseconds:Math.round(performance.now()-started)};
      socket.destroy();resolve(result);
    };
    const deadline=setTimeout(()=>finish('deadline','TIMEOUT'),12000);
    socket.on('connect',()=>{
      stages.push({stage:'TCP connected',milliseconds:Math.round(performance.now()-started)});
      if(plain){const body=JSON.stringify({method:'server_info',params:[{}]});socket.write(`POST / HTTP/1.1\r\nHost: ${host}:${port}\r\nContent-Type: application/json\r\nContent-Length: ${Buffer.byteLength(body)}\r\nConnection: close\r\n\r\n${body}`);}
    });
    socket.on('secureConnect',()=>{stages.push({stage:'TLS established',protocol:socket.getProtocol(),authorized:socket.authorized});finish('TLS succeeded',null);});
    socket.on('data',data=>{received+=data.toString('utf8');if(received.length>3000 || received.includes('\r\n\r\n'))finish('HTTP response received',null);});
    socket.on('error',error=>finish('error',error.code??error.name));
    socket.on('end',()=>finish('peer ended connection',null));
  });
}
// Run a small wave at a time to avoid loading the venue connection.
const results=[];
for(const batch of [
  [{port:51233,ip:address,version:'TLSv1.2'},{port:51234,ip:address,version:'TLSv1.2'}],
  [{port:51233,ip:address,version:'TLSv1.3'},{port:51234,ip:address,version:'TLSv1.3'}],
  [{port:51233,ip:address,plain:true},{port:51234,ip:address,plain:true}],
  addresses.filter(a=>a.family===4 && a.address!==address).slice(0,2).map(a=>({port:51233,ip:a.address})),
]) results.push(...await Promise.all(batch.map(probe)));
const report={purpose:'Read-only diagnosis; not an alternate lending configuration',startedAt,endedAt:new Date().toISOString(),host,addresses,results};
await mkdir('data/probes',{recursive:true});await writeFile(`data/probes/diagnosis-${startedAt.replaceAll(/[:.]/g,'-')}.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
