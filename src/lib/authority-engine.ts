import { permissionDependencies, permissionGroups } from "./constants";
import { actingAppointments, authorityRoles, delegations, governanceSettings, leadershipAssignments, leadershipPositions, referralRules, userRoleAssignments, userSuspensions } from "./authority-data";
import { branches, memberships, organizationUnits, roles } from "./data";
import type { ActingAppointment, Delegation, PermissionKey, ScopeType, UserRoleAssignment } from "./types";

export interface AuthorizationContext {
  tenantId: string;
  scopeType?: ScopeType;
  scopeId?: string;
  now?: Date;
  amount?: number;
  actorUserId?: string;
}

export interface EffectivePermission {
  permission: PermissionKey;
  source: "role" | "delegation" | "acting";
  sourceId: string;
  sourceLabel: string;
  scopeType: ScopeType;
  scopeId?: string;
  includeDescendants: boolean;
  expiresAt?: string;
  explanation: string;
}

export interface AuthorizationDecision {
  allowed: boolean;
  reason: string;
  source?: EffectivePermission;
  requiredApproval?: string;
}

export function getAllRoles() {
  return [...roles, ...authorityRoles];
}

export function getPermissionCatalogue() {
  return permissionGroups.map((group) => ({
    ...group,
    count: group.permissions.length,
  }));
}

export function getRoleWarnings(permissionKeys: PermissionKey[]) {
  const warnings: string[] = [];
  for (const dependency of permissionDependencies) {
    if (permissionKeys.includes(dependency.permission) && !permissionKeys.includes(dependency.requires)) {
      warnings.push(`${dependency.permission} requires ${dependency.requires}: ${dependency.reason}`);
    }
  }
  if (permissionKeys.includes("finance.transaction.create") && permissionKeys.includes("finance.transaction.approve")) {
    warnings.push("Separation of duties warning: do not allow the same person to create and approve the same payment without a second approval or exception.");
  }
  if (permissionKeys.some((permission) => permission.includes("sensitive") || permission.includes("view_all") || permission.includes("send_all"))) {
    warnings.push("Sensitive permission warning: assignment should require visible approval and audit review.");
  }
  return warnings;
}

function isActiveWindow(startsAt: string, expiresAt: string | undefined, now: Date) {
  const start = new Date(startsAt);
  const end = expiresAt ? new Date(expiresAt) : undefined;
  return start <= now && (!end || end > now);
}

function getDescendantUnitIds(unitId: string) {
  const found = new Set<string>();
  const visit = (parentId: string) => {
    for (const unit of organizationUnits) {
      if (unit.parentId === parentId && !found.has(unit.id)) {
        found.add(unit.id);
        visit(unit.id);
      }
    }
  };
  visit(unitId);
  return found;
}

function branchToUnitId(branchId?: string) {
  return branches.find((branch) => branch.id === branchId)?.unitId;
}

export function isScopeMatch(grant: { scopeType: ScopeType; scopeId?: string; includeDescendants?: boolean }, context: AuthorizationContext) {
  if (!context.scopeType || grant.scopeType === "tenant") return true;
  if (grant.scopeType === "self") return context.scopeType === "self";
  if (grant.scopeType === "assigned_records") return context.scopeType === "assigned_records";
  if (grant.scopeType === context.scopeType && grant.scopeId === context.scopeId) return true;

  if ((grant.scopeType === "unit_descendants" || (grant.scopeType === "unit" && grant.includeDescendants)) && grant.scopeId) {
    const descendantUnitIds = getDescendantUnitIds(grant.scopeId);
    if (context.scopeType === "unit" || context.scopeType === "unit_descendants") {
      return context.scopeId === grant.scopeId || Boolean(context.scopeId && descendantUnitIds.has(context.scopeId));
    }
    if (context.scopeType === "branch") {
      const unitId = branchToUnitId(context.scopeId);
      return unitId === grant.scopeId || Boolean(unitId && descendantUnitIds.has(unitId));
    }
  }

  if ((grant.scopeType === "branch_descendants" || grant.scopeType === "branch") && context.scopeType === "branch") {
    return grant.scopeId === context.scopeId;
  }

  return false;
}

function assignmentToEffectivePermission(assignment: UserRoleAssignment, permission: PermissionKey): EffectivePermission | undefined {
  const role = getAllRoles().find((item) => item.id === assignment.roleId);
  if (!role?.permissions.includes(permission)) return undefined;
  return {
    permission,
    source: "role",
    sourceId: assignment.id,
    sourceLabel: role.displayName,
    scopeType: assignment.scopeType,
    scopeId: assignment.scopeId,
    includeDescendants: assignment.includeDescendants,
    expiresAt: assignment.expiresAt,
    explanation: `This user has ${permission} because they hold ${role.displayName} for ${assignment.scopeType}${assignment.scopeId ? ` ${assignment.scopeId}` : ""}.`,
  };
}

function delegationToEffectivePermission(delegation: Delegation, permission: PermissionKey): EffectivePermission | undefined {
  if (!delegation.permissionKeys.includes(permission)) return undefined;
  return {
    permission,
    source: "delegation",
    sourceId: delegation.id,
    sourceLabel: "Delegated authority",
    scopeType: delegation.scopeType,
    scopeId: delegation.scopeId,
    includeDescendants: delegation.includeDescendants,
    expiresAt: delegation.expiresAt,
    explanation: `This user has delegated ${permission} until ${new Date(delegation.expiresAt).toLocaleDateString()}.`,
  };
}

function actingToEffectivePermission(appointment: ActingAppointment, permission: PermissionKey): EffectivePermission | undefined {
  if (!appointment.permissionKeys.includes(permission)) return undefined;
  return {
    permission,
    source: "acting",
    sourceId: appointment.id,
    sourceLabel: "Acting appointment",
    scopeType: appointment.scopeType,
    scopeId: appointment.scopeId,
    includeDescendants: false,
    expiresAt: appointment.expiresAt,
    explanation: `This user has ${permission} through a temporary acting appointment.`,
  };
}

export function getEffectivePermissions(userId: string, tenantId: string, now = new Date("2026-07-11T12:00:00.000Z")) {
  const membership = memberships.find((item) => item.userId === userId && item.tenantId === tenantId);
  if (!membership || membership.status !== "active") return [];
  if (userSuspensions.some((item) => item.tenantId === tenantId && item.userId === userId && item.status === "active")) return [];

  const effective: EffectivePermission[] = [];

  for (const assignment of userRoleAssignments) {
    if (assignment.tenantId !== tenantId || assignment.userId !== userId || !assignment.active) continue;
    if (!isActiveWindow(assignment.effectiveFrom, assignment.expiresAt, now)) continue;
    const role = getAllRoles().find((item) => item.id === assignment.roleId);
    role?.permissions.forEach((permission) => {
      const item = assignmentToEffectivePermission(assignment, permission);
      if (item) effective.push(item);
    });
  }

  for (const delegation of delegations) {
    if (delegation.tenantId !== tenantId || delegation.delegateUserId !== userId || delegation.status !== "active") continue;
    if (!isActiveWindow(delegation.startsAt, delegation.expiresAt, now)) continue;
    delegation.permissionKeys.forEach((permission) => {
      const item = delegationToEffectivePermission(delegation, permission);
      if (item) effective.push(item);
    });
  }

  for (const appointment of actingAppointments) {
    if (appointment.tenantId !== tenantId || appointment.actingUserId !== userId || appointment.status !== "active") continue;
    if (!isActiveWindow(appointment.startsAt, appointment.expiresAt, now)) continue;
    appointment.permissionKeys.forEach((permission) => {
      const item = actingToEffectivePermission(appointment, permission);
      if (item) effective.push(item);
    });
  }

  return effective;
}

export function can(userId: string, permission: PermissionKey, context: AuthorizationContext): AuthorizationDecision {
  const tenant = memberships.find((item) => item.userId === userId && item.tenantId === context.tenantId);
  if (!tenant) return { allowed: false, reason: "Denied: user is not a member of this tenant." };
  if (tenant.status !== "active") return { allowed: false, reason: `Denied: tenant membership is ${tenant.status}.` };

  const now = context.now ?? new Date("2026-07-11T12:00:00.000Z");
  const match = getEffectivePermissions(userId, context.tenantId, now).find(
    (effective) => effective.permission === permission && isScopeMatch(effective, context),
  );

  if (!match) {
    return {
      allowed: false,
      reason: `Denied: ${userId} does not have ${permission} for ${context.scopeType ?? "tenant"}${context.scopeId ? ` ${context.scopeId}` : ""}.`,
    };
  }

  return { allowed: true, reason: match.explanation, source: match };
}

export function requirePermission(userId: string, permission: PermissionKey, context: AuthorizationContext) {
  const decision = can(userId, permission, context);
  if (!decision.allowed) throw new Error(decision.reason);
  return decision;
}

export function getAccessibleScopes(userId: string, permission: PermissionKey, tenantId: string) {
  return getEffectivePermissions(userId, tenantId).filter((item) => item.permission === permission);
}

export function canManageUser(actorUserId: string, targetUserId: string, tenantId: string) {
  if (actorUserId === targetUserId) return { allowed: false, reason: "Denied: users cannot approve their own privileged access changes." };
  return can(actorUserId, "user.update", { tenantId, scopeType: "tenant" });
}

export function canAssignRole(actorUserId: string, roleId: string, context: AuthorizationContext) {
  const role = getAllRoles().find((item) => item.id === roleId);
  const decision = can(actorUserId, "role.assign", context);
  if (!decision.allowed) return decision;
  if (role?.approvalRequiredForAssignment) return { allowed: false, reason: "Requires approval: this role contains sensitive authority.", requiredApproval: "role.assignment.sensitive" };
  return decision;
}

export function canDelegate(actorUserId: string, permission: PermissionKey, context: AuthorizationContext) {
  const ownDecision = can(actorUserId, permission, context);
  if (!ownDecision.allowed) return ownDecision;
  const delegateDecision = can(actorUserId, "delegation.create", { ...context, scopeType: context.scopeType ?? "tenant" });
  if (!delegateDecision.allowed) return { allowed: false, reason: "Denied: user has the permission but may not delegate authority." };
  return { allowed: true, reason: "Allowed: user has the authority and delegation.create permission.", source: ownDecision.source };
}

export function canApprove(actorUserId: string, workflowAction: string, context: AuthorizationContext) {
  const permission = workflowAction.includes("role") ? "role.assign" : "governance.appointment.approve";
  if (context.actorUserId && context.actorUserId === actorUserId) {
    return { allowed: false, reason: "Denied: self-approval is blocked by separation-of-duties rules." };
  }
  return can(actorUserId, permission, context);
}

export function wouldCreateReportingCycle(assignments: { id: string; reportsToAssignmentId?: string }[], assignmentId: string, proposedReportsToId?: string) {
  if (!proposedReportsToId) return false;
  if (assignmentId === proposedReportsToId) return true;
  let current = assignments.find((assignment) => assignment.id === proposedReportsToId);
  while (current) {
    if (current.reportsToAssignmentId === assignmentId) return true;
    current = assignments.find((assignment) => assignment.id === current?.reportsToAssignmentId);
  }
  return false;
}

export function simulateReferralRoute(input: { tenantId: string; fromAssignmentId: string; category: string; sensitivity: "low" | "standard" | "confidential" | "safeguarding"; urgency: "routine" | "soon" | "urgent" }) {
  const rule = referralRules.find(
    (item) => item.tenantId === input.tenantId && item.active && item.category === input.category && item.sensitivity === input.sensitivity,
  );
  const from = leadershipAssignments.find((item) => item.id === input.fromAssignmentId);
  if (!rule || !from) return { receiver: undefined, reason: "No configured referral rule matched." };

  if (rule.targetPositionId) {
    const target = leadershipAssignments.find((item) => item.positionId === rule.targetPositionId && item.status !== "inactive");
    return { receiver: target, reason: `Matched ${rule.name} and routed to configured target position.` };
  }

  if (rule.direction === "upward" && from.reportsToAssignmentId) {
    const target = leadershipAssignments.find((item) => item.id === from.reportsToAssignmentId);
    return { receiver: target, reason: `Matched ${rule.name} and routed upward to supervising leader.` };
  }

  const principal = governanceSettings.find((item) => item.tenantId === input.tenantId);
  const target = leadershipAssignments.find((item) => item.userId === principal?.principalAuthorityUserId);
  return { receiver: target, reason: `Matched ${rule.name} and routed to principal authority fallback.` };
}

export function getVacantPositions(tenantId: string) {
  return leadershipPositions.filter((position) => position.tenantId === tenantId && position.status === "vacant");
}

export function authorizationDiagnostic(userId: string, permission: PermissionKey, context: AuthorizationContext) {
  const decision = can(userId, permission, context);
  return {
    ...decision,
    checkedAt: "2026-07-11T12:00:00.000Z",
    metadataOnly: true,
  };
}
