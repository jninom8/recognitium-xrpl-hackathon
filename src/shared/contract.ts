/** Browser-safe contract. No wallet, service credentials, or executable blobs. */
export const CONTRACT_VERSION = 'recognitium.lending.v1' as const;
export const TRACK1 = {
  track: 'Track 1 Vanilla',
  websocket: 'wss://lending-hackathon.dev.ripplex.io:51233',
  http: 'https://lending-hackathon.dev.ripplex.io:51234/',
  faucet: 'https://lending-hackathon-faucet.dev.ripplex.io/accounts',
  explorer: 'https://custom.xrpl.org/lending-hackathon.dev.ripplex.io:51233/',
  sdk: 'xrpl@5.2.0',
} as const;
export type Role = 'broker' | 'borrower';
export type Phase = 'DRAFT' | 'AGREEMENT_LOCKED' | 'AGREEMENT_RECEIPTED' | 'SIGNED'
  | 'SUBMITTED' | 'VALIDATION_UNKNOWN' | 'REJECTED' | 'EXPIRED_UNRESOLVED'
  | 'VALIDATED_RECEIPT_PENDING' | 'FUNDED_WITH_EVIDENCE';
export interface NetworkIdentity {
  track: typeof TRACK1.track;
  websocket: typeof TRACK1.websocket;
  networkId: number;
  serverBuild: string;
}
/** All XRP amounts below are integer drops, including XRPL Number fields. */
export interface LoanTerms {
  principalDrops: string;
  interestRate: number;
  paymentTotal: number;
  paymentInterval: number;
  gracePeriod: number;
  originationFeeDrops: string;
  serviceFeeDrops: string;
  latePaymentFeeDrops: string;
  closePaymentFeeDrops: string;
  overpaymentFee: number;
  lateInterestRate: number;
  closeInterestRate: number;
  overpaymentInterestRate: number;
  flags: number;
}
export interface Agreement {
  schema: typeof CONTRACT_VERSION;
  requestId: string;
  documentVersion: number;
  documentCommitment: string;
  synthetic: boolean;
  network: NetworkIdentity;
  accounts: { lender: string; broker: string; borrower: string };
  vaultId: string;
  loanBrokerId: string;
  asset: 'XRP';
  terms: LoanTerms;
  expiresAt: string;
  policyVersion: 'human-exact-approval.v1';
}
export interface Approval {
  role: Role;
  agreementHash: string;
  transactionDigest: string;
  approvedAt: string;
}
export interface ReceiptEvidence {
  receiptId: string;
  commitmentHash: string;
  authorityCheckedAt: string;
  /** Exact wire text preserves uint64 nanosecond timestamps. */
  receiptWire: string;
  verificationWire: string;
}
export interface ProofChecks {
  contentHash: 'unchecked' | 'consistent' | 'mismatch';
  receiptAuthority: 'unchecked' | 'online-verified' | 'failed';
  xrplValidation: 'unchecked' | 'validated-success' | 'validated-refusal' | 'unknown';
}
export interface TransactionView {
  hash: string;
  lastLedgerSequence: number;
  ledgerIndex?: number;
  resultCode?: string;
}
export interface RequestView {
  contractVersion: typeof CONTRACT_VERSION;
  mode: 'live' | 'fixture';
  phase: Phase;
  agreement: Agreement;
  agreementHash: string;
  transactionDigest: string;
  /** Exact prepared transaction, safe to review before signing. */
  preparedTransaction: Record<string, unknown>;
  approvals: Approval[];
  transaction?: TransactionView;
  loanId?: string;
  agreementReceipt?: ReceiptEvidence;
  executionReceipt?: ReceiptEvidence;
  checks: ProofChecks;
}
export interface AppState {
  contractVersion: typeof CONTRACT_VERSION;
  mode: 'live' | 'fixture';
  network: typeof TRACK1;
  connected: boolean;
  requests: RequestView[];
  disclosure: string;
}
