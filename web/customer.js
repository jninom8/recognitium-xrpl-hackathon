import { financingJourney, exactApproval, duration } from '/journey-model.mjs';
import { journeyPanel, proofCards, operationHistory, setupSummary, authorizationGuide, trackOneEvidence, simpleProofs } from '/journey-view.mjs';
import { WalletReadings, walletPanel } from '/wallet-panel.mjs';
import { createConversation } from '/assistant.js';
const walletReadings = new WalletReadings();
import { SnapshotCursor, sameReview, drops, cycleFor, freshnessLabel } from "/state-client.mjs";
import {
  currentInboxResponse,
  purposes,
  intakeStates,
  amountToDrops,
  loanOutcome,
  lenderOutcome,
  intakeReviewMatches,
  customerLoan,
} from "/customer-model.mjs";
const $ = (id) => document.getElementById(id);
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>\x22\x27]/g,
    (c) => "&#" + c.charCodeAt(0) + ";",
  );
const badge = (label, tone = "neutral") =>
  `<span class='badge ${tone}'>${esc(label)}</span>`;
const fact = (label, value) =>
  `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`;
const date = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
const fullTime = (value) => new Date(value).toLocaleString();
const amount = (value) => drops(value) + " test XRP";
const shortId = (value) =>
  value.startsWith("request-") ? value.slice(8, 16).toUpperCase() : value;
const cursor = new SnapshotCursor();
let state,
  available = false,
  privateAvailable = false,
  intake,
  access,
  review,
  draft,
  pending,
  sending = false,
  page = "overview",
  pollBusy = false;
let inboxSequence = 0, renderedExpiryKey = '', inboxLoaded = false;
const expiryKey = snapshot => snapshot.requests.map(r=>r.agreement.requestId+':'+(Date.parse(r.agreement.expiresAt)<=Date.now())).join('|');
let selectedLoanId = new URL(location.href).searchParams.get('request') || undefined;
const pendingKey = "recognitium.synthetic-intake.pending.v1";
const conversation=createConversation($('assistant-panel'),{
  reviewDraft: fields=>{
    if(pending){openRequest();return;}
    if(role()!=='borrower'||state?.mode!=='live')return;
    amountToDrops(fields.amount);openRequest();
    draft={clientRequestId:'request-'+crypto.randomUUID(),requestedDrops:amountToDrops(fields.amount),requestedDays:fields.days,purpose:fields.purpose,synthetic:true};
    showDraftReview();
  },
  fallback: context=>{if(context.role==='borrower'&&context.mode==='live'){if(context.id){if(selected())openLoan();else openIntake(context.id);}else openRequest();}else if(context.role==='broker'){const r=activeIntake();if(r)openIntake(r.clientRequestId);else setPage('requests');}else setPage('activity');}
});
try {
  const value = JSON.parse(localStorage.getItem(pendingKey));
  if (
    value?.synthetic === true &&
    /^request-[a-f0-9-]+$/.test(value.clientRequestId) &&
    purposes[value.purpose]
  ) {
    amountToDrops(drops(value.requestedDrops));
    pending = value;
  }
} catch {
  /* Storage is optional; no credentials are stored. */
}
const entry = new URL(location.href).searchParams;
const pathView = {"/borrow":"borrow", "/review":"review", "/lend":"lend"}[location.pathname];
if (pathView) entry.set("view", pathView);
$("source").value = entry.get("mode") === "recorded" ? "recorded" : "live";
$("profile").value =
  entry.get("view") === "review"
    ? "broker"
    : entry.get("view") === "lend"
      ? "lender"
      : "borrower";
if (entry.has("view") || $("source").value === "recorded")
  document.body.classList.remove("welcome");
if (role() === "broker") $("source").value = "live";
function enterWorkspace(selectedRole) {
  $("profile").value = selectedRole;
  document.body.classList.remove("welcome");
  const url = new URL(location.href);
  url.pathname = selectedRole === "lender" ? "/lend" : selectedRole === 'broker' ? '/review' : "/borrow";
  url.searchParams.delete("view");
  url.searchParams.set("mode", "live");
  history.replaceState(null, "", url);
  sourceChanged("live");
  setPage("overview");
  $('chat-input')?.focus();
}
function notice(text, error = false) {
  $("notice").hidden = !text;
  $("notice").textContent = text;
  $("notice").className = "notice" + (error ? " error" : "");
}
function requestError(text) {
  $("request-error").hidden = !text;
  $("request-error").textContent = text;
}
function activeIntake() {
  const requests = privateRequests();
  if (selectedLoanId) return requests.find(r => r.clientRequestId === selectedLoanId);
  return undefined; // A new visitor must explicitly select a shared request.
}
function activeId() {
  return selectedLoanId ?? activeIntake()?.clientRequestId ?? (role() === 'lender' ? state?.cycle?.requestId : undefined);
}
function selected() {
  if (state?.mode === 'recorded') return customerLoan(state, [], true);
  const id = activeId();
  if (role() !== 'lender' && !privateRequests().some(r => r.clientRequestId === id)) return undefined;
  return state?.requests.find(r => r.agreement.requestId === id);
}
function relatedUrl(path, id = activeId()) {
  const query = new URLSearchParams({mode: state?.mode ?? 'live'});
  if (id) query.set('request', id);
  return path + '?' + query;
}
function chooseRequest(id) {
  selectedLoanId = id || undefined;
  const url = new URL(location.href); if(id)url.searchParams.set('request', id);else url.searchParams.delete('request'); history.replaceState(null, '', url);
  closeReview(); render();
}

function role() {
  return $("profile").value;
}
function setPage(value) {
  page = value;
  for (const name of ["overview", "requests", "activity"])
    $(name + "-page").hidden = name !== value;
  document.querySelectorAll("[data-page]").forEach((b) => {
    if (b.dataset.page === value) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  render();
}
function sourceChanged(value) {
  inboxSequence++;
  const changed = value !== (state?.mode ?? $("source").value);
  if (changed) selectedLoanId = undefined;
  $("source").value = value;
  const url = new URL(location.href);
  if (changed) url.searchParams.delete('request');
  url.searchParams.set("mode", value);
  history.replaceState(null, "", url);
  closeReview();
  void refresh();
}
function empty(title, description, button = "") {
  return `<div class='card empty'><div class='feature-icon' aria-hidden='true'>↗</div><h2>${esc(title)}</h2><p class='subtitle'>${esc(description)}</p>${button}</div>`;
}
function hasAccess() {
  return access?.role === role() && role() !== "lender";
}
function privateRequests() {
  return hasAccess() && $("source").value === "live"
    ? (intake?.requests ?? [])
    : [];
}
function syncLabel(snapshot) {
 return freshnessLabel(snapshot, activeId());
}
function rowStatus(request) {
  const loan=state.requests.find(r=>r.agreement.requestId===request.clientRequestId);
  return loan ? loanOutcome(loan,cycleFor(state,request.clientRequestId)).label : state.bridgeByRequest?.[request.clientRequestId] ? 'Preparing offer' : intakeStates[request.status].label;
}

function render() {
  if (!state || state.mode !== $('source').value) return;
  renderedExpiryKey = expiryKey(state);
  const openDetails = new Set([...document.querySelectorAll('details[open]:not(#assistant-wrap)')].map(d=>d.querySelector('summary')?.textContent));
  const r = selected(), selectedIntake = activeIntake(), id = r?.agreement.requestId ?? activeId();
  const c = id ? cycleFor(state,id) : null, bridge = state.bridgeByRequest?.[id];
  const borrower = role() === 'borrower', lender = role() === 'lender', recorded = state.mode === 'recorded';
  const context = {request:r, intake:selectedIntake, cycle:c, bridge, mode:state.mode};
  const story = financingJourney(context);
  document.body.dataset.workspace = recorded ? 'example' : role();
  $('role-heading').textContent = recorded ? 'COMPLETED EXAMPLE' : borrower ? 'BORROWER WORKSPACE' : lender ? 'LENDER WORKSPACE' : 'REVIEWER WORKSPACE';
  $('role-switch').href = relatedUrl(recorded ? lender ? '/borrow' : '/lend' : role() === 'broker' ? '/borrow' : '/review',id);
  $('role-switch').textContent = recorded ? lender ? 'Open borrower example ↗' : 'Open liquidity example ↗' : role() === 'broker' ? 'Open borrower view ↗' : 'Open reviewer view ↗';
  $('profile-label').hidden = !recorded;
  $('profile').querySelector('option[value="broker"]').hidden = recorded;
  $('workspace-name').textContent = recorded ? 'Completed test loan' : lender ? 'Lender · Follow your capital' : borrower ? 'Borrower · Request and track' : 'Reviewer · Review and coordinate';
  $('source-note').textContent = r?.mode === 'fixture' ? 'Simulated fixture · No live ledger result claimed' : recorded ? 'Recorded example · Real test-network transactions · Read-only' : state.hosting?.openDemo ? 'Shared demo · Test money only' : 'Local demo · Synthetic requests · Test XRP only';
  $('operator-link').href = relatedUrl('/operator',id);
  $('access-button').textContent = hasAccess() ? 'Lock workspace' : role() === 'broker' ? 'Open review inbox' : 'Open my requests';
  $('access-button').hidden = lender || recorded || state.hosting?.openDemo;
  $('requests-label').textContent = role() === 'broker' ? 'Review inbox' : state.hosting?.openDemo ? 'Shared requests' : 'My requests';
  document.querySelectorAll('[data-page=requests]').forEach(b=>b.hidden=lender);
  $('page-eyebrow').textContent = recorded ? 'FOLLOW THE COMPLETED EXAMPLE' : borrower ? 'ROOM FOR YOUR NEXT STEP' : lender ? 'CAPITAL, WITH CLARITY' : 'A CLEAR DECISION AT EVERY STEP';
  $('page-title').textContent = page === 'activity' ? 'The story behind the loan.' : page === 'requests' ? role() === 'broker' ? 'Your review inbox.' : 'Requests, all in one place.' : recorded ? lender ? 'From contribution to return.' : 'From agreement to repayment.' : lender ? 'See where your money goes.' : borrower ? 'Your next step starts here.' : 'Help each request move forward.';
  $('page-subtitle').textContent = page === 'activity' ? 'The agreement, funding and later payments, with the evidence behind each.' : page === 'requests' ? 'Open a request to see its details, current state and next action.' : borrower ? 'Ask for what you need. Understand the offer. Follow every payment.' : lender ? 'Keep your contribution, earned interest and fees in view.' : 'Check the request, coordinate the offer, and follow execution.';
  $('new-request').hidden = !borrower || page === 'activity' || recorded;
  $('sync-note').textContent = available ? syncLabel(state) : 'Connection paused · Last recorded facts retained';
  const choices = recorded ? [] : lender ? state.requests.map(q=>({clientRequestId:q.agreement.requestId,requestedDrops:q.agreement.terms.principalDrops})) : privateRequests();
  $('request-context').innerHTML = choices.length ? '<label>Following request <select id="customer-request-picker" aria-label="Following request">'+(!lender?'<option value="" '+(!id?'selected':'')+'>'+(borrower?'New request':'Choose a request')+'</option>':'')+choices.map(q=>'<option value="'+esc(q.clientRequestId)+'" '+(q.clientRequestId===id?'selected':'')+'>'+esc(shortId(q.clientRequestId))+' · '+esc(amount(q.requestedDrops))+'</option>').join('')+'</select></label><a href="'+esc(relatedUrl('/operator',id))+'">Open this record in admin ↗</a>' : '';
  if(choices.length)$('request-context').innerHTML='<details><summary>Other requests</summary>'+$('request-context').innerHTML+'</details>';
  if (!recorded && !lender && hasAccess() && !privateAvailable) $('overview-content').innerHTML = empty(inboxLoaded ? 'Request connection paused.' : 'Opening the shared requests…',inboxLoaded ? 'Your saved requests are retained. Reconnect before making a decision.' : 'Reading the current request and review status.');
  else if (lender) { renderLender(r,c); if(r) $('overview-content').insertAdjacentHTML('afterbegin',journeyPanel(context)); }
  else {
    const controls = r ? '<button class="primary" data-loan>View exact offer →</button>' : selectedIntake ? '<button class="primary" data-intake="'+esc(id)+'">'+(borrower?'View request':'Open review')+' →</button>' : borrower ? '<button class="primary" data-new>Request funding →</button>' : '<a class="secondary button-link" href="/borrow" target="_blank" rel="noopener">Open borrower view ↗</a>';
    const counts = privateRequests();
    const metrics = !borrower && !recorded ? '<div class="queue-metrics"><div><strong>'+counts.filter(q=>q.status==='AWAITING_REVIEW').length+'</strong><span>Waiting for review</span></div><div><strong>'+counts.filter(q=>q.status==='UNDER_REVIEW').length+'</strong><span>Being reviewed</span></div><div><strong>'+counts.filter(q=>q.status==='REVIEWED').length+'</strong><span>Review complete</span></div></div>' : '';
    $('overview-content').innerHTML = journeyPanel(context,controls) + metrics + walletPanel(r,state.mode,walletReadings) + (r ? '<div class="dashboard-grid">'+loanCard(r,c,loanOutcome(r,c))+journeyCard(r,story)+'</div>'+proofCards(r,state.mode,relatedUrl('/operator',id)+'&tab=evidence') : borrower && !selectedIntake ? borrowerStart() : '') + (!recorded && (!borrower || privateRequests().length) ? '<div class="section-heading"><h2>'+(!borrower?'Review inbox':'Shared requests')+'</h2><button class="text-button" data-open-page="requests">View all →</button></div>'+requestList(true) : '');
  }
  $('requests-content').innerHTML = requestList(false);
  const guide=authorizationGuide(role(),Boolean(state.hosting));
  const currentJourney=$('overview-content').querySelector('.journey-panel');
  if(currentJourney) currentJourney.insertAdjacentHTML('afterend',guide);
  else $('overview-content').insertAdjacentHTML('afterbegin',guide);
  if(lender && r) $('overview-content').insertAdjacentHTML('beforeend',proofCards(r,state.mode,relatedUrl('/operator',r.agreement.requestId)+'&tab=evidence'));
  $('activity-content').innerHTML = activity(r,c);
  $('advanced-link').href=relatedUrl('/operator',id);
  document.querySelectorAll('[data-intention]').forEach(b=>{if(b.dataset.intention===role())b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  $('page-title').textContent=page==='overview'?(borrower?(r?'Your loan':selectedIntake?'Your request':'What do you need?'):lender?'Your lending':'Review requests'):$('page-title').textContent;
  if(role()==='broker'){
    const identity=document.createElement('section');identity.className='identity-card';
    identity.innerHTML='<h3>Wallet & identity evidence</h3><p><strong>KYC not performed</strong> · Synthetic demo accounts.</p><p class="hash">Wallet: '+esc(r?.agreement.accounts.borrower??'Not prepared for this request')+'</p><p>Wallet control: '+(r?'Backend-managed test account':'Not established')+'</p><p>Identity commitment: not recorded. No identity issuer is connected.</p>'+(r?'<details><summary>Agreement document commitment (not KYC)</summary><p class="hash">'+esc(r.agreement.documentCommitment)+'</p></details>':'');
    $('overview-content').querySelector('.journey-panel')?.after(identity);
  }
  const details=document.createElement('details');details.className='workspace-details';
  const summary=document.createElement('summary');summary.textContent='Details';details.append(summary);
  const moneyCard=$('overview-content').querySelector('.loan-card');if(moneyCard)$('overview-content').querySelector('.journey-panel')?.after(moneyCard);
  for(const node of [...$('overview-content').children]) if(!node.classList.contains('journey-panel')&&!node.classList.contains('loan-card'))details.append(node);
  $('overview-content').insertAdjacentHTML('beforeend',simpleProofs(r));
  $('overview-content').append(details);
  const panel=$('overview-content').querySelector('.journey-panel');
  if(panel){
    const explanation=panel.querySelector('.journey-lead > div > p:not(.eyebrow)');
    const progress=panel.querySelector('.lifecycle');
    const next=panel.querySelector('.next-action > div');
    for(const node of [explanation,progress,next])if(node)details.append(node);
    if(r){const action=panel.querySelector('.next-action');if(action)details.append(action);}
    if(story.withdrawn)panel.querySelector('h2').textContent='All done. Your loan is repaid.';
    else if(story.repaid)panel.querySelector('h2').textContent='Loan repaid.';
    else if(story.funded)panel.querySelector('h2').textContent='Your money arrived.';
  }
  const chatWrap=$('assistant-wrap'), chatKey=[role(),state.mode,id??'new'].join(':');
  if(chatWrap.dataset.context!==chatKey){chatWrap.dataset.context=chatKey;chatWrap.open=!id;}
  document.querySelector('.conversation-layout').dataset.hasRecord=String(Boolean(id));

  conversation.update({role:role(),mode:state.mode,id,revision:selectedIntake?.revision,instanceId:state.instanceId});
  if (pending && !$('request-dialog').open) notice('A submission still needs confirmation. Open Request funding to recover the same request.',true);
  document.querySelectorAll('details:not(#assistant-wrap)').forEach(d=>{if(openDetails.has(d.querySelector('summary')?.textContent))d.open=true;});
  updateReview();
}

function borrowerStart() {
  return '<div class="help-grid"><section class="card help-card"><span class="feature-icon" aria-hidden="true">↗</span><div><h3>One request, two perspectives</h3><p>You ask for funding. A reviewer checks the request. Both views follow the same record.</p><a class="text-button" href="/review" target="_blank" rel="noopener">Explore the reviewer workspace ↗</a></div></section><section class="card help-card"><span class="feature-icon" aria-hidden="true">✓</span><div><h3>Understand before you commit</h3><p>The local operator prepares the exact offer and handles test transactions after explicit approval. The progress appears here.</p><a class="text-button" href="/?mode=recorded">Explore a completed example →</a></div></section></div>';
}

function loanCard(r, c, outcome) {
  return `<section class='card loan-card'><div class='card-head'><div><p class='eyebrow'>BUSINESS FUNDING</p><h2>${outcome.repaid ? "Loan repaid" : outcome.funded ? "Money received" : "Your loan agreement"}</h2></div>${badge(outcome.label, outcome.tone)}</div><div class='big-amount'>${esc(drops(outcome.funded ? r.funding.borrowerFundingDrops : r.agreement.terms.principalDrops))}<span>test XRP</span></div><dl class='facts'>${fact("Interest rate per year", r.agreement.terms.interestRate / 1000 + "%")}${fact("Repayment", outcome.repaid ? "Complete" : outcome.funded ? "In progress" : "Not started")}${fact("Agreement", "Version " + r.agreement.documentVersion)}</dl><div class='card-bottom'><p class='hint'>${esc(outcome.description)}</p><button class='text-button' data-loan>View agreement →</button></div></section>`;
}
function journeyCard(r) {
  const b = state.bridgeByRequest?.[r.agreement.requestId], intake = privateRequests().find(q=>q.clientRequestId===r.agreement.requestId);
  const requestedDays = intake?.requestedDays ?? b?.requestedDays;
  const offer = r.agreement.terms.paymentInterval, changed = requestedDays && offer !== requestedDays*86400;
  const approval = (who) => state.mode === 'recorded' ? 'Signature checked in saved evidence' : exactApproval(r,who) ? 'Exact approval recorded' : 'Approval not recorded';
  return '<section class="card"><p class="eyebrow">THE OFFER, IN PLAIN WORDS</p><h2>Same amount. Exact terms.</h2><dl class="costs">'+(requestedDays?fact('Originally requested',requestedDays+' days'):'')+fact('Offered repayment interval',duration(offer))+fact('Borrower',approval('borrower'))+fact('Reviewer / broker',approval('broker'))+'</dl>'+(changed?'<p class="receipt-alert">Accelerated demo offer: '+esc(duration(offer))+' instead of '+requestedDays+' days. This difference must be explicitly approved.</p>':'')+'<p class="hint">A viewed offer is not an approval. The local operator records explicit decisions for the exact terms.</p></section>';
}

function renderLender(r, c) {
  const { deposited, redeemed } = lenderOutcome(c);
  if (!deposited) {
    $("overview-content").innerHTML =
      `<section class='card next-step-card'><p class='eyebrow'>THE IDEA</p><h2>You provide money. A business borrows it.</h2><p class='subtitle'>If the business repays as agreed, you receive your contribution back plus interest. Interest is the amount paid for borrowing.</p><div class='risk-grid'><div><h3>The return is not guaranteed</h3><p>A borrower might pay late or fail to repay. You could lose money.</p></div><div><h3>Your money may be unavailable</h3><p>Money that has been lent out cannot always be withdrawn when you want it.</p></div></div><p class='plain-note'>You cannot add money through this customer demo yet. You can explore the completed test loan to see a deposit, repayment and withdrawal.</p><a class='primary button-link' href='/?mode=recorded&view=lend'>Explore the lender example →</a></section>`;
    return;
  }
  $("overview-content").innerHTML =
    `<div class='dashboard-grid'><section class='card loan-card'><div class='card-head'><div><p class='eyebrow'>YOUR LENDING POSITION</p><h2>${redeemed ? "Money returned" : "Money provided"}</h2></div>${badge(redeemed ? "Withdrawn" : "Deposited", "green")}</div><div class='big-amount'>${esc(drops(redeemed ? c.yield?.withdrawnDrops : c.depositDrops))}<span>test XRP</span></div><dl class='facts'>${fact("Money provided", amount(c.depositDrops))}${fact("Interest before fees", c.yield ? amount(c.yield.realisedYieldDrops) : "Not yet observed")}${fact("Status", redeemed ? "Redeemed" : "Open")}</dl><div class='card-bottom'><p class='hint'>Interest is shown before network fees.</p><button class='text-button' data-open-page='activity'>View activity →</button></div></section><section class='card'><p class='eyebrow'>YOUR CAPITAL JOURNEY</p><h2>From deposit to return.</h2><ol class='journey'>${[
      [true, "Capital deposited", "Your contribution entered the vault."],
      [
        Boolean(r?.funding.status === "funded"),
        "Loan funded",
        "Vault funds supported the demo borrower.",
      ],
      [
        redeemed,
        "Capital withdrawn",
        "Principal and realised interest returned.",
      ],
    ]
      .map(
        ([done, title, description], i) =>
          `<li><span class='step ${done ? "done" : ""}'>${done ? "✓" : i + 1}</span><div><h3>${title}</h3><p>${description}</p></div></li>`,
      )
      .join(
        "",
      )}</ol></section></div><div class='metric-row'><div class='card'><span class='eyebrow'>INTEREST EARNED BEFORE FEES</span><strong>${c.yield ? esc(c.yield.realisedYieldDrops) + " drops" : "Not observed"}</strong><p class='hint'>1 XRP = 1,000,000 drops.</p></div><div class='card'><span class='eyebrow'>FEE TO WITHDRAW</span><strong>${c.yield ? esc(c.yield.withdrawalFeeDrops) + " drops" : "Not observed"}</strong><p class='hint'>Other transaction fees are separate.</p></div><div class='card'><span class='eyebrow'>AVAILABLE TO WITHDRAW NOW</span><strong>Not checked</strong><p class='hint'>Current vault cash is not polled. Position value alone does not guarantee liquidity.</p></div></div>`;
}
function requestList(compact) {
  if (state.mode === "recorded")
    return empty(
      "Start your own test request.",
      "The completed demonstration is read-only. New requests are saved in this backend’s live workspace.",
      `<button class='primary' data-live>Open live workspace →</button>`,
    );
  if (!hasAccess())
    return empty(
      role() === "broker"
        ? "Open your review inbox."
        : "Your requests belong here.",
      "Enter the code given to you by the person hosting the demo.",
      `<button class='primary' data-access>${role() === "broker" ? "Open review inbox" : "Open my requests"} →</button>`,
    );
  const requests = privateRequests();
  if (!privateAvailable)
    return empty(
      inboxLoaded ? "Request inbox unavailable." : "Opening the shared requests…",
      inboxLoaded ? "Your saved requests have not been removed. Reconnect before reviewing or submitting." : "Reading the current request and review status.",
    );
  if (!requests.length)
    return empty(
      role() === "broker"
        ? "No requests to review yet."
        : "You have not sent a request yet.",
      role() === "broker"
        ? "Requests sent by the demo borrower will appear here. Both participants must use the same backend."
        : "Start with an amount and a purpose. The broker will review your request.",
      role() === "borrower"
        ? `<button class='primary' data-new>Request financing ↗</button>`
        : "",
    );
  return `<div class='card request-list'><div class='list-header'>${role() === "broker" ? "REVIEW INBOX" : "SHARED DEMO REQUESTS"} · ${requests.length}</div>${requests
    .slice(0, compact ? 4 : 100)
    .map(
      (r) =>
        `<div class='request-row'><div><h3>${esc(purposes[r.purpose])}</h3><p>Request ${esc(shortId(r.clientRequestId))} · ${date(r.createdAt)}</p></div><div><strong>${esc(drops(r.requestedDrops))} test XRP</strong><p>${r.requestedDays} days requested</p></div><div>${badge(rowStatus(r), state.requests.some(q=>q.agreement.requestId===r.clientRequestId) ? loanOutcome(state.requests.find(q=>q.agreement.requestId===r.clientRequestId),cycleFor(state,r.clientRequestId)).tone : intakeStates[r.status].tone)}</div><button class='secondary' data-intake='${esc(r.clientRequestId)}'>${role() === "broker" ? "Review request" : "View request"}</button></div>`,
    )
    .join(
      "",
    )}</div><p class='hint'>Review status is separate from loan approval. Sending or reviewing a request does not create a loan or move money.</p>`;
}
function activity(r,c) {
  const intake=activeIntake(), id=r?.agreement.requestId ?? activeId();
  if (!r && !intake && !c) return empty('Your story starts with a request.','Submitted details, review decisions and later ledger events will appear here.');
  const intakeHistory = intake ? '<section class="card"><p class="eyebrow">REQUEST & REVIEW</p><h2>Decisions kept in order.</h2><ol class="operation-history">'+intake.history.map(e=>'<li><span class="operation-dot">✓</span><div><h3>'+esc({'submitted':'Request submitted','start-review':'Reviewer started checking','request-revision':'Revision requested','finish-review':'Review completed'}[e.event])+'</h3><p>'+esc(fullTime(e.at))+' · '+esc(e.role)+'</p></div></li>').join('')+'</ol></section>' : '';
  return intakeHistory + trackOneEvidence(r,c) + '<div class="section-heading"><h2>Money movement & preparation</h2></div><section class="card">'+setupSummary(c)+operationHistory(r,c,state.network.explorer)+'</section>' + (r ? proofCards(r,state.mode,relatedUrl('/operator',id)+'&tab=evidence')+'<div class="record-links"><section class="card"><h3>Exact agreement</h3><p class="hint">Version '+r.agreement.documentVersion+'. All rates, fees and signature commitments remain available.</p><button class="text-button" data-loan>View agreement →</button></section><section class="card"><h3>Keep the evidence</h3><p class="hint">'+(state.mode==='recorded'?'Download the synthetic bundle for independent checks.':'This request’s private export is prepared by the local operator. The completed example has its own separate bundle.')+'</p>'+(state.mode==='recorded'?'<a class="text-button" href="/api/evidence/published" download="synthetic-supplier-001.json">Download example evidence ↓</a>':'<a class="text-button" href="'+esc(relatedUrl('/operator',id)+'&tab=evidence')+'">Open evidence in admin ↗</a>')+'</section></div>':'') + '<p class="evidence-note">A document match, an authority receipt and a ledger result answer different questions. This history keeps them separate. Records shown here are saved observations; a page refresh is not an online verification.</p>';
}
async function refresh() {
  const ticket = cursor.begin($("source").value);
  try {
    const response = await fetch("/api/state?mode=" + $("source").value, {
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw Error();
    const next = await response.json();
    if (!cursor.accept(ticket, next)) return;
    const changed =
      !available ||
      !state ||
      state.instanceId !== next.instanceId ||
      state.revision !== next.revision ||
      state.mode !== next.mode || renderedExpiryKey !== expiryKey(next);
    state = next;
    if (next.hosting?.openDemo && role() !== "lender" && access?.role !== role()) {
      inboxSequence++;
      access = {role: role(), token: ""};
    }
    available = true;
    if (changed) render();
    else
      $("sync-note").textContent =
        syncLabel(next);
  } catch {
    if (ticket !== cursor.sequence) return;
    available = false;
    $("sync-note").textContent =
      "Connection paused · Last recorded facts retained";
    updateReview();
  }
  await loadIntake();
}
async function loadIntake() {
  if (!hasAccess() || $("source").value !== "live") return;
  const session = access, ticket = ++inboxSequence;
  try {
    const response = await fetch("/api/intake?role=" + session.role, {
      headers: session.token ? { Authorization: "Bearer " + session.token } : {},
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw Error();
    const next = await response.json();
    if (!currentInboxResponse(ticket, inboxSequence, session, access, $("source").value)) return;
    const changed =
      !privateAvailable ||
      JSON.stringify(intake?.requests) !== JSON.stringify(next.requests) ||
      intake?.instanceId !== next.instanceId;
    intake = next;
    inboxLoaded = true;
    privateAvailable = true;
    if (
      pending &&
      next.requests.some((r) => r.clientRequestId === pending.clientRequestId)
    ) {
      clearPending();
      notice(
        "Your request was found in the saved inbox. No duplicate was created.",
      );
    }
    if (changed) render();
    updateReview();
  } catch {
    if (!currentInboxResponse(ticket, inboxSequence, session, access, $("source").value)) return;
    privateAvailable = false;
    inboxLoaded = true;
    render();
  }
}
async function openAccess() {
  if (!state) await refresh();
  if (state?.hosting?.openDemo) { await loadIntake(); if (draft && $("request-dialog").open) showDraftReview(); else setPage("requests"); return; }
  if (role() === "lender") return;
  $("access-description").textContent =
    role() === "broker"
      ? "Use the review team's code to open the shared request inbox."
      : "Use your requester code to send and find your requests. The demo host can give it to you.";
  $("access-code").value = "";
  $("access-error").hidden = true;
  $("access-dialog").showModal();
}
function closeAccess() {
  $("access-code").value = "";
  $("access-dialog").close();
}
$("access-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const selectedRole = role(),
    token = $("access-code").value;
  $("access-code").value = "";
  $("access-submit").disabled = true;
  try {
    const response = await fetch("/api/intake?role=" + selectedRole, {
      headers: { Authorization: "Bearer " + token },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw Error();
    const next = await response.json();
    if (role() !== selectedRole) return;
    inboxSequence++;
    access = { role: selectedRole, token };
    intake = next;
    privateAvailable = true;
    closeAccess();
    if (draft && $("request-dialog").open) showDraftReview();
    render();
    notice("Your requests are open. You can continue.");
  } catch {
    $("access-error").textContent =
      "The workspace could not be opened. Check the role code with the demo operator and try again.";
    $("access-error").hidden = false;
  } finally {
    $("access-submit").disabled = false;
  }
});
$("access-button").addEventListener("click", () => {
  if (hasAccess()) {
    inboxSequence++;
    access = undefined;
    intake = undefined;
    privateAvailable = false;
    closeReview();
    render();
    notice("Workspace locked. Access code cleared from this tab.");
  } else openAccess();
});
$("access-close").addEventListener("click", closeAccess);
$("access-dialog").addEventListener("cancel", () => {
  $("access-code").value = "";
});
function clearPending() {
  pending = undefined;
  try {
    localStorage.removeItem(pendingKey);
  } catch {}
}
function showDraftReview() {
  $("request-fields").hidden = true;
  $("amount").required = false;
  $("request-summary").hidden = false;
  $("request-back").hidden = Boolean(pending);
  $("request-step").textContent = "YOUR REQUEST / STEP 2 OF 2";
  $("request-title").textContent = "Check your request.";
  $("request-intro").textContent =
    "The review team will receive these details. You are not agreeing to borrow money yet.";
  $("request-summary").innerHTML =
    `<div class='summary-box'><dl>${fact("Requested amount", amount(draft.requestedDrops))}${fact("When you would like to repay", draft.requestedDays + " days")}${fact("Business purpose", purposes[draft.purpose])}${fact("What you will repay", "You will see the full cost in an offer")}</dl></div><p class='hint'>You will decide whether to accept an offer later. Sending this request does not commit you to a loan. ${pending ? "An earlier submission has an uncertain outcome. Retrying keeps the same request ID." : ""}</p>`;
  $("request-next").textContent = pending
    ? "Retry same request"
    : hasAccess()
      ? "Send for review"
      : "Continue with my code";
}
function openRequest() {
  if (role() !== "borrower") return;
  sourceChanged("live");
  draft = pending ? structuredClone(pending) : undefined;
  requestError("");
  $("request-next").disabled = false;
  if (draft) showDraftReview();
  else {
    $("request-form").reset();
    $("request-fields").hidden = false;
    $("amount").required = true;
    $("request-summary").hidden = true;
    $("request-back").hidden = true;
    $("request-step").textContent = "YOUR REQUEST / STEP 1 OF 2";
    $("request-title").textContent = "What does your business need?";
    $("request-intro").textContent =
      "Start with what you need. Sending a request does not commit you to a loan.";
    $("request-next").textContent = "Review request →";
  }
  $("request-dialog").showModal();
}
$("request-back").addEventListener("click", () => {
  draft = undefined;
  $("request-fields").hidden = false;
  $("amount").required = true;
  $("request-summary").hidden = true;
  $("request-back").hidden = true;
  $("request-title").textContent = "What does your business need?";
  $("request-step").textContent = "YOUR REQUEST / STEP 1 OF 2";
  $("request-intro").textContent = "Start with what you need. Sending a request does not commit you to a loan.";
  $("request-next").textContent = "Review request →";
  requestError("");
});
$("request-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (sending) return;
  requestError("");
  if (!draft) {
    try {
      draft = {
        clientRequestId: "request-" + crypto.randomUUID(),
        requestedDrops: amountToDrops($("amount").value.trim()),
        requestedDays: Number($("term").value),
        purpose: new FormData($("request-form")).get("purpose"),
        synthetic: true,
      };
      showDraftReview();
    } catch (error) {
      requestError(error.message);
    }
    return;
  }
  if (!hasAccess()) {
    openAccess();
    return;
  }
  if (!available || !privateAvailable) {
    requestError(
      "Reconnect to your request inbox before sending. Your entered details are retained.",
    );
    return;
  }
  pending = structuredClone(draft);
  try {
    localStorage.setItem(pendingKey, JSON.stringify(pending));
  } catch {
    requestError(
      "Browser storage is unavailable. Keep this tab open if the submission needs recovery.",
    );
  }
  sending = true;
  $("request-next").disabled = true;
  $("request-close").disabled = true;
  $("request-back").disabled = true;
  try {
    const response = await fetch("/api/intake", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(access.token ? {Authorization: "Bearer " + access.token} : {}),
      },
      body: JSON.stringify(pending),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      const error = await response.json();
      throw Error(error.error ?? "Request not confirmed");
    }
    const created = await response.json();
    selectedLoanId = created.clientRequestId;
    const url = new URL(location.href); url.searchParams.set('request', selectedLoanId); history.replaceState(null, '', url);
    clearPending();
    draft = undefined;
    $("request-dialog").close();
    await loadIntake();
    setPage("overview");
    notice(
      "Request sent for review. You can follow the broker’s response here. No funds have moved.",
    );
  } catch (error) {
    requestError(
      error.message +
        ". Keep the same request and retry after checking your inbox.",
    );
    showDraftReview();
  } finally {
    sending = false;
    $("request-next").disabled = false;
    $("request-close").disabled = false;
    $("request-back").disabled = false;
  }
});
$("request-close").addEventListener("click", () => {
  $("request-dialog").close();
});
$("request-dialog").addEventListener("cancel", (e) => {
  if (sending) e.preventDefault();
});
function openIntake(id) {
  chooseRequest(id);
  const request = privateRequests().find((r) => r.clientRequestId === id);
  if (!request) return;
  review = {
    kind: "intake",
    instanceId: intake.instanceId,
    request: structuredClone(request),
  };
  $("review-eyebrow").textContent = "FINANCING REQUEST / " + shortId(id);
  $("review-title").textContent = purposes[request.purpose];
  $("review-content").innerHTML =
    `${badge(intakeStates[request.status].label, intakeStates[request.status].tone)}<div class='summary-box'><dl>${fact("Requested amount", amount(request.requestedDrops))}${fact("When you would like to repay", request.requestedDays + " days")}${fact("Submitted", fullTime(request.createdAt))}${fact("Loan terms", state.requests.some(q=>q.agreement.requestId===id) ? "Offer available" : "Awaiting preparation")}</dl></div><p class='subtitle'>${esc(financingJourney({request:state.requests.find(q=>q.agreement.requestId===id),intake:request,cycle:cycleFor(state,id),bridge:state.bridgeByRequest?.[id],mode:state.mode}).description)}</p><ol class='journey'>${request.history.map((h, i) => `<li><span class='step done'>✓</span><div><h3>${esc({ submitted: "Request submitted", "start-review": "Broker review started", "request-revision": "Revision requested", "finish-review": "Intake review completed" }[h.event])}</h3><p>${esc(fullTime(h.at))}</p></div></li>`).join("")}</ol>`;
  $("approval-consent").hidden = true;
  $("approval-check").checked = false;
  const decisions =
    role() === "broker"
      ? request.status === "AWAITING_REVIEW"
        ? [["start-review", "Start review"]]
        : request.status === "UNDER_REVIEW"
          ? [
              ["request-revision", "Request revision"],
              ["finish-review", "Mark reviewed"],
            ]
          : []
      : [];
  $("review-actions").innerHTML =
    decisions
      .map(
        ([decision, label]) =>
          `<button class='${decision === "request-revision" ? "secondary" : "primary"}' data-decision='${decision}'>${label}</button>`,
      )
      .join("") || `<button class='secondary' data-close-review>Done</button>`;
  if (role() === "broker")
    $("review-content").innerHTML +=
      `<p class='hint'>Marking intake reviewed does not approve credit or create loan terms. Native preparation and its exact approvals are separate.</p>`;
  const progress=state.bridgeByRequest?.[id];const native=cycleFor(state,id);
  if(progress) $('review-content').innerHTML += '<h3>Native preparation</h3><p class="hint">Published '+esc(fullTime(progress.publishedAt))+' · '+esc(progress.stage)+'</p><dl class="costs">'+fact(native?.steps.deposit?.resultCode==='tesSUCCESS'?'Lender deposit confirmed':'Planned lender deposit',native?amount(native.depositDrops):'Not confirmed')+fact(native?.steps.cover?.resultCode==='tesSUCCESS'?'Broker cover confirmed':'Planned broker cover',native?amount(native.coverDrops):'Not confirmed')+'</dl><ol class="journey">'+['vault','deposit','broker','cover'].map(name=>'<li><div><h3>'+esc(name)+'</h3><p>'+esc(native?.steps[name]?.resultCode??'Awaiting confirmation')+'</p></div></li>').join('')+'</ol>';
  const linked = state.requests.find(r=>r.agreement.requestId===id);
  if(native?.steps['deposit-initial-refusal']) $('review-content').innerHTML += '<p class="hint">Setup recovery: the first deposit was refused with '+esc(native.steps['deposit-initial-refusal'].resultCode)+'. Its transaction is retained. A separate test-wallet top-up and deposit completed the setup.</p>';
  if(linked) $('review-actions').innerHTML += `<button class='primary' data-linked-loan='${esc(id)}'>View loan agreement →</button>`;
  $("review-warning").hidden = true;
  $("review-dialog").showModal();
  updateReview();
}
function openLoan() {
  const r = selected();
  if (!r) return;
  const action = r.actions.find((a) => a.id === "approve/" + role());
  review = {
    kind: "loan",
    instanceId: state.instanceId,
    requestId: r.agreement.requestId,
    agreementHash: r.agreementHash,
    transactionDigest: r.transactionDigest,
    request: structuredClone(r),
    action: action?.allowed ? action : undefined,
  };
  const a = r.agreement,
    t = a.terms;
  $("review-eyebrow").textContent =
    "LOAN AGREEMENT / VERSION " + a.documentVersion;
  $("review-title").textContent = "Know exactly what you agree to.";
  const rates = [
    ["Annual interest", t.interestRate],
    ["Late interest", t.lateInterestRate],
    ["Early close interest", t.closeInterestRate],
    ["Overpayment interest", t.overpaymentInterestRate],
    ["Overpayment fee rate", t.overpaymentFee],
  ];
  const fees = [
    ["Origination fee", t.originationFeeDrops],
    ["Per-payment service fee", t.serviceFeeDrops],
    ["Late-payment fee", t.latePaymentFeeDrops],
    ["Early close fee", t.closePaymentFeeDrops],
  ];
  $("review-content").innerHTML =
    `<div class='summary-box'><dl>${fact("Loan principal", amount(t.principalDrops))}${fact("Interest rate per year", t.interestRate / 1000 + "%")}${fact("Payments", t.paymentTotal + " × every " + t.paymentInterval + " seconds")}${fact("Grace period", t.gracePeriod + " seconds")}</dl></div><h3>Rates, costs and limits</h3><dl class='costs'>${fees.map(([label, value]) => fact(label, amount(value))).join("")}${rates
      .slice(1)
      .map(([label, value]) => fact(label, value / 1000 + "%"))
      .join(
        "",
      )}${fact("Network transaction fee", amount(r.preparedTransaction.Fee))}${fact("Approval expires", fullTime(a.expiresAt))}${fact("Transaction expires", "After ledger " + r.preparedTransaction.LastLedgerSequence)}${fact("Network", "Event network " + a.network.networkId)}${fact("Transaction sequence", r.preparedTransaction.Sequence)}${fact("Loan flags", t.flags)}</dl><details><summary>Accounts and exact agreement identifiers</summary><p class='hash'>Borrower: ${esc(a.accounts.borrower)}<br>Broker: ${esc(a.accounts.broker)}<br>Lender: ${esc(a.accounts.lender)}<br>Agreement: ${esc(r.agreementHash)}<br>Transaction digest: ${esc(r.transactionDigest)}<br>Document commitment: ${esc(a.documentCommitment)}<br>Vault: ${esc(a.vaultId)}<br>Loan broker: ${esc(a.loanBrokerId)}</p></details><p class='hint'>${state.mode === "recorded" ? "This completed agreement is read-only. Both transaction signatures were checked in the published evidence." : "The backend holds the demo signing keys. Your approval is an application permission for these exact terms; selecting a role alone does not approve."}</p>`;
  const intakeRequest=privateRequests().find(x=>x.clientRequestId===a.requestId);
  const approvals=['broker','borrower'].map(role=>fact(role==='broker'?'Reviewer approval':'Borrower approval',state.mode==='recorded'?'Signature checked in saved evidence':exactApproval(r,role)?'Exact terms approved':'Awaiting exact approval')).join('');
  $('review-content').innerHTML += '<h3>Request, offer and decisions</h3><dl class="costs">'+(intakeRequest?fact('Originally requested',intakeRequest.requestedDays+' days')+fact('Offered repayment interval',t.paymentInterval+' seconds'):'')+approvals+'</dl>'+(intakeRequest&&t.paymentInterval!==intakeRequest.requestedDays*86400?'<p class="notice">Demo counter-offer: the repayment period differs from the original request. Approval applies to this offered period.</p>':'')+(state.hosting?'<p class="hint">The local operator records your explicit approval and executes the native loan. Viewing this agreement does not approve or sign it.</p>':'');
  const canApprove = state.mode === "live" && action?.allowed && Date.parse(a.expiresAt) > Date.now();
  $("approval-consent").hidden = !canApprove;
  $("approval-check").checked = false;
  $("review-actions").innerHTML = canApprove
    ? `<button class='primary' data-approve disabled>Approve exact agreement</button>`
    : `<button class='secondary' data-close-review>Done</button>`;
  $("review-warning").hidden = true;
  $("review-dialog").showModal();
  updateReview();
}
function closeReview() {
  $("review-dialog").close();
  review = undefined;
  $("approval-check").checked = false;
}
function updateReview() {
  if (!review) return;
  const valid =
    review.kind === "intake"
      ? privateAvailable && intakeReviewMatches(review, intake)
      : review.action
        ? available && Date.parse(review.request.agreement.expiresAt) > Date.now() && sameReview(review, state)
        : available && review.instanceId === state.instanceId && JSON.stringify(review.request) === JSON.stringify(state.requests.find(r=>r.agreement.requestId===review.requestId));
  $("review-warning").hidden = valid;
  $("review-warning").textContent =
    "The request changed or the connection needs to be restored. Close this review and open the current version.";
  document
    .querySelectorAll("[data-decision],[data-approve]")
    .forEach(
      (button) =>
        (button.disabled =
          sending ||
          !valid ||
          (button.hasAttribute("data-approve") &&
            !$("approval-check").checked)),
    );
}
async function applyReview(decision) {
  if (!review || sending) return;
  if (!hasAccess()) {
    openAccess();
    return;
  }
  const current = review;
  if (
    current.kind === "intake"
      ? !privateAvailable || !intakeReviewMatches(current, intake)
      : !available ||
        !sameReview(current, state) ||
        !$("approval-check").checked
  )
    return;
  const path =
    current.kind === "intake"
      ? "/api/intake/" + current.request.clientRequestId + "/review"
      : "/api/requests/" + current.requestId + "/approve/" + role();
  const input =
    current.kind === "intake"
      ? {
          expectedRevision: current.request.revision,
          requestDigest: current.request.requestDigest,
          decision,
        }
      : {
          agreementHash: current.agreementHash,
          transactionDigest: current.transactionDigest,
        };
  sending = true;
  updateReview();
  $("review-close").disabled = true;
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(access.token ? {Authorization: "Bearer " + access.token} : {}),
      },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      const result = await response.json();
      throw Error(result.error ?? "Action not confirmed");
    }
    closeReview();
    notice(
      current.kind === "intake"
        ? "Review saved. The borrower’s request view will update."
        : "Your exact approval was recorded. Funding follows the remaining agreement checks.",
    );
  } catch (error) {
    notice(error.message + ". Refresh the request before retrying.", true);
    closeReview();
  } finally {
    sending = false;
    $("review-close").disabled = false;
    await refresh();
  }
}
$("review-close").addEventListener("click", closeReview);
$("review-dialog").addEventListener("cancel", (e) => {
  if (sending) e.preventDefault();
  else review = undefined;
});
$("approval-check").addEventListener("change", updateReview);
$("new-request").addEventListener("click", openRequest);
$("source").addEventListener("change", () => {
  sourceChanged($("source").value);
});
$("profile").addEventListener("change", () => {
  access = undefined;
  intake = undefined;
  privateAvailable = false;
  closeReview();
  notice("");
  if (role() === "broker") sourceChanged("live");
  if (role() === "lender" && page === "requests") page = "overview";
  setPage(page);
});
// Event delegation keeps controls usable as fresh backend snapshots replace cards.
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if(b.hasAttribute('data-balance')) {const r=selected();if(r){const work=walletReadings.read(r,state.mode);render();void work.then(()=>render());}return;}
  if (b.dataset.enter) enterWorkspace(b.dataset.enter);
  if(b.dataset.intention){
    $('profile').value=b.dataset.intention;access=undefined;intake=undefined;privateAvailable=false;closeReview();notice('');
    const url=new URL(location.href);url.pathname=b.dataset.intention==='broker'?'/review':b.dataset.intention==='lender'?'/lend':'/borrow';history.replaceState(null,'',url);
    if(role()==='broker')sourceChanged('live');else void refresh();setPage('overview');
  }
  if (b.dataset.page) setPage(b.dataset.page);
  if (b.dataset.openPage) setPage(b.dataset.openPage);
  if (b.hasAttribute("data-new")) openRequest();
  if (b.hasAttribute("data-access")) openAccess();
  if (b.hasAttribute("data-live")) sourceChanged("live");
  if (b.hasAttribute("data-completed")) sourceChanged("recorded");
  if (b.dataset.intake) openIntake(b.dataset.intake);
  if (b.hasAttribute("data-loan")) openLoan();
  if (b.dataset.linkedLoan) {chooseRequest(b.dataset.linkedLoan);openLoan();}
  if (b.hasAttribute("data-close-review")) closeReview();
  if (b.dataset.decision) void applyReview(b.dataset.decision);
  if (b.hasAttribute("data-approve")) void applyReview();
});
document.addEventListener('change', e => { if(e.target.id === 'customer-request-picker') chooseRequest(e.target.value); });
let nextPollAt = 0;
setInterval(async () => {
  if (document.hidden || pollBusy || Date.now() < nextPollAt) return;
  nextPollAt = Date.now() + (state?.hosting?.sharedIntake ? 10000 : 3000);
  pollBusy = true;
  try {
    await refresh();
  } finally {
    pollBusy = false;
  }
}, 3000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) void refresh();
});
void refresh();
