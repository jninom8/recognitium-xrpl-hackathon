// Both terminal and browser consume the same backend snapshot. No signing or issuance.
const args = process.argv.slice(2);
const base = args.find(a => a.startsWith('--url='))?.slice(6) ?? 'http://127.0.0.1:3000';
const target = new URL(base);
if (!['localhost', '127.0.0.1'].includes(target.hostname) || target.protocol !== 'http:') throw new Error('Use the local backend or a private loopback tunnel.');
const mode = args.includes('--recorded') ? 'recorded' : 'live';
if (args.includes('--check')) {
  const response = await fetch(new URL('/api/health/check', base), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}', signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`Health check HTTP ${response.status}`);
}
async function read() {
  const response = await fetch(new URL(`/api/state?mode=${mode}`, base), { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`State HTTP ${response.status}`);
  const state = await response.json();
  console.log(JSON.stringify({ instanceId: state.instanceId, revision: state.revision, observedAt: state.observedAt, mode: state.mode, health: state.health,
    requests: state.requests.map(r => ({ requestId: r.agreement.requestId, documentVersion: r.agreement.documentVersion, phase: r.phase, transactionHash: r.transaction?.hash, funding: r.funding, pendingReceipt: r.receiptRecovery.pendingStage })) }, null, 2));
}
do { await read(); if (args.includes('--watch')) await new Promise(resolve => setTimeout(resolve, 3000)); } while (args.includes('--watch'));
