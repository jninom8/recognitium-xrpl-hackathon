import type {WalletObservation} from '../shared/contract.js';
import { digest } from '../shared/canonical.js';
import type { FinancingRequest } from '../shared/intake.js';
export interface Availability {
 id:string; account:string; amountDrops:string; maxDays:number; expiresAt:string;
 source:'local-demo'; networkId:4001; synthetic:true;
}
export interface MatchProposal {
 id:string; requestId:string; requestDigest:string; availability:Availability;
 balance:WalletObservation; approvalTimes:Partial<Record<'borrower'|'lender',string>>; sealHash?:string; receipt?:{receiptId:string;commitmentHash:string;authorityCheckedAt:string};
 amountDrops:string; days:number; expiresAt:string;
 decisionAt?:string; decisionHash?:string; approvals:('borrower'|'lender')[]; decision:'pending'|'accepted'|'declined';
}
export interface MarketState { offers:Availability[]; matches:MatchProposal[] }
export function propose(request:FinancingRequest, offer:Availability, now:number, balance:WalletObservation):MatchProposal {
 if(balance.account!==offer.account||balance.networkId!==4001||!Number.isFinite(Date.parse(balance.checkedAt))||now-Date.parse(balance.checkedAt)>60000||Date.parse(balance.checkedAt)>now+5000||BigInt(balance.balanceDrops)<BigInt(request.requestedDrops))throw Error('Recent matching ledger balance required');
 if(request.status==='REJECTED'||request.status==='NEEDS_REVISION')throw Error('Request is not eligible');
 if(Date.parse(offer.expiresAt)<=now)throw Error('Availability expired');
 if(BigInt(offer.amountDrops)<BigInt(request.requestedDrops)||offer.maxDays<request.requestedDays)throw Error('Amount or duration does not match');
 const manifest={balance,requestId:request.clientRequestId,requestDigest:request.requestDigest,availability:offer,amountDrops:request.requestedDrops,days:request.requestedDays,expiresAt:offer.expiresAt};
 return {...manifest,id:digest(manifest),approvals:[],approvalTimes:{},decision:'pending'};
}
export function decideMatch(match:MatchProposal, request:FinancingRequest, role:string, now:number) {
 if(request.requestDigest!==match.requestDigest || request.status==='REJECTED'||request.status==='NEEDS_REVISION')throw Error('Request changed or declined; prepare a new match');
 if(Date.parse(match.expiresAt)<=now)throw Error('Match expired');
 if(match.decision!=='pending') {if(role===match.decision)return;throw Error('Match decision is final');}
 if(role==='borrower'||role==='lender') {if(!match.approvals.includes(role)){match.approvals.push(role);match.approvalTimes[role]=new Date(now).toISOString();}
 if(match.approvals.length===2)match.sealHash=digest({schema:'recognitium.match-approval.v1',matchId:match.id,approvalTimes:match.approvalTimes});return;}
 if(role==='declined'){match.decision='declined';recordDecision(match,now);return;}
 // Accepting a proposal never authorizes signing or funding. Receipt recovery and
 // validated liquidity checks remain separate gates in the native bridge.
 if(role==='accepted'&&match.approvals.length===2&&match.receipt?.commitmentHash===match.sealHash&&Boolean(match.receipt?.authorityCheckedAt)){match.decision='accepted';recordDecision(match,now);return;}
 throw Error('Both approvals and a verified match receipt are required');
}

export function matchChecklist(m:MatchProposal,r:FinancingRequest|undefined,now=Date.now()){
 return [
 {key:'request',label:'Request unchanged',ok:Boolean(r&&r.requestDigest===m.requestDigest&&!['REJECTED','NEEDS_REVISION'].includes(r.status))},
 {key:'availability',label:'Availability has not expired',ok:Date.parse(m.expiresAt)>now},
 {key:'balance',label:'Ledger balance observed for this wallet',ok:m.balance.networkId===4001&&m.balance.account===m.availability.account&&BigInt(m.balance.balanceDrops)>=BigInt(m.amountDrops)},
 {key:'borrower',label:'Borrower approved this match',ok:m.approvals.includes('borrower')},
 {key:'lender',label:'Lender approved this match',ok:m.approvals.includes('lender')},
 {key:'receipt',label:'Recognitium match receipt verified',ok:Boolean(m.receipt?.authorityCheckedAt&&m.receipt?.commitmentHash===m.sealHash)}
 ];
}

function recordDecision(m:MatchProposal,now:number){m.decisionAt=new Date(now).toISOString();m.decisionHash=digest({schema:'recognitium.match-decision.v1',matchId:m.id,priorSealHash:m.sealHash??null,decision:m.decision,at:m.decisionAt});}
