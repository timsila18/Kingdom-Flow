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

`20260712081522_programmes_learning_academy.sql` adds Prompt 6 programme-learning tables. It creates programme types, programmes, versions, modules, lessons, cohorts, trainers, applications, enrolments, eligibility results, scholarships, fee rules, payment destinations, payments, refunds, materials, sessions, attendance, assignments, assessment questions/results, completion rules, certificates, graduation events, leadership pathways, mentorships and activity signals.

RLS is enabled on all Prompt 6 tables. Programme access is tenant-scoped, trainers can see assigned records, public users can only read published programme/certificate verification data or insert controlled applications, scholarships and payments require explicit permissions, and certificate verification exposes only safe public fields.

`20260712084202_services_ministry_operations.sql` adds Prompt 7 service and ministry-operations tables. It creates service types, services, recurring schedules, templates, order-of-service items, sermon plans, song and worship set data, music teams, rehearsals, departments, volunteer profiles, applications, availability, rosters, conflicts, replacement requests, check-ins, equipment checklists, media requests, incidents and service reports.

RLS is enabled on every Prompt 7 table. Policies use the existing tenant permission model plus assignment-based access for service teams and volunteers. Sensitive sermon, incident and report records require explicit permissions, volunteer records remain linked to the central people system, department hierarchy cycles are blocked, and public service access is limited to explicitly public published services.

`20260712090620_events_outreach_missions_children.sql` adds Prompt 8 event and ministry-participation tables. It creates event types, events, planning roles, event-team assignments, sessions, registration categories, registrations, waitlists, tickets, scans, badges, check-ins, check-outs, speakers, venues, rooms, seating zones, meals, accommodation, transport, manifests, public pages, reports, feedback, lost-and-found, outreach, missions, children classes, child check-in/out, authorized pickups, pickup attempts, safeguarding ratios, teen/youth records, campus fellowships, campus transitions and activity signals.

RLS is enabled on all Prompt 8 tables. Public users can only read approved public pages and insert controlled registrations/contact records. Authenticated access is tenant-scoped, event teams get event-limited access, check-in volunteers see minimum registration data, transport/accommodation/children/mission/safeguarding tables require explicit permissions, and sensitive child, medical, safeguarding and mission-document details remain restricted.

`20260712103712_giving_stewardship_contributions.sql` adds Prompt 9 giving and stewardship tables. It creates giving categories, funds, fund restrictions, payment destinations, destination approvals/verifications, contributions, allocations, verification records, cash collections, count members, handover links, receipts, receipt sequences, statements, pledges, pledge schedules, partnerships, donors, in-kind records, campaigns, refunds, disputes, reconciliation imports/rows/matches, access logs, exports, notifications and activity links.

RLS is enabled on every Prompt 9 table. Summary totals, payment instructions and public receipt verification expose minimal data. Individual giving, pledges, partnerships, restricted funds, destination changes, receipts, disputes, refunds, reconciliation and exports require explicit giving permissions. Members can only see their own verified contribution portal data.

`20260712122010_internal_administration_backbone.sql` adds Prompt 10 internal-administration tables. It creates chart-of-accounts, accounting periods, journals, journal lines, posting rules, fund balances, bank and cash accounts, bank statements, reconciliation, petty cash, budgets, payment requests, vouchers, suppliers, procurement, quotations, purchase orders, receipts, supplier invoices, payables, receivables, inventory, stores, stock counts, assets, projects, facilities, vehicles, transport, HR, leave, attendance, payroll, payslips, performance, discipline, training, exports and audit-event foundations.

RLS is enabled on every Prompt 10 table. General administration tables use tenant-scoped permission checks, while supplier bank details, employment records, payslips and disciplinary records have stricter policies. Prompt 10 keeps giving records immutable from accounting posting, protects payroll from ordinary pastoral access and requires explicit permissions for sensitive exports.

`20260712132011_member_app_communication_digital_ministry.sql` adds Prompt 11 member-app and digital-ministry tables. It creates member preferences, journey milestones, next steps, digital cards, member directory controls, sermons, sermon media, private sermon notes, livestreams, devotionals, Bible plans, resources, announcements, deliveries, preferences, providers, notifications, devices, emergency broadcasts, conversations, messages, moderation, appointments, forms, polls, Solco integration links and AI policy/usage/safety foundations.

RLS is enabled on Prompt 11 tables. Member-facing records are tenant-scoped, private sermon notes are owner-only, messages are participant-only unless moderated, appointments are requester-or-authorized-manager, supplier-like provider secrets are stored by reference only, and AI/communication exports require explicit permissions.

`20260712152012_intelligence_production_readiness.sql` adds Prompt 12 and 13 foundations. It creates church networks, network memberships, metric definitions, metric results, analytics alerts, executive briefings, active-people calculations, subscription invoices, feature flags, release gates, support tickets and support access requests.

RLS is enabled on every new table. Analytics and billing records are tenant-scoped, network membership reads stay with participating churches, feature flags and release gates are authenticated-readable, and support access is explicitly requested, scoped and audited. Prompt 12/13 permissions are seeded idempotently.

Local migration reset requires Docker Desktop. Run `supabase db reset --local` once Docker Desktop is running.
