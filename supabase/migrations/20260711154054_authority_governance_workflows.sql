alter type scope_type add value if not exists 'unit_descendants';
alter type scope_type add value if not exists 'branch_descendants';
alter type scope_type add value if not exists 'department';
alter type scope_type add value if not exists 'programme';
alter type scope_type add value if not exists 'small_group';
alter type scope_type add value if not exists 'assigned_records';
alter type scope_type add value if not exists 'self';

create table if not exists public.role_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key text not null,
  label text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, key)
);

alter table public.roles add column if not exists description text;
alter table public.roles add column if not exists role_category_id uuid references public.role_categories(id);
alter table public.roles add column if not exists authority_level integer;
alter table public.roles add column if not exists default_scope_type scope_type not null default 'tenant';
alter table public.roles add column if not exists may_receive_delegation boolean not null default false;
alter table public.roles add column if not exists may_delegate boolean not null default false;
alter table public.roles add column if not exists may_supervise boolean not null default false;
alter table public.roles add column if not exists approval_required_for_assignment boolean not null default false;

create table if not exists public.permission_groups (
  key text primary key,
  label text not null,
  description text,
  sort_order integer not null default 0,
  version integer not null default 1
);

alter table public.permissions add column if not exists group_key text references public.permission_groups(key);
alter table public.permissions add column if not exists label text;
alter table public.permissions add column if not exists version integer not null default 1;
alter table public.permissions add column if not exists sensitive boolean not null default false;

create table if not exists public.permission_dependencies (
  id uuid primary key default gen_random_uuid(),
  permission_key text not null references public.permissions(key) on delete cascade,
  required_permission_key text not null references public.permissions(key) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now(),
  unique (permission_key, required_permission_key)
);

create table if not exists public.permission_conflicts (
  id uuid primary key default gen_random_uuid(),
  first_permission_key text not null references public.permissions(key) on delete cascade,
  second_permission_key text not null references public.permissions(key) on delete cascade,
  description text not null,
  default_mode text not null default 'warning',
  created_at timestamptz not null default now(),
  unique (first_permission_key, second_permission_key)
);

create table if not exists public.authorization_scopes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  scope_type scope_type not null,
  scope_record_id uuid,
  include_descendants boolean not null default false,
  label text,
  created_at timestamptz not null default now()
);

alter table public.user_role_assignments add column if not exists scope_type scope_type not null default 'tenant';
alter table public.user_role_assignments add column if not exists scope_record_id uuid;
alter table public.user_role_assignments add column if not exists include_descendants boolean not null default false;
alter table public.user_role_assignments add column if not exists active boolean not null default true;
alter table public.user_role_assignments add column if not exists assignment_reason text;
alter table public.user_role_assignments add column if not exists approved_by uuid references public.profiles(id);
alter table public.user_role_assignments add column if not exists source_assignment_id uuid references public.user_role_assignments(id);
alter table public.user_role_assignments add column if not exists source_delegation_id uuid;

create table if not exists public.authority_levels (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  level integer not null,
  label text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (tenant_id, level)
);

create table if not exists public.leadership_positions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  role_id uuid references public.roles(id),
  organization_unit_id uuid references public.organization_units(id),
  branch_id uuid references public.branches(id),
  authority_level integer,
  receives_referrals boolean not null default false,
  referral_categories text[] not null default '{}',
  max_confidentiality_level integer not null default 1,
  status text not null default 'active',
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.leadership_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  position_id uuid not null references public.leadership_positions(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  reports_to_assignment_id uuid references public.leadership_assignments(id),
  supervising_assignment_id uuid references public.leadership_assignments(id),
  deputy_user_id uuid references public.profiles(id),
  acting_replacement_user_id uuid references public.profiles(id),
  appointment_date date not null,
  term_start date not null,
  term_end date,
  appointment_status text not null default 'active',
  appointment_reference text,
  notes text,
  pastoral_specialties text[] not null default '{}',
  active boolean not null default true,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  check (id <> reports_to_assignment_id)
);

create table if not exists public.pastoral_referral_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  case_category text not null,
  sensitivity text not null,
  urgency text not null,
  direction text not null,
  target_position_id uuid references public.leadership_positions(id),
  conflict_policy text,
  inactivity_escalation_hours integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.delegations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  delegator_user_id uuid not null references public.profiles(id),
  delegate_user_id uuid not null references public.profiles(id),
  scope_type scope_type not null,
  scope_record_id uuid,
  include_descendants boolean not null default false,
  starts_at timestamptz not null,
  expires_at timestamptz not null,
  status text not null default 'pending',
  reason text not null,
  approved_by uuid references public.profiles(id),
  revoked_by uuid references public.profiles(id),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (delegator_user_id <> delegate_user_id)
);

create table if not exists public.delegated_permissions (
  delegation_id uuid not null references public.delegations(id) on delete cascade,
  permission_key text not null references public.permissions(key),
  primary key (delegation_id, permission_key)
);

create table if not exists public.acting_appointments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  unavailable_user_id uuid not null references public.profiles(id),
  acting_user_id uuid not null references public.profiles(id),
  role_id uuid references public.roles(id),
  scope_type scope_type not null,
  scope_record_id uuid,
  starts_at timestamptz not null,
  expires_at timestamptz not null,
  status text not null default 'pending',
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  check (unavailable_user_id <> acting_user_id)
);

create table if not exists public.acting_appointment_permissions (
  acting_appointment_id uuid not null references public.acting_appointments(id) on delete cascade,
  permission_key text not null references public.permissions(key),
  primary key (acting_appointment_id, permission_key)
);

create table if not exists public.governance_settings (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  principal_authority_user_id uuid references public.profiles(id),
  principal_authority_title text not null,
  governance_model text not null,
  approval_philosophy text,
  appointment_rules jsonb not null default '{}'::jsonb,
  leadership_terms jsonb not null default '{}'::jsonb,
  transfer_rules jsonb not null default '{}'::jsonb,
  delegation_rules jsonb not null default '{}'::jsonb,
  acting_appointment_rules jsonb not null default '{}'::jsonb,
  separation_of_duties_mode text not null default 'warning',
  emergency_authority_enabled boolean not null default false,
  quorum_foundation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.authority_limits (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  role_id uuid references public.roles(id),
  user_id uuid references public.profiles(id),
  permission_key text not null references public.permissions(key),
  currency text not null default 'KES',
  max_amount numeric(14,2) not null,
  transaction_type text not null,
  scope_type scope_type not null default 'tenant',
  scope_record_id uuid,
  frequency text,
  approval_stage text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.approval_workflows (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  action_type text not null,
  scope_type scope_type,
  scope_record_id uuid,
  active boolean not null default true,
  current_version integer not null default 1,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.approval_workflow_versions (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.approval_workflows(id) on delete cascade,
  version integer not null,
  trigger_conditions jsonb not null default '{}'::jsonb,
  rejection_behavior text not null default 'stop',
  return_behavior text not null default 'return_to_requester',
  delegation_handling text not null default 'allow_if_authorized',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (workflow_id, version)
);

create table if not exists public.approval_steps (
  id uuid primary key default gen_random_uuid(),
  workflow_version_id uuid not null references public.approval_workflow_versions(id) on delete cascade,
  step_order integer not null,
  mode text not null,
  hierarchy_rule text,
  due_hours integer,
  escalation_hours integer,
  fallback_behavior text,
  unique (workflow_version_id, step_order)
);

create table if not exists public.approval_step_approvers (
  id uuid primary key default gen_random_uuid(),
  approval_step_id uuid not null references public.approval_steps(id) on delete cascade,
  approver_role_id uuid references public.roles(id),
  approver_user_id uuid references public.profiles(id),
  scope_type scope_type,
  scope_record_id uuid,
  check (approver_role_id is not null or approver_user_id is not null)
);

create table if not exists public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  requester_user_id uuid not null references public.profiles(id),
  workflow_id uuid references public.approval_workflows(id),
  workflow_version integer not null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  summary text not null,
  reason text,
  supporting_data jsonb not null default '{}'::jsonb,
  current_step integer not null default 1,
  status text not null default 'draft',
  scope_type scope_type,
  scope_record_id uuid,
  requested_at timestamptz not null default now(),
  due_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.approval_actions (
  id uuid primary key default gen_random_uuid(),
  approval_request_id uuid not null references public.approval_requests(id) on delete cascade,
  approver_user_id uuid not null references public.profiles(id),
  decision text not null,
  comment text,
  delegated_or_direct text not null default 'direct',
  scope_type scope_type,
  scope_record_id uuid,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.approval_escalations (
  id uuid primary key default gen_random_uuid(),
  approval_request_id uuid not null references public.approval_requests(id) on delete cascade,
  from_user_id uuid references public.profiles(id),
  to_user_id uuid references public.profiles(id),
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.separation_of_duties_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  first_permission_key text not null references public.permissions(key),
  second_permission_key text not null references public.permissions(key),
  mode text not null,
  description text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.separation_of_duties_exceptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  rule_id uuid references public.separation_of_duties_rules(id),
  user_id uuid not null references public.profiles(id),
  reason text not null,
  approved_by uuid not null references public.profiles(id),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.conflict_declarations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  approval_request_id uuid references public.approval_requests(id),
  conflict_type text not null,
  recused boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.access_reviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  status text not null default 'draft',
  completed_by uuid references public.profiles(id),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.access_review_items (
  id uuid primary key default gen_random_uuid(),
  access_review_id uuid not null references public.access_reviews(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  finding_type text not null,
  outcome text,
  reviewer_comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_suspensions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  status text not null default 'scheduled',
  reason text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  revoke_delegations boolean not null default true,
  transfer_pending_approvals_to uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.access_diagnostics_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  actor_user_id uuid not null references public.profiles(id),
  target_user_id uuid not null references public.profiles(id),
  permission_key text not null,
  scope_type scope_type,
  scope_record_id uuid,
  result text not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_role_assignments_scope on public.user_role_assignments (tenant_id, scope_type, scope_record_id);
create index if not exists idx_delegations_delegate on public.delegations (tenant_id, delegate_user_id, status, expires_at);
create index if not exists idx_approval_requests_status on public.approval_requests (tenant_id, status, current_step);
create index if not exists idx_leadership_reporting on public.leadership_assignments (tenant_id, reports_to_assignment_id);
create index if not exists idx_access_diagnostics on public.access_diagnostics_log (tenant_id, created_at desc);

alter table public.role_categories enable row level security;
alter table public.permission_groups enable row level security;
alter table public.permission_dependencies enable row level security;
alter table public.permission_conflicts enable row level security;
alter table public.authorization_scopes enable row level security;
alter table public.authority_levels enable row level security;
alter table public.leadership_positions enable row level security;
alter table public.leadership_assignments enable row level security;
alter table public.pastoral_referral_rules enable row level security;
alter table public.delegations enable row level security;
alter table public.delegated_permissions enable row level security;
alter table public.acting_appointments enable row level security;
alter table public.acting_appointment_permissions enable row level security;
alter table public.governance_settings enable row level security;
alter table public.authority_limits enable row level security;
alter table public.approval_workflows enable row level security;
alter table public.approval_workflow_versions enable row level security;
alter table public.approval_steps enable row level security;
alter table public.approval_step_approvers enable row level security;
alter table public.approval_requests enable row level security;
alter table public.approval_actions enable row level security;
alter table public.approval_escalations enable row level security;
alter table public.separation_of_duties_rules enable row level security;
alter table public.separation_of_duties_exceptions enable row level security;
alter table public.conflict_declarations enable row level security;
alter table public.access_reviews enable row level security;
alter table public.access_review_items enable row level security;
alter table public.user_suspensions enable row level security;
alter table public.access_diagnostics_log enable row level security;

create policy "role categories scoped read" on public.role_categories for select to authenticated using (public.has_permission(tenant_id, 'role.view'));
create policy "permission groups read" on public.permission_groups for select to authenticated using (true);
create policy "permission dependencies read" on public.permission_dependencies for select to authenticated using (true);
create policy "permission conflicts read" on public.permission_conflicts for select to authenticated using (true);
create policy "authorization scopes scoped read" on public.authorization_scopes for select to authenticated using (public.has_permission(tenant_id, 'role.view'));
create policy "authority levels scoped read" on public.authority_levels for select to authenticated using (public.has_permission(tenant_id, 'governance.view'));
create policy "leadership positions scoped read" on public.leadership_positions for select to authenticated using (public.has_permission(tenant_id, 'governance.view'));
create policy "leadership assignments scoped read" on public.leadership_assignments for select to authenticated using (public.has_permission(tenant_id, 'governance.view'));
create policy "referral rules scoped read" on public.pastoral_referral_rules for select to authenticated using (public.has_permission(tenant_id, 'governance.view'));
create policy "delegations relevant read" on public.delegations for select to authenticated using (public.has_permission(tenant_id, 'delegation.view') or delegator_user_id = (select auth.uid()) or delegate_user_id = (select auth.uid()));
create policy "delegated permissions relevant read" on public.delegated_permissions for select to authenticated using (exists (select 1 from public.delegations d where d.id = delegation_id and (public.has_permission(d.tenant_id, 'delegation.view') or d.delegator_user_id = (select auth.uid()) or d.delegate_user_id = (select auth.uid()))));
create policy "acting appointments relevant read" on public.acting_appointments for select to authenticated using (public.has_permission(tenant_id, 'governance.view') or unavailable_user_id = (select auth.uid()) or acting_user_id = (select auth.uid()));
create policy "acting permissions relevant read" on public.acting_appointment_permissions for select to authenticated using (exists (select 1 from public.acting_appointments aa where aa.id = acting_appointment_id and (public.has_permission(aa.tenant_id, 'governance.view') or aa.unavailable_user_id = (select auth.uid()) or aa.acting_user_id = (select auth.uid()))));
create policy "governance scoped read" on public.governance_settings for select to authenticated using (public.has_permission(tenant_id, 'governance.view'));
create policy "authority limits scoped read" on public.authority_limits for select to authenticated using (public.has_permission(tenant_id, 'governance.view') or public.has_permission(tenant_id, 'finance.audit.view'));
create policy "approval workflows scoped read" on public.approval_workflows for select to authenticated using (public.has_permission(tenant_id, 'governance.view'));
create policy "approval requests participant read" on public.approval_requests for select to authenticated using (public.has_permission(tenant_id, 'governance.view') or requester_user_id = (select auth.uid()));
create policy "approval actions participant read" on public.approval_actions for select to authenticated using (exists (select 1 from public.approval_requests ar where ar.id = approval_request_id and (public.has_permission(ar.tenant_id, 'governance.view') or ar.requester_user_id = (select auth.uid()) or approver_user_id = (select auth.uid()))));
create policy "sod scoped read" on public.separation_of_duties_rules for select to authenticated using (public.has_permission(tenant_id, 'governance.view'));
create policy "conflict owner or governance read" on public.conflict_declarations for select to authenticated using (public.has_permission(tenant_id, 'governance.view') or user_id = (select auth.uid()));
create policy "access reviews scoped read" on public.access_reviews for select to authenticated using (public.has_permission(tenant_id, 'role.view'));
create policy "user suspensions scoped read" on public.user_suspensions for select to authenticated using (public.has_permission(tenant_id, 'user.suspend') or user_id = (select auth.uid()));
create policy "diagnostics scoped read" on public.access_diagnostics_log for select to authenticated using (public.has_permission(tenant_id, 'permission.view'));

insert into public.permission_groups (key, label, sort_order) values
('church_administration','Church administration',10),
('organization','Organizational structure',20),
('branches','Branches',30),
('users_access','Users and access',40),
('governance','Governance',50),
('members_visitors','Members and visitors foundations',60),
('pastoral_care','Pastoral care foundations',70),
('small_groups','Cells and fellowships foundations',80),
('programmes','Programmes and learning foundations',90),
('finance','Finance foundations',100),
('departments_volunteers','Departments and volunteers foundations',110),
('communication','Communication foundations',120),
('reports','Reports',130),
('audit','Audit',140)
on conflict (key) do update set label = excluded.label, sort_order = excluded.sort_order;

insert into public.permissions (key, description, group_key, label, sensitive) values
('tenant.update','Update tenant profile','church_administration','Update tenant profile',false),
('tenant.branding.manage','Manage branding','church_administration','Manage branding',false),
('tenant.terminology.manage','Manage terminology','church_administration','Manage terminology',false),
('tenant.security.manage','Manage tenant security','church_administration','Manage tenant security',true),
('tenant.data.manage','Manage tenant data','church_administration','Manage tenant data',true),
('tenant.subscription.view','View subscription','church_administration','View subscription',false),
('tenant.subscription.manage','Manage subscription','church_administration','Manage subscription',true),
('organization.create','Create organization units','organization','Create units',false),
('organization.update','Update organization units','organization','Update units',false),
('organization.move','Move organization units','organization','Move units',true),
('organization.archive','Archive organization units','organization','Archive units',true),
('organization.assign_leader','Assign unit leaders','organization','Assign unit leaders',true),
('organization.view_descendants','View descendant units','organization','View descendant units',false),
('branch.create','Create branches','branches','Create branches',false),
('branch.update','Update branches','branches','Update branches',false),
('branch.archive','Archive branches','branches','Archive branches',true),
('branch.assign_leader','Assign branch leaders','branches','Assign branch leaders',true),
('branch.view_consolidated','View consolidated branches','branches','View consolidated branch data',true),
('user.view','View users','users_access','View users',false),
('user.invite','Invite users','users_access','Invite users',false),
('user.update','Update users','users_access','Update users',false),
('user.suspend','Suspend users','users_access','Suspend users',true),
('user.reactivate','Reactivate users','users_access','Reactivate users',true),
('user.remove_from_tenant','Remove users from tenant','users_access','Remove from tenant',true),
('role.create','Create roles','users_access','Create roles',true),
('role.update','Update roles','users_access','Update roles',true),
('role.archive','Archive roles','users_access','Archive roles',true),
('role.assign','Assign roles','users_access','Assign roles',true),
('role.remove','Remove roles','users_access','Remove roles',true),
('permission.view','View permission catalogue','users_access','View permissions',false),
('permission.manage','Manage permissions','users_access','Manage permissions',true),
('delegation.view','View delegations','users_access','View delegations',false),
('delegation.create','Create delegations','users_access','Create delegations',true),
('delegation.approve','Approve delegations','users_access','Approve delegations',true),
('delegation.revoke','Revoke delegations','users_access','Revoke delegations',true),
('governance.view','View governance','governance','View governance',false),
('governance.manage','Manage governance','governance','Manage governance',true),
('governance.appointment.create','Create appointments','governance','Create appointments',true),
('governance.appointment.approve','Approve appointments','governance','Approve appointments',true),
('governance.transfer.create','Create transfers','governance','Create transfers',true),
('governance.transfer.approve','Approve transfers','governance','Approve transfers',true),
('governance.suspension.create','Create suspensions','governance','Create suspensions',true),
('governance.suspension.approve','Approve suspensions','governance','Approve suspensions',true),
('governance.resolution.view','View resolutions','governance','View resolutions',false),
('governance.resolution.manage','Manage resolutions','governance','Manage resolutions',true),
('pastoral_case.view_assigned','View assigned pastoral cases','pastoral_care','View assigned cases',true),
('pastoral_case.view_unit','View unit pastoral cases','pastoral_care','View unit cases',true),
('pastoral_case.view_all','View all pastoral cases','pastoral_care','View all cases',true),
('pastoral_case.view_sensitive_notes','View sensitive pastoral notes','pastoral_care','View sensitive notes',true),
('communication.send_scoped','Send scoped communications','communication','Send scoped communications',true),
('communication.send_all','Send all communications','communication','Send all communications',true),
('finance.transaction.create','Create finance transactions','finance','Create transactions',true),
('finance.transaction.approve','Approve finance transactions','finance','Approve transactions',true),
('finance.view_summary','View finance summary','finance','View finance summary',true),
('finance.audit.view','View finance audit','finance','View finance audit',true),
('audit.view_sensitive','View sensitive audit','audit','View sensitive audit',true),
('audit.export','Export audit','audit','Export audit',true)
on conflict (key) do update set description = excluded.description, group_key = excluded.group_key, label = excluded.label, sensitive = excluded.sensitive;
