import type {MatchProposal} from '../requests/matching.js';
import type { FinancingRequest } from '../shared/intake.js';
import { financingInput } from '../requests/intake.js';
import { digest } from '../shared/canonical.js';
export function bridgePlan(request: FinancingRequest, interval: number) {
 const input=financingInput({clientRequestId:request.clientRequestId,requestedDrops:request.requestedDrops,requestedDays:request.requestedDays,purpose:request.purpose,synthetic:request.synthetic});
 if(request.status!=='REVIEWED' || request.requestDigest!==digest(input) || !Number.isSafeInteger(request.revision)) throw Error('Reviewed, consistent request required');
 if(interval!==60 && interval!==request.requestedDays*86400) throw Error('Choose requested duration or explicit 60-second demo counter-offer');
 return {schema:'recognitium.bridge-plan.v1',request:structuredClone(request),paymentInterval:interval,depositDrops:(BigInt(request.requestedDrops)*2n).toString(),coverDrops:((BigInt(request.requestedDrops)+4n)/5n).toString()};
}
export function assertSamePlan(saved: ReturnType<typeof bridgePlan>, current: FinancingRequest) {
 if(digest(saved.request)!==digest(current)) throw Error('Intake changed since run preparation; refuse new approval or funding');
}

export function matchedBridgePlan(request:FinancingRequest,interval:number,match:MatchProposal,now=Date.now()){
 const base=bridgePlan(request,interval);
 if(match.amountDrops!==request.requestedDrops||match.days!==request.requestedDays||match.availability.networkId!==4001||match.requestId!==request.clientRequestId||match.requestDigest!==request.requestDigest||match.decision!=='accepted'||match.approvals.length!==2||!match.sealHash||match.receipt?.commitmentHash!==match.sealHash||!match.receipt.authorityCheckedAt||Date.parse(match.expiresAt)<=now)throw Error('Current accepted, receipted match required');
 return {...base,depositDrops:match.amountDrops,match:structuredClone(match)};
}
