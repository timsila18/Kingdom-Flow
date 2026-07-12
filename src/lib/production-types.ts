export type BillingCycle = "monthly" | "annual" | "free" | "custom_enterprise" | "sponsored" | "temporary_waiver";
export type SubscriptionLifecycleStatus = "trial" | "active" | "payment_due" | "grace_period" | "past_due" | "suspended_billing" | "sponsored" | "cancelled" | "expired" | "enterprise_review";

export interface ActivePeopleMonth {
  tenantId: string;
  month: string;
  activePeople: number;
  excludedPeople: number;
  basis: string[];
  deduplicatedPersonIds: string[];
}

export interface BillingRecommendation {
  tenantId: string;
  rollingThreeMonthAverage: number;
  recommendedPlanId: string;
  currentPlanId: string;
  changeType: "none" | "upgrade_recommended" | "downgrade_review" | "enterprise_review";
  effectiveDate?: string;
  requiresManualReview: boolean;
  explanation: string;
}

export interface SubscriptionInvoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  planId: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  activePeopleBasis: number;
  subtotalKes: number;
  discountKes: number;
  totalKes: number;
  dueDate: string;
  status: "draft" | "issued" | "payment_due" | "paid" | "void";
  paymentInstructions: string;
}

export interface ReleaseGate {
  key: string;
  label: string;
  status: "pass" | "watch" | "blocked";
  evidence: string;
  releaseBlocking: boolean;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  scope: "global" | "plan" | "tenant" | "branch" | "beta" | "emergency_disable";
  reason: string;
}

export interface SupportAccessRequest {
  id: string;
  tenantId: string;
  requestedBy: string;
  scope: string;
  durationHours: number;
  status: "requested" | "approved" | "revoked" | "expired";
  audited: boolean;
}
