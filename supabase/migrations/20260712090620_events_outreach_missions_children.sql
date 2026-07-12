create table public.event_types (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key text not null,
  display_name text not null,
  default_registration_fields text[] not null default '{}',
  default_approval_workflow_id uuid,
  default_ticketing_mode text not null default 'free',
  default_payment_handling text not null default 'none',
  default_age_restrictions text[] not null default '{}',
  guardian_consent_required boolean not null default false,
  safeguarding_level text not null default 'standard',
  speaker_required boolean not null default false,
  volunteer_required boolean not null default false,
  transport_required boolean not null default false,
  accommodation_required boolean not null default false,
  meal_required boolean not null default false,
  check_in_method text not null default 'hybrid',
  report_template_id uuid,
  follow_up_template_id uuid,
  attendance_model text not null default 'registration',
  branch_applicability text not null default 'all',
  active boolean not null default true,
  unique (tenant_id, key)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  organization_unit_id uuid references public.organization_units(id),
  event_type_id uuid references public.event_types(id),
  title text not null,
  subtitle text,
  description text,
  theme text,
  objectives text[] not null default '{}',
  target_audience text[] not null default '{}',
  age_group text not null default 'all',
  venue text,
  city text,
  latitude numeric,
  longitude numeric,
  online_hybrid_status text not null default 'onsite',
  start_date date not null,
  end_date date not null,
  registration_open_at timestamptz,
  registration_close_at timestamptz,
  capacity integer not null default 0,
  expected_attendance integer not null default 0,
  owner_user_id uuid references public.profiles(id),
  coordinator_user_id uuid references public.profiles(id),
  presiding_minister_user_id uuid references public.profiles(id),
  approval_status text not null default 'draft',
  publication_status text not null default 'private',
  registration_status text not null default 'not_open',
  payment_status text not null default 'free',
  safeguarding_level text not null default 'standard',
  security_level text not null default 'standard',
  transport_required boolean not null default false,
  accommodation_required boolean not null default false,
  meals_required boolean not null default false,
  status text not null default 'draft',
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_date_order check (end_date >= start_date)
);

create table public.event_planning_roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  permission_keys text[] not null default '{}',
  active boolean not null default true,
  unique (tenant_id, name)
);

create table public.event_team_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  planning_role_id uuid references public.event_planning_roles(id),
  role_label text not null,
  scope text not null default 'event',
  permission_keys text[] not null default '{}',
  starts_at date,
  ends_at date,
  status text not null default 'active'
);

create table public.event_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  session_type text not null,
  session_date date not null,
  start_time time,
  end_time time,
  room_id uuid,
  speaker_id uuid,
  facilitator_user_id uuid references public.profiles(id),
  capacity integer not null default 0,
  target_audience text[] not null default '{}',
  registration_required boolean not null default true,
  livestream_link text,
  volunteer_team_ids uuid[] not null default '{}',
  material_ids uuid[] not null default '{}',
  check_in_required boolean not null default false,
  status text not null default 'planned'
);

create table public.event_registration_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  capacity integer not null default 0,
  price numeric(12,2) not null default 0,
  technology_fee numeric(12,2) not null default 0,
  provider_fee numeric(12,2) not null default 0,
  eligibility text,
  age_group text,
  branch_restriction_id uuid references public.branches(id),
  approval_required boolean not null default false,
  badge_type text,
  meal_eligible boolean not null default false,
  accommodation_eligible boolean not null default false,
  transport_eligible boolean not null default false,
  session_access text[] not null default '{}'
);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  person_id uuid references public.people(id),
  category_id uuid references public.event_registration_categories(id),
  branch_id uuid references public.branches(id),
  age_group text,
  household_id uuid references public.households(id),
  guardian_person_id uuid references public.people(id),
  consent_id uuid references public.person_consents(id),
  payment_status text not null default 'free',
  accommodation_choice text,
  transport_choice text,
  meal_choice text,
  accessibility_needs text,
  emergency_contact text,
  check_in_status text not null default 'not_checked_in',
  attendance_status text not null default 'registered',
  registration_source text not null default 'public',
  status text not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_waitlists (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  registration_id uuid references public.event_registrations(id),
  category_id uuid references public.event_registration_categories(id),
  priority integer not null default 100,
  promotion_deadline timestamptz,
  alternative_event_id uuid references public.events(id),
  status text not null default 'waiting'
);

create table public.event_tickets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  registration_id uuid references public.event_registrations(id),
  code text not null unique,
  qr_payload text not null,
  access_level text not null default 'full_event',
  issued_at timestamptz,
  expires_at timestamptz,
  transfer_policy text not null default 'not_transferable',
  status text not null default 'issued'
);

create table public.event_ticket_scans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  ticket_id uuid references public.event_tickets(id),
  scanned_at timestamptz not null default now(),
  scanned_by_user_id uuid references public.profiles(id),
  gate text,
  result text not null,
  reason text
);

create table public.event_badges (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  registration_id uuid references public.event_registrations(id),
  event_id uuid references public.events(id),
  display_name text not null,
  category_label text,
  branch_label text,
  role_label text,
  qr_payload text,
  access_zone text,
  emergency_marker boolean not null default false,
  meal_indicator text,
  transport_indicator text,
  accommodation_indicator text,
  child_pickup_code_placeholder text,
  status text not null default 'ready'
);

create table public.event_check_ins (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.events(id),
  registration_id uuid references public.event_registrations(id),
  checked_at timestamptz not null default now(),
  gate_location text,
  checked_in_by uuid references public.profiles(id),
  method text not null,
  ticket_status text,
  attendance_status text,
  re_entry boolean not null default false,
  denied_reason text,
  notes text
);

create table public.event_check_outs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.events(id),
  registration_id uuid references public.event_registrations(id),
  checked_out_at timestamptz not null default now(),
  checked_out_by uuid references public.profiles(id),
  reason text
);

create table public.event_speakers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.events(id),
  name text not null,
  title text,
  ministry_organization text,
  restricted_contact text,
  public_biography text,
  photo_url text,
  arrival_at timestamptz,
  departure_at timestamptz,
  transport_need text,
  accommodation_need text,
  hospitality_need text,
  technical_needs text[] not null default '{}',
  consent_status text,
  speaking_agreement_placeholder text,
  honorarium_placeholder text,
  status text not null default 'invited'
);

create table public.event_venues (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.events(id),
  name text not null,
  address text,
  city text,
  status text not null default 'planned'
);

create table public.event_rooms (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.events(id),
  venue_id uuid references public.event_venues(id),
  name text not null,
  space_type text,
  capacity integer not null default 0,
  setup_style text,
  equipment text[] not null default '{}',
  accessibility text[] not null default '{}',
  responsible_team text,
  readiness_status text not null default 'not_started',
  issue_log text
);

create table public.event_seating_zones (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.events(id),
  room_id uuid references public.event_rooms(id),
  name text not null,
  zone_type text not null,
  capacity integer not null default 0,
  reserved boolean not null default false
);

create table public.event_meal_plans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.events(id),
  meal_type text not null,
  meal_date date,
  serving_time time,
  quantity integer not null default 0,
  dietary_requirements text[] not null default '{}',
  caterer_placeholder text,
  status text not null default 'planned'
);

create table public.event_meal_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  meal_plan_id uuid references public.event_meal_plans(id),
  registration_id uuid references public.event_registrations(id),
  meal_ticket_code text,
  served_at timestamptz,
  status text not null default 'assigned'
);

create table public.event_accommodation_sites (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.events(id),
  site_type text not null,
  name text not null,
  capacity integer not null default 0,
  status text not null default 'available'
);

create table public.event_room_allocations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.events(id),
  accommodation_site_id uuid references public.event_accommodation_sites(id),
  registration_id uuid references public.event_registrations(id),
  room_label text,
  bed_label text,
  check_in_at timestamptz,
  check_out_at timestamptz,
  roommate_preference text,
  family_grouping boolean not null default false,
  gender_age_safeguarding_status text not null default 'not_required',
  accessibility text,
  cost numeric(12,2) not null default 0,
  payment_status text not null default 'free',
  transport_link_id uuid,
  emergency_contact text,
  status text not null default 'assigned'
);

create table public.event_transport_routes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.events(id),
  route_name text not null,
  pickup_point text,
  departure_time timestamptz,
  return_time timestamptz,
  vehicle_label text,
  driver_label text,
  capacity integer not null default 0,
  accessibility text,
  payment_status text not null default 'free',
  incident_summary text,
  status text not null default 'planned'
);

create table public.event_vehicles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.events(id),
  route_id uuid references public.event_transport_routes(id),
  vehicle_type text,
  vehicle_label text,
  driver_label text,
  capacity integer not null default 0,
  status text not null default 'planned'
);

create table public.event_passenger_manifests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  route_id uuid references public.event_transport_routes(id),
  vehicle_id uuid references public.event_vehicles(id),
  registration_id uuid references public.event_registrations(id),
  seat_placeholder text,
  boarded boolean not null default false,
  no_show boolean not null default false,
  disembarked boolean not null default false,
  guardian_person_id uuid references public.people(id),
  child_status text not null default 'not_child',
  emergency_contact text,
  return_boarded boolean not null default false
);

create table public.event_public_pages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.events(id),
  slug text not null,
  approved_content jsonb not null default '{}'::jsonb,
  privacy_notice text,
  published boolean not null default false,
  approved_by uuid references public.profiles(id),
  unique (tenant_id, slug)
);

create table public.event_reports (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.events(id),
  status text not null default 'draft',
  attendance_summary jsonb not null default '{}'::jsonb,
  financial_summary jsonb not null default '{}'::jsonb,
  safe_incident_summary text,
  outreach_summary text,
  follow_up_actions text[] not null default '{}',
  submitted_by uuid references public.profiles(id),
  reviewed_by uuid references public.profiles(id)
);

create table public.event_feedback (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.events(id),
  registration_id uuid references public.event_registrations(id),
  feedback_type text,
  anonymous boolean not null default false,
  satisfaction integer,
  logistics_notes text,
  programme_quality_notes text,
  safeguarding_concern boolean not null default false,
  follow_up_requested boolean not null default false,
  consent_to_publish boolean not null default false
);

create table public.event_lost_found (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.events(id),
  item_description text not null,
  found_location text,
  found_at timestamptz,
  found_by text,
  photo_url text,
  storage_location text,
  claimant_person_id uuid references public.people(id),
  verification_notes text,
  released_at timestamptz,
  status text not null default 'found'
);

create table public.outreach_campaigns (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid references public.events(id),
  branch_id uuid references public.branches(id),
  name text not null,
  outreach_type text not null,
  location text,
  campaign_date date,
  target_area text,
  leader_user_id uuid references public.profiles(id),
  materials text[] not null default '{}',
  transport_route_id uuid,
  permissions_placeholder text,
  goals text[] not null default '{}',
  people_contacted integer not null default 0,
  invitations integer not null default 0,
  visitor_registrations integer not null default 0,
  new_converts integer not null default 0,
  referrals integer not null default 0,
  report_summary text,
  status text not null default 'planned'
);

create table public.outreach_teams (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  campaign_id uuid references public.outreach_campaigns(id),
  user_id uuid references public.profiles(id),
  role text not null,
  roster_assignment_id uuid references public.roster_assignments(id),
  status text not null default 'assigned'
);

create table public.outreach_contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  campaign_id uuid references public.outreach_campaigns(id),
  person_id uuid references public.people(id),
  name text not null,
  phone text,
  email text,
  location text,
  preferred_contact text,
  consent boolean not null default false,
  prayer_request text,
  church_interest boolean not null default false,
  programme_interest boolean not null default false,
  fellowship_interest boolean not null default false,
  new_convert_status text not null default 'none',
  source_campaign text,
  status text not null default 'captured'
);

create table public.mission_trips (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  title text not null,
  mission_type text not null,
  destination text not null,
  start_date date,
  end_date date,
  leader_user_id uuid references public.profiles(id),
  objectives text[] not null default '{}',
  host_church text,
  travel_summary text,
  accommodation_summary text,
  meals_summary text,
  budget_placeholder text,
  emergency_plan text,
  safeguarding_level text not null default 'standard',
  communications_plan text,
  report_summary text,
  status text not null default 'proposed'
);

create table public.mission_team_applications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  mission_trip_id uuid references public.mission_trips(id),
  person_id uuid references public.people(id),
  eligibility_notes text,
  prerequisites text[] not null default '{}',
  pastoral_recommendation_status text not null default 'pending',
  fundraising_placeholder text,
  payment_status text not null default 'pending',
  approval_status text not null default 'submitted',
  readiness_status text not null default 'training_needed'
);

create table public.mission_team_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  mission_trip_id uuid references public.mission_trips(id),
  application_id uuid references public.mission_team_applications(id),
  person_id uuid references public.people(id),
  role text,
  status text not null default 'assigned'
);

create table public.mission_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  mission_trip_id uuid references public.mission_trips(id),
  person_id uuid references public.people(id),
  document_type text not null,
  storage_path text not null,
  restricted boolean not null default true,
  uploaded_by uuid references public.profiles(id),
  status text not null default 'stored'
);

create table public.children_ministry_classes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  event_id uuid references public.events(id),
  name text not null,
  age_range text,
  room_id uuid references public.event_rooms(id),
  teacher_user_ids uuid[] not null default '{}',
  capacity integer not null default 0,
  safeguarding_rule_id uuid,
  status text not null default 'active'
);

create table public.children_class_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  class_id uuid references public.children_ministry_classes(id),
  child_person_id uuid references public.people(id),
  guardian_person_id uuid references public.people(id),
  status text not null default 'assigned'
);

create table public.authorized_pickups (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  child_person_id uuid references public.people(id),
  authorized_person_id uuid references public.people(id),
  relationship text,
  photo_url text,
  phone text,
  pickup_code text not null,
  temporary_authorization boolean not null default false,
  restriction text,
  expires_at timestamptz,
  emergency_override boolean not null default false,
  status text not null default 'active'
);

create table public.child_check_ins (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  child_person_id uuid references public.people(id),
  class_id uuid references public.children_ministry_classes(id),
  event_id uuid references public.events(id),
  checked_in_at timestamptz not null default now(),
  checked_in_by uuid references public.profiles(id),
  pickup_code text not null,
  attendance_status text not null default 'present',
  status text not null default 'present'
);

create table public.child_check_outs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  child_check_in_id uuid references public.child_check_ins(id),
  released_to_person_id uuid references public.people(id),
  checked_out_at timestamptz not null default now(),
  checked_out_by uuid references public.profiles(id),
  method text,
  status text not null default 'released'
);

create table public.child_pickup_attempts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  child_check_in_id uuid references public.child_check_ins(id),
  attempted_by_person_id uuid references public.people(id),
  code_presented text,
  successful boolean not null default false,
  reason text,
  recorded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.children_incidents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  child_person_id uuid references public.people(id),
  event_id uuid references public.events(id),
  class_id uuid references public.children_ministry_classes(id),
  category text not null,
  safe_summary text,
  restricted_details text,
  routed_to_safeguarding boolean not null default false,
  status text not null default 'open'
);

create table public.safeguarding_ratio_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  age_group text not null,
  minimum_volunteers integer not null default 2,
  children_per_adult integer not null default 10,
  two_adult_rule boolean not null default true,
  trained_volunteer_required boolean not null default true,
  room_capacity integer,
  check_in_rules text[] not null default '{}',
  active boolean not null default true
);

create table public.teen_ministry_groups (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  name text not null,
  guardian_consent_required boolean not null default true,
  communication_rules text[] not null default '{}',
  status text not null default 'active'
);

create table public.youth_ministry_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid references public.people(id),
  branch_id uuid references public.branches(id),
  age_band text not null,
  programme_ids uuid[] not null default '{}',
  mentor_user_id uuid references public.profiles(id),
  guardian_consent_required boolean not null default false,
  next_step text,
  status text not null default 'active'
);

create table public.campus_institutions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  city text,
  status text not null default 'active'
);

create table public.campus_fellowships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  institution_id uuid references public.campus_institutions(id),
  campus text,
  fellowship_name text not null,
  branch_id uuid references public.branches(id),
  student_leader_user_id uuid references public.profiles(id),
  chaplain_user_id uuid references public.profiles(id),
  meeting_schedule text,
  status text not null default 'active'
);

create table public.campus_transitions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid references public.people(id),
  campus_fellowship_id uuid references public.campus_fellowships(id),
  transition_type text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.event_activity_signals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid references public.people(id),
  event_id uuid references public.events(id),
  signal_type text not null,
  occurred_at timestamptz not null default now(),
  billable_eligible boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create index events_tenant_branch_idx on public.events(tenant_id, branch_id, start_date);
create index event_registrations_event_idx on public.event_registrations(event_id, status, payment_status);
create index child_check_ins_event_idx on public.child_check_ins(event_id, class_id, status);
create index mission_documents_trip_idx on public.mission_documents(mission_trip_id, person_id);
create index outreach_contacts_campaign_idx on public.outreach_contacts(campaign_id, status);

alter table public.event_types enable row level security;
alter table public.events enable row level security;
alter table public.event_planning_roles enable row level security;
alter table public.event_team_assignments enable row level security;
alter table public.event_sessions enable row level security;
alter table public.event_registration_categories enable row level security;
alter table public.event_registrations enable row level security;
alter table public.event_waitlists enable row level security;
alter table public.event_tickets enable row level security;
alter table public.event_ticket_scans enable row level security;
alter table public.event_badges enable row level security;
alter table public.event_check_ins enable row level security;
alter table public.event_check_outs enable row level security;
alter table public.event_speakers enable row level security;
alter table public.event_venues enable row level security;
alter table public.event_rooms enable row level security;
alter table public.event_seating_zones enable row level security;
alter table public.event_meal_plans enable row level security;
alter table public.event_meal_assignments enable row level security;
alter table public.event_accommodation_sites enable row level security;
alter table public.event_room_allocations enable row level security;
alter table public.event_transport_routes enable row level security;
alter table public.event_vehicles enable row level security;
alter table public.event_passenger_manifests enable row level security;
alter table public.event_public_pages enable row level security;
alter table public.event_reports enable row level security;
alter table public.event_feedback enable row level security;
alter table public.event_lost_found enable row level security;
alter table public.outreach_campaigns enable row level security;
alter table public.outreach_teams enable row level security;
alter table public.outreach_contacts enable row level security;
alter table public.mission_trips enable row level security;
alter table public.mission_team_applications enable row level security;
alter table public.mission_team_members enable row level security;
alter table public.mission_documents enable row level security;
alter table public.children_ministry_classes enable row level security;
alter table public.children_class_assignments enable row level security;
alter table public.authorized_pickups enable row level security;
alter table public.child_check_ins enable row level security;
alter table public.child_check_outs enable row level security;
alter table public.child_pickup_attempts enable row level security;
alter table public.children_incidents enable row level security;
alter table public.safeguarding_ratio_rules enable row level security;
alter table public.teen_ministry_groups enable row level security;
alter table public.youth_ministry_records enable row level security;
alter table public.campus_institutions enable row level security;
alter table public.campus_fellowships enable row level security;
alter table public.campus_transitions enable row level security;
alter table public.event_activity_signals enable row level security;

create policy "event types read" on public.event_types for select to authenticated using (public.has_permission(tenant_id, 'event.view') or public.has_permission(tenant_id, 'event.settings.manage'));
create policy "event types manage" on public.event_types for all to authenticated using (public.has_permission(tenant_id, 'event.settings.manage')) with check (public.has_permission(tenant_id, 'event.settings.manage'));
create policy "events scoped read" on public.events for select to authenticated using (public.has_permission(tenant_id, 'event.view') or auth.uid() in (owner_user_id, coordinator_user_id, presiding_minister_user_id) or exists (select 1 from public.event_team_assignments eta where eta.event_id = events.id and eta.user_id = auth.uid() and eta.status = 'active'));
create policy "events public read" on public.events for select to anon using (publication_status = 'public' and status in ('published','registration_open','in_progress','completed'));
create policy "events manage" on public.events for all to authenticated using (public.has_permission(tenant_id, 'event.create') or public.has_permission(tenant_id, 'event.update')) with check (public.has_permission(tenant_id, 'event.create') or public.has_permission(tenant_id, 'event.update'));
create policy "event planning roles read" on public.event_planning_roles for select to authenticated using (public.has_permission(tenant_id, 'event.view') or public.has_permission(tenant_id, 'event.settings.manage'));
create policy "event planning roles manage" on public.event_planning_roles for all to authenticated using (public.has_permission(tenant_id, 'event.settings.manage')) with check (public.has_permission(tenant_id, 'event.settings.manage'));
create policy "event team read" on public.event_team_assignments for select to authenticated using (public.has_permission(tenant_id, 'event.view') or user_id = auth.uid());
create policy "event team manage" on public.event_team_assignments for all to authenticated using (public.has_permission(tenant_id, 'event.update')) with check (public.has_permission(tenant_id, 'event.update'));
create policy "event sessions read" on public.event_sessions for select to authenticated using (public.has_permission(tenant_id, 'event.view') or public.has_permission(tenant_id, 'event.session.manage'));
create policy "event sessions manage" on public.event_sessions for all to authenticated using (public.has_permission(tenant_id, 'event.session.manage')) with check (public.has_permission(tenant_id, 'event.session.manage'));
create policy "event categories public read" on public.event_registration_categories for select to anon using (exists (select 1 from public.events e where e.id = event_id and e.publication_status = 'public'));
create policy "event categories read" on public.event_registration_categories for select to authenticated using (public.has_permission(tenant_id, 'event.registration.view') or public.has_permission(tenant_id, 'event.view'));
create policy "event categories manage" on public.event_registration_categories for all to authenticated using (public.has_permission(tenant_id, 'event.registration.manage')) with check (public.has_permission(tenant_id, 'event.registration.manage'));
create policy "event registrations public insert" on public.event_registrations for insert to anon with check (exists (select 1 from public.events e where e.id = event_id and e.publication_status = 'public' and e.registration_status = 'open'));
create policy "event registrations scoped read" on public.event_registrations for select to authenticated using (public.has_permission(tenant_id, 'event.registration.view') or exists (select 1 from public.event_team_assignments eta where eta.event_id = event_registrations.event_id and eta.user_id = auth.uid() and eta.status = 'active'));
create policy "event registrations manage" on public.event_registrations for all to authenticated using (public.has_permission(tenant_id, 'event.registration.manage')) with check (public.has_permission(tenant_id, 'event.registration.manage'));
create policy "event waitlists read" on public.event_waitlists for select to authenticated using (public.has_permission(tenant_id, 'event.registration.view'));
create policy "event waitlists manage" on public.event_waitlists for all to authenticated using (public.has_permission(tenant_id, 'event.registration.manage')) with check (public.has_permission(tenant_id, 'event.registration.manage'));
create policy "event check in read" on public.event_check_ins for select to authenticated using (public.has_permission(tenant_id, 'event.registration.view') or public.has_permission(tenant_id, 'event.check_in'));
create policy "event check in manage" on public.event_check_ins for all to authenticated using (public.has_permission(tenant_id, 'event.check_in')) with check (public.has_permission(tenant_id, 'event.check_in'));
create policy "event checkout manage" on public.event_check_outs for all to authenticated using (public.has_permission(tenant_id, 'event.check_out')) with check (public.has_permission(tenant_id, 'event.check_out'));
create policy "event tickets read" on public.event_tickets for select to authenticated using (public.has_permission(tenant_id, 'event.registration.view') or public.has_permission(tenant_id, 'event.check_in'));
create policy "event tickets manage" on public.event_tickets for all to authenticated using (public.has_permission(tenant_id, 'event.ticket.issue')) with check (public.has_permission(tenant_id, 'event.ticket.issue'));
create policy "event scans read" on public.event_ticket_scans for select to authenticated using (public.has_permission(tenant_id, 'event.check_in') or public.has_permission(tenant_id, 'event.registration.view'));
create policy "event scans manage" on public.event_ticket_scans for all to authenticated using (public.has_permission(tenant_id, 'event.check_in')) with check (public.has_permission(tenant_id, 'event.check_in'));
create policy "event badges read" on public.event_badges for select to authenticated using (public.has_permission(tenant_id, 'event.registration.view') or public.has_permission(tenant_id, 'event.check_in'));
create policy "event badges manage" on public.event_badges for all to authenticated using (public.has_permission(tenant_id, 'event.ticket.issue')) with check (public.has_permission(tenant_id, 'event.ticket.issue'));
create policy "event venues read" on public.event_venues for select to authenticated using (public.has_permission(tenant_id, 'event.view'));
create policy "event venues manage" on public.event_venues for all to authenticated using (public.has_permission(tenant_id, 'event.update')) with check (public.has_permission(tenant_id, 'event.update'));
create policy "event logistics read" on public.event_rooms for select to authenticated using (public.has_permission(tenant_id, 'event.view'));
create policy "event rooms manage" on public.event_rooms for all to authenticated using (public.has_permission(tenant_id, 'event.update')) with check (public.has_permission(tenant_id, 'event.update'));
create policy "event seating read" on public.event_seating_zones for select to authenticated using (public.has_permission(tenant_id, 'event.view'));
create policy "event seating manage" on public.event_seating_zones for all to authenticated using (public.has_permission(tenant_id, 'event.update')) with check (public.has_permission(tenant_id, 'event.update'));
create policy "event speaker read" on public.event_speakers for select to authenticated using (public.has_permission(tenant_id, 'event.speaker.manage') or public.has_permission(tenant_id, 'event.view'));
create policy "event speaker manage" on public.event_speakers for all to authenticated using (public.has_permission(tenant_id, 'event.speaker.manage')) with check (public.has_permission(tenant_id, 'event.speaker.manage'));
create policy "event transport read" on public.event_transport_routes for select to authenticated using (public.has_permission(tenant_id, 'event.transport.manage') or public.has_permission(tenant_id, 'event.view'));
create policy "event transport manage" on public.event_transport_routes for all to authenticated using (public.has_permission(tenant_id, 'event.transport.manage')) with check (public.has_permission(tenant_id, 'event.transport.manage'));
create policy "event manifests restricted read" on public.event_passenger_manifests for select to authenticated using (public.has_permission(tenant_id, 'event.transport.manage') or public.has_permission(tenant_id, 'event.safeguarding.manage'));
create policy "event manifests manage" on public.event_passenger_manifests for all to authenticated using (public.has_permission(tenant_id, 'event.transport.manage')) with check (public.has_permission(tenant_id, 'event.transport.manage'));
create policy "event accommodation restricted read" on public.event_room_allocations for select to authenticated using (public.has_permission(tenant_id, 'event.accommodation.manage') or public.has_permission(tenant_id, 'event.safeguarding.manage'));
create policy "event accommodation manage" on public.event_room_allocations for all to authenticated using (public.has_permission(tenant_id, 'event.accommodation.manage')) with check (public.has_permission(tenant_id, 'event.accommodation.manage'));
create policy "event accommodation sites read" on public.event_accommodation_sites for select to authenticated using (public.has_permission(tenant_id, 'event.accommodation.manage') or public.has_permission(tenant_id, 'event.view'));
create policy "event accommodation sites manage" on public.event_accommodation_sites for all to authenticated using (public.has_permission(tenant_id, 'event.accommodation.manage')) with check (public.has_permission(tenant_id, 'event.accommodation.manage'));
create policy "event meals read" on public.event_meal_plans for select to authenticated using (public.has_permission(tenant_id, 'event.meals.manage') or public.has_permission(tenant_id, 'event.view'));
create policy "event meals manage" on public.event_meal_plans for all to authenticated using (public.has_permission(tenant_id, 'event.meals.manage')) with check (public.has_permission(tenant_id, 'event.meals.manage'));
create policy "event meal assignments read" on public.event_meal_assignments for select to authenticated using (public.has_permission(tenant_id, 'event.meals.manage') or public.has_permission(tenant_id, 'event.registration.view'));
create policy "event meal assignments manage" on public.event_meal_assignments for all to authenticated using (public.has_permission(tenant_id, 'event.meals.manage')) with check (public.has_permission(tenant_id, 'event.meals.manage'));
create policy "event vehicles read" on public.event_vehicles for select to authenticated using (public.has_permission(tenant_id, 'event.transport.manage') or public.has_permission(tenant_id, 'event.view'));
create policy "event vehicles manage" on public.event_vehicles for all to authenticated using (public.has_permission(tenant_id, 'event.transport.manage')) with check (public.has_permission(tenant_id, 'event.transport.manage'));
create policy "event public pages anon read" on public.event_public_pages for select to anon using (published);
create policy "event public pages manage" on public.event_public_pages for all to authenticated using (public.has_permission(tenant_id, 'event.publish')) with check (public.has_permission(tenant_id, 'event.publish'));
create policy "event reports read" on public.event_reports for select to authenticated using (public.has_permission(tenant_id, 'event.report.view'));
create policy "event reports manage" on public.event_reports for all to authenticated using (public.has_permission(tenant_id, 'event.report.manage')) with check (public.has_permission(tenant_id, 'event.report.manage'));
create policy "event feedback insert" on public.event_feedback for insert to anon with check (safeguarding_concern = false or follow_up_requested = true);
create policy "event feedback read" on public.event_feedback for select to authenticated using (public.has_permission(tenant_id, 'event.report.view') or public.has_permission(tenant_id, 'event.safeguarding.manage'));
create policy "event lost found read" on public.event_lost_found for select to authenticated using (public.has_permission(tenant_id, 'event.view'));
create policy "event lost found manage" on public.event_lost_found for all to authenticated using (public.has_permission(tenant_id, 'event.update')) with check (public.has_permission(tenant_id, 'event.update'));
create policy "outreach read" on public.outreach_campaigns for select to authenticated using (public.has_permission(tenant_id, 'outreach.view') or public.has_permission(tenant_id, 'outreach.manage'));
create policy "outreach manage" on public.outreach_campaigns for all to authenticated using (public.has_permission(tenant_id, 'outreach.manage')) with check (public.has_permission(tenant_id, 'outreach.manage'));
create policy "outreach teams read" on public.outreach_teams for select to authenticated using (public.has_permission(tenant_id, 'outreach.view') or public.has_permission(tenant_id, 'outreach.manage') or user_id = auth.uid());
create policy "outreach teams manage" on public.outreach_teams for all to authenticated using (public.has_permission(tenant_id, 'outreach.manage')) with check (public.has_permission(tenant_id, 'outreach.manage'));
create policy "outreach contacts public insert" on public.outreach_contacts for insert to anon with check (consent = true);
create policy "outreach contacts restricted read" on public.outreach_contacts for select to authenticated using (public.has_permission(tenant_id, 'outreach.manage') or public.has_permission(tenant_id, 'follow_up.assign'));
create policy "missions read" on public.mission_trips for select to authenticated using (public.has_permission(tenant_id, 'mission.view') or public.has_permission(tenant_id, 'mission.manage'));
create policy "missions manage" on public.mission_trips for all to authenticated using (public.has_permission(tenant_id, 'mission.manage')) with check (public.has_permission(tenant_id, 'mission.manage'));
create policy "mission applications read" on public.mission_team_applications for select to authenticated using (public.has_permission(tenant_id, 'mission.view') or public.has_permission(tenant_id, 'mission.manage'));
create policy "mission applications manage" on public.mission_team_applications for all to authenticated using (public.has_permission(tenant_id, 'mission.manage')) with check (public.has_permission(tenant_id, 'mission.manage'));
create policy "mission members read" on public.mission_team_members for select to authenticated using (public.has_permission(tenant_id, 'mission.view') or public.has_permission(tenant_id, 'mission.manage'));
create policy "mission members manage" on public.mission_team_members for all to authenticated using (public.has_permission(tenant_id, 'mission.manage')) with check (public.has_permission(tenant_id, 'mission.manage'));
create policy "mission docs restricted read" on public.mission_documents for select to authenticated using (restricted = false or public.has_permission(tenant_id, 'mission.manage'));
create policy "mission docs manage" on public.mission_documents for all to authenticated using (public.has_permission(tenant_id, 'mission.manage')) with check (public.has_permission(tenant_id, 'mission.manage'));
create policy "children basic read" on public.children_ministry_classes for select to authenticated using (public.has_permission(tenant_id, 'children.view_basic') or public.has_permission(tenant_id, 'children.class.manage'));
create policy "children class manage" on public.children_ministry_classes for all to authenticated using (public.has_permission(tenant_id, 'children.class.manage')) with check (public.has_permission(tenant_id, 'children.class.manage'));
create policy "children assignments read" on public.children_class_assignments for select to authenticated using (public.has_permission(tenant_id, 'children.view_basic') or public.has_permission(tenant_id, 'children.class.manage'));
create policy "children assignments manage" on public.children_class_assignments for all to authenticated using (public.has_permission(tenant_id, 'children.class.manage')) with check (public.has_permission(tenant_id, 'children.class.manage'));
create policy "child checkin restricted read" on public.child_check_ins for select to authenticated using (public.has_permission(tenant_id, 'children.view_basic') or public.has_permission(tenant_id, 'children.check_in') or public.has_permission(tenant_id, 'children.check_out'));
create policy "child checkin manage" on public.child_check_ins for all to authenticated using (public.has_permission(tenant_id, 'children.check_in')) with check (public.has_permission(tenant_id, 'children.check_in'));
create policy "child checkout manage" on public.child_check_outs for all to authenticated using (public.has_permission(tenant_id, 'children.check_out')) with check (public.has_permission(tenant_id, 'children.check_out'));
create policy "authorized pickup restricted read" on public.authorized_pickups for select to authenticated using (public.has_permission(tenant_id, 'children.pickup.manage') or public.has_permission(tenant_id, 'children.view_sensitive'));
create policy "authorized pickup manage" on public.authorized_pickups for all to authenticated using (public.has_permission(tenant_id, 'children.pickup.manage')) with check (public.has_permission(tenant_id, 'children.pickup.manage'));
create policy "child pickup attempts read" on public.child_pickup_attempts for select to authenticated using (public.has_permission(tenant_id, 'children.pickup.manage') or public.has_permission(tenant_id, 'children.view_sensitive'));
create policy "child pickup attempts manage" on public.child_pickup_attempts for all to authenticated using (public.has_permission(tenant_id, 'children.pickup.manage')) with check (public.has_permission(tenant_id, 'children.pickup.manage'));
create policy "children incidents restricted read" on public.children_incidents for select to authenticated using (public.has_permission(tenant_id, 'children.view_sensitive') or public.has_permission(tenant_id, 'event.safeguarding.manage'));
create policy "children incidents manage" on public.children_incidents for all to authenticated using (public.has_permission(tenant_id, 'event.safeguarding.manage')) with check (public.has_permission(tenant_id, 'event.safeguarding.manage'));
create policy "safeguarding ratio read" on public.safeguarding_ratio_rules for select to authenticated using (public.has_permission(tenant_id, 'children.view_basic') or public.has_permission(tenant_id, 'event.safeguarding.manage'));
create policy "safeguarding ratio manage" on public.safeguarding_ratio_rules for all to authenticated using (public.has_permission(tenant_id, 'event.safeguarding.manage')) with check (public.has_permission(tenant_id, 'event.safeguarding.manage'));
create policy "teen groups read" on public.teen_ministry_groups for select to authenticated using (public.has_permission(tenant_id, 'youth.manage') or public.has_permission(tenant_id, 'event.view'));
create policy "teen groups manage" on public.teen_ministry_groups for all to authenticated using (public.has_permission(tenant_id, 'youth.manage')) with check (public.has_permission(tenant_id, 'youth.manage'));
create policy "youth read" on public.youth_ministry_records for select to authenticated using (public.has_permission(tenant_id, 'youth.manage') or public.has_permission(tenant_id, 'event.view'));
create policy "youth manage" on public.youth_ministry_records for all to authenticated using (public.has_permission(tenant_id, 'youth.manage')) with check (public.has_permission(tenant_id, 'youth.manage'));
create policy "campus institutions read" on public.campus_institutions for select to authenticated using (public.has_permission(tenant_id, 'campus_ministry.manage') or public.has_permission(tenant_id, 'event.view'));
create policy "campus institutions manage" on public.campus_institutions for all to authenticated using (public.has_permission(tenant_id, 'campus_ministry.manage')) with check (public.has_permission(tenant_id, 'campus_ministry.manage'));
create policy "campus read" on public.campus_fellowships for select to authenticated using (public.has_permission(tenant_id, 'campus_ministry.manage') or public.has_permission(tenant_id, 'event.view'));
create policy "campus manage" on public.campus_fellowships for all to authenticated using (public.has_permission(tenant_id, 'campus_ministry.manage')) with check (public.has_permission(tenant_id, 'campus_ministry.manage'));
create policy "campus transitions read" on public.campus_transitions for select to authenticated using (public.has_permission(tenant_id, 'campus_ministry.manage') or public.has_permission(tenant_id, 'event.view'));
create policy "campus transitions manage" on public.campus_transitions for all to authenticated using (public.has_permission(tenant_id, 'campus_ministry.manage')) with check (public.has_permission(tenant_id, 'campus_ministry.manage'));
create policy "event activity read" on public.event_activity_signals for select to authenticated using (public.has_permission(tenant_id, 'event.report.view'));
create policy "event activity manage" on public.event_activity_signals for all to authenticated using (public.has_permission(tenant_id, 'event.report.manage')) with check (public.has_permission(tenant_id, 'event.report.manage'));

insert into public.permission_groups (key, label, sort_order) values
('events_missions_children', 'Events, Missions & Children', 80)
on conflict (key) do update set label = excluded.label, sort_order = excluded.sort_order;

insert into public.permissions (key, description, group_key, label, sensitive) values
('event.view','View scoped events.','events_missions_children','View events',false),
('event.create','Create events.','events_missions_children','Create events',false),
('event.update','Update events.','events_missions_children','Update events',false),
('event.approve','Approve events.','events_missions_children','Approve events',true),
('event.publish','Publish events.','events_missions_children','Publish events',true),
('event.cancel','Cancel events.','events_missions_children','Cancel events',true),
('event.registration.view','View event registrations.','events_missions_children','View registrations',true),
('event.registration.manage','Manage event registrations.','events_missions_children','Manage registrations',true),
('event.registration.approve','Approve event registrations.','events_missions_children','Approve registrations',true),
('event.payment.view','View event payment metadata.','events_missions_children','View event payments',true),
('event.payment.verify','Verify event payments.','events_missions_children','Verify event payments',true),
('event.ticket.issue','Issue event tickets.','events_missions_children','Issue tickets',true),
('event.check_in','Check in event participants.','events_missions_children','Check in',false),
('event.check_out','Check out event participants.','events_missions_children','Check out',false),
('event.session.manage','Manage event sessions.','events_missions_children','Manage sessions',false),
('event.volunteer.manage','Manage event volunteers.','events_missions_children','Manage event volunteers',false),
('event.speaker.manage','Manage event speakers.','events_missions_children','Manage speakers',true),
('event.transport.manage','Manage event transport.','events_missions_children','Manage transport',true),
('event.accommodation.manage','Manage event accommodation.','events_missions_children','Manage accommodation',true),
('event.meals.manage','Manage event meals.','events_missions_children','Manage meals',false),
('event.security.manage','Manage event security.','events_missions_children','Manage security',true),
('event.safeguarding.manage','Manage event safeguarding.','events_missions_children','Manage safeguarding',true),
('event.incident.create','Create event incidents.','events_missions_children','Create incidents',true),
('event.incident.view','View event incidents.','events_missions_children','View incidents',true),
('event.incident.manage','Manage event incidents.','events_missions_children','Manage incidents',true),
('outreach.view','View outreach.','events_missions_children','View outreach',false),
('outreach.manage','Manage outreach.','events_missions_children','Manage outreach',true),
('mission.view','View missions.','events_missions_children','View missions',false),
('mission.manage','Manage missions.','events_missions_children','Manage missions',true),
('children.view_basic','View basic child ministry records.','events_missions_children','View child basics',true),
('children.view_sensitive','View sensitive child ministry records.','events_missions_children','View child sensitive',true),
('children.check_in','Check in children.','events_missions_children','Child check-in',true),
('children.check_out','Check out children.','events_missions_children','Child check-out',true),
('children.pickup.manage','Manage authorized pickup.','events_missions_children','Manage pickup',true),
('children.class.manage','Manage children classes.','events_missions_children','Manage children classes',true),
('youth.manage','Manage youth ministry.','events_missions_children','Manage youth',true),
('campus_ministry.manage','Manage campus ministry.','events_missions_children','Manage campus ministry',true),
('event.report.view','View event reports.','events_missions_children','View event reports',true),
('event.report.manage','Manage event reports.','events_missions_children','Manage event reports',true),
('event.report.export','Export event reports.','events_missions_children','Export event reports',true),
('event.settings.manage','Manage event settings.','events_missions_children','Manage event settings',true)
on conflict (key) do nothing;
