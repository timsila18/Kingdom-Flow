import type { AiRequest, AiTenantPolicy, Announcement, BibleReadingPlan, CommunicationDelivery, CommunicationPreference, Conversation, ConversationParticipant, Devotional, DigitalMembershipCard, Livestream, MemberBiblePlanProgress, MemberHomePreference, MemberJourneyMilestone, MemberNextStep, Message, NextStepDefinition, NotificationCenterItem, PastoralAppointmentRequest, Sermon, SermonMedia, SermonNote, SermonProgress, SermonSeries, SolcoIntegration } from "./digital-types";

export const memberHomePreferences: MemberHomePreference[] = [
  { id: "mhp-amina", tenantId: "tenant-kings-grace", personId: "person-amina", visibleModules: ["home", "journey", "church", "fellowship", "sermons", "live", "prayer", "giving", "messages"], lowBandwidth: false, language: "en" },
  { id: "mhp-john", tenantId: "tenant-kings-grace", personId: "person-newconvert-john", visibleModules: ["home", "journey", "programmes", "fellowship", "prayer", "messages"], lowBandwidth: true, language: "sw" },
];

export const memberJourneyMilestones: MemberJourneyMilestone[] = [
  { id: "journey-amina-member", tenantId: "tenant-kings-grace", personId: "person-amina", milestoneType: "membership_completed", title: "Membership completed", sourceType: "people", sourceId: "person-amina", occurredOn: "2026-07-11", visibility: "self", sensitive: false },
  { id: "journey-amina-serving", tenantId: "tenant-kings-grace", personId: "person-amina", milestoneType: "volunteer_service", title: "Serving with Media Department", sourceType: "service", sourceId: "dept-media", occurredOn: "2026-07-19", visibility: "leader_summary", sensitive: false },
  { id: "journey-john-newconvert", tenantId: "tenant-kings-grace", personId: "person-newconvert-john", milestoneType: "new_convert_decision", title: "New believer follow-up started", sourceType: "people", sourceId: "person-newconvert-john", occurredOn: "2026-07-07", visibility: "self", sensitive: false },
  { id: "journey-mary-prayer", tenantId: "tenant-kings-grace", personId: "person-visitor-mary", milestoneType: "pastoral_care", title: "Prayer follow-up update available", sourceType: "pastoral_case", sourceId: "case-prayer-mary", occurredOn: "2026-07-12", visibility: "pastoral_restricted", sensitive: true },
];

export const nextStepDefinitions: NextStepDefinition[] = [
  { id: "next-foundation", tenantId: "tenant-kings-grace", title: "Join Foundation Class", pathway: "New Convert -> Foundation Class", eligibilityStage: "new_convert", programmeId: "programme-foundations", responsibleUserId: "user-branch", automatedSuggestion: true, completionCriteria: "Programme registration completed", active: true },
  { id: "next-fellowship", tenantId: "tenant-kings-grace", title: "Find a fellowship", pathway: "Foundation Graduate -> Fellowship", eligibilityStage: "foundation_programme", branchId: "branch-imaara", responsibleUserId: "user-branch", automatedSuggestion: true, completionCriteria: "Fellowship membership approved", active: true },
  { id: "next-volunteer", tenantId: "tenant-kings-grace", title: "Explore volunteer opportunities", pathway: "Fellowship Member -> Volunteer", eligibilityStage: "member", ministryId: "dept-media", responsibleUserId: "user-admin", automatedSuggestion: false, completionCriteria: "Volunteer application approved", active: true },
];

export const memberNextSteps: MemberNextStep[] = [
  { id: "mnext-john-foundation", tenantId: "tenant-kings-grace", personId: "person-newconvert-john", definitionId: "next-foundation", dueDate: "2026-08-15", reminderEnabled: true, status: "assigned" },
  { id: "mnext-amina-volunteer", tenantId: "tenant-kings-grace", personId: "person-amina", definitionId: "next-volunteer", dueDate: "2026-08-31", reminderEnabled: false, status: "completed" },
];

export const digitalMembershipCards: DigitalMembershipCard[] = [
  { id: "card-amina", tenantId: "tenant-kings-grace", personId: "person-amina", cardNumber: "KGC-000001", qrCode: "kf-card-amina-safe", issueDate: "2026-07-11", status: "active" },
];

export const sermonSeries: SermonSeries[] = [
  { id: "series-serving", tenantId: "tenant-kings-grace", title: "Serving with Grace", description: "A series on practical ministry service.", speakerUserIds: ["user-admin"], startDate: "2026-07-19", featured: true, branchId: "branch-imaara" },
];

export const sermons: Sermon[] = [
  { id: "sermon-serving-grace-public", tenantId: "tenant-kings-grace", seriesId: "series-serving", serviceId: "service-sunday-20260719", title: "Serving with Grace", speakerUserId: "user-admin", branchId: "branch-imaara", date: "2026-07-19", description: "Public summary approved for member access.", scriptureReferences: ["Romans 12:6-8"], topics: ["service", "grace"], tags: ["volunteer", "ministry"], language: "en", durationSeconds: 2400, status: "published", visibility: "members", featured: true },
];

export const sermonMedia: SermonMedia[] = [
  { id: "smedia-serving-audio", tenantId: "tenant-kings-grace", sermonId: "sermon-serving-grace-public", mediaType: "audio", url: "https://media.example.test/sermons/serving.mp3", processingStatus: "ready", transcriptId: "strans-serving", downloadable: true },
  { id: "smedia-serving-youtube", tenantId: "tenant-kings-grace", sermonId: "sermon-serving-grace-public", mediaType: "youtube", url: "https://youtube.example.test/watch?v=serving", processingStatus: "ready", captionsUrl: "https://media.example.test/captions/serving.vtt", downloadable: false },
];

export const sermonNotes: SermonNote[] = [
  { id: "snote-amina", tenantId: "tenant-kings-grace", sermonId: "sermon-serving-grace-public", personId: "person-amina", note: "Serve with humility in the gifts God gives.", timestampSeconds: 620, privateTags: ["service"] },
];

export const sermonProgress: SermonProgress[] = [
  { id: "sprog-amina", tenantId: "tenant-kings-grace", sermonId: "sermon-serving-grace-public", personId: "person-amina", secondsPlayed: 1250, completed: false },
];

export const livestreams: Livestream[] = [
  { id: "live-sunday", tenantId: "tenant-kings-grace", branchId: "branch-imaara", serviceId: "service-sunday-20260719", title: "Sunday Celebration Live", provider: "youtube", url: "https://youtube.example.test/live/kingsgrace", scheduledStart: "2026-07-19T06:00:00.000Z", scheduledEnd: "2026-07-19T08:00:00.000Z", liveStatus: "live", replayUrl: "https://youtube.example.test/watch/replay", visibility: "members", chatPolicy: "moderated", secretKeyStored: false },
];

export const devotionals: Devotional[] = [
  { id: "devo-today", tenantId: "tenant-kings-grace", title: "Grace for Today", devotionalDate: "2026-07-19", authorUserId: "user-admin", scriptureReference: "Romans 12:6-8", body: "Use what has been entrusted to you with humility.", reflection: "Where can I serve faithfully today?", prayer: "Lord, help me serve with grace.", actionPoint: "Encourage one person in your fellowship.", language: "en", targetAudience: "all", status: "published" },
];

export const bibleReadingPlans: BibleReadingPlan[] = [
  { id: "bplan-romans", tenantId: "tenant-kings-grace", title: "Romans in 30 Days", description: "A steady reading plan with reflection prompts.", durationDays: 30, groupPlan: true, churchWide: true, status: "published" },
];

export const memberBiblePlanProgress: MemberBiblePlanProgress[] = [
  { id: "bprog-amina-romans", tenantId: "tenant-kings-grace", planId: "bplan-romans", personId: "person-amina", currentDay: 6, missedDays: 1, reminderEnabled: true, status: "active" },
];

export const announcements: Announcement[] = [
  { id: "ann-branch-service", tenantId: "tenant-kings-grace", title: "Branch service time update", body: "Imaara service starts at 09:00 this Sunday.", priority: "important", audienceType: "branch", audienceId: "branch-imaara", channels: ["in_app", "email", "sms"], publishAt: "2026-07-18T08:00:00.000Z", acknowledgmentRequired: false, status: "published", createdBy: "user-admin", approvedBy: "user-branch" },
  { id: "ann-emergency-template", tenantId: "tenant-kings-grace", title: "Venue closure draft", body: "Emergency wording is controlled and approval-gated.", priority: "emergency", audienceType: "church", channels: ["in_app", "sms"], publishAt: "2026-07-19T05:00:00.000Z", acknowledgmentRequired: true, status: "draft", createdBy: "user-admin" },
];

export const communicationPreferences: CommunicationPreference[] = [
  { id: "pref-amina-ann-email", tenantId: "tenant-kings-grace", personId: "person-amina", category: "announcements", channel: "email", optedIn: true, legalExceptionAllowed: true },
  { id: "pref-john-marketing-sms", tenantId: "tenant-kings-grace", personId: "person-newconvert-john", category: "marketing", channel: "sms", optedIn: false, legalExceptionAllowed: false },
];

export const communicationDeliveries: CommunicationDelivery[] = [
  { id: "deliv-ann-amina", tenantId: "tenant-kings-grace", sourceType: "announcement", sourceId: "ann-branch-service", personId: "person-amina", channel: "email", status: "delivered", providerEvidence: "provider-message-001" },
  { id: "deliv-ann-john", tenantId: "tenant-kings-grace", sourceType: "announcement", sourceId: "ann-branch-service", personId: "person-newconvert-john", channel: "sms", status: "failed", failureReason: "Provider unavailable" },
];

export const conversations: Conversation[] = [
  { id: "conv-fellowship-imaara", tenantId: "tenant-kings-grace", conversationType: "fellowship", title: "Imaara Family Fellowship", sourceType: "small_group", sourceId: "group-imaara-family", restricted: false, minorSafe: true, status: "active" },
  { id: "conv-pastoral-mary", tenantId: "tenant-kings-grace", conversationType: "pastoral", title: "Prayer follow-up", sourceType: "pastoral_case", sourceId: "case-prayer-mary", restricted: true, minorSafe: false, status: "active" },
];

export const conversationParticipants: ConversationParticipant[] = [
  { id: "cpart-amina-fellowship", tenantId: "tenant-kings-grace", conversationId: "conv-fellowship-imaara", personId: "person-amina", userId: "user-admin", role: "member", muted: false, archived: false },
  { id: "cpart-david-fellowship", tenantId: "tenant-kings-grace", conversationId: "conv-fellowship-imaara", personId: "person-david", userId: "user-branch", role: "leader", muted: false, archived: false },
  { id: "cpart-mary-pastoral", tenantId: "tenant-kings-grace", conversationId: "conv-pastoral-mary", personId: "person-visitor-mary", role: "member", muted: false, archived: false },
];

export const messages: Message[] = [
  { id: "msg-fellowship", tenantId: "tenant-kings-grace", conversationId: "conv-fellowship-imaara", senderPersonId: "person-david", body: "Fellowship meets Wednesday at 18:30. Exact address shared by leader only.", status: "sent", createdAt: "2026-07-18T12:00:00.000Z" },
];

export const pastoralAppointmentRequests: PastoralAppointmentRequest[] = [
  { id: "appt-amina-prayer", tenantId: "tenant-kings-grace", requesterPersonId: "person-amina", requestType: "prayer", preferredPastorUserId: "user-branch", preferredDate: "2026-07-22", branchId: "branch-imaara", communicationMethod: "in_person", briefReason: "Prayer meeting request", urgency: "normal", privacy: "standard", status: "confirmed" },
];

export const solcoIntegrations: SolcoIntegration[] = [
  { id: "solco-kings-grace", tenantId: "tenant-kings-grace", enabled: true, status: "mock_development", baseUrl: "https://solco.example.test", ssoEnabled: false, productionDeliveryAvailable: false },
];

export const aiTenantPolicies: AiTenantPolicy[] = [
  { id: "ai-policy-kgc", tenantId: "tenant-kings-grace", enabled: true, permittedRoles: ["role-admin", "role-branch"], permittedModules: ["member_assistant", "leader_copilot", "content_discovery"], monthlyUsageLimit: 250000, sensitiveDataAccess: "permission_scoped", humanReviewRequired: true },
];

export const aiRequests: AiRequest[] = [
  { id: "aireq-newconverts", tenantId: "tenant-kings-grace", userId: "user-branch", feature: "leader_copilot", prompt: "Which new converts have not yet been assigned?", status: "completed", dataClassification: "member", estimatedCost: 0.04 },
];

export const notificationCenterItems: NotificationCenterItem[] = [
  { id: "notif-service", tenantId: "tenant-kings-grace", personId: "person-amina", category: "service", title: "Sunday service", preview: "Service starts at 09:00.", sourceType: "service", sourceId: "service-sunday-20260719", sensitivePreviewRedacted: false, read: false, archived: false },
  { id: "notif-pastoral", tenantId: "tenant-kings-grace", personId: "person-visitor-mary", category: "pastoral", title: "Pastoral update", preview: "Sensitive details hidden. Open securely.", sourceType: "pastoral_case", sourceId: "case-prayer-mary", sensitivePreviewRedacted: true, read: false, archived: false },
];
