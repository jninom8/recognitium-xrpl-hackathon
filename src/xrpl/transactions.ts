import { type LoanSet, type SubmittableTransaction, Wallet, decode, signLoanSetByCounterparty, validate } from 'xrpl';
import { digest } from '../requests/commitment.js';
import { canonical } from '../requests/commitment.js';
import { hashes } from 'xrpl';
import { encodeForSigning, encodeForSigningCounterparty } from 'ripple-binary-codec';
import { deriveAddress, verify } from 'ripple-keypairs';
import { type Agreement } from '../shared/contract.js';

export function loanTransaction(a: Agreement, agreementHash: string): LoanSet {
  const t = a.terms;
  return {
    TransactionType: 'LoanSet', Account: a.accounts.broker, Counterparty: a.accounts.borrower,
    LoanBrokerID: a.loanBrokerId, PrincipalRequested: t.principalDrops, Data: agreementHash.toUpperCase(),
    InterestRate: t.interestRate, PaymentTotal: t.paymentTotal, PaymentInterval: t.paymentInterval,
    GracePeriod: t.gracePeriod, LoanOriginationFee: t.originationFeeDrops, LoanServiceFee: t.serviceFeeDrops,
    LatePaymentFee: t.latePaymentFeeDrops, ClosePaymentFee: t.closePaymentFeeDrops,
    OverpaymentFee: t.overpaymentFee, LateInterestRate: t.lateInterestRate,
    CloseInterestRate: t.closeInterestRate, OverpaymentInterestRate: t.overpaymentInterestRate, Flags: t.flags,
  };
}
export function assertPrepared(a: Agreement, prepared: LoanSet): void {
  const expected = loanTransaction(a, digest(a));
  const actual = prepared as unknown as Record<string, unknown>;
  for (const [key, value] of Object.entries(expected)) if (actual[key] !== value) throw new Error(`Transaction differs from agreement: ${key}`);
  const allowed = new Set([...Object.keys(expected), 'Fee', 'Sequence', 'LastLedgerSequence', 'NetworkID']);
  if (Object.keys(actual).some(key => !allowed.has(key))) throw new Error('Unexpected prepared transaction field');
  if (!prepared.Fee || !/^[0-9]+$/.test(prepared.Fee) || BigInt(prepared.Fee) > 100000n || !Number.isSafeInteger(prepared.Sequence) || !Number.isSafeInteger(prepared.LastLedgerSequence)) throw new Error('Missing bounds or fee exceeds test cap');
  if (a.network.networkId > 1024 ? prepared.NetworkID !== a.network.networkId : prepared.NetworkID !== undefined) throw new Error('Wrong signed network ID');
  validate(actual);
}
export function cosign(prepared: LoanSet, broker: Wallet, borrower: Wallet) {
  if (prepared.Account !== broker.classicAddress || prepared.Counterparty !== borrower.classicAddress) throw new Error('Wrong signing account');
  const first = broker.sign(structuredClone(prepared));
  const signed = signLoanSetByCounterparty(borrower, first.tx_blob);
  validate(signed.tx as unknown as Record<string, unknown>);
  if ((decode(signed.tx_blob) as LoanSet).Data !== prepared.Data) throw new Error('Signed binding mismatch');
  return signed;
}
export function assertSigned(prepared: LoanSet, signed: {hash:string;tx_blob:string}): void {
  if(hashes.hashSignedTx(signed.tx_blob) !== signed.hash) throw new Error('Stored transaction hash mismatch');
  const tx=decode(signed.tx_blob) as unknown as LoanSet;
  const record=tx as unknown as Record<string,unknown>;
  for(const [key,value] of Object.entries(prepared)) if(canonical(record[key]) !== canonical(value)) throw new Error('Stored signature payload differs from approval');
  const allowed=new Set([...Object.keys(prepared),'SigningPubKey','TxnSignature','CounterpartySignature']);
  if(Object.keys(tx).some(key=>!allowed.has(key))) throw new Error('Unexpected signed field');
  if(!tx.TxnSignature || !tx.SigningPubKey || !tx.CounterpartySignature?.SigningPubKey || !tx.CounterpartySignature.TxnSignature) throw new Error('Both signatures required');
  if(deriveAddress(tx.SigningPubKey) !== prepared.Account || deriveAddress(tx.CounterpartySignature.SigningPubKey) !== prepared.Counterparty) throw new Error('Stored signer identity mismatch');
  if(!verify(encodeForSigning(tx),tx.TxnSignature,tx.SigningPubKey) || !verify(encodeForSigningCounterparty(tx),tx.CounterpartySignature.TxnSignature,tx.CounterpartySignature.SigningPubKey)) throw new Error('Stored signature invalid');
}
export const native = {
  vault: (account: string): SubmittableTransaction => ({ TransactionType: 'VaultCreate', Account: account, Asset: { currency: 'XRP' }, WithdrawalPolicy: 1 }),
  deposit: (account: string, vaultId: string, amount: string): SubmittableTransaction => ({ TransactionType: 'VaultDeposit', Account: account, VaultID: vaultId, Amount: amount }),
  broker: (account: string, vaultId: string): SubmittableTransaction => ({ TransactionType: 'LoanBrokerSet', Account: account, VaultID: vaultId, ManagementFeeRate: 0, CoverRateMinimum: 10000, CoverRateLiquidation: 10000 }),
  cover: (account: string, brokerId: string, amount: string): SubmittableTransaction => ({ TransactionType: 'LoanBrokerCoverDeposit', Account: account, LoanBrokerID: brokerId, Amount: amount }),
  repay: (account: string, loanId: string, amount: string, late = false): SubmittableTransaction => ({ TransactionType: 'LoanPay', Account: account, LoanID: loanId, Amount: amount, ...(late ? {Flags: 0x00040000} : {}) }),
  withdraw: (account: string, vaultId: string, amount: string): SubmittableTransaction => ({ TransactionType: 'VaultWithdraw', Account: account, VaultID: vaultId, Amount: amount }),
};
