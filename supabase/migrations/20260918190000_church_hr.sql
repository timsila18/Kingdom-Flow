create table if not exists public.kf_hr_staff (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  member_id uuid not null,
  user_id uuid references public.profiles(id) on delete set null,
  staff_no text not null,
  name text not null,
  department_id uuid,
  branch_id uuid,
  supervisor_id uuid,
  job_title text not null,
  employment_type text not null check (employment_type in ('Employee','Stipend worker','Volunteer')),
  status text not null default 'Active' check (status in ('Active','On leave','Suspended','Exited')),
  start_date date not null,
  end_date date,
  basic_salary numeric(14,2) not null default 0 check (basic_salary >= 0),
  payroll_eligible boolean not null default false,
  details jsonb not null default '{}',
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id,member_id), unique (tenant_id,staff_no), unique(id,tenant_id),
  check (employment_type <> 'Volunteer' or not payroll_eligible),
  check (end_date is null or end_date >= start_date)
);

create or replace function public.kf_hr_confirmed_member() returns trigger language plpgsql set search_path = public as $$
begin
  if TG_OP = 'INSERT' or new.member_id <> old.member_id then
    if not exists (
      select 1 from public.tenant_settings settings,
      lateral jsonb_array_elements(coalesce(settings.regional_settings->'workspace'->'records','[]')) person
      where settings.tenant_id = new.tenant_id and person->>'id' = new.member_id::text
      and person->>'kind' = 'people' and person->'fields'->>'stage' = 'Member'
      and coalesce(person->'fields'->>'membershipConfirmedBy','') <> ''
      and coalesce(person->'fields'->>'archived','') <> 'yes'
    ) then raise exception 'Staff must be a confirmed member of this church.'; end if;
  end if;
  return new;
end $$;
drop trigger if exists kf_hr_staff_membership on public.kf_hr_staff;
create trigger kf_hr_staff_membership before insert or update on public.kf_hr_staff for each row execute function public.kf_hr_confirmed_member();

create table if not exists public.kf_hr_reviews (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  staff_id uuid not null, title text not null, cycle_type text not null,
  period_start date not null, period_end date not null,
  goals text not null, self_review text not null default '', supervisor_review text not null default '',
  rating numeric(3,1) check (rating between 1 and 5),
  status text not null default 'Draft' check (status in ('Draft','Self submitted','Supervisor reviewed','Finalised')),
  created_by uuid not null, updated_at timestamptz not null default now(), created_at timestamptz not null default now(),
  foreign key (staff_id,tenant_id) references public.kf_hr_staff(id,tenant_id),
  check(period_end >= period_start)
);
create table if not exists public.kf_hr_periods (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  month text not null check (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'), title text not null,
  status text not null default 'Draft' check(status in ('Draft','Submitted','Approved','Paid')),
  created_by uuid not null, submitted_by uuid, approved_by uuid, paid_by uuid,
  calculated_at timestamptz, payment_reference text, paid_at timestamptz,
  rules jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(tenant_id,month), unique(id,tenant_id)
);
create table if not exists public.kf_hr_inputs (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  period_id uuid not null, staff_id uuid not null, kind text not null check(kind in ('Earning','Deduction')),
  description text not null, amount numeric(14,2) not null check(amount > 0), created_by uuid not null,
  foreign key(period_id,tenant_id) references public.kf_hr_periods(id,tenant_id) on delete cascade,
  foreign key(staff_id,tenant_id) references public.kf_hr_staff(id,tenant_id),
  unique(period_id,staff_id,kind,description)
);
create table if not exists public.kf_hr_payroll_items (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  period_id uuid not null, staff_id uuid not null, snapshot jsonb not null,
  foreign key(period_id,tenant_id) references public.kf_hr_periods(id,tenant_id) on delete cascade,
  foreign key(staff_id,tenant_id) references public.kf_hr_staff(id,tenant_id), unique(period_id,staff_id)
);
create table if not exists public.kf_hr_events (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  staff_id uuid not null, kind text not null, note text not null, effective_date date not null,
  created_by uuid not null, created_at timestamptz not null default now(),
  foreign key(staff_id,tenant_id) references public.kf_hr_staff(id,tenant_id)
);
create table if not exists public.kf_hr_documents (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  staff_id uuid not null, title text not null, storage_path text not null, file_name text not null,
  created_by uuid not null, created_at timestamptz not null default now(),
  foreign key(staff_id,tenant_id) references public.kf_hr_staff(id,tenant_id)
);
alter table public.kf_hr_documents add column if not exists visibility text not null default 'Admin only' check (visibility in ('Admin only','Employee visible'));
create table if not exists public.kf_hr_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  staff_id uuid not null,
  request_type text not null check (request_type in ('Leave','Off day','Complaint','Salary advance','Profile change')),
  subject text not null,
  details jsonb not null default '{}',
  status text not null default 'Pending' check (status in ('Pending','Approved','Rejected','Returned','Cancelled')),
  submitted_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid,
  decision_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key(staff_id,tenant_id) references public.kf_hr_staff(id,tenant_id) on delete cascade
);
create index if not exists kf_hr_requests_staff on public.kf_hr_requests(tenant_id,staff_id,submitted_at desc);
create table if not exists public.kf_hr_audit (
  id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
  actor_id uuid not null, action text not null, entity_id uuid, detail jsonb not null default '{}',
  created_at timestamptz not null default now()
);

do $$ declare name text; begin
  foreach name in array array['kf_hr_staff','kf_hr_reviews','kf_hr_periods','kf_hr_inputs','kf_hr_payroll_items','kf_hr_events','kf_hr_documents','kf_hr_requests','kf_hr_audit'] loop
    execute format('alter table public.%I enable row level security', name);
    execute format('revoke all on public.%I from anon, authenticated', name);
    execute format('grant all on public.%I to service_role', name);
  end loop;
end $$;

create or replace function public.kf_hr_payroll_write(p_tenant uuid,p_period uuid,p_actor uuid,p_action text,p_items jsonb default '[]',p_rules jsonb default '{}',p_reference text default '') returns void
language plpgsql security definer set search_path = public as $$
declare period public.kf_hr_periods; item jsonb; begin
  select * into period from public.kf_hr_periods where id=p_period and tenant_id=p_tenant for update;
  if not found then raise exception 'Payroll period not found.'; end if;
  if p_action='calculate' then
    if period.status<>'Draft' then raise exception 'Only draft payroll can be calculated.'; end if;
    if jsonb_array_length(p_items)=0 then raise exception 'No eligible staff.'; end if;
    delete from public.kf_hr_payroll_items where period_id=p_period;
    for item in select * from jsonb_array_elements(p_items) loop
      if (item->>'net')::numeric < 0 then raise exception 'Negative net pay is not allowed.'; end if;
      insert into public.kf_hr_payroll_items(tenant_id,period_id,staff_id,snapshot) values(p_tenant,p_period,(item->>'staffId')::uuid,item);
    end loop;
    update public.kf_hr_periods set calculated_at=now(),rules=p_rules,updated_at=now() where id=p_period;
  elsif p_action='submit' then
    if period.status<>'Draft' or period.calculated_at is null or not exists(select 1 from public.kf_hr_payroll_items where period_id=p_period) then raise exception 'Calculate a valid draft first.'; end if;
    if not exists(select 1 from public.tenant_settings where tenant_id=p_tenant and updated_at=(period.rules->>'workspaceVersion')::timestamptz) then raise exception 'Church records changed. Recalculate payroll first.'; end if;
    update public.kf_hr_periods set status='Submitted',submitted_by=p_actor,updated_at=now() where id=p_period;
  elsif p_action='approve' then
    if period.status<>'Submitted' or period.submitted_by=p_actor or period.created_by=p_actor then raise exception 'A different leader must approve submitted payroll.'; end if;
    update public.kf_hr_periods set status='Approved',approved_by=p_actor,updated_at=now() where id=p_period;
  elsif p_action='return' then
    if period.status<>'Submitted' then raise exception 'Only submitted payroll can be returned.'; end if;
    update public.kf_hr_periods set status='Draft',calculated_at=null,updated_at=now() where id=p_period;
  elsif p_action='pay' then
    if period.status<>'Approved' or length(trim(p_reference))=0 then raise exception 'Approve payroll and provide a payment reference first.'; end if;
    update public.kf_hr_periods set status='Paid',paid_by=p_actor,payment_reference=p_reference,paid_at=now(),updated_at=now() where id=p_period;
  else raise exception 'Invalid payroll action.'; end if;
  insert into public.kf_hr_audit(tenant_id,actor_id,action,entity_id) values(p_tenant,p_actor,'payroll.'||p_action,p_period);
end $$;
revoke all on function public.kf_hr_payroll_write(uuid,uuid,uuid,text,jsonb,jsonb,text) from public,anon,authenticated;
grant execute on function public.kf_hr_payroll_write(uuid,uuid,uuid,text,jsonb,jsonb,text) to service_role;

create or replace function public.kf_hr_input_guard() returns trigger language plpgsql set search_path=public as $$
declare status text; pid uuid; begin
  pid := case when TG_OP='DELETE' then old.period_id else new.period_id end;
  select p.status into status from public.kf_hr_periods p where id=pid for update;
  if status <> 'Draft' then raise exception 'Only draft payroll inputs can change.'; end if;
  update public.kf_hr_periods set calculated_at=null,updated_at=now() where id=pid;
  if TG_OP='DELETE' then return old; end if;
  return new;
end $$;
drop trigger if exists kf_hr_inputs_draft on public.kf_hr_inputs;
create trigger kf_hr_inputs_draft before insert or update or delete on public.kf_hr_inputs for each row execute function public.kf_hr_input_guard();
create or replace function public.kf_hr_staff_changed() returns trigger language plpgsql set search_path=public as $$
begin
  update public.kf_hr_periods set calculated_at=null,updated_at=now() where tenant_id=new.tenant_id and status='Draft';
  return new;
end $$;
drop trigger if exists kf_hr_staff_invalidate on public.kf_hr_staff;
create trigger kf_hr_staff_invalidate after insert or update on public.kf_hr_staff for each row execute function public.kf_hr_staff_changed();
notify pgrst, 'reload schema';
