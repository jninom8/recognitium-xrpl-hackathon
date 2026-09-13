/** Shared presentation of backend facts. This module never authorizes an action. */
export function exactApproval(request, role) {
  return Boolean(request?.approvals?.some(a => a.role === role && a.agreementHash === request.agreementHash && a.transactionDigest === request.transactionDigest));
}
export function duration(seconds) {
  if (seconds % 86400 === 0) return `${seconds / 86400} days`;
  if (seconds % 3600 === 0) return `${seconds / 3600} hours`;
  return `${seconds} seconds`;
}
export function financingJourney({ request: r, intake, cycle, bridge, mode = 'live', now = Date.now() } = {}) {
  // Reject a mismatched run even if a caller accidentally supplies one.
  const id = r?.agreement.requestId ?? intake?.clientRequestId ?? bridge?.requestId;
  const c = cycle && (!cycle.requestId || cycle.requestId === id) ? cycle : null;
  const succeeded = key => c?.steps?.[key]?.resultCode === 'tesSUCCESS';
  const funded = r?.funding.status === 'funded';
  const repaid = funded && (succeeded('repay') || succeeded('repay-late'));
  const withdrawn = repaid && succeeded('withdraw') && Boolean(c?.yield);
  const approved = exactApproval(r, 'broker') && exactApproval(r, 'borrower');
  const signed = Boolean(r?.transaction);
  const expired = Boolean(r && Date.parse(r.agreement.expiresAt) <= now);
  const receiptPending = funded && !r.executionReceipt;
  let title, description, next, owner, tone = 'neutral', focus = 0;
  if (funded) {
    focus = withdrawn ? 6 : repaid ? 5 : 4; tone = 'green';
    title = withdrawn ? 'Loan complete. Records stay with it.' : repaid ? 'Repaid. Ready for the lender’s return.' : 'Funding received.';
    description = withdrawn ? 'The borrower repaid and the lender withdrew capital with recorded interest.' : repaid ? 'Repayment is confirmed on the ledger. The withdrawal is a separate step.' : 'The ledger confirms money reached the borrower. Follow the agreed repayment schedule.';
    next = receiptPending ? 'Recover the existing funding receipt. Funding stays confirmed.' : withdrawn ? 'Explore the agreement, payments and verification records.' : repaid ? 'Withdraw the lender’s position and record the actual return.' : 'Make the scheduled repayment through the local operator.';
    owner = receiptPending || !withdrawn ? 'Local operator' : 'Everyone';
  } else if (r?.phase === 'EXPIRED_UNRESOLVED' || (r?.funding.status === 'unknown' && r.phase !== 'SIGNED')) {
    title = 'Checking the funding outcome.'; tone = 'amber'; focus = 3;
    description = 'The saved transaction has no conclusive outcome yet. An expired transaction is not proof that funding failed.';
    next = 'Reconcile the same transaction and its ledger history. Do not create a replacement loan.'; owner = 'Local operator';
  } else if (r?.funding.status === 'refused') {
    title = 'The ledger declined this loan.'; tone = 'amber'; focus = 3;
    description = 'The recorded loan transaction did not fund the borrower. Its result remains in the history.';
    next = 'Inspect the native result before deciding how to proceed.'; owner = 'Local operator';
  } else if (r?.phase === 'SIGNED') {
    title = expired ? 'Signed transaction needs reconciliation.' : 'Signed. Ready for submission.'; focus = 3; tone = expired ? 'amber' : 'neutral';
    description = 'Both transaction signatures are stored. A signature alone does not confirm funding.';
    next = expired ? 'Check the saved transaction. The original approval window has closed; do not sign a replacement.' : 'Submit the saved transaction once and confirm its ledger result.'; owner = 'Local operator';
  } else if (r && expired) {
    title = 'This offer has expired.'; tone = 'amber'; focus = 2;
    description = 'No borrower funding is recorded. The prepared vault and original offer remain in the history.';
    next = 'Ask the operator to resolve the expired offer and prepare fresh terms for approval. Automatic renewal is not available.'; owner = 'Local operator';
  } else if (r) {
    focus = 2;
    title = approved ? 'Both approvals are recorded.' : 'An offer is ready to review.';
    description = 'Compare the offer with the original request. Each person approves the exact terms before signing.';
    next = r.receiptRecovery?.pendingStage === 'agreement' ? 'Recover the pending agreement receipt by its existing ID.' : !approved ? 'Review the offer, then give explicit approval for each demo role to the local operator.' : !r.agreementReceipt ? 'Obtain and verify the agreement receipt before signing.' : 'Sign the approved transaction, then submit it for ledger validation.';
    owner = approved ? 'Local operator' : 'Borrower + reviewer';
  } else if (bridge) {
    title = 'Preparing the funding offer.'; focus = 1;
    description = 'The local operator is preparing the vault, lender deposit and broker cover. No loan is funded yet.';
    next = 'Complete the recorded setup and publish the exact offer.'; owner = 'Local operator';
  } else if (intake?.status === 'REVIEWED') {
    title = 'Review complete. Offer comes next.'; focus = 2;
    description = 'The business request has been reviewed. No loan has been funded from this request.';
    next = 'The local operator prepares an offer from this reviewed request. Both roles then approve its exact terms.'; owner = 'Local operator';
  } else if (intake?.status === 'REJECTED') {
    title='Request declined.';description='The admin declined this request. No loan was created.';next='You can make a new request.';owner='Borrower';focus=1;tone='amber';
  } else if (intake?.status === 'NEEDS_REVISION') {
    title = 'A revised request is needed.'; focus = 1; tone = 'amber';
    description = 'The reviewer asked for different details. The original request remains saved.';
    next = 'Send a new request with the revised details. It will be reviewed separately.'; owner = 'Borrower';
  } else if (intake) {
    title = intake.status === 'UNDER_REVIEW' ? 'Your request is being reviewed.' : 'Request received. Review is next.'; focus = 1;
    description = 'The same request and review progress appear in both workspaces. Sending it did not commit you to a loan.';
    next = intake.status === 'UNDER_REVIEW' ? 'Check the amount, purpose and requested duration, then complete the review or request a revision.' : 'Open the request and start the review.'; owner = 'Reviewer';
  } else {
    title = 'Start with what your business needs.'; focus = 0;
    description = 'Choose an amount, a purpose and when you would like to repay. You see the offer before deciding.';
    next = 'Send a synthetic request for review. No real money is used.'; owner = 'Borrower';
  }
  const reviewDone = Boolean(r || intake?.status === 'REVIEWED');
  const steps = [
    { title: 'Request', done: Boolean(intake || r), note: 'Amount, purpose and preferred duration' },
    { title: 'Review', done: reviewDone, note: 'Reviewer checks the request; operator prepares the offer' },
    { title: 'Agree', done: signed, note: 'Exact terms, both signatures and the agreement receipt' },
    { title: 'Receive', done: funded, note: 'XRPL confirms borrower funding' },
    { title: 'Repay', done: repaid, note: 'Repayment confirmed on XRPL' },
    { title: 'Return', done: withdrawn, note: 'Lender withdraws capital and observed interest' },
  ].map((s, i) => ({ ...s, status: s.done ? 'complete' : i === focus ? 'current' : 'waiting' }));
  return { id, title, description, next, owner, tone, steps, funded, repaid, withdrawn, expired, receiptPending, approved, recorded: mode === 'recorded', approvals: ['borrower', 'broker'].map(role => ({role, approved:exactApproval(r, role)})) };
}

const operationNames = {
  vault: 'Vault created', deposit: 'Lender money deposited', 'deposit-funded': 'Lender deposit recovered',
  'deposit-initial-refusal': 'Initial deposit declined', 'lender-topup': 'Test account topped up',
  broker: 'Loan broker configured', cover: 'Broker cover deposited',
  repay: 'Scheduled repayment', 'repay-late': 'Repayment with late-payment handling', withdraw: 'Lender withdrawal',
};
export function ledgerHistory(request, cycle) {
  const entries = Object.entries(cycle?.steps ?? {}).map(([id, tx]) => ({ ...tx, title: operationNames[id] ?? id, id }));
  if (request?.transaction) entries.push({ ...request.transaction, title: 'Borrower funding', id: 'fund' });
  if (cycle?.refusal) entries.push({ ...cycle.refusal, title: 'Withdrawal declined: liquidity guardrail', id: 'refusal' });
  // Recovery can retain two labels for the same successful deposit. Show the transaction once.
  const seen = new Map();
  for (const e of entries) {
    const prior = seen.get(e.hash);
    if (!prior || e.id === 'refusal') seen.set(e.hash, { ...prior, ...e });
  }
  return [...seen.values()].sort((a, b) => (a.ledgerIndex ?? Infinity) - (b.ledgerIndex ?? Infinity));
}
