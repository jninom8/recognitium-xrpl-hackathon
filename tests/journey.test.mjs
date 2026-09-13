import {test} from 'node:test';
import assert from 'node:assert/strict';
import {financingJourney, exactApproval, ledgerHistory} from '../web/journey-model.mjs';
import {journeyPanel, proofCards, operationHistory, trackOneEvidence, simpleProofs} from '../web/journey-view.mjs';
import {readFile} from 'node:fs/promises';
// Explicit presentation fixtures. No ledger transaction is created by these tests.
const now=Date.parse('2026-09-13T10:00:00Z');
const request=()=>({agreement:{requestId:'A',expiresAt:'2026-09-13T11:00:00Z'},agreementHash:'agreement-A',transactionDigest:'tx-A',funding:{status:'unfunded'},phase:'AGREEMENT_LOCKED',approvals:[],checks:{contentHash:'consistent',receiptAuthority:'unchecked'}});
const success={hash:'A'.repeat(64),resultCode:'tesSUCCESS',ledgerIndex:10};
test('simple proof cards separate receipt authority from XRPL funding and link only fixed authorities',()=>{
  const r=request();r.agreementReceipt={receiptId:'DG-'+'a'.repeat(32),authorityCheckedAt:'2026-09-13T09:00:00Z'};
  let html=simpleProofs(r);assert.match(html,/Agreement receipt checked/);assert.match(html,/Money transfer not confirmed/);
  assert.ok(html.includes(`href="https://www.recognitium.com/verify?id=${r.agreementReceipt.receiptId}"`));
  r.checks.receiptAuthority='failed';r.funding.status='funded';r.transaction=success;
  html=simpleProofs(r);assert.match(html,/Receipt check failed/);assert.match(html,/Money transfer confirmed/);
  r.agreementReceipt.receiptId='javascript:alert(1)';assert.doesNotMatch(simpleProofs(r),/href="javascript/);
});
test('same lifecycle facts preserve funded state through expiry and missing receipt, repayment and return',()=>{
  const r={...request(),funding:{status:'funded'},agreement:{...request().agreement,expiresAt:'2020-01-01'}};
  let story=financingJourney({request:r,now});
  assert.equal(story.funded,true);assert.equal(story.receiptPending,true);assert.match(story.next,/Recover/);assert.doesNotMatch(story.title,/expired/);
  const c={requestId:'A',steps:{'repay-late':success,withdraw:{...success,hash:'B'.repeat(64)}},yield:{realisedYieldDrops:'20'}};
  story=financingJourney({request:r,cycle:c,now});assert.equal(story.withdrawn,true);assert.match(story.next,/Recover/);
  assert.equal(financingJourney({request:r,cycle:{...c,requestId:'B'},now}).repaid,false);
});
test('unsigned expiry, stored signatures and incomplete ledger history get different next actions',()=>{
  const r=request();r.agreement.expiresAt='2020-01-01';
  assert.match(financingJourney({request:r,now}).title,/offer has expired/);
  r.phase='SIGNED';r.funding.status='unknown';r.transaction={hash:'A'};
  assert.match(financingJourney({request:r,now}).title,/reconciliation/);
  r.phase='EXPIRED_UNRESOLVED';
  assert.match(financingJourney({request:r,now}).next,/Do not create a replacement/);
  r.agreement.expiresAt='2026-09-13T11:00:00Z';r.phase='SIGNED';
  const signed=financingJourney({request:r,now});assert.equal(signed.steps[2].done,true);assert.equal(signed.steps[3].done,false);
});
test('approval is request-bound and recorded evidence never invents a human approval',()=>{
  const r=request();r.approvals=[{role:'borrower',agreementHash:'other',transactionDigest:'tx-A'},{role:'broker',agreementHash:'agreement-A',transactionDigest:'tx-A'}];
  assert.equal(exactApproval(r,'borrower'),false);assert.equal(financingJourney({request:r,now}).approved,false);
  r.approvals=[];r.transaction={hash:'A'};r.funding.status='funded';
  const saved=financingJourney({request:r,mode:'recorded',now});assert.equal(saved.steps[2].done,true);assert.equal(saved.approvals.some(a=>a.approved),false);
});
test('review and preparation remain visible before an agreement exists',()=>{
  const intake={clientRequestId:'A',status:'REVIEWED'};
  const story=financingJourney({intake,now});assert.match(story.title,/Offer comes next/);assert.equal(story.funded,false);
  assert.match(financingJourney({intake,bridge:{requestId:'A'},now}).title,/Preparing/);
  assert.match(financingJourney({intake:{...intake,status:'NEEDS_REVISION'},now}).next,/new request/);
});
test('all native operations and refusals survive presentation; aliases do not duplicate a transfer',()=>{
  const c={steps:{vault:{...success,hash:'V'},'deposit-initial-refusal':{hash:'F',resultCode:'tecINSUFFICIENT_FUNDS',ledgerIndex:11},'lender-topup':{...success,hash:'T',ledgerIndex:12},'deposit-funded':{...success,hash:'D',ledgerIndex:13},deposit:{...success,hash:'D',ledgerIndex:13},broker:{...success,hash:'B',ledgerIndex:14},cover:{...success,hash:'C',ledgerIndex:15},repay:{hash:'R',ledgerIndex:19,resultCode:'tecEXPIRED'},'repay-late':{...success,hash:'L',ledgerIndex:20},withdraw:{...success,hash:'W',ledgerIndex:21}},refusal:{hash:'F2',resultCode:'tecINSUFFICIENT_FUNDS'}};
  const events=ledgerHistory({transaction:{...success,hash:'LOAN',ledgerIndex:16}},c);
  assert.equal(events.length,11);assert.equal(events.filter(e=>e.hash==='D').length,1);
  assert.ok(events.some(e=>e.resultCode==='tecEXPIRED'));assert.ok(events.some(e=>e.id==='refusal'));
});
test('presentation escapes untrusted IDs and keeps receipt authority failure distinct from funding',()=>{
  const r=request();r.agreement.requestId='<img src=x onerror=alert(1)>';
  assert.doesNotMatch(journeyPanel({request:r,now}),/<img/);
  r.funding.status='funded';r.checks.receiptAuthority='failed';r.executionReceipt={receiptId:'fixture',authorityCheckedAt:'2026-09-12T12:00:00Z'};
  const html=proofCards(r,'live','/operator');assert.match(html,/Check failed/);assert.match(html,/Funding confirmed/);
  assert.doesNotMatch(operationHistory({transaction:{hash:'javascript:alert(1)'}},null,'javascript:alert(1)'),/href=/);
  assert.match(operationHistory({transaction:success},null,'https://custom.xrpl.org/lending-hackathon.dev.ripplex.io:51233/'),new RegExp('/transactions/'+success.hash));
});
test('real published backend projection passes through the same presentation used by both frontends',async()=>{
  const {Dashboard,readPublishedBundle}=await import('../dist/src/server/dashboard.js');
  const {initialHealth}=await import('../dist/src/server/health.js');
  const d=new Dashboard({records:async()=>({cycle:null,requests:[]}),health:initialHealth,connected:()=>false,published:readPublishedBundle});
  const s=await d.snapshot('recorded'),r=s.requests[0];
  const view=financingJourney({request:r,cycle:s.cycle,mode:s.mode,now});
  assert.equal(view.withdrawn,true);assert.equal(view.receiptPending,false);
  const html=journeyPanel({request:r,cycle:s.cycle,mode:s.mode,now});assert.match(html,/Loan complete/);
  const proof=proofCards(r,s.mode,'/operator');
  assert.match(proof,/Funding confirmed/);assert.match(proof,/offline hash match is not enough/);
  assert.match(proof,/Offline consistency does not independently prove ledger inclusion/);
  const history=ledgerHistory(r,s.cycle);assert.ok(history.some(e=>e.id==='cover'));assert.ok(history.some(e=>e.id==='refusal'));
  assert.equal(s.cycle.yield.realisedYieldDrops,'20');
  assert.equal((trackOneEvidence(r,s.cycle).match(/>Recorded</g)||[]).length,6);
  assert.equal((trackOneEvidence({...r,agreement:{...r.agreement,requestId:'another-request'}},s.cycle).match(/>Recorded</g)||[]).length,0);
  const wire=JSON.stringify(s);for(const privateField of ['"seed"','"documentBase64"','"documentSalt"','"signedBlob"'])assert.equal(wire.includes(privateField),false);
  for(const file of ['journey-model.mjs','journey-view.mjs','journey.css'])assert.match(await readFile('scripts/build-hosted.mjs','utf8'),new RegExp(file.replaceAll('.','\\.')));
});
test('a receipt without a valid authority observation never becomes an authenticated source in the UI',()=>{
  const r=request();r.funding.status='funded';
  for(const authorityCheckedAt of [undefined,'','not-a-time']) {
    r.executionReceipt={receiptId:'explicit-fixture',authorityCheckedAt};
    const html=proofCards(r,'recorded','/operator');
    assert.match(html,/Authority check pending/);assert.doesNotMatch(html,/Authority check recorded/);
    assert.match(html,/Funding confirmed/);assert.doesNotMatch(html,/Invalid Date/);
  }
});
