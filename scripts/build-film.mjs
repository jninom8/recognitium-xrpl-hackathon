import fs from 'node:fs/promises';
import {RecognitiumClient} from '../dist/src/recognitium/client.js';
const b=JSON.parse(await fs.readFile('evidence/ai-request-1708833c.json','utf8'));
const intents=JSON.parse(await fs.readFile('evidence/cinematic-transition-receipts.json','utf8')).transitions;
const ids=['DG-56005abb14c642df96608bafbadc955a','DG-20c2a22b1d18494b8407cbb08e7da6ad','DG-12590756f43b4b1e98d821a8dfa9ad5f'];
const client=new RecognitiumClient();
const transitionReceipts=[];
for(let i=0;i<intents.length;i++)transitionReceipts.push({...intents[i],receipt:await client.recover(ids[i],intents[i].hash)});
await fs.writeFile('evidence/cinematic-transition-receipts.json',JSON.stringify({scope:'Retrospective evidence seals, not original transaction-time receipts',costTicks:3,transitions:transitionReceipts},null,2));
const scene=(title,amount,copy,receipt,tx,retrospective=false)=>({title,amount,copy,receiptId:receipt.receiptId,commitmentHash:receipt.commitmentHash,retrospective,...(tx?{transactionHash:tx.hash,ledgerIndex:tx.ledgerIndex,resultCode:tx.resultCode,feeDrops:tx.tx.Fee}:{})});
const scenes=[
 scene('Agree before moving money','100 XRP','Exact loan terms are fixed. Both parties approve the transaction. The agreement fingerprint is sealed before signing.',b.agreementReceipt),
 scene('The borrower receives the loan','100 XRP','The co-signed LoanSet funds the borrower. Its execution receipt links this ledger result to the agreed terms.',b.executionReceipt,b.transaction),
 scene('The ledger enforces a boundary','0 XRP moved','A 200 XRP withdrawal is refused for insufficient liquidity. The vault stays unchanged; the 12-drop transaction fee still applies.',transitionReceipts[0].receipt,b.nativeCycle.transactions['native-refusal'],true),
 scene('The borrower repays','100.000020 XRP','LoanPay returns the principal and the scheduled interest to the vault.',transitionReceipts[1].receipt,b.nativeCycle.transactions.repay,true),
 scene('The lender receives capital + yield','200.000020 XRP','The lender withdraws the original 200 XRP plus 20 drops of gross realised yield. Network fees are separate.',transitionReceipts[2].receipt,b.nativeCycle.transactions.withdraw,true)
];
await fs.writeFile('web/film-data.json',JSON.stringify({requestId:JSON.parse(b.agreementBytes).requestId,networkId:4001,setup:'Before this agreement: an open-ended vault, 200 XRP lender deposit, loan broker and 20 XRP first-loss cover.',scenes},null,2));
console.log('Five scenes; three newly issued retrospective receipts verified online.');
