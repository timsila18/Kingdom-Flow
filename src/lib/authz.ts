import { memberships, roles } from "./data";
import type { PermissionKey, ScopeType } from "./types";

export interface AuthzUser {
  id: string;
  platformSuperAdmin?: boolean;
}

export interface PermissionScope {
  tenantId?: string;
  scopeType?: ScopeType;
  scopeId?: string;
}

export function can(user: AuthzUser, permission: PermissionKey, scope: PermissionScope = {}) {
  if (user.platformSuperAdmin) {
    return scope.scopeType === "platform" || permission === "tenant.view";
  }

  if (!scope.tenantId) return false;

  const membership = memberships.find(
    (item) => item.userId === user.id && item.tenantId === scope.tenantId && item.status === "active",
  );
  if (!membership) return false;

  return membership.roleIds.some((roleId) => {
    const role = roles.find((item) => item.id === roleId && item.tenantId === scope.tenantId);
    return Boolean(role?.permissions.includes(permission));
  });
}

export function assertCan(user: AuthzUser, permission: PermissionKey, scope: PermissionScope = {}) {
  if (!can(user, permission, scope)) {
    throw new Error(`Permission denied for ${permission}`);
  }
}
