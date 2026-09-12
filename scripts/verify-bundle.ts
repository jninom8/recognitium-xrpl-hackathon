import { readFile } from 'node:fs/promises';
import { verifyOffline, assertFreshTransaction, type Bundle } from '../src/recognitium/evidence.js';
import type { Agreement } from '../src/shared/contract.js';
import { RecognitiumClient } from '../src/recognitium/client.js';
import { NativeAdapter } from '../src/xrpl/adapter.js';
const path = process.argv[2]; if (!path) throw new Error('Provide bundle path; add --online for fresh checks');
const bundle = JSON.parse(await readFile(path,'utf8')) as Bundle;
const checks: Record<string,string> = {...verifyOffline(bundle)};
if (process.argv.includes('--online')) {
  const receipts = new RecognitiumClient();
  await receipts.verify(bundle.agreementReceipt,bundle.agreementHash);
  await receipts.verify(bundle.executionReceipt,bundle.executionReceipt.commitmentHash);
  checks.receiptAuthority = 'online-authority-record-verified';
  const adapter = new NativeAdapter(process.argv.includes('--mentor-confirmed-open-ended')); adapter.client.on('error',()=>{});
  try {
    const network = await adapter.connect();
    const agreement = JSON.parse(bundle.agreementBytes) as Agreement;
    if (network.networkId !== agreement.network.networkId) throw new Error('Fresh XRPL network differs from agreement');
    const fresh = await adapter.lookup(bundle.transaction.hash);
    assertFreshTransaction(bundle.transaction, fresh, network.networkId);
    checks.xrplValidation = 'validated-success';
    for(const saved of Object.values(bundle.nativeCycle?.transactions ?? {})) {
      const actual=await adapter.lookup(saved.hash);
      assertFreshTransaction(saved, actual, network.networkId);
    }
  } finally { if(adapter.client.isConnected()) await adapter.disconnect(); }
}
console.log(JSON.stringify(checks,null,2));
