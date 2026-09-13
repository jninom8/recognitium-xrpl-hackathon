import {readTrackEnvironment} from '../server/environment.js';
import { Client, type LoanSet, type SubmittableTransaction } from 'xrpl';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { TRACK1, type NetworkIdentity } from '../shared/contract.js';

export interface ValidatedTransaction {
  hash: string;
  ledgerIndex: number;
  resultCode: string;
  tx: Record<string, unknown>;
  meta: Record<string, unknown>;
  raw: unknown;
}
export interface LedgerPort {
  assertCanOriginate?():Promise<void>;
  submit(blob: string): Promise<void>;
  lookup(hash: string): Promise<ValidatedTransaction | undefined>;
  ledgerIndex(): Promise<number>;
}
export class NativeAdapter implements LedgerPort {
  constructor(readonly allowV11ReadAndRecovery = false) {}
  readonly client = new Client(TRACK1.websocket, { connectionTimeout: 12000, timeout: 15000 });
  identity?: NetworkIdentity;
  async connect(): Promise<NetworkIdentity> {
    this.identity = undefined;
    try {
    await this.client.connect();
    const info = (await this.client.request({ command: 'server_info' })).result.info;
    const networkId = info.network_id;
    if (networkId !== 4001) throw new Error('Missing development network identity');
    if (info.amendment_blocked || !info.validated_ledger) throw new Error('Server is not providing usable validated ledgers');
    // Public Amendments ledger object: UInt16 namespace 'f', SHA-512Half.
    // Querying feature may require admin access; this reads actual enabled IDs.
    const half = (bytes: Uint8Array | string) => createHash('sha512').update(bytes).digest('hex').slice(0,64).toUpperCase();
    const amendments = await this.object(half(Buffer.from([0,0x66])));
    if (amendments.node.LedgerEntryType !== 'Amendments') throw new Error('Amendment ledger object unavailable');
    const enabled = amendments.node.Amendments ?? [];
    await mkdir('data/environment',{recursive:true});
    await writeFile('data/environment/track1.json',JSON.stringify({observedAt:new Date().toISOString(),serverInfo:info,amendments},null,2));
    for (const name of ['SingleAssetVault','LendingProtocol']) if (!enabled.includes(half(name))) throw new Error(`Required ${name} amendment not enabled`);
    if (enabled.includes(half('LendingProtocolV1_1')) && !((this.allowV11ReadAndRecovery || TRACK1.allowEventV11Trial) && networkId === 4001)) throw new Error('Lending V1.1 detected; new Track 1 loans require a V1-only environment');
    this.identity = { track: TRACK1.track, websocket: TRACK1.websocket, networkId, serverBuild: info.build_version };
    return this.identity;
    } catch (error) {
      if (this.client.isConnected()) await this.client.disconnect();
      throw error;
    }
  }
  async assertCanOriginate():Promise<void>{
    const environment=await readTrackEnvironment();
    if(!this.identity||environment.networkId!==this.identity.networkId||environment.serverBuild!==this.identity.serverBuild||!environment.canOriginate)throw Error(environment.reason);
  }
  async disconnect(): Promise<void> { await this.client.disconnect(); }
  async prepare<T extends SubmittableTransaction>(tx: T): Promise<T> {
    if (!this.identity) throw new Error('Connect and verify network first');
    if(tx.TransactionType==='LoanSet'||tx.TransactionType==='LoanBrokerSet')await this.assertCanOriginate();
    const prepared = await this.client.autofill(tx);
    // VaultCreate charges an owner-reserve fee, unlike ordinary transactions.
    const feeCap = tx.TransactionType === 'VaultCreate' ? 10000000n : 100000n;
    if (!prepared.Fee || BigInt(prepared.Fee) > feeCap) throw new Error('Fee exceeds test cap');
    return prepared;
  }
  async prepareLoan(tx: LoanSet): Promise<LoanSet> { return this.prepare(tx); }
  async submit(blob: string): Promise<void> {
    // Preliminary engine_result is never treated as validation, even tesSUCCESS.
    await this.client.submit(blob);
  }
  async lookup(hash: string): Promise<ValidatedTransaction | undefined> {
    try {
      const { result } = await this.client.request({ command: 'tx', transaction: hash, binary: false });
      if (result.validated !== true) return undefined;
      if (!result.meta || typeof result.meta !== 'object' || !result.ledger_index || result.hash !== hash) throw new Error('Incomplete validated transaction');
      return { hash, ledgerIndex: result.ledger_index, resultCode: result.meta.TransactionResult,
        tx: result.tx_json as unknown as Record<string, unknown>, meta: result.meta as unknown as Record<string, unknown>, raw: result };
    } catch (error) {
      if ((error as { data?: { error?: string } }).data?.error === 'txnNotFound') return undefined;
      throw error;
    }
  }
  async ledgerIndex(): Promise<number> { return this.client.getLedgerIndex(); }
  async account(address: string, ledgerIndex: number | 'validated' = 'validated') {
    return (await this.client.request({ command: 'account_info', account: address, ledger_index: ledgerIndex })).result;
  }
  async object(index: string, ledgerIndex: number | 'validated' = 'validated') {
    return (await this.client.request({ command: 'ledger_entry', index, ledger_index: ledgerIndex })).result;
  }
}
export function createdId(result: ValidatedTransaction, type: string): string {
  const nodes = result.meta.AffectedNodes as Array<{ CreatedNode?: { LedgerEntryType: string; LedgerIndex: string } }>;
  const matches = nodes.filter(node => node.CreatedNode?.LedgerEntryType === type);
  if (matches.length !== 1) throw new Error(`Expected one created ${type}`);
  return matches[0]!.CreatedNode!.LedgerIndex;
}
export function balanceDelta(result: ValidatedTransaction, account: string): bigint {
  const nodes = result.meta.AffectedNodes as Array<{ ModifiedNode?: { LedgerEntryType: string; FinalFields: { Account?: string; Balance?: string }; PreviousFields: { Balance?: string } } }>;
  for (const node of nodes) {
    const modified = node.ModifiedNode;
    if (modified?.LedgerEntryType === 'AccountRoot' && modified.FinalFields.Account === account && modified.FinalFields.Balance !== undefined) {
      return BigInt(modified.FinalFields.Balance) - BigInt(modified.PreviousFields.Balance ?? modified.FinalFields.Balance);
    }
  }
  return 0n;
}
