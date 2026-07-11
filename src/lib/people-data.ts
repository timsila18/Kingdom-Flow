import type {
  ActivitySignal,
  ContactAttempt,
  DuplicateCandidate,
  ExportJob,
  FollowUpAssignment,
  FollowUpTask,
  FollowUpWorker,
  FormDefinition,
  Household,
  HouseholdMember,
  ImportJob,
  LifecycleEvent,
  LifecycleStage,
  NewConvertRecord,
  Person,
  PersonConsent,
  QrCode,
  TransferRequest,
  VisitorRecord,
} from "./people-types";

export const lifecycleStages: LifecycleStage[] = [
  { key: "unknown", displayName: "Unknown / Unclassified", order: 1, approvalRequired: false, automatic: false },
  { key: "visitor", displayName: "Visitor", order: 2, approvalRequired: false, automatic: true },
  { key: "first_time_visitor", displayName: "First-Time Visitor", order: 3, approvalRequired: false, automatic: true },
  { key: "returning_visitor", displayName: "Returning Visitor", order: 4, approvalRequired: false, automatic: true },
  { key: "new_convert", displayName: "New Believer", order: 5, approvalRequired: false, automatic: false },
  { key: "follow_up", displayName: "Follow-Up in Progress", order: 6, approvalRequired: false, automatic: true },
  { key: "foundation_programme", displayName: "Foundation Programme", order: 7, approvalRequired: false, automatic: false },
  { key: "prospective_member", displayName: "Prospective Member", order: 8, approvalRequired: false, automatic: false },
  { key: "member", displayName: "Member", order: 9, approvalRequired: true, automatic: false },
  { key: "serving_member", displayName: "Serving Member", order: 10, approvalRequired: false, automatic: false },
  { key: "ministry_worker", displayName: "Ministry Worker", order: 11, approvalRequired: true, automatic: false },
  { key: "leader", displayName: "Leader", order: 12, approvalRequired: true, automatic: false },
  { key: "inactive", displayName: "Inactive", order: 13, approvalRequired: false, automatic: false },
  { key: "transferred", displayName: "Transferred", order: 14, approvalRequired: true, automatic: false },
  { key: "archived", displayName: "Archived", order: 15, approvalRequired: true, automatic: false },
];

export const people: Person[] = [
  {
    id: "person-amina",
    tenantId: "tenant-kings-grace",
    title: "Mrs",
    firstName: "Amina",
    surname: "Otieno",
    preferredName: "Amina",
    gender: "female",
    ageGroup: "adult",
    phoneNumbers: ["+254700000001"],
    emailAddresses: ["admin@kingsgrace.test"],
    preferredContactMethod: "email",
    preferredLanguage: "en",
    branchId: "branch-imaara",
    organizationUnitId: "unit-head",
    communicationPreferences: ["email", "sms"],
    consentStatus: "granted",
    privacyRestrictions: [],
    memberNumber: "KGC-000001",
    sourceOfFirstContact: "Founding administrator",
    lifecycleStage: "leader",
    relationshipStatus: "leader",
    membershipStartDate: "2026-07-11",
    lastMeaningfulActivityDate: "2026-07-11",
    active: true,
    archived: false,
    createdBy: "user-platform-owner",
    updatedBy: "user-admin",
    createdAt: "2026-07-11T08:00:00.000Z",
    updatedAt: "2026-07-11T08:00:00.000Z",
  },
  {
    id: "person-david",
    tenantId: "tenant-kings-grace",
    firstName: "David",
    surname: "Mwangi",
    preferredName: "David",
    gender: "male",
    ageGroup: "adult",
    phoneNumbers: ["+254711000111"],
    emailAddresses: ["branch@kingsgrace.test"],
    preferredContactMethod: "phone",
    preferredLanguage: "en",
    branchId: "branch-imaara",
    organizationUnitId: "unit-east",
    communicationPreferences: ["phone", "whatsapp"],
    consentStatus: "granted",
    privacyRestrictions: [],
    memberNumber: "KGC-000002",
    sourceOfFirstContact: "Branch launch",
    lifecycleStage: "leader",
    relationshipStatus: "leader",
    membershipStartDate: "2026-07-11",
    lastMeaningfulActivityDate: "2026-07-11",
    active: true,
    archived: false,
    createdBy: "user-admin",
    updatedBy: "user-admin",
    createdAt: "2026-07-11T08:15:00.000Z",
    updatedAt: "2026-07-11T08:15:00.000Z",
  },
  {
    id: "person-visitor-mary",
    tenantId: "tenant-kings-grace",
    firstName: "Mary",
    surname: "Wairimu",
    preferredName: "Mary",
    gender: "female",
    ageGroup: "adult",
    phoneNumbers: ["+254722000010"],
    emailAddresses: ["mary@example.com"],
    preferredContactMethod: "whatsapp",
    preferredLanguage: "en",
    branchId: "branch-imaara",
    organizationUnitId: "unit-imaara",
    locality: "Imaara Daima",
    communicationPreferences: ["whatsapp", "phone"],
    consentStatus: "granted",
    privacyRestrictions: [],
    sourceOfFirstContact: "Branch QR form",
    lifecycleStage: "first_time_visitor",
    relationshipStatus: "visitor",
    firstVisitDate: "2026-07-07",
    lastMeaningfulActivityDate: "2026-07-07",
    active: true,
    archived: false,
    createdBy: "public-form",
    updatedBy: "user-admin",
    createdAt: "2026-07-07T09:30:00.000Z",
    updatedAt: "2026-07-07T09:30:00.000Z",
  },
  {
    id: "person-newconvert-john",
    tenantId: "tenant-kings-grace",
    firstName: "John",
    surname: "Kariuki",
    preferredName: "John",
    gender: "male",
    ageGroup: "youth",
    phoneNumbers: ["+254733000020"],
    emailAddresses: [],
    preferredContactMethod: "sms",
    preferredLanguage: "sw",
    branchId: "branch-ruiru",
    organizationUnitId: "unit-ruiru",
    locality: "Ruiru",
    communicationPreferences: ["sms", "phone"],
    consentStatus: "granted",
    privacyRestrictions: [],
    sourceOfFirstContact: "Sunday service",
    lifecycleStage: "new_convert",
    relationshipStatus: "prospective",
    firstVisitDate: "2026-07-07",
    lastMeaningfulActivityDate: "2026-07-07",
    active: true,
    archived: false,
    createdBy: "user-branch",
    updatedBy: "user-branch",
    createdAt: "2026-07-07T11:00:00.000Z",
    updatedAt: "2026-07-07T11:00:00.000Z",
  },
  {
    id: "person-child-grace",
    tenantId: "tenant-kings-grace",
    firstName: "Grace",
    surname: "Otieno",
    ageGroup: "child",
    dateOfBirth: "2016-03-04",
    phoneNumbers: [],
    emailAddresses: [],
    preferredContactMethod: "none",
    preferredLanguage: "en",
    branchId: "branch-imaara",
    organizationUnitId: "unit-imaara",
    communicationPreferences: [],
    consentStatus: "partially_granted",
    privacyRestrictions: ["child_protected", "guardian_contact_only", "no_general_export"],
    sourceOfFirstContact: "Household registration",
    lifecycleStage: "member",
    relationshipStatus: "member",
    membershipStartDate: "2026-07-11",
    active: true,
    archived: false,
    createdBy: "user-admin",
    updatedBy: "user-admin",
    createdAt: "2026-07-11T08:30:00.000Z",
    updatedAt: "2026-07-11T08:30:00.000Z",
  },
];

export const lifecycleEvents: LifecycleEvent[] = [
  { id: "life-mary-1", tenantId: "tenant-kings-grace", personId: "person-visitor-mary", previousStage: "unknown", newStage: "first_time_visitor", reason: "Submitted branch visitor form", branchId: "branch-imaara", effectiveDate: "2026-07-07", performedBy: "public-form", createdAt: "2026-07-07T09:30:00.000Z" },
  { id: "life-john-1", tenantId: "tenant-kings-grace", personId: "person-newconvert-john", previousStage: "first_time_visitor", newStage: "new_convert", reason: "Faith decision recorded after service", branchId: "branch-ruiru", effectiveDate: "2026-07-07", performedBy: "user-branch", createdAt: "2026-07-07T11:00:00.000Z" },
];

export const households: Household[] = [
  { id: "household-otieno", tenantId: "tenant-kings-grace", name: "Otieno Household", primaryContactPersonId: "person-amina", branchId: "branch-imaara", address: "Imaara Daima", preferredLanguage: "en", communicationPreference: "primary_contact", restrictedFamilyNotes: "Restricted family care note", active: true },
];

export const householdMembers: HouseholdMember[] = [
  { id: "hh-amina", tenantId: "tenant-kings-grace", householdId: "household-otieno", personId: "person-amina", relationshipType: "parent", childPrivacyProtected: false },
  { id: "hh-grace", tenantId: "tenant-kings-grace", householdId: "household-otieno", personId: "person-child-grace", relationshipType: "child", guardianForPersonId: "person-child-grace", childPrivacyProtected: true },
];

export const visitorRecords: VisitorRecord[] = [
  { id: "visit-mary-1", tenantId: "tenant-kings-grace", personId: "person-visitor-mary", branchId: "branch-imaara", visitDate: "2026-07-07", captureMethod: "qr", firstEverVisit: true, returningVisitor: false, invitedBy: "A friend", heardAbout: "Friend invitation", prayerRequest: "Pray for work transition", wantsFollowUp: true, madeFaithDecision: false, wantsFellowship: true, wantsClass: false, consentToContact: true },
  { id: "visit-john-1", tenantId: "tenant-kings-grace", personId: "person-newconvert-john", branchId: "branch-ruiru", visitDate: "2026-07-07", captureMethod: "usher", firstEverVisit: true, returningVisitor: false, heardAbout: "Walked in", wantsFollowUp: true, madeFaithDecision: true, wantsFellowship: true, wantsClass: true, consentToContact: true },
];

export const newConvertRecords: NewConvertRecord[] = [
  { id: "convert-john-1", tenantId: "tenant-kings-grace", personId: "person-newconvert-john", decisionDate: "2026-07-07", branchId: "branch-ruiru", recordedBy: "user-branch", preferredFollowUpMethod: "sms", consentToFollowUp: true, assignedWorkerId: "user-branch", assignedPastorId: "user-admin", status: "assigned", urgency: "high", requestedBaptismInfo: true, attendsAnotherChurch: false },
];

export const followUpWorkers: FollowUpWorker[] = [
  { id: "worker-david", tenantId: "tenant-kings-grace", userId: "user-branch", maxActiveAssignments: 8, preferredBranchId: "branch-ruiru", languages: ["en", "sw"], ageGroups: ["adult", "youth"], active: true },
  { id: "worker-amina", tenantId: "tenant-kings-grace", userId: "user-admin", maxActiveAssignments: 5, preferredBranchId: "branch-imaara", languages: ["en"], ageGroups: ["adult"], active: true },
];

export const followUpAssignments: FollowUpAssignment[] = [
  { id: "assignment-mary", tenantId: "tenant-kings-grace", personId: "person-visitor-mary", workerUserId: "user-admin", branchId: "branch-imaara", status: "accepted", assignedAt: "2026-07-07T10:00:00.000Z", acceptedAt: "2026-07-07T10:05:00.000Z", dueAt: "2026-07-08T10:00:00.000Z", assignmentReason: "First-time visitor requested fellowship" },
  { id: "assignment-john", tenantId: "tenant-kings-grace", personId: "person-newconvert-john", workerUserId: "user-branch", pastorUserId: "user-admin", branchId: "branch-ruiru", status: "accepted", assignedAt: "2026-07-07T11:10:00.000Z", acceptedAt: "2026-07-07T11:20:00.000Z", dueAt: "2026-07-08T11:10:00.000Z", assignmentReason: "New convert follow-up within 24 hours" },
];

export const followUpTasks: FollowUpTask[] = [
  { id: "task-mary-call", tenantId: "tenant-kings-grace", personId: "person-visitor-mary", assignedUserId: "user-admin", taskType: "first_call", description: "Welcome Mary and invite her to fellowship", dueDate: "2026-07-08T10:00:00.000Z", priority: "normal", branchId: "branch-imaara", status: "completed", outcome: "Reached, wants fellowship" },
  { id: "task-john-call", tenantId: "tenant-kings-grace", personId: "person-newconvert-john", assignedUserId: "user-branch", taskType: "first_contact", description: "First contact for John after faith decision", dueDate: "2026-07-08T11:10:00.000Z", priority: "high", branchId: "branch-ruiru", status: "pending" },
];

export const contactAttempts: ContactAttempt[] = [
  { id: "contact-mary-1", tenantId: "tenant-kings-grace", personId: "person-visitor-mary", attemptedBy: "user-admin", attemptedAt: "2026-07-08T09:00:00.000Z", method: "whatsapp", result: "reached", followUpNeeded: true, nextAction: "Fellowship invitation", requestedNoFurtherContact: false },
];

export const personConsents: PersonConsent[] = [
  { id: "consent-mary-whatsapp", tenantId: "tenant-kings-grace", personId: "person-visitor-mary", consentType: "whatsapp", status: "granted", date: "2026-07-07", method: "qr_form", source: "visitor form", recordedBy: "public-form" },
  { id: "consent-john-sms", tenantId: "tenant-kings-grace", personId: "person-newconvert-john", consentType: "sms", status: "granted", date: "2026-07-07", method: "staff_entry", source: "new convert card", recordedBy: "user-branch" },
  { id: "consent-child-photo", tenantId: "tenant-kings-grace", personId: "person-child-grace", consentType: "photo_media", status: "withdrawn", date: "2026-07-11", method: "guardian", source: "household update", recordedBy: "user-admin", withdrawalDate: "2026-07-11" },
];

export const transferRequests: TransferRequest[] = [
  { id: "transfer-david-1", tenantId: "tenant-kings-grace", personId: "person-david", sourceBranchId: "branch-imaara", destinationBranchId: "branch-ruiru", reason: "Pastoral deployment", requestedBy: "user-admin", effectiveDate: "2026-08-01", status: "pending_destination_approval" },
];

export const duplicateCandidates: DuplicateCandidate[] = [
  { id: "dup-mary-1", tenantId: "tenant-kings-grace", primaryPersonId: "person-visitor-mary", possibleDuplicatePersonId: "person-newconvert-john", signals: ["similar locality only"], status: "pending_review" },
];

export const formDefinitions: FormDefinition[] = [
  { id: "form-visitor-imaara", tenantId: "tenant-kings-grace", branchId: "branch-imaara", name: "Imaara First-Time Visitor Form", type: "first_timer", public: true, active: true, language: "en", consentStatement: "I consent to be contacted by King's Grace about my visit and requested care.", confirmationMessage: "Thank you. A real person from the church will follow up responsibly." },
  { id: "form-new-convert-ruiru", tenantId: "tenant-kings-grace", branchId: "branch-ruiru", name: "Ruiru New Believer Follow-Up Form", type: "new_convert", public: false, active: true, language: "en", consentStatement: "Follow-up is voluntary and respectful.", confirmationMessage: "New believer follow-up has been recorded." },
];

export const qrCodes: QrCode[] = [
  { id: "qr-imaara-visitor", tenantId: "tenant-kings-grace", branchId: "branch-imaara", formId: "form-visitor-imaara", code: "KGC-IMA-VISITOR", active: true, scans: 42, submissions: 11 },
];

export const importJobs: ImportJob[] = [
  { id: "import-legacy-members", tenantId: "tenant-kings-grace", category: "legacy", status: "validated", validRows: 120, invalidRows: 3, dryRun: true },
];

export const exportJobs: ExportJob[] = [
  { id: "export-visitors", tenantId: "tenant-kings-grace", requestedBy: "user-admin", exportType: "visitor list", reason: "Branch follow-up review", scopeType: "branch", status: "ready", sensitive: false },
];

export const activitySignals: ActivitySignal[] = [
  { id: "activity-mary-followup", tenantId: "tenant-kings-grace", personId: "person-visitor-mary", signalType: "active_follow_up", occurredAt: "2026-07-08T09:00:00.000Z", billableEligible: false },
  { id: "activity-amina-service", tenantId: "tenant-kings-grace", personId: "person-amina", signalType: "attended_service", occurredAt: "2026-07-07T09:00:00.000Z", billableEligible: true },
];
