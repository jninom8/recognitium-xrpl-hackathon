import { get, put } from '@vercel/blob';
import type { DashboardRequest, CycleView, BridgeProgress } from '../shared/contract.js';
export interface PublicRun extends BridgeProgress {request:DashboardRequest|null;cycle:CycleView|null;updatedAt:string}
const path='recognitium/native-progress-v1.json';
async function read() {
 const r=await get(path,{access:'private',useCache:false,headers:{'Accept-Encoding':'identity'},abortSignal:AbortSignal.timeout(8000)});
 if(!r)return {runs:[] as PublicRun[],etag:undefined as string|undefined,revision:0};
 if(!r.stream || !r.blob.etag || r.blob.etag.startsWith('W/') || (r.blob.size??Infinity)>2000000)throw Error('Native progress unavailable');
 const body=await new Response(r.stream).json() as {schema:string;runs:PublicRun[];revision:number};
 if(body.schema!=='recognitium.native-progress.v1'||!Array.isArray(body.runs)||body.runs.length>20)throw Error('Invalid native progress');
 return {...body,etag:r.blob.etag};
}
export async function readPublicRuns(){return read();}
export async function publishRun(run:PublicRun) {
 for(let attempt=0;attempt<3;attempt++) {
  const prior=await read();const runs=prior.runs.filter(r=>r.requestId!==run.requestId);
  if(runs.length>=20)throw Error('Native demo run limit reached');
  runs.unshift(run);
  try {await put(path,JSON.stringify({schema:'recognitium.native-progress.v1',revision:Math.max(Date.now(),prior.revision+1),runs}),{access:'private',addRandomSuffix:false,contentType:'application/json',...(prior.etag?{ifMatch:prior.etag}:{allowOverwrite:false}),abortSignal:AbortSignal.timeout(8000)});return;}
  catch(e){if(attempt===2)throw e;}
 }
}
