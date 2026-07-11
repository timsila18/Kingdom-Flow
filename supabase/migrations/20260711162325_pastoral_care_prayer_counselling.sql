create extension if not exists pgcrypto;

create table pastoral_case_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  default_sensitivity text not null check (default_sensitivity in ('general','restricted','highly_confidential','safeguarding','welfare_finance','professional_referral')),
  responsible_permissions text[] not null default '{}',
  referral_rule_id uuid,
  approval_workflow_id uuid,
  escalation_hours integer not null default 24 check (escalation_hours > 0),
  anonymous_intake_allowed boolean not null default false,
  retention_months integer not null default 60 check (retention_months > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table pastoral_cases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  branch_id uuid references branches(id),
  organization_unit_id uuid references organization_units(id),
  case_number text not null,
  title text not null,
  subject_person_id uuid references people(id),
  household_id uuid references households(id),
  category_id uuid not null references pastoral_case_categories(id),
  subcategory text,
  sensitivity text not null check (sensitivity in ('general','restricted','highly_confidential','safeguarding','welfare_finance','professional_referral')),
  confidentiality text not null check (confidentiality in ('general','restricted','highly_confidential','safeguarding','welfare_finance','professional_referral')),
  urgency text not null check (urgency in ('routine','soon','urgent','immediate')),
  risk_level text not null check (risk_level in ('low','moderate','high','critical')),
  source text not null,
  intake_channel text not null,
  assigned_worker_id uuid references profiles(id),
  assigned_pastor_id uuid references profiles(id),
  supervising_pastor_id uuid references profiles(id),
  specialist_referral_id uuid,
  status text not null check (status in ('new','triage','awaiting_assignment','assigned','active','awaiting_member_response','awaiting_referral','referred','awaiting_approval','follow_up','monitoring','resolved','closed','withdrawn','archived','reopened')),
  stage text not null,
  next_action text,
  next_action_due_at timestamptz,
  consent_status text not null check (consent_status in ('granted','pending','declined','emergency_override')),
  communication_preference text,
  summary text not null,
  restricted_note_preview text,
  public_safe_summary text,
  opened_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  closed_at timestamptz,
  closure_reason text,
  outcome_category text,
  branch_visibility text not null default 'assigned' check (branch_visibility in ('assigned','team','branch','tenant_metadata','anonymous_statistics')),
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, case_number)
);

create table pastoral_case_people (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  case_id uuid not null references pastoral_cases(id) on delete cascade,
  person_id uuid not null references people(id),
  relationship_to_case text not null,
  visibility text not null default 'case_team',
  created_at timestamptz not null default now(),
  unique (case_id, person_id, relationship_to_case)
);

create table pastoral_case_status_history (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  case_id uuid not null references pastoral_cases(id) on delete cascade,
  previous_status text,
  new_status text not null,
  reason text not null,
  changed_by uuid references profiles(id),
  changed_at timestamptz not null default now()
);

create table pastoral_case_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  case_id uuid not null references pastoral_cases(id) on delete cascade,
  assigned_user_id uuid not null references profiles(id),
  assignment_type text not null check (assignment_type in ('worker','pastor','supervisor','specialist','welfare','safeguarding')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  assigned_by uuid references profiles(id),
  active boolean not null default true
);

create table pastoral_case_access_grants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  case_id uuid not null references pastoral_cases(id) on delete cascade,
  user_id uuid references profiles(id),
  role_id uuid references roles(id),
  permissions text[] not null,
  reason text not null,
  granted_by uuid references profiles(id),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  active boolean not null default true,
  check (user_id is not null or role_id is not null)
);

create table pastoral_case_access_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  case_id uuid not null references pastoral_cases(id) on delete cascade,
  actor_user_id uuid references profiles(id),
  access_type text not null,
  reason text,
  safe_summary text,
  downloaded boolean not null default false,
  created_at timestamptz not null default now()
);

create table pastoral_notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  case_id uuid not null references pastoral_cases(id) on delete cascade,
  session_id uuid,
  referral_id uuid,
  author_user_id uuid not null references profiles(id),
  note_type text not null,
  visibility text not null,
  sensitivity text not null check (sensitivity in ('general','restricted','highly_confidential','safeguarding','welfare_finance','professional_referral')),
  content text not null,
  member_visible_summary text,
  editable_until timestamptz,
  amended boolean not null default false,
  amendment_reason text,
  export_prohibited boolean not null default true,
  access_reason_required boolean not null default true,
  created_at timestamptz not null default now()
);

create table pastoral_note_versions (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references pastoral_notes(id) on delete cascade,
  version integer not null,
  content text not null,
  amended_by uuid references profiles(id),
  amendment_reason text not null,
  created_at timestamptz not null default now(),
  unique (note_id, version)
);

create table pastoral_case_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  case_id uuid not null references pastoral_cases(id) on delete cascade,
  assigned_user_id uuid not null references profiles(id),
  due_at timestamptz not null,
  priority text not null check (priority in ('routine','soon','urgent','immediate')),
  task_type text not null,
  description text not null,
  visibility text not null,
  status text not null check (status in ('pending','accepted','completed','overdue','cancelled')),
  completion_note text,
  escalated boolean not null default false,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table care_plans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  case_id uuid not null references pastoral_cases(id) on delete cascade,
  goals text[] not null,
  target_date date,
  status text not null check (status in ('draft','active','review_due','completed','closed')),
  review_date date,
  consent_status text not null,
  closure_criteria text,
  created_at timestamptz not null default now()
);

create table care_plan_actions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  care_plan_id uuid not null references care_plans(id) on delete cascade,
  responsible_user_id uuid references profiles(id),
  action text not null,
  target_date date,
  status text not null default 'pending'
);

create table prayer_teams (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  branch_id uuid references branches(id),
  scope text not null,
  leader_user_ids uuid[] not null default '{}',
  member_user_ids uuid[] not null default '{}',
  confidentiality_clearance text[] not null default '{}',
  prayer_categories_handled text[] not null default '{}',
  availability text not null default 'available',
  assignment_capacity integer not null default 5,
  language text not null default 'en',
  active boolean not null default true
);

create table prayer_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  person_id uuid references people(id),
  household_id uuid references households(id),
  title text not null,
  details text not null,
  category text not null,
  confidentiality_preference text not null,
  preferred_prayer_team_id uuid references prayer_teams(id),
  branch_id uuid references branches(id),
  urgent boolean not null default false,
  permission_to_contact boolean not null default false,
  permission_to_share boolean not null default false,
  review_at date,
  status text not null,
  testimony_id uuid,
  created_at timestamptz not null default now()
);

create table prayer_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  request_id uuid not null references prayer_requests(id) on delete cascade,
  team_id uuid not null references prayer_teams(id),
  assigned_by uuid references profiles(id),
  assigned_at timestamptz not null default now(),
  status text not null
);

create table prayer_follow_ups (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references prayer_requests(id) on delete cascade,
  prayed_at timestamptz not null,
  team_id uuid references prayer_teams(id),
  non_sensitive_note text,
  contact_requested boolean not null default false,
  pastoral_referral_needed boolean not null default false,
  remains_active boolean not null default true,
  next_review_at date,
  closure_status text
);

create table testimonies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  person_id uuid references people(id),
  title text not null,
  testimony_narrative text not null,
  related_prayer_request_id uuid references prayer_requests(id),
  related_case_id uuid references pastoral_cases(id),
  branch_id uuid references branches(id),
  permission_to_contact boolean not null default false,
  permission_to_edit boolean not null default false,
  permission_to_publish boolean not null default false,
  preferred_anonymity text not null,
  photo_video_consent boolean not null default false,
  publication_channels text[] not null default '{}',
  reviewer_user_id uuid references profiles(id),
  status text not null,
  approved_version text,
  publication_date date
);

create table testimony_consents (
  id uuid primary key default gen_random_uuid(),
  testimony_id uuid not null references testimonies(id) on delete cascade,
  consent_type text not null,
  granted boolean not null,
  recorded_by uuid references profiles(id),
  recorded_at timestamptz not null default now()
);

create table testimony_reviews (
  id uuid primary key default gen_random_uuid(),
  testimony_id uuid not null references testimonies(id) on delete cascade,
  reviewer_user_id uuid not null references profiles(id),
  decision text not null,
  confidentiality_checked boolean not null default false,
  restricted_details_removed boolean not null default false,
  comment text,
  reviewed_at timestamptz not null default now()
);

create table counselling_appointments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  case_id uuid references pastoral_cases(id),
  person_id uuid references people(id),
  assigned_counsellor_id uuid references profiles(id),
  branch_id uuid references branches(id),
  location text,
  mode text not null check (mode in ('online','physical')),
  starts_at timestamptz,
  duration_minutes integer,
  category text,
  requested_counsellor_id uuid references profiles(id),
  language text,
  gender_preference text,
  urgency text not null,
  confidentiality_level text not null,
  consent_status text not null,
  status text not null,
  reminder_settings jsonb not null default '{}',
  follow_up_action text
);

create table counselling_sessions (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references counselling_appointments(id) on delete cascade,
  attending_pastoral_worker_id uuid references profiles(id),
  session_date date not null,
  duration_minutes integer,
  general_outcome_category text,
  next_action text,
  follow_up_date date,
  referral_required boolean not null default false,
  consent_notes text,
  restricted_session_note_id uuid references pastoral_notes(id),
  member_visible_action_summary text,
  safeguarding_flag boolean not null default false,
  closure_recommendation text
);

create table pastoral_visits (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  case_id uuid references pastoral_cases(id),
  subject_person_id uuid references people(id),
  visit_type text not null,
  location text not null,
  institution text,
  assigned_visitor_id uuid references profiles(id),
  visit_at timestamptz,
  visit_status text not null,
  transport_needs text,
  consent_status text not null,
  contact_person text,
  visit_purpose text,
  outcome text,
  next_action text,
  follow_up text,
  restricted_note_id uuid references pastoral_notes(id),
  expenses_placeholder text
);

create table bereavement_cases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  case_id uuid not null references pastoral_cases(id),
  deceased_person_id uuid references people(id),
  affected_household_id uuid references households(id),
  primary_family_contact_person_id uuid references people(id),
  branch_id uuid references branches(id),
  date_of_death date not null,
  funeral_date date,
  burial_location text,
  assigned_pastor_id uuid references profiles(id),
  assigned_support_team uuid[] not null default '{}',
  visitation_schedule text,
  welfare_support text,
  transport_support text,
  programme_support text,
  announcements_consent boolean not null default false,
  family_communication_preference text,
  restricted_notes text,
  case_status text not null,
  suppress_ordinary_messages boolean not null default true
);

create table welfare_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  case_id uuid references pastoral_cases(id),
  applicant_person_id uuid references people(id),
  beneficiary_person_id uuid references people(id),
  household_id uuid references households(id),
  request_category text not null,
  amount_requested numeric(14,2),
  non_financial_support_requested text,
  urgency text not null,
  reason text not null,
  documents text[] not null default '{}',
  assigned_welfare_officer_id uuid references profiles(id),
  assessment text,
  recommendation text,
  approval_status text not null,
  approved_support text,
  payment_or_provision_status text not null default 'reserved_for_finance_phase',
  follow_up date,
  outcome text,
  confidentiality_level text not null
);

create table welfare_assessments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references welfare_requests(id) on delete cascade,
  assessed_by uuid references profiles(id),
  immediate_need text,
  household_impact text,
  previous_support text,
  alternative_support_sources text,
  requested_duration text,
  non_financial_intervention text,
  referral_to_employment_or_training text,
  recommendation text,
  urgency text,
  safeguarding_concern boolean not null default false,
  follow_up_date date
);

create table welfare_recommendations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references welfare_requests(id) on delete cascade,
  recommended_by uuid references profiles(id),
  recommendation text not null,
  amount_recommended numeric(14,2),
  approval_required boolean not null default true,
  created_at timestamptz not null default now()
);

create table professional_referrals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  case_id uuid not null references pastoral_cases(id),
  referral_type text not null,
  referral_reason text not null,
  consent_status text not null,
  urgency text not null,
  referred_service text not null,
  contact_information text,
  referring_pastor_id uuid references profiles(id),
  referred_at timestamptz not null default now(),
  documents_shared text[] not null default '{}',
  sharing_basis text not null,
  follow_up_date date,
  outcome_status text,
  restricted_notes text,
  provider_verification text not null check (provider_verification in ('church_approved','independently_supplied','unverified','internal','external'))
);

create table pastoral_referrals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  case_id uuid not null references pastoral_cases(id),
  referring_user_id uuid references profiles(id),
  receiving_user_id uuid references profiles(id),
  receiving_role_id uuid references roles(id),
  referral_direction text not null,
  reason text not null,
  urgency text not null,
  summary text not null,
  information_shared text[] not null,
  permissions_granted text[] not null,
  consent_status text not null,
  due_at timestamptz,
  status text not null,
  decision text,
  next_action text,
  return_notes text,
  escalation_history text[] not null default '{}',
  access_expires_at timestamptz
);

create table pastoral_referral_shared_items (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references pastoral_referrals(id) on delete cascade,
  item_type text not null,
  item_id uuid,
  safe_summary text,
  shared_by uuid references profiles(id),
  shared_at timestamptz not null default now()
);

create table safeguarding_cases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  case_id uuid not null references pastoral_cases(id),
  safeguarding_category text not null,
  raised_by uuid references profiles(id),
  assigned_safeguarding_user_id uuid references profiles(id),
  accused_person_id uuid references people(id),
  urgency text not null check (urgency in ('urgent','immediate')),
  status text not null,
  external_referral_required boolean not null default false,
  emergency_message text not null
);

create table safeguarding_actions (
  id uuid primary key default gen_random_uuid(),
  safeguarding_case_id uuid not null references safeguarding_cases(id) on delete cascade,
  action_type text not null,
  actor_user_id uuid references profiles(id),
  safe_summary text not null,
  created_at timestamptz not null default now()
);

create table case_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  case_id uuid references pastoral_cases(id),
  document_type text not null,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  restricted boolean not null default true,
  retention_policy text,
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table case_reminders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  case_id uuid references pastoral_cases(id),
  reminder_type text not null,
  due_at timestamptz not null,
  assigned_user_id uuid references profiles(id),
  status text not null default 'pending'
);

create table case_feedback (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  case_id uuid references pastoral_cases(id),
  person_id uuid references people(id),
  feedback text not null,
  consent_to_contact boolean not null default false,
  created_at timestamptz not null default now()
);

create index pastoral_cases_tenant_status_idx on pastoral_cases(tenant_id, status);
create index pastoral_cases_branch_idx on pastoral_cases(tenant_id, branch_id);
create index pastoral_cases_assignment_idx on pastoral_cases(tenant_id, assigned_worker_id, assigned_pastor_id);
create index pastoral_cases_confidentiality_idx on pastoral_cases(tenant_id, confidentiality);
create index pastoral_notes_case_idx on pastoral_notes(case_id, sensitivity);
create index prayer_requests_tenant_status_idx on prayer_requests(tenant_id, status);
create index welfare_requests_tenant_status_idx on welfare_requests(tenant_id, approval_status);
create index pastoral_referrals_recipient_idx on pastoral_referrals(tenant_id, receiving_user_id, status);
create index safeguarding_cases_tenant_status_idx on safeguarding_cases(tenant_id, status);

alter table pastoral_case_categories enable row level security;
alter table pastoral_cases enable row level security;
alter table pastoral_case_people enable row level security;
alter table pastoral_case_status_history enable row level security;
alter table pastoral_case_assignments enable row level security;
alter table pastoral_case_access_grants enable row level security;
alter table pastoral_case_access_logs enable row level security;
alter table pastoral_notes enable row level security;
alter table pastoral_note_versions enable row level security;
alter table pastoral_case_tasks enable row level security;
alter table care_plans enable row level security;
alter table care_plan_actions enable row level security;
alter table prayer_teams enable row level security;
alter table prayer_requests enable row level security;
alter table prayer_assignments enable row level security;
alter table prayer_follow_ups enable row level security;
alter table testimonies enable row level security;
alter table testimony_consents enable row level security;
alter table testimony_reviews enable row level security;
alter table counselling_appointments enable row level security;
alter table counselling_sessions enable row level security;
alter table pastoral_visits enable row level security;
alter table bereavement_cases enable row level security;
alter table welfare_requests enable row level security;
alter table welfare_assessments enable row level security;
alter table welfare_recommendations enable row level security;
alter table professional_referrals enable row level security;
alter table pastoral_referrals enable row level security;
alter table pastoral_referral_shared_items enable row level security;
alter table safeguarding_cases enable row level security;
alter table safeguarding_actions enable row level security;
alter table case_documents enable row level security;
alter table case_reminders enable row level security;
alter table case_feedback enable row level security;

create policy pastoral_case_category_tenant_members
  on pastoral_case_categories for select
  using (tenant_id in (select tenant_id from memberships where user_id = auth.uid() and status = 'active'));

create policy pastoral_cases_assigned_or_granted
  on pastoral_cases for select
  using (
    tenant_id in (select tenant_id from memberships where user_id = auth.uid() and status = 'active')
    and confidentiality <> 'safeguarding'
    and (
      assigned_worker_id = auth.uid()
      or assigned_pastor_id = auth.uid()
      or supervising_pastor_id = auth.uid()
      or exists (
        select 1 from pastoral_case_access_grants g
        where g.case_id = pastoral_cases.id
          and g.user_id = auth.uid()
          and g.active
          and g.starts_at <= now()
          and (g.expires_at is null or g.expires_at > now())
      )
    )
  );

create policy pastoral_cases_insert_active_tenant_members
  on pastoral_cases for insert
  with check (tenant_id in (select tenant_id from memberships where user_id = auth.uid() and status = 'active'));

create policy pastoral_case_related_assigned
  on pastoral_case_people for select
  using (exists (select 1 from pastoral_cases c where c.id = case_id and c.tenant_id = tenant_id));

create policy pastoral_assignments_assigned_users
  on pastoral_case_assignments for select
  using (
    tenant_id in (select tenant_id from memberships where user_id = auth.uid() and status = 'active')
    and (assigned_user_id = auth.uid() or exists (select 1 from pastoral_cases c where c.id = case_id and c.supervising_pastor_id = auth.uid()))
  );

create policy pastoral_access_grants_recipient
  on pastoral_case_access_grants for select
  using (tenant_id in (select tenant_id from memberships where user_id = auth.uid() and status = 'active') and (user_id = auth.uid() or granted_by = auth.uid()));

create policy pastoral_notes_general_or_explicit
  on pastoral_notes for select
  using (
    tenant_id in (select tenant_id from memberships where user_id = auth.uid() and status = 'active')
    and sensitivity not in ('safeguarding','welfare_finance','restricted','highly_confidential')
    and exists (select 1 from pastoral_cases c where c.id = case_id and (c.assigned_worker_id = auth.uid() or c.assigned_pastor_id = auth.uid() or c.supervising_pastor_id = auth.uid()))
  );

create policy pastoral_notes_explicit_grants
  on pastoral_notes for select
  using (
    exists (
      select 1 from pastoral_case_access_grants g
      where g.case_id = pastoral_notes.case_id
        and g.user_id = auth.uid()
        and g.active
        and g.starts_at <= now()
        and (g.expires_at is null or g.expires_at > now())
        and ('pastoral_case.view_restricted_notes' = any(g.permissions) or 'pastoral_case.view_highly_confidential' = any(g.permissions))
    )
  );

create policy prayer_requests_assigned_team
  on prayer_requests for select
  using (
    tenant_id in (select tenant_id from memberships where user_id = auth.uid() and status = 'active')
    and exists (
      select 1 from prayer_assignments a
      join prayer_teams t on t.id = a.team_id
      where a.request_id = prayer_requests.id
        and (auth.uid() = any(t.leader_user_ids) or auth.uid() = any(t.member_user_ids))
    )
  );

create policy public_prayer_insert_only
  on prayer_requests for insert
  with check (true);

create policy testimonies_reviewer_only
  on testimonies for select
  using (tenant_id in (select tenant_id from memberships where user_id = auth.uid() and status = 'active') and (reviewer_user_id = auth.uid() or person_id = auth.uid()));

create policy counselling_assigned_only
  on counselling_appointments for select
  using (tenant_id in (select tenant_id from memberships where user_id = auth.uid() and status = 'active') and (assigned_counsellor_id = auth.uid() or exists (select 1 from pastoral_cases c where c.id = case_id and c.assigned_pastor_id = auth.uid())));

create policy welfare_assigned_only
  on welfare_requests for select
  using (tenant_id in (select tenant_id from memberships where user_id = auth.uid() and status = 'active') and (assigned_welfare_officer_id = auth.uid() or exists (select 1 from pastoral_cases c where c.id = case_id and c.assigned_pastor_id = auth.uid())));

create policy pastoral_referrals_recipient_or_referrer
  on pastoral_referrals for select
  using (tenant_id in (select tenant_id from memberships where user_id = auth.uid() and status = 'active') and (referring_user_id = auth.uid() or receiving_user_id = auth.uid()));

create policy safeguarding_dedicated_access
  on safeguarding_cases for select
  using (
    tenant_id in (select tenant_id from memberships where user_id = auth.uid() and status = 'active')
    and assigned_safeguarding_user_id = auth.uid()
  );

create policy case_documents_no_public_read
  on case_documents for select
  using (
    tenant_id in (select tenant_id from memberships where user_id = auth.uid() and status = 'active')
    and exists (
      select 1 from pastoral_cases c
      where c.id = case_documents.case_id
        and c.confidentiality <> 'safeguarding'
        and (c.assigned_worker_id = auth.uid() or c.assigned_pastor_id = auth.uid() or c.supervising_pastor_id = auth.uid())
    )
  );
