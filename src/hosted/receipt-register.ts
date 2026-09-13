import{readFile}from'node:fs/promises';import{join}from'node:path';
import{readPublicRuns}from'./runs.js';import{market}from'./market.js';
import type{ReceiptEvidence}from'../shared/contract.js';
export async function receiptRegister(){
 const [progress,matching,bundle]=await Promise.all([readPublicRuns(),market(undefined,[]),readFile(join(process.cwd(),'hosted','bundle.json'),'utf8').then(JSON.parse)]);
 const rows:{round:string;kind:string;receiptId:string;commitmentHash:string;authorityCheckedAt:string;source:string}[]=[];
 const add=(round:string,kind:string,proof:Pick<ReceiptEvidence,'receiptId'|'commitmentHash'|'authorityCheckedAt'>|undefined,source:string)=>{if(proof&&/^DG-[a-f0-9]{32}$/.test(proof.receiptId)&&/^[a-f0-9]{64}$/.test(proof.commitmentHash)&&!rows.some(r=>r.receiptId===proof.receiptId))rows.push({round,kind,receiptId:proof.receiptId,commitmentHash:proof.commitmentHash,authorityCheckedAt:proof.authorityCheckedAt,source});};
 const original=JSON.parse(bundle.agreementBytes).requestId;
 add(original,'Agreement',bundle.agreementReceipt,'Recorded native cycle');add(original,'XRPL execution',bundle.executionReceipt,'Recorded native cycle');
 for(const run of progress.runs){add(run.requestId,'Agreement',run.request?.agreementReceipt,'Published native run');add(run.requestId,'XRPL execution',run.request?.executionReceipt,'Published native run');}
 for(const match of matching.matches)add(match.requestId,'Match + both approvals',match.receipt,'Shared synthetic match');
 add('market-discovery','IVM demand publication',{receiptId:'DG-572bb9f7ec7e41b888b3900147584189',commitmentHash:'a5c8f06799a19ca60666a8ed57a83f50eb4731f2d7e22b3c513b1b95e667b84a',authorityCheckedAt:''},'Operator-approved public demand, expired after its stated TTL');
 return{observedAt:new Date().toISOString(),receipts:rows};
}
