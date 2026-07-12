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

`20260711162325_pastoral_care_prayer_counselling.sql` adds Prompt 4 pastoral-care tables. It creates pastoral cases, categories, assignments, access grants, access logs, notes, note versions, tasks, care plans, prayer requests, prayer teams, prayer follow-ups, testimonies, counselling appointments, sessions, visits, bereavement cases, welfare requests, welfare assessments, professional referrals, pastoral referrals, safeguarding cases, documents, reminders and feedback.

RLS is enabled on every new table. Policies are strict by default: tenant membership is required, ordinary pastoral reads are assigned-or-granted, safeguarding requires dedicated assignment, prayer-team reads are assigned-team only, welfare and counselling records are isolated from ordinary pastoral access, public prayer intake can insert but cannot read, and case documents have no public read policy.

`20260712053541_small_groups_cells_fellowships.sql` adds Prompt 5 cells/fellowships/small-groups tables. It creates group types, groups, hierarchy history, leadership assignments, memberships, join requests, transfers, meeting types, meetings, attendance, report templates, meeting reports, giving categories, giving totals, giving corrections, finance handovers, health snapshots, multiplication proposals, QR codes and communication-event placeholders.

RLS is enabled on every new table. Policies use existing tenant membership and `has_permission(tenant_id, permission)` checks, with additional assigned-leader access for operational group work. Private-home locations are represented by approximate fields for directory/map use, giving tables enforce non-negative totals, handovers enforce separation of duties, and report/referral tables store safe metadata rather than confidential pastoral content.

Local migration reset requires Docker Desktop. Run `supabase db reset --local` once Docker Desktop is running.
