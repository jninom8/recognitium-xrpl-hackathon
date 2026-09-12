// Read-only compatibility check; never creates wallets or submits transactions.
// Install the candidate in ignored .local/sdk-beta-check as documented in SDK_UPDATE.md.
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const stableRequire=createRequire(import.meta.url);
const betaRequire=createRequire(resolve('.local/sdk-beta-check/package.json'));
const bundle=JSON.parse(await readFile('evidence/synthetic-supplier-001.json','utf8'));
const results=[];
for(const load of [stableRequire,betaRequire]) {
  const sdk=load('xrpl'),codec=load('ripple-binary-codec'),keys=load('ripple-keypairs');
  const tx=bundle.signedTransaction;
  sdk.validate(tx);
  assert.equal(sdk.hashes.hashSignedTx(sdk.encode(tx)),bundle.transaction.hash);
  assert.equal(keys.verify(codec.encodeForSigning(tx),tx.TxnSignature,tx.SigningPubKey),true);
  assert.equal(keys.verify(codec.encodeForSigningCounterparty(tx),tx.CounterpartySignature.TxnSignature,tx.CounterpartySignature.SigningPubKey),true);
  const changed={...tx,Data:'00'.repeat(32)};
  assert.equal(keys.verify(codec.encodeForSigning(changed),tx.TxnSignature,tx.SigningPubKey),false);
  assert.equal(keys.verify(codec.encodeForSigningCounterparty(changed),tx.CounterpartySignature.TxnSignature,tx.CounterpartySignature.SigningPubKey),false);
  for(const result of Object.values(bundle.nativeCycle.transactions)) {
    sdk.validate(result.tx);
    assert.equal(sdk.hashes.hashSignedTx(sdk.encode(result.tx)),result.hash);
  }
  results.push({sdk:load('xrpl/package.json').version,codec:load('ripple-binary-codec/package.json').version,
    recordedLoanHashMatches:true,bothSignaturesValid:true,changedDataRejectsBoth:true,
    nativeTransactionsChecked:Object.keys(bundle.nativeCycle.transactions).length});
}
const report={observedAt:new Date().toISOString(),scope:'Offline replay of recorded synthetic live cycle; no new ledger activity',results};
await mkdir('data/sdk-checks',{recursive:true});
await writeFile('data/sdk-checks/beta-1.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
