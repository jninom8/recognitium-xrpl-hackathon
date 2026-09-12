/** Pure UI ordering/review rules, also exercised without a browser. */
export class SnapshotCursor {
  sequence = 0;
  mode = 'live';
  instanceId;
  acceptedMode;
  revision = -1;
  begin(mode) { this.mode = mode; return ++this.sequence; }
  accept(ticket, state) {
    if (ticket !== this.sequence || state.mode !== this.mode) return false;
    if (this.instanceId === state.instanceId && this.acceptedMode === state.mode && state.revision < this.revision) return false;
    this.instanceId = state.instanceId; this.acceptedMode = state.mode; this.revision = state.revision; return true;
  }
}
export function sameReview(review, state) {
  if (review.instanceId !== state.instanceId || state.mode !== 'live') return false;
  const current = state.requests.find(r => r.agreement.requestId === review.requestId);
  const actions = review.requestId ? current?.actions : state.actions;
  if (review.action && !actions?.some(a => a.id === review.action.id && a.allowed)) return false;
  if (!review.requestId) return true;
  return Boolean(current && current.agreementHash === review.agreementHash && current.transactionDigest === review.transactionDigest);
}
export function drops(value) {
  if (value === undefined || value === null || !/^-?\d+$/.test(String(value))) return 'Not observed';
  const n = BigInt(value); const absolute = n < 0n ? -n : n;
  const fraction = (absolute % 1000000n).toString().padStart(6, '0').replace(/0+$/, '');
  return `${n < 0n ? '-' : ''}${absolute / 1000000n}${fraction ? '.' + fraction : ''}`;
}
