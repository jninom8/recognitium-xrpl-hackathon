export const purposes = {
  inventory: "Purchase inventory",
  receivables: "Bridge a customer payment",
  "working-capital": "Working capital",
};
export const intakeStates = {
  AWAITING_REVIEW: {
    label: "Sent for review",
    description:
      "Your request is in the broker’s inbox. Loan terms have not been offered yet.",
    tone: "amber",
  },
  UNDER_REVIEW: {
    label: "Under review",
    description:
      "The broker is reviewing your requested amount, purpose and repayment window.",
    tone: "amber",
  },
  NEEDS_REVISION: {
    label: "Revision requested",
    description:
      "The broker has asked you to revisit the request. A revised request needs its own review.",
    tone: "amber",
  },
  REVIEWED: {
    label: "Review complete",
    description:
      "Your request has been reviewed. Exact loan terms still need to be prepared and approved. No loan has been funded from this request.",
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
