export type TenantStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "needs_clarification"
  | "suspended";

export type SubscriptionStatus = "trialing" | "active" | "grace_period" | "past_due" | "suspended";
export type ScopeType = "tenant" | "branch" | "unit" | "platform";

export type PermissionKey =
  | "tenant.view"
  | "tenant.manage"
  | "organization.view"
  | "organization.manage"
  | "branch.view"
  | "branch.manage"
  | "member.view"
  | "member.manage"
  | "visitor.view"
  | "visitor.manage"
  | "pastoral_case.view"
  | "pastoral_case.manage"
  | "finance.view"
  | "finance.manage"
  | "programme.view"
  | "programme.manage"
  | "report.view"
  | "report.manage"
  | "settings.view"
  | "settings.manage"
  | "role.view"
  | "role.manage"
  | "audit.view";

export interface Tenant {
  id: string;
  legalName: string;
  publicName: string;
  slug: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  country: string;
  region: string;
  physicalAddress: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  timeZone: string;
  defaultCurrency: string;
  defaultLanguage: string;
  dateFormat: string;
  timeFormat: string;
  membershipTerminology: string;
  branchTerminology: string;
  smallGroupTerminology: string;
  ministryHeadTitle: string;
  status: TenantStatus;
  subscriptionStatus: SubscriptionStatus;
  onboardingStatus: TenantStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
}

export interface Role {
  id: string;
  tenantId: string;
  name: string;
  displayName: string;
  permissions: PermissionKey[];
  systemTemplate: boolean;
}

export interface Membership {
  id: string;
  tenantId: string;
  userId: string;
  status: "invited" | "active" | "suspended";
  roleIds: string[];
}

export interface OrganizationUnit {
  id: string;
  tenantId: string;
  parentId?: string;
  unitType: string;
  customTypeLabel?: string;
  name: string;
  code: string;
  leaderName?: string;
  deputyLeaderName?: string;
  administratorName?: string;
  location?: string;
  status: "active" | "archived";
  visibility: "tenant" | "restricted";
  reportingOrder: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  tenantId: string;
  unitId: string;
  name: string;
  code: string;
  leaderName: string;
  administratorName: string;
  address: string;
  phone: string;
  email: string;
  serviceTimes: string[];
  status: "active" | "planting" | "suspended" | "archived";
  seatingCapacity?: number;
  timeZone: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  minActivePeople: number;
  maxActivePeople?: number;
  monthlyKes?: number;
  annualKes?: number;
  features: string[];
}

export interface AuditLog {
  id: string;
  tenantId?: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  result: "success" | "blocked" | "failed";
  reason?: string;
  scopeType?: ScopeType;
  scopeId?: string;
  createdAt: string;
}

export interface Invitation {
  id: string;
  tenantId: string;
  email: string;
  roleId: string;
  scopeType: ScopeType;
  scopeId?: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  expiresAt: string;
  tokenPreview: string;
}
