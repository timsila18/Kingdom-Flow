import type { ScopeType } from "./types";

export type LifecycleStageKey =
  | "unknown"
  | "visitor"
  | "first_time_visitor"
  | "returning_visitor"
  | "new_convert"
  | "follow_up"
  | "foundation_programme"
  | "prospective_member"
  | "member"
  | "serving_member"
  | "ministry_worker"
  | "leader"
  | "inactive"
  | "transferred"
  | "archived";

export interface Person {
  id: string;
  tenantId: string;
  title?: string;
  firstName: string;
  middleName?: string;
  surname: string;
  preferredName?: string;
  formerName?: string;
  gender?: string;
  dateOfBirth?: string;
  approximateAge?: number;
  ageGroup: "child" | "youth" | "adult" | "senior" | "unknown";
  nationality?: string;
  restrictedNationalId?: string;
  phoneNumbers: string[];
  emailAddresses: string[];
  preferredContactMethod: "phone" | "sms" | "whatsapp" | "email" | "none";
  preferredLanguage: string;
  physicalAddress?: string;
  region?: string;
  locality?: string;
  postalAddress?: string;
  branchId?: string;
  organizationUnitId?: string;
  smallGroupId?: string;
  maritalStatus?: string;
  occupation?: string;
  employer?: string;
  educationLevel?: string;
  emergencyContact?: string;
  accessibilityNeeds?: string;
  communicationPreferences: string[];
  consentStatus: "unknown" | "granted" | "partially_granted" | "withdrawn";
  privacyRestrictions: string[];
  memberNumber?: string;
  sourceOfFirstContact: string;
  lifecycleStage: LifecycleStageKey;
  relationshipStatus: "visitor" | "prospective" | "member" | "former" | "staff" | "leader";
  firstVisitDate?: string;
  membershipStartDate?: string;
  lastMeaningfulActivityDate?: string;
  active: boolean;
  archived: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LifecycleStage {
  key: LifecycleStageKey;
  displayName: string;
  order: number;
  approvalRequired: boolean;
  automatic: boolean;
}

export interface LifecycleEvent {
  id: string;
  tenantId: string;
  personId: string;
  previousStage: LifecycleStageKey;
  newStage: LifecycleStageKey;
  reason: string;
  branchId?: string;
  effectiveDate: string;
  performedBy: string;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface Household {
  id: string;
  tenantId: string;
  name: string;
  primaryContactPersonId: string;
  branchId?: string;
  address?: string;
  preferredLanguage: string;
  communicationPreference: string;
  restrictedFamilyNotes?: string;
  active: boolean;
}

export interface HouseholdMember {
  id: string;
  tenantId: string;
  householdId: string;
  personId: string;
  relationshipType: "spouse" | "parent" | "child" | "guardian" | "dependant" | "sibling" | "relative" | "household_member" | "custom";
  guardianForPersonId?: string;
  childPrivacyProtected: boolean;
}

export interface VisitorRecord {
  id: string;
  tenantId: string;
  personId: string;
  branchId: string;
  visitDate: string;
  captureMethod: "qr" | "kiosk" | "usher" | "mobile" | "event" | "import" | "share_link";
  firstEverVisit: boolean;
  returningVisitor: boolean;
  invitedBy?: string;
  heardAbout?: string;
  prayerRequest?: string;
  wantsFollowUp: boolean;
  madeFaithDecision: boolean;
  wantsFellowship: boolean;
  wantsClass: boolean;
  consentToContact: boolean;
}

export interface NewConvertRecord {
  id: string;
  tenantId: string;
  personId: string;
  decisionDate: string;
  branchId: string;
  recordedBy: string;
  preferredFollowUpMethod: string;
  consentToFollowUp: boolean;
  assignedWorkerId?: string;
  assignedPastorId?: string;
  status: "registered" | "awaiting_assignment" | "assigned" | "contact_attempted" | "contacted" | "follow_up_active" | "joined_fellowship" | "enrolled" | "transferred" | "declined" | "unreachable" | "completed" | "archived";
  urgency: "normal" | "high" | "urgent";
  specialCareNeed?: string;
  requestedBaptismInfo: boolean;
  attendsAnotherChurch: boolean;
}

export interface FollowUpWorker {
  id: string;
  tenantId: string;
  userId: string;
  maxActiveAssignments: number;
  preferredBranchId?: string;
  languages: string[];
  ageGroups: string[];
  active: boolean;
  unavailableUntil?: string;
}

export interface FollowUpAssignment {
  id: string;
  tenantId: string;
  personId: string;
  workerUserId: string;
  pastorUserId?: string;
  branchId: string;
  status: "pending" | "accepted" | "declined" | "reassigned" | "completed" | "escalated";
  assignedAt: string;
  acceptedAt?: string;
  dueAt: string;
  assignmentReason: string;
}

export interface FollowUpTask {
  id: string;
  tenantId: string;
  personId: string;
  assignedUserId: string;
  taskType: string;
  description: string;
  dueDate: string;
  priority: "low" | "normal" | "high" | "urgent";
  branchId: string;
  status: "pending" | "accepted" | "in_progress" | "completed" | "unsuccessful" | "rescheduled" | "escalated" | "cancelled" | "declined";
  outcome?: string;
  notes?: string;
}

export interface ContactAttempt {
  id: string;
  tenantId: string;
  personId: string;
  attemptedBy: string;
  attemptedAt: string;
  method: string;
  result: "reached" | "no_answer" | "wrong_number" | "message_sent" | "call_later" | "not_interested" | "another_church" | "pastoral_support" | "requested_fellowship" | "requested_class" | "declined_contact";
  followUpNeeded: boolean;
  nextAction?: string;
  notes?: string;
  requestedNoFurtherContact: boolean;
}

export interface PersonConsent {
  id: string;
  tenantId: string;
  personId: string;
  consentType: "phone" | "sms" | "whatsapp" | "email" | "announcements" | "programme_invites" | "pastoral_follow_up" | "prayer_request" | "photo_media" | "emergency_contact" | "data_sharing";
  status: "granted" | "withdrawn" | "not_requested";
  date: string;
  method: string;
  source: string;
  recordedBy: string;
  withdrawalDate?: string;
}

export interface TransferRequest {
  id: string;
  tenantId: string;
  personId: string;
  sourceBranchId: string;
  destinationBranchId: string;
  reason: string;
  requestedBy: string;
  effectiveDate: string;
  status: "draft" | "submitted" | "pending_source_approval" | "pending_destination_approval" | "approved" | "completed" | "rejected" | "cancelled";
}

export interface DuplicateCandidate {
  id: string;
  tenantId: string;
  primaryPersonId: string;
  possibleDuplicatePersonId: string;
  signals: string[];
  status: "pending_review" | "merged" | "not_duplicate";
}

export interface FormDefinition {
  id: string;
  tenantId: string;
  branchId?: string;
  name: string;
  type: "visitor" | "first_timer" | "new_convert" | "member_registration" | "household_update" | "consent_update";
  public: boolean;
  active: boolean;
  language: string;
  consentStatement: string;
  confirmationMessage: string;
}

export interface QrCode {
  id: string;
  tenantId: string;
  branchId?: string;
  formId: string;
  code: string;
  active: boolean;
  scans: number;
  submissions: number;
}

export interface ImportJob {
  id: string;
  tenantId: string;
  category: "members" | "visitors" | "households" | "new_converts" | "legacy";
  status: "draft" | "validated" | "completed" | "failed";
  validRows: number;
  invalidRows: number;
  dryRun: boolean;
}

export interface ExportJob {
  id: string;
  tenantId: string;
  requestedBy: string;
  exportType: string;
  reason: string;
  scopeType: ScopeType;
  status: "pending_approval" | "ready" | "expired";
  sensitive: boolean;
}

export interface ActivitySignal {
  id: string;
  tenantId: string;
  personId: string;
  signalType: "attended_service" | "attended_fellowship" | "attended_programme" | "logged_in" | "served" | "active_follow_up" | "special_event";
  occurredAt: string;
  billableEligible: boolean;
}
