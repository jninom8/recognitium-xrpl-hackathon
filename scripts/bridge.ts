import {Wallet} from 'xrpl';
import type {MatchProposal} from '../src/requests/matching.js';
import {digest} from '../src/shared/canonical.js';
import { join } from 'node:path';
import { Store, processLock } from '../src/requests/store.js';
import { bridgePlan, matchedBridgePlan, assertSamePlan } from '../src/bridge/plan.js';
import type { FinancingRequest } from '../src/shared/intake.js';
import { Cycle } from '../src/xrpl/cycle.js';
import { NativeAdapter } from '../src/xrpl/adapter.js';
import { requestView, cycleView } from '../src/server/dashboard.js';
import { publishRun } from '../src/hosted/runs.js';
const [action,id,...args]=process.argv.slice(2);
if(!id || !/^request-[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id))throw Error('Usage: bridge ACTION exact-request-UUID [arguments]');
const allowed=['prepare','view','receipt-intent','approve','recover','sign','submit','repay','withdraw','refusal','publish'];
if(!action || !allowed.includes(action))throw Error('Unsupported bridge action');
const root=join('data','runs',id), plans=new Store<ReturnType<typeof bridgePlan>&{match?:MatchProposal}>(root);
const release=await processLock(root), adapter=new NativeAdapter(true);adapter.client.on('error',()=>{});
const cycle=new Cycle(adapter,root,join('wallets','runs',id),publish);
async function current(){const r=await fetch('https://recognitium-xrpl-hackathon.vercel.app/api/intake?role=broker',{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Hosted intake unavailable');const body=await r.json() as {requests:FinancingRequest[]};const found=body.requests.find(r=>r.clientRequestId===id);if(!found)throw Error('Unknown hosted request');return found;}
async function currentMatch(){const r=await fetch('https://recognitium-xrpl-hackathon.vercel.app/api/market',{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Match service unavailable');const body=await r.json() as {matches:MatchProposal[]};return body.matches.filter(m=>m.requestId===id);}
async function publish() {
 const r=await cycle.requests.read(id!);const plan=await plans.read('plan');if(!plan)return;
 const view=r?requestView(r,true):null;if(view)view.actions=view.actions.map(a=>({...a,allowed:false,reason:'Exact human approval and native execution run on the local operator bridge.'}));
 const native=cycleView(await cycle.cycles.read('native')??null);if(native)native.requestId=id!;
 const stage=native?.yield?'WITHDRAWN':native?.steps.repay?.resultCode==='tesSUCCESS'||native?.steps['repay-late']?.resultCode==='tesSUCCESS'?'REPAID':r?.phase??'PREPARING_VAULT';
 await publishRun({requestId:id!,request:view,cycle:native,stage,requestedDrops:plan.request.requestedDrops,requestedDays:plan.request.requestedDays,offeredIntervalSeconds:plan.paymentInterval,publishedAt:new Date().toISOString(),intakeDigest:plan.request.requestDigest,intakeRevision:plan.request.revision,updatedAt:new Date().toISOString()});
}
try {
 let plan=await plans.read('plan');
 if(action==='prepare') {
  const intake=await current(), interval=Number(args[0]);
  if(plan){assertSamePlan(plan,intake);if(plan.paymentInterval!==interval)throw Error('Existing offer interval is immutable');}
  else {
   const history=await currentMatch();const matches=history.filter(m=>m.decision!=='declined');if(history.length&&!matches.length)throw Error('All matches declined; do not bypass matching through legacy preparation');if(matches.length>1)throw Error('Multiple active matches; resolve before preparation');
   plan=matches[0]?matchedBridgePlan(intake,interval,matches[0]):bridgePlan(intake,interval);
   if(plan.match){
    const sourceRun=args[1];
    if(!sourceRun||!/^request-[a-f0-9-]{36}$/.test(sourceRun)||sourceRun===id)throw Error('Matched preparation requires the existing controlled test lender source run ID');
    const source=new Store<{seed:string;fundingAttempted:boolean;balanceAfterFaucetDrops?:string}>(join('wallets','runs',sourceRun));
    const saved=await source.read('lender');if(!saved||Wallet.fromSeed(saved.seed).address!==plan.match.availability.account)throw Error('Controlled wallet does not match the approved lender');
    const prior=await cycle.wallets.read('lender');if(prior&&Wallet.fromSeed(prior.seed).address!==plan.match.availability.account)throw Error('Existing run has a different lender');
    if(!prior)await cycle.wallets.write('lender',saved);
    await cycle.receipts.recover(plan.match.receipt!.receiptId,plan.match.sealHash!);
   }
   await plans.write('plan',plan);
  }
  if(plan.match){const matches=(await currentMatch()).filter(m=>m.decision!=='declined');if(matches.length!==1||digest(matches[0])!==digest(plan.match)||Date.parse(plan.match.expiresAt)<=Date.now())throw Error('Match changed or expired before preparation');await cycle.receipts.recover(plan.match.receipt!.receiptId,plan.match.sealHash!);}
  await publish();await adapter.connect();await cycle.setup({depositDrops:plan.depositDrops,coverDrops:plan.coverDrops});
  await cycle.prepareRequest(plan.request,plan.paymentInterval,plan.match);
 } else {
  if(!plan)throw Error('Prepare this reviewed request first');
  // Never let changed public intake authorize a new approval/signature/send.
  // Recovery of an already-signed transaction remains possible after change.
  const stored=await cycle.requests.read(id);
  if(['approve','sign'].includes(action)||(action==='submit'&&stored?.phase==='SIGNED')){
   assertSamePlan(plan,await current());
   if(plan.match&&action!=='submit'){const currentMatches=(await currentMatch()).filter(m=>m.decision!=='declined');if(currentMatches.length!==1||digest(currentMatches[0])!==digest(plan.match)||Date.parse(plan.match.expiresAt)<=Date.now())throw Error('Match changed or expired before new funding');await cycle.receipts.recover(plan.match.receipt!.receiptId,plan.match.sealHash!);}
  }
  if(['sign','submit','repay','withdraw','refusal'].includes(action))await adapter.connect();
  if(action==='approve') {const [role,ah,th]=args;if((role!=='broker'&&role!=='borrower')||!ah||!th)throw Error('Exact role, agreement hash and transaction digest required');await cycle.service.approve(id,role,ah,th);}
  if(action==='receipt-intent'){const stage=args[0];if(stage!=='agreement'&&stage!=='execution')throw Error('Receipt stage required');console.log(JSON.stringify(await cycle.service.prepareExternalReceipt(id,stage)));}
  if(action==='recover'){const [stage,rid,hash]=args;if((stage!=='agreement'&&stage!=='execution')||!rid||!hash)throw Error('Stage, receipt ID and exact commitment required');await cycle.service.attachRecoveredReceipt(id,stage,await cycle.receipts.recover(rid,hash));}
  if(action==='sign')await cycle.service.sign(id,await cycle.wallet('broker'),await cycle.wallet('borrower'));
  if(action==='submit')await cycle.service.advance(id);
  if(action==='repay')await cycle.repay();
  if(action==='withdraw')await cycle.withdraw();
  if(action==='refusal')await cycle.refusal();
 }
 await publish();
 const r=await cycle.requests.read(id);if(r)console.log(JSON.stringify(requestView(r,true),null,2));
} catch(error) {
 // Publish any durable progress even if validation or receipt delivery is pending.
 try{await publish();}catch{console.error('Progress sync pending; local facts retained. Run bridge publish with the same request ID.');}
 console.error(error instanceof Error?error.message:'Bridge operation failed');process.exitCode=1;
} finally {if(adapter.client.isConnected())await adapter.disconnect();await release();}
