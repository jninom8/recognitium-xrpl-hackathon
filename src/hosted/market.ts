import {readBorrowerWallet} from '../server/wallet.js';
import {TRACK1} from '../shared/contract.js';
import {RecognitiumClient} from '../recognitium/client.js';
import {get,put} from '@vercel/blob';
// Syntax screening only; account_info must later confirm this exact address on the validated event ledger.
const classicAddressShape=(value:string)=>/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(value);
import {propose,decideMatch,type MarketState,type Availability} from '../requests/matching.js';
import {digest} from '../shared/canonical.js';
import type {FinancingRequest} from '../shared/intake.js';
const path='recognitium/market-v1.json';
export async function market(command:Record<string,unknown>|undefined, requests:FinancingRequest[]) {
 for(let attempt=0;attempt<3;attempt++){
  const blob=await get(path,{access:'private',useCache:false,headers:{'Accept-Encoding':'identity'},abortSignal:AbortSignal.timeout(5000)});
  if(blob&&(!blob.stream||!blob.blob.etag||blob.blob.etag.startsWith('W/')||blob.blob.size>256000))throw Error('Market storage unavailable');
  const state:MarketState=blob?await new Response(blob.stream).json():{offers:[],matches:[]};
  if(!Array.isArray(state.offers)||!Array.isArray(state.matches)||state.offers.length>100||state.matches.length>200)throw Error('Market storage invalid');
  if(!command)return state;
  const now=Date.now();
  if(command.action==='offer'){
   const {account,amountDrops,maxDays,expiresAt}=command;
   if(typeof account!=='string'||!classicAddressShape(account)||typeof amountDrops!=='string'||!/^\d{1,11}$/.test(amountDrops)||BigInt(amountDrops)<1000000n||BigInt(amountDrops)>10000000000n||!Number.isSafeInteger(maxDays)||Number(maxDays)<1||Number(maxDays)>90||typeof expiresAt!=='string'||!Number.isFinite(Date.parse(expiresAt))||Date.parse(expiresAt)<=now||Date.parse(expiresAt)>now+86400000||command.confirm!==true)throw Error('Confirm a test wallet, 1–10000 XRP, 1–90 days and expiry within 24 hours');
   const fields={account,amountDrops,maxDays:Number(maxDays),expiresAt,source:'local-demo' as const,networkId:4001 as const,synthetic:true as const};
   const offer:Availability={...fields,id:digest(fields)};
   if(!state.offers.some(o=>o.id===offer.id)){if(state.offers.some(o=>o.account===offer.account&&Date.parse(o.expiresAt)>now))throw Error('This wallet already has active availability; keep its existing proposal');if(state.offers.length>=100)throw Error('Demo availability limit reached');state.offers.push(offer);}
  }else if(command.action==='match'){
   const request=requests.find(r=>r.clientRequestId===command.requestId);
   const offer=state.offers.find(o=>o.id===command.offerId);
   if(!request||!offer)throw Error('Choose an existing request and availability');
   const prior=state.matches.find(m=>m.requestId===request.clientRequestId&&m.requestDigest===request.requestDigest&&m.availability.id===offer.id&&m.decision!=='declined'&&Date.parse(m.expiresAt)>now);
   if(prior)return state;
   const balance=await readBorrowerWallet(request.clientRequestId,offer.account,{track:TRACK1.track,websocket:TRACK1.websocket,networkId:4001,serverBuild:''});
   const match=propose(request,offer,Date.now(),balance);
   if(!state.matches.some(m=>m.id===match.id)){
    // One pending or accepted proposal per availability prevents double allocation
    // inside this demo. It does not lock funds on XRPL.
    if(state.matches.some(m=>(m.availability.id===offer.id||m.requestId===request.clientRequestId)&&m.decision!=='declined'&&Date.parse(m.expiresAt)>now))throw Error('This availability already has an active proposal');
    if(state.matches.length>=200)throw Error('Demo match limit reached');
    state.matches.push(match);
   }
  }else if(command.action==='receipt'){
   const match=state.matches.find(m=>m.id===command.matchId);
   const request=requests.find(r=>r.clientRequestId===match?.requestId);
   if(!match?.sealHash||!request||request.requestDigest!==match.requestDigest||match.decision!=='pending'||Date.parse(match.expiresAt)<=now||typeof command.receiptId!=='string')throw Error('Current approved match required');
   if(match.receipt){if(match.receipt.receiptId!==command.receiptId)throw Error('Match receipt is immutable');return state;}
   const client=new RecognitiumClient(undefined,(url,options)=>fetch(url,{...options,signal:AbortSignal.timeout(6000)}));
   const proof=await client.recover(command.receiptId,match.sealHash);
   match.receipt={receiptId:proof.receiptId,commitmentHash:proof.commitmentHash,authorityCheckedAt:proof.authorityCheckedAt};
  }else if(command.action==='decision'){
   const match=state.matches.find(m=>m.id===command.matchId);
   const request=requests.find(r=>r.clientRequestId===match?.requestId);
   if(!match||!request)throw Error('Match not found');
   decideMatch(match,request,String(command.decision),now);
  }else throw Error('Unknown market action');
  try{await put(path,JSON.stringify(state),{access:'private',addRandomSuffix:false,contentType:'application/json',...(blob?{ifMatch:blob.blob.etag}:{allowOverwrite:false}),abortSignal:AbortSignal.timeout(5000)});return state;}
  catch{if(attempt===2)throw Error('Market save unconfirmed. Refresh before retrying.');}
 }
 throw Error('Market unavailable');
}
