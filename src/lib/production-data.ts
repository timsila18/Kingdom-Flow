import type { FeatureFlag, ReleaseGate, SubscriptionInvoice, SupportAccessRequest } from "./production-types";

export const featureFlags: FeatureFlag[] = [
  { key: "advanced_analytics", enabled: true, scope: "tenant", reason: "Prompt 12 command center is enabled for approved tenants with analytics permissions." },
  { key: "ai_copilot", enabled: true, scope: "plan", reason: "AI requires usage controls, policy review and tenant authorization." },
  { key: "solco", enabled: false, scope: "beta", reason: "Solco adapter is complete but production delivery depends on external credentials." },
  { key: "subscription_mpesa_stk", enabled: false, scope: "emergency_disable", reason: "Adapter contract exists; live credentials are not stored in source." },
];

export const subscriptionInvoices: SubscriptionInvoice[] = [
  {
    id: "kf-invoice-kings-grace-jul",
    tenantId: "tenant-kings-grace",
    invoiceNumber: "KF-2026-000001",
    planId: "starter",
    billingPeriodStart: "2026-07-01",
    billingPeriodEnd: "2026-07-31",
    activePeopleBasis: 4,
    subtotalKes: 0,
    discountKes: 0,
    totalKes: 0,
    dueDate: "2026-08-07",
    status: "issued",
    paymentInstructions: "KingdomFlow subscription payments use the platform destination only, never church giving accounts.",
  },
];

export const releaseGates: ReleaseGate[] = [
  { key: "tenant_isolation", label: "Tenant isolation", status: "pass", evidence: "All new tables include tenant_id and RLS policies in migration.", releaseBlocking: true },
  { key: "no_fake_payments", label: "No fake payment confirmation", status: "pass", evidence: "Subscription payment adapter does not mark payments successful without verification.", releaseBlocking: true },
  { key: "pastoral_confidentiality", label: "Pastoral confidentiality", status: "pass", evidence: "Analytics cards use aggregate pastoral counts only.", releaseBlocking: true },
  { key: "solco_credentials", label: "Solco production credentials", status: "watch", evidence: "Adapter is feature-flagged until live credentials are configured.", releaseBlocking: false },
  { key: "deployment_push", label: "Production deployment", status: "watch", evidence: "Local build can pass; remote push/deploy depends on sandbox network approval.", releaseBlocking: false },
];

export const supportAccessRequests: SupportAccessRequest[] = [
  {
    id: "support-access-demo",
    tenantId: "tenant-kings-grace",
    requestedBy: "user-platform-owner",
    scope: "billing_and_configuration_only",
    durationHours: 4,
    status: "requested",
    audited: true,
  },
];

export const stewardshipCommitment = [
  "KingdomFlow exists to strengthen ministry, not exploit it.",
  "We do not charge for prayer, salvation, pastoral care, spiritual outcomes or the Gospel.",
  "Churches keep their own giving accounts; KingdomFlow charges transparent technology subscriptions only.",
  "No percentage is taken from giving and no giving-based spiritual rankings are created.",
  "Churches retain data ownership, export rights and responsibility for doctrine and ministry decisions.",
];
