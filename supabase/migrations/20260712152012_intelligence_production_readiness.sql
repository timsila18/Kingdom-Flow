-- Prompt 12 + 13: intelligence, network sharing, billing and production readiness.

insert into permission_groups (key, label, description)
values
  ('intelligence', 'Analytics, command center and ethical growth intelligence', 'Prompt 12 leadership analytics, KPI and reporting permissions.'),
  ('production_readiness', 'Subscription, launch readiness and support', 'Prompt 13 billing, release, support and offboarding permissions.')
on conflict (key) do update set label = excluded.label, description = excluded.description;

insert into permissions (key, group_key, label, description, sensitive)
values
  ('analytics.dashboard.view', 'intelligence', 'View analytics dashboard', 'View aggregate leadership dashboard.', false),
  ('analytics.executive.view', 'intelligence', 'View executive analytics', 'View executive command-center analytics.', false),
  ('analytics.branch.view', 'intelligence', 'View branch analytics', 'View branch-scoped analytics.', false),
  ('analytics.network.view', 'intelligence', 'View network analytics', 'View explicitly shared network aggregate analytics.', true),
  ('analytics.member_drilldown', 'intelligence', 'Analytics member drill-down', 'Open authorized person-level analytics drill-downs.', true),
  ('analytics.pastoral_aggregate.view', 'intelligence', 'View pastoral aggregate analytics', 'View pastoral workload aggregate counts only.', true),
  ('analytics.safeguarding.view', 'intelligence', 'View safeguarding analytics', 'View restricted safeguarding compliance analytics.', true),
  ('analytics.finance.view', 'intelligence', 'View finance analytics', 'View finance analytics where finance permission exists.', true),
  ('analytics.hr.view', 'intelligence', 'View HR analytics', 'View HR analytics where HR permission exists.', true),
  ('analytics.kpi.manage', 'intelligence', 'Manage KPIs', 'Manage controlled KPI definitions and targets.', false),
  ('analytics.rule.manage', 'intelligence', 'Manage analytics rules', 'Manage growth rules and alert thresholds.', false),
  ('analytics.report.build', 'intelligence', 'Build analytics reports', 'Create custom analytics reports.', false),
  ('analytics.dashboard.build', 'intelligence', 'Build dashboards', 'Create dashboard layouts and widgets.', false),
  ('analytics.report.schedule', 'intelligence', 'Schedule reports', 'Schedule secure report delivery.', true),
  ('analytics.export', 'intelligence', 'Export analytics', 'Export authorized analytics with audit.', true),
  ('analytics.ai.use', 'intelligence', 'Use executive AI', 'Ask AI to summarize authorized metrics.', true),
  ('analytics.scenario.use', 'intelligence', 'Use scenario planning', 'Run non-mutating scenarios.', false),
  ('analytics.benchmark.view', 'intelligence', 'View benchmarks', 'View internal or consented benchmark analytics.', true),
  ('network.manage', 'intelligence', 'Manage networks', 'Manage church network invitations and membership.', true),
  ('network.data_sharing.manage', 'intelligence', 'Manage network data sharing', 'Manage explicit aggregate sharing policies.', true),
  ('platform.release.view', 'production_readiness', 'View release readiness', 'View production release gates.', false),
  ('platform.release.manage', 'production_readiness', 'Manage release readiness', 'Manage release gates and readiness evidence.', true),
  ('subscription.billing.view', 'production_readiness', 'View subscription billing', 'View KingdomFlow subscription billing.', false),
  ('subscription.billing.manage', 'production_readiness', 'Manage subscription billing', 'Manage plan, cycle, grace and support programme.', true),
  ('subscription.invoice.view', 'production_readiness', 'View subscription invoices', 'View KingdomFlow invoices.', false),
  ('subscription.payment.verify', 'production_readiness', 'Verify subscription payments', 'Verify platform subscription payments only.', true),
  ('tenant.export.request', 'production_readiness', 'Request tenant export', 'Request church-owned data export.', true),
  ('tenant.export.approve', 'production_readiness', 'Approve tenant export', 'Approve sensitive export requests.', true),
  ('tenant.offboarding.manage', 'production_readiness', 'Manage offboarding', 'Manage controlled tenant cancellation and offboarding.', true),
  ('tenant.suspension.manage', 'production_readiness', 'Manage suspension', 'Manage billing, security or legal suspension.', true),
  ('feature_flag.view', 'production_readiness', 'View feature flags', 'View global, plan, tenant and beta flags.', false),
  ('feature_flag.manage', 'production_readiness', 'Manage feature flags', 'Manage feature flags without replacing authorization.', true),
  ('support.ticket.create', 'production_readiness', 'Create support ticket', 'Create KingdomFlow support tickets.', false),
  ('support.ticket.manage', 'production_readiness', 'Manage support ticket', 'Manage KingdomFlow support tickets.', true),
  ('support.access.request', 'production_readiness', 'Request support access', 'Request audited tenant support access.', true),
  ('support.access.approve', 'production_readiness', 'Approve support access', 'Approve scoped support access.', true),
  ('help_content.manage', 'production_readiness', 'Manage help content', 'Manage versioned help-center content.', false)
on conflict (key) do update set group_key = excluded.group_key, label = excluded.label, description = excluded.description, sensitive = excluded.sensitive;

create table if not exists church_networks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  name text not null,
  network_type text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists network_memberships (
  id uuid primary key default gen_random_uuid(),
  network_id uuid references church_networks(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete cascade,
  status text not null default 'invited',
  shared_categories text[] not null default '{}',
  individual_data_shared boolean not null default false,
  accepted_at timestamptz,
  revoked_at timestamptz,
  unique (network_id, tenant_id)
);

create table if not exists metric_definitions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  domain text not null,
  metric_key text not null,
  target numeric not null,
  warning_threshold numeric not null,
  critical_threshold numeric not null,
  scope_type text not null,
  visibility_permission text not null,
  version integer not null default 1,
  effective_from date not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists metric_results (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  metric_definition_id uuid not null references metric_definitions(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  numerator numeric not null,
  denominator numeric not null check (denominator >= 0),
  value numeric not null,
  source_completeness numeric not null default 100 check (source_completeness between 0 and 100),
  calculated_at timestamptz not null default now()
);

create table if not exists analytics_alerts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  title text not null,
  severity text not null,
  source_type text not null,
  source_id text not null,
  assigned_to uuid references profiles(id),
  acknowledged_at timestamptz,
  cooldown_until timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists executive_briefings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  overview text not null,
  attention_items jsonb not null default '[]',
  risks jsonb not null default '[]',
  decisions_needed jsonb not null default '[]',
  ai_safety_note text not null,
  source_keys text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists active_people_calculations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  billing_month date not null,
  active_people integer not null check (active_people >= 0),
  excluded_people integer not null default 0 check (excluded_people >= 0),
  basis jsonb not null default '[]',
  deduplicated_person_ids uuid[] not null default '{}',
  calculated_at timestamptz not null default now(),
  unique (tenant_id, billing_month)
);

create table if not exists subscription_invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  invoice_number text not null unique,
  plan_key text not null,
  billing_period_start date not null,
  billing_period_end date not null,
  active_people_basis integer not null check (active_people_basis >= 0),
  subtotal_kes integer not null check (subtotal_kes >= 0),
  discount_kes integer not null default 0 check (discount_kes >= 0),
  total_kes integer not null check (total_kes >= 0),
  due_date date not null,
  status text not null,
  payment_instructions text not null,
  created_at timestamptz not null default now()
);

create table if not exists feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  enabled boolean not null default false,
  scope text not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists release_gates (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  status text not null,
  evidence text not null,
  release_blocking boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  requester_id uuid references profiles(id),
  category text not null,
  priority text not null default 'normal',
  description text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists support_access_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  requested_by uuid references profiles(id),
  approved_by uuid references profiles(id),
  scope text not null,
  duration_hours integer not null check (duration_hours > 0 and duration_hours <= 72),
  status text not null default 'requested',
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists metric_definitions_tenant_idx on metric_definitions (tenant_id, domain, status);
create index if not exists metric_results_tenant_period_idx on metric_results (tenant_id, period_start, period_end);
create index if not exists analytics_alerts_tenant_idx on analytics_alerts (tenant_id, severity, resolved_at);
create index if not exists active_people_tenant_month_idx on active_people_calculations (tenant_id, billing_month);
create index if not exists subscription_invoices_tenant_idx on subscription_invoices (tenant_id, due_date, status);
create index if not exists support_tickets_tenant_status_idx on support_tickets (tenant_id, status);

alter table church_networks enable row level security;
alter table network_memberships enable row level security;
alter table metric_definitions enable row level security;
alter table metric_results enable row level security;
alter table analytics_alerts enable row level security;
alter table executive_briefings enable row level security;
alter table active_people_calculations enable row level security;
alter table subscription_invoices enable row level security;
alter table feature_flags enable row level security;
alter table release_gates enable row level security;
alter table support_tickets enable row level security;
alter table support_access_requests enable row level security;

create policy "tenant users read own metric definitions" on metric_definitions for select using (tenant_id in (select tenant_id from public.tenant_memberships where user_id = auth.uid() and status = 'active'));
create policy "tenant users read own metric results" on metric_results for select using (tenant_id in (select tenant_id from public.tenant_memberships where user_id = auth.uid() and status = 'active'));
create policy "tenant users read own alerts" on analytics_alerts for select using (tenant_id in (select tenant_id from public.tenant_memberships where user_id = auth.uid() and status = 'active'));
create policy "tenant users read own briefings" on executive_briefings for select using (tenant_id in (select tenant_id from public.tenant_memberships where user_id = auth.uid() and status = 'active'));
create policy "tenant users read own active people calculations" on active_people_calculations for select using (tenant_id in (select tenant_id from public.tenant_memberships where user_id = auth.uid() and status = 'active'));
create policy "tenant users read own subscription invoices" on subscription_invoices for select using (tenant_id in (select tenant_id from public.tenant_memberships where user_id = auth.uid() and status = 'active'));
create policy "tenant users create support tickets" on support_tickets for insert with check (tenant_id in (select tenant_id from public.tenant_memberships where user_id = auth.uid() and status = 'active'));
create policy "tenant users read own support tickets" on support_tickets for select using (tenant_id in (select tenant_id from public.tenant_memberships where user_id = auth.uid() and status = 'active'));
create policy "tenant users read own support access requests" on support_access_requests for select using (tenant_id in (select tenant_id from public.tenant_memberships where user_id = auth.uid() and status = 'active'));
create policy "network members read accepted own network memberships" on network_memberships for select using (tenant_id in (select tenant_id from public.tenant_memberships where user_id = auth.uid() and status = 'active'));
create policy "tenant network owners read networks" on church_networks for select using (tenant_id in (select tenant_id from public.tenant_memberships where user_id = auth.uid() and status = 'active'));
create policy "feature flags readable by authenticated users" on feature_flags for select using (auth.uid() is not null);
create policy "release gates readable by authenticated users" on release_gates for select using (auth.uid() is not null);
