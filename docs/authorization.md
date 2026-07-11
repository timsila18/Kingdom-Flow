# Authorization Model

Permission checks use permission keys and scopes, not role display names. The reusable application service is `can(user, permission, scope)` in `src/lib/authz.ts`.

The database migration mirrors that model with `roles`, `permissions`, `role_permissions`, `permission_scopes`, `user_role_assignments`, `tenant_memberships` and RLS helper functions.

Platform Super Admin is separate from church roles. Platform admins can inspect tenant metadata and perform audited support actions, but they are not automatically granted access to confidential pastoral or member records.
