import { readFile } from 'node:fs/promises';
import { canonical } from '../src/requests/commitment.js';
import { verifyOffline, type Bundle } from '../src/recognitium/evidence.js';
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
    await adapter.connect();
    const fresh = await adapter.lookup(bundle.transaction.hash);
    if (!fresh || fresh.resultCode !== 'tesSUCCESS' || fresh.ledgerIndex !== bundle.transaction.ledgerIndex || canonical(fresh.tx) !== canonical(bundle.transaction.tx) || canonical(fresh.meta) !== canonical(bundle.transaction.meta)) throw new Error('Fresh XRPL evidence mismatch or unavailable');
    checks.xrplValidation = 'validated-success';
    for(const saved of Object.values(bundle.nativeCycle?.transactions ?? {})) {
      const actual=await adapter.lookup(saved.hash);
      if(!actual || actual.resultCode !== saved.resultCode || actual.ledgerIndex !== saved.ledgerIndex || canonical(actual.tx) !== canonical(saved.tx) || canonical(actual.meta) !== canonical(saved.meta)) throw new Error('Native cycle fresh XRPL evidence mismatch');
    }
  } finally { if(adapter.client.isConnected()) await adapter.disconnect(); }
}
console.log(JSON.stringify(checks,null,2));
