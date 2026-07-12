import type { PermissionKey } from "./types";

export type ProgrammeStatus = "draft" | "pending_approval" | "approved" | "published" | "enrolment_open" | "in_progress" | "paused" | "completed" | "cancelled" | "archived";
export type CohortStatus = "planned" | "open" | "full" | "closed" | "in_progress" | "completed" | "cancelled" | "archived";
export type EnrolmentStatus = "draft" | "submitted" | "pending_review" | "eligible" | "ineligible" | "pending_payment" | "waitlisted" | "approved" | "enrolled" | "active" | "paused" | "withdrawn" | "completed" | "failed" | "cancelled" | "transferred";
export type FeeModel = "free" | "paid" | "donation_supported" | "sponsor_funded" | "church_funded" | "partly_subsidized";
export type TechnologyFeeTreatment = "learner_pays" | "church_absorbs" | "no_online_processing" | "manual_direct_to_church";
export type DeliveryMode = "physical" | "online_live" | "online_self_paced" | "hybrid" | "fellowship_based" | "branch_based" | "home_study" | "mentorship" | "cohort_based";

export interface ProgrammeType {
  id: string;
  tenantId: string;
  key: string;
  displayName: string;
  defaultApprovalWorkflowId?: string;
  defaultCertificateRule: string;
  defaultFeeTreatment: TechnologyFeeTreatment;
  defaultProgressionRule: string;
  active: boolean;
}

export interface Programme {
  id: string;
  tenantId: string;
  branchId?: string;
  organizationUnitId?: string;
  programmeTypeId: string;
  code: string;
  title: string;
  subtitle?: string;
  description: string;
  objectives: string[];
  targetAudience: string;
  eligibilitySummary: string;
  ageRequirement?: string;
  prerequisiteSummary: string;
  learningOutcomes: string[];
  durationSummary: string;
  deliveryMode: DeliveryMode;
  branchAvailability: string[];
  language: string;
  capacity: number;
  enrolmentOpensAt: string;
  enrolmentClosesAt: string;
  startDate: string;
  endDate?: string;
  status: ProgrammeStatus;
  publicationStatus: "private" | "catalogue" | "public_page";
  feeModel: FeeModel;
  price: number;
  currency: string;
  technologyFeeTreatment: TechnologyFeeTreatment;
  scholarshipAvailable: boolean;
  refundPolicy: string;
  certificateAvailable: boolean;
  graduationRequirement: string;
  approvalWorkflowId?: string;
  ownerUserId: string;
  coordinatorUserId: string;
  leadTrainerUserId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgrammeVersion {
  id: string;
  tenantId: string;
  programmeId: string;
  versionNumber: number;
  effectiveDate: string;
  curriculumChanges: string[];
  feeChanges: string[];
  createdBy: string;
  approvedBy?: string;
  status: "draft" | "pending_approval" | "approved" | "retired";
}

export interface ProgrammeModule {
  id: string;
  tenantId: string;
  programmeVersionId: string;
  title: string;
  description: string;
  order: number;
}

export interface ProgrammeLesson {
  id: string;
  tenantId: string;
  moduleId: string;
  title: string;
  objective: string;
  summary: string;
  trainerUserId: string;
  durationMinutes: number;
  deliveryMode: DeliveryMode;
  materialIds: string[];
  scriptureReferences: string[];
  prerequisiteLessonId?: string;
  releaseDate: string;
  dueDate?: string;
  attendanceRequired: boolean;
}

export interface ProgrammeCohort {
  id: string;
  tenantId: string;
  programmeId: string;
  programmeVersionId: string;
  name: string;
  code: string;
  branchId?: string;
  trainerUserIds: string[];
  startDate: string;
  endDate?: string;
  schedule: string;
  capacity: number;
  venue?: string;
  onlineLink?: string;
  enrolmentStatus: "planned" | "open" | "full" | "closed";
  applicationDeadline: string;
  waitlistEnabled: boolean;
  status: CohortStatus;
  graduationDate?: string;
  reportingUnitId?: string;
}

export interface TrainerAssignment {
  id: string;
  tenantId: string;
  programmeId?: string;
  cohortId?: string;
  userId: string;
  personId?: string;
  role: "lead_trainer" | "assistant_trainer" | "facilitator" | "mentor" | "assessor" | "moderator" | "programme_coordinator" | "guest_speaker" | "administrator";
  branchId?: string;
  startDate: string;
  endDate?: string;
  permissions: PermissionKey[];
  approvalRequestId?: string;
  status: "proposed" | "active" | "ended";
}

export interface TrainerQualification {
  id: string;
  tenantId: string;
  userId: string;
  experienceSummary: string;
  internalCertification: string[];
  ministryRole: string;
  subjectsTaught: string[];
  languages: string[];
  availability: string;
  approvedProgrammeIds: string[];
  branchScope: string[];
  backgroundCheckStatus: "placeholder_not_checked" | "pending" | "cleared" | "restricted";
  safeguardingClearanceStatus: "placeholder_not_checked" | "pending" | "cleared" | "restricted";
}

export interface ProgrammeApplication {
  id: string;
  tenantId: string;
  personId: string;
  programmeId: string;
  programmeVersionId: string;
  cohortId: string;
  branchId?: string;
  applicationDate: string;
  source: "member_portal" | "leader_nomination" | "new_convert_journey" | "fellowship_referral" | "staff_entry" | "public_form" | "invitation" | "programme_progression";
  consent: boolean;
  status: EnrolmentStatus;
  eligibilityStatus: "not_checked" | "eligible" | "ineligible" | "override";
  prerequisiteStatus: "not_checked" | "met" | "missing" | "waived";
  approvalStatus: "not_required" | "pending" | "approved" | "declined";
  paymentStatus: "not_required" | "pending" | "paid" | "scholarship" | "waived";
  scholarshipStatus: "not_requested" | "requested" | "approved" | "declined";
  assignedMentorUserId?: string;
}

export interface ProgrammeEnrolment extends ProgrammeApplication {
  enrolmentStatus: EnrolmentStatus;
  startDate?: string;
  completionDate?: string;
  outstandingBalance: number;
  progressPercent: number;
}

export interface EligibilityResult {
  id: string;
  tenantId: string;
  applicationId: string;
  eligible: boolean;
  reasons: string[];
  missingRequirements: string[];
  overrideByUserId?: string;
  overrideReason?: string;
}

export interface Scholarship {
  id: string;
  tenantId: string;
  applicationId: string;
  personId: string;
  programmeId: string;
  type: "full" | "partial" | "church_sponsored" | "department_sponsored" | "donor_sponsored" | "hardship_support" | "leadership_sponsorship" | "staff_sponsorship" | "custom";
  amount: number;
  percentage: number;
  sponsor: string;
  restrictedReason: string;
  requestedAt: string;
  assessedByUserId?: string;
  approvedByUserId?: string;
  expiresAt?: string;
  status: "requested" | "assessment" | "approved" | "declined" | "expired" | "applied";
}

export interface TechnologyFeeRule {
  id: string;
  version: number;
  effectiveFrom: string;
  effectiveTo?: string;
  bands: { min: number; max?: number; fee: number }[];
  updatedByUserId: string;
}

export interface PaymentDestination {
  id: string;
  tenantId: string;
  label: string;
  purpose: "programme" | "general" | "branch_programme";
  branchId?: string;
  programmeId?: string;
  method: "mpesa_paybill" | "till" | "bank" | "card_provider" | "gateway" | "cash_office" | "cheque" | "custom";
  paybillOrTill?: string;
  accountInstruction?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  currency: string;
  paymentReferenceRule: string;
  verificationStatus: "unverified" | "verified" | "needs_review";
  active: boolean;
}

export interface ProgrammePayment {
  id: string;
  tenantId: string;
  applicationId: string;
  personId: string;
  programmeId: string;
  cohortId: string;
  feeAmount: number;
  technologyFee: number;
  providerFee: number;
  totalPaid: number;
  churchAmount: number;
  paymentDestinationId: string;
  paymentMethod: "online" | "mpesa_reference" | "bank_reference" | "cash" | "cheque" | "sponsored" | "waived" | "scholarship" | "manual_verification";
  transactionReference: string;
  paymentDate?: string;
  verificationStatus: "pending" | "verified" | "mismatch" | "duplicate" | "declined";
  verifiedByUserId?: string;
  receiptStatus: "not_issued" | "issued" | "void";
  refundStatus: "none" | "requested" | "approved" | "refunded" | "declined";
  status: "pending" | "initiated" | "paid" | "partially_paid" | "failed" | "cancelled" | "waived" | "sponsored" | "refunded" | "disputed" | "manually_verified";
  notes?: string;
}

export interface ClassSession {
  id: string;
  tenantId: string;
  cohortId: string;
  lessonId: string;
  date: string;
  startTime: string;
  endTime: string;
  trainerUserId: string;
  venueOrLink: string;
  capacity: number;
  attendanceStatus: "not_started" | "captured" | "corrected";
  materialIds: string[];
  reportStatus: "not_started" | "submitted" | "reviewed";
}

export interface ProgrammeAttendance {
  id: string;
  tenantId: string;
  enrolmentId: string;
  sessionId: string;
  status: "present" | "late" | "excused_absence" | "unexcused_absence" | "partial" | "make_up";
  checkedInAt?: string;
  checkedOutAt?: string;
  recordedByUserId: string;
  source: "manual" | "qr" | "learner_self_check_in" | "trainer_check_in" | "online";
  notes?: string;
}

export interface LearningMaterial {
  id: string;
  tenantId: string;
  programmeVersionId: string;
  title: string;
  type: "notes" | "pdf" | "slides" | "audio" | "video_link" | "assignment" | "reading_list" | "worksheet" | "scripture_references" | "supporting_document";
  storageStatus: "placeholder" | "stored" | "restricted";
  releaseDate: string;
  expiresAt?: string;
  downloadPermission: PermissionKey;
  copyrightOwner: string;
}

export interface Assignment {
  id: string;
  tenantId: string;
  programmeId: string;
  moduleId?: string;
  lessonId?: string;
  title: string;
  instructions: string;
  releaseDate: string;
  dueDate: string;
  allowedFormats: string[];
  maxFileSizeMb: number;
  gradingMethod: "pass_fail" | "percentage" | "points" | "competency" | "complete_incomplete";
  passMark: number;
  resubmissionAllowed: boolean;
  active: boolean;
}

export interface AssignmentSubmission {
  id: string;
  tenantId: string;
  assignmentId: string;
  enrolmentId: string;
  submittedAt: string;
  status: "submitted" | "returned" | "graded" | "resubmitted";
  grade?: number;
  passed?: boolean;
  feedback?: string;
  reviewedByUserId?: string;
}

export interface Assessment {
  id: string;
  tenantId: string;
  programmeId: string;
  title: string;
  type: "quiz" | "written_assignment" | "oral_assessment" | "practical_assessment" | "interview" | "attendance_only" | "trainer_observation" | "project" | "examination" | "participation" | "custom";
  passMark: number;
  weight: number;
  attemptsAllowed: number;
  gradingMethod: "pass_fail" | "percentage" | "points" | "competency" | "complete_incomplete" | "custom";
  moderationRequired: boolean;
  resultVisibility: "hidden" | "released_to_learner" | "coordinator_only";
}

export interface AssessmentResult {
  id: string;
  tenantId: string;
  assessmentId: string;
  enrolmentId: string;
  score: number;
  grade: string;
  passed: boolean;
  assessorUserId: string;
  feedback: string;
  moderationStatus: "not_required" | "pending" | "approved" | "returned";
  attempt: number;
  releasedAt?: string;
  appealStatus: "none" | "requested" | "resolved";
  version: number;
}

export interface CompletionRule {
  id: string;
  tenantId: string;
  programmeVersionId: string;
  attendancePercent: number;
  assignmentRequired: boolean;
  assessmentPassRequired: boolean;
  trainerRecommendationRequired: boolean;
  feeClearanceRequired: boolean;
  certificateApprovalRequired: boolean;
}

export interface Certificate {
  id: string;
  tenantId: string;
  enrolmentId: string;
  personId: string;
  programmeId: string;
  certificateNumber: string;
  verificationCode: string;
  issuedAt?: string;
  status: "draft" | "valid" | "revoked" | "replaced" | "expired";
  revokedReason?: string;
  pdfStatus: "not_generated" | "generated_placeholder";
}

export interface LeadershipPathway {
  id: string;
  tenantId: string;
  name: string;
  stages: { name: string; prerequisiteProgrammeId?: string; serviceRequirement?: string; roleRecommendation?: string; approvalRequired: boolean }[];
  active: boolean;
}

export interface Mentorship {
  id: string;
  tenantId: string;
  mentorUserId: string;
  menteePersonId: string;
  programmeId?: string;
  branchId?: string;
  startDate: string;
  endDate?: string;
  goals: string[];
  meetingSchedule: string;
  progress: string;
  confidentiality: "standard" | "restricted";
  status: "proposed" | "pending_acceptance" | "active" | "paused" | "completed" | "ended" | "reassigned";
}
