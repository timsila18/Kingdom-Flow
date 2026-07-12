create table public.programme_types (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key text not null,
  display_name text not null,
  default_approval_workflow_id uuid,
  default_certificate_rule text,
  default_fee_treatment text not null default 'manual_direct_to_church',
  default_progression_rule text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, key)
);

create table public.programmes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  organization_unit_id uuid references public.organization_units(id),
  programme_type_id uuid references public.programme_types(id),
  code text not null,
  title text not null,
  subtitle text,
  description text not null,
  objectives text[] not null default '{}',
  target_audience text,
  eligibility_summary text,
  age_requirement text,
  prerequisite_summary text,
  learning_outcomes text[] not null default '{}',
  duration_summary text,
  delivery_mode text not null,
  branch_availability uuid[] not null default '{}',
  language text not null default 'en',
  capacity integer not null default 0 check (capacity >= 0),
  enrolment_opens_at date,
  enrolment_closes_at date,
  start_date date,
  end_date date,
  status text not null default 'draft',
  publication_status text not null default 'private',
  fee_model text not null default 'free',
  price numeric(14,2) not null default 0 check (price >= 0),
  currency text not null default 'KES',
  technology_fee_treatment text not null default 'manual_direct_to_church',
  scholarship_available boolean not null default false,
  refund_policy text,
  certificate_available boolean not null default false,
  graduation_requirement text,
  approval_workflow_id uuid,
  owner_user_id uuid references public.profiles(id),
  coordinator_user_id uuid references public.profiles(id),
  lead_trainer_user_id uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (tenant_id, code)
);

create table public.programme_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  programme_id uuid not null references public.programmes(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  effective_date date not null,
  curriculum_changes text[] not null default '{}',
  fee_changes text[] not null default '{}',
  created_by uuid references public.profiles(id),
  approved_by uuid references public.profiles(id),
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  unique (programme_id, version_number)
);

create table public.programme_modules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  programme_version_id uuid not null references public.programme_versions(id) on delete cascade,
  title text not null,
  description text,
  sort_order integer not null default 1
);

create table public.programme_lessons (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  module_id uuid not null references public.programme_modules(id) on delete cascade,
  title text not null,
  objective text,
  summary text,
  trainer_user_id uuid references public.profiles(id),
  duration_minutes integer not null default 60 check (duration_minutes > 0),
  delivery_mode text not null,
  scripture_references text[] not null default '{}',
  prerequisite_lesson_id uuid references public.programme_lessons(id),
  release_date date,
  due_date date,
  attendance_required boolean not null default false
);

create table public.programme_cohorts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  programme_id uuid not null references public.programmes(id) on delete cascade,
  programme_version_id uuid not null references public.programme_versions(id),
  name text not null,
  code text not null,
  branch_id uuid references public.branches(id),
  trainer_user_ids uuid[] not null default '{}',
  start_date date,
  end_date date,
  schedule text,
  capacity integer not null default 0 check (capacity >= 0),
  venue text,
  online_link text,
  enrolment_status text not null default 'planned',
  application_deadline date,
  waitlist_enabled boolean not null default true,
  status text not null default 'planned',
  graduation_date date,
  reporting_unit_id uuid references public.organization_units(id),
  unique (tenant_id, code)
);

create table public.programme_trainer_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  programme_id uuid references public.programmes(id) on delete cascade,
  cohort_id uuid references public.programme_cohorts(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  person_id uuid references public.people(id),
  role text not null,
  branch_id uuid references public.branches(id),
  start_date date not null,
  end_date date,
  permission_keys text[] not null default '{}',
  approval_request_id uuid,
  status text not null default 'proposed'
);

create table public.programme_trainer_qualifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  experience_summary text,
  internal_certification text[] not null default '{}',
  ministry_role text,
  subjects_taught text[] not null default '{}',
  languages text[] not null default '{}',
  availability text,
  approved_programme_ids uuid[] not null default '{}',
  branch_scope uuid[] not null default '{}',
  background_check_status text not null default 'placeholder_not_checked',
  safeguarding_clearance_status text not null default 'placeholder_not_checked'
);

create table public.programme_applications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id),
  programme_id uuid not null references public.programmes(id),
  programme_version_id uuid not null references public.programme_versions(id),
  cohort_id uuid not null references public.programme_cohorts(id),
  branch_id uuid references public.branches(id),
  application_date date not null default current_date,
  source text not null,
  consent boolean not null default false,
  status text not null default 'submitted',
  eligibility_status text not null default 'not_checked',
  prerequisite_status text not null default 'not_checked',
  approval_status text not null default 'pending',
  payment_status text not null default 'pending',
  scholarship_status text not null default 'not_requested',
  assigned_mentor_user_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.programme_enrolments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  application_id uuid references public.programme_applications(id),
  person_id uuid not null references public.people(id),
  programme_id uuid not null references public.programmes(id),
  programme_version_id uuid not null references public.programme_versions(id),
  cohort_id uuid not null references public.programme_cohorts(id),
  status text not null default 'enrolled',
  start_date date,
  completion_date date,
  outstanding_balance numeric(14,2) not null default 0 check (outstanding_balance >= 0),
  progress_percent integer not null default 0 check (progress_percent between 0 and 100)
);

create table public.programme_eligibility_results (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  application_id uuid not null references public.programme_applications(id) on delete cascade,
  eligible boolean not null default false,
  reasons text[] not null default '{}',
  missing_requirements text[] not null default '{}',
  override_by_user_id uuid references public.profiles(id),
  override_reason text,
  created_at timestamptz not null default now()
);

create table public.programme_scholarships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  application_id uuid references public.programme_applications(id),
  person_id uuid not null references public.people(id),
  programme_id uuid not null references public.programmes(id),
  type text not null,
  amount numeric(14,2) not null default 0 check (amount >= 0),
  percentage numeric(5,2) not null default 0 check (percentage >= 0 and percentage <= 100),
  sponsor text,
  restricted_reason text,
  requested_at timestamptz not null default now(),
  assessed_by_user_id uuid references public.profiles(id),
  approved_by_user_id uuid references public.profiles(id),
  expires_at timestamptz,
  status text not null default 'requested'
);

create table public.programme_fee_rules (
  id uuid primary key default gen_random_uuid(),
  version integer not null unique,
  effective_from date not null,
  effective_to date,
  bands jsonb not null,
  updated_by_user_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.programme_payment_destinations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  label text not null,
  purpose text not null,
  branch_id uuid references public.branches(id),
  programme_id uuid references public.programmes(id),
  method text not null,
  paybill_or_till text,
  account_instruction text,
  bank_name text,
  account_name text,
  account_number text,
  currency text not null default 'KES',
  payment_reference_rule text,
  verification_status text not null default 'unverified',
  active boolean not null default true
);

create table public.programme_payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  application_id uuid references public.programme_applications(id),
  person_id uuid not null references public.people(id),
  programme_id uuid not null references public.programmes(id),
  cohort_id uuid not null references public.programme_cohorts(id),
  fee_amount numeric(14,2) not null default 0 check (fee_amount >= 0),
  technology_fee numeric(14,2) not null default 0 check (technology_fee >= 0),
  provider_fee numeric(14,2) not null default 0 check (provider_fee >= 0),
  total_paid numeric(14,2) not null default 0 check (total_paid >= 0),
  church_amount numeric(14,2) not null default 0 check (church_amount >= 0),
  payment_destination_id uuid references public.programme_payment_destinations(id),
  payment_method text not null,
  transaction_reference text,
  payment_date timestamptz,
  verification_status text not null default 'pending',
  verified_by_user_id uuid references public.profiles(id),
  receipt_status text not null default 'not_issued',
  refund_status text not null default 'none',
  status text not null default 'pending',
  notes text,
  unique (tenant_id, transaction_reference)
);

create table public.programme_refunds (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  payment_id uuid not null references public.programme_payments(id),
  reason text not null,
  amount numeric(14,2) not null check (amount >= 0),
  approver_user_id uuid references public.profiles(id),
  refund_method text,
  status text not null default 'requested',
  created_at timestamptz not null default now()
);

create table public.programme_materials (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  programme_version_id uuid not null references public.programme_versions(id),
  title text not null,
  type text not null,
  storage_status text not null default 'placeholder',
  release_date date,
  expires_at timestamptz,
  download_permission text,
  copyright_owner text
);

create table public.programme_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  cohort_id uuid not null references public.programme_cohorts(id) on delete cascade,
  lesson_id uuid references public.programme_lessons(id),
  session_date date not null,
  start_time time,
  end_time time,
  trainer_user_id uuid references public.profiles(id),
  venue_or_link text,
  capacity integer not null default 0,
  attendance_status text not null default 'not_started',
  material_ids uuid[] not null default '{}',
  report_status text not null default 'not_started'
);

create table public.programme_attendance (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  enrolment_id uuid not null references public.programme_enrolments(id) on delete cascade,
  session_id uuid not null references public.programme_sessions(id) on delete cascade,
  status text not null,
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  recorded_by_user_id uuid references public.profiles(id),
  source text not null,
  notes text
);

create table public.programme_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  programme_id uuid not null references public.programmes(id),
  module_id uuid references public.programme_modules(id),
  lesson_id uuid references public.programme_lessons(id),
  title text not null,
  instructions text,
  release_date date,
  due_date date,
  allowed_formats text[] not null default '{}',
  max_file_size_mb integer not null default 5,
  grading_method text not null,
  pass_mark numeric(6,2) not null default 0,
  resubmission_allowed boolean not null default false,
  active boolean not null default true
);

create table public.programme_assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  assignment_id uuid not null references public.programme_assignments(id),
  enrolment_id uuid not null references public.programme_enrolments(id),
  submitted_at timestamptz not null default now(),
  status text not null default 'submitted',
  grade numeric(8,2),
  passed boolean,
  feedback text,
  reviewed_by_user_id uuid references public.profiles(id)
);

create table public.programme_assessments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  programme_id uuid not null references public.programmes(id),
  title text not null,
  type text not null,
  pass_mark numeric(6,2) not null default 0,
  weight numeric(6,2) not null default 0,
  attempts_allowed integer not null default 1,
  grading_method text not null,
  moderation_required boolean not null default false,
  result_visibility text not null default 'hidden'
);

create table public.programme_assessment_questions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  assessment_id uuid not null references public.programme_assessments(id) on delete cascade,
  question_type text not null,
  prompt text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer jsonb,
  sort_order integer not null default 1
);

create table public.programme_assessment_results (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  assessment_id uuid not null references public.programme_assessments(id),
  enrolment_id uuid not null references public.programme_enrolments(id),
  score numeric(8,2) not null default 0,
  grade text,
  passed boolean not null default false,
  assessor_user_id uuid references public.profiles(id),
  feedback text,
  moderation_status text not null default 'not_required',
  attempt integer not null default 1,
  released_at timestamptz,
  appeal_status text not null default 'none',
  version integer not null default 1
);

create table public.programme_completion_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  programme_version_id uuid not null references public.programme_versions(id),
  attendance_percent integer not null default 0,
  assignment_required boolean not null default false,
  assessment_pass_required boolean not null default false,
  trainer_recommendation_required boolean not null default false,
  fee_clearance_required boolean not null default false,
  certificate_approval_required boolean not null default false
);

create table public.programme_certificates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  enrolment_id uuid not null references public.programme_enrolments(id),
  person_id uuid not null references public.people(id),
  programme_id uuid not null references public.programmes(id),
  certificate_number text not null,
  verification_code text not null unique,
  issued_at timestamptz,
  status text not null default 'draft',
  revoked_reason text,
  pdf_status text not null default 'not_generated'
);

create table public.programme_graduation_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  programme_id uuid references public.programmes(id),
  cohort_id uuid references public.programme_cohorts(id),
  title text not null,
  event_date date,
  status text not null default 'planned'
);

create table public.programme_leadership_pathways (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  active boolean not null default true
);

create table public.programme_leadership_pathway_stages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  pathway_id uuid not null references public.programme_leadership_pathways(id) on delete cascade,
  stage_name text not null,
  prerequisite_programme_id uuid references public.programmes(id),
  service_requirement text,
  role_recommendation text,
  approval_required boolean not null default true,
  sort_order integer not null default 1
);

create table public.programme_mentorships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  mentor_user_id uuid references public.profiles(id),
  mentee_person_id uuid references public.people(id),
  programme_id uuid references public.programmes(id),
  branch_id uuid references public.branches(id),
  start_date date,
  end_date date,
  goals text[] not null default '{}',
  meeting_schedule text,
  progress text,
  confidentiality text not null default 'standard',
  status text not null default 'proposed'
);

create table public.programme_activity_signals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid references public.people(id),
  user_id uuid references public.profiles(id),
  signal_type text not null,
  source_id uuid,
  occurred_at timestamptz not null default now(),
  billable_activity boolean not null default true
);

create index programmes_tenant_status_idx on public.programmes(tenant_id, status, publication_status);
create index programme_enrolments_person_idx on public.programme_enrolments(tenant_id, person_id, status);
create index programme_payments_reference_idx on public.programme_payments(tenant_id, transaction_reference);
create index programme_certificates_verification_idx on public.programme_certificates(verification_code);

alter table public.programme_types enable row level security;
alter table public.programmes enable row level security;
alter table public.programme_versions enable row level security;
alter table public.programme_modules enable row level security;
alter table public.programme_lessons enable row level security;
alter table public.programme_cohorts enable row level security;
alter table public.programme_trainer_assignments enable row level security;
alter table public.programme_trainer_qualifications enable row level security;
alter table public.programme_applications enable row level security;
alter table public.programme_enrolments enable row level security;
alter table public.programme_eligibility_results enable row level security;
alter table public.programme_scholarships enable row level security;
alter table public.programme_fee_rules enable row level security;
alter table public.programme_payment_destinations enable row level security;
alter table public.programme_payments enable row level security;
alter table public.programme_refunds enable row level security;
alter table public.programme_materials enable row level security;
alter table public.programme_sessions enable row level security;
alter table public.programme_attendance enable row level security;
alter table public.programme_assignments enable row level security;
alter table public.programme_assignment_submissions enable row level security;
alter table public.programme_assessments enable row level security;
alter table public.programme_assessment_questions enable row level security;
alter table public.programme_assessment_results enable row level security;
alter table public.programme_completion_rules enable row level security;
alter table public.programme_certificates enable row level security;
alter table public.programme_graduation_events enable row level security;
alter table public.programme_leadership_pathways enable row level security;
alter table public.programme_leadership_pathway_stages enable row level security;
alter table public.programme_mentorships enable row level security;
alter table public.programme_activity_signals enable row level security;

create policy "programme tenant read" on public.programmes for select to authenticated
using (exists (select 1 from public.tenant_memberships tm where tm.tenant_id = programmes.tenant_id and tm.user_id = auth.uid() and tm.status = 'active') and (public.has_permission(tenant_id, 'programme.view') or auth.uid() in (owner_user_id, coordinator_user_id, lead_trainer_user_id)));
create policy "programme public catalogue read" on public.programmes for select to anon
using (publication_status = 'public_page' and status in ('published','enrolment_open','in_progress'));
create policy "programme manage" on public.programmes for all to authenticated
using (public.has_permission(tenant_id, 'programme.manage') or public.has_permission(tenant_id, 'programme.update'))
with check (public.has_permission(tenant_id, 'programme.manage') or public.has_permission(tenant_id, 'programme.create') or public.has_permission(tenant_id, 'programme.update'));

create policy "programme type read" on public.programme_types for select to authenticated
using (exists (select 1 from public.tenant_memberships tm where tm.tenant_id = programme_types.tenant_id and tm.user_id = auth.uid() and tm.status = 'active'));
create policy "programme type manage" on public.programme_types for all to authenticated
using (public.has_permission(tenant_id, 'programme.settings.manage')) with check (public.has_permission(tenant_id, 'programme.settings.manage'));

create policy "programme structure read" on public.programme_versions for select to authenticated using (public.has_permission(tenant_id, 'programme.view') or exists (select 1 from public.programmes p where p.id = programme_id and auth.uid() in (p.owner_user_id,p.coordinator_user_id,p.lead_trainer_user_id)));
create policy "programme modules read" on public.programme_modules for select to authenticated using (exists (select 1 from public.programme_versions pv where pv.id = programme_version_id and public.has_permission(pv.tenant_id, 'programme.view')));
create policy "programme lessons read" on public.programme_lessons for select to authenticated using (exists (select 1 from public.programme_modules pm where pm.id = module_id and public.has_permission(pm.tenant_id, 'programme.view')));

create policy "cohorts read" on public.programme_cohorts for select to authenticated using (public.has_permission(tenant_id, 'programme.view') or auth.uid() = any(trainer_user_ids));
create policy "cohorts manage" on public.programme_cohorts for all to authenticated using (public.has_permission(tenant_id, 'programme.cohort.manage')) with check (public.has_permission(tenant_id, 'programme.cohort.manage'));

create policy "trainer assignments relevant read" on public.programme_trainer_assignments for select to authenticated using (user_id = auth.uid() or public.has_permission(tenant_id, 'programme.trainer.assign') or public.has_permission(tenant_id, 'programme.view'));
create policy "trainer assignments manage" on public.programme_trainer_assignments for all to authenticated using (public.has_permission(tenant_id, 'programme.trainer.assign')) with check (public.has_permission(tenant_id, 'programme.trainer.assign'));

create policy "applications public insert" on public.programme_applications for insert to anon, authenticated
with check (exists (select 1 from public.programmes p where p.id = programme_id and p.tenant_id = tenant_id and p.publication_status in ('catalogue','public_page') and p.status in ('published','enrolment_open')));
create policy "applications scoped read" on public.programme_applications for select to authenticated
using (public.has_permission(tenant_id, 'programme.enrolment.view') or public.has_permission(tenant_id, 'programme.enrolment.manage'));
create policy "applications manage" on public.programme_applications for all to authenticated
using (public.has_permission(tenant_id, 'programme.enrolment.manage')) with check (public.has_permission(tenant_id, 'programme.enrolment.manage'));

create policy "enrolments scoped read" on public.programme_enrolments for select to authenticated
using (public.has_permission(tenant_id, 'programme.enrolment.view') or public.has_permission(tenant_id, 'programme.enrolment.manage'));
create policy "enrolments manage" on public.programme_enrolments for all to authenticated
using (public.has_permission(tenant_id, 'programme.enrolment.manage')) with check (public.has_permission(tenant_id, 'programme.enrolment.manage'));

create policy "eligibility read" on public.programme_eligibility_results for select to authenticated using (public.has_permission(tenant_id, 'programme.enrolment.view'));
create policy "eligibility manage" on public.programme_eligibility_results for all to authenticated using (public.has_permission(tenant_id, 'programme.enrolment.manage')) with check (public.has_permission(tenant_id, 'programme.enrolment.manage'));

create policy "scholarships restricted read" on public.programme_scholarships for select to authenticated using (public.has_permission(tenant_id, 'programme.scholarship.view') or public.has_permission(tenant_id, 'programme.scholarship.manage'));
create policy "scholarships manage" on public.programme_scholarships for all to authenticated using (public.has_permission(tenant_id, 'programme.scholarship.manage') or public.has_permission(tenant_id, 'programme.scholarship.approve')) with check (public.has_permission(tenant_id, 'programme.scholarship.manage') or public.has_permission(tenant_id, 'programme.scholarship.approve'));

create policy "fee rules platform read" on public.programme_fee_rules for select to authenticated using (true);
create policy "payment destinations read" on public.programme_payment_destinations for select to authenticated using (exists (select 1 from public.tenant_memberships tm where tm.tenant_id = programme_payment_destinations.tenant_id and tm.user_id = auth.uid() and tm.status = 'active'));
create policy "payments finance read" on public.programme_payments for select to authenticated using (public.has_permission(tenant_id, 'programme.payment.view') or public.has_permission(tenant_id, 'programme.payment.verify'));
create policy "payments verify" on public.programme_payments for update to authenticated using (public.has_permission(tenant_id, 'programme.payment.verify')) with check (public.has_permission(tenant_id, 'programme.payment.verify'));
create policy "refunds finance" on public.programme_refunds for all to authenticated using (public.has_permission(tenant_id, 'programme.payment.verify')) with check (public.has_permission(tenant_id, 'programme.payment.verify'));

create policy "materials read" on public.programme_materials for select to authenticated using (public.has_permission(tenant_id, 'programme.view'));
create policy "materials manage" on public.programme_materials for all to authenticated using (public.has_permission(tenant_id, 'programme.material.manage')) with check (public.has_permission(tenant_id, 'programme.material.manage'));
create policy "sessions read" on public.programme_sessions for select to authenticated using (public.has_permission(tenant_id, 'programme.view') or trainer_user_id = auth.uid());
create policy "attendance read" on public.programme_attendance for select to authenticated using (public.has_permission(tenant_id, 'programme.attendance.view'));
create policy "attendance capture" on public.programme_attendance for insert to authenticated with check (public.has_permission(tenant_id, 'programme.attendance.capture'));

create policy "assignments read" on public.programme_assignments for select to authenticated using (public.has_permission(tenant_id, 'programme.view'));
create policy "assignments manage" on public.programme_assignments for all to authenticated using (public.has_permission(tenant_id, 'programme.assignment.manage')) with check (public.has_permission(tenant_id, 'programme.assignment.manage'));
create policy "submissions read" on public.programme_assignment_submissions for select to authenticated using (public.has_permission(tenant_id, 'programme.grade') or public.has_permission(tenant_id, 'programme.enrolment.view'));
create policy "submissions grade" on public.programme_assignment_submissions for update to authenticated using (public.has_permission(tenant_id, 'programme.grade')) with check (public.has_permission(tenant_id, 'programme.grade'));

create policy "assessments read" on public.programme_assessments for select to authenticated using (public.has_permission(tenant_id, 'programme.view'));
create policy "assessments manage" on public.programme_assessments for all to authenticated using (public.has_permission(tenant_id, 'programme.assessment.manage')) with check (public.has_permission(tenant_id, 'programme.assessment.manage'));
create policy "results read" on public.programme_assessment_results for select to authenticated using (public.has_permission(tenant_id, 'programme.grade') or public.has_permission(tenant_id, 'programme.result.moderate') or public.has_permission(tenant_id, 'programme.enrolment.view'));
create policy "results release" on public.programme_assessment_results for update to authenticated using (public.has_permission(tenant_id, 'programme.result.release') or public.has_permission(tenant_id, 'programme.result.moderate')) with check (public.has_permission(tenant_id, 'programme.result.release') or public.has_permission(tenant_id, 'programme.result.moderate'));

create policy "completion rules read" on public.programme_completion_rules for select to authenticated using (public.has_permission(tenant_id, 'programme.view'));
create policy "certificates public verification" on public.programme_certificates for select to anon using (status in ('valid','revoked','replaced','expired'));
create policy "certificates read" on public.programme_certificates for select to authenticated using (public.has_permission(tenant_id, 'programme.certificate.issue') or public.has_permission(tenant_id, 'programme.enrolment.view'));
create policy "certificates issue" on public.programme_certificates for all to authenticated using (public.has_permission(tenant_id, 'programme.certificate.issue')) with check (public.has_permission(tenant_id, 'programme.certificate.issue'));

create policy "graduation manage" on public.programme_graduation_events for all to authenticated using (public.has_permission(tenant_id, 'programme.graduation.manage')) with check (public.has_permission(tenant_id, 'programme.graduation.manage'));
create policy "pathways read" on public.programme_leadership_pathways for select to authenticated using (public.has_permission(tenant_id, 'programme.view'));
create policy "pathway stages read" on public.programme_leadership_pathway_stages for select to authenticated using (public.has_permission(tenant_id, 'programme.view'));
create policy "mentorship restricted read" on public.programme_mentorships for select to authenticated using (mentor_user_id = auth.uid() or public.has_permission(tenant_id, 'programme.enrolment.view'));
create policy "activity signals tenant read" on public.programme_activity_signals for select to authenticated using (public.has_permission(tenant_id, 'report.view'));

insert into public.permissions (key, description, group_key, label, sensitive)
values
('programme.archive','Archive programmes without deleting history.','programmes','Archive programmes',true),
('programme.cohort.manage','Manage cohorts and intakes.','programmes','Manage cohorts',false),
('programme.trainer.assign','Assign trainers and facilitators.','programmes','Assign trainers',true),
('programme.enrolment.view','View programme enrolments.','programmes','View enrolments',false),
('programme.enrolment.approve','Approve programme enrolments.','programmes','Approve enrolments',true),
('programme.payment.verify','Verify programme payments.','programmes','Verify programme payments',true),
('programme.scholarship.view','View restricted scholarship summaries.','programmes','View scholarships',true),
('programme.scholarship.manage','Manage scholarships.','programmes','Manage scholarships',true),
('programme.scholarship.approve','Approve scholarships.','programmes','Approve scholarships',true),
('programme.attendance.capture','Capture class attendance.','programmes','Capture attendance',false),
('programme.attendance.view','View class attendance.','programmes','View attendance',false),
('programme.material.manage','Manage learning materials.','programmes','Manage materials',false),
('programme.assignment.manage','Manage assignments.','programmes','Manage assignments',false),
('programme.assessment.manage','Manage assessments.','programmes','Manage assessments',false),
('programme.grade','Grade assignments and assessments.','programmes','Grade learners',true),
('programme.result.release','Release learner results.','programmes','Release results',true),
('programme.result.moderate','Moderate learner results.','programmes','Moderate results',true),
('programme.certificate.issue','Issue certificates.','programmes','Issue certificates',true),
('programme.certificate.revoke','Revoke certificates.','programmes','Revoke certificates',true),
('programme.graduation.manage','Manage graduation.','programmes','Manage graduation',true),
('programme.report.view','View programme reports.','programmes','View programme reports',false),
('programme.report.export','Export programme reports.','programmes','Export programme reports',true),
('programme.settings.manage','Manage programme settings.','programmes','Manage programme settings',true)
on conflict (key) do nothing;
