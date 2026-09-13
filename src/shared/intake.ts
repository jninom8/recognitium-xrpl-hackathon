/** Synthetic financing requests are intake records, never signed loan agreements. */
export type FinancingPurpose = "inventory" | "receivables" | "working-capital";
export interface FinancingInput {
  clientRequestId: string;
  requestedDrops: string;
  requestedDays: number;
  purpose: FinancingPurpose;
  synthetic: true;
}
export type ReviewDecision =
  | "start-review"
  | "request-revision"
  | "finish-review"
  | "reject-request";
export interface FinancingRequest extends FinancingInput {
  schema: "recognitium.intake.v1";
  requestDigest: string;
  revision: number;
  status: "AWAITING_REVIEW" | "UNDER_REVIEW" | "NEEDS_REVISION" | "REVIEWED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  history: {
    at: string;
    role: "borrower" | "broker";
    event: "submitted" | ReviewDecision;
  }[];
  lastReviewDigest?: string;
}
