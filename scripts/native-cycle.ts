import { processLock } from '../src/requests/store.js';
import { Cycle } from '../src/xrpl/cycle.js';
import { NativeAdapter } from '../src/xrpl/adapter.js';
const trialFlag='--mentor-confirmed-open-ended';
const [action, id, role, agreementHash, transactionDigest] = process.argv.slice(2).filter(arg=>arg!==trialFlag);
if (!action || action === 'help') {
  console.log('Commands: setup | prepare | approve REQUEST broker|borrower AGREEMENT_HASH TRANSACTION_DIGEST | agreement-receipt REQUEST | sign REQUEST | submit REQUEST | execution-receipt REQUEST | refusal | repay | withdraw');
} else {
  const release = await processLock(); const adapter = new NativeAdapter(process.argv.includes(trialFlag));
  adapter.client.on('error', () => {});
  try {
    await adapter.connect(); const cycle = new Cycle(adapter);
    let result: unknown;
    switch (action) {
      case 'setup': result = await cycle.setup(); break;
      case 'prepare': result = await cycle.prepareRequest(); break;
      case 'approve':
        if (!id || (role !== 'broker' && role !== 'borrower') || !agreementHash || !transactionDigest) throw new Error('Exact request, role and both hashes required');
        result = await cycle.service.approve(id,role,agreementHash,transactionDigest); break;
      case 'agreement-receipt': result = await cycle.service.receiptAgreement(id!); break;
      case 'sign': result = await cycle.service.sign(id!,await cycle.wallet('broker'),await cycle.wallet('borrower')); break;
      case 'submit': result = await cycle.service.advance(id!); break;
      case 'execution-receipt': result = await cycle.service.receiptExecution(id!); break;
      case 'refusal': result = await cycle.refusal(); break;
      case 'repay': result = await cycle.repay(); break;
      case 'withdraw': result = await cycle.withdraw(); break;
      default: throw new Error('Unknown command');
    }
    console.log(JSON.stringify(result, null, 2));
  } catch (error) { console.error(error instanceof Error ? error.message : 'Operation failed'); process.exitCode = 1; }
  finally { if (adapter.client.isConnected()) await adapter.disconnect(); await release(); }
}
