import type { PermissionKey } from "./types";

export type ConfidentialityLevelKey = "general" | "restricted" | "highly_confidential" | "safeguarding" | "welfare_finance" | "professional_referral";
export type CaseStatus = "new" | "triage" | "awaiting_assignment" | "assigned" | "active" | "awaiting_referral" | "referred" | "awaiting_approval" | "follow_up" | "monitoring" | "resolved" | "closed" | "withdrawn" | "archived" | "reopened";
export type CaseUrgency = "routine" | "soon" | "urgent" | "immediate";
export type CaseRiskLevel = "low" | "moderate" | "high" | "critical";
export type NoteType = "general" | "restricted_counselling" | "safeguarding" | "welfare_assessment" | "referral" | "contact" | "visit" | "prayer_team" | "member_visible_action";
export type ReferralDirection = "upward" | "higher_pastor" | "specialist" | "another_branch" | "safeguarding" | "welfare" | "professional" | "return_guidance" | "principal_authority";
export type SharedInformationLevel = "case_existence_only" | "redacted_summary" | "full_case_summary" | "selected_notes" | "selected_documents" | "safeguarding_package" | "welfare_assessment" | "member_visible_only";

export interface ConfidentialityLevel {
  key: ConfidentialityLevelKey;
  label: string;
  viewExistencePermissions: PermissionKey[];
  viewSummaryPermissions: PermissionKey[];
  viewDetailPermissions: PermissionKey[];
  addNotePermissions: PermissionKey[];
  exportPermissions: PermissionKey[];
  auditAccess: boolean;
  reasonRequired: boolean;
  downloadProhibited: boolean;
  memberVisibleAllowed: boolean;
}

export interface PastoralCaseCategory {
  id: string;
  tenantId: string;
  name: string;
  defaultSensitivity: ConfidentialityLevelKey;
  responsiblePermissions: PermissionKey[];
  referralRuleId?: string;
  approvalWorkflowId?: string;
  escalationHours: number;
  anonymousIntakeAllowed: boolean;
  retentionMonths: number;
  active: boolean;
}

export interface PastoralCase {
  id: string;
  tenantId: string;
  branchId?: string;
  organizationUnitId?: string;
  caseNumber: string;
  title: string;
  subjectPersonId?: string;
  additionalPersonIds: string[];
  householdId?: string;
  categoryId: string;
  subcategory?: string;
  sensitivity: ConfidentialityLevelKey;
  confidentiality: ConfidentialityLevelKey;
  urgency: CaseUrgency;
  riskLevel: CaseRiskLevel;
  source: string;
  intakeChannel: string;
  assignedWorkerId?: string;
  assignedPastorId?: string;
  supervisingPastorId?: string;
  specialistReferralId?: string;
  status: CaseStatus;
  stage: string;
  nextAction: string;
  nextActionDueAt?: string;
  consentStatus: "granted" | "pending" | "declined" | "emergency_override";
  communicationPreference: string;
  summary: string;
  restrictedNotePreview?: string;
  publicSafeSummary?: string;
  openedAt: string;
  lastActivityAt: string;
  closedAt?: string;
  closureReason?: string;
  outcomeCategory?: string;
  branchVisibility: "assigned" | "team" | "branch" | "tenant_metadata" | "anonymous_statistics";
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PastoralCaseAccessGrant {
  id: string;
  tenantId: string;
  caseId: string;
  userId?: string;
  roleId?: string;
  permissions: PermissionKey[];
  reason: string;
  grantedBy: string;
  startsAt: string;
  expiresAt?: string;
  active: boolean;
}

export interface PastoralNote {
  id: string;
  tenantId: string;
  caseId: string;
  sessionId?: string;
  referralId?: string;
  authorUserId: string;
  type: NoteType;
  visibility: "case_team" | "assigned_only" | "supervisor" | "safeguarding_team" | "welfare_team" | "member_visible";
  sensitivity: ConfidentialityLevelKey;
  content: string;
  memberVisibleSummary?: string;
  editableUntil: string;
  amended: boolean;
  amendmentReason?: string;
  exportProhibited: boolean;
  accessReasonRequired: boolean;
  createdAt: string;
}

export interface PastoralNoteVersion {
  id: string;
  noteId: string;
  version: number;
  content: string;
  amendedBy: string;
  amendmentReason: string;
  createdAt: string;
}

export interface PrayerRequest {
  id: string;
  tenantId: string;
  personId?: string;
  householdId?: string;
  title: string;
  details: string;
  category: string;
  confidentiality: "private" | "pastoral_team" | "prayer_team" | "small_group" | "church_wide_review" | "anonymous";
  preferredPrayerTeamId?: string;
  branchId?: string;
  urgent: boolean;
  permissionToContact: boolean;
  permissionToShare: boolean;
  reviewAt: string;
  status: "submitted" | "received" | "assigned" | "being_prayed_for" | "follow_up_needed" | "answered_by_submitter" | "closed" | "withdrawn" | "archived";
  testimonyId?: string;
  createdAt: string;
}

export interface PrayerTeam {
  id: string;
  tenantId: string;
  name: string;
  branchId?: string;
  scope: string;
  leaderUserIds: string[];
  memberUserIds: string[];
  confidentialityClearance: ConfidentialityLevelKey[];
  categoriesHandled: string[];
  availability: "available" | "limited" | "unavailable";
  capacity: number;
  language: string;
  active: boolean;
}

export interface PrayerAssignment {
  id: string;
  tenantId: string;
  requestId: string;
  teamId: string;
  assignedBy: string;
  assignedAt: string;
  status: "assigned" | "accepted" | "completed" | "returned";
}

export interface PrayerFollowUp {
  id: string;
  requestId: string;
  prayedAt: string;
  teamId: string;
  note: string;
  contactRequested: boolean;
  pastoralReferralNeeded: boolean;
  remainsActive: boolean;
  nextReviewAt?: string;
}

export interface Testimony {
  id: string;
  tenantId: string;
  personId?: string;
  title: string;
  narrative: string;
  relatedPrayerRequestId?: string;
  relatedCaseId?: string;
  branchId?: string;
  permissionToContact: boolean;
  permissionToEdit: boolean;
  permissionToPublish: boolean;
  preferredAnonymity: "named" | "first_name" | "anonymous";
  mediaConsent: boolean;
  publicationChannels: string[];
  reviewerUserId?: string;
  status: "draft" | "submitted" | "under_review" | "needs_clarification" | "approved" | "rejected" | "published" | "withdrawn" | "archived";
  approvedVersion?: string;
  publicationDate?: string;
}

export interface CounsellingAppointment {
  id: string;
  tenantId: string;
  caseId?: string;
  personId?: string;
  assignedCounsellorId?: string;
  branchId?: string;
  location: string;
  mode: "online" | "physical";
  startsAt: string;
  durationMinutes: number;
  category: string;
  requestedCounsellorId?: string;
  language: string;
  genderPreference?: string;
  urgency: CaseUrgency;
  confidentiality: ConfidentialityLevelKey;
  consentStatus: "granted" | "pending" | "declined";
  status: "requested" | "pending_assignment" | "scheduled" | "confirmed" | "rescheduled" | "completed" | "cancelled" | "declined" | "no_show" | "escalated";
  reminderEnabled: boolean;
  followUpAction?: string;
}

export interface CounsellingSession {
  id: string;
  appointmentId: string;
  attendingUserId: string;
  date: string;
  durationMinutes: number;
  outcomeCategory: string;
  nextAction: string;
  followUpDate?: string;
  referralRequired: boolean;
  consentNotes: string;
  restrictedNoteId?: string;
  memberVisibleSummary?: string;
  safeguardingFlag: boolean;
  closureRecommendation?: string;
}

export interface PastoralVisit {
  id: string;
  tenantId: string;
  caseId?: string;
  personId?: string;
  visitType: string;
  location: string;
  institution?: string;
  assignedVisitorId?: string;
  visitAt: string;
  status: "requested" | "assigned" | "scheduled" | "completed" | "rescheduled" | "cancelled" | "unable_to_complete" | "follow_up_needed";
  transportNeeds?: string;
  consentStatus: "granted" | "pending" | "declined";
  contactPerson?: string;
  purpose: string;
  outcome?: string;
  nextAction?: string;
  restrictedNoteId?: string;
}

export interface BereavementCase {
  id: string;
  tenantId: string;
  caseId: string;
  deceasedPersonId?: string;
  householdId?: string;
  primaryFamilyContactPersonId?: string;
  branchId?: string;
  dateOfDeath: string;
  funeralDate?: string;
  burialLocation?: string;
  assignedPastorId?: string;
  supportTeamUserIds: string[];
  announcementsConsent: boolean;
  familyCommunicationPreference: string;
  status: "new" | "assigned" | "supporting" | "programme_preparation" | "closed";
  suppressOrdinaryMessages: boolean;
}

export interface WelfareRequest {
  id: string;
  tenantId: string;
  caseId?: string;
  applicantPersonId?: string;
  beneficiaryPersonId?: string;
  householdId?: string;
  category: string;
  amountRequested?: number;
  nonFinancialSupport?: string;
  urgency: CaseUrgency;
  reason: string;
  assignedOfficerId?: string;
  recommendation?: string;
  approvalStatus: "draft" | "assessment" | "branch_review" | "higher_approval_required" | "approved" | "declined" | "withdrawn";
  approvedSupport?: string;
  provisionStatus: "not_started" | "reserved_for_finance_phase" | "provided" | "follow_up_due";
  followUpAt?: string;
  outcome?: string;
  confidentiality: ConfidentialityLevelKey;
  requesterUserId?: string;
}

export interface WelfareAssessment {
  id: string;
  requestId: string;
  assessedBy: string;
  immediateNeed: string;
  householdImpact: string;
  previousSupport: string;
  alternativeSources: string;
  requestedDuration: string;
  nonFinancialIntervention: string;
  referralRecommendation?: string;
  urgency: CaseUrgency;
  safeguardingConcern: boolean;
  followUpDate: string;
}

export interface ProfessionalReferral {
  id: string;
  tenantId: string;
  caseId: string;
  referralType: string;
  reason: string;
  consentStatus: "granted" | "pending" | "emergency_override";
  urgency: CaseUrgency;
  serviceName: string;
  contactInformation: string;
  referredBy: string;
  referredAt: string;
  documentsShared: string[];
  sharingBasis: string;
  followUpAt?: string;
  outcomeStatus: "pending" | "accepted" | "completed" | "declined" | "unknown";
  providerVerification: "church_approved" | "independently_supplied" | "unverified" | "internal" | "external";
}

export interface PastoralReferral {
  id: string;
  tenantId: string;
  caseId: string;
  referringUserId: string;
  receivingUserId?: string;
  receivingRoleId?: string;
  direction: ReferralDirection;
  reason: string;
  urgency: CaseUrgency;
  summary: string;
  sharedInformation: SharedInformationLevel[];
  permissionsGranted: PermissionKey[];
  consentStatus: "granted" | "pending" | "emergency_override";
  dueAt: string;
  status: "draft" | "submitted" | "received" | "accepted" | "declined" | "clarification_requested" | "referred_onward" | "completed" | "cancelled" | "overdue" | "escalated";
  decision?: string;
  nextAction?: string;
  returnNotes?: string;
  accessExpiresAt?: string;
}

export interface SafeguardingCase {
  id: string;
  tenantId: string;
  caseId: string;
  category: string;
  raisedBy: string;
  assignedSafeguardingUserId?: string;
  accusedPersonId?: string;
  urgency: "urgent" | "immediate";
  status: "new" | "routed" | "action_in_progress" | "external_referral" | "closure_review" | "closed";
  externalReferralRequired: boolean;
  emergencyMessage: string;
}

export interface SafeguardingAction {
  id: string;
  safeguardingCaseId: string;
  actionType: string;
  actorUserId: string;
  summary: string;
  createdAt: string;
}

export interface CaseTask {
  id: string;
  tenantId: string;
  caseId: string;
  assignedUserId: string;
  dueAt: string;
  priority: CaseUrgency;
  taskType: string;
  description: string;
  visibility: "assigned" | "case_team" | "supervisor" | "member_visible";
  status: "pending" | "accepted" | "completed" | "overdue" | "cancelled";
  completionNote?: string;
  escalated: boolean;
  createdBy: string;
  createdAt: string;
}

export interface CarePlan {
  id: string;
  tenantId: string;
  caseId: string;
  goals: string[];
  responsibleUserIds: string[];
  targetDate: string;
  status: "draft" | "active" | "review_due" | "completed" | "closed";
  reviewDate: string;
  consentStatus: "granted" | "pending" | "declined";
  closureCriteria: string;
}

export interface CaseTimelineEntry {
  id: string;
  tenantId: string;
  caseId: string;
  occurredAt: string;
  eventType: string;
  safeSummary: string;
  restrictedNoteId?: string;
  visibility: "all_case_viewers" | "assigned_only" | "restricted_notes" | "safeguarding_only";
}
