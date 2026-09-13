import { test } from "node:test";
import assert from "node:assert/strict";
import {
  amountToDrops,
  loanOutcome,
  lenderOutcome,
  intakeReviewMatches,
  intakeStates,
  customerLoan,
  restartDemoUrl,
} from "../web/customer-model.mjs";
test('restart clears selection only and refuses to abandon uncertain or active submissions',()=>{
  const current='https://demo.invalid/lend?mode=recorded&request=saved&view=lend';
  const reset=new URL(restartDemoUrl(current));
  assert.equal(reset.origin,'https://demo.invalid');assert.equal(reset.pathname,'/lend');
  assert.equal(reset.searchParams.get('mode'),'live');assert.equal(reset.searchParams.get('new'),'1');
  assert.equal(reset.searchParams.has('request'),false);
  assert.throws(()=>restartDemoUrl(current,true),/submission/);
  assert.throws(()=>restartDemoUrl(current,false,true),/submission/);
});

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
test("a new customer never inherits the shared historical demo loan", () => {
  const historical = { agreement: { requestId: "synthetic-supplier-001" } };
  const own = { agreement: { requestId: "request-own" } };
  const snapshot = { mode: "live", requests: [historical, own] };
  assert.equal(customerLoan(snapshot, [], false), undefined);
  assert.equal(
    customerLoan(snapshot, [{ clientRequestId: "request-other" }], false),
    undefined,
  );
  assert.equal(
    customerLoan(snapshot, [{ clientRequestId: "request-own" }], false),
    own,
  );
  assert.equal(customerLoan(snapshot, [], true), undefined);
  assert.equal(
    customerLoan({ ...snapshot, mode: "recorded" }, [], true),
    historical,
  );
  assert.equal(
    customerLoan(
      { ...snapshot, mode: "recorded" },
      [{ clientRequestId: "request-own" }],
      false,
    ),
    undefined,
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

 test('older inbox responses and responses after locking or changing mode are ignored', async () => {
 const {currentInboxResponse} = await import('../web/customer-model.mjs');
 const session = {};
 assert.equal(currentInboxResponse(1,2,session,session,'live'),false);
 assert.equal(currentInboxResponse(2,2,session,undefined,'live'),false);
 assert.equal(currentInboxResponse(2,2,session,session,'recorded'),false);
 assert.equal(currentInboxResponse(2,2,session,session,'live'),true);
 });
