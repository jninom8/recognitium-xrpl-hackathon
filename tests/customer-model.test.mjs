import { test } from "node:test";
import assert from "node:assert/strict";
import {
  amountToDrops,
  loanOutcome,
  lenderOutcome,
  intakeReviewMatches,
  intakeStates,
} from "../web/customer-model.mjs";

test("customer amounts remain exact and pending receipts do not hide received funds", () => {
  assert.equal(amountToDrops("100.000001"), "100000001");
  for (const value of [
    "0.5",
    "1e2",
    "1.0000001",
    "10000.000001",
    " 100",
    "1,000",
  ])
    assert.throws(() => amountToDrops(value));
  const request = {
    funding: { status: "funded" },
    agreement: { expiresAt: "2020-01-01" },
  };
  assert.equal(loanOutcome(request, null).label, "Funds received");
  assert.match(loanOutcome(request, null).description, /still being recovered/);
  assert.equal(
    loanOutcome(request, {
      steps: { "repay-late": { resultCode: "tesSUCCESS" } },
    }).label,
    "Repaid",
  );
  assert.equal(
    loanOutcome({ ...request, funding: { status: "unknown" } }, null).label,
    "Confirming funding",
  );
  assert.equal(intakeStates.REVIEWED.label, "Review complete");
  assert.match(intakeStates.REVIEWED.description, /No loan has been funded/);
  assert.equal(
    lenderOutcome({ steps: { deposit: { resultCode: "tecEXPIRED" } } })
      .deposited,
    false,
  );
  assert.equal(
    lenderOutcome({ steps: { deposit: { resultCode: "tesSUCCESS" } } })
      .redeemed,
    false,
  );
});
test("broker review becomes stale after an intake change or backend restart", () => {
  const request = {
    clientRequestId: "example",
    requestDigest: "exact-details",
    revision: 2,
  };
  const review = { instanceId: "one", request };
  const snapshot = { instanceId: "one", requests: [request] };
  assert.equal(intakeReviewMatches(review, snapshot), true);
  assert.equal(
    intakeReviewMatches(review, { ...snapshot, instanceId: "two" }),
    false,
  );
  assert.equal(
    intakeReviewMatches(review, {
      ...snapshot,
      requests: [{ ...request, revision: 3 }],
    }),
    false,
  );
  assert.equal(
    intakeReviewMatches(review, {
      ...snapshot,
      requests: [{ ...request, requestDigest: "changed" }],
    }),
    false,
  );
});
