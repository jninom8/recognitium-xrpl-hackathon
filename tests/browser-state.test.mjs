import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SnapshotCursor, sameReview, drops } from '../web/state-client.mjs';

test('UI rejects delayed responses and handles different modes and restarted backends', () => {
  const c=new SnapshotCursor();const first=c.begin('live'),second=c.begin('live');
  assert.equal(c.accept(first,{mode:'live',instanceId:'a',revision:20}),false);
  assert.equal(c.accept(second,{mode:'live',instanceId:'a',revision:21}),true);
  assert.equal(c.accept(c.begin('recorded'),{mode:'recorded',instanceId:'a',revision:2}),true);
  assert.equal(c.accept(c.begin('live'),{mode:'live',instanceId:'b',revision:1}),true);
  const old=c.begin('live');c.begin('recorded');assert.equal(c.accept(old,{mode:'live',instanceId:'a',revision:40}),false);
});
test('approval review locks exact hashes, role action and backend identity; tiny yield stays visible', () => {
  const r={agreement:{requestId:'r'},agreementHash:'agreement',transactionDigest:'tx',actions:[{id:'approve/broker',allowed:true}]};
  const state={instanceId:'one',mode:'live',requests:[r]};const review={instanceId:'one',requestId:'r',agreementHash:'agreement',transactionDigest:'tx',action:{id:'approve/broker'}};
  assert.equal(sameReview(review,state),true);
  assert.equal(sameReview(review,{...state,instanceId:'two'}),false);
  assert.equal(sameReview(review,{...state,requests:[{...r,transactionDigest:'changed'}]}),false);
  assert.equal(sameReview(review,{...state,requests:[{...r,actions:[{id:'approve/broker',allowed:false}]}]}),false);
  assert.equal(drops('200000020'),'200.00002');assert.equal(drops('20'),'0.00002');assert.equal(drops(undefined),'Not observed');
});
