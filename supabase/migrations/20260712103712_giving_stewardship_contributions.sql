create table public.giving_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  name text not null,
  code text not null,
  description text,
  category_type text not null,
  active_from date,
  active_to date,
  currency text not null default 'KES',
  restricted_fund_required boolean not null default false,
  linked_fund_id uuid,
  linked_project_id uuid,
  linked_programme_id uuid references public.programmes(id),
  linked_event_id uuid references public.events(id),
  linked_department_id uuid references public.departments(id),
  receipt_wording text,
  tax_metadata_placeholder text,
  anonymous_giving_supported boolean not null default true,
  individual_record_supported boolean not null default true,
  total_only_supported boolean not null default false,
  public_visibility boolean not null default false,
  finance_visibility text not null default 'finance_only',
  approval_required boolean not null default false,
  status text not null default 'active',
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, code)
);

create table public.funds (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  name text not null,
  code text not null,
  description text,
  fund_type text not null,
  restricted boolean not null default false,
  purpose text,
  start_date date,
  end_date date,
  target_amount numeric(14,2),
  responsible_officer_user_id uuid references public.profiles(id),
  approval_authority_user_id uuid references public.profiles(id),
  linked_payment_destination_ids uuid[] not null default '{}',
  reporting_visibility text not null default 'summary',
  balance_placeholder numeric(14,2) not null default 0,
  status text not null default 'active',
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, code)
);

alter table public.giving_categories add constraint giving_categories_fund_fk foreign key (linked_fund_id) references public.funds(id);

create table public.fund_restrictions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  fund_id uuid not null references public.funds(id) on delete cascade,
  restriction_type text not null,
  restriction_description text not null,
  source text not null,
  effective_date date not null,
  expiry_date date,
  authorized_release_conditions text,
  approval_requirements text,
  documentation_path text,
  active boolean not null default true
);

create table public.payment_destinations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  label text not null,
  purpose text,
  payment_type text not null,
  paybill_number text,
  till_number text,
  account_number_instructions text,
  bank_name text,
  account_name text,
  account_number text,
  bank_branch text,
  swift_bic text,
  currency text not null default 'KES',
  phone_number text,
  payment_reference_rule text,
  linked_giving_category_ids uuid[] not null default '{}',
  linked_fund_ids uuid[] not null default '{}',
  linked_project_ids uuid[] not null default '{}',
  linked_programme_ids uuid[] not null default '{}',
  linked_event_ids uuid[] not null default '{}',
  active_from date,
  active_to date,
  display_instructions text,
  verification_status text not null default 'unverified',
  verification_notes text,
  status text not null default 'draft',
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payment_destination_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  destination_id uuid not null references public.payment_destinations(id) on delete cascade,
  link_type text not null,
  linked_id uuid not null,
  active boolean not null default true
);

create table public.payment_destination_approvals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  destination_id uuid not null references public.payment_destinations(id) on delete cascade,
  requested_by_user_id uuid references public.profiles(id),
  reviewer_user_id uuid references public.profiles(id),
  approver_user_id uuid references public.profiles(id),
  change_summary text not null,
  status text not null default 'pending_review',
  created_at timestamptz not null default now()
);

create table public.payment_destination_verifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  destination_id uuid not null references public.payment_destinations(id) on delete cascade,
  verification_status text not null,
  verified_by uuid references public.profiles(id),
  verified_at timestamptz,
  method text,
  supporting_document_path text,
  notes text,
  next_review_date date
);

create table public.contributions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  giver_person_id uuid references public.people(id),
  household_id uuid references public.households(id),
  donor_name text,
  anonymous boolean not null default false,
  category_id uuid references public.giving_categories(id),
  fund_id uuid references public.funds(id),
  amount numeric(14,2) not null check (amount >= 0),
  currency text not null default 'KES',
  original_currency text,
  original_amount numeric(14,2),
  exchange_rate_placeholder numeric(18,8),
  rate_source text,
  rate_date date,
  payment_method text not null,
  destination_id uuid references public.payment_destinations(id),
  transaction_reference text,
  contribution_date date not null,
  source text not null,
  service_id uuid references public.services(id),
  group_id uuid references public.small_groups(id),
  event_id uuid references public.events(id),
  programme_id uuid references public.programmes(id),
  pledge_id uuid,
  partnership_id uuid,
  receipt_status text not null default 'draft',
  verification_status text not null default 'unverified',
  reconciliation_status text not null default 'unmatched',
  notes text,
  restricted boolean not null default false,
  created_by uuid references public.profiles(id),
  verified_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index contributions_unique_reference_idx on public.contributions(tenant_id, transaction_reference) where transaction_reference is not null and verification_status not in ('duplicate','reversed','rejected');

create table public.contribution_allocations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contribution_id uuid not null references public.contributions(id) on delete cascade,
  fund_id uuid references public.funds(id),
  category_id uuid references public.giving_categories(id),
  amount numeric(14,2) not null check (amount >= 0),
  restricted boolean not null default false
);

create table public.contribution_sources (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contribution_id uuid not null references public.contributions(id) on delete cascade,
  source_type text not null,
  source_id uuid,
  source_reference text
);

create table public.contribution_verifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contribution_id uuid not null references public.contributions(id) on delete cascade,
  status text not null,
  method text,
  evidence_path text,
  verified_by uuid references public.profiles(id),
  verified_at timestamptz,
  notes text
);

create table public.cash_collection_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  source text not null,
  source_id uuid,
  collection_date date not null,
  expected_amount numeric(14,2) not null default 0,
  counted_amount numeric(14,2) not null default 0,
  denomination_summary text,
  handover_user_id uuid references public.profiles(id),
  receiver_user_id uuid references public.profiles(id),
  discrepancy numeric(14,2),
  discrepancy_reason text,
  deposit_reference text,
  deposit_date date,
  status text not null default 'pending_count',
  evidence_path text
);

create table public.cash_count_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  cash_collection_id uuid not null references public.cash_collection_sessions(id) on delete cascade,
  user_id uuid references public.profiles(id),
  role text not null,
  confirmed_at timestamptz,
  signature_placeholder text
);

create table public.cash_handover_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  cash_collection_id uuid references public.cash_collection_sessions(id),
  source_type text not null,
  source_report_id uuid,
  contribution_id uuid references public.contributions(id),
  discrepancy_status text not null default 'none'
);

create table public.receipt_sequences (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  format text not null,
  current_sequence integer not null default 0,
  active boolean not null default true,
  unique (tenant_id, branch_id, format)
);

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  receipt_number text not null unique,
  contribution_id uuid references public.contributions(id),
  payer_name text not null,
  amount numeric(14,2) not null,
  currency text not null,
  category_id uuid references public.giving_categories(id),
  fund_id uuid references public.funds(id),
  contribution_date date,
  payment_method text,
  transaction_reference text,
  destination_id uuid references public.payment_destinations(id),
  purpose text,
  issued_at timestamptz,
  issued_by uuid references public.profiles(id),
  verification_code text not null unique,
  qr_payload text,
  status text not null default 'draft',
  void_reason text,
  replacement_for_receipt_id uuid references public.receipts(id)
);

create table public.receipt_replacements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  original_receipt_id uuid references public.receipts(id),
  replacement_receipt_id uuid references public.receipts(id),
  reason text not null,
  authorized_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.giver_statements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid references public.people(id),
  household_id uuid references public.households(id),
  start_date date not null,
  end_date date not null,
  total_amount numeric(14,2) not null default 0,
  generated_by uuid references public.profiles(id),
  reason text,
  secure_file_path text,
  status text not null default 'generated'
);

create table public.pledges (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid references public.people(id),
  household_id uuid references public.households(id),
  donor_name text,
  anonymous boolean not null default false,
  confidential boolean not null default true,
  amount numeric(14,2) not null check (amount >= 0),
  currency text not null default 'KES',
  fund_id uuid references public.funds(id),
  start_date date,
  target_date date,
  payment_schedule text,
  frequency text,
  reminder_preference text,
  status text not null default 'draft',
  fulfilled_amount numeric(14,2) not null default 0,
  outstanding_amount numeric(14,2) not null default 0,
  cancellation_reason text,
  notes text,
  consent boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.pledge_schedules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  pledge_id uuid not null references public.pledges(id) on delete cascade,
  schedule_type text not null,
  active boolean not null default true
);

create table public.pledge_instalments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  pledge_id uuid not null references public.pledges(id) on delete cascade,
  due_date date not null,
  amount numeric(14,2) not null default 0,
  paid_amount numeric(14,2) not null default 0,
  contribution_id uuid references public.contributions(id),
  reminder_enabled boolean not null default false,
  grace_period_days integer not null default 0,
  status text not null default 'pending'
);

create table public.partnerships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid references public.people(id),
  partner_name text not null,
  partnership_type text not null,
  amount numeric(14,2) not null default 0,
  frequency text not null,
  start_date date,
  end_date date,
  destination_id uuid references public.payment_destinations(id),
  fund_id uuid references public.funds(id),
  communication_preference text,
  status text not null default 'active',
  consent boolean not null default false,
  statement_preference text
);

create table public.partnership_schedules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  partnership_id uuid not null references public.partnerships(id) on delete cascade,
  due_date date not null,
  amount numeric(14,2) not null default 0,
  contribution_id uuid references public.contributions(id),
  status text not null default 'pending'
);

create table public.organizational_donors (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  contact_label text,
  consent boolean not null default false,
  status text not null default 'active'
);

create table public.in_kind_contributions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  contributor_person_id uuid references public.people(id),
  donor_name text,
  category_id uuid references public.giving_categories(id),
  fund_id uuid references public.funds(id),
  item_description text not null,
  quantity numeric(14,2),
  valuation_placeholder numeric(14,2),
  evidence_path text,
  handover_user_id uuid references public.profiles(id),
  status text not null default 'received'
);

create table public.giving_campaigns (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  fund_id uuid references public.funds(id),
  title text not null,
  description text,
  target_amount numeric(14,2) not null default 0,
  received_amount numeric(14,2) not null default 0,
  public_progress boolean not null default false,
  status text not null default 'draft'
);

create table public.campaign_updates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  campaign_id uuid references public.giving_campaigns(id),
  update_text text not null,
  public boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.refund_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contribution_id uuid references public.contributions(id),
  reason text not null,
  amount numeric(14,2) not null default 0,
  requested_by uuid references public.profiles(id),
  reviewed_by uuid references public.profiles(id),
  approved_by uuid references public.profiles(id),
  method text,
  status text not null default 'requested',
  notes text,
  created_at timestamptz not null default now()
);

create table public.payment_disputes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  reporter_person_id uuid references public.people(id),
  transaction_reference text,
  payment_date date,
  amount numeric(14,2),
  currency text,
  evidence_path text,
  issue_type text not null,
  status text not null default 'submitted',
  assigned_finance_user_id uuid references public.profiles(id),
  resolution text,
  correction_id uuid,
  receipt_id uuid references public.receipts(id)
);

create table public.reconciliation_imports (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  destination_id uuid references public.payment_destinations(id),
  import_type text not null,
  template_name text,
  mapping_summary text,
  valid_rows integer not null default 0,
  invalid_rows integer not null default 0,
  duplicate_rows integer not null default 0,
  unmatched_rows integer not null default 0,
  dry_run boolean not null default true,
  error_report_path text,
  status text not null default 'draft',
  created_by uuid references public.profiles(id)
);

create table public.reconciliation_rows (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  import_id uuid references public.reconciliation_imports(id) on delete cascade,
  transaction_reference text,
  amount numeric(14,2),
  currency text,
  transaction_date date,
  match_status text not null default 'unmatched',
  validation_error text
);

create table public.reconciliation_matches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  import_row_id uuid references public.reconciliation_rows(id),
  contribution_id uuid references public.contributions(id),
  match_type text not null,
  approved_by uuid references public.profiles(id),
  status text not null default 'pending'
);

create table public.giving_access_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references public.profiles(id),
  record_type text not null,
  record_id uuid,
  action text not null,
  scope text,
  reason text,
  created_at timestamptz not null default now()
);

create table public.giving_exports (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  export_type text not null,
  requested_by uuid references public.profiles(id),
  reason text,
  approved_by uuid references public.profiles(id),
  secure_file_path text,
  status text not null default 'requested'
);

create table public.giving_notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  notification_type text not null,
  recipient_user_id uuid references public.profiles(id),
  safe_preview text not null,
  status text not null default 'queued'
);

create table public.giving_activity_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contribution_id uuid references public.contributions(id),
  linked_type text not null,
  linked_id uuid,
  billable_eligible boolean not null default false
);

create index giving_categories_tenant_idx on public.giving_categories(tenant_id, status);
create index funds_tenant_idx on public.funds(tenant_id, restricted, status);
create index contributions_tenant_branch_idx on public.contributions(tenant_id, branch_id, contribution_date, verification_status);
create index receipts_verification_idx on public.receipts(verification_code, status);
create index pledges_tenant_status_idx on public.pledges(tenant_id, status);

alter table public.giving_categories enable row level security;
alter table public.funds enable row level security;
alter table public.fund_restrictions enable row level security;
alter table public.payment_destinations enable row level security;
alter table public.payment_destination_links enable row level security;
alter table public.payment_destination_approvals enable row level security;
alter table public.payment_destination_verifications enable row level security;
alter table public.contributions enable row level security;
alter table public.contribution_allocations enable row level security;
alter table public.contribution_sources enable row level security;
alter table public.contribution_verifications enable row level security;
alter table public.cash_collection_sessions enable row level security;
alter table public.cash_count_members enable row level security;
alter table public.cash_handover_links enable row level security;
alter table public.receipt_sequences enable row level security;
alter table public.receipts enable row level security;
alter table public.receipt_replacements enable row level security;
alter table public.giver_statements enable row level security;
alter table public.pledges enable row level security;
alter table public.pledge_schedules enable row level security;
alter table public.pledge_instalments enable row level security;
alter table public.partnerships enable row level security;
alter table public.partnership_schedules enable row level security;
alter table public.organizational_donors enable row level security;
alter table public.in_kind_contributions enable row level security;
alter table public.giving_campaigns enable row level security;
alter table public.campaign_updates enable row level security;
alter table public.refund_requests enable row level security;
alter table public.payment_disputes enable row level security;
alter table public.reconciliation_imports enable row level security;
alter table public.reconciliation_rows enable row level security;
alter table public.reconciliation_matches enable row level security;
alter table public.giving_access_logs enable row level security;
alter table public.giving_exports enable row level security;
alter table public.giving_notifications enable row level security;
alter table public.giving_activity_links enable row level security;

create policy "giving categories read" on public.giving_categories for select to authenticated using (public.has_permission(tenant_id, 'giving.category.view') or public.has_permission(tenant_id, 'giving.category.manage'));
create policy "giving categories manage" on public.giving_categories for all to authenticated using (public.has_permission(tenant_id, 'giving.category.manage')) with check (public.has_permission(tenant_id, 'giving.category.manage'));
create policy "funds read" on public.funds for select to authenticated using (public.has_permission(tenant_id, 'giving.fund.view') or public.has_permission(tenant_id, 'giving.fund.manage'));
create policy "funds manage" on public.funds for all to authenticated using (public.has_permission(tenant_id, 'giving.fund.manage')) with check (public.has_permission(tenant_id, 'giving.fund.manage'));
create policy "fund restrictions read" on public.fund_restrictions for select to authenticated using (public.has_permission(tenant_id, 'giving.fund.view') or public.has_permission(tenant_id, 'giving.export_restricted_funds'));
create policy "fund restrictions manage" on public.fund_restrictions for all to authenticated using (public.has_permission(tenant_id, 'giving.fund.manage')) with check (public.has_permission(tenant_id, 'giving.fund.manage'));
create policy "destinations public active read" on public.payment_destinations for select to anon using (status = 'active' and verification_status in ('verified_internally','verified_by_provider'));
create policy "destinations read" on public.payment_destinations for select to authenticated using (public.has_permission(tenant_id, 'giving.destination.view') or public.has_permission(tenant_id, 'giving.destination.manage'));
create policy "destinations manage" on public.payment_destinations for all to authenticated using (public.has_permission(tenant_id, 'giving.destination.manage')) with check (public.has_permission(tenant_id, 'giving.destination.manage'));
create policy "destination links read" on public.payment_destination_links for select to authenticated using (public.has_permission(tenant_id, 'giving.destination.view') or public.has_permission(tenant_id, 'giving.destination.manage'));
create policy "destination links manage" on public.payment_destination_links for all to authenticated using (public.has_permission(tenant_id, 'giving.destination.manage')) with check (public.has_permission(tenant_id, 'giving.destination.manage'));
create policy "destination approvals read" on public.payment_destination_approvals for select to authenticated using (public.has_permission(tenant_id, 'giving.destination.approve') or requested_by_user_id = auth.uid());
create policy "destination approvals manage" on public.payment_destination_approvals for all to authenticated using (public.has_permission(tenant_id, 'giving.destination.approve') or public.has_permission(tenant_id, 'giving.destination.manage')) with check (public.has_permission(tenant_id, 'giving.destination.approve') or public.has_permission(tenant_id, 'giving.destination.manage'));
create policy "destination verifications read" on public.payment_destination_verifications for select to authenticated using (public.has_permission(tenant_id, 'giving.destination.view') or public.has_permission(tenant_id, 'giving.destination.manage') or public.has_permission(tenant_id, 'giving.destination.approve'));
create policy "destination verifications manage" on public.payment_destination_verifications for all to authenticated using (public.has_permission(tenant_id, 'giving.destination.approve') or public.has_permission(tenant_id, 'giving.destination.manage')) with check (public.has_permission(tenant_id, 'giving.destination.approve') or public.has_permission(tenant_id, 'giving.destination.manage'));
create policy "contribution summary read" on public.contributions for select to authenticated using (public.has_permission(tenant_id, 'giving.contribution.view_individual') or (public.has_permission(tenant_id, 'giving.contribution.view_summary') and anonymous = true));
create policy "contribution manage" on public.contributions for all to authenticated using (public.has_permission(tenant_id, 'giving.contribution.create') or public.has_permission(tenant_id, 'giving.contribution.verify')) with check (public.has_permission(tenant_id, 'giving.contribution.create') or public.has_permission(tenant_id, 'giving.contribution.verify'));
create policy "contribution allocations read" on public.contribution_allocations for select to authenticated using (public.has_permission(tenant_id, 'giving.contribution.view_individual') or public.has_permission(tenant_id, 'giving.contribution.verify'));
create policy "contribution allocations manage" on public.contribution_allocations for all to authenticated using (public.has_permission(tenant_id, 'giving.contribution.create') or public.has_permission(tenant_id, 'giving.contribution.verify')) with check (public.has_permission(tenant_id, 'giving.contribution.create') or public.has_permission(tenant_id, 'giving.contribution.verify'));
create policy "contribution sources read" on public.contribution_sources for select to authenticated using (public.has_permission(tenant_id, 'giving.contribution.view_individual') or public.has_permission(tenant_id, 'giving.contribution.verify'));
create policy "contribution sources manage" on public.contribution_sources for all to authenticated using (public.has_permission(tenant_id, 'giving.contribution.create') or public.has_permission(tenant_id, 'giving.contribution.verify')) with check (public.has_permission(tenant_id, 'giving.contribution.create') or public.has_permission(tenant_id, 'giving.contribution.verify'));
create policy "contribution verifications read" on public.contribution_verifications for select to authenticated using (public.has_permission(tenant_id, 'giving.contribution.view_individual') or public.has_permission(tenant_id, 'giving.contribution.verify'));
create policy "contribution verifications manage" on public.contribution_verifications for all to authenticated using (public.has_permission(tenant_id, 'giving.contribution.verify')) with check (public.has_permission(tenant_id, 'giving.contribution.verify'));
create policy "cash collections read" on public.cash_collection_sessions for select to authenticated using (public.has_permission(tenant_id, 'giving.handover.view') or public.has_permission(tenant_id, 'giving.cash_count.manage'));
create policy "cash collections manage" on public.cash_collection_sessions for all to authenticated using (public.has_permission(tenant_id, 'giving.cash_count.manage') or public.has_permission(tenant_id, 'giving.handover.manage')) with check (public.has_permission(tenant_id, 'giving.cash_count.manage') or public.has_permission(tenant_id, 'giving.handover.manage'));
create policy "cash members read" on public.cash_count_members for select to authenticated using (public.has_permission(tenant_id, 'giving.cash_count.manage') or user_id = auth.uid());
create policy "cash members manage" on public.cash_count_members for all to authenticated using (public.has_permission(tenant_id, 'giving.cash_count.manage')) with check (public.has_permission(tenant_id, 'giving.cash_count.manage'));
create policy "cash handovers read" on public.cash_handover_links for select to authenticated using (public.has_permission(tenant_id, 'giving.handover.view') or public.has_permission(tenant_id, 'giving.handover.manage'));
create policy "cash handovers manage" on public.cash_handover_links for all to authenticated using (public.has_permission(tenant_id, 'giving.handover.manage')) with check (public.has_permission(tenant_id, 'giving.handover.manage'));
create policy "receipt sequences manage" on public.receipt_sequences for all to authenticated using (public.has_permission(tenant_id, 'giving.receipt.issue') or public.has_permission(tenant_id, 'giving.settings.manage')) with check (public.has_permission(tenant_id, 'giving.receipt.issue') or public.has_permission(tenant_id, 'giving.settings.manage'));
create policy "receipts public verify" on public.receipts for select to anon using (status in ('issued','voided','replaced','cancelled'));
create policy "receipts read" on public.receipts for select to authenticated using (public.has_permission(tenant_id, 'giving.receipt.issue') or public.has_permission(tenant_id, 'giving.contribution.view_individual'));
create policy "receipts manage" on public.receipts for all to authenticated using (public.has_permission(tenant_id, 'giving.receipt.issue') or public.has_permission(tenant_id, 'giving.receipt.void')) with check (public.has_permission(tenant_id, 'giving.receipt.issue') or public.has_permission(tenant_id, 'giving.receipt.void'));
create policy "receipt replacements read" on public.receipt_replacements for select to authenticated using (public.has_permission(tenant_id, 'giving.receipt.issue') or public.has_permission(tenant_id, 'giving.receipt.void'));
create policy "receipt replacements manage" on public.receipt_replacements for all to authenticated using (public.has_permission(tenant_id, 'giving.receipt.void')) with check (public.has_permission(tenant_id, 'giving.receipt.void'));
create policy "giver statements read" on public.giver_statements for select to authenticated using (public.has_permission(tenant_id, 'giving.statement.generate') or public.has_permission(tenant_id, 'giving.export_statements'));
create policy "giver statements manage" on public.giver_statements for all to authenticated using (public.has_permission(tenant_id, 'giving.statement.generate')) with check (public.has_permission(tenant_id, 'giving.statement.generate'));
create policy "pledges restricted read" on public.pledges for select to authenticated using (public.has_permission(tenant_id, 'giving.pledge.view') or public.has_permission(tenant_id, 'giving.pledge.manage'));
create policy "pledges manage" on public.pledges for all to authenticated using (public.has_permission(tenant_id, 'giving.pledge.manage')) with check (public.has_permission(tenant_id, 'giving.pledge.manage'));
create policy "pledge schedules read" on public.pledge_schedules for select to authenticated using (public.has_permission(tenant_id, 'giving.pledge.view') or public.has_permission(tenant_id, 'giving.pledge.manage'));
create policy "pledge schedules manage" on public.pledge_schedules for all to authenticated using (public.has_permission(tenant_id, 'giving.pledge.manage')) with check (public.has_permission(tenant_id, 'giving.pledge.manage'));
create policy "pledge instalments read" on public.pledge_instalments for select to authenticated using (public.has_permission(tenant_id, 'giving.pledge.view') or public.has_permission(tenant_id, 'giving.pledge.manage'));
create policy "pledge instalments manage" on public.pledge_instalments for all to authenticated using (public.has_permission(tenant_id, 'giving.pledge.manage')) with check (public.has_permission(tenant_id, 'giving.pledge.manage'));
create policy "partnerships restricted read" on public.partnerships for select to authenticated using (public.has_permission(tenant_id, 'giving.partnership.view') or public.has_permission(tenant_id, 'giving.partnership.manage'));
create policy "partnerships manage" on public.partnerships for all to authenticated using (public.has_permission(tenant_id, 'giving.partnership.manage')) with check (public.has_permission(tenant_id, 'giving.partnership.manage'));
create policy "partnership schedules read" on public.partnership_schedules for select to authenticated using (public.has_permission(tenant_id, 'giving.partnership.view') or public.has_permission(tenant_id, 'giving.partnership.manage'));
create policy "partnership schedules manage" on public.partnership_schedules for all to authenticated using (public.has_permission(tenant_id, 'giving.partnership.manage')) with check (public.has_permission(tenant_id, 'giving.partnership.manage'));
create policy "organizational donors read" on public.organizational_donors for select to authenticated using (public.has_permission(tenant_id, 'giving.partnership.view') or public.has_permission(tenant_id, 'giving.partnership.manage'));
create policy "organizational donors manage" on public.organizational_donors for all to authenticated using (public.has_permission(tenant_id, 'giving.partnership.manage')) with check (public.has_permission(tenant_id, 'giving.partnership.manage'));
create policy "in kind read" on public.in_kind_contributions for select to authenticated using (public.has_permission(tenant_id, 'giving.contribution.view_individual') or public.has_permission(tenant_id, 'giving.contribution.verify'));
create policy "in kind manage" on public.in_kind_contributions for all to authenticated using (public.has_permission(tenant_id, 'giving.contribution.create') or public.has_permission(tenant_id, 'giving.contribution.verify')) with check (public.has_permission(tenant_id, 'giving.contribution.create') or public.has_permission(tenant_id, 'giving.contribution.verify'));
create policy "campaigns public read" on public.giving_campaigns for select to anon using (public_progress = true and status = 'published');
create policy "campaigns read" on public.giving_campaigns for select to authenticated using (public.has_permission(tenant_id, 'giving.campaign.view') or public.has_permission(tenant_id, 'giving.campaign.manage'));
create policy "campaigns manage" on public.giving_campaigns for all to authenticated using (public.has_permission(tenant_id, 'giving.campaign.manage')) with check (public.has_permission(tenant_id, 'giving.campaign.manage'));
create policy "campaign updates public read" on public.campaign_updates for select to anon using (exists (select 1 from public.giving_campaigns c where c.id = campaign_updates.campaign_id and c.public_progress = true and c.status = 'published'));
create policy "campaign updates read" on public.campaign_updates for select to authenticated using (public.has_permission(tenant_id, 'giving.campaign.view') or public.has_permission(tenant_id, 'giving.campaign.manage'));
create policy "campaign updates manage" on public.campaign_updates for all to authenticated using (public.has_permission(tenant_id, 'giving.campaign.manage')) with check (public.has_permission(tenant_id, 'giving.campaign.manage'));
create policy "disputes manage" on public.payment_disputes for all to authenticated using (public.has_permission(tenant_id, 'giving.dispute.manage')) with check (public.has_permission(tenant_id, 'giving.dispute.manage'));
create policy "refunds manage" on public.refund_requests for all to authenticated using (public.has_permission(tenant_id, 'giving.refund.request') or public.has_permission(tenant_id, 'giving.refund.approve')) with check (public.has_permission(tenant_id, 'giving.refund.request') or public.has_permission(tenant_id, 'giving.refund.approve'));
create policy "reconciliation read" on public.reconciliation_imports for select to authenticated using (public.has_permission(tenant_id, 'giving.reconciliation.view') or public.has_permission(tenant_id, 'giving.reconciliation.manage'));
create policy "reconciliation manage" on public.reconciliation_imports for all to authenticated using (public.has_permission(tenant_id, 'giving.reconciliation.manage')) with check (public.has_permission(tenant_id, 'giving.reconciliation.manage'));
create policy "reconciliation rows read" on public.reconciliation_rows for select to authenticated using (public.has_permission(tenant_id, 'giving.reconciliation.view') or public.has_permission(tenant_id, 'giving.reconciliation.manage'));
create policy "reconciliation rows manage" on public.reconciliation_rows for all to authenticated using (public.has_permission(tenant_id, 'giving.reconciliation.manage')) with check (public.has_permission(tenant_id, 'giving.reconciliation.manage'));
create policy "reconciliation matches read" on public.reconciliation_matches for select to authenticated using (public.has_permission(tenant_id, 'giving.reconciliation.view') or public.has_permission(tenant_id, 'giving.reconciliation.manage'));
create policy "reconciliation matches manage" on public.reconciliation_matches for all to authenticated using (public.has_permission(tenant_id, 'giving.reconciliation.manage')) with check (public.has_permission(tenant_id, 'giving.reconciliation.manage'));
create policy "giving access logs read" on public.giving_access_logs for select to authenticated using (public.has_permission(tenant_id, 'giving.audit.view'));
create policy "giving exports read" on public.giving_exports for select to authenticated using (public.has_permission(tenant_id, 'giving.export_summary') or public.has_permission(tenant_id, 'giving.export_detailed'));
create policy "giving exports manage" on public.giving_exports for all to authenticated using (public.has_permission(tenant_id, 'giving.export_summary') or public.has_permission(tenant_id, 'giving.export_detailed') or public.has_permission(tenant_id, 'giving.export_individual')) with check (public.has_permission(tenant_id, 'giving.export_summary') or public.has_permission(tenant_id, 'giving.export_detailed') or public.has_permission(tenant_id, 'giving.export_individual'));
create policy "giving notifications read" on public.giving_notifications for select to authenticated using (recipient_user_id = auth.uid() or public.has_permission(tenant_id, 'giving.audit.view'));
create policy "giving notifications manage" on public.giving_notifications for all to authenticated using (public.has_permission(tenant_id, 'giving.settings.manage')) with check (public.has_permission(tenant_id, 'giving.settings.manage'));
create policy "giving activity links read" on public.giving_activity_links for select to authenticated using (public.has_permission(tenant_id, 'giving.contribution.view_summary') or public.has_permission(tenant_id, 'giving.contribution.view_individual'));
create policy "giving activity links manage" on public.giving_activity_links for all to authenticated using (public.has_permission(tenant_id, 'giving.contribution.create') or public.has_permission(tenant_id, 'giving.contribution.verify')) with check (public.has_permission(tenant_id, 'giving.contribution.create') or public.has_permission(tenant_id, 'giving.contribution.verify'));

insert into public.permission_groups (key, label, sort_order) values
('giving_stewardship', 'Giving & Stewardship', 90)
on conflict (key) do update set label = excluded.label, sort_order = excluded.sort_order;

insert into public.permissions (key, description, group_key, label, sensitive) values
('giving.category.view','View giving categories.','giving_stewardship','View giving categories',false),
('giving.category.manage','Manage giving categories.','giving_stewardship','Manage giving categories',true),
('giving.fund.view','View funds.','giving_stewardship','View funds',false),
('giving.fund.manage','Manage funds.','giving_stewardship','Manage funds',true),
('giving.destination.view','View payment destinations.','giving_stewardship','View destinations',true),
('giving.destination.manage','Manage payment destinations.','giving_stewardship','Manage destinations',true),
('giving.destination.approve','Approve payment destinations.','giving_stewardship','Approve destinations',true),
('giving.contribution.view_summary','View contribution summaries.','giving_stewardship','View contribution summaries',true),
('giving.contribution.view_individual','View individual contributions.','giving_stewardship','View individual giving',true),
('giving.contribution.create','Create contributions.','giving_stewardship','Create contributions',true),
('giving.contribution.verify','Verify contributions.','giving_stewardship','Verify contributions',true),
('giving.contribution.correct','Correct contributions.','giving_stewardship','Correct contributions',true),
('giving.contribution.reverse','Reverse contributions.','giving_stewardship','Reverse contributions',true),
('giving.cash_count.manage','Manage cash counts.','giving_stewardship','Manage cash count',true),
('giving.handover.view','View handovers.','giving_stewardship','View handovers',true),
('giving.handover.manage','Manage handovers.','giving_stewardship','Manage handovers',true),
('giving.receipt.issue','Issue receipts.','giving_stewardship','Issue receipts',true),
('giving.receipt.void','Void receipts.','giving_stewardship','Void receipts',true),
('giving.statement.generate','Generate statements.','giving_stewardship','Generate statements',true),
('giving.pledge.view','View pledges.','giving_stewardship','View pledges',true),
('giving.pledge.manage','Manage pledges.','giving_stewardship','Manage pledges',true),
('giving.partnership.view','View partnerships.','giving_stewardship','View partnerships',true),
('giving.partnership.manage','Manage partnerships.','giving_stewardship','Manage partnerships',true),
('giving.campaign.view','View giving campaigns.','giving_stewardship','View campaigns',false),
('giving.campaign.manage','Manage giving campaigns.','giving_stewardship','Manage campaigns',true),
('giving.reconciliation.view','View reconciliation.','giving_stewardship','View reconciliation',true),
('giving.reconciliation.manage','Manage reconciliation.','giving_stewardship','Manage reconciliation',true),
('giving.dispute.manage','Manage giving disputes.','giving_stewardship','Manage disputes',true),
('giving.refund.request','Request giving refunds.','giving_stewardship','Request refunds',true),
('giving.refund.approve','Approve giving refunds.','giving_stewardship','Approve refunds',true),
('giving.export_summary','Export giving summaries.','giving_stewardship','Export summaries',true),
('giving.export_detailed','Export detailed giving.','giving_stewardship','Export detailed',true),
('giving.export_individual','Export individual giving.','giving_stewardship','Export individual',true),
('giving.export_restricted_funds','Export restricted funds.','giving_stewardship','Export restricted funds',true),
('giving.export_statements','Export giving statements.','giving_stewardship','Export statements',true),
('giving.audit.view','View giving audit.','giving_stewardship','View giving audit',true),
('giving.settings.manage','Manage giving settings.','giving_stewardship','Manage giving settings',true)
on conflict (key) do nothing;
