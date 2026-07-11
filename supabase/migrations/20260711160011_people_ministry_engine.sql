create table if not exists public.lifecycle_stages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  key text not null,
  display_label text not null,
  sort_order integer not null,
  approval_required boolean not null default false,
  automatic boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, key)
);

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text,
  first_name text not null,
  middle_name text,
  surname text not null,
  preferred_name text,
  former_name text,
  gender text,
  date_of_birth date,
  approximate_age integer,
  age_group text not null default 'unknown',
  nationality text,
  restricted_national_id text,
  preferred_contact_method text not null default 'none',
  preferred_language text not null default 'en',
  physical_address text,
  region text,
  locality text,
  postal_address text,
  branch_id uuid references public.branches(id),
  organization_unit_id uuid references public.organization_units(id),
  small_group_id uuid,
  marital_status text,
  occupation text,
  employer text,
  education_level text,
  profile_photo_file_id uuid references public.files(id),
  emergency_contact jsonb not null default '{}'::jsonb,
  accessibility_needs text,
  disability_accommodation_requests text,
  communication_preferences text[] not null default '{}',
  consent_status text not null default 'unknown',
  privacy_restrictions text[] not null default '{}',
  member_number text,
  source_of_first_contact text,
  lifecycle_stage text not null default 'unknown',
  church_relationship_status text not null default 'visitor',
  first_visit_date date,
  membership_start_date date,
  last_meaningful_activity_date timestamptz,
  active boolean not null default true,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (tenant_id, member_number)
);

create table if not exists public.person_contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  contact_type text not null,
  value text not null,
  primary_contact boolean not null default false,
  verified boolean not null default false,
  restricted boolean not null default false,
  created_at timestamptz not null default now(),
  unique (tenant_id, contact_type, value)
);

create table if not exists public.person_addresses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  address_type text not null,
  line_text text,
  region text,
  locality text,
  postal_address text,
  restricted boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.person_identifiers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  identifier_type text not null,
  identifier_value text not null,
  restricted boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, identifier_type, identifier_value)
);

create table if not exists public.person_privacy_settings (
  person_id uuid primary key references public.people(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  restricted_fields text[] not null default '{}',
  child_protected boolean not null default false,
  pastoral_only boolean not null default false,
  finance_only boolean not null default false,
  retention_status text not null default 'active',
  correction_requested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lifecycle_transitions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  from_stage text not null,
  to_stage text not null,
  approval_required boolean not null default false,
  required_actions jsonb not null default '[]'::jsonb,
  automatic boolean not null default false,
  active boolean not null default true,
  unique (tenant_id, from_stage, to_stage)
);

create table if not exists public.lifecycle_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  previous_stage text not null,
  new_stage text not null,
  reason text not null,
  branch_id uuid references public.branches(id),
  effective_date date not null,
  performed_by uuid references public.profiles(id),
  approved_by uuid references public.profiles(id),
  related_entity_type text,
  related_entity_id uuid,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  household_name text not null,
  primary_contact_person_id uuid references public.people(id),
  household_address text,
  branch_id uuid references public.branches(id),
  preferred_language text not null default 'en',
  restricted_family_notes text,
  communication_preference text,
  emergency_contact jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  relationship_type text not null,
  related_person_id uuid references public.people(id),
  child_privacy_protected boolean not null default false,
  created_at timestamptz not null default now(),
  unique (household_id, person_id)
);

create table if not exists public.guardianships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  child_person_id uuid not null references public.people(id) on delete cascade,
  guardian_person_id uuid not null references public.people(id) on delete cascade,
  relationship_type text not null,
  authorized_contact boolean not null default true,
  collection_authorized boolean not null default false,
  transport_consent boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (child_person_id <> guardian_person_id)
);

create table if not exists public.visitor_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  branch_id uuid not null references public.branches(id),
  capture_method text not null,
  visit_date date not null,
  service_or_event text,
  invited_by text,
  heard_about text,
  prayer_request text,
  wants_follow_up boolean not null default false,
  made_faith_decision boolean not null default false,
  wants_fellowship boolean not null default false,
  wants_class boolean not null default false,
  consent_to_contact boolean not null default false,
  first_ever_visit boolean not null default false,
  returning_visitor boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.new_convert_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  decision_date date not null,
  service_or_event text,
  branch_id uuid not null references public.branches(id),
  recorded_by uuid references public.profiles(id),
  preferred_follow_up_method text,
  consent_to_follow_up boolean not null default true,
  assigned_follow_up_user_id uuid references public.profiles(id),
  assigned_pastor_user_id uuid references public.profiles(id),
  assigned_small_group_id uuid,
  recommended_programme_id uuid,
  first_contact_deadline timestamptz,
  status text not null default 'registered',
  notes text,
  language text,
  location text,
  urgency text not null default 'normal',
  special_care_need text,
  source_event text,
  baptism_information_requested boolean not null default false,
  membership_information_requested boolean not null default false,
  already_attends_another_church boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.follow_up_workers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  max_active_assignments integer not null default 8,
  preferred_branch_id uuid references public.branches(id),
  languages text[] not null default '{}',
  age_group_preferences text[] not null default '{}',
  location_coverage text[] not null default '{}',
  active boolean not null default true,
  unavailable_until timestamptz,
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create table if not exists public.follow_up_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  applicable_person_type text not null,
  branch_id uuid references public.branches(id),
  active boolean not null default true,
  current_version integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.follow_up_template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.follow_up_templates(id) on delete cascade,
  version integer not null,
  completion_condition text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (template_id, version)
);

create table if not exists public.follow_up_template_steps (
  id uuid primary key default gen_random_uuid(),
  template_version_id uuid not null references public.follow_up_template_versions(id) on delete cascade,
  step_order integer not null,
  task_type text not null,
  responsible_role_id uuid references public.roles(id),
  due_interval_hours integer not null,
  escalation_rule jsonb not null default '{}'::jsonb,
  message_template text,
  unique (template_version_id, step_order)
);

create table if not exists public.follow_up_journeys (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  template_version_id uuid references public.follow_up_template_versions(id),
  assigned_worker_user_id uuid references public.profiles(id),
  assigned_pastor_user_id uuid references public.profiles(id),
  branch_id uuid references public.branches(id),
  current_stage text not null,
  next_action text,
  due_at timestamptz,
  preferred_contact_channel text,
  outcome text,
  escalation_status text,
  closure_reason text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.follow_up_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  worker_user_id uuid not null references public.profiles(id),
  pastor_user_id uuid references public.profiles(id),
  branch_id uuid references public.branches(id),
  status text not null default 'pending',
  assigned_at timestamptz not null default now(),
  accepted_at timestamptz,
  due_at timestamptz,
  assignment_reason text,
  declined_reason text,
  created_by uuid references public.profiles(id)
);

create table if not exists public.follow_up_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  assigned_user_id uuid not null references public.profiles(id),
  task_type text not null,
  description text not null,
  due_at timestamptz not null,
  priority text not null default 'normal',
  branch_id uuid references public.branches(id),
  status text not null default 'pending',
  completed_at timestamptz,
  outcome text,
  notes text,
  private_notes text,
  reschedule_reason text,
  escalation_status text,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_attempts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  attempted_by uuid references public.profiles(id),
  attempted_at timestamptz not null default now(),
  contact_method text not null,
  result text not null,
  duration_seconds integer,
  follow_up_needed boolean not null default false,
  next_action text,
  notes text,
  requested_no_further_contact boolean not null default false
);

create table if not exists public.consent_types (
  key text primary key,
  label text not null,
  sensitive boolean not null default false
);

create table if not exists public.person_consents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  consent_type text not null references public.consent_types(key),
  status text not null,
  consent_date date not null,
  method text not null,
  source text,
  recorded_by uuid references public.profiles(id),
  expires_at timestamptz,
  withdrawal_date date,
  notes text,
  unique (tenant_id, person_id, consent_type)
);

create table if not exists public.member_number_sequences (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  prefix text not null,
  next_number integer not null default 1,
  year_based boolean not null default false,
  active boolean not null default true,
  unique (tenant_id, branch_id, prefix)
);

create table if not exists public.branch_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  branch_id uuid not null references public.branches(id),
  primary_branch boolean not null default false,
  started_at date not null,
  ended_at date,
  reason text
);

create table if not exists public.transfer_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  source_branch_id uuid not null references public.branches(id),
  destination_branch_id uuid not null references public.branches(id),
  reason text not null,
  requested_by uuid references public.profiles(id),
  effective_date date,
  receiving_leader_user_id uuid references public.profiles(id),
  follow_up_handover text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  check (source_branch_id <> destination_branch_id)
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  label text not null,
  tag_type text not null default 'manual',
  branch_id uuid references public.branches(id),
  active boolean not null default true,
  unique (tenant_id, label)
);

create table if not exists public.person_tags (
  person_id uuid not null references public.people(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  assigned_by uuid references public.profiles(id),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (person_id, tag_id)
);

create table if not exists public.segments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.segment_rules (
  id uuid primary key default gen_random_uuid(),
  segment_id uuid not null references public.segments(id) on delete cascade,
  field_key text not null,
  operator text not null,
  value text not null,
  sensitive_disallowed boolean not null default true
);

create table if not exists public.custom_field_definitions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  label text not null,
  internal_key text not null,
  field_type text not null,
  required boolean not null default false,
  applicable_person_type text,
  branch_id uuid references public.branches(id),
  visibility text not null default 'standard',
  edit_permission text,
  sensitive boolean not null default false,
  active boolean not null default true,
  display_order integer not null default 0,
  unique (tenant_id, internal_key)
);

create table if not exists public.custom_field_values (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  field_definition_id uuid not null references public.custom_field_definitions(id),
  value_text text,
  created_at timestamptz not null default now(),
  unique (person_id, field_definition_id)
);

create table if not exists public.form_definitions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  name text not null,
  form_type text not null,
  public boolean not null default false,
  active boolean not null default true,
  language text not null default 'en',
  consent_statement text not null,
  confirmation_message text,
  assignment_rule jsonb not null default '{}'::jsonb,
  follow_up_template_id uuid references public.follow_up_templates(id),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.form_versions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.form_definitions(id) on delete cascade,
  version integer not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (form_id, version)
);

create table if not exists public.form_fields (
  id uuid primary key default gen_random_uuid(),
  form_version_id uuid not null references public.form_versions(id) on delete cascade,
  field_key text not null,
  label text not null,
  required boolean not null default false,
  internal_only boolean not null default false,
  display_order integer not null default 0
);

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  form_id uuid not null references public.form_definitions(id),
  branch_id uuid references public.branches(id),
  person_id uuid references public.people(id),
  submission_payload jsonb not null,
  duplicate_signals jsonb not null default '[]'::jsonb,
  source_ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  form_id uuid not null references public.form_definitions(id),
  code text not null unique,
  campaign text,
  expires_at timestamptz,
  active boolean not null default true,
  scans integer not null default 0,
  submissions integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.duplicate_candidates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  primary_person_id uuid not null references public.people(id),
  possible_duplicate_person_id uuid not null references public.people(id),
  signals jsonb not null default '[]'::jsonb,
  status text not null default 'pending_review',
  created_at timestamptz not null default now(),
  check (primary_person_id <> possible_duplicate_person_id)
);

create table if not exists public.person_merges (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  surviving_person_id uuid not null references public.people(id),
  merged_person_id uuid not null references public.people(id),
  chosen_values jsonb not null default '{}'::jsonb,
  merged_by uuid references public.profiles(id),
  rollback_reference jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  category text not null,
  status text not null default 'draft',
  field_mapping jsonb not null default '{}'::jsonb,
  valid_rows integer not null default 0,
  invalid_rows integer not null default 0,
  dry_run boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.import_rows (
  id uuid primary key default gen_random_uuid(),
  import_job_id uuid not null references public.import_jobs(id) on delete cascade,
  row_number integer not null,
  raw_data jsonb not null,
  validation_errors jsonb not null default '[]'::jsonb,
  imported_person_id uuid references public.people(id)
);

create table if not exists public.export_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  requested_by uuid references public.profiles(id),
  export_type text not null,
  reason text not null,
  scope_type scope_type not null default 'tenant',
  scope_record_id uuid,
  sensitive boolean not null default false,
  status text not null default 'pending_approval',
  download_expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.person_activity_signals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  signal_type text not null,
  occurred_at timestamptz not null,
  billable_eligible boolean not null default false,
  source_entity_type text,
  source_entity_id uuid
);

create index if not exists idx_people_tenant_branch on public.people (tenant_id, branch_id, lifecycle_stage);
create index if not exists idx_people_search on public.people (tenant_id, surname, first_name, member_number);
create index if not exists idx_person_contacts_lookup on public.person_contacts (tenant_id, contact_type, value);
create index if not exists idx_follow_up_tasks_due on public.follow_up_tasks (tenant_id, assigned_user_id, status, due_at);
create index if not exists idx_visitor_records_branch_date on public.visitor_records (tenant_id, branch_id, visit_date);
create index if not exists idx_activity_signals_billing on public.person_activity_signals (tenant_id, occurred_at, billable_eligible);

alter table public.lifecycle_stages enable row level security;
alter table public.people enable row level security;
alter table public.person_contacts enable row level security;
alter table public.person_addresses enable row level security;
alter table public.person_identifiers enable row level security;
alter table public.person_privacy_settings enable row level security;
alter table public.lifecycle_transitions enable row level security;
alter table public.lifecycle_events enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.guardianships enable row level security;
alter table public.visitor_records enable row level security;
alter table public.new_convert_records enable row level security;
alter table public.follow_up_workers enable row level security;
alter table public.follow_up_templates enable row level security;
alter table public.follow_up_template_versions enable row level security;
alter table public.follow_up_template_steps enable row level security;
alter table public.follow_up_journeys enable row level security;
alter table public.follow_up_assignments enable row level security;
alter table public.follow_up_tasks enable row level security;
alter table public.contact_attempts enable row level security;
alter table public.consent_types enable row level security;
alter table public.person_consents enable row level security;
alter table public.member_number_sequences enable row level security;
alter table public.branch_memberships enable row level security;
alter table public.transfer_requests enable row level security;
alter table public.tags enable row level security;
alter table public.person_tags enable row level security;
alter table public.segments enable row level security;
alter table public.segment_rules enable row level security;
alter table public.custom_field_definitions enable row level security;
alter table public.custom_field_values enable row level security;
alter table public.form_definitions enable row level security;
alter table public.form_versions enable row level security;
alter table public.form_fields enable row level security;
alter table public.form_submissions enable row level security;
alter table public.qr_codes enable row level security;
alter table public.duplicate_candidates enable row level security;
alter table public.person_merges enable row level security;
alter table public.import_jobs enable row level security;
alter table public.import_rows enable row level security;
alter table public.export_jobs enable row level security;
alter table public.person_activity_signals enable row level security;

create policy "people scoped read" on public.people for select to authenticated using (public.has_permission(tenant_id, 'people.view') or public.has_permission(tenant_id, 'member.view') or public.has_permission(tenant_id, 'visitor.view'));
create policy "people scoped insert" on public.people for insert to authenticated with check (public.has_permission(tenant_id, 'people.create'));
create policy "people scoped update" on public.people for update to authenticated using (public.has_permission(tenant_id, 'people.update')) with check (public.has_permission(tenant_id, 'people.update'));
create policy "child privacy settings read" on public.person_privacy_settings for select to authenticated using ((child_protected = false and public.has_permission(tenant_id, 'people.view')) or public.has_permission(tenant_id, 'child.view_sensitive'));
create policy "person contacts scoped read" on public.person_contacts for select to authenticated using (public.has_permission(tenant_id, 'people.view') or public.has_permission(tenant_id, 'follow_up.view'));
create policy "person identifiers restricted read" on public.person_identifiers for select to authenticated using (public.has_permission(tenant_id, 'people.export_sensitive'));
create policy "lifecycle scoped read" on public.lifecycle_events for select to authenticated using (public.has_permission(tenant_id, 'people.view'));
create policy "household scoped read" on public.households for select to authenticated using (public.has_permission(tenant_id, 'household.view'));
create policy "household members scoped read" on public.household_members for select to authenticated using (public.has_permission(tenant_id, 'household.view'));
create policy "guardians scoped read" on public.guardianships for select to authenticated using (public.has_permission(tenant_id, 'guardian.manage') or public.has_permission(tenant_id, 'child.view_basic'));
create policy "visitor scoped read" on public.visitor_records for select to authenticated using (public.has_permission(tenant_id, 'visitor.view'));
create policy "new convert scoped read" on public.new_convert_records for select to authenticated using (public.has_permission(tenant_id, 'new_convert.view'));
create policy "follow up worker read" on public.follow_up_workers for select to authenticated using (public.has_permission(tenant_id, 'follow_up.view') or user_id = (select auth.uid()));
create policy "follow up assignments participant read" on public.follow_up_assignments for select to authenticated using (public.has_permission(tenant_id, 'follow_up.view') or worker_user_id = (select auth.uid()) or pastor_user_id = (select auth.uid()));
create policy "follow up tasks participant read" on public.follow_up_tasks for select to authenticated using (public.has_permission(tenant_id, 'follow_up.view') or assigned_user_id = (select auth.uid()));
create policy "contact attempts scoped read" on public.contact_attempts for select to authenticated using (public.has_permission(tenant_id, 'follow_up.view') or attempted_by = (select auth.uid()));
create policy "consent scoped read" on public.person_consents for select to authenticated using (public.has_permission(tenant_id, 'consent.view'));
create policy "transfer scoped read" on public.transfer_requests for select to authenticated using (public.has_permission(tenant_id, 'transfer.approve') or requested_by = (select auth.uid()));
create policy "tags scoped read" on public.tags for select to authenticated using (public.has_permission(tenant_id, 'people.view'));
create policy "segments scoped read" on public.segments for select to authenticated using (public.has_permission(tenant_id, 'people.view'));
create policy "custom fields scoped read" on public.custom_field_definitions for select to authenticated using (public.has_permission(tenant_id, 'people.view'));
create policy "forms scoped read" on public.form_definitions for select to authenticated using (public.has_permission(tenant_id, 'form.manage'));
create policy "public forms insert only" on public.form_submissions for insert to anon with check (true);
create policy "form submissions staff read" on public.form_submissions for select to authenticated using (public.has_permission(tenant_id, 'visitor.view'));
create policy "qr staff read" on public.qr_codes for select to authenticated using (public.has_permission(tenant_id, 'form.manage'));
create policy "duplicates scoped read" on public.duplicate_candidates for select to authenticated using (public.has_permission(tenant_id, 'duplicate.manage'));
create policy "imports scoped read" on public.import_jobs for select to authenticated using (public.has_permission(tenant_id, 'import.people'));
create policy "exports scoped read" on public.export_jobs for select to authenticated using (public.has_permission(tenant_id, case when sensitive then 'people.export_sensitive' else 'people.export_basic' end));
create policy "activity signals scoped read" on public.person_activity_signals for select to authenticated using (public.has_permission(tenant_id, 'people.view'));
create policy "consent types read" on public.consent_types for select to authenticated using (true);
create policy "lifecycle stages scoped read" on public.lifecycle_stages for select to authenticated using (tenant_id is null or public.has_permission(tenant_id, 'people.view'));

insert into public.consent_types (key, label, sensitive) values
('phone','Phone calls',false),
('sms','SMS',false),
('whatsapp','WhatsApp',false),
('email','Email',false),
('announcements','Church announcements',false),
('programme_invites','Programme invitations',false),
('pastoral_follow_up','Pastoral follow-up',true),
('prayer_request','Prayer-request handling',true),
('photo_media','Photographs and media',true),
('emergency_contact','Emergency contact',true),
('data_sharing','Data sharing within authorized church operations',true)
on conflict (key) do update set label = excluded.label, sensitive = excluded.sensitive;

insert into public.permissions (key, description, group_key, label, sensitive) values
('people.view','View people profiles','members_visitors','View people',false),
('people.create','Create people profiles','members_visitors','Create people',false),
('people.update','Update people profiles','members_visitors','Update people',false),
('people.archive','Archive people profiles','members_visitors','Archive people',true),
('people.merge','Merge duplicate people','members_visitors','Merge duplicates',true),
('people.export_basic','Export basic people data','members_visitors','Export basic people',true),
('people.export_sensitive','Export sensitive people data','members_visitors','Export sensitive people',true),
('people.export_children','Export child records','members_visitors','Export child records',true),
('people.export_all_branches','Export all branches','members_visitors','Export all branches',true),
('household.view','View households','members_visitors','View households',false),
('household.manage','Manage households','members_visitors','Manage households',false),
('new_convert.create','Create new convert records','members_visitors','Create new converts',false),
('follow_up.view','View follow-up','members_visitors','View follow-up',false),
('follow_up.assign','Assign follow-up','members_visitors','Assign follow-up',true),
('follow_up.manage','Manage follow-up','members_visitors','Manage follow-up',true),
('follow_up.view_notes','View follow-up private notes','members_visitors','View follow-up notes',true),
('consent.view','View consent','members_visitors','View consent',false),
('consent.manage','Manage consent','members_visitors','Manage consent',true),
('transfer.create','Create transfers','members_visitors','Create transfers',false),
('transfer.approve','Approve transfers','members_visitors','Approve transfers',true),
('child.view_basic','View basic child records','members_visitors','View child basics',true),
('child.view_sensitive','View sensitive child records','members_visitors','View child sensitive data',true),
('child.manage','Manage child records','members_visitors','Manage child records',true),
('child.export','Export child records','members_visitors','Export child records',true),
('guardian.manage','Manage guardians','members_visitors','Manage guardians',true),
('form.manage','Manage people forms','members_visitors','Manage people forms',false),
('import.people','Import people','members_visitors','Import people',true),
('duplicate.manage','Manage duplicates','members_visitors','Manage duplicates',true)
on conflict (key) do update set description = excluded.description, group_key = excluded.group_key, label = excluded.label, sensitive = excluded.sensitive;
