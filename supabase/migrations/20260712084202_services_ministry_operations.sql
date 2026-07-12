create table public.service_types (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key text not null,
  display_name text not null,
  default_duration_minutes integer not null default 120,
  default_template_id uuid,
  required_department_ids uuid[] not null default '{}',
  approval_workflow_id uuid,
  attendance_model text not null default 'summary',
  child_check_in_required boolean not null default false,
  security_required boolean not null default false,
  livestream_required boolean not null default false,
  reporting_template_id uuid,
  active boolean not null default true,
  unique (tenant_id, key)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  organization_unit_id uuid references public.organization_units(id),
  service_type_id uuid references public.service_types(id),
  title text not null,
  theme text,
  description text,
  service_date date not null,
  start_time time,
  end_time time,
  venue text,
  online_link text,
  expected_attendance integer not null default 0,
  capacity integer not null default 0,
  presiding_minister_user_id uuid references public.profiles(id),
  preacher_user_id uuid references public.profiles(id),
  service_coordinator_user_id uuid references public.profiles(id),
  worship_leader_user_id uuid references public.profiles(id),
  branch_pastor_user_id uuid references public.profiles(id),
  programme_owner_user_id uuid references public.profiles(id),
  status text not null default 'draft',
  approval_status text not null default 'pending',
  publication_status text not null default 'private',
  attendance_status text not null default 'not_started',
  report_status text not null default 'not_started',
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_schedules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  service_type_id uuid references public.service_types(id),
  recurrence text not null,
  day_and_time text not null,
  default_venue text,
  active_from date not null,
  paused_dates date[] not null default '{}',
  generated_service_ids uuid[] not null default '{}',
  active boolean not null default true
);

create table public.service_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  version integer not null default 1,
  branch_id uuid references public.branches(id),
  service_type_id uuid references public.service_types(id),
  active_from date not null default current_date,
  approval_required boolean not null default true,
  default_items text[] not null default '{}',
  unique (tenant_id, name, version)
);

create table public.service_plan_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  title text not null,
  item_type text not null,
  start_time time,
  duration_minutes integer not null default 5,
  responsible_user_id uuid references public.profiles(id),
  responsible_department_id uuid,
  notes text,
  scripture text,
  song_id uuid,
  stage_cue text,
  technical_cue text,
  visibility text not null default 'teams',
  status text not null default 'draft',
  dependency_item_id uuid references public.service_plan_items(id),
  contingency_option text,
  sort_order integer not null default 1
);

create table public.sermon_plans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  service_id uuid references public.services(id) on delete cascade,
  title text not null,
  theme text,
  scripture_references text[] not null default '{}',
  preacher_user_id uuid references public.profiles(id),
  series_id uuid,
  summary text,
  public_status text not null default 'private',
  restricted_notes text,
  publication_approval text not null default 'pending'
);

create table public.songs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  composer_or_artist text,
  language text,
  default_key text,
  tempo text,
  genre text,
  licensing_note text,
  last_used date,
  usage_count integer not null default 0,
  active boolean not null default true
);

create table public.worship_sets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  service_id uuid references public.services(id) on delete cascade,
  set_type text not null,
  worship_leader_user_id uuid references public.profiles(id),
  licensing_note text,
  duration_minutes integer not null default 0
);

create table public.worship_set_songs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  worship_set_id uuid references public.worship_sets(id) on delete cascade,
  song_id uuid references public.songs(id),
  song_key text,
  tempo text,
  sort_order integer not null default 1
);

create table public.music_teams (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  name text not null,
  team_type text not null,
  leader_user_id uuid references public.profiles(id),
  assistant_leader_user_id uuid references public.profiles(id),
  readiness_label text not null default 'Ready',
  active boolean not null default true
);

create table public.rehearsals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  team_id uuid references public.music_teams(id),
  service_id uuid references public.services(id),
  rehearsal_date date,
  rehearsal_time time,
  venue text,
  leader_user_id uuid references public.profiles(id),
  song_ids uuid[] not null default '{}',
  equipment_needed text[] not null default '{}',
  readiness_status text not null default 'scheduled',
  notes text
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  parent_department_id uuid references public.departments(id),
  name text not null,
  code text not null,
  purpose text,
  description text,
  leader_user_id uuid references public.profiles(id),
  deputy_user_id uuid references public.profiles(id),
  administrator_user_id uuid references public.profiles(id),
  membership_requirements text[] not null default '{}',
  training_requirements text[] not null default '{}',
  service_responsibilities text[] not null default '{}',
  status text not null default 'active',
  reporting_unit_id uuid references public.organization_units(id),
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  constraint departments_no_self_parent check (id <> parent_department_id)
);

create table public.volunteer_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id),
  user_id uuid references public.profiles(id),
  department_ids uuid[] not null default '{}',
  roles text[] not null default '{}',
  skills text[] not null default '{}',
  interests text[] not null default '{}',
  branch_id uuid references public.branches(id),
  induction_status text not null default 'not_started',
  safeguarding_clearance_status text not null default 'placeholder_not_checked',
  accessibility_needs text,
  temporary_unavailable_until date,
  active boolean not null default true
);

create table public.volunteer_applications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id),
  requested_department_id uuid references public.departments(id),
  motivation text,
  availability text,
  skills text[] not null default '{}',
  branch_id uuid references public.branches(id),
  required_training text[] not null default '{}',
  approval_status text not null default 'pending',
  status text not null default 'submitted'
);

create table public.volunteer_availability (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  volunteer_profile_id uuid references public.volunteer_profiles(id) on delete cascade,
  available_dates date[] not null default '{}',
  unavailable_dates date[] not null default '{}',
  preferred_service_ids uuid[] not null default '{}',
  maximum_services_per_month integer not null default 4,
  recurring_availability text
);

create table public.roster_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  service_id uuid references public.services(id) on delete cascade,
  department_id uuid references public.departments(id),
  volunteer_profile_id uuid references public.volunteer_profiles(id),
  role text not null,
  station text,
  shift text,
  start_time time,
  end_time time,
  reporting_time time,
  supervisor_user_id uuid references public.profiles(id),
  status text not null default 'draft',
  confirmation text not null default 'pending',
  substitution_assignment_id uuid references public.roster_assignments(id),
  notes text
);

create table public.roster_conflicts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  roster_assignment_id uuid references public.roster_assignments(id) on delete cascade,
  conflict_type text not null,
  explanation text not null,
  severity text not null default 'warning',
  override_by_user_id uuid references public.profiles(id),
  override_reason text
);

create table public.roster_replacement_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  original_assignment_id uuid references public.roster_assignments(id),
  requested_by_profile_id uuid references public.volunteer_profiles(id),
  reason text not null,
  reviewed_by_user_id uuid references public.profiles(id),
  replacement_assignment_id uuid references public.roster_assignments(id),
  status text not null default 'requested'
);

create table public.volunteer_check_ins (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  roster_assignment_id uuid references public.roster_assignments(id),
  arrival_time timestamptz,
  method text not null,
  late_status text not null default 'on_time',
  completion_status text not null default 'pending',
  supervisor_confirmed boolean not null default false
);

create table public.service_equipment_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  service_id uuid references public.services(id) on delete cascade,
  item text not null,
  quantity integer not null default 1,
  department_id uuid references public.departments(id),
  responsible_user_id uuid references public.profiles(id),
  readiness_status text not null default 'ready',
  issue text,
  checked_by_user_id uuid references public.profiles(id),
  checked_at timestamptz,
  returned_status text not null default 'not_required'
);

create table public.media_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  service_id uuid references public.services(id),
  requester_user_id uuid references public.profiles(id),
  asset_type text not null,
  description text,
  deadline timestamptz,
  branch_id uuid references public.branches(id),
  assigned_designer_user_id uuid references public.profiles(id),
  status text not null default 'submitted'
);

create table public.service_incidents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  service_id uuid references public.services(id),
  branch_id uuid references public.branches(id),
  occurred_at timestamptz,
  location text,
  category text not null,
  summary text not null,
  immediate_action text,
  escalation text not null default 'none',
  responsible_lead_user_id uuid references public.profiles(id),
  status text not null default 'open',
  restricted_notes text
);

create table public.service_reports (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  service_id uuid references public.services(id),
  status text not null default 'draft',
  submitted_by_user_id uuid references public.profiles(id),
  reviewed_by_user_id uuid references public.profiles(id),
  attendance_summary jsonb not null default '{}'::jsonb,
  safe_referral_summary text[] not null default '{}',
  department_readiness_summary text,
  technical_incident_summary text,
  next_actions text[] not null default '{}'
);

create or replace function public.prevent_department_cycle()
returns trigger language plpgsql as $$
declare cursor_id uuid;
begin
  if new.parent_department_id is null then return new; end if;
  if new.id = new.parent_department_id then raise exception 'Department cannot parent itself'; end if;
  cursor_id := new.parent_department_id;
  while cursor_id is not null loop
    if cursor_id = new.id then raise exception 'Department hierarchy cycle blocked'; end if;
    select parent_department_id into cursor_id from public.departments where id = cursor_id;
  end loop;
  return new;
end;
$$;

create trigger departments_prevent_cycle before insert or update of parent_department_id on public.departments for each row execute function public.prevent_department_cycle();

create index services_tenant_branch_idx on public.services(tenant_id, branch_id, service_date);
create index roster_assignments_service_idx on public.roster_assignments(service_id, department_id, confirmation);
create index service_incidents_restricted_idx on public.service_incidents(tenant_id, category, status);

alter table public.service_types enable row level security;
alter table public.services enable row level security;
alter table public.service_schedules enable row level security;
alter table public.service_templates enable row level security;
alter table public.service_plan_items enable row level security;
alter table public.sermon_plans enable row level security;
alter table public.songs enable row level security;
alter table public.worship_sets enable row level security;
alter table public.worship_set_songs enable row level security;
alter table public.music_teams enable row level security;
alter table public.rehearsals enable row level security;
alter table public.departments enable row level security;
alter table public.volunteer_profiles enable row level security;
alter table public.volunteer_applications enable row level security;
alter table public.volunteer_availability enable row level security;
alter table public.roster_assignments enable row level security;
alter table public.roster_conflicts enable row level security;
alter table public.roster_replacement_requests enable row level security;
alter table public.volunteer_check_ins enable row level security;
alter table public.service_equipment_items enable row level security;
alter table public.media_requests enable row level security;
alter table public.service_incidents enable row level security;
alter table public.service_reports enable row level security;

create policy "service types tenant read" on public.service_types for select to authenticated using (exists (select 1 from public.tenant_memberships tm where tm.tenant_id = service_types.tenant_id and tm.user_id = auth.uid() and tm.status = 'active'));
create policy "services scoped read" on public.services for select to authenticated using (exists (select 1 from public.tenant_memberships tm where tm.tenant_id = services.tenant_id and tm.user_id = auth.uid() and tm.status = 'active') and (public.has_permission(tenant_id, 'service.view') or auth.uid() in (presiding_minister_user_id, preacher_user_id, service_coordinator_user_id, worship_leader_user_id, branch_pastor_user_id)));
create policy "services public read" on public.services for select to anon using (publication_status = 'public' and status in ('published','scheduled','in_progress'));
create policy "services manage" on public.services for all to authenticated using (public.has_permission(tenant_id, 'service.update') or public.has_permission(tenant_id, 'service.create')) with check (public.has_permission(tenant_id, 'service.update') or public.has_permission(tenant_id, 'service.create'));
create policy "service schedules read" on public.service_schedules for select to authenticated using (public.has_permission(tenant_id, 'service.view'));
create policy "service schedules manage" on public.service_schedules for all to authenticated using (public.has_permission(tenant_id, 'service.settings.manage') or public.has_permission(tenant_id, 'service.create')) with check (public.has_permission(tenant_id, 'service.settings.manage') or public.has_permission(tenant_id, 'service.create'));
create policy "service templates read" on public.service_templates for select to authenticated using (public.has_permission(tenant_id, 'service.view'));
create policy "service templates manage" on public.service_templates for all to authenticated using (public.has_permission(tenant_id, 'service.order.manage') or public.has_permission(tenant_id, 'service.settings.manage')) with check (public.has_permission(tenant_id, 'service.order.manage') or public.has_permission(tenant_id, 'service.settings.manage'));
create policy "service planning read" on public.service_plan_items for select to authenticated using (public.has_permission(tenant_id, 'service.view'));
create policy "service planning manage" on public.service_plan_items for all to authenticated using (public.has_permission(tenant_id, 'service.order.manage') or public.has_permission(tenant_id, 'service.plan.manage')) with check (public.has_permission(tenant_id, 'service.order.manage') or public.has_permission(tenant_id, 'service.plan.manage'));
create policy "sermons restricted read" on public.sermon_plans for select to authenticated using (public.has_permission(tenant_id, 'service.sermon.view') or public.has_permission(tenant_id, 'service.sermon.manage'));
create policy "sermons manage" on public.sermon_plans for all to authenticated using (public.has_permission(tenant_id, 'service.sermon.manage')) with check (public.has_permission(tenant_id, 'service.sermon.manage'));
create policy "departments scoped read" on public.departments for select to authenticated using (public.has_permission(tenant_id, 'department.view') or auth.uid() in (leader_user_id, deputy_user_id, administrator_user_id));
create policy "departments manage" on public.departments for all to authenticated using (public.has_permission(tenant_id, 'department.update') or public.has_permission(tenant_id, 'department.manage')) with check (public.has_permission(tenant_id, 'department.create') or public.has_permission(tenant_id, 'department.update') or public.has_permission(tenant_id, 'department.manage'));
create policy "volunteers scoped read" on public.volunteer_profiles for select to authenticated using (public.has_permission(tenant_id, 'volunteer.view') or user_id = auth.uid());
create policy "volunteers manage" on public.volunteer_profiles for all to authenticated using (public.has_permission(tenant_id, 'volunteer.manage')) with check (public.has_permission(tenant_id, 'volunteer.manage'));
create policy "volunteer applications scoped read" on public.volunteer_applications for select to authenticated using (public.has_permission(tenant_id, 'volunteer.view') or exists (select 1 from public.volunteer_profiles vp where vp.person_id = volunteer_applications.person_id and vp.user_id = auth.uid()));
create policy "volunteer applications manage" on public.volunteer_applications for all to authenticated using (public.has_permission(tenant_id, 'volunteer.manage') or public.has_permission(tenant_id, 'volunteer.approve')) with check (public.has_permission(tenant_id, 'volunteer.manage') or public.has_permission(tenant_id, 'volunteer.approve'));
create policy "volunteer availability scoped read" on public.volunteer_availability for select to authenticated using (public.has_permission(tenant_id, 'volunteer.availability.manage') or exists (select 1 from public.volunteer_profiles vp where vp.id = volunteer_profile_id and vp.user_id = auth.uid()));
create policy "volunteer availability manage" on public.volunteer_availability for all to authenticated using (public.has_permission(tenant_id, 'volunteer.availability.manage') or exists (select 1 from public.volunteer_profiles vp where vp.id = volunteer_profile_id and vp.user_id = auth.uid())) with check (public.has_permission(tenant_id, 'volunteer.availability.manage') or exists (select 1 from public.volunteer_profiles vp where vp.id = volunteer_profile_id and vp.user_id = auth.uid()));
create policy "rosters scoped read" on public.roster_assignments for select to authenticated using (public.has_permission(tenant_id, 'roster.view') or exists (select 1 from public.volunteer_profiles vp where vp.id = volunteer_profile_id and vp.user_id = auth.uid()));
create policy "rosters manage" on public.roster_assignments for all to authenticated using (public.has_permission(tenant_id, 'roster.create') or public.has_permission(tenant_id, 'roster.publish')) with check (public.has_permission(tenant_id, 'roster.create') or public.has_permission(tenant_id, 'roster.publish'));
create policy "roster conflicts read" on public.roster_conflicts for select to authenticated using (public.has_permission(tenant_id, 'roster.view'));
create policy "roster conflicts manage" on public.roster_conflicts for all to authenticated using (public.has_permission(tenant_id, 'roster.create') or public.has_permission(tenant_id, 'roster.publish')) with check (public.has_permission(tenant_id, 'roster.create') or public.has_permission(tenant_id, 'roster.publish'));
create policy "roster replacements scoped read" on public.roster_replacement_requests for select to authenticated using (public.has_permission(tenant_id, 'roster.view') or exists (select 1 from public.volunteer_profiles vp where vp.id = requested_by_profile_id and vp.user_id = auth.uid()));
create policy "roster replacements manage" on public.roster_replacement_requests for all to authenticated using (public.has_permission(tenant_id, 'roster.replace') or exists (select 1 from public.volunteer_profiles vp where vp.id = requested_by_profile_id and vp.user_id = auth.uid())) with check (public.has_permission(tenant_id, 'roster.replace') or exists (select 1 from public.volunteer_profiles vp where vp.id = requested_by_profile_id and vp.user_id = auth.uid()));
create policy "volunteer check ins scoped read" on public.volunteer_check_ins for select to authenticated using (public.has_permission(tenant_id, 'roster.view') or exists (select 1 from public.roster_assignments ra join public.volunteer_profiles vp on vp.id = ra.volunteer_profile_id where ra.id = roster_assignment_id and vp.user_id = auth.uid()));
create policy "volunteer check ins manage" on public.volunteer_check_ins for all to authenticated using (public.has_permission(tenant_id, 'roster.confirm')) with check (public.has_permission(tenant_id, 'roster.confirm'));
create policy "incidents restricted read" on public.service_incidents for select to authenticated using (public.has_permission(tenant_id, 'service.incident.view') or public.has_permission(tenant_id, 'service.incident.manage'));
create policy "incidents manage" on public.service_incidents for all to authenticated using (public.has_permission(tenant_id, 'service.incident.manage') or public.has_permission(tenant_id, 'service.incident.create')) with check (public.has_permission(tenant_id, 'service.incident.manage') or public.has_permission(tenant_id, 'service.incident.create'));
create policy "service reports read" on public.service_reports for select to authenticated using (public.has_permission(tenant_id, 'service.report.review') or public.has_permission(tenant_id, 'service.report.create'));
create policy "service reports manage" on public.service_reports for all to authenticated using (public.has_permission(tenant_id, 'service.report.create') or public.has_permission(tenant_id, 'service.report.review')) with check (public.has_permission(tenant_id, 'service.report.create') or public.has_permission(tenant_id, 'service.report.review'));
create policy "ops support read" on public.service_equipment_items for select to authenticated using (public.has_permission(tenant_id, 'service.view'));
create policy "ops support manage" on public.service_equipment_items for all to authenticated using (public.has_permission(tenant_id, 'equipment_checklist.manage')) with check (public.has_permission(tenant_id, 'equipment_checklist.manage'));
create policy "media requests read" on public.media_requests for select to authenticated using (public.has_permission(tenant_id, 'media_request.manage') or requester_user_id = auth.uid() or assigned_designer_user_id = auth.uid());
create policy "media requests manage" on public.media_requests for all to authenticated using (public.has_permission(tenant_id, 'media_request.manage') or requester_user_id = auth.uid()) with check (public.has_permission(tenant_id, 'media_request.manage') or requester_user_id = auth.uid());
create policy "worship read" on public.songs for select to authenticated using (public.has_permission(tenant_id, 'service.worship.manage') or public.has_permission(tenant_id, 'service.view'));
create policy "songs manage" on public.songs for all to authenticated using (public.has_permission(tenant_id, 'service.worship.manage')) with check (public.has_permission(tenant_id, 'service.worship.manage'));
create policy "worship sets read" on public.worship_sets for select to authenticated using (public.has_permission(tenant_id, 'service.worship.manage') or public.has_permission(tenant_id, 'service.view'));
create policy "worship sets manage" on public.worship_sets for all to authenticated using (public.has_permission(tenant_id, 'service.worship.manage')) with check (public.has_permission(tenant_id, 'service.worship.manage'));
create policy "worship set songs read" on public.worship_set_songs for select to authenticated using (public.has_permission(tenant_id, 'service.worship.manage') or public.has_permission(tenant_id, 'service.view'));
create policy "worship set songs manage" on public.worship_set_songs for all to authenticated using (public.has_permission(tenant_id, 'service.worship.manage')) with check (public.has_permission(tenant_id, 'service.worship.manage'));
create policy "music teams read" on public.music_teams for select to authenticated using (public.has_permission(tenant_id, 'service.worship.manage') or public.has_permission(tenant_id, 'service.view') or auth.uid() in (leader_user_id, assistant_leader_user_id));
create policy "music teams manage" on public.music_teams for all to authenticated using (public.has_permission(tenant_id, 'service.worship.manage')) with check (public.has_permission(tenant_id, 'service.worship.manage'));
create policy "rehearsals read" on public.rehearsals for select to authenticated using (public.has_permission(tenant_id, 'rehearsal.manage') or leader_user_id = auth.uid());
create policy "rehearsals manage" on public.rehearsals for all to authenticated using (public.has_permission(tenant_id, 'rehearsal.manage')) with check (public.has_permission(tenant_id, 'rehearsal.manage'));

insert into public.permissions (key, description, group_key, label, sensitive) values
('service.view','View scoped service plans.','departments_volunteers','View services',false),
('service.create','Create services.','departments_volunteers','Create services',false),
('service.update','Update services.','departments_volunteers','Update services',false),
('service.approve','Approve services.','departments_volunteers','Approve services',true),
('service.publish','Publish services.','departments_volunteers','Publish services',true),
('service.cancel','Cancel services.','departments_volunteers','Cancel services',true),
('service.plan.manage','Manage service plans.','departments_volunteers','Manage service plans',false),
('service.order.manage','Manage order of service.','departments_volunteers','Manage order of service',false),
('service.sermon.view','View sermon planning.','departments_volunteers','View sermons',true),
('service.sermon.manage','Manage sermon planning.','departments_volunteers','Manage sermons',true),
('service.worship.manage','Manage worship planning.','departments_volunteers','Manage worship',false),
('service.report.create','Create service reports.','departments_volunteers','Create service reports',false),
('service.report.review','Review service reports.','departments_volunteers','Review service reports',true),
('service.report.approve','Approve service reports.','departments_volunteers','Approve service reports',true),
('service.report.export','Export service reports.','departments_volunteers','Export service reports',true),
('department.create','Create departments.','departments_volunteers','Create departments',false),
('department.update','Update departments.','departments_volunteers','Update departments',false),
('department.archive','Archive departments.','departments_volunteers','Archive departments',true),
('department.assign_leader','Assign department leaders.','departments_volunteers','Assign department leaders',true),
('department.manage_members','Manage department members.','departments_volunteers','Manage department members',false),
('volunteer.approve','Approve volunteers.','departments_volunteers','Approve volunteers',true),
('volunteer.availability.manage','Manage volunteer availability.','departments_volunteers','Manage availability',false),
('roster.view','View rosters.','departments_volunteers','View rosters',false),
('roster.create','Create rosters.','departments_volunteers','Create rosters',false),
('roster.publish','Publish rosters.','departments_volunteers','Publish rosters',true),
('roster.confirm','Confirm roster assignment.','departments_volunteers','Confirm rosters',false),
('roster.replace','Manage roster replacement.','departments_volunteers','Replace roster assignment',false),
('rehearsal.manage','Manage rehearsals.','departments_volunteers','Manage rehearsals',false),
('equipment_checklist.manage','Manage equipment checklists.','departments_volunteers','Manage equipment checklist',false),
('media_request.manage','Manage media requests.','departments_volunteers','Manage media requests',false),
('protocol.manage','Manage protocol and hospitality.','departments_volunteers','Manage protocol',false),
('service.incident.create','Create service incidents.','departments_volunteers','Create service incidents',true),
('service.incident.view','View service incidents.','departments_volunteers','View service incidents',true),
('service.incident.manage','Manage service incidents.','departments_volunteers','Manage service incidents',true),
('service.settings.manage','Manage service settings.','departments_volunteers','Manage service settings',true)
on conflict (key) do nothing;
