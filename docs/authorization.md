# Authorization Model

Permission checks use permission keys and scopes, not role display names. Prompt 1's compatibility service remains in `src/lib/authz.ts`; Prompt 2's full authority engine is `src/lib/authority-engine.ts`.

Prompt 2 separates five concepts:

- Role: named bundle of permissions.
- Permission: stable internal action key.
- Scope: where permission applies.
- Hierarchy: reporting, supervision, referral and escalation lines.
- Delegation: temporary or permanent authority grant within limits.

Central services:

- `can(userId, permission, context)`
- `requirePermission(userId, permission, context)`
- `getEffectivePermissions(userId, tenantId)`
- `getAccessibleScopes(userId, permission, tenantId)`
- `canManageUser(actor, target, tenant)`
- `canAssignRole(actor, role, scope)`
- `canDelegate(actor, permission, scope)`
- `canApprove(actor, workflowAction, context)`
- `authorizationDiagnostic(user, permission, context)`

The database migration mirrors that model with role categories, permission groups, dependencies, conflicts, authorization scopes, authority levels, leadership positions, leadership assignments, referral rules, delegations, acting appointments, governance settings, authority limits, approval workflows, approval requests, separation-of-duties rules, access reviews, suspensions and diagnostic logs.

Platform Super Admin is separate from church roles. Platform admins can inspect tenant metadata and perform audited support actions, but they are not automatically granted access to confidential pastoral or member records.
