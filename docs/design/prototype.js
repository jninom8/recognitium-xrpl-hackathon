// Presentation fixture only. No wallet, API, signing, verification or ledger I/O.
const byId = id => document.getElementById(id);
let state = 'funded';
function badge(id, text, color) { byId(id).textContent = text; byId(id).className = `badge ${color}`; }
function showView(view) {
  for (const name of ['request', 'position', 'evidence']) byId(`${name}-view`).hidden = name !== view;
  for (const button of document.querySelectorAll('[data-view]')) button.setAttribute('aria-pressed', String(button.dataset.view === view));
}
function showState(next) {
  state = next;
  const funded = state !== 'approval';
  const recovered = state === 'recovered';
  for (const button of document.querySelectorAll('[data-state]')) button.setAttribute('aria-pressed', String(button.dataset.state === state));
  byId('money-title').textContent = funded ? 'Funding confirmed.' : 'Ready for exact approval.';
  byId('money-description').textContent = funded ? '100 test XRP reached the borrower in this simulated scenario.' : 'Review version 1 before either role approves. No funds have moved.';
  badge('receipt-status', recovered ? '✓ Receipt attached' : funded ? '◷ Receipt pending' : '○ Awaiting execution', recovered ? 'green' : funded ? 'amber' : 'neutral');
  byId('receipt-description').textContent = recovered ? 'The original execution is linked. No second loan was created.' : funded ? 'Funding is preserved while the receipt is recovered.' : 'The execution receipt follows validated funding.';
  byId('change-notice').hidden = state !== 'changed';
  for (const role of ['broker', 'borrower']) {
    byId(`${role}-state`).textContent = funded ? '✓ Version 1 approved' : '○ Approval required';
    byId(`${role}-state`).className = funded ? 'positive' : '';
  }
  ['approval', 'agreement', 'funding', 'receipt'].forEach((step, index) => {
    const complete = funded && (step !== 'receipt' || recovered);
    byId(`step-${step}`).className = complete ? '' : funded ? 'waiting' : 'unreached';
    byId(`step-${step}`).querySelector('.step-dot').textContent = complete ? '✓' : String(index + 1);
  });
  byId('timeline-receipt').textContent = recovered ? 'Same funded transaction · Receipt attached' : funded ? 'Pending recovery · Funding retained' : 'Follows validated execution';
  byId('action-heading').textContent = recovered ? 'Inspect the linked evidence' : funded ? 'Recover the existing receipt' : 'Review the approval boundary';
  byId('action-description').textContent = recovered ? 'Compare the document, authority record and ledger result separately.' : funded ? 'Attach its verified ID to this execution. Keep the same funded transaction.' : 'Each person approves the exact version and transaction. This concept cannot approve or sign.';
  byId('next-preview').textContent = recovered ? 'View evidence ↗' : funded ? 'Preview recovery ↗' : 'Preview funded state ↗';
  byId('cash-amount').innerHTML = `${funded ? '100' : '200'} <small>XRP</small>`;
  byId('loan-amount').innerHTML = `${funded ? '100' : '0'} <small>XRP</small>`;
  byId('content-description').textContent = state === 'changed' ? 'The modified copy mismatches. The approved original remains consistent.' : 'The locked version matches its commitment.';
  badge('content-result', state === 'changed' ? '× Changed copy rejected' : '✓ Original consistent', state === 'changed' ? 'red' : 'green');
  badge('authority-result', recovered ? '✓ Receipt linked' : funded ? '◷ Execution pending' : '○ Not yet checked', recovered ? 'green' : funded ? 'amber' : 'neutral');
  badge('ledger-result', funded ? '✓ Funding confirmed' : '○ No funding', funded ? 'green' : 'neutral');
  byId('announcement').textContent = `Simulated ${state} preview. ${byId('money-title').textContent} ${byId('receipt-status').textContent}`;
}
for (const button of document.querySelectorAll('[data-view]')) button.addEventListener('click', () => showView(button.dataset.view));
for (const button of document.querySelectorAll('[data-state]')) button.addEventListener('click', () => showState(button.dataset.state));
byId('next-preview').addEventListener('click', () => state === 'recovered' ? showView('evidence') : showState(state === 'approval' ? 'funded' : 'recovered'));
