import tls from 'node:tls';
import { mkdir,writeFile } from 'node:fs/promises';
const host='lending-hackathon.dev.ripplex.io';
const startedAt=new Date().toISOString();
let certificate;
const result=await new Promise(resolve=>{
  const socket=tls.connect({host,port:443,servername:host,rejectUnauthorized:true,
    checkServerIdentity(name,cert){
      certificate={commonName:cert.subject?.CN,subjectAltName:cert.subjectaltname,validFrom:cert.valid_from,validTo:cert.valid_to,issuerCommonName:cert.issuer?.CN};
      return tls.checkServerIdentity(name,cert); // Preserve normal hostname verification.
    }});
  const timer=setTimeout(()=>{socket.destroy();resolve({ok:false,code:'TIMEOUT'});},12000);
  socket.on('secureConnect',()=>{clearTimeout(timer);socket.destroy();resolve({ok:true,protocol:socket.getProtocol()});});
  socket.on('error',error=>{clearTimeout(timer);resolve({ok:false,code:error.code,reason:error.reason??error.message});});
});
const report={startedAt,endedAt:new Date().toISOString(),purpose:'HTTPS 443 diagnostic only; not the event RPC port',host,result,certificate};
await mkdir('data/probes',{recursive:true});await writeFile(`data/probes/certificate-${startedAt.replaceAll(/[:.]/g,'-')}.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
