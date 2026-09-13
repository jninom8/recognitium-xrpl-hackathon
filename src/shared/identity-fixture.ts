import {randomBytes} from 'node:crypto';
import {digest} from './canonical.js';

export function identityFixture(requestId:string,wallet:string,salt=randomBytes(32).toString('hex')) {
 if(!/^[a-f0-9]{64}$/.test(salt))throw Error('Invalid fixture salt');
 const opening={schema:'recognitium.synthetic-identity.v1',synthetic:true,requestId,wallet,
  profile:{subject:'Fictional supplier',check:'DEMO ONLY - no identity verification'},salt};
 return {opening,commitment:digest(opening)};
}
export function assertIdentityBinding(reference:{commitment:string;wallet:string;synthetic:true}|undefined,document:Uint8Array,requestId:string,wallet:string){
 if(!reference)return;
 const proof=JSON.parse(Buffer.from(document).toString('utf8')).identity;
 if(reference.synthetic!==true||reference.wallet!==wallet||!proof||proof.commitment!==reference.commitment||
  digest(proof.opening)!==reference.commitment||proof.opening.requestId!==requestId||proof.opening.wallet!==wallet||
  proof.opening.synthetic!==true||proof.opening.schema!=='recognitium.synthetic-identity.v1')throw Error('Identity fixture does not match request, wallet or document');
}
export function previewIdentityFixture(){
 return {...identityFixture('synthetic-identity-preview','rE3FBuzhHU4vPQcTa5Ng2Kc1vuzEHAisf1','00'.repeat(32)),
  status:'Unsealed synthetic example. Not attached to any existing loan. Public test data and public salt only.'};
}
