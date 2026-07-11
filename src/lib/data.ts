import { subscriptionPlans, terminologyDefaults } from "./constants";
import type { AuditLog, Branch, Invitation, Membership, OrganizationUnit, Profile, Role, Tenant } from "./types";

export const profiles: Profile[] = [
  { id: "user-platform-owner", email: "timsila18@gmail.com", fullName: "Timothy Sila" },
  { id: "user-admin", email: "admin@kingsgrace.test", fullName: "Amina Otieno", phone: "+254700000001" },
  { id: "user-branch", email: "branch@kingsgrace.test", fullName: "David Mwangi" },
];

export const tenants: Tenant[] = [
  {
    id: "tenant-kings-grace",
    legalName: "King's Grace Community Church",
    publicName: "King's Grace",
    slug: "kings-grace",
    primaryColor: "#10243f",
    secondaryColor: "#f3f1ec",
    accentColor: "#b7822f",
    country: "Kenya",
    region: "Nairobi County",
    physicalAddress: "Thika Road, Nairobi",
    contactEmail: "hello@kingsgrace.test",
    contactPhone: "+254700000000",
    website: "https://example.org",
    timeZone: "Africa/Nairobi",
    defaultCurrency: "KES",
    defaultLanguage: "en",
    dateFormat: "dd MMM yyyy",
    timeFormat: "24h",
    membershipTerminology: "Member",
    branchTerminology: "Campus",
    smallGroupTerminology: "Fellowship",
    ministryHeadTitle: "Lead Pastor",
    status: "approved",
    subscriptionStatus: "active",
    onboardingStatus: "approved",
    createdAt: "2026-07-11T08:00:00.000Z",
    updatedAt: "2026-07-11T08:00:00.000Z",
  },
  {
    id: "tenant-pending",
    legalName: "Hope Assembly",
    publicName: "Hope Assembly",
    slug: "hope-assembly",
    primaryColor: "#1b365d",
    secondaryColor: "#eef2f7",
    accentColor: "#a16f2b",
    country: "Kenya",
    region: "Kiambu County",
    physicalAddress: "Ruiru",
    contactEmail: "hello@hope.test",
    contactPhone: "+254700000002",
    timeZone: "Africa/Nairobi",
    defaultCurrency: "KES",
    defaultLanguage: "en",
    dateFormat: "dd MMM yyyy",
    timeFormat: "24h",
    membershipTerminology: "Believer",
    branchTerminology: "Branch",
    smallGroupTerminology: "Connect Group",
    ministryHeadTitle: "Senior Pastor",
    status: "under_review",
    subscriptionStatus: "trialing",
    onboardingStatus: "submitted",
    createdAt: "2026-07-11T09:00:00.000Z",
    updatedAt: "2026-07-11T09:00:00.000Z",
  },
];

export const roles: Role[] = [
  {
    id: "role-admin",
    tenantId: "tenant-kings-grace",
    name: "church_admin",
    displayName: "Church Administrator",
    systemTemplate: true,
    permissions: ["tenant.view", "organization.view", "organization.manage", "branch.view", "branch.manage", "settings.view", "settings.manage", "role.view", "role.manage", "audit.view"],
  },
  {
    id: "role-branch",
    tenantId: "tenant-kings-grace",
    name: "branch_pastor",
    displayName: "Branch Pastor",
    systemTemplate: true,
    permissions: ["tenant.view", "organization.view", "branch.view"],
  },
  {
    id: "role-member",
    tenantId: "tenant-kings-grace",
    name: "member",
    displayName: "Member",
    systemTemplate: true,
    permissions: ["tenant.view"],
  },
];

export const memberships: Membership[] = [
  { id: "membership-admin", tenantId: "tenant-kings-grace", userId: "user-admin", status: "active", roleIds: ["role-admin"] },
  { id: "membership-branch", tenantId: "tenant-kings-grace", userId: "user-branch", status: "active", roleIds: ["role-branch"] },
];

export const organizationUnits: OrganizationUnit[] = [
  { id: "unit-head", tenantId: "tenant-kings-grace", unitType: "head_office", name: "Head Office", code: "KGC-HQ", leaderName: "Amina Otieno", administratorName: "Amina Otieno", location: "Nairobi", status: "active", visibility: "tenant", reportingOrder: 1, createdBy: "user-admin", updatedBy: "user-admin", createdAt: "2026-07-11T08:10:00.000Z", updatedAt: "2026-07-11T08:10:00.000Z" },
  { id: "unit-east", tenantId: "tenant-kings-grace", parentId: "unit-head", unitType: "region", name: "Eastern Region", code: "KGC-ER", leaderName: "David Mwangi", status: "active", visibility: "tenant", reportingOrder: 2, createdBy: "user-admin", updatedBy: "user-admin", createdAt: "2026-07-11T08:20:00.000Z", updatedAt: "2026-07-11T08:20:00.000Z" },
  { id: "unit-imaara", tenantId: "tenant-kings-grace", parentId: "unit-east", unitType: "branch", name: "Imaara Campus", code: "KGC-IMA", leaderName: "David Mwangi", status: "active", visibility: "tenant", reportingOrder: 3, createdBy: "user-admin", updatedBy: "user-admin", createdAt: "2026-07-11T08:30:00.000Z", updatedAt: "2026-07-11T08:30:00.000Z" },
  { id: "unit-ruiru", tenantId: "tenant-kings-grace", parentId: "unit-east", unitType: "branch", name: "Ruiru Campus", code: "KGC-RUI", leaderName: "Grace Wanjiku", status: "active", visibility: "tenant", reportingOrder: 4, createdBy: "user-admin", updatedBy: "user-admin", createdAt: "2026-07-11T08:35:00.000Z", updatedAt: "2026-07-11T08:35:00.000Z" },
];

export const branches: Branch[] = [
  { id: "branch-imaara", tenantId: "tenant-kings-grace", unitId: "unit-imaara", name: "Imaara Campus", code: "IMA", leaderName: "David Mwangi", administratorName: "Mercy Njeri", address: "Imaara Daima", phone: "+254711000001", email: "imaara@kingsgrace.test", serviceTimes: ["Sunday 09:00", "Wednesday 18:00"], status: "active", seatingCapacity: 450, timeZone: "Africa/Nairobi" },
  { id: "branch-ruiru", tenantId: "tenant-kings-grace", unitId: "unit-ruiru", name: "Ruiru Campus", code: "RUI", leaderName: "Grace Wanjiku", administratorName: "Peter Kariuki", address: "Ruiru Town", phone: "+254711000002", email: "ruiru@kingsgrace.test", serviceTimes: ["Sunday 10:00"], status: "planting", seatingCapacity: 220, timeZone: "Africa/Nairobi" },
];

export const invitations: Invitation[] = [
  { id: "invite-1", tenantId: "tenant-kings-grace", email: "volunteer@example.com", roleId: "role-member", scopeType: "branch", scopeId: "branch-imaara", status: "pending", expiresAt: "2026-07-25T08:00:00.000Z", tokenPreview: "kf_inv_...8d2" },
];

export const auditLogs: AuditLog[] = [
  { id: "audit-1", tenantId: "tenant-kings-grace", actorId: "user-platform-owner", actorName: "Timothy Sila", action: "church.approved", entityType: "tenant", entityId: "tenant-kings-grace", result: "success", reason: "Development seed approval", scopeType: "platform", createdAt: "2026-07-11T08:05:00.000Z" },
  { id: "audit-2", tenantId: "tenant-kings-grace", actorId: "user-admin", actorName: "Amina Otieno", action: "organization_unit.created", entityType: "organization_unit", entityId: "unit-imaara", result: "success", scopeType: "unit", scopeId: "unit-imaara", createdAt: "2026-07-11T08:30:00.000Z" },
  { id: "audit-3", tenantId: "tenant-kings-grace", actorId: "user-admin", actorName: "Amina Otieno", action: "invitation.created", entityType: "invitation", entityId: "invite-1", result: "success", scopeType: "branch", scopeId: "branch-imaara", createdAt: "2026-07-11T10:00:00.000Z" },
];

export const tenantTerminology = {
  "tenant-kings-grace": {
    ...terminologyDefaults,
    branch: "Campus",
    small_group: "Fellowship",
    senior_pastor: "Lead Pastor",
  },
};

export function getTenantBySlug(slug: string) {
  return tenants.find((tenant) => tenant.slug === slug);
}

export function getTenantSubscription(tenantId: string) {
  return {
    tenantId,
    plan: subscriptionPlans[0],
    status: tenants.find((tenant) => tenant.id === tenantId)?.subscriptionStatus ?? "trialing",
    billingCycle: "monthly" as const,
  };
}
