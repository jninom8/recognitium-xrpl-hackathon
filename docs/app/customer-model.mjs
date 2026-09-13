export const purposes = {
  inventory: "Buy inventory or materials",
  receivables: "Wait for a customer to pay",
  "working-capital": "Cover everyday expenses",
};
export const intakeStates = {
  AWAITING_REVIEW: {
    label: "Sent for review",
    description:
      "Your request has been sent. Next, the review team will check it. You have not agreed to borrow anything.",
    tone: "amber",
  },
  UNDER_REVIEW: {
    label: "Under review",
    description:
      "The review team is checking your request. There is no offer to accept yet.",
    tone: "amber",
  },
  NEEDS_REVISION: {
    label: "Revision requested",
    description:
      "The review team needs a different request. You can send a new request with updated details; it will be reviewed separately.",
    tone: "amber",
  },
  REJECTED: {label:"Request declined",description:"The admin declined this request. No loan was created.",tone:"amber"},
  REVIEWED: {
    label: "Review complete",
    description:
      "Your request has been reviewed. The local operator can prepare an exact offer for both roles to approve. No loan has been funded merely by completing this review.",
    tone: "neutral",
  },
};
export function amountToDrops(value) {
  if (!/^(0|[1-9][0-9]{0,4})(\.[0-9]{1,6})?$/.test(value))
    throw new Error("Enter an amount with up to six decimal places.");
  const [whole, fraction = ""] = value.split(".");
  const amount = BigInt(whole) * 1000000n + BigInt(fraction.padEnd(6, "0"));
  if (amount < 1000000n || amount > 10000000000n)
    throw new Error("Choose between 1 and 10,000 test XRP.");
  return amount.toString();
}
export function loanOutcome(request, cycle) {
  if (!request)
    return {
      label: "No financing yet",
      description: "Start with a request. Review the terms before you commit.",
      tone: "neutral",
      funded: false,
      repaid: false,
    };
  const funded = request.funding.status === "funded";
  const repaid =
    funded &&
    (cycle?.steps.repay?.resultCode === "tesSUCCESS" ||
      cycle?.steps["repay-late"]?.resultCode === "tesSUCCESS");
  if (repaid)
    return {
      label: "Repaid",
      description:
        "Your repayment was recorded. Your agreement and funding records remain available.",
      tone: "green",
      funded,
      repaid,
    };
  if (funded)
    return {
      label: "Funds received",
      description: request.executionReceipt
        ? "Funding is confirmed and its receipt is available."
        : "Funding is confirmed. Its receipt is still being recovered.",
      tone: "green",
      funded,
      repaid,
    };
  if (request.phase === 'SIGNED')
    return { label: 'Signed; funding not confirmed', description: 'Both signatures are stored. The local operator must submit or reconcile the same transaction.', tone: 'amber', funded, repaid };
  if (request.funding.status === "unknown")
    return {
      label: "Confirming funding",
      description:
        "The transaction outcome is still being checked. A second loan will not be started automatically.",
      tone: "amber",
      funded,
      repaid,
    };
  if (request.funding.status === "refused")
    return {
      label: "Funding declined by the ledger",
      description:
        "The recorded transaction did not fund this loan. Review its outcome with the broker.",
      tone: "amber",
      funded,
      repaid,
    };
  if (Date.parse(request.agreement.expiresAt) <= Date.now())
    return {
      label: "Offer expired",
      description:
        "These terms can no longer be approved. A new offer requires a new review.",
      tone: "amber",
      funded,
      repaid,
    };
  return {
    label: "Agreement ready to review",
    description:
      "Check the amount, repayment terms and costs before approving.",
    tone: "neutral",
    funded,
    repaid,
  };
}
export function intakeReviewMatches(review, snapshot) {
  const request = snapshot?.requests.find(
    (r) => r.clientRequestId === review.request.clientRequestId,
  );
  return (
    snapshot?.instanceId === review.instanceId &&
    request?.revision === review.request.revision &&
    request?.requestDigest === review.request.requestDigest
  );
}
export function lenderOutcome(cycle) {
  const deposited = cycle?.steps.deposit?.resultCode === "tesSUCCESS";
  return {
    deposited,
    redeemed:
      deposited &&
      cycle?.steps.withdraw?.resultCode === "tesSUCCESS" &&
      Boolean(cycle.yield),
  };
}

/** A shared demo's historical loan must never appear as a new visitor's loan. */
export function customerLoan(snapshot, requests, example = false) {
  if (!snapshot) return undefined;
  if (example)
    return snapshot.mode === "recorded" ? snapshot.requests[0] : undefined;
  if (snapshot.mode !== "live") return undefined;
  return snapshot.requests.find((loan) =>
    requests.some(
      (request) => request.clientRequestId === loan.agreement.requestId,
    ),
  );
}

/** Only the latest inbox response for the current role and mode may be applied. */
export function currentInboxResponse(ticket, latest, session, active, mode) {
  return ticket === latest && session === active && mode === "live";
}

/** Reset only browser navigation. Never abandon an uncertain intake. */
export function restartDemoUrl(currentUrl,pending=false,sending=false){
  if(pending||sending)throw Error('A submission needs checking first. Open Borrower to recover it.');
  const url=new URL(currentUrl);url.searchParams.delete('request');url.searchParams.delete('view');url.searchParams.set('mode','live');url.searchParams.set('new','1');return url.href;
}
