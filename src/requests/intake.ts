import { digest } from "./commitment.js";
import { Store } from "./store.js";
import type {
  FinancingInput,
  FinancingRequest,
  ReviewDecision,
} from "../shared/intake.js";

export function financingInput(input: Record<string, unknown>): FinancingInput {
  const keys = [
    "clientRequestId",
    "requestedDrops",
    "requestedDays",
    "purpose",
    "synthetic",
  ];
  if (
    Object.keys(input).some((key) => !keys.includes(key)) ||
    input.synthetic !== true
  )
    throw new Error("Only synthetic test requests are supported");
  if (
    typeof input.clientRequestId !== "string" ||
    !/^request-[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(
      input.clientRequestId,
    )
  )
    throw new Error("A valid unique request ID is required");
  if (
    typeof input.requestedDrops !== "string" ||
    !/^[1-9][0-9]{0,10}$/.test(input.requestedDrops) ||
    BigInt(input.requestedDrops) < 1000000n ||
    BigInt(input.requestedDrops) > 10000000000n
  )
    throw new Error("Request between 1 and 10,000 test XRP");
  if (
    typeof input.requestedDays !== "number" ||
    !Number.isInteger(input.requestedDays) ||
    input.requestedDays < 1 ||
    input.requestedDays > 90
  )
    throw new Error("Choose a requested term between 1 and 90 days");
  if (
    typeof input.purpose !== "string" ||
    !["inventory", "receivables", "working-capital"].includes(input.purpose)
  )
    throw new Error("Choose a supported business purpose");
  return input as unknown as FinancingInput;
}

/** Calls run under the server's existing process lock. No ledger or receipt dependency. */
export class IntakeService {
  constructor(readonly store: Store<FinancingRequest>) {}
  async list(): Promise<FinancingRequest[]> {
    return (await this.store.all()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }
  async create(raw: Record<string, unknown>): Promise<FinancingRequest> {
    const input = financingInput(raw),
      requestDigest = digest(input);
    const prior = await this.store.read(input.clientRequestId);
    if (prior) {
      if (prior.requestDigest !== requestDigest)
        throw new Error("This request ID already belongs to different details");
      return prior; // Retried submissions cannot rewind broker review.
    }
    if ((await this.store.all()).length >= 100)
      throw new Error("This demo workspace has reached its 100-request limit");
    const now = new Date().toISOString();
    const request: FinancingRequest = {
      ...input,
      schema: "recognitium.intake.v1",
      requestDigest,
      revision: 1,
      status: "AWAITING_REVIEW",
      createdAt: now,
      updatedAt: now,
      history: [{ at: now, role: "borrower", event: "submitted" }],
    };
    await this.store.write(input.clientRequestId, request);
    return request;
  }
  async review(
    id: string,
    raw: Record<string, unknown>,
  ): Promise<FinancingRequest> {
    if (
      Object.keys(raw).some(
        (key) =>
          !["expectedRevision", "requestDigest", "decision"].includes(key),
      ) ||
      !Number.isSafeInteger(raw.expectedRevision) ||
      typeof raw.requestDigest !== "string" ||
      typeof raw.decision !== "string" ||
      !["start-review", "request-revision", "finish-review"].includes(
        raw.decision,
      )
    )
      throw new Error("Exact request version and review decision required");
    const request = await this.store.read(id);
    if (!request) throw new Error("Unknown financing request");
    const reviewDigest = digest(raw);
    if (reviewDigest === request.lastReviewDigest) return request;
    if (
      request.revision !== raw.expectedRevision ||
      request.requestDigest !== raw.requestDigest
    )
      throw new Error("Request changed. Review the current version");
    const decision = raw.decision as ReviewDecision;
    if (
      decision === "start-review"
        ? request.status !== "AWAITING_REVIEW"
        : request.status !== "UNDER_REVIEW"
    )
      throw new Error("This review action is no longer available");
    request.status =
      decision === "start-review"
        ? "UNDER_REVIEW"
        : decision === "request-revision"
          ? "NEEDS_REVISION"
          : "REVIEWED";
    request.revision++;
    request.updatedAt = new Date().toISOString();
    request.lastReviewDigest = reviewDigest;
    request.history.push({
      at: request.updatedAt,
      role: "broker",
      event: decision,
    });
    await this.store.write(id, request);
    return request;
  }
}
