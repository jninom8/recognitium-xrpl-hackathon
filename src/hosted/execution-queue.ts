import {get,put,list} from '@vercel/blob';
export interface ExecutionJob {requestId:string;agreementHash:string;transactionDigest:string;status:'queued'|'running'|'paused'|'complete';updatedAt:string}
const prefix='recognitium/execution/';
async function read<T>(path:string):Promise<T|undefined>{const r=await get(path,{access:'private',useCache:false});if(!r?.stream)return;return await new Response(r.stream).json() as T;}
export async function runnerStatus(){const r=await read<{updatedAt:string}>(prefix+'heartbeat.json');return{connected:Boolean(r&&Date.now()-Date.parse(r.updatedAt)<45000),updatedAt:r?.updatedAt??null};}
export async function heartbeat(){await put(prefix+'heartbeat.json',JSON.stringify({updatedAt:new Date().toISOString()}),{access:'private',addRandomSuffix:false,allowOverwrite:true,contentType:'application/json'});}
export async function enqueue(job:ExecutionJob){
 const path=prefix+job.requestId+'.json';const prior=await read<ExecutionJob>(path);
 if(prior){if(prior.agreementHash!==job.agreementHash||prior.transactionDigest!==job.transactionDigest)throw Error('Queued terms differ');return prior;}
 try{await put(path,JSON.stringify(job),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json'});return job;}
 catch{const saved=await read<ExecutionJob>(path);if(saved&&saved.agreementHash===job.agreementHash&&saved.transactionDigest===job.transactionDigest)return saved;throw Error('Queue write unresolved');}
}
export async function jobs(){const entries=await list({prefix,limit:100});return(await Promise.all(entries.blobs.filter(b=>/\/request-[a-f0-9-]+\.json$/.test(b.pathname)).map(b=>read<ExecutionJob>(b.pathname)))).filter((j):j is ExecutionJob=>Boolean(j));}
export async function saveJob(job:ExecutionJob){await put(prefix+job.requestId+'.json',JSON.stringify(job),{access:'private',addRandomSuffix:false,allowOverwrite:true,contentType:'application/json'});}
