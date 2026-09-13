import { RecognitiumClient } from '../recognitium/client.js';
const proofs = [
  {kind:'Agreement',receiptId:'DG-e2d41354140a451c855050f148b55da1',hash:'6a5a64dc5875f12176159b7b8f27d4e8212aacf509703185a7bfd2176990909f'},
  {kind:'XRPL execution',receiptId:'DG-67bd66978e854f4e8d79d21862723ee4',hash:'e157f6a6992cb0592be040819e51dc2f797727a3cabf4f948c15f92e0c588084'},
];
export async function storyProof(client = new RecognitiumClient()) {
  return {round:'request-1708833c-9d9e-4a49-9fe2-6b9284842ecc',scope:'Previously completed native loan; fresh authority checks, no new funding',
    receipts:await Promise.all(proofs.map(async p=>{
      try {const evidence=await client.recover(p.receiptId,p.hash);return {...p,verified:true,checkedAt:evidence.authorityCheckedAt};}
      catch {return {...p,verified:false,checkedAt:new Date().toISOString()};}
    }))};
}
