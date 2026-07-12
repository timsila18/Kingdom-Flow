create type public.small_group_status as enum ('draft','proposed','pending_approval','active','paused','under_review','multiplying','merged','closed','archived');
create type public.small_group_join_policy as enum ('open','approval_required','invite_only','leader_assignment','branch_only','temporarily_closed');
create type public.small_group_membership_status as enum ('active','visitor','first_timer','regular','prospective','child','remote','leader','inactive','transferred','guest');
create type public.small_group_meeting_status as enum ('scheduled','in_progress','completed','cancelled','rescheduled');
create type public.small_group_report_status as enum ('not_started','draft','submitted','returned','under_review','partially_approved','approved','rejected','locked','reopened','archived');
create type public.small_group_health_label as enum ('Needs Attention','Stable','Growing','Ready for Review','Capacity Pressure','Leadership Gap');

create table public.small_group_types (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key text not null,
  display_name text not null,
  default_report_template_id uuid,
  default_frequency text not null default 'weekly',
  default_roles text[] not null default '{}',
  approval_workflow_id uuid,
  multiplication_enabled boolean not null default true,
  max_recommended_size integer not null default 16 check (max_recommended_size > 0),
  follow_up_journey_key text,
  restrictions text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, key)
);

create table public.small_groups (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  organization_unit_id uuid references public.organization_units(id),
  group_type_id uuid references public.small_group_types(id),
  parent_group_id uuid references public.small_groups(id),
  name text not null,
  code text not null,
  description text,
  purpose text,
  leader_user_id uuid references public.profiles(id),
  assistant_leader_user_id uuid references public.profiles(id),
  supervising_pastor_user_id uuid references public.profiles(id),
  host_person_id uuid references public.people(id),
  secretary_user_id uuid references public.profiles(id),
  finance_officer_user_id uuid references public.profiles(id),
  schedule_summary text not null,
  venue_summary text,
  approximate_location text,
  exact_address_restricted boolean not null default true,
  online_link text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  language text not null default 'en',
  target_audience text,
  gender_focus text not null default 'all',
  capacity integer not null default 16 check (capacity > 0),
  current_membership integer not null default 0 check (current_membership >= 0),
  status public.small_group_status not null default 'draft',
  start_date date,
  next_review_date date,
  multiplication_target_date date,
  reporting_unit_id uuid references public.organization_units(id),
  public_discoverable boolean not null default false,
  join_policy public.small_group_join_policy not null default 'approval_required',
  approval_workflow_id uuid,
  visibility text not null default 'branch',
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, code),
  constraint small_groups_no_self_parent check (id <> parent_group_id)
);

create table public.small_group_hierarchy_history (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  group_id uuid not null references public.small_groups(id) on delete cascade,
  previous_parent_group_id uuid references public.small_groups(id),
  new_parent_group_id uuid references public.small_groups(id),
  previous_branch_id uuid references public.branches(id),
  new_branch_id uuid references public.branches(id),
  reason text not null,
  changed_by uuid references public.profiles(id),
  changed_at timestamptz not null default now()
);

create table public.small_group_leadership_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  group_id uuid not null references public.small_groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  role_key text not null,
  start_date date not null,
  end_date date,
  status text not null default 'proposed',
  reason text,
  permission_keys text[] not null default '{}',
  approval_request_id uuid,
  created_at timestamptz not null default now()
);

create table public.small_group_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  group_id uuid not null references public.small_groups(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  branch_id uuid references public.branches(id),
  membership_type text not null default 'primary',
  status public.small_group_membership_status not null default 'prospective',
  joined_at date not null default current_date,
  source text,
  invited_by_user_id uuid references public.profiles(id),
  assigned_by_user_id uuid references public.profiles(id),
  approval_request_id uuid,
  attendance_streak integer not null default 0 check (attendance_streak >= 0),
  missed_consecutive_meetings integer not null default 0 check (missed_consecutive_meetings >= 0),
  role_in_group text,
  exit_date date,
  transfer_request_id uuid,
  created_at timestamptz not null default now(),
  unique (tenant_id, group_id, person_id)
);

create table public.small_group_join_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  group_id uuid not null references public.small_groups(id) on delete cascade,
  person_id uuid references public.people(id),
  requester_name text not null,
  source text not null,
  status text not null default 'requested',
  requested_at timestamptz not null default now(),
  reviewed_by_user_id uuid references public.profiles(id),
  notes text
);

create table public.small_group_transfers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id),
  source_group_id uuid not null references public.small_groups(id),
  destination_group_id uuid not null references public.small_groups(id),
  reason text not null,
  requested_by_user_id uuid references public.profiles(id),
  effective_date date not null,
  source_approval_status text not null default 'pending',
  destination_approval_status text not null default 'pending',
  member_acknowledgement text not null default 'pending',
  follow_up_handover_status text not null default 'pending',
  status text not null default 'requested',
  created_at timestamptz not null default now(),
  constraint small_group_transfers_distinct_groups check (source_group_id <> destination_group_id)
);

create table public.small_group_meeting_types (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key text not null,
  name text not null,
  report_template_id uuid,
  attendance_categories text[] not null default '{}',
  giving_categories_shown text[] not null default '{}',
  follow_up_fields text[] not null default '{}',
  approval_workflow_id uuid,
  duration_minutes integer not null default 90 check (duration_minutes > 0),
  pastoral_escalation_enabled boolean not null default true,
  unique (tenant_id, key)
);

create table public.small_group_meetings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  group_id uuid not null references public.small_groups(id) on delete cascade,
  meeting_type_id uuid references public.small_group_meeting_types(id),
  meeting_date date not null,
  start_time time,
  end_time time,
  venue_summary text,
  online_link text,
  host_person_id uuid references public.people(id),
  leader_user_id uuid references public.profiles(id),
  theme text,
  scripture text,
  expected_attendance integer not null default 0 check (expected_attendance >= 0),
  status public.small_group_meeting_status not null default 'scheduled',
  report_status public.small_group_report_status not null default 'not_started',
  cancelled_reason text,
  rescheduled_from_meeting_id uuid references public.small_group_meetings(id),
  created_at timestamptz not null default now()
);

create table public.small_group_attendance (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  meeting_id uuid not null references public.small_group_meetings(id) on delete cascade,
  group_id uuid not null references public.small_groups(id) on delete cascade,
  person_id uuid references public.people(id),
  display_name text not null,
  status text not null,
  attendee_type text not null,
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  recorded_by_user_id uuid references public.profiles(id),
  source text not null,
  notes text,
  offline_queue_id text,
  sync_status text not null default 'synced',
  created_at timestamptz not null default now()
);

create table public.small_group_report_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  version integer not null default 1 check (version > 0),
  branch_id uuid references public.branches(id),
  group_type_id uuid references public.small_group_types(id),
  active_from date not null default current_date,
  active_to date,
  approval_workflow_id uuid,
  required_sections text[] not null default '{}',
  finance_section_enabled boolean not null default false,
  pastoral_referral_section_enabled boolean not null default true,
  attendance_model text not null default 'summary',
  visibility text not null default 'pastor_review',
  lock_after_approval boolean not null default true,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  unique (tenant_id, name, version)
);

create table public.small_group_meeting_reports (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  group_id uuid not null references public.small_groups(id) on delete cascade,
  meeting_id uuid not null references public.small_group_meetings(id) on delete cascade,
  template_id uuid references public.small_group_report_templates(id),
  template_version integer not null,
  status public.small_group_report_status not null default 'draft',
  submitted_by_user_id uuid references public.profiles(id),
  submitted_at timestamptz,
  reviewer_user_id uuid references public.profiles(id),
  approver_user_id uuid references public.profiles(id),
  correction_reason text,
  locked_at timestamptz,
  reopened_at timestamptz,
  attendance_summary jsonb not null default '{}'::jsonb,
  safe_referral_summary text[] not null default '{}',
  outreach_summary text,
  next_meeting_plan text,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (tenant_id, meeting_id)
);

create table public.small_group_giving_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  available_in_group_reports boolean not null default true,
  individual_detail_allowed boolean not null default false,
  totals_only_default boolean not null default true,
  cash_breakdown_enabled boolean not null default true,
  mpesa_breakdown_enabled boolean not null default true,
  bank_breakdown_enabled boolean not null default true,
  currency text not null default 'KES',
  restricted_visibility boolean not null default false,
  status text not null default 'active',
  unique (tenant_id, code)
);

create table public.small_group_meeting_giving_totals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  meeting_id uuid not null references public.small_group_meetings(id) on delete cascade,
  category_id uuid not null references public.small_group_giving_categories(id),
  currency text not null default 'KES',
  cash numeric(14,2) not null default 0 check (cash >= 0),
  mpesa numeric(14,2) not null default 0 check (mpesa >= 0),
  bank numeric(14,2) not null default 0 check (bank >= 0),
  card numeric(14,2) not null default 0 check (card >= 0),
  cheque numeric(14,2) not null default 0 check (cheque >= 0),
  other numeric(14,2) not null default 0 check (other >= 0),
  total numeric(14,2) generated always as (cash + mpesa + bank + card + cheque + other) stored,
  recorded_by_user_id uuid references public.profiles(id),
  verified_by_user_id uuid references public.profiles(id),
  notes text,
  deposit_slip_path text,
  reconciliation_status text not null default 'not_started',
  created_at timestamptz not null default now()
);

create table public.small_group_giving_corrections (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  giving_total_id uuid not null references public.small_group_meeting_giving_totals(id) on delete cascade,
  reason text not null,
  previous_values jsonb not null,
  amended_values jsonb not null,
  requested_by_user_id uuid references public.profiles(id),
  reviewed_by_user_id uuid references public.profiles(id),
  status text not null default 'requested',
  created_at timestamptz not null default now()
);

create table public.small_group_finance_handovers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  meeting_id uuid not null references public.small_group_meetings(id) on delete cascade,
  branch_id uuid references public.branches(id),
  amount numeric(14,2) not null check (amount >= 0),
  currency text not null default 'KES',
  category_ids uuid[] not null default '{}',
  handed_over_by_user_id uuid references public.profiles(id),
  received_by_user_id uuid references public.profiles(id),
  handed_over_at timestamptz,
  payment_method text not null,
  deposit_reference text,
  discrepancy text,
  status text not null default 'pending_handover',
  evidence_upload_path text,
  notes text,
  created_at timestamptz not null default now(),
  constraint small_group_handover_separation check (handed_over_by_user_id is null or received_by_user_id is null or handed_over_by_user_id <> received_by_user_id)
);

create table public.small_group_health_snapshots (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  group_id uuid not null references public.small_groups(id) on delete cascade,
  captured_at timestamptz not null default now(),
  label public.small_group_health_label not null,
  indicators jsonb not null default '[]'::jsonb,
  visible_to_roles text[] not null default '{}'
);

create table public.small_group_multiplication_proposals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  parent_group_id uuid not null references public.small_groups(id),
  proposed_name text not null,
  proposed_leader_user_id uuid references public.profiles(id),
  proposed_assistant_user_id uuid references public.profiles(id),
  proposed_member_ids uuid[] not null default '{}',
  effective_date date,
  readiness_indicators text[] not null default '{}',
  status text not null default 'draft',
  approval_request_id uuid,
  created_at timestamptz not null default now()
);

create table public.small_group_qr_codes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  group_id uuid not null references public.small_groups(id) on delete cascade,
  purpose text not null,
  public_code text not null unique,
  active boolean not null default true,
  expires_at timestamptz,
  scan_count integer not null default 0 check (scan_count >= 0),
  abuse_protection text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.small_group_communication_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  group_id uuid not null references public.small_groups(id) on delete cascade,
  kind text not null,
  safe_metadata text not null,
  channel_provider text not null default 'placeholder',
  respects_consent boolean not null default true,
  status text not null default 'queued_placeholder',
  created_at timestamptz not null default now()
);

create or replace function public.prevent_small_group_cycle()
returns trigger
language plpgsql
as $$
declare
  cursor_id uuid;
begin
  if new.parent_group_id is null then
    return new;
  end if;
  if new.id = new.parent_group_id then
    raise exception 'A group cannot be its own parent';
  end if;
  cursor_id := new.parent_group_id;
  while cursor_id is not null loop
    if cursor_id = new.id then
      raise exception 'Small group hierarchy cycle blocked';
    end if;
    select parent_group_id into cursor_id from public.small_groups where id = cursor_id;
  end loop;
  return new;
end;
$$;

create trigger small_groups_prevent_cycle
before insert or update of parent_group_id on public.small_groups
for each row execute function public.prevent_small_group_cycle();

create index small_groups_tenant_branch_idx on public.small_groups(tenant_id, branch_id, status);
create index small_group_memberships_person_idx on public.small_group_memberships(tenant_id, person_id, status);
create index small_group_meetings_group_date_idx on public.small_group_meetings(group_id, meeting_date);
create index small_group_reports_status_idx on public.small_group_meeting_reports(tenant_id, status);
create index small_group_attendance_meeting_idx on public.small_group_attendance(meeting_id, attendee_type, status);

alter table public.small_group_types enable row level security;
alter table public.small_groups enable row level security;
alter table public.small_group_hierarchy_history enable row level security;
alter table public.small_group_leadership_assignments enable row level security;
alter table public.small_group_memberships enable row level security;
alter table public.small_group_join_requests enable row level security;
alter table public.small_group_transfers enable row level security;
alter table public.small_group_meeting_types enable row level security;
alter table public.small_group_meetings enable row level security;
alter table public.small_group_attendance enable row level security;
alter table public.small_group_report_templates enable row level security;
alter table public.small_group_meeting_reports enable row level security;
alter table public.small_group_giving_categories enable row level security;
alter table public.small_group_meeting_giving_totals enable row level security;
alter table public.small_group_giving_corrections enable row level security;
alter table public.small_group_finance_handovers enable row level security;
alter table public.small_group_health_snapshots enable row level security;
alter table public.small_group_multiplication_proposals enable row level security;
alter table public.small_group_qr_codes enable row level security;
alter table public.small_group_communication_events enable row level security;

create policy "small group settings are tenant readable" on public.small_group_types
for select to authenticated
using (exists (select 1 from public.tenant_memberships tm where tm.tenant_id = small_group_types.tenant_id and tm.user_id = auth.uid() and tm.status = 'active'));

create policy "small group settings require permission" on public.small_group_types
for all to authenticated
using (public.has_permission(tenant_id, 'small_group.settings.manage'))
with check (public.has_permission(tenant_id, 'small_group.settings.manage'));

create policy "small groups readable by scoped permission or assignment" on public.small_groups
for select to authenticated
using (
  exists (select 1 from public.tenant_memberships tm where tm.tenant_id = small_groups.tenant_id and tm.user_id = auth.uid() and tm.status = 'active')
  and (
    public.has_permission(tenant_id, 'small_group.view')
    or public.has_permission(tenant_id, 'small_group.view_all')
    or auth.uid() in (leader_user_id, assistant_leader_user_id, supervising_pastor_user_id, secretary_user_id, finance_officer_user_id)
    or exists (select 1 from public.small_group_leadership_assignments gla where gla.group_id = small_groups.id and gla.user_id = auth.uid() and gla.status in ('active','acting'))
   
  )
);

create policy "small groups managed by permission" on public.small_groups
for all to authenticated
using (public.has_permission(tenant_id, 'small_group.manage') or public.has_permission(tenant_id, 'small_group.update'))
with check (public.has_permission(tenant_id, 'small_group.manage') or public.has_permission(tenant_id, 'small_group.create') or public.has_permission(tenant_id, 'small_group.update'));

create policy "small group child records tenant readable" on public.small_group_hierarchy_history
for select to authenticated
using (exists (select 1 from public.small_groups g where g.id = group_id and g.tenant_id = tenant_id and (public.has_permission(tenant_id, 'small_group.view') or auth.uid() in (g.leader_user_id, g.supervising_pastor_user_id))));

create policy "small group leadership read" on public.small_group_leadership_assignments
for select to authenticated
using (exists (select 1 from public.small_groups g where g.id = group_id and g.tenant_id = tenant_id and (public.has_permission(tenant_id, 'small_group.view') or auth.uid() in (g.leader_user_id, g.supervising_pastor_user_id) or user_id = auth.uid())));

create policy "small group leadership manage" on public.small_group_leadership_assignments
for all to authenticated
using (public.has_permission(tenant_id, 'small_group.assign_leader'))
with check (public.has_permission(tenant_id, 'small_group.assign_leader'));

create policy "small group membership read" on public.small_group_memberships
for select to authenticated
using (public.has_permission(tenant_id, 'small_group.view') or exists (select 1 from public.small_groups g where g.id = group_id and auth.uid() in (g.leader_user_id, g.assistant_leader_user_id, g.supervising_pastor_user_id)));

create policy "small group membership manage" on public.small_group_memberships
for all to authenticated
using (public.has_permission(tenant_id, 'small_group.membership.manage'))
with check (public.has_permission(tenant_id, 'small_group.membership.manage'));

create policy "small group join request read" on public.small_group_join_requests
for select to authenticated
using (public.has_permission(tenant_id, 'small_group.join_request.manage') or exists (select 1 from public.small_groups g where g.id = group_id and auth.uid() in (g.leader_user_id, g.assistant_leader_user_id, g.supervising_pastor_user_id)));

create policy "small group join request public insert" on public.small_group_join_requests
for insert to anon, authenticated
with check (
  exists (
    select 1
    from public.small_groups g
    where g.id = group_id
      and g.tenant_id = tenant_id
      and g.public_discoverable
      and g.status = 'active'
      and g.join_policy <> 'temporarily_closed'
  )
);

create policy "small group transfers manage" on public.small_group_transfers
for all to authenticated
using (public.has_permission(tenant_id, 'small_group.transfer.manage'))
with check (public.has_permission(tenant_id, 'small_group.transfer.manage'));

create policy "small group meeting config read" on public.small_group_meeting_types
for select to authenticated
using (exists (select 1 from public.tenant_memberships tm where tm.tenant_id = small_group_meeting_types.tenant_id and tm.user_id = auth.uid() and tm.status = 'active'));

create policy "small group meeting config manage" on public.small_group_meeting_types
for all to authenticated
using (public.has_permission(tenant_id, 'small_group.settings.manage'))
with check (public.has_permission(tenant_id, 'small_group.settings.manage'));

create policy "small group meetings read" on public.small_group_meetings
for select to authenticated
using (exists (select 1 from public.small_groups g where g.id = group_id and g.tenant_id = tenant_id and (public.has_permission(tenant_id, 'small_group.view') or auth.uid() in (g.leader_user_id, g.assistant_leader_user_id, g.supervising_pastor_user_id))));

create policy "small group meetings manage" on public.small_group_meetings
for all to authenticated
using (public.has_permission(tenant_id, 'small_group.update') or exists (select 1 from public.small_groups g where g.id = group_id and auth.uid() in (g.leader_user_id, g.assistant_leader_user_id)))
with check (public.has_permission(tenant_id, 'small_group.update') or exists (select 1 from public.small_groups g where g.id = group_id and auth.uid() in (g.leader_user_id, g.assistant_leader_user_id)));

create policy "small group attendance read" on public.small_group_attendance
for select to authenticated
using (public.has_permission(tenant_id, 'small_group.attendance.view') or exists (select 1 from public.small_groups g where g.id = group_id and auth.uid() in (g.leader_user_id, g.assistant_leader_user_id, g.supervising_pastor_user_id)));

create policy "small group attendance record" on public.small_group_attendance
for insert to authenticated
with check (public.has_permission(tenant_id, 'small_group.attendance.record') or exists (select 1 from public.small_groups g where g.id = group_id and auth.uid() in (g.leader_user_id, g.assistant_leader_user_id)));

create policy "small group report templates read" on public.small_group_report_templates
for select to authenticated
using (exists (select 1 from public.tenant_memberships tm where tm.tenant_id = small_group_report_templates.tenant_id and tm.user_id = auth.uid() and tm.status = 'active'));

create policy "small group report templates manage" on public.small_group_report_templates
for all to authenticated
using (public.has_permission(tenant_id, 'small_group.settings.manage'))
with check (public.has_permission(tenant_id, 'small_group.settings.manage'));

create policy "small group reports read" on public.small_group_meeting_reports
for select to authenticated
using (public.has_permission(tenant_id, 'small_group.report.review') or exists (select 1 from public.small_groups g where g.id = group_id and auth.uid() in (g.leader_user_id, g.assistant_leader_user_id, g.supervising_pastor_user_id)));

create policy "small group reports submit" on public.small_group_meeting_reports
for insert to authenticated
with check (public.has_permission(tenant_id, 'small_group.report.submit') or exists (select 1 from public.small_groups g where g.id = group_id and auth.uid() in (g.leader_user_id, g.assistant_leader_user_id)));

create policy "small group reports review" on public.small_group_meeting_reports
for update to authenticated
using (public.has_permission(tenant_id, 'small_group.report.review') or public.has_permission(tenant_id, 'small_group.report.approve'))
with check (public.has_permission(tenant_id, 'small_group.report.review') or public.has_permission(tenant_id, 'small_group.report.approve'));

create policy "small group giving category read" on public.small_group_giving_categories
for select to authenticated
using (exists (select 1 from public.tenant_memberships tm where tm.tenant_id = small_group_giving_categories.tenant_id and tm.user_id = auth.uid() and tm.status = 'active'));

create policy "small group giving totals finance read" on public.small_group_meeting_giving_totals
for select to authenticated
using (public.has_permission(tenant_id, 'small_group.giving.view') or public.has_permission(tenant_id, 'finance.view_summary'));

create policy "small group giving totals record" on public.small_group_meeting_giving_totals
for insert to authenticated
with check (public.has_permission(tenant_id, 'small_group.giving.record'));

create policy "small group giving corrections finance only" on public.small_group_giving_corrections
for all to authenticated
using (public.has_permission(tenant_id, 'small_group.giving.verify') or public.has_permission(tenant_id, 'finance.manage'))
with check (public.has_permission(tenant_id, 'small_group.giving.verify') or public.has_permission(tenant_id, 'finance.manage'));

create policy "small group handovers finance only" on public.small_group_finance_handovers
for all to authenticated
using (public.has_permission(tenant_id, 'small_group.giving.verify') or public.has_permission(tenant_id, 'finance.view_summary'))
with check (public.has_permission(tenant_id, 'small_group.giving.record') or public.has_permission(tenant_id, 'small_group.giving.verify'));

create policy "small group health private leadership read" on public.small_group_health_snapshots
for select to authenticated
using (public.has_permission(tenant_id, 'small_group.view_all') or exists (select 1 from public.small_groups g where g.id = group_id and auth.uid() in (g.leader_user_id, g.supervising_pastor_user_id)));

create policy "small group multiplication manage" on public.small_group_multiplication_proposals
for all to authenticated
using (public.has_permission(tenant_id, 'small_group.multiplication.manage'))
with check (public.has_permission(tenant_id, 'small_group.multiplication.manage'));

create policy "small group qr read" on public.small_group_qr_codes
for select to authenticated
using (public.has_permission(tenant_id, 'small_group.view') or exists (select 1 from public.small_groups g where g.id = group_id and auth.uid() in (g.leader_user_id, g.assistant_leader_user_id)));

create policy "small group communications read" on public.small_group_communication_events
for select to authenticated
using (public.has_permission(tenant_id, 'small_group.view') or exists (select 1 from public.small_groups g where g.id = group_id and auth.uid() in (g.leader_user_id, g.assistant_leader_user_id, g.supervising_pastor_user_id)));

insert into public.permissions (key, description, group_key, label, sensitive)
values
  ('small_group.view_all','View all group operational summaries for an authorized scope.','small_groups','View all groups',true),
  ('small_group.manage','Manage group configuration and lifecycle.','small_groups','Manage groups',true),
  ('small_group.membership.manage','Manage group membership and placement.','small_groups','Manage group membership',false),
  ('small_group.join_request.manage','Review group join requests.','small_groups','Manage join requests',false),
  ('small_group.transfer.manage','Manage group transfers and handovers.','small_groups','Manage group transfers',false),
  ('small_group.attendance.record','Record small-group attendance.','small_groups','Record group attendance',false),
  ('small_group.attendance.view','View small-group attendance.','small_groups','View group attendance',false),
  ('small_group.report.return','Return a group report for correction.','small_groups','Return group reports',false),
  ('small_group.report.lock','Lock approved group reports.','small_groups','Lock group reports',true),
  ('small_group.giving.record','Record meeting giving totals.','small_groups','Record group giving totals',true),
  ('small_group.giving.view','View meeting giving totals.','small_groups','View group giving totals',true),
  ('small_group.giving.verify','Verify group giving handovers and corrections.','small_groups','Verify group giving totals',true),
  ('small_group.multiplication.manage','Manage multiplication proposals.','small_groups','Manage multiplication',false),
  ('small_group.settings.manage','Manage group types, templates and thresholds.','small_groups','Manage group settings',true),
  ('small_group.public_directory.manage','Manage public group directory visibility.','small_groups','Manage public group directory',false),
  ('small_group.export','Export authorized group reports.','small_groups','Export group reports',true)
on conflict (key) do nothing;
