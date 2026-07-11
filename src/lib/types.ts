export type TenantStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "needs_clarification"
  | "suspended";

export type SubscriptionStatus = "trialing" | "active" | "grace_period" | "past_due" | "suspended";
export type ScopeType =
  | "tenant"
  | "unit"
  | "unit_descendants"
  | "branch"
  | "branch_descendants"
  | "department"
  | "programme"
  | "small_group"
  | "assigned_records"
  | "self"
  | "platform";

export type PermissionKey = string;

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
  description?: string;
  category?: string;
  authorityLevel?: number;
  defaultScopeType?: ScopeType;
  mayReceiveDelegation?: boolean;
  mayDelegate?: boolean;
  maySupervise?: boolean;
  approvalRequiredForAssignment?: boolean;
  archived?: boolean;
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

export interface UserRoleAssignment {
  id: string;
  tenantId: string;
  userId: string;
  roleId: string;
  scopeType: ScopeType;
  scopeId?: string;
  includeDescendants: boolean;
  effectiveFrom: string;
  expiresAt?: string;
  active: boolean;
  assignmentReason: string;
  assignedBy: string;
  approvedBy?: string;
  sourceDelegationId?: string;
}

export interface Delegation {
  id: string;
  tenantId: string;
  delegatorUserId: string;
  delegateUserId: string;
  permissionKeys: PermissionKey[];
  scopeType: ScopeType;
  scopeId?: string;
  includeDescendants: boolean;
  startsAt: string;
  expiresAt: string;
  status: "pending" | "active" | "revoked" | "expired";
  approvedBy?: string;
  reason: string;
}

export interface ActingAppointment {
  id: string;
  tenantId: string;
  unavailableUserId: string;
  actingUserId: string;
  roleId: string;
  permissionKeys: PermissionKey[];
  scopeType: ScopeType;
  scopeId?: string;
  startsAt: string;
  expiresAt: string;
  status: "pending" | "active" | "ended";
}

export interface LeadershipPosition {
  id: string;
  tenantId: string;
  title: string;
  roleId: string;
  unitId?: string;
  branchId?: string;
  authorityLevel: number;
  receivesReferrals: boolean;
  referralCategories: string[];
  maxConfidentialityLevel: number;
  status: "active" | "vacant" | "archived";
}

export interface LeadershipAssignment {
  id: string;
  tenantId: string;
  positionId: string;
  userId: string;
  reportsToAssignmentId?: string;
  supervisingAssignmentId?: string;
  deputyUserId?: string;
  actingReplacementUserId?: string;
  appointmentDate: string;
  termStart: string;
  termEnd?: string;
  status: "active" | "acting" | "inactive";
  pastoralSpecialties: string[];
}

export interface ReferralRule {
  id: string;
  tenantId: string;
  name: string;
  category: string;
  sensitivity: "low" | "standard" | "confidential" | "safeguarding";
  urgency: "routine" | "soon" | "urgent";
  direction: "upward" | "specialist" | "safeguarding" | "welfare" | "senior_authority" | "return_to_referrer";
  targetPositionId?: string;
  active: boolean;
}

export interface GovernanceSettings {
  tenantId: string;
  governanceModel: "founder_led" | "senior_pastor_led" | "bishop_led" | "board_governed" | "council_governed" | "hybrid" | "custom";
  principalAuthorityUserId: string;
  principalAuthorityTitle: string;
  approvalPhilosophy: string;
  emergencyAuthorityEnabled: boolean;
  separationOfDutiesMode: "warning" | "second_approval" | "prohibit" | "exception";
  quorumFoundation?: string;
}

export interface AuthorityLimit {
  id: string;
  tenantId: string;
  roleId: string;
  permissionKey: PermissionKey;
  currency: string;
  maxAmount: number;
  transactionType: string;
  scopeType: ScopeType;
  scopeId?: string;
}

export interface ApprovalWorkflow {
  id: string;
  tenantId: string;
  name: string;
  actionType: string;
  version: number;
  active: boolean;
  steps: ApprovalStep[];
}

export interface ApprovalStep {
  id: string;
  workflowId: string;
  order: number;
  mode: "sequential" | "parallel" | "any_one" | "all_required";
  approverRoleIds: string[];
  approverUserIds: string[];
  hierarchyRule?: "supervisor" | "principal_authority" | "financial_limit";
  dueHours: number;
}

export interface ApprovalRequest {
  id: string;
  tenantId: string;
  workflowId: string;
  requesterUserId: string;
  entityType: string;
  entityId: string;
  action: string;
  summary: string;
  reason: string;
  currentStepOrder: number;
  status: "draft" | "submitted" | "pending" | "partially_approved" | "returned" | "approved" | "rejected" | "cancelled" | "expired" | "escalated";
  scopeType: ScopeType;
  scopeId?: string;
  requestedAt: string;
  dueAt?: string;
  completedAt?: string;
}

export interface ApprovalAction {
  id: string;
  requestId: string;
  approverUserId: string;
  decision: "approved" | "rejected" | "returned" | "recused";
  comment: string;
  decidedAt: string;
  delegatedAuthority: boolean;
}

export interface SeparationOfDutiesRule {
  id: string;
  tenantId: string;
  firstPermission: PermissionKey;
  secondPermission: PermissionKey;
  mode: "warning" | "second_approval" | "prohibit" | "exception";
  description: string;
}

export interface ConflictDeclaration {
  id: string;
  tenantId: string;
  userId: string;
  requestId?: string;
  conflictType: "personal" | "family" | "business" | "direct_involvement" | "prior_participation" | "other";
  recused: boolean;
  createdAt: string;
}

export interface AccessReview {
  id: string;
  tenantId: string;
  name: string;
  status: "draft" | "in_progress" | "completed";
  completedBy?: string;
  completedAt?: string;
}

export interface UserSuspension {
  id: string;
  tenantId: string;
  userId: string;
  status: "scheduled" | "active" | "reactivated";
  reason: string;
  startsAt: string;
  endsAt?: string;
  revokeDelegations: boolean;
  transferPendingApprovalsTo?: string;
}
