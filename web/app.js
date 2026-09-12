import { SnapshotCursor, sameReview, drops, cycleFor } from '/state-client.mjs';
const $ = id => document.getElementById(id);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const json = value => `<pre>${escape(JSON.stringify(value, null, 2))}</pre>`;
const badge = (text, color = 'neutral') => `<span class="badge ${color}">${escape(text)}</span>`;
const time = value => value ? new Date(value).toLocaleString() : 'Not checked';
const cursor = new SnapshotCursor();
let state, selectedId, review, busy = false, refreshing = false, available = false;
$('mode').value = new URL(location.href).searchParams.get('mode') === 'recorded' ? 'recorded' : 'live';
function message(text, error = true) { $('message').hidden = !text; $('message').textContent = text; $('message').className = error ? 'change-notice' : 'success-notice'; }
function selected() { return state?.requests.find(r => r.agreement.requestId === selectedId) ?? state?.requests[0]; }
function actionButtons(actions, requestId = '') {
  return actions.map(a => `<div><button class="secondary" data-action="${escape(a.id)}" data-request="${escape(requestId)}" ${!a.allowed || busy || !available || state.mode !== 'live' ? 'disabled' : ''}>${escape(a.label)}</button>${!a.allowed ? `<p class="small-print">${escape(a.reason)}</p>` : ''}</div>`).join('');
}
function render() {
  if (!state) return;
  const openDetails = new Set([...document.querySelectorAll('details[open]')].map(d=>d.querySelector('summary')?.textContent));
  const r = selected(); selectedId = r?.agreement.requestId;
  const recorded = state.mode === 'recorded';
  $('check-health').hidden = Boolean(state.hosting);
  const bridge = state.bridgeByRequest?.[r?.agreement.requestId];
  $('mode-banner').textContent = recorded ? 'PUBLISHED REAL EVIDENCE · Read-only · Synthetic document · Offline consistency checked' : (state.hosting ? 'SHARED DEMO · Native actions use the local operator bridge' : 'LIVE LOCAL WORKSPACE · Event network · Test funds · Synthetic documents');
  if (!recorded && r?.mode === 'fixture') $('mode-banner').textContent = 'SIMULATED FIXTURE RECORD · No live ledger result is claimed';
  $('sync-status').textContent = available ? `Page refreshed ${new Date(state.observedAt).toLocaleTimeString()} · ${state.hosting ? (bridge ? "Bridge published " + time(bridge.publishedAt) : "No native progress published") : "See service check times below"}` : 'Backend unavailable. Last displayed facts are retained; actions paused.';
  $('sync-id').textContent = `Backend ${state.instanceId} · Revision ${state.revision} · ${state.mode}`;
  $('disclosure').textContent = state.disclosure;
  $('health-toggle').textContent = `System status · Ledger ${state.health.ledger.status}`;
  $('health-details').innerHTML = Object.entries(state.health).map(([name, h]) => `<div class="evidence-row"><div><h3>${escape({ledger:'Event ledger',receipts:'Receipt service',hook:'Developer capture'}[name])}</h3><p>${escape(h.message)}</p><p class="small-print">Checked ${escape(time(h.checkedAt))}${name === 'ledger' && h.ledgerIndex ? ` · Ledger ${h.ledgerIndex} · ${h.latencyMs} ms` : ''}${name === 'hook' && h.accepted !== undefined ? ` · ${h.accepted} accepted / ${h.buffered} buffered` : ''}</p></div>${badge(h.status, h.status === 'ready' ? 'green' : h.status === 'blocked' || h.status === 'unavailable' ? 'amber' : 'neutral')}</div>`).join('');
  $('request-picker').innerHTML = state.requests.length > 1 ? `<label>Request<select id="selected-request">${state.requests.map(q => `<option value="${escape(q.agreement.requestId)}" ${q.agreement.requestId === selectedId ? 'selected' : ''}>${escape(q.agreement.requestId)}</option>`).join('')}</select></label>` : '';
  const c = cycleFor(state, r?.agreement.requestId);
  const repaid = c?.steps.repay?.resultCode === 'tesSUCCESS' || c?.steps['repay-late']?.resultCode === 'tesSUCCESS';
  const redeemed = c?.steps.withdraw?.resultCode === 'tesSUCCESS';
  const money = !r ? 'No request prepared.' : r.funding.status === 'funded' ? redeemed ? 'Lender redemption recorded.' : repaid ? 'Repayment recorded.' : 'Funding confirmed.' : r.phase === 'EXPIRED_UNRESOLVED' ? 'Expired. Outcome still unknown.' : r.funding.status === 'unknown' ? 'Funding outcome not yet validated.' : r.funding.status === 'refused' ? 'Native refusal recorded.' : 'Ready for exact review.';
  $('money-title').textContent = money;
  $('money-description').textContent = r?.funding.status === 'funded' ? `${drops(r.funding.borrowerFundingDrops)} test XRP funded the borrower · Ledger ${r.transaction.ledgerIndex}${recorded ? ' · Recorded evidence, not a fresh ledger lookup' : ' · Stored validated result'}` : 'A timeout or missing lookup never authorizes a replacement loan.';
  $('receipt-status').innerHTML = r?.executionReceipt ? badge('Execution receipt recorded', 'green') : r?.funding.status === 'funded' ? badge('Execution receipt pending', 'amber') : badge('Awaiting validated execution');
  $('receipt-description').textContent = r?.executionReceipt ? `Last authority check in record: ${time(r.executionReceipt.authorityCheckedAt)}` : 'Receipt availability does not undo an established funding result.';
  if (!r) {
    $('agreement-panel').innerHTML = '<span class="eyebrow">THE COMMITMENT</span><h2>Start with one exact agreement.</h2><p class="position-note">This backend has no prepared request. Open Published real evidence to inspect the completed run, or use the operator controls for a new local setup.</p>';
    $('execution-panel').innerHTML = '<span class="eyebrow">THE EXECUTION</span><h2>No loan is loaded.</h2><p class="position-note">A fresh clone starts with its own empty stores. It does not receive another developer’s wallets or private state.</p>';
  } else {
    const a = r.agreement, t = a.terms;
    $('agreement-panel').innerHTML = `<div class="panel-heading"><div><span class="eyebrow">${escape(a.requestId)}</span><h2>Supplier agreement</h2></div>${badge(`Version ${a.documentVersion}`)}</div><div class="principal"><span>Loan principal</span><p>${escape(drops(t.principalDrops))} <span>test XRP</span></p></div><dl class="terms"><div><dt>Annual interest</dt><dd>${escape(t.interestRate / 1000)}%</dd></div><div><dt>Schedule</dt><dd>${escape(t.paymentTotal)} payment · ${escape(t.paymentInterval)} seconds</dd></div><div><dt>Approval expiry</dt><dd>${escape(time(a.expiresAt))}</dd></div><div><dt>Transaction expiry</dt><dd>Ledger ${escape(r.preparedTransaction.LastLedgerSequence)}</dd></div></dl><p class="small-print">${recorded ? 'The public bundle verifies both transaction signatures. Human approval timestamps were not exported.' : 'Each role approves the exact hashes below. Expired terms require a newly prepared request.'}</p>${['broker','borrower'].map(role => `<div class="approval-row"><span>${role === 'broker' ? 'Broker' : 'Borrower'}</span><span>${recorded ? 'Signature verified offline' : r.approvals.some(x => x.role === role) ? 'Exact approval recorded' : 'Approval required'}</span></div>`).join('')}<div class="action-grid">${actionButtons(r.actions.filter(x => x.id.startsWith('approve/')), a.requestId)}</div><details><summary>Exact terms, accounts and signature binding</summary>${json({agreement:a,agreementHash:r.agreementHash,transactionDigest:r.transactionDigest,preparedTransaction:r.preparedTransaction,approvals:r.approvals})}</details>`;
    const events = [['Agreement commitment',r.agreementHash],['Agreement receipt',r.agreementReceipt?.receiptId ?? 'Pending'],['Native LoanSet',r.transaction ? `${r.transaction.hash} · ${r.transaction.resultCode ?? r.phase}` : 'Not signed'],['Execution receipt',r.executionReceipt?.receiptId ?? 'Pending'],...Object.entries(c?.steps ?? {}).filter(([id]) => ['repay','repay-late','withdraw'].includes(id)).sort(([,a],[,b]) => a.ledgerIndex-b.ledgerIndex).map(([id,s]) => [{repay:'Scheduled repayment','repay-late':'Late repayment recovery',withdraw:'Lender redemption'}[id],`${s.resultCode} · Ledger ${s.ledgerIndex} · ${s.hash}`])];
    $('execution-panel').innerHTML = `<div class="panel-heading"><div><span class="eyebrow">THE EXECUTION</span><h2>One continuous history</h2></div></div><ol class="timeline">${events.map(([title,detail],i) => `<li><span class="step-dot" aria-hidden="true">${i+1}</span><div><h3>${escape(title)}</h3><p class="hash">${escape(detail)}</p></div></li>`).join('')}</ol><p class="small-print">${escape(r.phase)}. Backend-managed demo accounts. No browser wallet extension is connected.</p>`;
  }
  const observedDeposit = c?.steps.deposit?.resultCode === 'tesSUCCESS' ? `${drops(c.depositDrops)} XRP` : 'Not observed';
  $('position').innerHTML = `<span class="eyebrow">LENDER POSITION</span><h2>Keep capital and yield distinct.</h2><div class="position-grid"><div><span>Validated deposit</span><strong>${escape(observedDeposit)}</strong></div><div><span>Redeemed</span><strong>${c?.yield ? escape(drops(c.yield.withdrawnDrops)) + ' XRP' : 'Not observed'}</strong></div><div><span>Gross realised yield</span><strong>${c?.yield ? escape(c.yield.realisedYieldDrops) + ' drops' : 'Not observed'}</strong></div><div><span>Withdrawal fee</span><strong>${c?.yield ? escape(c.yield.withdrawalFeeDrops) + ' drops' : 'Not observed'}</strong></div></div><p class="position-note">Current available cash and share value are not polled by this dashboard. The amounts above come from recorded validated operations; gross realised yield excludes network fees.</p>${c?.refusal ? `<div class="evidence-row"><div><h3>Native liquidity refusal</h3><p>${escape(c.refusal.resultCode)}</p><p class="hash">${escape(c.refusal.hash)}</p></div></div>` : ''}<details><summary>Recorded cycle details</summary>${json(c)}</details>`;
  $('proof').innerHTML = `<span class="eyebrow">EVIDENCE</span><h2>Three checks. Three distinct facts.</h2>${r ? [['Document consistency',r.checks.contentHash,recorded ? 'Published bundle commitment and both signatures checked offline.' : 'Stored request commitment check; document contents remain server-side.'],['Receipt authority',r.executionReceipt ? 'Receipt recorded' : 'Execution receipt pending',`Agreement: ${time(r.agreementReceipt?.authorityCheckedAt)}. Execution: ${time(r.executionReceipt?.authorityCheckedAt)}. These are historical check times; service health is separate.`],['XRPL validation',r.transaction?.resultCode ?? r.phase,`Transaction ${r.transaction?.hash ?? 'not yet signed'}. ${recorded ? 'Saved ledger evidence checked offline. Run the online verifier for fresh confirmation.' : 'Stored result from the native adapter; page refresh alone does not repeat ledger lookup.'}`]].map(([title,result,description])=>`<div class="evidence-row"><div><h3>${escape(title)}</h3><p>${escape(description)}</p></div>${badge(result)}</div>`).join('') : '<p>No request evidence yet.</p>'}`;
  $('operator-actions').innerHTML = actionButtons(state.actions) + (r ? actionButtons(r.actions.filter(x => !x.id.startsWith('approve/')), r.agreement.requestId) : '');
  if (review) { const valid=sameReview(review,state); $('review-changed').hidden=valid; $('confirm-action').disabled=busy || !available || !valid; }
  document.querySelectorAll('details').forEach(d=>{if(openDetails.has(d.querySelector('summary')?.textContent))d.open=true;});
}
async function refresh() {
  const ticket=cursor.begin($('mode').value);
  try {
    const response=await fetch(`/api/state?mode=${encodeURIComponent($('mode').value)}`,{signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw new Error();
    const next=await response.json();if(!cursor.accept(ticket,next))return;
    const changed=!available || !state || state.instanceId!==next.instanceId || state.revision!==next.revision || state.mode!==next.mode;
    available=true;state=next;if(changed)render();else $('sync-status').textContent=`Updated ${new Date(next.observedAt).toLocaleTimeString()} · Revision ${next.revision}`;
  } catch {
    if(ticket!==cursor.sequence)return;available=false;$('sync-status').textContent='Backend unavailable. Last displayed facts are retained; actions paused.';$('health-toggle').textContent='System status · Backend unavailable';
    document.querySelectorAll('[data-action]').forEach(b=>b.disabled=true);if(review)$('confirm-action').disabled=true;
  }
}
function startReview(actionId,requestId) {
  const r=requestId?state.requests.find(q=>q.agreement.requestId===requestId):undefined;
  const a=(r?r.actions:state.actions).find(q=>q.id===actionId);if(!a?.allowed || !available || state.mode!=='live')return;
  review={instanceId:state.instanceId,requestId,agreementHash:r?.agreementHash,transactionDigest:r?.transactionDigest,action:structuredClone(a),request:r?structuredClone(r):null};
  $('action-title').textContent=a.label;$('action-context').textContent=`Role: ${a.role}. ${actionId.includes('receipt') && actionId!=='recover-receipt'?'Issuance may cost one tick. An unresolved attempt must be recovered, not minted again.':'Confirm this exact action on test funds.'}`;
  $('action-review').innerHTML=r?json({agreement:r.agreement,agreementHash:r.agreementHash,transactionDigest:r.transactionDigest,preparedTransaction:r.preparedTransaction}):json({action:a.id,cycle:state.cycle,setup:a.id==='setup'?{depositXRP:200,coverXRP:20,eventNetwork:4001}:undefined});
  $('recovery-fields').hidden=actionId!=='recover-receipt';$('receipt-id').value='';$('receipt-stage').value=r?.funding.status==='funded'?'execution':'agreement';$('capability').value='';$('review-changed').hidden=true;$('confirm-action').disabled=false;updateRecovery();$('action-dialog').showModal();
}
function updateRecovery(){ $('recovery-hash').textContent=review?.request?`Expected commitment: ${$('receipt-stage').value==='agreement'?review.request.receiptRecovery.agreementHash:review.request.receiptRecovery.executionHash??'No validated execution'}`:''; }
function closeReview(){ $('capability').value='';$('action-dialog').close();review=undefined; }
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b)startReview(b.dataset.action,b.dataset.request);});
$('action-form').addEventListener('submit',async e=>{
  e.preventDefault();if(!review || busy || !available || !sameReview(review,state))return;
  const current=review;busy=true;$('confirm-action').disabled=true;$('cancel-action').disabled=true;
  const token=$('capability').value;$('capability').value='';let input={};
  if(current.action.id.startsWith('approve/'))input={agreementHash:current.agreementHash,transactionDigest:current.transactionDigest};
  if(current.action.id==='recover-receipt')input={stage:$('receipt-stage').value,receiptId:$('receipt-id').value.trim(),hash:$('receipt-stage').value==='agreement'?current.request.receiptRecovery.agreementHash:current.request.receiptRecovery.executionHash};
  try{
    const path=current.requestId?`/api/requests/${encodeURIComponent(current.requestId)}/${current.action.id}`:`/api/${current.action.id}`;
    const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(input),signal:AbortSignal.timeout(90000)});
    if(!response.ok){const result=await response.json();throw new Error(result.error??`HTTP ${response.status}`);}
    closeReview();message('Action completed. Shared state refreshed.',false);
  }catch(error){message(`${error.message}. Refresh and reconcile before retrying an uncertain action.`);closeReview();}
  finally{busy=false;$('cancel-action').disabled=false;await refresh();render();}
});
$('receipt-stage').addEventListener('change',updateRecovery);$('cancel-action').addEventListener('click',closeReview);
$('action-dialog').addEventListener('cancel',e=>{if(busy){e.preventDefault();return;}$('capability').value='';review=undefined;});
$('mode').addEventListener('change',()=>{closeReview();selectedId=undefined;message('');const url=new URL(location.href);url.searchParams.set('mode',$('mode').value);history.replaceState(null,'',url);void refresh();});
$('request-picker').addEventListener('change',e=>{selectedId=e.target.value;render();});
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{for(const v of ['request','position','evidence'])$(`${v}-view`).hidden=b.dataset.view!==v;document.querySelectorAll('[data-view]').forEach(q=>q.setAttribute('aria-pressed',String(q===b)));}));
$('health-toggle').addEventListener('click',()=>{$('health-panel').hidden=!$('health-panel').hidden;$('health-toggle').setAttribute('aria-expanded',String(!$('health-panel').hidden));});
$('check-health').addEventListener('click',async()=>{$('check-health').disabled=true;try{const r=await fetch('/api/health/check',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error();await refresh();}catch{message('Service check unavailable. Stored funding history is retained.');}finally{$('check-health').disabled=false;}});
$('refresh').addEventListener('click',()=>void refresh());
setInterval(async()=>{if(document.hidden || refreshing)return;refreshing=true;try{await refresh();}finally{refreshing=false;}},3000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refresh();});void refresh();
