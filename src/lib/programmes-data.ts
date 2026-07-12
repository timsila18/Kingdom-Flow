import type {
  Assessment,
  AssessmentResult,
  Assignment,
  AssignmentSubmission,
  Certificate,
  ClassSession,
  CompletionRule,
  EligibilityResult,
  LearningMaterial,
  LeadershipPathway,
  Mentorship,
  PaymentDestination,
  Programme,
  ProgrammeApplication,
  ProgrammeAttendance,
  ProgrammeCohort,
  ProgrammeEnrolment,
  ProgrammeModule,
  ProgrammeLesson,
  ProgrammePayment,
  ProgrammeType,
  ProgrammeVersion,
  Scholarship,
  TechnologyFeeRule,
  TrainerAssignment,
  TrainerQualification,
} from "./programmes-types";

export const programmeTypes: ProgrammeType[] = [
  { id: "ptype-foundation", tenantId: "tenant-kings-grace", key: "foundation", displayName: "Foundation", defaultApprovalWorkflowId: "workflow-programme-standard", defaultCertificateRule: "completion approved", defaultFeeTreatment: "manual_direct_to_church", defaultProgressionRule: "recommend membership class", active: true },
  { id: "ptype-discipleship", tenantId: "tenant-kings-grace", key: "discipleship", displayName: "Discipleship", defaultApprovalWorkflowId: "workflow-programme-standard", defaultCertificateRule: "attendance plus assessment", defaultFeeTreatment: "learner_pays", defaultProgressionRule: "recommend ministry service", active: true },
  { id: "ptype-leadership", tenantId: "tenant-kings-grace", key: "leadership", displayName: "Leadership Academy", defaultApprovalWorkflowId: "workflow-programme-leadership", defaultCertificateRule: "coordinator and pastor approval", defaultFeeTreatment: "church_absorbs", defaultProgressionRule: "leadership review only", active: true },
];

export const programmes: Programme[] = [
  {
    id: "programme-foundation",
    tenantId: "tenant-kings-grace",
    branchId: "branch-imaara",
    organizationUnitId: "unit-imaara",
    programmeTypeId: "ptype-foundation",
    code: "FF-2026",
    title: "Firm Foundation",
    subtitle: "New believer and membership foundations",
    description: "A church-controlled foundation programme for new believers and people exploring membership.",
    objectives: ["Welcome learners", "Explain church life", "Connect to fellowship and next steps"],
    targetAudience: "New converts, first-timers and prospective members",
    eligibilitySummary: "Open to learners with consent and branch placement.",
    ageRequirement: "13+ or guardian-approved child journey",
    prerequisiteSummary: "No doctrinal prerequisite hard-coded by KingdomFlow.",
    learningOutcomes: ["Understand next steps", "Meet a mentor", "Complete foundation sessions"],
    durationSummary: "4 weekly sessions",
    deliveryMode: "hybrid",
    branchAvailability: ["branch-imaara", "branch-ruiru"],
    language: "en",
    capacity: 30,
    enrolmentOpensAt: "2026-07-12",
    enrolmentClosesAt: "2026-08-01",
    startDate: "2026-08-03",
    endDate: "2026-08-24",
    status: "enrolment_open",
    publicationStatus: "catalogue",
    feeModel: "free",
    price: 0,
    currency: "KES",
    technologyFeeTreatment: "manual_direct_to_church",
    scholarshipAvailable: false,
    refundPolicy: "Free programme; no learner fee collected.",
    certificateAvailable: true,
    graduationRequirement: "Attendance, assignment and coordinator approval.",
    approvalWorkflowId: "workflow-programme-standard",
    ownerUserId: "user-admin",
    coordinatorUserId: "user-branch",
    leadTrainerUserId: "user-branch",
    createdBy: "user-admin",
    updatedBy: "user-admin",
    createdAt: "2026-07-12T08:00:00.000Z",
    updatedAt: "2026-07-12T08:00:00.000Z",
  },
  {
    id: "programme-discipleship",
    tenantId: "tenant-kings-grace",
    branchId: "branch-imaara",
    organizationUnitId: "unit-east",
    programmeTypeId: "ptype-discipleship",
    code: "DS-350",
    title: "Discipleship School",
    description: "A paid discipleship programme with transparent church fee and technology fee disclosure.",
    objectives: ["Structured learning", "Mentored practice", "Assessment and certificate"],
    targetAudience: "Members and serving volunteers",
    eligibilitySummary: "Foundation completion or leader recommendation.",
    prerequisiteSummary: "Foundation completion, leader nomination or approved override.",
    learningOutcomes: ["Complete assignments", "Pass assessment", "Receive next-step recommendation"],
    durationSummary: "6 sessions",
    deliveryMode: "cohort_based",
    branchAvailability: ["branch-imaara"],
    language: "en",
    capacity: 2,
    enrolmentOpensAt: "2026-07-12",
    enrolmentClosesAt: "2026-07-30",
    startDate: "2026-08-05",
    endDate: "2026-09-09",
    status: "enrolment_open",
    publicationStatus: "public_page",
    feeModel: "paid",
    price: 350,
    currency: "KES",
    technologyFeeTreatment: "learner_pays",
    scholarshipAvailable: true,
    refundPolicy: "Refunds require coordinator and finance review before class week two.",
    certificateAvailable: true,
    graduationRequirement: "80% attendance, assignment complete, assessment passed, fee cleared.",
    approvalWorkflowId: "workflow-programme-standard",
    ownerUserId: "user-admin",
    coordinatorUserId: "user-admin",
    leadTrainerUserId: "user-branch",
    createdBy: "user-admin",
    updatedBy: "user-admin",
    createdAt: "2026-07-12T08:30:00.000Z",
    updatedAt: "2026-07-12T08:30:00.000Z",
  },
];

export const programmeVersions: ProgrammeVersion[] = [
  { id: "pver-foundation-v1", tenantId: "tenant-kings-grace", programmeId: "programme-foundation", versionNumber: 1, effectiveDate: "2026-07-12", curriculumChanges: ["Initial foundation curriculum"], feeChanges: ["Free programme"], createdBy: "user-admin", approvedBy: "user-admin", status: "approved" },
  { id: "pver-discipleship-v1", tenantId: "tenant-kings-grace", programmeId: "programme-discipleship", versionNumber: 1, effectiveDate: "2026-07-12", curriculumChanges: ["Initial discipleship school structure"], feeChanges: ["Church fee KES 350"], createdBy: "user-admin", approvedBy: "user-admin", status: "approved" },
];

export const programmeModules: ProgrammeModule[] = [
  { id: "mod-foundation-belonging", tenantId: "tenant-kings-grace", programmeVersionId: "pver-foundation-v1", title: "Belonging and Next Steps", description: "Welcome, care, fellowship and next-step planning.", order: 1 },
  { id: "mod-discipleship-practice", tenantId: "tenant-kings-grace", programmeVersionId: "pver-discipleship-v1", title: "Practice and Reflection", description: "Learner assignments, observation and moderated assessment.", order: 1 },
];

export const programmeLessons: ProgrammeLesson[] = [
  { id: "lesson-foundation-1", tenantId: "tenant-kings-grace", moduleId: "mod-foundation-belonging", title: "Welcome to Church Life", objective: "Orient learners without forcing membership.", summary: "Church-controlled lesson notes and next steps.", trainerUserId: "user-branch", durationMinutes: 90, deliveryMode: "hybrid", materialIds: ["mat-foundation-notes"], scriptureReferences: ["Acts 2:42"], releaseDate: "2026-08-03", attendanceRequired: true },
  { id: "lesson-discipleship-1", tenantId: "tenant-kings-grace", moduleId: "mod-discipleship-practice", title: "Learning and Practice", objective: "Prepare learners for assignment and assessment.", summary: "Trainer-led practical session.", trainerUserId: "user-branch", durationMinutes: 120, deliveryMode: "cohort_based", materialIds: ["mat-discipleship-reading"], scriptureReferences: [], releaseDate: "2026-08-05", dueDate: "2026-08-12", attendanceRequired: true },
];

export const programmeCohorts: ProgrammeCohort[] = [
  { id: "cohort-foundation-aug", tenantId: "tenant-kings-grace", programmeId: "programme-foundation", programmeVersionId: "pver-foundation-v1", name: "August Foundation Intake", code: "FF-AUG", branchId: "branch-imaara", trainerUserIds: ["user-branch"], startDate: "2026-08-03", endDate: "2026-08-24", schedule: "Mondays 18:30", capacity: 30, venue: "Imaara Campus Hall", onlineLink: "integration placeholder", enrolmentStatus: "open", applicationDeadline: "2026-08-01", waitlistEnabled: true, status: "open", graduationDate: "2026-08-31", reportingUnitId: "unit-imaara" },
  { id: "cohort-discipleship-aug", tenantId: "tenant-kings-grace", programmeId: "programme-discipleship", programmeVersionId: "pver-discipleship-v1", name: "August Discipleship School", code: "DS-AUG", branchId: "branch-imaara", trainerUserIds: ["user-branch"], startDate: "2026-08-05", endDate: "2026-09-09", schedule: "Wednesdays 18:00", capacity: 2, venue: "Imaara Training Room", enrolmentStatus: "full", applicationDeadline: "2026-07-30", waitlistEnabled: true, status: "open", graduationDate: "2026-09-20", reportingUnitId: "unit-east" },
];

export const trainerAssignments: TrainerAssignment[] = [
  { id: "trainer-foundation-lead", tenantId: "tenant-kings-grace", programmeId: "programme-foundation", cohortId: "cohort-foundation-aug", userId: "user-branch", personId: "person-david", role: "lead_trainer", branchId: "branch-imaara", startDate: "2026-07-12", permissions: ["programme.attendance.capture", "programme.assignment.manage", "programme.grade"], status: "active" },
  { id: "trainer-discipleship-moderator", tenantId: "tenant-kings-grace", programmeId: "programme-discipleship", cohortId: "cohort-discipleship-aug", userId: "user-admin", personId: "person-amina", role: "moderator", branchId: "branch-imaara", startDate: "2026-07-12", permissions: ["programme.result.moderate", "programme.certificate.issue"], status: "active" },
];

export const trainerQualifications: TrainerQualification[] = [
  { id: "tqual-david", tenantId: "tenant-kings-grace", userId: "user-branch", experienceSummary: "Internal trainer for foundation and youth programmes.", internalCertification: ["Foundation Trainer"], ministryRole: "Branch Pastor", subjectsTaught: ["Foundation", "Discipleship"], languages: ["en", "sw"], availability: "Evenings", approvedProgrammeIds: ["programme-foundation", "programme-discipleship"], branchScope: ["branch-imaara", "branch-ruiru"], backgroundCheckStatus: "placeholder_not_checked", safeguardingClearanceStatus: "placeholder_not_checked" },
];

export const programmeApplications: ProgrammeApplication[] = [
  { id: "app-john-foundation", tenantId: "tenant-kings-grace", personId: "person-newconvert-john", programmeId: "programme-foundation", programmeVersionId: "pver-foundation-v1", cohortId: "cohort-foundation-aug", branchId: "branch-ruiru", applicationDate: "2026-07-12", source: "new_convert_journey", consent: true, status: "approved", eligibilityStatus: "eligible", prerequisiteStatus: "met", approvalStatus: "approved", paymentStatus: "not_required", scholarshipStatus: "not_requested", assignedMentorUserId: "user-branch" },
  { id: "app-mary-discipleship", tenantId: "tenant-kings-grace", personId: "person-visitor-mary", programmeId: "programme-discipleship", programmeVersionId: "pver-discipleship-v1", cohortId: "cohort-discipleship-aug", branchId: "branch-imaara", applicationDate: "2026-07-12", source: "fellowship_referral", consent: true, status: "pending_payment", eligibilityStatus: "eligible", prerequisiteStatus: "waived", approvalStatus: "approved", paymentStatus: "pending", scholarshipStatus: "requested", assignedMentorUserId: "user-branch" },
  { id: "app-waitlist-discipleship", tenantId: "tenant-kings-grace", personId: "person-david", programmeId: "programme-discipleship", programmeVersionId: "pver-discipleship-v1", cohortId: "cohort-discipleship-aug", branchId: "branch-imaara", applicationDate: "2026-07-12", source: "leader_nomination", consent: true, status: "waitlisted", eligibilityStatus: "eligible", prerequisiteStatus: "met", approvalStatus: "approved", paymentStatus: "pending", scholarshipStatus: "not_requested" },
];

export const programmeEnrolments: ProgrammeEnrolment[] = [
  { ...programmeApplications[0], id: "enrol-john-foundation", enrolmentStatus: "completed", startDate: "2026-08-03", completionDate: "2026-08-24", outstandingBalance: 0, progressPercent: 100 },
  { ...programmeApplications[1], id: "enrol-mary-discipleship", enrolmentStatus: "active", startDate: "2026-08-05", outstandingBalance: 180, progressPercent: 55 },
];

export const eligibilityResults: EligibilityResult[] = [
  { id: "elig-john-foundation", tenantId: "tenant-kings-grace", applicationId: "app-john-foundation", eligible: true, reasons: ["Consent granted", "Foundation has open intake"], missingRequirements: [] },
  { id: "elig-mary-discipleship", tenantId: "tenant-kings-grace", applicationId: "app-mary-discipleship", eligible: true, reasons: ["Coordinator waived foundation prerequisite with reason"], missingRequirements: [], overrideByUserId: "user-admin", overrideReason: "Fellowship leader recommendation and interview completed." },
];

export const scholarships: Scholarship[] = [
  { id: "scholar-mary", tenantId: "tenant-kings-grace", applicationId: "app-mary-discipleship", personId: "person-visitor-mary", programmeId: "programme-discipleship", type: "partial", amount: 180, percentage: 50, sponsor: "Church scholarship fund", restrictedReason: "Restricted hardship note", requestedAt: "2026-07-12", assessedByUserId: "user-admin", approvedByUserId: "user-admin", expiresAt: "2026-08-01", status: "approved" },
];

export const technologyFeeRules: TechnologyFeeRule[] = [
  { id: "techfee-2026-launch", version: 1, effectiveFrom: "2026-07-01", bands: [{ min: 0, max: 0, fee: 0 }, { min: 1, max: 499, fee: 10 }, { min: 500, max: 999, fee: 20 }, { min: 1000, max: 2499, fee: 30 }, { min: 2500, fee: 50 }], updatedByUserId: "user-platform-owner" },
];

export const paymentDestinations: PaymentDestination[] = [
  { id: "pd-imaara-programmes", tenantId: "tenant-kings-grace", label: "Imaara Programme Paybill", purpose: "programme", branchId: "branch-imaara", method: "mpesa_paybill", paybillOrTill: "123456", accountInstruction: "Use programme code and learner name", currency: "KES", paymentReferenceRule: "PROGRAMME-CODE-LEARNER", verificationStatus: "verified", active: true },
];

export const programmePayments: ProgrammePayment[] = [
  { id: "pay-mary-discipleship", tenantId: "tenant-kings-grace", applicationId: "app-mary-discipleship", personId: "person-visitor-mary", programmeId: "programme-discipleship", cohortId: "cohort-discipleship-aug", feeAmount: 350, technologyFee: 10, providerFee: 0, totalPaid: 180, churchAmount: 170, paymentDestinationId: "pd-imaara-programmes", paymentMethod: "mpesa_reference", transactionReference: "MPESA-MARY-001", paymentDate: "2026-07-12", verificationStatus: "verified", verifiedByUserId: "user-admin", receiptStatus: "issued", refundStatus: "none", status: "partially_paid", notes: "Partial scholarship covers remaining balance." },
];

export const classSessions: ClassSession[] = [
  { id: "session-foundation-1", tenantId: "tenant-kings-grace", cohortId: "cohort-foundation-aug", lessonId: "lesson-foundation-1", date: "2026-08-03", startTime: "18:30", endTime: "20:00", trainerUserId: "user-branch", venueOrLink: "Imaara Campus Hall", capacity: 30, attendanceStatus: "captured", materialIds: ["mat-foundation-notes"], reportStatus: "reviewed" },
  { id: "session-discipleship-1", tenantId: "tenant-kings-grace", cohortId: "cohort-discipleship-aug", lessonId: "lesson-discipleship-1", date: "2026-08-05", startTime: "18:00", endTime: "20:00", trainerUserId: "user-branch", venueOrLink: "Imaara Training Room", capacity: 2, attendanceStatus: "captured", materialIds: ["mat-discipleship-reading"], reportStatus: "submitted" },
];

export const programmeAttendance: ProgrammeAttendance[] = [
  { id: "patt-john-1", tenantId: "tenant-kings-grace", enrolmentId: "enrol-john-foundation", sessionId: "session-foundation-1", status: "present", checkedInAt: "2026-08-03T18:20:00.000Z", recordedByUserId: "user-branch", source: "trainer_check_in" },
  { id: "patt-mary-1", tenantId: "tenant-kings-grace", enrolmentId: "enrol-mary-discipleship", sessionId: "session-discipleship-1", status: "late", checkedInAt: "2026-08-05T18:12:00.000Z", recordedByUserId: "user-branch", source: "manual" },
];

export const learningMaterials: LearningMaterial[] = [
  { id: "mat-foundation-notes", tenantId: "tenant-kings-grace", programmeVersionId: "pver-foundation-v1", title: "Foundation Notes", type: "pdf", storageStatus: "placeholder", releaseDate: "2026-08-03", downloadPermission: "programme.material.manage", copyrightOwner: "King's Grace Community Church" },
  { id: "mat-discipleship-reading", tenantId: "tenant-kings-grace", programmeVersionId: "pver-discipleship-v1", title: "Discipleship Reading List", type: "reading_list", storageStatus: "restricted", releaseDate: "2026-08-05", downloadPermission: "programme.material.manage", copyrightOwner: "King's Grace Community Church" },
];

export const assignments: Assignment[] = [
  { id: "assign-foundation-reflection", tenantId: "tenant-kings-grace", programmeId: "programme-foundation", moduleId: "mod-foundation-belonging", lessonId: "lesson-foundation-1", title: "Next Step Reflection", instructions: "Submit a short reflection and next-step preference.", releaseDate: "2026-08-03", dueDate: "2026-08-10", allowedFormats: ["text", "pdf"], maxFileSizeMb: 5, gradingMethod: "complete_incomplete", passMark: 1, resubmissionAllowed: true, active: true },
];

export const assignmentSubmissions: AssignmentSubmission[] = [
  { id: "sub-john-reflection", tenantId: "tenant-kings-grace", assignmentId: "assign-foundation-reflection", enrolmentId: "enrol-john-foundation", submittedAt: "2026-08-09T18:00:00.000Z", status: "graded", grade: 1, passed: true, feedback: "Complete; next step recommended.", reviewedByUserId: "user-branch" },
];

export const assessments: Assessment[] = [
  { id: "assess-discipleship-practical", tenantId: "tenant-kings-grace", programmeId: "programme-discipleship", title: "Practical Reflection Assessment", type: "practical_assessment", passMark: 70, weight: 60, attemptsAllowed: 2, gradingMethod: "percentage", moderationRequired: true, resultVisibility: "released_to_learner" },
];

export const assessmentResults: AssessmentResult[] = [
  { id: "result-mary-practical", tenantId: "tenant-kings-grace", assessmentId: "assess-discipleship-practical", enrolmentId: "enrol-mary-discipleship", score: 76, grade: "Pass", passed: true, assessorUserId: "user-branch", feedback: "Passed after moderated review.", moderationStatus: "approved", attempt: 1, releasedAt: "2026-08-20T12:00:00.000Z", appealStatus: "none", version: 1 },
];

export const completionRules: CompletionRule[] = [
  { id: "rule-foundation-v1", tenantId: "tenant-kings-grace", programmeVersionId: "pver-foundation-v1", attendancePercent: 75, assignmentRequired: true, assessmentPassRequired: false, trainerRecommendationRequired: false, feeClearanceRequired: false, certificateApprovalRequired: true },
  { id: "rule-discipleship-v1", tenantId: "tenant-kings-grace", programmeVersionId: "pver-discipleship-v1", attendancePercent: 80, assignmentRequired: false, assessmentPassRequired: true, trainerRecommendationRequired: true, feeClearanceRequired: true, certificateApprovalRequired: true },
];

export const certificates: Certificate[] = [
  { id: "cert-john-foundation", tenantId: "tenant-kings-grace", enrolmentId: "enrol-john-foundation", personId: "person-newconvert-john", programmeId: "programme-foundation", certificateNumber: "KGC-FF-0001", verificationCode: "KFCERT-FF-JOHN-001", issuedAt: "2026-08-31T09:00:00.000Z", status: "valid", pdfStatus: "generated_placeholder" },
];

export const leadershipPathways: LeadershipPathway[] = [
  { id: "path-member-leader", tenantId: "tenant-kings-grace", name: "Member to Fellowship Leader Review", active: true, stages: [{ name: "Foundation", prerequisiteProgrammeId: "programme-foundation", approvalRequired: false }, { name: "Workers Training", serviceRequirement: "department service recorded", approvalRequired: true }, { name: "Leadership Review", roleRecommendation: "assistant leader review", approvalRequired: true }] },
];

export const mentorships: Mentorship[] = [
  { id: "mentor-john-foundation", tenantId: "tenant-kings-grace", mentorUserId: "user-branch", menteePersonId: "person-newconvert-john", programmeId: "programme-foundation", branchId: "branch-ruiru", startDate: "2026-07-12", goals: ["Attend foundation", "Join fellowship", "Choose next step"], meetingSchedule: "Weekly call", progress: "Active and enrolled", confidentiality: "standard", status: "active" },
];
