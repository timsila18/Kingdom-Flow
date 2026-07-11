create extension if not exists "pgcrypto";

create type tenant_status as enum ('draft','submitted','under_review','approved','rejected','needs_clarification','suspended');
create type subscription_status as enum ('trialing','active','grace_period','past_due','suspended');
create type membership_status as enum ('invited','active','suspended');
create type scope_type as enum ('tenant','branch','unit','platform');
create type audit_result as enum ('success','blocked','failed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.platform_roles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.platform_user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform_role_id uuid not null references public.platform_roles(id) on delete cascade,
  granted_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (user_id, platform_role_id)
);

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  public_name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  logo_file_id uuid,
  favicon_file_id uuid,
  primary_color text not null default '#10243f',
  secondary_color text not null default '#f3f1ec',
  accent_color text not null default '#b7822f',
  country text not null,
  region text,
  postal_address text,
  physical_address text,
  phone_numbers text[] not null default '{}',
  email_addresses text[] not null default '{}',
  website text,
  founding_date date,
  registration_details text,
  time_zone text not null default 'Africa/Nairobi',
  default_currency text not null default 'KES',
  preferred_date_format text not null default 'dd MMM yyyy',
  preferred_time_format text not null default '24h',
  default_language text not null default 'en',
  membership_terminology text not null default 'Member',
  branch_terminology text not null default 'Branch',
  small_group_terminology text not null default 'Cell',
  ministry_head_title text not null default 'Senior Pastor',
  status tenant_status not null default 'draft',
  subscription_status subscription_status not null default 'trialing',
  onboarding_status tenant_status not null default 'draft',
  data_retention_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.tenant_settings (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  regional_settings jsonb not null default '{}'::jsonb,
  communication_defaults jsonb not null default '{}'::jsonb,
  privacy_settings jsonb not null default '{}'::jsonb,
  security_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenant_branding (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  logo_file_id uuid,
  favicon_file_id uuid,
  light_logo_file_id uuid,
  dark_logo_file_id uuid,
  primary_color text not null,
  secondary_color text not null,
  accent_color text not null,
  slogan text,
  welcome_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenant_terminology (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  canonical_key text not null,
  display_label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, canonical_key)
);

create table public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status membership_status not null default 'invited',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (tenant_id, user_id)
);

create table public.organization_unit_types (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  key text not null,
  label text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  unique (tenant_id, key)
);

create table public.organization_units (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  parent_unit_id uuid references public.organization_units(id),
  unit_type_id uuid references public.organization_unit_types(id),
  custom_type_label text,
  name text not null,
  code text not null,
  leader_user_id uuid references public.profiles(id),
  deputy_leader_user_id uuid references public.profiles(id),
  administrator_user_id uuid references public.profiles(id),
  location text,
  contact_information jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  opening_date date,
  closure_date date,
  reporting_order integer not null default 0,
  visibility text not null default 'tenant',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (tenant_id, code),
  check (id <> parent_unit_id)
);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_unit_id uuid not null references public.organization_units(id),
  name text not null,
  code text not null,
  leader_user_id uuid references public.profiles(id),
  administrator_user_id uuid references public.profiles(id),
  physical_address text,
  map_coordinates point,
  phone text,
  email text,
  service_times jsonb not null default '[]'::jsonb,
  opening_date date,
  status text not null default 'active',
  seating_capacity integer,
  local_branding_override jsonb,
  default_payment_instructions text,
  time_zone text not null default 'Africa/Nairobi',
  default_language text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (tenant_id, code)
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key text not null,
  display_name text not null,
  system_template boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (tenant_id, key)
);

create table public.permissions (
  key text primary key,
  description text not null,
  created_at timestamptz not null default now()
);

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_key text not null references public.permissions(key) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_key)
);

create table public.permission_scopes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  scope_type scope_type not null,
  scope_id uuid,
  created_at timestamptz not null default now()
);

create table public.user_role_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  scope_id uuid references public.permission_scopes(id),
  effective_from timestamptz not null default now(),
  expires_at timestamptz,
  assigned_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  email text not null,
  token_hash text not null unique,
  role_id uuid not null references public.roles(id),
  scope_type scope_type not null default 'tenant',
  scope_id uuid,
  welcome_message text,
  status text not null default 'pending',
  expires_at timestamptz not null,
  invited_by uuid references public.profiles(id),
  accepted_by uuid references public.profiles(id),
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  min_active_people integer not null,
  max_active_people integer,
  monthly_kes integer,
  annual_kes integer,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.plan_features (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.subscription_plans(id) on delete cascade,
  feature_key text not null,
  entitlement jsonb not null default '{}'::jsonb,
  unique (plan_id, feature_key)
);

create table public.tenant_subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id),
  status subscription_status not null default 'active',
  billing_cycle text not null default 'monthly',
  trial_ends_at timestamptz,
  grace_period_ends_at timestamptz,
  church_plant_support_status text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.billing_contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  subscription_id uuid references public.tenant_subscriptions(id),
  invoice_number text not null unique,
  status text not null default 'draft',
  currency text not null default 'KES',
  amount_due integer not null default 0,
  due_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  invoice_id uuid references public.invoices(id),
  provider text,
  provider_reference text,
  amount integer not null,
  currency text not null default 'KES',
  status text not null,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.subscription_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  subscription_id uuid references public.tenant_subscriptions(id),
  event_type text not null,
  previous_values jsonb,
  new_values jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  enabled boolean not null default false,
  description text,
  created_at timestamptz not null default now()
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  bucket text not null,
  path text not null,
  purpose text not null,
  mime_type text not null,
  size_bytes bigint not null,
  is_public boolean not null default false,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (bucket, path),
  check (tenant_id is null or path like tenant_id::text || '/%')
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  previous_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  branch_id uuid references public.branches(id),
  unit_id uuid references public.organization_units(id),
  result audit_result not null,
  reason text,
  request_id text,
  created_at timestamptz not null default now()
);

create table public.onboarding_progress (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  current_step integer not null default 1,
  payload jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  deep_link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  notification_preferences jsonb not null default '{}'::jsonb,
  ui_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.tenant_memberships (tenant_id, user_id);
create index on public.organization_units (tenant_id, parent_unit_id);
create index on public.branches (tenant_id, organization_unit_id);
create index on public.user_role_assignments (tenant_id, user_id);
create index on public.invitations (tenant_id, email, status);
create index on public.audit_logs (tenant_id, created_at desc);
create index on public.notifications (user_id, read_at, created_at desc);

create or replace function public.is_platform_super_admin()
returns boolean
language sql
stable
security invoker
as $$
  select exists (
    select 1
    from public.platform_user_roles pur
    join public.platform_roles pr on pr.id = pur.platform_role_id
    where pur.user_id = (select auth.uid()) and pr.key = 'platform_super_admin'
  );
$$;

create or replace function public.is_tenant_member(check_tenant_id uuid)
returns boolean
language sql
stable
security invoker
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    where tm.tenant_id = check_tenant_id
      and tm.user_id = (select auth.uid())
      and tm.status = 'active'
      and tm.archived_at is null
  );
$$;

create or replace function public.has_permission(check_tenant_id uuid, permission text)
returns boolean
language sql
stable
security invoker
as $$
  select exists (
    select 1
    from public.user_role_assignments ura
    join public.role_permissions rp on rp.role_id = ura.role_id
    where ura.tenant_id = check_tenant_id
      and ura.user_id = (select auth.uid())
      and rp.permission_key = permission
      and ura.archived_at is null
      and (ura.expires_at is null or ura.expires_at > now())
  );
$$;

alter table public.profiles enable row level security;
alter table public.platform_roles enable row level security;
alter table public.platform_user_roles enable row level security;
alter table public.tenants enable row level security;
alter table public.tenant_settings enable row level security;
alter table public.tenant_branding enable row level security;
alter table public.tenant_terminology enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.organization_unit_types enable row level security;
alter table public.organization_units enable row level security;
alter table public.branches enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.permission_scopes enable row level security;
alter table public.user_role_assignments enable row level security;
alter table public.invitations enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.plan_features enable row level security;
alter table public.tenant_subscriptions enable row level security;
alter table public.billing_contacts enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.subscription_events enable row level security;
alter table public.feature_flags enable row level security;
alter table public.files enable row level security;
alter table public.audit_logs enable row level security;
alter table public.onboarding_progress enable row level security;
alter table public.notifications enable row level security;
alter table public.user_preferences enable row level security;

create policy "profiles self read" on public.profiles for select to authenticated using (id = (select auth.uid()) or public.is_platform_super_admin());
create policy "tenants member or platform read" on public.tenants for select to authenticated using (public.is_platform_super_admin() or public.is_tenant_member(id));
create policy "tenant settings scoped read" on public.tenant_settings for select to authenticated using (public.is_tenant_member(tenant_id));
create policy "tenant branding scoped read" on public.tenant_branding for select to authenticated using (public.is_tenant_member(tenant_id));
create policy "tenant terminology scoped read" on public.tenant_terminology for select to authenticated using (public.is_tenant_member(tenant_id));
create policy "tenant memberships scoped read" on public.tenant_memberships for select to authenticated using (public.has_permission(tenant_id, 'role.view') or user_id = (select auth.uid()));
create policy "organization scoped read" on public.organization_units for select to authenticated using (public.has_permission(tenant_id, 'organization.view'));
create policy "branches scoped read" on public.branches for select to authenticated using (public.has_permission(tenant_id, 'branch.view'));
create policy "roles scoped read" on public.roles for select to authenticated using (public.has_permission(tenant_id, 'role.view'));
create policy "permissions authenticated read" on public.permissions for select to authenticated using (true);
create policy "role permissions scoped read" on public.role_permissions for select to authenticated using (exists (select 1 from public.roles r where r.id = role_id and public.has_permission(r.tenant_id, 'role.view')));
create policy "assignment scoped read" on public.user_role_assignments for select to authenticated using (public.has_permission(tenant_id, 'role.view') or user_id = (select auth.uid()));
create policy "invitations scoped read" on public.invitations for select to authenticated using (public.has_permission(tenant_id, 'role.view'));
create policy "plans authenticated read" on public.subscription_plans for select to authenticated using (true);
create policy "plan features authenticated read" on public.plan_features for select to authenticated using (true);
create policy "subscriptions scoped read" on public.tenant_subscriptions for select to authenticated using (public.has_permission(tenant_id, 'settings.view'));
create policy "audit scoped read" on public.audit_logs for select to authenticated using (public.is_platform_super_admin() or public.has_permission(tenant_id, 'audit.view'));
create policy "onboarding owner read" on public.onboarding_progress for select to authenticated using (user_id = (select auth.uid()) or public.is_platform_super_admin());
create policy "notifications owner read" on public.notifications for select to authenticated using (user_id = (select auth.uid()));
create policy "preferences owner read" on public.user_preferences for select to authenticated using (user_id = (select auth.uid()));

insert into public.platform_roles (key, name) values ('platform_super_admin', 'KingdomFlow Platform Super Admin');

insert into public.permissions (key, description) values
('tenant.view','View tenant metadata'), ('tenant.manage','Manage tenant settings'),
('organization.view','View organization structure'), ('organization.manage','Manage organization structure'),
('branch.view','View branch data'), ('branch.manage','Manage branch data'),
('member.view','View member records'), ('member.manage','Manage member records'),
('visitor.view','View visitors'), ('visitor.manage','Manage visitors'),
('pastoral_case.view','View pastoral cases'), ('pastoral_case.manage','Manage pastoral cases'),
('finance.view','View finance records'), ('finance.manage','Manage finance records'),
('programme.view','View programmes'), ('programme.manage','Manage programmes'),
('report.view','View reports'), ('report.manage','Manage reports'),
('settings.view','View settings'), ('settings.manage','Manage settings'),
('role.view','View roles'), ('role.manage','Manage roles'),
('audit.view','View audit trail');

insert into public.subscription_plans (key, name, min_active_people, max_active_people, monthly_kes, annual_kes) values
('starter','Kingdom Starter',1,100,0,0),
('growth','Kingdom Growth',101,300,1000,10000),
('community','Kingdom Community',301,750,2000,20000),
('impact','Kingdom Impact',751,1500,3500,35000),
('network','Kingdom Network',1501,3000,6000,60000),
('mission','Kingdom Mission',3001,7500,10000,100000),
('global','Kingdom Global',7501,15000,15000,150000),
('enterprise','Enterprise Ministry',15001,null,null,null);

-- Grant platform-super-admin status after the Supabase Auth user exists:
-- insert into public.platform_user_roles (user_id, platform_role_id)
-- select p.id, r.id from public.profiles p cross join public.platform_roles r
-- where p.email = 'timsila18@gmail.com' and r.key = 'platform_super_admin';
