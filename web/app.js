const $ = selector => document.querySelector(selector);
document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => {
  for (const id of ['lender','request','evidence']) document.getElementById(id).hidden = id !== button.dataset.tab;
}));
async function refresh() {
  try {
    const response = await fetch('/api/state'); if (!response.ok) throw new Error('Local API unavailable');
    const state = await response.json();
    $('#network').textContent = `${state.network.track} · ${state.network.sdk} · ${state.mode === 'fixture' ? 'FIXTURE, no ledger activity' : state.connected ? 'Connected to event ledger' : 'Disconnected, no live validation claimed'}`;
    $('#disclosure').textContent = state.disclosure;
    $('#position').textContent = state.cycle ? JSON.stringify({ depositedDrops: state.cycle.depositDrops, steps: state.cycle.steps, yield: state.cycle.yield ?? 'No validated withdrawal yield yet' },null,2) : 'No validated deposit yet. The native adapter is ready for a reachable Track 1 endpoint.';
    const container = $('#requests'); container.replaceChildren();
    if (!state.requests.length) container.textContent = 'No request prepared yet. Setup creates test accounts, vault, deposit, broker and cover before the approval screen can show exact ledger-bound terms.';
    for (const request of state.requests) {
      const card = document.createElement('article'); card.className = 'card';
      const title = document.createElement('h3'); title.textContent = `${request.agreement.synthetic ? 'SYNTHETIC DEMO · ' : ''}${request.agreement.requestId} · ${request.phase}`; card.append(title);
      const terms = document.createElement('pre'); terms.textContent = JSON.stringify({agreement:request.agreement, agreementHash:request.agreementHash, transactionDigest:request.transactionDigest, preparedTransaction:request.preparedTransaction, approvals:request.approvals},null,2); card.append(terms);
      for (const role of ['broker','borrower']) {
        const button = document.createElement('button'); button.textContent = `Approve these exact terms as ${role}`;
        button.disabled = !['AGREEMENT_LOCKED','AGREEMENT_RECEIPTED'].includes(request.phase);
        button.addEventListener('click', async () => {
          const token = prompt(`Enter your local ${role} approval capability. It stays in this request only.`); if (!token) return;
          button.disabled = true;
          try {
            const result = await fetch(`/api/requests/${encodeURIComponent(request.agreement.requestId)}/approve/${role}`, { method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({agreementHash:request.agreementHash,transactionDigest:request.transactionDigest}) });
            if (!result.ok) throw new Error((await result.json()).error); await refresh();
          } catch (error) { alert(error.message); button.disabled = false; }
        }); card.append(button);
      }
      container.append(card);
    }
    $('#proof').textContent = JSON.stringify(state.requests.map(request => ({ requestId:request.agreement.requestId, checks:request.checks, transaction:request.transaction, agreementReceipt:request.agreementReceipt?.receiptId, executionReceipt:request.executionReceipt?.receiptId })),null,2);
  } catch (error) { $('#network').textContent = error.message; }
}
$('#refresh').addEventListener('click',refresh); void refresh();
