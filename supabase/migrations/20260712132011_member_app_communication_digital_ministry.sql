create table public.member_home_preferences (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  visible_modules text[] not null default '{}',
  low_bandwidth boolean not null default false,
  language text not null default 'en',
  unique (tenant_id, person_id)
);

create table public.member_journey_milestones (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  milestone_type text not null,
  title text not null,
  source_type text not null,
  source_id uuid,
  occurred_on date not null,
  visibility text not null default 'self',
  sensitive boolean not null default false
);

create table public.next_step_definitions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  pathway text not null,
  eligibility_stage text,
  prerequisite text,
  branch_id uuid references public.branches(id),
  age_group text,
  ministry_id uuid,
  programme_id uuid references public.programmes(id),
  responsible_user_id uuid references public.profiles(id),
  automated_suggestion boolean not null default true,
  completion_criteria text,
  active boolean not null default true
);

create table public.member_next_steps (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid references public.people(id) on delete cascade,
  definition_id uuid references public.next_step_definitions(id),
  assigned_by uuid references public.profiles(id),
  due_date date,
  reminder_enabled boolean not null default true,
  status text not null default 'suggested'
);

create table public.digital_membership_cards (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid references public.people(id) on delete cascade,
  card_number text not null,
  qr_code text not null,
  issue_date date not null,
  expiry_date date,
  status text not null default 'active',
  unique (tenant_id, card_number),
  unique (tenant_id, qr_code)
);

create table public.member_directory_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid references public.people(id) on delete cascade,
  display_name text not null,
  branch_id uuid references public.branches(id),
  fellowship_id uuid,
  visible boolean not null default false,
  guardian_required boolean not null default false,
  contact_visibility text not null default 'hidden'
);

create table public.member_blocks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  blocker_person_id uuid references public.people(id),
  blocked_person_id uuid references public.people(id),
  reason text,
  created_at timestamptz not null default now()
);

create table public.member_reports (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  reporter_person_id uuid references public.people(id),
  reported_person_id uuid references public.people(id),
  report_type text not null,
  source_type text,
  source_id uuid,
  routed_to text not null,
  status text not null default 'submitted',
  created_at timestamptz not null default now()
);

create table public.sermon_series (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  description text,
  artwork_path text,
  speaker_user_ids uuid[] not null default '{}',
  start_date date,
  end_date date,
  reading_plan_id uuid,
  featured boolean not null default false,
  branch_id uuid references public.branches(id),
  ministry_id uuid
);

create table public.sermons (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  series_id uuid references public.sermon_series(id),
  service_id uuid references public.services(id),
  event_id uuid references public.events(id),
  title text not null,
  speaker_user_id uuid references public.profiles(id),
  branch_id uuid references public.branches(id),
  sermon_date date not null,
  description text,
  topics text[] not null default '{}',
  tags text[] not null default '{}',
  language text not null default 'en',
  duration_seconds integer,
  thumbnail_path text,
  status text not null default 'draft',
  visibility text not null default 'members',
  featured boolean not null default false
);

create table public.sermon_scriptures (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sermon_id uuid references public.sermons(id) on delete cascade,
  book text not null,
  chapter integer not null,
  verse_start integer,
  verse_end integer,
  translation_reference text
);

create table public.sermon_media (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sermon_id uuid references public.sermons(id) on delete cascade,
  media_type text not null,
  media_url text,
  file_path text,
  provider text,
  processing_status text not null default 'queued',
  captions_path text,
  transcript_id uuid,
  downloadable boolean not null default false
);

create table public.sermon_transcripts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sermon_id uuid references public.sermons(id) on delete cascade,
  language text not null default 'en',
  transcript_path text,
  status text not null default 'draft'
);

create table public.sermon_notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sermon_id uuid references public.sermons(id) on delete cascade,
  person_id uuid references public.people(id) on delete cascade,
  note text not null,
  timestamp_seconds integer,
  private_tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.sermon_bookmarks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sermon_id uuid references public.sermons(id) on delete cascade,
  person_id uuid references public.people(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (tenant_id, sermon_id, person_id)
);

create table public.sermon_progress (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sermon_id uuid references public.sermons(id) on delete cascade,
  person_id uuid references public.people(id) on delete cascade,
  seconds_played integer not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (tenant_id, sermon_id, person_id)
);

create table public.sermon_playlists (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid references public.people(id),
  title text not null,
  visibility text not null default 'private'
);

create table public.livestreams (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  branch_id uuid references public.branches(id),
  service_id uuid references public.services(id),
  event_id uuid references public.events(id),
  title text not null,
  provider text not null,
  stream_url text not null,
  embed_config text,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  live_status text not null default 'scheduled',
  replay_url text,
  visibility text not null default 'members',
  chat_policy text not null default 'off',
  moderation_setting text,
  secret_stream_key_path text
);

create table public.devotionals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  devotional_date date,
  author_user_id uuid references public.profiles(id),
  scripture_reference text,
  body text,
  reflection text,
  prayer text,
  action_point text,
  media_path text,
  language text not null default 'en',
  target_audience text not null default 'all',
  branch_id uuid references public.branches(id),
  ministry_id uuid,
  status text not null default 'draft'
);

create table public.bible_reading_plans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  description text,
  duration_days integer not null,
  group_plan boolean not null default false,
  church_wide boolean not null default false,
  status text not null default 'draft'
);

create table public.bible_plan_days (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  plan_id uuid references public.bible_reading_plans(id) on delete cascade,
  day_number integer not null,
  reading_reference text not null,
  reflection text,
  devotional_id uuid references public.devotionals(id)
);

create table public.member_bible_plan_progress (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  plan_id uuid references public.bible_reading_plans(id),
  person_id uuid references public.people(id),
  current_day integer not null default 1,
  missed_days integer not null default 0,
  reminder_enabled boolean not null default true,
  private_notes text,
  status text not null default 'active'
);

create table public.resource_library_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  resource_type text not null,
  file_path text,
  external_url text,
  visibility text not null default 'members',
  language text not null default 'en',
  status text not null default 'published'
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  body text not null,
  media_path text,
  priority text not null default 'normal',
  publication_time timestamptz,
  expiry_time timestamptz,
  acknowledgment_required boolean not null default false,
  channels text[] not null default '{}',
  audience_type text not null,
  audience_id uuid,
  approval_id uuid,
  status text not null default 'draft',
  created_by uuid references public.profiles(id),
  approved_by uuid references public.profiles(id)
);

create table public.announcement_audiences (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  announcement_id uuid references public.announcements(id) on delete cascade,
  audience_type text not null,
  audience_id uuid,
  branch_id uuid references public.branches(id)
);

create table public.communication_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  template_key text not null,
  title text not null,
  body text not null,
  channels text[] not null default '{}',
  active boolean not null default true,
  unique (tenant_id, template_key)
);

create table public.communication_campaigns (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  campaign_name text not null,
  source_type text,
  source_id uuid,
  status text not null default 'draft',
  scheduled_at timestamptz
);

create table public.communication_deliveries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  campaign_id uuid references public.communication_campaigns(id),
  source_type text not null,
  source_id uuid,
  person_id uuid references public.people(id),
  channel text not null,
  status text not null default 'queued',
  provider_message_id text,
  provider_evidence text,
  failure_reason text,
  cost_estimate numeric(14,4) default 0
);

create table public.communication_preferences (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid references public.people(id),
  category text not null,
  channel text not null,
  opted_in boolean not null default true,
  legal_exception_allowed boolean not null default false,
  unique (tenant_id, person_id, category, channel)
);

create table public.provider_configurations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  provider_type text not null,
  provider_name text not null,
  encrypted_credentials_path text,
  active boolean not null default false,
  production_enabled boolean not null default false
);

create table public.provider_webhooks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  provider_configuration_id uuid references public.provider_configurations(id),
  event_type text not null,
  received_at timestamptz not null default now(),
  processed boolean not null default false
);

create table public.notification_center_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid references public.people(id),
  category text not null,
  title text not null,
  preview text,
  source_type text not null,
  source_id uuid,
  sensitive_preview_redacted boolean not null default false,
  read_at timestamptz,
  archived_at timestamptz
);

create table public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  person_id uuid references public.people(id),
  token_hash text not null,
  platform text not null,
  active boolean not null default true,
  last_rotated_at timestamptz not null default now()
);

create table public.emergency_broadcasts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  announcement_id uuid references public.announcements(id),
  authorized_by uuid references public.profiles(id),
  reason text not null,
  status text not null default 'pending'
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  conversation_type text not null,
  title text not null,
  source_type text,
  source_id uuid,
  restricted boolean not null default false,
  minor_safe boolean not null default false,
  status text not null default 'active'
);

create table public.conversation_participants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  person_id uuid references public.people(id),
  user_id uuid references public.profiles(id),
  participant_role text not null default 'member',
  muted boolean not null default false,
  archived boolean not null default false,
  unique (tenant_id, conversation_id, person_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_person_id uuid references public.people(id),
  body text not null,
  status text not null default 'sent',
  created_at timestamptz not null default now()
);

create table public.message_reactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  message_id uuid references public.messages(id) on delete cascade,
  person_id uuid references public.people(id),
  reaction text not null
);

create table public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  message_id uuid references public.messages(id) on delete cascade,
  file_path text not null,
  moderation_status text not null default 'pending'
);

create table public.message_reports (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  message_id uuid references public.messages(id),
  reporter_person_id uuid references public.people(id),
  report_type text not null,
  reason text,
  routed_securely boolean not null default true,
  status text not null default 'submitted'
);

create table public.message_moderation_actions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  message_report_id uuid references public.message_reports(id),
  action_type text not null,
  action_summary text not null,
  evidence_preserved boolean not null default true,
  actor_user_id uuid references public.profiles(id)
);

create table public.pastoral_availability (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  pastor_user_id uuid references public.profiles(id),
  branch_id uuid references public.branches(id),
  weekday integer,
  starts_at time,
  ends_at time,
  appointment_types text[] not null default '{}',
  max_appointments integer,
  buffer_minutes integer not null default 15,
  active boolean not null default true
);

create table public.appointment_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  requester_person_id uuid references public.people(id),
  request_type text not null,
  preferred_pastor_user_id uuid references public.profiles(id),
  preferred_date date,
  branch_id uuid references public.branches(id),
  communication_method text,
  brief_reason text,
  urgency text not null default 'normal',
  privacy text not null default 'standard',
  status text not null default 'requested'
);

create table public.appointment_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  appointment_request_id uuid references public.appointment_requests(id),
  assigned_pastor_user_id uuid references public.profiles(id),
  scheduled_at timestamptz,
  status text not null default 'assigned'
);

create table public.digital_forms (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  form_key text not null,
  status text not null default 'draft',
  created_by uuid references public.profiles(id),
  unique (tenant_id, form_key)
);

create table public.digital_form_fields (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  form_id uuid references public.digital_forms(id) on delete cascade,
  label text not null,
  field_type text not null,
  required boolean not null default false,
  sort_order integer not null default 1
);

create table public.digital_form_submissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  form_id uuid references public.digital_forms(id),
  person_id uuid references public.people(id),
  status text not null default 'submitted',
  submitted_at timestamptz not null default now()
);

create table public.digital_form_answers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  submission_id uuid references public.digital_form_submissions(id) on delete cascade,
  field_id uuid references public.digital_form_fields(id),
  answer_text text
);

create table public.polls (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  status text not null default 'draft',
  created_by uuid references public.profiles(id)
);

create table public.poll_options (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  poll_id uuid references public.polls(id) on delete cascade,
  option_text text not null
);

create table public.poll_responses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  poll_id uuid references public.polls(id) on delete cascade,
  option_id uuid references public.poll_options(id),
  person_id uuid references public.people(id),
  submitted_at timestamptz not null default now()
);

create table public.ai_provider_configs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  provider_name text not null,
  model_name text not null,
  encrypted_api_key_path text,
  active boolean not null default false
);

create table public.ai_tenant_policies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  enabled boolean not null default false,
  permitted_role_ids uuid[] not null default '{}',
  permitted_modules text[] not null default '{}',
  monthly_usage_limit numeric(14,2) not null default 0,
  sensitive_data_access text not null default 'none',
  human_review_required boolean not null default true
);

create table public.ai_knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  source_type text not null,
  source_id uuid,
  visibility text not null default 'members',
  status text not null default 'active'
);

create table public.ai_knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  knowledge_source_id uuid references public.ai_knowledge_sources(id),
  title text not null,
  file_path text,
  status text not null default 'indexed'
);

create table public.ai_knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  knowledge_document_id uuid references public.ai_knowledge_documents(id),
  chunk_reference text not null,
  content_redacted text not null,
  visibility text not null default 'members'
);

create table public.ai_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references public.profiles(id),
  feature text not null,
  prompt_redacted text not null,
  status text not null default 'queued',
  data_classification text not null,
  estimated_cost numeric(14,4) not null default 0,
  created_at timestamptz not null default now()
);

create table public.ai_usage_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  ai_request_id uuid references public.ai_requests(id),
  user_id uuid references public.profiles(id),
  model text,
  units numeric(14,2) not null default 0,
  estimated_cost numeric(14,4) not null default 0,
  status text not null default 'recorded'
);

create table public.ai_action_suggestions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  ai_request_id uuid references public.ai_requests(id),
  suggestion text not null,
  source_record_ids uuid[] not null default '{}',
  requires_confirmation boolean not null default true,
  status text not null default 'pending'
);

create table public.ai_human_reviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  ai_request_id uuid references public.ai_requests(id),
  reviewer_user_id uuid references public.profiles(id),
  decision text,
  reviewed_at timestamptz
);

create table public.ai_safety_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  ai_request_id uuid references public.ai_requests(id),
  event_type text not null,
  severity text not null,
  redacted_summary text not null,
  routed_to text
);

create table public.solco_integrations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  enabled boolean not null default false,
  status text not null default 'disabled',
  base_url text,
  sso_enabled boolean not null default false,
  production_delivery_available boolean not null default false
);

create table public.solco_room_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  integration_id uuid references public.solco_integrations(id),
  source_type text not null,
  source_id uuid not null,
  solco_room_id text,
  status text not null default 'linked'
);

create table public.solco_identity_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  integration_id uuid references public.solco_integrations(id),
  person_id uuid references public.people(id),
  solco_identity_id text,
  status text not null default 'active'
);

create table public.integration_webhooks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  integration_type text not null,
  event_type text not null,
  received_at timestamptz not null default now(),
  processed boolean not null default false
);

create index member_next_steps_person_idx on public.member_next_steps(tenant_id, person_id, status);
create index sermons_status_idx on public.sermons(tenant_id, status, visibility);
create index announcements_status_idx on public.announcements(tenant_id, status, priority);
create index deliveries_status_idx on public.communication_deliveries(tenant_id, status);
create index conversations_source_idx on public.conversations(tenant_id, source_type, source_id);
create index messages_conversation_idx on public.messages(tenant_id, conversation_id, created_at);
create index ai_requests_tenant_idx on public.ai_requests(tenant_id, feature, status);

insert into public.permission_groups (key, label, sort_order) values
('digital_ministry', 'Member App, Communication & Digital Ministry', 110)
on conflict (key) do update set label = excluded.label, sort_order = excluded.sort_order;

insert into public.permissions (key, description, group_key, label, sensitive) values
('member_portal.access','Access member portal.','digital_ministry','Access member portal',false),
('member_journey.view_self','View own journey.','digital_ministry','View own journey',false),
('member_journey.view_others','View other journeys.','digital_ministry','View other journeys',true),
('member_directory.view','View member directory.','digital_ministry','View directory',true),
('member_directory.manage','Manage member directory.','digital_ministry','Manage directory',true),
('sermon.view','View sermons.','digital_ministry','View sermons',false),
('sermon.manage','Manage sermons.','digital_ministry','Manage sermons',true),
('sermon.publish','Publish sermons.','digital_ministry','Publish sermons',true),
('livestream.manage','Manage livestreams.','digital_ministry','Manage livestreams',true),
('devotional.manage','Manage devotionals.','digital_ministry','Manage devotionals',true),
('bible_plan.manage','Manage Bible plans.','digital_ministry','Manage Bible plans',true),
('resource.manage','Manage resources.','digital_ministry','Manage resources',true),
('announcement.create','Create announcements.','digital_ministry','Create announcements',true),
('announcement.approve','Approve announcements.','digital_ministry','Approve announcements',true),
('announcement.publish','Publish announcements.','digital_ministry','Publish announcements',true),
('communication.send','Send communications.','digital_ministry','Send communications',true),
('communication.schedule','Schedule communications.','digital_ministry','Schedule communications',true),
('communication.emergency','Send emergency communications.','digital_ministry','Emergency communications',true),
('communication.analytics.view','View communication analytics.','digital_ministry','View communication analytics',true),
('message.moderate','Moderate messages.','digital_ministry','Moderate messages',true),
('appointment.request','Request appointments.','digital_ministry','Request appointments',false),
('appointment.manage','Manage appointments.','digital_ministry','Manage appointments',true),
('appointment.assign','Assign appointments.','digital_ministry','Assign appointments',true),
('appointment.view_sensitive','View sensitive appointments.','digital_ministry','View sensitive appointments',true),
('form.create','Create forms.','digital_ministry','Create forms',true),
('form.publish','Publish forms.','digital_ministry','Publish forms',true),
('form.responses.view','View form responses.','digital_ministry','View form responses',true),
('form.responses.manage','Manage form responses.','digital_ministry','Manage form responses',true),
('ai.use_member','Use member AI assistant.','digital_ministry','Use member AI',false),
('ai.use_admin','Use admin AI copilot.','digital_ministry','Use admin AI',true),
('ai.use_pastoral','Use pastoral AI.','digital_ministry','Use pastoral AI',true),
('ai.use_finance','Use finance AI.','digital_ministry','Use finance AI',true),
('ai.manage_knowledge','Manage AI knowledge.','digital_ministry','Manage AI knowledge',true),
('ai.manage_settings','Manage AI settings.','digital_ministry','Manage AI settings',true),
('ai.view_usage','View AI usage.','digital_ministry','View AI usage',true),
('ai.view_audit','View AI audit.','digital_ministry','View AI audit',true)
on conflict (key) do nothing;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'member_home_preferences','member_journey_milestones','next_step_definitions','member_next_steps','digital_membership_cards','member_directory_profiles','member_blocks','member_reports','sermon_series','sermons','sermon_scriptures','sermon_media','sermon_transcripts','sermon_bookmarks','sermon_progress','sermon_playlists','livestreams','devotionals','bible_reading_plans','bible_plan_days','member_bible_plan_progress','resource_library_items','announcements','announcement_audiences','communication_templates','communication_campaigns','communication_deliveries','communication_preferences','provider_configurations','provider_webhooks','notification_center_items','device_tokens','emergency_broadcasts','conversations','conversation_participants','message_reactions','message_attachments','message_reports','message_moderation_actions','pastoral_availability','appointment_assignments','digital_forms','digital_form_fields','digital_form_submissions','digital_form_answers','polls','poll_options','poll_responses','ai_provider_configs','ai_tenant_policies','ai_knowledge_sources','ai_knowledge_documents','ai_knowledge_chunks','ai_requests','ai_usage_records','ai_action_suggestions','ai_human_reviews','ai_safety_events','solco_integrations','solco_room_links','solco_identity_links','integration_webhooks'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create policy %I on public.%I for select to authenticated using (public.has_permission(tenant_id, ''member_portal.access'') or public.has_permission(tenant_id, ''sermon.view'') or public.has_permission(tenant_id, ''communication.analytics.view'') or public.has_permission(tenant_id, ''announcement.create'') or public.has_permission(tenant_id, ''message.moderate'') or public.has_permission(tenant_id, ''appointment.manage'') or public.has_permission(tenant_id, ''ai.view_usage''))', table_name || '_read', table_name);
    execute format('create policy %I on public.%I for all to authenticated using (public.has_permission(tenant_id, ''sermon.manage'') or public.has_permission(tenant_id, ''announcement.create'') or public.has_permission(tenant_id, ''communication.send'') or public.has_permission(tenant_id, ''message.moderate'') or public.has_permission(tenant_id, ''appointment.manage'') or public.has_permission(tenant_id, ''form.create'') or public.has_permission(tenant_id, ''ai.manage_settings'')) with check (public.has_permission(tenant_id, ''sermon.manage'') or public.has_permission(tenant_id, ''announcement.create'') or public.has_permission(tenant_id, ''communication.send'') or public.has_permission(tenant_id, ''message.moderate'') or public.has_permission(tenant_id, ''appointment.manage'') or public.has_permission(tenant_id, ''form.create'') or public.has_permission(tenant_id, ''ai.manage_settings''))', table_name || '_manage', table_name);
  end loop;
end $$;

alter table public.sermon_notes enable row level security;
create policy "sermon notes owner read" on public.sermon_notes for select to authenticated using (exists (select 1 from public.person_contacts pc join public.profiles pr on pr.email = pc.value where pc.person_id = sermon_notes.person_id and pc.contact_type = 'email' and pr.id = auth.uid()));
create policy "sermon notes owner manage" on public.sermon_notes for all to authenticated using (exists (select 1 from public.person_contacts pc join public.profiles pr on pr.email = pc.value where pc.person_id = sermon_notes.person_id and pc.contact_type = 'email' and pr.id = auth.uid())) with check (exists (select 1 from public.person_contacts pc join public.profiles pr on pr.email = pc.value where pc.person_id = sermon_notes.person_id and pc.contact_type = 'email' and pr.id = auth.uid()));

alter table public.messages enable row level security;
create policy "messages participant read" on public.messages for select to authenticated using (exists (select 1 from public.conversation_participants cp where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()) or public.has_permission(tenant_id, 'message.moderate'));
create policy "messages participant insert" on public.messages for insert to authenticated with check (exists (select 1 from public.conversation_participants cp where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()));

alter table public.appointment_requests enable row level security;
create policy "appointments requester or manager read" on public.appointment_requests for select to authenticated using (public.has_permission(tenant_id, 'appointment.manage') or public.has_permission(tenant_id, 'appointment.view_sensitive') or exists (select 1 from public.person_contacts pc join public.profiles pr on pr.email = pc.value where pc.person_id = appointment_requests.requester_person_id and pc.contact_type = 'email' and pr.id = auth.uid()));
create policy "appointments request insert" on public.appointment_requests for insert to authenticated with check (public.has_permission(tenant_id, 'appointment.request') or public.has_permission(tenant_id, 'appointment.manage'));
