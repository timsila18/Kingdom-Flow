# Migration Notes

`20260711154054_authority_governance_workflows.sql` extends Prompt 1 without dropping or renaming existing tenant, role, membership, invitation or audit tables.

Safe additions:

- adds new scope enum values;
- adds metadata columns to `roles` and `user_role_assignments`;
- creates authority, hierarchy, delegation, approval, separation-of-duties, access-review and diagnostics tables;
- enables RLS on all new tables;
- adds read policies scoped by existing `has_permission` and participant checks;
- seeds additional permission catalogue rows idempotently with `on conflict`.

Production rollout should run this after Prompt 1. Existing Prompt 1 tenants, invitations and audit logs remain intact.

`20260711160011_people_ministry_engine.sql` adds Prompt 3 people-ministry tables. It does not duplicate tenants or auth users. It creates central people profiles, lifecycle events, households, visitor/new-convert records, follow-up assignments and tasks, consent, transfers, duplicates, imports, exports, forms, QR codes and activity signals. RLS is enabled on all new tables and public form submissions are insert-only for anonymous users.
