import { financingJourney, ledgerHistory } from './journey-model.mjs';
import { drops } from './state-client.mjs';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const time = value => value ? new Date(value).toLocaleString() : 'Not checked';

export function authorizationGuide(role = 'borrower', hosted = false) {
  const intro = {
    borrower: 'You request funding. Reviewing your request does not commit you to a loan.',
    lender: 'You supply liquidity. The broker decides which loans to approve; a receipt does not guarantee repayment.',
    broker: 'You review the request. Borrower and broker approval of the exact offer is a separate step.',
    admin: 'Coordinate the approvals, receipt checks and execution without confusing one with another.',
  }[role] ?? 'Follow the same approval and execution rules for every request.';
  return `<section class="authorization-guide" aria-label="How this demo authorises funding">
    <div class="section-heading"><div><p class="eyebrow">HOW THIS DEMO WORKS</p><h2>People approve. XRPL moves funds.</h2></div><span class="guide-label">Guided workspace</span></div>
    <p class="guide-intro">${intro}</p>
    <ol class="authority-flow">
      <li><span aria-hidden="true">1</span><div><h3>People approve</h3><p>Borrower and broker approve the exact agreement and transaction.</p></div></li>
      <li><span aria-hidden="true">2</span><div><h3>Our broker verifies</h3><p>Our broker checks Recognitium's record of the exact agreement before the two demo wallets sign.</p></div></li>
      <li><span aria-hidden="true">3</span><div><h3>XRPL executes</h3><p>The event ledger checks both signatures and lending rules, then funds a successful loan.</p></div></li>
    </ol>
    <details><summary>Who decides, and what is automated?</summary>
      <p>Recognitium records the agreement fingerprint. The broker makes the lending decision. Receipt verification is our broker application's policy; XRPL does not read Recognitium receipts.</p>
      <p>${hosted ? 'This website supports requests and review. The local operator records exact approvals and handles signing and test-money execution.' : 'The local backend holds the demo wallets. Signing requires both exact role approvals and an authority-verified agreement receipt.'}</p>
      <p>These are guided forms, not an AI chatbot. No wallet MCP is connected. A future agent could prepare requests, coordinate checks and track execution; it would still need the required human approvals.</p>
      <p>Proposed next step: give authenticated human approval its own linked receipt. Scheduled repayments would need an explicit payment mandate. Any future autonomy limit would be granted and revocable, not earned automatically from past repayments. These capabilities are not implemented.</p>
      <p>A KYC-to-wallet fingerprint would record a claimed identity link, not permission to borrow or proof that the identity check was correct. This demo uses synthetic accounts and performs no KYC. Private-vault credentials and offline ledger proofs are not implemented here.</p>
    </details>
  </section>`;
}

export function evidenceLimits() {
  return `<details class="evidence-limits"><summary>What can I verify after the event?</summary>
    <p>Keep the evidence bundle. The event network can reset or close, and explorer links may stop working. A wallet balance check does not re-verify a past loan.</p>
    <div class="verification-table-wrap"><table><caption>Checks supported by this demo's saved evidence bundle</caption><thead><tr><th scope="col">Check</th><th scope="col">Works offline?</th></tr></thead><tbody>
      <tr><th scope="row">Agreement fingerprint and saved signing-key signatures</th><td>Yes, from the saved bytes</td></tr>
      <tr><th scope="row">Receipt hash-chain consistency</th><td>Yes; consistency alone does not authenticate its issuer</td></tr>
      <tr><th scope="row">Recognitium receipt source</th><td>Our verifier needs the online authority record</td></tr>
      <tr><th scope="row">XRPL transaction inclusion and validated result</th><td>Our verifier needs the event ledger's history</td></tr>
    </tbody></table></div>
    <p>Saved transaction signatures prove authorization by the signing keys, not network acceptance. A complete proof archive could support offline ledger verification; this bundle does not include one.</p>
  </details>`;
}

export function journeyPanel(input, controls = '') {
  const story = financingJourney(input);
  return `<section class="journey-panel" aria-label="Current request and next step"><div class="journey-lead"><div><p class="eyebrow">${story.recorded ? 'COMPLETED TEST LOAN' : story.id ? 'REQUEST ' + esc(story.id.replace('request-', '').slice(0, 8).toUpperCase()) : 'YOUR NEXT STEP'}</p><h2>${esc(story.title)}</h2><p>${esc(story.description)}</p></div><span class="journey-symbol ${story.tone}" aria-hidden="true">${story.withdrawn ? '✓' : '↗'}</span></div><ol class="lifecycle" aria-label="Loan progress">${story.steps.map(s => `<li class="${s.status}" ${s.status === 'current' ? 'aria-current="step"' : ''}><span class="lifecycle-dot" aria-hidden="true">${s.done ? '✓' : '·'}</span><strong>${s.title}</strong><small>${s.status === 'complete' ? 'Recorded' : s.status === 'current' ? 'Current step' : 'Upcoming'}</small></li>`).join('')}</ol><div class="next-action"><div><span class="next-owner">${esc(story.owner)} · next step</span><p>${esc(story.next)}</p></div>${controls}</div>${story.receiptPending ? '<p class="receipt-alert">Funding is confirmed. Its receipt is pending; recovery must keep the same loan.</p>' : ''}</section>`;
}

export function proofCards(request, mode, operatorHref) {
  if (!request) return '';
  const r = request, checks = r.checks;
  const authorityFailed = checks.receiptAuthority === 'failed';
  const receipt = r.executionReceipt ?? r.agreementReceipt;
  const authorityObserved = Number.isFinite(Date.parse(receipt?.authorityCheckedAt));
  const cards = [
    ['Agreement version', checks.contentHash === 'consistent' ? 'Content matches' : checks.contentHash === 'mismatch' ? 'Content mismatch' : 'Not checked', 'The recorded commitment identifies the exact agreement version. It does not establish that its claims are true.', checks.contentHash === 'mismatch'],
    ['Receipt authority', authorityFailed ? 'Check failed' : authorityObserved ? 'Authority check recorded' : receipt ? 'Authority check pending' : 'Receipt pending', receipt ? 'Last saved authority check: ' + (authorityObserved ? time(receipt.authorityCheckedAt) : 'Not recorded') + '. Authenticating the source needs Recognitium’s online record; an offline hash match is not enough.' : 'The broker verifies the agreement receipt before signing. An execution receipt is separate from funding.', authorityFailed],
    ['XRPL execution', r.funding.status === 'funded' ? 'Funding confirmed' : r.funding.status === 'refused' ? 'Native refusal recorded' : 'Not confirmed', mode === 'recorded' ? 'Saved successful ledger result. Offline consistency does not independently prove ledger inclusion; fresh verification needs event-network history.' : 'Stored ledger result. Refreshing this page or checking a balance does not re-verify this transaction.', false],
  ];
  return `<section class="verification-section" aria-label="Verification evidence"><div class="section-heading"><h2>What backs this record?</h2><a class="text-button" href="${esc(operatorHref)}">Inspect evidence ↗</a></div><div class="proof-cards">${cards.map(([title, status, note, failed]) => `<article class="proof-card ${failed ? 'proof-failed' : ''}"><h3>${title}</h3><strong>${esc(status)}</strong><p>${esc(note)}</p></article>`).join('')}</div>${evidenceLimits()}</section>`;
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
