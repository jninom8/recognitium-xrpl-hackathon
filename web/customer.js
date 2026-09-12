import { SnapshotCursor, sameReview, drops } from "/state-client.mjs";
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
let inboxSequence = 0;
const pendingKey = "recognitium.synthetic-intake.pending.v1";
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
  url.searchParams.set("view", selectedRole === "lender" ? "lend" : "borrow");
  url.searchParams.set("mode", "live");
  history.replaceState(null, "", url);
  sourceChanged("live");
  setPage("overview");
  if (selectedRole === "borrower") openRequest();
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
function selected() {
  return customerLoan(
    state,
    privateRequests(),
    $("source").value === "recorded",
  );
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
  $("source").value = value;
  const url = new URL(location.href);
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
function render() {
  if (!state || state.mode !== $("source").value) return;
  const r = selected(),
    c = $("source").value === "recorded" || r ? state.cycle : undefined,
    outcome = loanOutcome(r, c),
    borrower = role() === "borrower",
    lender = role() === "lender";
  const recorded = state.mode === "recorded";
  $("profile-label").hidden = !recorded;
  $("profile").querySelector('option[value="broker"]').hidden = recorded;
  $("workspace-name").textContent = recorded
    ? "Explore an example"
    : lender
      ? "Providing funding"
      : borrower
        ? "Your funding request"
        : "Team review area";
  $("source-note").textContent = recorded
    ? "Example · A completed loan using test money. This is not your loan."
    : "Demo · test money. Use made-up business details only.";
  if (!recorded && state.hosting?.sharedIntake) $("source-note").textContent = "Shared demo · Requests sync between participants. Test money only.";
  if (r?.mode === "fixture")
    $("source-note").textContent =
      "Simulated fixture workspace · No live ledger result is claimed";
  $("operator-link").href = "/operator?mode=" + state.mode;
  $("access-button").textContent = hasAccess()
    ? "Lock workspace"
    : role() === "broker" ? "Open review inbox" : "Open my requests";
  $("access-button").hidden = lender || recorded || state.hosting?.openDemo;
  $("requests-label").textContent =
    role() === "broker" ? "Review inbox" : "My requests";
  document.querySelector("[data-page=requests]").hidden = lender;
  $("page-eyebrow").textContent = recorded
    ? "A REAL TEST TRANSACTION, EXPLAINED"
    : borrower
      ? "ONE STEP AT A TIME"
      : lender
        ? "BEFORE YOU PROVIDE FUNDING"
        : "REQUESTS TO REVIEW";
  $("page-title").textContent =
    page === "activity"
      ? "History & documents."
      : page === "requests"
        ? role() === "broker"
          ? "Requests to review."
          : "Your requests."
        : lender
          ? recorded
            ? "What the lender received."
            : "Help a business move forward."
          : borrower
            ? recorded
              ? "From request to repayment."
              : "A little room to move forward."
            : "Requests, ready for your review.";
  $("page-subtitle").textContent =
    page === "requests"
      ? "See where things stand and what happens next."
      : page === "activity"
        ? "Your agreement and payment history, in one place."
        : lender
          ? recorded
            ? "The original amount, the return and the fees, shown separately."
            : "Understand where the money goes, what you might earn and what could go wrong."
          : borrower
            ? recorded
              ? "Follow a completed example. No money moves when you explore it."
              : "Tell us what you need. See the full cost before you agree."
            : "Review the business request before preparing any loan terms.";
  $("new-request").hidden = !borrower || page === "activity" || recorded;
  $("sync-note").textContent = available
    ? "Updated " + new Date(state.observedAt).toLocaleTimeString()
    : "Connection paused · Last recorded facts retained";
  if (lender) renderLender(r, c);
  else if (borrower && !recorded && !r) {
    $("overview-content").innerHTML = borrowerStart();
  } else if (!borrower)
    $("overview-content").innerHTML =
      requestList(true) +
      `<div class='section-heading'><h2>Agreed financing</h2></div>` +
      (r
        ? loanCard(r, c, outcome)
        : empty(
            "No loan terms prepared yet",
            "Intake review comes first. Preparing and approving a loan is a separate step.",
          ));
  else {
    $("overview-content").innerHTML =
      (r
        ? `<div class='dashboard-grid'>${loanCard(r, c, outcome)}${journeyCard(r, outcome)}</div>`
        : empty(
            "Give your next step some room.",
            "Tell us what your business needs. You will see the terms before deciding to borrow.",
            `<button class='primary' data-new>Request financing ↗</button>`,
          )) +
      `<div class='section-heading'><h2>Built around your next step</h2><button class='text-button' data-open-page='requests'>My requests →</button></div><div class='help-grid'><div class='card help-card'><span class='feature-icon' aria-hidden='true'>↗</span><div><h3>Start with what you need</h3><p>Choose an amount, a purpose and a repayment window. A broker reviews your request before loan terms are prepared.</p><button class='text-button' data-new>Start a request →</button></div></div><div class='card help-card'><span class='feature-icon' aria-hidden='true'>✓</span><div><h3>Your agreement stays connected</h3><p>Find the agreed version and the record of funding together, even after your loan has been repaid.</p><button class='text-button' data-open-page='activity'>View your records →</button></div></div></div>`;
  }
  $("requests-content").innerHTML = requestList(false);
  $("activity-content").innerHTML = activity(r, c);
  if (pending && !$("request-dialog").open)
    notice(
      "A request submission still needs confirmation. Choose Request funding to recover or retry that same request.",
      true,
    );
  updateReview();
}
function borrowerStart() {
  const requests = privateRequests();
  if (hasAccess() && requests.length) return requestList(false);
  return `<section class='card next-step-card'><p class='eyebrow'>HOW IT WORKS</p><h2>You stay in control.</h2><ol class='simple-steps'><li><span>1</span><div><h3>Tell us what you need</h3><p>Choose an amount, what it is for and when you would like to pay it back.</p></div></li><li><span>2</span><div><h3>Follow the review</h3><p>Switch to the review area to check the request. The same progress appears in both views.</p></div></li><li><span>3</span><div><h3>Understand what comes next</h3><p>Review is not loan approval. A future offer must show every cost before both sides agree.</p></div></li></ol><p class='plain-note'>Available now: request and review together. New offers and funding are not connected to this website yet. Explore the completed example to follow a real test loan.</p></section><p class='help-line'>Already sent a request? <button class='text-button' data-access>Open my requests →</button></p>`;
}
function loanCard(r, c, outcome) {
  return `<section class='card loan-card'><div class='card-head'><div><p class='eyebrow'>BUSINESS FUNDING</p><h2>${outcome.repaid ? "Loan repaid" : outcome.funded ? "Money received" : "Your loan agreement"}</h2></div>${badge(outcome.label, outcome.tone)}</div><div class='big-amount'>${esc(drops(outcome.funded ? r.funding.borrowerFundingDrops : r.agreement.terms.principalDrops))}<span>test XRP</span></div><dl class='facts'>${fact("Interest rate per year", r.agreement.terms.interestRate / 1000 + "%")}${fact("Repayment", outcome.repaid ? "Complete" : outcome.funded ? "In progress" : "Not started")}${fact("Agreement", "Version " + r.agreement.documentVersion)}</dl><div class='card-bottom'><p class='hint'>${esc(outcome.description)}</p><button class='text-button' data-loan>View agreement →</button></div></section>`;
}
function journeyCard(r, outcome) {
  const signed = Boolean(r.transaction);
  const steps = [
    [
      signed,
      "Agreement signed",
      signed
        ? "Both transaction signatures are recorded."
        : "Review the terms before signing.",
    ],
    [
      outcome.funded,
      "Funds received",
      outcome.funded
        ? amount(r.funding.borrowerFundingDrops) + " received."
        : "Funding follows the signed agreement.",
    ],
    [
      outcome.repaid,
      "Repayment",
      outcome.repaid
        ? "Repayment recorded on the ledger."
        : "Follow the agreed payment schedule.",
    ],
  ];
  return `<section class='card'><p class='eyebrow'>YOUR LOAN JOURNEY</p><h2>Every step, together.</h2><ol class='journey'>${steps.map(([done, title, description], i) => `<li><span class='step ${done ? "done" : ""}' aria-hidden='true'>${done ? "✓" : i + 1}</span><div><h3>${title}</h3><p>${esc(description)}</p></div></li>`).join("")}</ol></section>`;
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
      "Request inbox unavailable.",
      "Your saved requests have not been removed. Reconnect before reviewing or submitting.",
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
  return `<div class='card request-list'><div class='list-header'>YOUR DEMO REQUESTS · ${requests.length}</div>${requests
    .slice(0, compact ? 4 : 100)
    .map(
      (r) =>
        `<div class='request-row'><div><h3>${esc(purposes[r.purpose])}</h3><p>Request ${esc(shortId(r.clientRequestId))} · ${date(r.createdAt)}</p></div><div><strong>${esc(drops(r.requestedDrops))} test XRP</strong><p>${r.requestedDays} days requested</p></div><div>${badge(intakeStates[r.status].label, intakeStates[r.status].tone)}</div><button class='secondary' data-intake='${esc(r.clientRequestId)}'>${role() === "broker" ? "Review request" : "View request"}</button></div>`,
    )
    .join(
      "",
    )}</div><p class='hint'>Review status is separate from loan approval. Sending or reviewing a request does not create a loan or move money.</p>`;
}
function activity(r, c) {
  if (!r)
    return empty(
      "Your financing history will appear here.",
      "A request under review is not a funded loan. Your agreement and payments will appear once they exist.",
    );
  const events = [];
  if (role() === "lender" && c?.steps.deposit)
    events.push({
      title:
        c.steps.deposit.resultCode === "tesSUCCESS"
          ? "Capital deposited"
          : "Deposit attempt",
      description:
        c.steps.deposit.resultCode === "tesSUCCESS"
          ? amount(c.depositDrops) + " deposited into the vault."
          : "This attempt did not establish a successful deposit.",
      ...c.steps.deposit,
    });
  if (r.transaction)
    events.push({
      title:
        r.funding.status === "funded" ? "Money received" : "Loan transaction",
      description:
        r.funding.status === "funded"
          ? amount(r.funding.borrowerFundingDrops) +
            " credited to the borrower."
          : "Check the recorded transaction outcome.",
      ...r.transaction,
    });
  for (const [key, value] of Object.entries(c?.steps ?? {})) {
    if (
      !["repay", "repay-late", "withdraw"].includes(key) ||
      (key === "withdraw" && role() === "borrower")
    )
      continue;
    events.push({
      title: {
        repay:
          value.resultCode === "tesSUCCESS"
            ? "Loan repaid"
            : "Scheduled payment declined",
        "repay-late":
          value.resultCode === "tesSUCCESS"
            ? "Loan repaid with late-payment handling"
            : "Late-payment attempt",
        withdraw:
          value.resultCode === "tesSUCCESS"
            ? "Lender capital returned"
            : "Withdrawal attempt",
      }[key],
      description:
        key === "repay" && value.resultCode === "tecEXPIRED"
          ? "The scheduled payment window had passed. The subsequent repayment is preserved below."
          : key === "withdraw" && value.resultCode === "tesSUCCESS"
            ? amount(c.yield?.withdrawnDrops) + " redeemed."
            : value.resultCode === "tesSUCCESS"
              ? "The repayment was confirmed on the ledger."
              : "Review the recorded outcome.",
      ...value,
    });
  }
  events.sort(
    (a, b) => (a.ledgerIndex ?? Infinity) - (b.ledgerIndex ?? Infinity),
  );
  return `<section class='card'><p class='eyebrow'>FINANCING ACTIVITY</p>${events.map((e) => `<div class='activity-row'><span class='feature-icon' aria-hidden='true'>${e.resultCode === "tesSUCCESS" ? "✓" : "↗"}</span><div class='activity-main'><h3>${esc(e.title)}</h3><p>${esc(e.description)}</p><details><summary>Transaction details</summary><p class='hash'>${esc(e.hash)}</p><p>${esc(e.resultCode ?? "Awaiting validation")} · Ledger ${esc(e.ledgerIndex ?? "not yet recorded")}</p></details></div>${badge(e.resultCode === "tesSUCCESS" ? "Confirmed" : e.resultCode ? "Declined" : "Pending", e.resultCode === "tesSUCCESS" ? "green" : "amber")}</div>`).join("")}</section><div class='section-heading'><h2>Your records</h2></div><div class='record-links'><section class='card'><h3>Loan agreement</h3><p class='hint'>Version ${r.agreement.documentVersion}. Review the terms associated with this loan.</p><button class='text-button' data-loan>View agreement →</button></section><section class='card'><h3>Funding receipt</h3><p class='hint'>${r.executionReceipt ? "A receipt is recorded for the funding execution. Authority checks and ledger checks remain separate." : "The funding receipt is pending. Established funding remains recorded."}</p><a class='text-button' href='/operator?mode=${state.mode}'>Inspect verification records ↗</a></section></div><p class='hint'>${state.mode === "recorded" ? "These are saved real test-network records, checked offline. A page refresh does not repeat every ledger and authority lookup." : "This view uses stored results. Service availability does not establish the outcome of an individual transaction."}</p>`;
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
      state.mode !== next.mode;
    state = next;
    if (next.hosting?.openDemo && role() !== "lender" && access?.role !== role()) {
      inboxSequence++;
      access = {role: role(), token: ""};
    }
    available = true;
    if (changed) render();
    else
      $("sync-note").textContent =
        "Updated " + new Date(next.observedAt).toLocaleTimeString();
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
    await response.json();
    clearPending();
    draft = undefined;
    $("request-dialog").close();
    await loadIntake();
    setPage("requests");
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
    `${badge(intakeStates[request.status].label, intakeStates[request.status].tone)}<div class='summary-box'><dl>${fact("Requested amount", amount(request.requestedDrops))}${fact("When you would like to repay", request.requestedDays + " days")}${fact("Submitted", fullTime(request.createdAt))}${fact("Loan terms", "Not prepared")}</dl></div><p class='subtitle'>${esc(intakeStates[request.status].description)}</p><ol class='journey'>${request.history.map((h, i) => `<li><span class='step done'>✓</span><div><h3>${esc({ submitted: "Request submitted", "start-review": "Broker review started", "request-revision": "Revision requested", "finish-review": "Intake review completed" }[h.event])}</h3><p>${esc(fullTime(h.at))}</p></div></li>`).join("")}</ol>`;
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
  const canApprove = state.mode === "live" && action?.allowed;
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
        ? available && sameReview(review, state)
        : true;
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
  if (b.dataset.enter) enterWorkspace(b.dataset.enter);
  if (b.dataset.page) setPage(b.dataset.page);
  if (b.dataset.openPage) setPage(b.dataset.openPage);
  if (b.hasAttribute("data-new")) openRequest();
  if (b.hasAttribute("data-access")) openAccess();
  if (b.hasAttribute("data-live")) sourceChanged("live");
  if (b.hasAttribute("data-completed")) sourceChanged("recorded");
  if (b.dataset.intake) openIntake(b.dataset.intake);
  if (b.hasAttribute("data-loan")) openLoan();
  if (b.hasAttribute("data-close-review")) closeReview();
  if (b.dataset.decision) void applyReview(b.dataset.decision);
  if (b.hasAttribute("data-approve")) void applyReview();
});
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
