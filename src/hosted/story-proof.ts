import { RecognitiumClient } from '../recognitium/client.js';
const proofs = [
 {kind:'Refusal evidence (sealed retrospectively)',receiptId:'DG-56005abb14c642df96608bafbadc955a',hash:'91abd492d59d588d83d72b96934b09ae4a25e229f672ac84613d9729e79efd65'},
 {kind:'Repayment evidence (sealed retrospectively)',receiptId:'DG-20c2a22b1d18494b8407cbb08e7da6ad',hash:'b4da674eb731724ccaa7c552e4d331366de3ffa5fc70f95ae64791d8675d1612'},
 {kind:'Withdrawal evidence (sealed retrospectively)',receiptId:'DG-12590756f43b4b1e98d821a8dfa9ad5f',hash:'2114328aa110a26d86b850c4e797d515249e5af4a62a3f2af7cd5dd5217c79b3'},
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
