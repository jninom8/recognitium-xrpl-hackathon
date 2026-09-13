import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WalletReadings,walletPanel} from '../web/wallet-panel.mjs';
const r={agreement:{requestId:'A',accounts:{borrower:'fixture-account'},network:{networkId:4001}},funding:{status:'unfunded'}};
const o={requestId:'A',account:'fixture-account',networkId:4001,ledgerIndex:42,ledgerHash:'A'.repeat(64),balanceDrops:'1000000001',checkedAt:'2026-09-13T10:00:00Z'};
test('wallet balance cannot be mistaken for loan proceeds and survives failed refresh',async()=>{
 const readings=new WalletReadings();
 await readings.read(r,'live',async()=>({ok:true,json:async()=>o}));
 const html=walletPanel(r,'live',readings);assert.match(html,/1000\.000001/);assert.match(html,/Not funded/);assert.match(html,/test funds supplied during setup/);
 assert.match(walletPanel({...r,funding:{status:'unknown'}},'live',readings),/Not confirmed/);
 await readings.read(r,'live',async()=>({ok:false}));assert.deepEqual(readings.get(r,'live').observation,o);assert.match(readings.get(r,'live').error,/unavailable/);
 assert.equal(readings.get({...r,agreement:{...r.agreement,requestId:'B'}},'live').observation,undefined);
 await readings.read(r,'recorded',async()=>({ok:true,json:async()=>({...o,requestId:'B'})}));assert.equal(readings.get(r,'recorded').observation,undefined);
});
