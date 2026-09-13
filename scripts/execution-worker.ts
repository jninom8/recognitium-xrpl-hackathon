import {spawn} from 'node:child_process';
import {heartbeat,jobs,saveJob} from '../src/hosted/execution-queue.js';
import {processLock} from '../src/requests/store.js';
const release=await processLock('data/execution-worker');
let stopping=false;
for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,()=>{stopping=true;});
function step(id:string,agreement:string,transaction:string){return new Promise<{ok:boolean;complete:boolean}>((resolve)=>{
 const child=spawn(process.execPath,['--env-file-if-exists=.env','dist/scripts/bridge.js','automatic',id,agreement,transaction],{stdio:['ignore','pipe','pipe'],windowsHide:true});
 let complete=false;child.stdout.on('data',data=>{if(String(data).includes('AUTOMATIC_STAGE COMPLETE'))complete=true;});child.stderr.on('data',()=>{});
 child.on('error',()=>resolve({ok:false,complete:false}));child.on('close',code=>resolve({ok:code===0,complete}));
});}
const beat=setInterval(()=>{void heartbeat().catch(()=>{});},10000);
try{
 await heartbeat();console.log('Execution runner connected. Test funds only; exact local approvals remain required.');
 while(!stopping){
  try{for(const job of await jobs()){
   if(!['queued','running'].includes(job.status))continue;
   if(!/^request-[a-f0-9-]{36}$/.test(job.requestId)||!/^[a-f0-9]{64}$/.test(job.agreementHash)||!/^[a-f0-9]{64}$/.test(job.transactionDigest))continue;
   const result=await step(job.requestId,job.agreementHash,job.transactionDigest);
   await saveJob({...job,status:!result.ok?'paused':result.complete?'complete':'running',updatedAt:new Date().toISOString()});
  }}catch{console.error('Queue unavailable; durable local progress retained.');}
  if(!stopping)await new Promise(r=>setTimeout(r,5000));
 }
}finally{clearInterval(beat);await release();}
