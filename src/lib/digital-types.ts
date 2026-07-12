export type CommunicationChannel = "in_app" | "email" | "sms" | "whatsapp" | "push" | "web" | "solco" | "external";
export type DeliveryStatus = "queued" | "sent_to_provider" | "delivered" | "failed" | "opened" | "acknowledged";

export interface MemberHomePreference {
  id: string;
  tenantId: string;
  personId: string;
  visibleModules: string[];
  lowBandwidth: boolean;
  language: string;
}

export interface MemberJourneyMilestone {
  id: string;
  tenantId: string;
  personId: string;
  milestoneType: string;
  title: string;
  sourceType: string;
  sourceId?: string;
  occurredOn: string;
  visibility: "self" | "leader_summary" | "pastoral_restricted";
  sensitive: boolean;
}

export interface NextStepDefinition {
  id: string;
  tenantId: string;
  title: string;
  pathway: string;
  eligibilityStage: string;
  prerequisite?: string;
  branchId?: string;
  ageGroup?: string;
  ministryId?: string;
  programmeId?: string;
  responsibleUserId?: string;
  automatedSuggestion: boolean;
  completionCriteria: string;
  active: boolean;
}

export interface MemberNextStep {
  id: string;
  tenantId: string;
  personId: string;
  definitionId: string;
  assignedBy?: string;
  dueDate?: string;
  reminderEnabled: boolean;
  status: "suggested" | "assigned" | "in_progress" | "completed" | "dismissed";
}

export interface DigitalMembershipCard {
  id: string;
  tenantId: string;
  personId: string;
  cardNumber: string;
  qrCode: string;
  issueDate: string;
  expiryDate?: string;
  status: "active" | "expired" | "revoked";
}

export interface SermonSeries {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  artworkUrl?: string;
  speakerUserIds: string[];
  startDate: string;
  endDate?: string;
  featured: boolean;
  branchId?: string;
  ministryId?: string;
}

export interface Sermon {
  id: string;
  tenantId: string;
  seriesId?: string;
  serviceId?: string;
  eventId?: string;
  title: string;
  speakerUserId: string;
  branchId?: string;
  date: string;
  description: string;
  scriptureReferences: string[];
  topics: string[];
  tags: string[];
  language: string;
  durationSeconds: number;
  thumbnailUrl?: string;
  status: "draft" | "processing" | "review" | "scheduled" | "published" | "private" | "archived";
  visibility: "public" | "members" | "leaders" | "private";
  featured: boolean;
}

export interface SermonMedia {
  id: string;
  tenantId: string;
  sermonId: string;
  mediaType: "audio" | "video" | "external_video" | "youtube" | "vimeo" | "livestream_recording" | "podcast" | "cdn";
  url: string;
  processingStatus: "queued" | "processing" | "ready" | "failed";
  captionsUrl?: string;
  transcriptId?: string;
  downloadable: boolean;
}

export interface SermonNote {
  id: string;
  tenantId: string;
  sermonId: string;
  personId: string;
  note: string;
  timestampSeconds?: number;
  privateTags: string[];
}

export interface SermonProgress {
  id: string;
  tenantId: string;
  sermonId: string;
  personId: string;
  secondsPlayed: number;
  completed: boolean;
}

export interface Livestream {
  id: string;
  tenantId: string;
  branchId?: string;
  serviceId?: string;
  eventId?: string;
  title: string;
  provider: "youtube" | "vimeo" | "facebook" | "zoom" | "hls" | "embed" | "external" | "custom";
  url: string;
  scheduledStart: string;
  scheduledEnd: string;
  liveStatus: "scheduled" | "live" | "ended" | "cancelled";
  replayUrl?: string;
  visibility: "public" | "members" | "private";
  chatPolicy: "off" | "moderated" | "external";
  secretKeyStored: boolean;
}

export interface Devotional {
  id: string;
  tenantId: string;
  title: string;
  devotionalDate: string;
  authorUserId: string;
  scriptureReference: string;
  body: string;
  reflection: string;
  prayer: string;
  actionPoint: string;
  language: string;
  targetAudience: string;
  status: "draft" | "scheduled" | "published" | "archived";
}

export interface BibleReadingPlan {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  durationDays: number;
  groupPlan: boolean;
  churchWide: boolean;
  status: "draft" | "published" | "archived";
}

export interface MemberBiblePlanProgress {
  id: string;
  tenantId: string;
  planId: string;
  personId: string;
  currentDay: number;
  missedDays: number;
  reminderEnabled: boolean;
  status: "active" | "paused" | "completed" | "restarted";
}

export interface Announcement {
  id: string;
  tenantId: string;
  title: string;
  body: string;
  priority: "normal" | "important" | "urgent" | "emergency";
  audienceType: "church" | "branch" | "ministry" | "department" | "fellowship" | "programme" | "event" | "volunteers" | "employees" | "parents" | "youth" | "custom";
  audienceId?: string;
  channels: CommunicationChannel[];
  publishAt: string;
  expiresAt?: string;
  acknowledgmentRequired: boolean;
  status: "draft" | "pending_approval" | "approved" | "published" | "expired" | "cancelled";
  createdBy: string;
  approvedBy?: string;
}

export interface CommunicationPreference {
  id: string;
  tenantId: string;
  personId: string;
  category: string;
  channel: CommunicationChannel;
  optedIn: boolean;
  legalExceptionAllowed: boolean;
}

export interface CommunicationDelivery {
  id: string;
  tenantId: string;
  sourceType: string;
  sourceId: string;
  personId: string;
  channel: CommunicationChannel;
  status: DeliveryStatus;
  providerEvidence?: string;
  failureReason?: string;
}

export interface Conversation {
  id: string;
  tenantId: string;
  conversationType: "one_to_one" | "group" | "ministry" | "fellowship" | "programme" | "event" | "volunteer" | "staff" | "announcement_only" | "pastoral";
  title: string;
  sourceType?: string;
  sourceId?: string;
  restricted: boolean;
  minorSafe: boolean;
  status: "active" | "archived" | "moderated";
}

export interface ConversationParticipant {
  id: string;
  tenantId: string;
  conversationId: string;
  personId: string;
  userId?: string;
  role: "member" | "leader" | "moderator" | "guardian" | "pastoral";
  muted: boolean;
  archived: boolean;
}

export interface Message {
  id: string;
  tenantId: string;
  conversationId: string;
  senderPersonId: string;
  body: string;
  status: "sent" | "edited" | "hidden" | "reported" | "deleted_preserved";
  createdAt: string;
}

export interface PastoralAppointmentRequest {
  id: string;
  tenantId: string;
  requesterPersonId: string;
  requestType: string;
  preferredPastorUserId?: string;
  preferredDate: string;
  branchId?: string;
  communicationMethod: string;
  briefReason: string;
  urgency: "normal" | "soon" | "urgent";
  privacy: "standard" | "restricted";
  status: "requested" | "triaged" | "assigned" | "proposed" | "confirmed" | "rescheduled" | "completed" | "cancelled" | "referred" | "escalated" | "no_show";
}

export interface SolcoIntegration {
  id: string;
  tenantId: string;
  enabled: boolean;
  status: "disabled" | "configured" | "mock_development" | "error";
  baseUrl?: string;
  ssoEnabled: boolean;
  productionDeliveryAvailable: boolean;
}

export interface AiTenantPolicy {
  id: string;
  tenantId: string;
  enabled: boolean;
  permittedRoles: string[];
  permittedModules: string[];
  monthlyUsageLimit: number;
  sensitiveDataAccess: "none" | "redacted" | "permission_scoped";
  humanReviewRequired: boolean;
}

export interface AiRequest {
  id: string;
  tenantId: string;
  userId: string;
  feature: "member_assistant" | "leader_copilot" | "pastoral_assist" | "finance_assist" | "content_discovery";
  prompt: string;
  status: "queued" | "completed" | "blocked" | "needs_human_review" | "failed";
  dataClassification: "public" | "member" | "pastoral" | "finance" | "hr" | "safeguarding";
  estimatedCost: number;
}

export interface NotificationCenterItem {
  id: string;
  tenantId: string;
  personId: string;
  category: string;
  title: string;
  preview: string;
  sourceType: string;
  sourceId: string;
  sensitivePreviewRedacted: boolean;
  read: boolean;
  archived: boolean;
}
