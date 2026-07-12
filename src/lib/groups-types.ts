import type { PermissionKey } from "./types";

export type GroupStatus = "draft" | "proposed" | "pending_approval" | "active" | "paused" | "under_review" | "multiplying" | "merged" | "closed" | "archived";
export type GroupJoinPolicy = "open" | "approval_required" | "invite_only" | "leader_assignment" | "branch_only" | "temporarily_closed";
export type GroupMembershipStatus = "active" | "visitor" | "first_timer" | "regular" | "prospective" | "child" | "remote" | "leader" | "inactive" | "transferred" | "guest";
export type MeetingStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "rescheduled";
export type ReportStatus = "not_started" | "draft" | "submitted" | "returned" | "under_review" | "partially_approved" | "approved" | "rejected" | "locked" | "reopened" | "archived";
export type HealthLabel = "Needs Attention" | "Stable" | "Growing" | "Ready for Review" | "Capacity Pressure" | "Leadership Gap";

export interface SmallGroupType {
  id: string;
  tenantId: string;
  key: string;
  displayName: string;
  defaultReportTemplateId: string;
  defaultFrequency: "weekly" | "biweekly" | "monthly" | "custom";
  defaultRoles: string[];
  approvalWorkflowId?: string;
  multiplicationEnabled: boolean;
  maxRecommendedSize: number;
  followUpJourneyKey: string;
  restrictions: string[];
  active: boolean;
}

export interface SmallGroup {
  id: string;
  tenantId: string;
  branchId: string;
  organizationUnitId: string;
  groupTypeId: string;
  parentGroupId?: string;
  name: string;
  code: string;
  description: string;
  purpose: string;
  leaderUserId: string;
  assistantLeaderUserId?: string;
  supervisingPastorUserId: string;
  hostPersonId?: string;
  secretaryUserId?: string;
  financeOfficerUserId?: string;
  scheduleSummary: string;
  venueSummary: string;
  approximateLocation: string;
  exactAddressRestricted: boolean;
  onlineLink?: string;
  latitude?: number;
  longitude?: number;
  language: string;
  targetAudience: string;
  genderFocus: "all" | "men" | "women" | "mixed";
  capacity: number;
  currentMembership: number;
  status: GroupStatus;
  startDate: string;
  nextReviewDate: string;
  multiplicationTargetDate?: string;
  reportingUnitId: string;
  publicDiscoverable: boolean;
  joinPolicy: GroupJoinPolicy;
  approvalWorkflowId?: string;
  visibility: "tenant" | "branch" | "members" | "private";
  createdAt: string;
  updatedAt: string;
}

export interface GroupLeadershipAssignment {
  id: string;
  tenantId: string;
  groupId: string;
  userId: string;
  roleKey: string;
  startDate: string;
  endDate?: string;
  status: "proposed" | "active" | "acting" | "ended";
  reason: string;
  permissions: PermissionKey[];
  approvalRequestId?: string;
}

export interface GroupMembership {
  id: string;
  tenantId: string;
  groupId: string;
  personId: string;
  branchId: string;
  membershipType: "primary" | "secondary" | "ministry" | "programme" | "leadership";
  status: GroupMembershipStatus;
  joinedAt: string;
  source: string;
  invitedByUserId?: string;
  assignedByUserId?: string;
  approvalRequestId?: string;
  attendanceStreak: number;
  missedConsecutiveMeetings: number;
  roleInGroup?: string;
  exitDate?: string;
  transferRequestId?: string;
}

export interface GroupJoinRequest {
  id: string;
  tenantId: string;
  groupId: string;
  personId?: string;
  requesterName: string;
  source: "portal" | "invitation" | "staff" | "follow_up" | "new_convert" | "public_directory" | "qr" | "programme" | "branch_transfer";
  status: "requested" | "invited" | "pending_approval" | "accepted" | "declined" | "waitlisted" | "cancelled" | "expired";
  requestedAt: string;
  reviewedByUserId?: string;
  notes?: string;
}

export interface GroupTransfer {
  id: string;
  tenantId: string;
  personId: string;
  sourceGroupId: string;
  destinationGroupId: string;
  reason: string;
  requestedByUserId: string;
  effectiveDate: string;
  sourceApprovalStatus: "pending" | "approved" | "declined";
  destinationApprovalStatus: "pending" | "approved" | "declined";
  memberAcknowledgement: "pending" | "acknowledged" | "not_required";
  followUpHandoverStatus: "pending" | "completed";
  status: "requested" | "in_review" | "approved" | "completed" | "cancelled";
}

export interface GroupMeetingType {
  id: string;
  tenantId: string;
  key: string;
  name: string;
  reportTemplateId: string;
  attendanceCategories: string[];
  givingCategoriesShown: string[];
  followUpFields: string[];
  approvalWorkflowId?: string;
  durationMinutes: number;
  pastoralEscalationEnabled: boolean;
}

export interface GroupMeeting {
  id: string;
  tenantId: string;
  groupId: string;
  meetingTypeId: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  venueSummary: string;
  onlineLink?: string;
  hostPersonId?: string;
  leaderUserId: string;
  theme: string;
  scripture?: string;
  expectedAttendance: number;
  status: MeetingStatus;
  reportStatus: ReportStatus;
  cancelledReason?: string;
  rescheduledFromMeetingId?: string;
}

export interface GroupAttendanceRecord {
  id: string;
  tenantId: string;
  meetingId: string;
  groupId: string;
  personId?: string;
  displayName: string;
  status: "present" | "absent" | "late" | "early_departure" | "excused" | "unexcused" | "online" | "visitor";
  attendeeType: "member" | "first_timer" | "returning_visitor" | "new_convert" | "guest" | "child_placeholder" | "remote";
  checkedInAt?: string;
  recordedByUserId: string;
  source: "manual" | "qr" | "self_check_in" | "leader_mobile" | "offline_queue" | "bulk" | "household" | "online";
  notes?: string;
}

export interface GroupReportTemplate {
  id: string;
  tenantId: string;
  name: string;
  version: number;
  branchId?: string;
  groupTypeId?: string;
  activeFrom: string;
  activeTo?: string;
  approvalWorkflowId?: string;
  requiredSections: string[];
  financeSectionEnabled: boolean;
  pastoralReferralSectionEnabled: boolean;
  attendanceModel: "summary" | "person_level" | "hybrid";
  visibility: "leader_team" | "pastor_review" | "branch_leadership" | "finance_restricted";
  lockAfterApproval: boolean;
  archived: boolean;
}

export interface GroupMeetingReport {
  id: string;
  tenantId: string;
  groupId: string;
  meetingId: string;
  templateId: string;
  templateVersion: number;
  status: ReportStatus;
  submittedByUserId?: string;
  submittedAt?: string;
  reviewerUserId?: string;
  approverUserId?: string;
  correctionReason?: string;
  lockedAt?: string;
  reopenedAt?: string;
  attendanceSummary: {
    present: number;
    absent: number;
    visitors: number;
    firstTimers: number;
    newConverts: number;
    online: number;
  };
  safeReferralSummary: string[];
  outreachSummary?: string;
  nextMeetingPlan?: string;
  attachments: string[];
}

export interface GivingCategory {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description: string;
  availableInGroupReports: boolean;
  individualDetailAllowed: boolean;
  totalsOnlyDefault: boolean;
  restrictedVisibility: boolean;
  currency: string;
  status: "active" | "inactive";
}

export interface MeetingGivingTotal {
  id: string;
  tenantId: string;
  meetingId: string;
  categoryId: string;
  currency: string;
  cash: number;
  mpesa: number;
  bank: number;
  card: number;
  cheque: number;
  other: number;
  recordedByUserId: string;
  verifiedByUserId?: string;
  notes?: string;
  reconciliationStatus: "not_started" | "pending_handover" | "handed_over" | "verified" | "reconciled_later" | "discrepancy";
}

export interface FinanceHandover {
  id: string;
  tenantId: string;
  meetingId: string;
  branchId: string;
  amount: number;
  currency: string;
  categoryIds: string[];
  handedOverByUserId: string;
  receivedByUserId?: string;
  handedOverAt?: string;
  paymentMethod: "cash" | "mpesa" | "bank" | "card" | "cheque" | "mixed" | "other";
  depositReference?: string;
  discrepancy?: string;
  status: "pending_handover" | "handed_over" | "received" | "discrepancy" | "verified" | "reconciled_later" | "cancelled";
  evidenceUploadPlaceholder?: string;
  notes?: string;
}

export interface GroupHealthSnapshot {
  id: string;
  tenantId: string;
  groupId: string;
  capturedAt: string;
  label: HealthLabel;
  indicators: {
    key: string;
    label: string;
    status: "good" | "watch" | "attention";
    explanation: string;
  }[];
  visibleToRoles: string[];
}

export interface GroupMultiplicationProposal {
  id: string;
  tenantId: string;
  parentGroupId: string;
  proposedName: string;
  proposedLeaderUserId: string;
  proposedAssistantUserId?: string;
  proposedMemberIds: string[];
  effectiveDate: string;
  readinessIndicators: string[];
  status: "draft" | "submitted" | "pastor_review" | "branch_approval" | "approved" | "launched" | "declined";
  approvalRequestId?: string;
}

export interface GroupQrCode {
  id: string;
  tenantId: string;
  groupId: string;
  purpose: "join_request" | "meeting_check_in" | "visitor_registration" | "group_information" | "outreach_campaign" | "report_access";
  publicCode: string;
  active: boolean;
  expiresAt?: string;
  scanCount: number;
  abuseProtection: string[];
}

export interface GroupCommunicationEvent {
  id: string;
  tenantId: string;
  groupId: string;
  kind: "group_announcement" | "meeting_reminder" | "report_reminder" | "attendance_follow_up" | "join_request_response" | "leader_change" | "meeting_reschedule" | "prayer_team_metadata" | "programme_invitation";
  safeMetadata: string;
  channelProvider: "placeholder";
  respectsConsent: boolean;
  status: "queued_placeholder" | "cancelled" | "sent_elsewhere";
}
