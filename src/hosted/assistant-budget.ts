import {get,put} from '@vercel/blob';
import {createHash} from 'node:crypto';
/** Shared, fail-closed reservation BEFORE a paid model call. No conversation text stored. */
export async function reserveAssistantCall(sessionId:string, store: {get:typeof get;put:typeof put}={get,put}) {
  const day=new Date().toISOString().slice(0,10), hour=new Date().getUTCHours();
  const path='recognitium/assistant-budget-'+day+'.json', session=createHash('sha256').update(sessionId).digest('hex');
  for(let attempt=0;attempt<2;attempt++) {
    const current=await store.get(path,{access:'private',useCache:false,headers:{'Accept-Encoding':'identity'},abortSignal:AbortSignal.timeout(2500)});
    if(current && (!current.blob.etag||current.blob.etag.startsWith('W/')||!current.stream||(current.blob.size??Infinity)>64000)) throw Error('Assistant budget unavailable');
    const data=current?await new Response(current.stream).json() as {total:number;hours:Record<string,number>;sessions:Record<string,number>}:{total:0,hours:{},sessions:{}};
    const counts=(v:unknown)=>!!v && typeof v==='object' && !Array.isArray(v) && Object.values(v).every(n=>Number.isSafeInteger(n)&&n>=0);
    if(!data||!Number.isSafeInteger(data.total)||data.total<0||!counts(data.hours)||!counts(data.sessions)) throw Error('Assistant budget unavailable');
    if(data.total>=200||(data.hours[hour]??0)>=60||(data.sessions[session]??0)>=20) return false;
    data.total++; data.hours[hour]=(data.hours[hour]??0)+1;data.sessions[session]=(data.sessions[session]??0)+1;
    try {await store.put(path,JSON.stringify(data),{access:'private',addRandomSuffix:false,contentType:'application/json',...(current?{ifMatch:current.blob.etag}:{allowOverwrite:false}),abortSignal:AbortSignal.timeout(2500)});return true;}
    catch(error) {if(attempt===1)throw Error('Assistant budget unavailable');}
  }
  return false;
}
