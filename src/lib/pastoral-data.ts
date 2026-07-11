import type {
  BereavementCase,
  CarePlan,
  CaseTask,
  CaseTimelineEntry,
  ConfidentialityLevel,
  CounsellingAppointment,
  CounsellingSession,
  PastoralCase,
  PastoralCaseAccessGrant,
  PastoralCaseCategory,
  PastoralNote,
  PastoralNoteVersion,
  PastoralReferral,
  PastoralVisit,
  PrayerAssignment,
  PrayerFollowUp,
  PrayerRequest,
  PrayerTeam,
  ProfessionalReferral,
  SafeguardingAction,
  SafeguardingCase,
  Testimony,
  WelfareAssessment,
  WelfareRequest,
} from "./pastoral-types";

export const confidentialityLevels: ConfidentialityLevel[] = [
  {
    key: "general",
    label: "General Pastoral",
    viewExistencePermissions: ["pastoral_case.view_assigned", "pastoral_case.view_unit", "pastoral_case.view_all"],
    viewSummaryPermissions: ["pastoral_case.view_assigned", "pastoral_case.view_unit", "pastoral_case.view_all"],
    viewDetailPermissions: ["pastoral_case.view_assigned", "pastoral_case.update", "pastoral_case.manage"],
    addNotePermissions: ["pastoral_case.update", "pastoral_case.manage"],
    exportPermissions: ["pastoral_case.export_summary"],
    auditAccess: false,
    reasonRequired: false,
    downloadProhibited: false,
    memberVisibleAllowed: true,
  },
  {
    key: "restricted",
    label: "Restricted Pastoral",
    viewExistencePermissions: ["pastoral_case.view_assigned", "pastoral_case.view_unit", "pastoral_case.view_all"],
    viewSummaryPermissions: ["pastoral_case.view_assigned", "pastoral_case.view_unit", "pastoral_case.view_all"],
    viewDetailPermissions: ["pastoral_case.view_restricted_notes", "pastoral_case.manage"],
    addNotePermissions: ["pastoral_case.update", "pastoral_case.manage"],
    exportPermissions: ["pastoral_case.export_detailed"],
    auditAccess: true,
    reasonRequired: true,
    downloadProhibited: true,
    memberVisibleAllowed: false,
  },
  {
    key: "highly_confidential",
    label: "Highly Confidential",
    viewExistencePermissions: ["pastoral_case.view_all", "pastoral_case.view_highly_confidential"],
    viewSummaryPermissions: ["pastoral_case.view_highly_confidential", "pastoral_case.manage"],
    viewDetailPermissions: ["pastoral_case.view_highly_confidential", "pastoral_case.manage"],
    addNotePermissions: ["pastoral_case.manage"],
    exportPermissions: ["pastoral_case.export_detailed"],
    auditAccess: true,
    reasonRequired: true,
    downloadProhibited: true,
    memberVisibleAllowed: false,
  },
  {
    key: "safeguarding",
    label: "Safeguarding Restricted",
    viewExistencePermissions: ["safeguarding.case.view", "safeguarding.case.manage"],
    viewSummaryPermissions: ["safeguarding.case.view", "safeguarding.case.manage"],
    viewDetailPermissions: ["safeguarding.case.view", "safeguarding.case.manage"],
    addNotePermissions: ["safeguarding.case.manage"],
    exportPermissions: ["safeguarding.export"],
    auditAccess: true,
    reasonRequired: true,
    downloadProhibited: true,
    memberVisibleAllowed: false,
  },
  {
    key: "welfare_finance",
    label: "Welfare and Finance Restricted",
    viewExistencePermissions: ["welfare_request.view", "welfare_request.manage"],
    viewSummaryPermissions: ["welfare_request.view", "welfare_request.assess", "welfare_request.manage"],
    viewDetailPermissions: ["welfare_request.assess", "welfare_request.approve", "welfare_request.manage"],
    addNotePermissions: ["welfare_request.assess", "welfare_request.manage"],
    exportPermissions: ["welfare.export"],
    auditAccess: true,
    reasonRequired: true,
    downloadProhibited: true,
    memberVisibleAllowed: false,
  },
  {
    key: "professional_referral",
    label: "Professional Referral Restricted",
    viewExistencePermissions: ["professional_referral.manage", "pastoral_case.manage"],
    viewSummaryPermissions: ["professional_referral.manage", "pastoral_case.manage"],
    viewDetailPermissions: ["professional_referral.manage", "pastoral_case.manage"],
    addNotePermissions: ["professional_referral.manage"],
    exportPermissions: ["pastoral_case.export_detailed"],
    auditAccess: true,
    reasonRequired: true,
    downloadProhibited: true,
    memberVisibleAllowed: false,
  },
];

export const pastoralCaseCategories: PastoralCaseCategory[] = [
  { id: "cat-prayer", tenantId: "tenant-kings-grace", name: "Prayer", defaultSensitivity: "general", responsiblePermissions: ["prayer_request.manage"], escalationHours: 24, anonymousIntakeAllowed: true, retentionMonths: 24, active: true },
  { id: "cat-counselling", tenantId: "tenant-kings-grace", name: "Counselling", defaultSensitivity: "restricted", responsiblePermissions: ["counselling.manage", "pastoral_case.manage"], referralRuleId: "referral-confidential-up", escalationHours: 72, anonymousIntakeAllowed: false, retentionMonths: 84, active: true },
  { id: "cat-hospital", tenantId: "tenant-kings-grace", name: "Hospital or Medical Visit", defaultSensitivity: "restricted", responsiblePermissions: ["pastoral_visit.manage"], escalationHours: 4, anonymousIntakeAllowed: false, retentionMonths: 36, active: true },
  { id: "cat-bereavement", tenantId: "tenant-kings-grace", name: "Bereavement", defaultSensitivity: "restricted", responsiblePermissions: ["bereavement.manage"], escalationHours: 1, anonymousIntakeAllowed: false, retentionMonths: 60, active: true },
  { id: "cat-welfare", tenantId: "tenant-kings-grace", name: "Welfare Assistance", defaultSensitivity: "welfare_finance", responsiblePermissions: ["welfare_request.assess", "welfare_request.manage"], approvalWorkflowId: "workflow-welfare-support", escalationHours: 48, anonymousIntakeAllowed: false, retentionMonths: 84, active: true },
  { id: "cat-safeguarding", tenantId: "tenant-kings-grace", name: "Child Safeguarding", defaultSensitivity: "safeguarding", responsiblePermissions: ["safeguarding.case.manage"], referralRuleId: "referral-safeguarding", escalationHours: 1, anonymousIntakeAllowed: false, retentionMonths: 120, active: true },
  { id: "cat-professional", tenantId: "tenant-kings-grace", name: "Professional Referral", defaultSensitivity: "professional_referral", responsiblePermissions: ["professional_referral.manage"], escalationHours: 48, anonymousIntakeAllowed: false, retentionMonths: 84, active: true },
];

export const pastoralCases: PastoralCase[] = [
  {
    id: "case-prayer-mary",
    tenantId: "tenant-kings-grace",
    branchId: "branch-imaara",
    organizationUnitId: "unit-imaara",
    caseNumber: "KGC-PC-0001",
    title: "Private prayer and welcome follow-up",
    subjectPersonId: "person-visitor-mary",
    additionalPersonIds: [],
    categoryId: "cat-prayer",
    sensitivity: "general",
    confidentiality: "general",
    urgency: "soon",
    riskLevel: "low",
    source: "Visitor form",
    intakeChannel: "public_qr",
    assignedWorkerId: "user-volunteer",
    assignedPastorId: "user-branch",
    supervisingPastorId: "user-admin",
    status: "active",
    stage: "prayer_follow_up",
    nextAction: "Record pastoral-safe follow-up after prayer team assignment",
    nextActionDueAt: "2026-07-13T09:00:00.000Z",
    consentStatus: "granted",
    communicationPreference: "whatsapp",
    summary: "Mary requested private prayer and permission for a pastoral follow-up.",
    publicSafeSummary: "Prayer request received and assigned.",
    openedAt: "2026-07-11T09:15:00.000Z",
    lastActivityAt: "2026-07-11T10:10:00.000Z",
    branchVisibility: "team",
    createdBy: "public-form",
    updatedBy: "user-branch",
    createdAt: "2026-07-11T09:15:00.000Z",
    updatedAt: "2026-07-11T10:10:00.000Z",
  },
  {
    id: "case-counselling-john",
    tenantId: "tenant-kings-grace",
    branchId: "branch-ruiru",
    organizationUnitId: "unit-ruiru",
    caseNumber: "KGC-PC-0002",
    title: "New believer counselling referral",
    subjectPersonId: "person-newconvert-john",
    additionalPersonIds: [],
    categoryId: "cat-counselling",
    sensitivity: "restricted",
    confidentiality: "restricted",
    urgency: "soon",
    riskLevel: "moderate",
    source: "Follow-up conversion",
    intakeChannel: "new_convert_journey",
    assignedWorkerId: "user-branch",
    assignedPastorId: "user-branch",
    supervisingPastorId: "user-admin",
    specialistReferralId: "professional-referral-counsellor",
    status: "referred",
    stage: "specialist_referral",
    nextAction: "Specialist counsellor to accept referral and schedule first session",
    nextActionDueAt: "2026-07-14T12:00:00.000Z",
    consentStatus: "granted",
    communicationPreference: "sms",
    summary: "John requested pastoral counselling after new-believer follow-up.",
    restrictedNotePreview: "Restricted session details require explicit note permission.",
    publicSafeSummary: "Counselling support in progress.",
    openedAt: "2026-07-11T11:00:00.000Z",
    lastActivityAt: "2026-07-11T12:00:00.000Z",
    branchVisibility: "assigned",
    createdBy: "user-branch",
    updatedBy: "user-branch",
    createdAt: "2026-07-11T11:00:00.000Z",
    updatedAt: "2026-07-11T12:00:00.000Z",
  },
  {
    id: "case-welfare-household",
    tenantId: "tenant-kings-grace",
    branchId: "branch-imaara",
    organizationUnitId: "unit-imaara",
    caseNumber: "KGC-PC-0003",
    title: "Household rent support assessment",
    subjectPersonId: "person-visitor-mary",
    additionalPersonIds: [],
    householdId: "household-mary",
    categoryId: "cat-welfare",
    sensitivity: "welfare_finance",
    confidentiality: "welfare_finance",
    urgency: "urgent",
    riskLevel: "moderate",
    source: "Member care portal",
    intakeChannel: "welfare_desk",
    assignedWorkerId: "user-admin",
    assignedPastorId: "user-branch",
    supervisingPastorId: "user-admin",
    status: "awaiting_approval",
    stage: "higher_approval_required",
    nextAction: "Route welfare recommendation for higher approval",
    nextActionDueAt: "2026-07-12T12:00:00.000Z",
    consentStatus: "granted",
    communicationPreference: "phone",
    summary: "Welfare support request requires assessment and approval.",
    publicSafeSummary: "Welfare request under review.",
    openedAt: "2026-07-11T08:45:00.000Z",
    lastActivityAt: "2026-07-11T10:45:00.000Z",
    branchVisibility: "assigned",
    createdBy: "user-admin",
    updatedBy: "user-admin",
    createdAt: "2026-07-11T08:45:00.000Z",
    updatedAt: "2026-07-11T10:45:00.000Z",
  },
  {
    id: "case-safeguarding-grace",
    tenantId: "tenant-kings-grace",
    branchId: "branch-imaara",
    organizationUnitId: "unit-imaara",
    caseNumber: "KGC-SG-0001",
    title: "Safeguarding concern",
    subjectPersonId: "person-child-grace",
    additionalPersonIds: ["person-david"],
    categoryId: "cat-safeguarding",
    sensitivity: "safeguarding",
    confidentiality: "safeguarding",
    urgency: "immediate",
    riskLevel: "critical",
    source: "Pastoral worker",
    intakeChannel: "staff_entered",
    assignedWorkerId: "user-admin",
    assignedPastorId: "user-admin",
    supervisingPastorId: "user-admin",
    status: "active",
    stage: "urgent_safeguarding_action",
    nextAction: "Follow safeguarding policy and contact appropriate local emergency services if danger is immediate",
    nextActionDueAt: "2026-07-11T13:00:00.000Z",
    consentStatus: "emergency_override",
    communicationPreference: "guardian_contact",
    summary: "Safeguarding metadata only. Details require safeguarding authorization.",
    restrictedNotePreview: "Safeguarding notes are excluded from ordinary pastoral views.",
    openedAt: "2026-07-11T12:30:00.000Z",
    lastActivityAt: "2026-07-11T12:45:00.000Z",
    branchVisibility: "assigned",
    createdBy: "user-admin",
    updatedBy: "user-admin",
    createdAt: "2026-07-11T12:30:00.000Z",
    updatedAt: "2026-07-11T12:45:00.000Z",
  },
];

export const pastoralCaseAccessGrants: PastoralCaseAccessGrant[] = [
  { id: "grant-counselling-admin", tenantId: "tenant-kings-grace", caseId: "case-counselling-john", userId: "user-admin", permissions: ["pastoral_case.view_restricted_notes", "pastoral_case.view_highly_confidential"], reason: "Supervision of restricted counselling referral", grantedBy: "user-branch", startsAt: "2026-07-11T12:00:00.000Z", expiresAt: "2026-07-18T12:00:00.000Z", active: true },
  { id: "grant-referral-specialist", tenantId: "tenant-kings-grace", caseId: "case-counselling-john", userId: "user-volunteer", permissions: ["pastoral_case.view_assigned"], reason: "Temporary referral consultation with redacted summary", grantedBy: "user-branch", startsAt: "2026-07-11T12:00:00.000Z", expiresAt: "2026-07-15T12:00:00.000Z", active: true },
];

export const pastoralNotes: PastoralNote[] = [
  { id: "note-mary-general", tenantId: "tenant-kings-grace", caseId: "case-prayer-mary", authorUserId: "user-branch", type: "general", visibility: "case_team", sensitivity: "general", content: "Prayer request acknowledged. Follow-up should use Marys preferred WhatsApp channel.", memberVisibleSummary: "Prayer request received.", editableUntil: "2026-07-12T10:00:00.000Z", amended: false, exportProhibited: false, accessReasonRequired: false, createdAt: "2026-07-11T10:00:00.000Z" },
  { id: "note-john-restricted", tenantId: "tenant-kings-grace", caseId: "case-counselling-john", referralId: "referral-john-specialist", authorUserId: "user-branch", type: "restricted_counselling", visibility: "assigned_only", sensitivity: "restricted", content: "Restricted counselling context retained for assigned pastor and explicit referral users only.", memberVisibleSummary: "Counselling appointment is being arranged.", editableUntil: "2026-07-12T12:00:00.000Z", amended: true, amendmentReason: "Clarified member-visible action summary.", exportProhibited: true, accessReasonRequired: true, createdAt: "2026-07-11T11:45:00.000Z" },
  { id: "note-welfare-assessment", tenantId: "tenant-kings-grace", caseId: "case-welfare-household", authorUserId: "user-admin", type: "welfare_assessment", visibility: "welfare_team", sensitivity: "welfare_finance", content: "Assessment details are restricted to welfare officers and approvers.", editableUntil: "2026-07-12T11:00:00.000Z", amended: false, exportProhibited: true, accessReasonRequired: true, createdAt: "2026-07-11T10:30:00.000Z" },
  { id: "note-safeguarding-action", tenantId: "tenant-kings-grace", caseId: "case-safeguarding-grace", authorUserId: "user-admin", type: "safeguarding", visibility: "safeguarding_team", sensitivity: "safeguarding", content: "Safeguarding action details are independently audited and not shown in ordinary dashboards.", editableUntil: "2026-07-11T13:30:00.000Z", amended: false, exportProhibited: true, accessReasonRequired: true, createdAt: "2026-07-11T12:45:00.000Z" },
];

export const pastoralNoteVersions: PastoralNoteVersion[] = [
  { id: "note-version-john-1", noteId: "note-john-restricted", version: 1, content: "Initial restricted counselling context.", amendedBy: "user-branch", amendmentReason: "Initial version", createdAt: "2026-07-11T11:40:00.000Z" },
  { id: "note-version-john-2", noteId: "note-john-restricted", version: 2, content: "Restricted counselling context retained for assigned pastor and explicit referral users only.", amendedBy: "user-branch", amendmentReason: "Clarified member-visible action summary.", createdAt: "2026-07-11T11:45:00.000Z" },
];

export const prayerTeams: PrayerTeam[] = [
  { id: "team-prayer-imaara", tenantId: "tenant-kings-grace", name: "Imaara Prayer Team", branchId: "branch-imaara", scope: "branch", leaderUserIds: ["user-branch"], memberUserIds: ["user-volunteer"], confidentialityClearance: ["general", "restricted"], categoriesHandled: ["Prayer", "New-Believer Support"], availability: "available", capacity: 12, language: "en", active: true },
];

export const prayerRequests: PrayerRequest[] = [
  { id: "prayer-mary-private", tenantId: "tenant-kings-grace", personId: "person-visitor-mary", title: "Private prayer request", details: "Private details redacted for prayer team views.", category: "Prayer", confidentiality: "private", preferredPrayerTeamId: "team-prayer-imaara", branchId: "branch-imaara", urgent: false, permissionToContact: true, permissionToShare: false, reviewAt: "2026-07-18", status: "assigned", testimonyId: "testimony-mary-1", createdAt: "2026-07-11T09:15:00.000Z" },
  { id: "prayer-anonymous", tenantId: "tenant-kings-grace", title: "Anonymous care request", details: "Anonymous request with metadata retained for abuse prevention.", category: "General Pastoral Support", confidentiality: "anonymous", branchId: "branch-imaara", urgent: true, permissionToContact: false, permissionToShare: false, reviewAt: "2026-07-12", status: "received", createdAt: "2026-07-11T12:15:00.000Z" },
];

export const prayerAssignments: PrayerAssignment[] = [
  { id: "prayer-assignment-mary", tenantId: "tenant-kings-grace", requestId: "prayer-mary-private", teamId: "team-prayer-imaara", assignedBy: "user-branch", assignedAt: "2026-07-11T10:05:00.000Z", status: "accepted" },
];

export const prayerFollowUps: PrayerFollowUp[] = [
  { id: "prayer-followup-mary", requestId: "prayer-mary-private", prayedAt: "2026-07-11T18:00:00.000Z", teamId: "team-prayer-imaara", note: "Prayer team prayed and requested pastoral follow-up without recording private commentary.", contactRequested: true, pastoralReferralNeeded: false, remainsActive: true, nextReviewAt: "2026-07-18" },
];

export const testimonies: Testimony[] = [
  { id: "testimony-mary-1", tenantId: "tenant-kings-grace", personId: "person-visitor-mary", title: "Grateful for care", narrative: "Full narrative awaiting review and consent check.", relatedPrayerRequestId: "prayer-mary-private", relatedCaseId: "case-prayer-mary", branchId: "branch-imaara", permissionToContact: true, permissionToEdit: true, permissionToPublish: false, preferredAnonymity: "first_name", mediaConsent: false, publicationChannels: ["service_internal"], reviewerUserId: "user-admin", status: "under_review" },
];

export const counsellingAppointments: CounsellingAppointment[] = [
  { id: "appointment-john-1", tenantId: "tenant-kings-grace", caseId: "case-counselling-john", personId: "person-newconvert-john", assignedCounsellorId: "user-volunteer", branchId: "branch-ruiru", location: "Ruiru Campus counselling room", mode: "physical", startsAt: "2026-07-14T15:00:00.000Z", durationMinutes: 60, category: "New believer support", language: "sw", urgency: "soon", confidentiality: "restricted", consentStatus: "granted", status: "scheduled", reminderEnabled: true, followUpAction: "Confirm attendance by SMS" },
];

export const counsellingSessions: CounsellingSession[] = [
  { id: "session-john-1", appointmentId: "appointment-john-1", attendingUserId: "user-volunteer", date: "2026-07-14", durationMinutes: 60, outcomeCategory: "follow_up_needed", nextAction: "Schedule second session if member consents", followUpDate: "2026-07-21", referralRequired: false, consentNotes: "Consent to counselling record confirmed.", restrictedNoteId: "note-john-restricted", memberVisibleSummary: "Next appointment to be confirmed.", safeguardingFlag: false },
];

export const pastoralVisits: PastoralVisit[] = [
  { id: "visit-hospital-1", tenantId: "tenant-kings-grace", caseId: "case-counselling-john", personId: "person-newconvert-john", visitType: "hospital visit", location: "Ruiru hospital", institution: "Ruiru hospital", assignedVisitorId: "user-branch", visitAt: "2026-07-12T16:00:00.000Z", status: "scheduled", transportNeeds: "Church vehicle placeholder", consentStatus: "granted", contactPerson: "Member supplied contact", purpose: "Pastoral visit with health details restricted", nextAction: "Complete mobile visit note" },
];

export const bereavementCases: BereavementCase[] = [
  { id: "bereavement-1", tenantId: "tenant-kings-grace", caseId: "case-prayer-mary", deceasedPersonId: undefined, householdId: "household-mary", primaryFamilyContactPersonId: "person-visitor-mary", branchId: "branch-imaara", dateOfDeath: "2026-07-10", funeralDate: "2026-07-18", burialLocation: "Family location withheld", assignedPastorId: "user-branch", supportTeamUserIds: ["user-volunteer"], announcementsConsent: false, familyCommunicationPreference: "phone", status: "supporting", suppressOrdinaryMessages: true },
];

export const welfareRequests: WelfareRequest[] = [
  { id: "welfare-mary-rent", tenantId: "tenant-kings-grace", caseId: "case-welfare-household", applicantPersonId: "person-visitor-mary", beneficiaryPersonId: "person-visitor-mary", householdId: "household-mary", category: "rent support", amountRequested: 75000, urgency: "urgent", reason: "Reason held in restricted welfare notes.", assignedOfficerId: "user-admin", recommendation: "Short-term support plus employment referral.", approvalStatus: "higher_approval_required", approvedSupport: undefined, provisionStatus: "reserved_for_finance_phase", followUpAt: "2026-07-25", confidentiality: "welfare_finance", requesterUserId: "user-volunteer" },
];

export const welfareAssessments: WelfareAssessment[] = [
  { id: "assessment-mary-rent", requestId: "welfare-mary-rent", assessedBy: "user-admin", immediateNeed: "Urgent rent pressure", householdImpact: "Household stability concern", previousSupport: "No prior welfare support found", alternativeSources: "Family support being explored", requestedDuration: "One month", nonFinancialIntervention: "Employment support referral", referralRecommendation: "Employment support ministry", urgency: "urgent", safeguardingConcern: false, followUpDate: "2026-07-25" },
];

export const professionalReferrals: ProfessionalReferral[] = [
  { id: "professional-referral-counsellor", tenantId: "tenant-kings-grace", caseId: "case-counselling-john", referralType: "qualified counsellor", reason: "Pastor requested specialist counselling support.", consentStatus: "granted", urgency: "soon", serviceName: "Church-approved counsellor list entry", contactInformation: "Contact shared through secure referral only", referredBy: "user-branch", referredAt: "2026-07-11T12:00:00.000Z", documentsShared: ["redacted_summary"], sharingBasis: "Member consent and pastoral referral", followUpAt: "2026-07-21", outcomeStatus: "pending", providerVerification: "church_approved" },
];

export const pastoralReferrals: PastoralReferral[] = [
  { id: "referral-john-specialist", tenantId: "tenant-kings-grace", caseId: "case-counselling-john", referringUserId: "user-branch", receivingUserId: "user-volunteer", direction: "specialist", reason: "Specialist counselling consultation requested.", urgency: "soon", summary: "Redacted counselling referral summary.", sharedInformation: ["redacted_summary", "member_visible_only"], permissionsGranted: ["pastoral_case.view_assigned"], consentStatus: "granted", dueAt: "2026-07-14T12:00:00.000Z", status: "accepted", decision: "Accepted for scheduling", nextAction: "Schedule session", accessExpiresAt: "2026-07-15T12:00:00.000Z" },
  { id: "referral-safeguarding-principal", tenantId: "tenant-kings-grace", caseId: "case-safeguarding-grace", referringUserId: "user-branch", receivingUserId: "user-admin", direction: "safeguarding", reason: "Urgent safeguarding routing", urgency: "immediate", summary: "Safeguarding package shared only with authorized lead.", sharedInformation: ["safeguarding_package"], permissionsGranted: ["safeguarding.case.view"], consentStatus: "emergency_override", dueAt: "2026-07-11T13:00:00.000Z", status: "received", nextAction: "Immediate safeguarding review", accessExpiresAt: "2026-07-18T13:00:00.000Z" },
];

export const safeguardingCases: SafeguardingCase[] = [
  { id: "safeguarding-grace-1", tenantId: "tenant-kings-grace", caseId: "case-safeguarding-grace", category: "child protection concern", raisedBy: "user-branch", assignedSafeguardingUserId: "user-admin", accusedPersonId: "person-david", urgency: "immediate", status: "routed", externalReferralRequired: true, emergencyMessage: "If someone is in immediate danger, use the appropriate local emergency services and safeguarding procedures. Do not rely only on the software workflow." },
];

export const safeguardingActions: SafeguardingAction[] = [
  { id: "safeguarding-action-1", safeguardingCaseId: "safeguarding-grace-1", actionType: "internal_safeguarding_referral", actorUserId: "user-admin", summary: "Urgent safeguarding referral recorded without legal conclusion.", createdAt: "2026-07-11T12:50:00.000Z" },
];

export const caseTasks: CaseTask[] = [
  { id: "task-prayer-followup", tenantId: "tenant-kings-grace", caseId: "case-prayer-mary", assignedUserId: "user-volunteer", dueAt: "2026-07-13T09:00:00.000Z", priority: "soon", taskType: "call_member", description: "Contact Mary using approved channel after prayer follow-up.", visibility: "case_team", status: "pending", escalated: false, createdBy: "user-branch", createdAt: "2026-07-11T10:15:00.000Z" },
  { id: "task-welfare-approval", tenantId: "tenant-kings-grace", caseId: "case-welfare-household", assignedUserId: "user-admin", dueAt: "2026-07-12T12:00:00.000Z", priority: "urgent", taskType: "review_welfare_approval", description: "Review amount-based welfare support recommendation.", visibility: "supervisor", status: "pending", escalated: true, createdBy: "user-admin", createdAt: "2026-07-11T10:45:00.000Z" },
  { id: "task-visit-complete", tenantId: "tenant-kings-grace", caseId: "case-counselling-john", assignedUserId: "user-branch", dueAt: "2026-07-12T18:00:00.000Z", priority: "soon", taskType: "complete_visit", description: "Complete hospital visit outcome and create follow-up action.", visibility: "assigned", status: "pending", escalated: false, createdBy: "user-branch", createdAt: "2026-07-11T12:20:00.000Z" },
];

export const carePlans: CarePlan[] = [
  { id: "careplan-john", tenantId: "tenant-kings-grace", caseId: "case-counselling-john", goals: ["Support new-believer integration", "Complete counselling referral"], responsibleUserIds: ["user-branch", "user-volunteer"], targetDate: "2026-08-15", status: "active", reviewDate: "2026-07-21", consentStatus: "granted", closureCriteria: "Member-visible action summary completed and follow-up consent reviewed." },
];

export const caseTimeline: CaseTimelineEntry[] = [
  { id: "timeline-mary-opened", tenantId: "tenant-kings-grace", caseId: "case-prayer-mary", occurredAt: "2026-07-11T09:15:00.000Z", eventType: "case_opened", safeSummary: "Prayer care case opened from public form.", visibility: "all_case_viewers" },
  { id: "timeline-john-referral", tenantId: "tenant-kings-grace", caseId: "case-counselling-john", occurredAt: "2026-07-11T12:00:00.000Z", eventType: "referral_submitted", safeSummary: "Specialist referral submitted with selected information only.", visibility: "all_case_viewers" },
  { id: "timeline-john-note", tenantId: "tenant-kings-grace", caseId: "case-counselling-john", occurredAt: "2026-07-11T11:45:00.000Z", eventType: "note_added", safeSummary: "Restricted counselling note added.", restrictedNoteId: "note-john-restricted", visibility: "restricted_notes" },
  { id: "timeline-safeguarding", tenantId: "tenant-kings-grace", caseId: "case-safeguarding-grace", occurredAt: "2026-07-11T12:50:00.000Z", eventType: "safeguarding_action", safeSummary: "Safeguarding action recorded.", restrictedNoteId: "note-safeguarding-action", visibility: "safeguarding_only" },
];
