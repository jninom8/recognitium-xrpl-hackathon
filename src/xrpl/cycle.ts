import type {MatchProposal} from '../requests/matching.js';
import {identityFixture} from '../shared/identity-fixture.js';
import { Wallet, type SubmittableTransaction } from 'xrpl';
import { readFile, open } from 'node:fs/promises';
import { join } from 'node:path';
import { Store } from '../requests/store.js';
import { Journal, type Operation } from '../requests/journal.js';
import { LendingService, type PrivateRequest } from '../requests/service.js';
import { RecognitiumClient } from '../recognitium/client.js';
import { NativeAdapter, balanceDelta, createdId, type ValidatedTransaction } from './adapter.js';
import { native } from './transactions.js';
import { CONTRACT_VERSION, TRACK1, type Agreement } from '../shared/contract.js';
import type { FinancingRequest } from '../shared/intake.js';
import { canonical, digest, documentCommitment } from '../requests/commitment.js';

interface SavedWallet { seed: string; fundingAttempted: boolean; balanceAfterFaucetDrops?: string }
export interface CycleRecord {
  schema: 'recognitium.native-cycle.v1';
  network: Agreement['network'];
  accounts: Agreement['accounts'];
  vaultId?: string; loanBrokerId?: string; requestId?: string;
  depositDrops: string; coverDrops: string;
  steps: Record<string, { hash: string; ledgerIndex: number; resultCode: string }>;
  refusal?: { resultCode: string; hash: string; vaultBefore: unknown; vaultAfter: unknown };
  yield?: { withdrawnDrops: string; depositedDrops: string; realisedYieldDrops: string; withdrawalFeeDrops: string; calculation: string };
}
export class Cycle {
  readonly wallets: Store<SavedWallet>;
  readonly cycles: Store<CycleRecord>;
  readonly requests: Store<PrivateRequest>;
  readonly journal: Journal;
  readonly receipts = new RecognitiumClient();
  readonly service: LendingService;
  constructor(readonly adapter: NativeAdapter, readonly dataDirectory = 'data', readonly walletDirectory = 'wallets', readonly onProgress?: () => Promise<void>) {
    this.wallets = new Store<SavedWallet>(walletDirectory);
    this.cycles = new Store<CycleRecord>(join(dataDirectory, 'cycles'));
    this.requests = new Store<PrivateRequest>(join(dataDirectory, 'requests'));
    this.journal = new Journal(new Store<Operation>(join(dataDirectory, 'operations')), adapter);
    this.service = new LendingService(this.requests, adapter, this.receipts);
  }
  async wallet(role: 'broker' | 'borrower' | 'lender'): Promise<Wallet> {
    const saved = await this.wallets.read(role); if (!saved) throw new Error('Run setup first');
    return Wallet.fromSeed(saved.seed);
  }
  private async fund(role: 'broker' | 'borrower' | 'lender'): Promise<Wallet> {
    let saved = await this.wallets.read(role);
    if (!saved) { const wallet = Wallet.generate(); saved = { seed: wallet.seed!, fundingAttempted: false }; await this.wallets.write(role, saved); }
    const wallet = Wallet.fromSeed(saved.seed);
    try {
      const account = await this.adapter.account(wallet.address);
      if (!saved.balanceAfterFaucetDrops) { saved.balanceAfterFaucetDrops = account.account_data.Balance; await this.wallets.write(role, saved); }
      return wallet;
    } catch (error) { if ((error as { data?: { error?: string } }).data?.error !== 'actNotFound') throw error; }
    const responsePath=join(this.walletDirectory,`${role}-faucet.private.json`);
    let wire:string|undefined;
    try{wire=await readFile(responsePath,'utf8');}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
    if(!wire){
      if(saved.fundingAttempted)throw new Error(`Faucet outcome unresolved for ${role}; recover its private response before requesting again`);
      saved.fundingAttempted=true;await this.wallets.write(role,saved);
      // Event faucet provisions its own account, ignoring destination. Unlike the
      // standard faucet, it returns {account:{address,secret},balance}.
      const response=await fetch(TRACK1.faucet,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(20000),redirect:'error'});
      wire=await response.text();
      const file=await open(responsePath,'wx',0o600);try{await file.writeFile(wire);await file.sync();}finally{await file.close();}
      if(!response.ok)throw new Error(`Event faucet HTTP ${response.status}; response saved privately`);
    }
    const parsed=JSON.parse(wire) as {account?:{address?:string;secret?:string}};
    if(!parsed.account?.address || !parsed.account.secret)throw new Error('Unexpected event faucet schema; private response retained');
    const provisioned=Wallet.fromSeed(parsed.account.secret);
    if(provisioned.address!==parsed.account.address)throw new Error('Faucet key/address mismatch');
    let account:Awaited<ReturnType<NativeAdapter['account']>>|undefined;
    for(let attempt=0;attempt<30;attempt++){
      try{account=await this.adapter.account(provisioned.address);break;}
      catch(error){if((error as {data?:{error?:string}}).data?.error!=='actNotFound')throw error;}
      await new Promise(resolve=>setTimeout(resolve,1000));
    }
    if(!account)throw new Error('Faucet response retained; returned account not validated after 30 seconds. Retry only ledger lookup.');
    await this.wallets.write(`${role}-unfunded`,saved);
    await this.wallets.write(role,{seed:provisioned.seed!,fundingAttempted:true,balanceAfterFaucetDrops:account.account_data.Balance});
    return provisioned;
  }
  private async record(): Promise<CycleRecord> {
    const record = await this.cycles.read('native'); if (!record) throw new Error('Run setup');
    if (!this.adapter.identity || digest(record.network) !== digest(this.adapter.identity)) throw new Error('Ledger identity/build changed; review before continuing');
    return record;
  }
  private async execute(id: string, tx: SubmittableTransaction, wallet: Wallet): Promise<ValidatedTransaction> {
    await this.journal.register(id, tx, () => this.adapter.prepare(tx), wallet);
    const deadline = Date.now() + 45000;
    while (Date.now() < deadline) {
      const operation = await this.journal.advance(id);
      if (operation.result) return operation.result;
      if (operation.status === 'EXPIRED_UNRESOLVED') throw new Error(`${id}: expired with unresolved history; no replacement signed`);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    throw new Error(`${id}: validation unknown; rerun to recover the identical signed transaction`);
  }
  private async step(record: CycleRecord, name: string, tx: SubmittableTransaction, wallet: Wallet): Promise<ValidatedTransaction> {
    const result = await this.execute(name, tx, wallet);
    record.steps[name] = { hash: result.hash, ledgerIndex: result.ledgerIndex, resultCode: result.resultCode };
    await this.cycles.write('native', record);
    await this.onProgress?.();
    if (result.resultCode !== 'tesSUCCESS') throw new Error(`${name}: validated ${result.resultCode}`);
    return result;
  }
  async setup(sizing = {depositDrops:'200000000',coverDrops:'20000000'}): Promise<CycleRecord> {
    for (const value of Object.values(sizing)) if (!/^[1-9][0-9]*$/.test(value)) throw new Error('Invalid cycle sizing');
    if (!this.adapter.identity) throw new Error('Connect first');
    await this.adapter.assertCanOriginate?.();
    // Sequential faucet and transaction operations simplify exact attribution.
    const broker = await this.fund('broker'), lender = await this.fund('lender'), borrower = await this.fund('borrower');
    let record = await this.cycles.read('native');
    if (record) record = await this.record();
    else record = { schema: 'recognitium.native-cycle.v1', network: this.adapter.identity,
      accounts: { broker: broker.address, lender: lender.address, borrower: borrower.address },
      depositDrops: sizing.depositDrops, coverDrops: sizing.coverDrops, steps: {} };
    await this.cycles.write('native', record);
    const vault = await this.step(record, 'vault', native.vault(broker.address), broker);
    record.vaultId = createdId(vault, 'Vault'); await this.cycles.write('native', record);
    const initialDeposit = await this.journal.store.read('deposit');
    if (initialDeposit?.result?.resultCode === 'tecINSUFFICIENT_FUNDS') {
      // The first attempt is conclusively refused. Keep it, and journal the
      // test-wallet top-up and corrected deposit under distinct operation IDs.
      const topup = await this.journal.store.read('lender-topup');
      const missing = topup ? String(topup.tx.Amount) : String(BigInt(record.depositDrops) + 20000000n - BigInt((await this.adapter.account(lender.address)).account_data.Balance));
      if (BigInt(missing) <= 0n) throw new Error('Deposit recovery needs explicit inspection; no positive top-up');
      if (!topup && BigInt((await this.adapter.account(broker.address)).account_data.Balance) < BigInt(missing) + BigInt(record.coverDrops) + 20000000n) throw new Error('Insufficient test setup capital; no top-up signed');
      await this.step(record, 'lender-topup', {TransactionType:'Payment',Account:broker.address,Destination:lender.address,Amount:missing}, broker);
      await this.step(record, 'deposit-funded', native.deposit(lender.address, record.vaultId, record.depositDrops), lender);
      record.steps['deposit-initial-refusal'] = {hash:initialDeposit.result.hash,ledgerIndex:initialDeposit.result.ledgerIndex,resultCode:initialDeposit.result.resultCode};
      record.steps.deposit = record.steps['deposit-funded']!;
      await this.cycles.write('native',record);
      await this.onProgress?.();
    } else await this.step(record, 'deposit', native.deposit(lender.address, record.vaultId, record.depositDrops), lender);
    const loanBroker = await this.step(record, 'broker', native.broker(broker.address, record.vaultId), broker);
    record.loanBrokerId = createdId(loanBroker, 'LoanBroker'); await this.cycles.write('native', record);
    await this.step(record, 'cover', native.cover(broker.address, record.loanBrokerId, record.coverDrops), broker);
    return record;
  }
  async prepareRequest(intake?: FinancingRequest, paymentInterval = 60, match?:MatchProposal): Promise<unknown> {
    const r = await this.record();
    if (!r.vaultId || !r.loanBrokerId) throw new Error('Setup incomplete');
    const id = intake?.clientRequestId ?? 'synthetic-supplier-001';
    if (intake && intake.status !== 'REVIEWED') throw new Error('Reviewed intake required');
    if (!Number.isSafeInteger(paymentInterval) || paymentInterval < 60 || paymentInterval > 90*86400) throw new Error('Invalid payment interval');
    if(match && (!intake||match.requestId!==id||match.requestDigest!==intake.requestDigest||match.availability.account!==r.accounts.lender||match.amountDrops!==r.depositDrops||match.decision!=='accepted'))throw Error('Matched lender, deposit and request must be preserved');
    const existing = await this.requests.read(id);
    if (existing) {
      if (intake) { const bound=JSON.parse(Buffer.from(existing.documentBase64,'base64').toString('utf8')); if(digest(bound.intake)!==digest(intake) || digest(bound.match??null)!==digest(match??null) || existing.agreement.terms.paymentInterval!==paymentInterval)throw new Error('Existing offer differs from intake or duration'); }
      if (r.requestId && r.requestId !== id) throw new Error('Run already bound to another request');
      r.requestId = id; await this.cycles.write('native', r);
      return this.service.view(existing);
    }
    const document = Buffer.from(intake ? canonical({schema:'recognitium.intake-agreement.v1',synthetic:true,intake,...(match?{match}:{}),offer:{principalDrops:intake.requestedDrops,paymentInterval,interestRate:10000,notice:paymentInterval === intake.requestedDays*86400 ? 'Requested duration preserved' : 'Explicit counter-offer: accelerated test repayment; requested duration preserved in intake'}}) : 'SYNTHETIC DEMO: a supplier requests 100 test XRP for inventory. No real invoice, business, collateral or credit decision.');
    const identity = identityFixture(id,r.accounts.borrower);
    const boundDocument = Buffer.from(canonical({schema:'recognitium.identity-agreement.v1',identity,agreementDocument:document.toString('utf8'),...(intake?{intake}:{}),...(match?{match}:{})}));
    const commitment = documentCommitment(boundDocument);
    const agreement: Agreement = { schema: CONTRACT_VERSION, requestId: id, documentVersion: 1, documentCommitment: commitment.hash,
      identity:{commitment:identity.commitment,wallet:r.accounts.borrower,synthetic:true},
      synthetic: true, network: r.network, accounts: r.accounts, vaultId: r.vaultId, loanBrokerId: r.loanBrokerId, asset: 'XRP',
      terms: { principalDrops: intake?.requestedDrops ?? '100000000', interestRate: 10000, paymentTotal: 1, paymentInterval, gracePeriod: 60,
        originationFeeDrops: '0', serviceFeeDrops: '0', latePaymentFeeDrops: '0', closePaymentFeeDrops: '0',
        overpaymentFee: 0, lateInterestRate: 0, closeInterestRate: 0, overpaymentInterestRate: 0, flags: 0 },
      expiresAt: new Date(Date.now() + 3600000).toISOString(), policyVersion: 'human-exact-approval.v1' };
    const view = await this.service.create(agreement, boundDocument, commitment.salt, async tx => {
      const prepared = await this.adapter.prepareLoan(tx);
      // Review window is 200 ledgers; the exact bound is part of human approval.
      prepared.LastLedgerSequence = (await this.adapter.ledgerIndex()) + 200;
      return prepared;
    });
    r.requestId = id; await this.cycles.write('native', r); return view;
  }
  async refusal(): Promise<CycleRecord> {
    const r = await this.record(); if (!r.vaultId || !r.requestId) throw new Error('No loan');
    const request = await this.requests.read(r.requestId);
    if (!request?.validated || request.validated.resultCode !== 'tesSUCCESS') throw new Error('Validated loan required');
    if (r.steps.repay) throw new Error('Liquidity refusal must precede repayment');
    const lender = await this.wallet('lender');
    const before = (await this.adapter.object(r.vaultId)).node;
    const result = await this.execute('native-refusal', native.withdraw(lender.address, r.vaultId, r.depositDrops), lender);
    const after = (await this.adapter.object(r.vaultId, result.ledgerIndex)).node;
    r.refusal = { resultCode: result.resultCode, hash: result.hash, vaultBefore: before, vaultAfter: after };
    await this.cycles.write('native', r);
    if (result.resultCode === 'tesSUCCESS' || !result.resultCode.startsWith('tec')) throw new Error('Expected native applied refusal; inspect saved evidence');
    if (digest(before) !== digest(after)) throw new Error('Refusal changed vault state; inspect evidence');
    return r;
  }
  async repay(): Promise<CycleRecord> {
    const r = await this.record(); const request = r.requestId ? await this.requests.read(r.requestId) : undefined;
    if (!request?.loanId) throw new Error('No funded loan');
      const previous = await this.journal.store.read('repay');
      // A validated refusal is resolved history. Preserve it and journal the
      // corrected late payment separately; never replace an uncertain payment.
      if (previous?.result?.resultCode === 'tecEXPIRED') {
        if (request.agreement.terms.latePaymentFeeDrops !== '0' || request.agreement.terms.lateInterestRate !== 0) throw new Error('Late payment with additional costs requires review');
        const amount = String((previous.tx as unknown as Record<string, unknown>).Amount);
        await this.step(r, 'repay-late', native.repay(r.accounts.borrower,request.loanId,amount,true),await this.wallet('borrower'));
        return r;
      }
    let tx: SubmittableTransaction;
    if (previous) tx = native.repay(r.accounts.borrower, request.loanId, String((previous.tx as unknown as Record<string, unknown>).Amount));
    else {
      const loan = (await this.adapter.object(request.loanId)).node;
      if (loan.LedgerEntryType !== 'Loan') throw new Error('Not a Loan');
      if (loan.PaymentRemaining !== 1) throw new Error('This runner expects the approved one-payment loan');
      // Standard scheduled payment, not early-close flag, preserves scheduled interest.
      // Use stored outstanding debt, rounded up to whole drops, not theoretical interest.
      const amount = ceilDrops(String(loan.TotalValueOutstanding));
      tx = native.repay(r.accounts.borrower, request.loanId, amount);
    }
    await this.step(r, 'repay', tx, await this.wallet('borrower')); return r;
  }
  async withdraw(): Promise<CycleRecord> {
      const r = await this.record(); if ((r.steps.repay?.resultCode !== 'tesSUCCESS' && r.steps['repay-late']?.resultCode !== 'tesSUCCESS') || !r.vaultId) throw new Error('Successful repayment required before final withdrawal');
    const prior = await this.journal.store.read('withdraw');
    let amount: string;
    if (prior) amount = String((prior.tx as unknown as Record<string, unknown>).Amount);
    else {
      const vault = (await this.adapter.object(r.vaultId)).node;
      if (vault.LedgerEntryType !== 'Vault') throw new Error('Not a Vault');
      amount = floorDrops(vault.AssetsAvailable ?? '0');
    }
    const result = await this.step(r, 'withdraw', native.withdraw(r.accounts.lender,r.vaultId,amount),await this.wallet('lender'));
    const fee = BigInt(String(result.tx.Fee));
    const proceeds = balanceDelta(result,r.accounts.lender) + fee;
    const realisedYield = proceeds - BigInt(r.depositDrops);
    r.yield = { withdrawnDrops: proceeds.toString(), depositedDrops: r.depositDrops, realisedYieldDrops: realisedYield.toString(), withdrawalFeeDrops: fee.toString(),
      calculation: 'withdrawal AccountRoot delta + withdrawal fee - deposited principal; faucet balances excluded' };
    await this.cycles.write('native',r);
    if (realisedYield <= 0n) throw new Error('Nonzero realised yield gate not passed');
    return r;
  }
}
export function floorDrops(value: string): string {
  if (!/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(value)) throw new Error('Expected nonnegative decimal ledger amount');
  return value.split('.')[0]!;
}
export function ceilDrops(value: string): string {
  const integer = floorDrops(value); return (BigInt(integer) + (/[1-9]/.test(value.split('.')[1] ?? '') ? 1n : 0n)).toString();
}
