// Research demonstration: labelled mutations of copies of already-public
// synthetic evidence. No signing, lending, issuance or application HTTP calls.
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { verifyOffline } from '../dist/src/recognitium/evidence.js';
import { parseWire, RecognitiumClient } from '../dist/src/recognitium/client.js';
const path = 'evidence/synthetic-supplier-001.json';
const bytes = await readFile(path), original = JSON.parse(bytes);
const hash = b => createHash('sha256').update(b).digest('hex');
const observations = [];
const valid = verifyOffline(original);
observations.push({case:'Recorded original, offline',expected:'Content and signatures consistent; authority and ledger need online checks',actual:valid});
for (const [name, mutate, expected] of [
  ['SIMULATED changed document',b=>{b.document.base64=Buffer.from('SIMULATED replacement document').toString('base64');},/Changed document/],
  ['SIMULATED changed signed commitment',b=>{b.signedTransaction.Data='0'.repeat(64);},/Signed transaction differs/],
  ['SIMULATED inflated realised yield',b=>{b.nativeCycle.realisedYieldDrops='200000000';},/yield/],
  ['SIMULATED erased refusal history',b=>{delete b.nativeCycle.transactions.repay;},/original validated refusal/],
]) {
  const copy=structuredClone(original);mutate(copy);
  let rejection;try{verifyOffline(copy);}catch(e){rejection=e.message;}
  if(!rejection||!expected.test(rejection))throw Error('Unexpected verification result: '+name);
  observations.push({case:name,expected:'Reject',actual:rejection});
}
// A publicly recomputable chain hash must never masquerade as issuer identity.
// The altered receipt stays in memory. Online verification below transmits only
// the pre-existing public receipt ID in a read-only GET, never these fake bytes.
const altered=structuredClone(original);
const wire=parseWire(altered.agreementReceipt.receiptWire), r=wire.receipt??wire;
r.fingerprint=r.fingerprint==='0'.repeat(64)?'1'.repeat(64):'0'.repeat(64);
const time=Buffer.alloc(8);time.writeBigUInt64BE(BigInt(r.timestamp_ns));
r.new_tip=hash(Buffer.concat([Buffer.from(r.prev_tip,'hex'),Buffer.from(r.fingerprint,'hex'),Buffer.from(r.payload_hash,'hex'),time]));
altered.agreementReceipt.receiptWire=JSON.stringify(wire);
const checks=verifyOffline(altered);
if(checks.receiptAuthority!=='requires-online-lookup')throw Error('Offline authority boundary lost');
observations.push({case:'SIMULATED self-consistent altered receipt, offline',expected:'Hash consistency alone is insufficient; require authority lookup',actual:checks.receiptAuthority});
if(process.argv.includes('--online-authority')) {
  const client=new RecognitiumClient();
  await client.verify(structuredClone(original.agreementReceipt),original.agreementHash);
  let rejection;try{await client.verify(altered.agreementReceipt,original.agreementHash);}catch(e){rejection=e.message;}
  if(!rejection?.startsWith('Authority record differs:'))throw Error('No conclusive authority mismatch; transport failure is not proof');
  observations.push({case:'Same altered local receipt, compared to real authority record',expected:'Reject',actual:rejection});
}
if(hash(await readFile(path))!==hash(bytes))throw Error('Original evidence changed');
console.log(JSON.stringify({checkedAt:new Date().toISOString(),source:path,sourceSha256:hash(bytes),sourceUnchanged:true,
  method:'Author-operated checks using the repository verifier. Mutations are labelled simulations. This is not independent implementation or reproduction.',
  signingOrIssuance:false,ledgerWrites:false,applicationHttpCalls:false,authorityReads:process.argv.includes('--online-authority')?2:0,
  observations},null,2));
