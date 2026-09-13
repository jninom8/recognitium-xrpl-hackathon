import { financingJourney, ledgerHistory } from './journey-model.mjs';
import { drops } from './state-client.mjs';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const time = value => value ? new Date(value).toLocaleString() : 'Not checked';

export function journeyPanel(input, controls = '') {
  const story = financingJourney(input);
  return `<section class="journey-panel" aria-label="Current request and next step"><div class="journey-lead"><div><p class="eyebrow">${story.recorded ? 'COMPLETED TEST LOAN' : story.id ? 'REQUEST ' + esc(story.id.replace('request-', '').slice(0, 8).toUpperCase()) : 'YOUR NEXT STEP'}</p><h2>${esc(story.title)}</h2><p>${esc(story.description)}</p></div><span class="journey-symbol ${story.tone}" aria-hidden="true">${story.withdrawn ? '✓' : '↗'}</span></div><ol class="lifecycle" aria-label="Loan progress">${story.steps.map(s => `<li class="${s.status}" ${s.status === 'current' ? 'aria-current="step"' : ''}><span class="lifecycle-dot" aria-hidden="true">${s.done ? '✓' : '·'}</span><strong>${s.title}</strong><small>${s.status === 'complete' ? 'Recorded' : s.status === 'current' ? 'Current step' : 'Upcoming'}</small></li>`).join('')}</ol><div class="next-action"><div><span class="next-owner">${esc(story.owner)} · next step</span><p>${esc(story.next)}</p></div>${controls}</div>${story.receiptPending ? '<p class="receipt-alert">Funding is confirmed. Its receipt is pending; recovery must keep the same loan.</p>' : ''}</section>`;
}

export function proofCards(request, mode, operatorHref) {
  if (!request) return '';
  const r = request, checks = r.checks;
  const authorityFailed = checks.receiptAuthority === 'failed';
  const receipt = r.executionReceipt ?? r.agreementReceipt;
  const cards = [
    ['Agreement version', checks.contentHash === 'consistent' ? 'Content matches' : checks.contentHash === 'mismatch' ? 'Content mismatch' : 'Not checked', 'The recorded commitment identifies the exact agreement version. It does not establish that its claims are true.', checks.contentHash === 'mismatch'],
    ['Receipt authority', authorityFailed ? 'Check failed' : receipt ? 'Authority record saved' : 'Receipt pending', receipt ? 'Last saved authority check: ' + time(receipt.authorityCheckedAt) + '. This is not a fresh lookup.' : 'Agreement and execution receipts are separate from funding.', authorityFailed],
    ['XRPL execution', r.funding.status === 'funded' ? 'Funding confirmed' : r.funding.status === 'refused' ? 'Native refusal recorded' : 'Not confirmed', mode === 'recorded' ? 'Saved ledger evidence, checked offline. Online verification is a separate check.' : 'The stored ledger result determines funding. Refreshing this page only reloads the record.', false],
  ];
  return `<section class="verification-section" aria-label="Verification evidence"><div class="section-heading"><h2>What backs this record?</h2><a class="text-button" href="${esc(operatorHref)}">Inspect evidence ↗</a></div><div class="proof-cards">${cards.map(([title, status, note, failed]) => `<article class="proof-card ${failed ? 'proof-failed' : ''}"><h3>${title}</h3><strong>${esc(status)}</strong><p>${esc(note)}</p></article>`).join('')}</div></section>`;
}

export function operationHistory(request, cycle, explorer) {
  const entries = ledgerHistory(request, cycle);
  if (!entries.length) return '<p class="hint">No ledger operation recorded for this request yet.</p>';
  // Explorer comes from the fixed event-network contract. Never accept a data-provided origin.
  const base = explorer === 'https://custom.xrpl.org/lending-hackathon.dev.ripplex.io:51233/' ? explorer : null;
  return `<ol class="operation-history">${entries.map(e => `<li><span class="operation-dot ${e.resultCode === 'tesSUCCESS' ? 'success' : 'attention'}" aria-hidden="true">${e.resultCode === 'tesSUCCESS' ? '✓' : '!'}</span><div><h3>${esc(e.title)}</h3><p>${esc(e.resultCode === 'tesSUCCESS' ? 'Confirmed on XRPL' : e.resultCode ? 'Declined by XRPL · ' + e.resultCode : 'Outcome not confirmed')}${e.ledgerIndex ? ' · Ledger ' + esc(e.ledgerIndex) : ' · Ledger index not recorded'}</p><details><summary>Transaction details</summary><p class="hash">${esc(e.hash)}</p>${base && /^[A-Fa-f0-9]{64}$/.test(e.hash) ? `<a target="_blank" rel="noopener" href="${base}transactions/${e.hash}">Open event explorer ↗</a>` : ''}</details></div></li>`).join('')}</ol>`;
}

export function setupSummary(cycle) {
  if (!cycle) return '';
  return `<div class="setup-grid">${[['vault','Vault','Created'],['deposit','Lender deposit',drops(cycle.depositDrops)+' test XRP'],['broker','Loan broker','Configured'],['cover','Broker cover',drops(cycle.coverDrops)+' test XRP']].map(([id,title,value]) => `<div><span>${title}</span><strong>${cycle.steps[id]?.resultCode === 'tesSUCCESS' ? esc(value) : 'Not confirmed'}</strong></div>`).join('')}</div>`;
}
