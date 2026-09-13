import {test} from 'node:test';
import assert from 'node:assert/strict';
import {advanceAutomaticRound} from '../src/xrpl/automatic-round.js';
import type {Cycle} from '../src/xrpl/cycle.js';

function example() {
  const calls:string[]=[];
  const request:any={agreementHash:'a',transactionDigest:'t',phase:'AGREEMENT_LOCKED',approvals:[]};
  const native:any={requestId:'round',steps:{}};
  const cycle:any={cycles:{read:async()=>native},requests:{read:async()=>request},wallet:async()=>({}),
    adapter:{object:async()=>({node:{LedgerEntryType:'Loan',NextPaymentDueDate:2147483647}})},
    service:{receiptAgreement:async()=>{calls.push('receipt');request.agreementReceipt={};},sign:async()=>{calls.push('sign');request.signed={};},
      advance:async()=>calls.push('reconcile'),receiptExecution:async()=>{calls.push('execution');request.executionReceipt={};}},
    refusal:async()=>{calls.push('refusal');native.refusal={resultCode:'tecINSUFFICIENT_FUNDS'};},repay:async()=>calls.push('repay'),
    withdraw:async()=>{calls.push('withdraw');native.yield={realisedYieldDrops:'20'};}};
  const approve=()=>{request.approvals=['broker','borrower'].map(role=>({role,agreementHash:'a',transactionDigest:'t'}));};
  return {cycle:cycle as Cycle,request,native,calls,approve};
}
test('automatic round requires both exact approvals and never creates them',async()=>{
  const f=example();assert.equal(await advanceAutomaticRound(f.cycle),'WAITING_FOR_APPROVALS');
  f.approve();f.request.approvals[1].transactionDigest='changed';
  assert.equal(await advanceAutomaticRound(f.cycle),'WAITING_FOR_APPROVALS');assert.deepEqual(f.calls,[]);
});
test('restart uses saved funding and receipts, waits for schedule and does not withdraw twice',async()=>{
  const f=example();f.approve();await advanceAutomaticRound(f.cycle);await advanceAutomaticRound(f.cycle);
  await advanceAutomaticRound(f.cycle);assert.deepEqual(f.calls,['receipt','sign','reconcile']);
  f.request.validated={resultCode:'tesSUCCESS'};f.request.loanId='loan';
  await advanceAutomaticRound(f.cycle);await advanceAutomaticRound(f.cycle);
  assert.equal(await advanceAutomaticRound(f.cycle),'WAITING_FOR_REPAYMENT_DATE');
  f.native.steps.repay={resultCode:'tesSUCCESS'};
  assert.equal(await advanceAutomaticRound(f.cycle),'COMPLETE');assert.equal(await advanceAutomaticRound(f.cycle),'COMPLETE');
  assert.deepEqual(f.calls,['receipt','sign','reconcile','execution','refusal','withdraw']);
});
test('unresolved receipt issuance stops before any signing or submission',async()=>{
  const f=example();f.approve();f.cycle.service.receiptAgreement=async()=>{throw Error('Receipt issuance unresolved');};
  await assert.rejects(advanceAutomaticRound(f.cycle),/unresolved/);assert.deepEqual(f.calls,[]);
});
