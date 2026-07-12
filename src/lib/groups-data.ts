import type {
  FinanceHandover,
  GivingCategory,
  GroupAttendanceRecord,
  GroupCommunicationEvent,
  GroupHealthSnapshot,
  GroupJoinRequest,
  GroupLeadershipAssignment,
  GroupMeeting,
  GroupMeetingReport,
  GroupMeetingType,
  GroupMembership,
  GroupMultiplicationProposal,
  GroupQrCode,
  GroupReportTemplate,
  GroupTransfer,
  MeetingGivingTotal,
  SmallGroup,
  SmallGroupType,
} from "./groups-types";

export const groupReportTemplates: GroupReportTemplate[] = [
  {
    id: "template-standard-cell-v1",
    tenantId: "tenant-kings-grace",
    name: "Standard Fellowship Report",
    version: 1,
    activeFrom: "2026-07-01",
    approvalWorkflowId: "workflow-group-report-standard",
    requiredSections: ["meeting_details", "attendance", "visitors", "new_converts", "follow_up", "prayer_referrals", "pastoral_referrals", "giving_totals", "next_meeting"],
    financeSectionEnabled: true,
    pastoralReferralSectionEnabled: true,
    attendanceModel: "hybrid",
    visibility: "pastor_review",
    lockAfterApproval: true,
    archived: false,
  },
  {
    id: "template-outreach-v1",
    tenantId: "tenant-kings-grace",
    name: "Outreach Group Report",
    version: 1,
    groupTypeId: "group-type-outreach",
    activeFrom: "2026-07-01",
    approvalWorkflowId: "workflow-group-report-standard",
    requiredSections: ["meeting_details", "attendance", "outreach", "first_timers", "new_converts", "follow_up"],
    financeSectionEnabled: false,
    pastoralReferralSectionEnabled: true,
    attendanceModel: "summary",
    visibility: "branch_leadership",
    lockAfterApproval: true,
    archived: false,
  },
];

export const smallGroupTypes: SmallGroupType[] = [
  { id: "group-type-general", tenantId: "tenant-kings-grace", key: "general_cell", displayName: "General Fellowship", defaultReportTemplateId: "template-standard-cell-v1", defaultFrequency: "weekly", defaultRoles: ["leader", "assistant", "host", "secretary", "follow_up_coordinator", "prayer_coordinator", "giving_recorder"], approvalWorkflowId: "workflow-group-creation", multiplicationEnabled: true, maxRecommendedSize: 16, followUpJourneyKey: "visitor-30-day", restrictions: [], active: true },
  { id: "group-type-youth", tenantId: "tenant-kings-grace", key: "youth", displayName: "Youth Fellowship", defaultReportTemplateId: "template-standard-cell-v1", defaultFrequency: "weekly", defaultRoles: ["leader", "assistant", "safeguarding_contact"], approvalWorkflowId: "workflow-group-creation", multiplicationEnabled: true, maxRecommendedSize: 20, followUpJourneyKey: "youth-visitor", restrictions: ["age_focus_youth", "safeguarding_review"], active: true },
  { id: "group-type-outreach", tenantId: "tenant-kings-grace", key: "outreach", displayName: "Outreach Group", defaultReportTemplateId: "template-outreach-v1", defaultFrequency: "custom", defaultRoles: ["leader", "assistant", "outreach_coordinator"], approvalWorkflowId: "workflow-group-creation", multiplicationEnabled: false, maxRecommendedSize: 25, followUpJourneyKey: "outreach-follow-up", restrictions: ["public_activity_review"], active: true },
];

export const smallGroups: SmallGroup[] = [
  {
    id: "group-imaara-family",
    tenantId: "tenant-kings-grace",
    branchId: "branch-imaara",
    organizationUnitId: "unit-imaara",
    groupTypeId: "group-type-general",
    name: "Imaara Family Fellowship",
    code: "IMA-FAM-001",
    description: "Midweek home fellowship for families and neighbours.",
    purpose: "Belonging, prayer, Bible discussion and care follow-up.",
    leaderUserId: "user-branch",
    assistantLeaderUserId: "user-volunteer",
    supervisingPastorUserId: "user-admin",
    hostPersonId: "person-amina",
    secretaryUserId: "user-volunteer",
    financeOfficerUserId: "user-admin",
    scheduleSummary: "Wednesdays 18:30",
    venueSummary: "Private home near Imaara Daima",
    approximateLocation: "Imaara Daima area",
    exactAddressRestricted: true,
    language: "en",
    targetAudience: "Adults and families",
    genderFocus: "all",
    capacity: 16,
    currentMembership: 14,
    status: "active",
    startDate: "2026-07-01",
    nextReviewDate: "2026-08-15",
    multiplicationTargetDate: "2026-09-30",
    reportingUnitId: "unit-imaara",
    publicDiscoverable: true,
    joinPolicy: "approval_required",
    approvalWorkflowId: "workflow-group-creation",
    visibility: "branch",
    createdAt: "2026-07-01T08:00:00.000Z",
    updatedAt: "2026-07-11T16:00:00.000Z",
  },
  {
    id: "group-ruiru-youth",
    tenantId: "tenant-kings-grace",
    branchId: "branch-ruiru",
    organizationUnitId: "unit-ruiru",
    groupTypeId: "group-type-youth",
    parentGroupId: "group-imaara-family",
    name: "Ruiru Youth Connect",
    code: "RUI-YTH-001",
    description: "Youth fellowship connected to the Ruiru plant.",
    purpose: "Peer discipleship, follow-up and leadership pipeline.",
    leaderUserId: "user-branch",
    supervisingPastorUserId: "user-admin",
    scheduleSummary: "Fridays 17:30",
    venueSummary: "Ruiru Campus hall",
    approximateLocation: "Ruiru town",
    exactAddressRestricted: false,
    language: "sw",
    targetAudience: "Youth and young adults",
    genderFocus: "mixed",
    capacity: 20,
    currentMembership: 9,
    status: "under_review",
    startDate: "2026-07-05",
    nextReviewDate: "2026-08-05",
    reportingUnitId: "unit-ruiru",
    publicDiscoverable: true,
    joinPolicy: "open",
    approvalWorkflowId: "workflow-group-creation",
    visibility: "branch",
    createdAt: "2026-07-05T08:00:00.000Z",
    updatedAt: "2026-07-11T16:00:00.000Z",
  },
  {
    id: "group-outreach-east",
    tenantId: "tenant-kings-grace",
    branchId: "branch-imaara",
    organizationUnitId: "unit-east",
    groupTypeId: "group-type-outreach",
    name: "Eastern Outreach Team",
    code: "EAST-OUT-001",
    description: "Mobile outreach team with branch reporting.",
    purpose: "Community invitation and first-contact handover.",
    leaderUserId: "user-admin",
    assistantLeaderUserId: "user-branch",
    supervisingPastorUserId: "user-admin",
    scheduleSummary: "Monthly Saturday outreach",
    venueSummary: "Rotating outreach locations",
    approximateLocation: "Eastern region",
    exactAddressRestricted: false,
    language: "en",
    targetAudience: "Community outreach",
    genderFocus: "all",
    capacity: 25,
    currentMembership: 6,
    status: "active",
    startDate: "2026-07-01",
    nextReviewDate: "2026-08-20",
    reportingUnitId: "unit-east",
    publicDiscoverable: false,
    joinPolicy: "invite_only",
    approvalWorkflowId: "workflow-group-creation",
    visibility: "private",
    createdAt: "2026-07-01T08:00:00.000Z",
    updatedAt: "2026-07-11T16:00:00.000Z",
  },
];

export const groupLeadershipAssignments: GroupLeadershipAssignment[] = [
  { id: "glead-imaara-leader", tenantId: "tenant-kings-grace", groupId: "group-imaara-family", userId: "user-branch", roleKey: "leader", startDate: "2026-07-01", status: "active", reason: "Branch-approved leader", permissions: ["small_group.view", "small_group.attendance.record", "small_group.report.submit"] },
  { id: "glead-imaara-assistant", tenantId: "tenant-kings-grace", groupId: "group-imaara-family", userId: "user-volunteer", roleKey: "assistant", startDate: "2026-07-01", status: "active", reason: "Assistant leader pipeline", permissions: ["small_group.view", "small_group.attendance.record"] },
  { id: "glead-ruiru-leader", tenantId: "tenant-kings-grace", groupId: "group-ruiru-youth", userId: "user-branch", roleKey: "leader", startDate: "2026-07-05", status: "acting", reason: "Temporary youth cover", permissions: ["small_group.view", "small_group.attendance.record", "small_group.report.submit"], approvalRequestId: "approval-youth-role" },
];

export const groupMemberships: GroupMembership[] = [
  { id: "gm-amina", tenantId: "tenant-kings-grace", groupId: "group-imaara-family", personId: "person-amina", branchId: "branch-imaara", membershipType: "primary", status: "active", joinedAt: "2026-07-01", source: "staff assignment", assignedByUserId: "user-admin", attendanceStreak: 3, missedConsecutiveMeetings: 0, roleInGroup: "host" },
  { id: "gm-david", tenantId: "tenant-kings-grace", groupId: "group-imaara-family", personId: "person-david", branchId: "branch-imaara", membershipType: "primary", status: "leader", joinedAt: "2026-07-01", source: "leadership assignment", assignedByUserId: "user-admin", attendanceStreak: 3, missedConsecutiveMeetings: 0, roleInGroup: "leader" },
  { id: "gm-mary", tenantId: "tenant-kings-grace", groupId: "group-imaara-family", personId: "person-visitor-mary", branchId: "branch-imaara", membershipType: "primary", status: "first_timer", joinedAt: "2026-07-10", source: "group QR", invitedByUserId: "user-branch", attendanceStreak: 1, missedConsecutiveMeetings: 0 },
  { id: "gm-john", tenantId: "tenant-kings-grace", groupId: "group-ruiru-youth", personId: "person-newconvert-john", branchId: "branch-ruiru", membershipType: "primary", status: "prospective", joinedAt: "2026-07-09", source: "new convert follow-up", assignedByUserId: "user-branch", attendanceStreak: 1, missedConsecutiveMeetings: 0 },
  { id: "gm-grace", tenantId: "tenant-kings-grace", groupId: "group-imaara-family", personId: "person-child-grace", branchId: "branch-imaara", membershipType: "secondary", status: "child", joinedAt: "2026-07-01", source: "household", attendanceStreak: 1, missedConsecutiveMeetings: 2 },
];

export const groupJoinRequests: GroupJoinRequest[] = [
  { id: "gjr-mary", tenantId: "tenant-kings-grace", groupId: "group-imaara-family", personId: "person-visitor-mary", requesterName: "Mary Wairimu", source: "public_directory", status: "pending_approval", requestedAt: "2026-07-10T15:00:00.000Z", notes: "Requested placement near Imaara." },
  { id: "gjr-neighbour", tenantId: "tenant-kings-grace", groupId: "group-imaara-family", requesterName: "Neighbour Guest", source: "qr", status: "requested", requestedAt: "2026-07-11T18:20:00.000Z" },
];

export const groupTransfers: GroupTransfer[] = [
  { id: "gtransfer-john", tenantId: "tenant-kings-grace", personId: "person-newconvert-john", sourceGroupId: "group-imaara-family", destinationGroupId: "group-ruiru-youth", reason: "Closer to home and youth focus", requestedByUserId: "user-branch", effectiveDate: "2026-07-15", sourceApprovalStatus: "approved", destinationApprovalStatus: "pending", memberAcknowledgement: "pending", followUpHandoverStatus: "pending", status: "in_review" },
];

export const groupMeetingTypes: GroupMeetingType[] = [
  { id: "meeting-type-fellowship", tenantId: "tenant-kings-grace", key: "regular_fellowship", name: "Regular Fellowship", reportTemplateId: "template-standard-cell-v1", attendanceCategories: ["member", "visitor", "first_timer", "new_convert", "online"], givingCategoriesShown: ["give-offering", "give-welfare"], followUpFields: ["absent_members", "visitors", "new_converts"], approvalWorkflowId: "workflow-group-report-standard", durationMinutes: 90, pastoralEscalationEnabled: true },
  { id: "meeting-type-outreach", tenantId: "tenant-kings-grace", key: "outreach", name: "Outreach", reportTemplateId: "template-outreach-v1", attendanceCategories: ["team", "first_timer", "new_convert"], givingCategoriesShown: [], followUpFields: ["people_contacted", "invitations", "follow_up_required"], approvalWorkflowId: "workflow-group-report-standard", durationMinutes: 120, pastoralEscalationEnabled: true },
];

export const groupMeetings: GroupMeeting[] = [
  { id: "meeting-imaara-20260708", tenantId: "tenant-kings-grace", groupId: "group-imaara-family", meetingTypeId: "meeting-type-fellowship", meetingDate: "2026-07-08", startTime: "18:30", endTime: "20:00", venueSummary: "Private home near Imaara Daima", hostPersonId: "person-amina", leaderUserId: "user-branch", theme: "Belonging and care", scripture: "Acts 2:42", expectedAttendance: 14, status: "completed", reportStatus: "approved" },
  { id: "meeting-imaara-20260715", tenantId: "tenant-kings-grace", groupId: "group-imaara-family", meetingTypeId: "meeting-type-fellowship", meetingDate: "2026-07-15", startTime: "18:30", endTime: "20:00", venueSummary: "Private home near Imaara Daima", hostPersonId: "person-amina", leaderUserId: "user-branch", theme: "Prayer and witness", expectedAttendance: 15, status: "scheduled", reportStatus: "not_started" },
  { id: "meeting-ruiru-20260710", tenantId: "tenant-kings-grace", groupId: "group-ruiru-youth", meetingTypeId: "meeting-type-fellowship", meetingDate: "2026-07-10", startTime: "17:30", endTime: "19:00", venueSummary: "Ruiru Campus hall", leaderUserId: "user-branch", theme: "Foundation and belonging", expectedAttendance: 10, status: "completed", reportStatus: "submitted" },
];

export const groupAttendanceRecords: GroupAttendanceRecord[] = [
  { id: "att-amina", tenantId: "tenant-kings-grace", meetingId: "meeting-imaara-20260708", groupId: "group-imaara-family", personId: "person-amina", displayName: "Amina Otieno", status: "present", attendeeType: "member", checkedInAt: "2026-07-08T18:24:00.000Z", recordedByUserId: "user-branch", source: "leader_mobile" },
  { id: "att-david", tenantId: "tenant-kings-grace", meetingId: "meeting-imaara-20260708", groupId: "group-imaara-family", personId: "person-david", displayName: "David Mwangi", status: "present", attendeeType: "member", checkedInAt: "2026-07-08T18:20:00.000Z", recordedByUserId: "user-branch", source: "leader_mobile" },
  { id: "att-mary", tenantId: "tenant-kings-grace", meetingId: "meeting-imaara-20260708", groupId: "group-imaara-family", personId: "person-visitor-mary", displayName: "Mary Wairimu", status: "visitor", attendeeType: "first_timer", checkedInAt: "2026-07-08T18:44:00.000Z", recordedByUserId: "user-branch", source: "qr", notes: "Requested fellowship placement." },
  { id: "att-grace-absent", tenantId: "tenant-kings-grace", meetingId: "meeting-imaara-20260708", groupId: "group-imaara-family", personId: "person-child-grace", displayName: "Grace Otieno", status: "excused", attendeeType: "child_placeholder", recordedByUserId: "user-branch", source: "household", notes: "Guardian excused." },
  { id: "att-john", tenantId: "tenant-kings-grace", meetingId: "meeting-ruiru-20260710", groupId: "group-ruiru-youth", personId: "person-newconvert-john", displayName: "John Kariuki", status: "present", attendeeType: "new_convert", checkedInAt: "2026-07-10T17:28:00.000Z", recordedByUserId: "user-branch", source: "manual" },
];

export const groupMeetingReports: GroupMeetingReport[] = [
  { id: "report-imaara-20260708", tenantId: "tenant-kings-grace", groupId: "group-imaara-family", meetingId: "meeting-imaara-20260708", templateId: "template-standard-cell-v1", templateVersion: 1, status: "locked", submittedByUserId: "user-branch", submittedAt: "2026-07-08T21:00:00.000Z", reviewerUserId: "user-admin", approverUserId: "user-admin", lockedAt: "2026-07-09T08:30:00.000Z", attendanceSummary: { present: 11, absent: 3, visitors: 1, firstTimers: 1, newConverts: 0, online: 0 }, safeReferralSummary: ["One confidential prayer referral submitted"], outreachSummary: "Two invitations issued to neighbours.", nextMeetingPlan: "Follow up first-timer and absent household.", attachments: [] },
  { id: "report-ruiru-20260710", tenantId: "tenant-kings-grace", groupId: "group-ruiru-youth", meetingId: "meeting-ruiru-20260710", templateId: "template-standard-cell-v1", templateVersion: 1, status: "submitted", submittedByUserId: "user-branch", submittedAt: "2026-07-10T20:00:00.000Z", attendanceSummary: { present: 8, absent: 2, visitors: 1, firstTimers: 0, newConverts: 1, online: 0 }, safeReferralSummary: ["One pastoral metadata referral submitted"], nextMeetingPlan: "Invite John to foundation class placeholder.", attachments: [] },
];

export const givingCategories: GivingCategory[] = [
  { id: "give-offering", tenantId: "tenant-kings-grace", code: "OFFERING", name: "Offering", description: "Configured church offering category.", availableInGroupReports: true, individualDetailAllowed: false, totalsOnlyDefault: true, restrictedVisibility: false, currency: "KES", status: "active" },
  { id: "give-welfare", tenantId: "tenant-kings-grace", code: "WELFARE", name: "Welfare Support", description: "Restricted welfare support category for safe totals.", availableInGroupReports: true, individualDetailAllowed: false, totalsOnlyDefault: true, restrictedVisibility: true, currency: "KES", status: "active" },
];

export const meetingGivingTotals: MeetingGivingTotal[] = [
  { id: "mgt-offering-imaara", tenantId: "tenant-kings-grace", meetingId: "meeting-imaara-20260708", categoryId: "give-offering", currency: "KES", cash: 1200, mpesa: 1800, bank: 0, card: 0, cheque: 0, other: 0, recordedByUserId: "user-branch", verifiedByUserId: "user-admin", reconciliationStatus: "verified", notes: "Totals only." },
  { id: "mgt-welfare-imaara", tenantId: "tenant-kings-grace", meetingId: "meeting-imaara-20260708", categoryId: "give-welfare", currency: "KES", cash: 500, mpesa: 0, bank: 0, card: 0, cheque: 0, other: 0, recordedByUserId: "user-branch", reconciliationStatus: "pending_handover", notes: "Restricted finance visibility." },
];

export const financeHandovers: FinanceHandover[] = [
  { id: "handover-imaara-20260708", tenantId: "tenant-kings-grace", meetingId: "meeting-imaara-20260708", branchId: "branch-imaara", amount: 3500, currency: "KES", categoryIds: ["give-offering", "give-welfare"], handedOverByUserId: "user-branch", receivedByUserId: "user-admin", handedOverAt: "2026-07-09T09:00:00.000Z", paymentMethod: "mixed", depositReference: "DEP-PENDING", status: "received", notes: "Accounting posting reserved for finance prompt." },
];

export const groupHealthSnapshots: GroupHealthSnapshot[] = [
  { id: "health-imaara", tenantId: "tenant-kings-grace", groupId: "group-imaara-family", capturedAt: "2026-07-11T18:00:00.000Z", label: "Capacity Pressure", visibleToRoles: ["branch_pastor", "church_admin"], indicators: [{ key: "capacity", label: "Capacity pressure", status: "attention", explanation: "14 active/prospective participants against capacity 16." }, { key: "assistant_ready", label: "Assistant leader readiness", status: "good", explanation: "Assistant leader is active and attending." }, { key: "report_timeliness", label: "Report timeliness", status: "good", explanation: "Last completed report was submitted same day." }] },
  { id: "health-ruiru", tenantId: "tenant-kings-grace", groupId: "group-ruiru-youth", capturedAt: "2026-07-11T18:00:00.000Z", label: "Ready for Review", visibleToRoles: ["branch_pastor", "church_admin"], indicators: [{ key: "leader_status", label: "Leader coverage", status: "watch", explanation: "Leader is acting and needs confirmed approval." }, { key: "new_convert_follow_up", label: "New-convert follow-up", status: "good", explanation: "John has an assigned worker." }] },
];

export const multiplicationProposals: GroupMultiplicationProposal[] = [
  { id: "multi-imaara-east", tenantId: "tenant-kings-grace", parentGroupId: "group-imaara-family", proposedName: "Imaara East Fellowship", proposedLeaderUserId: "user-volunteer", proposedAssistantUserId: "user-branch", proposedMemberIds: ["person-visitor-mary"], effectiveDate: "2026-09-30", readinessIndicators: ["capacity pressure", "assistant leader active", "stable meeting frequency", "pastoral review required"], status: "pastor_review", approvalRequestId: "approval-group-multiplication" },
];

export const groupQrCodes: GroupQrCode[] = [
  { id: "qr-imaara-join", tenantId: "tenant-kings-grace", groupId: "group-imaara-family", purpose: "join_request", publicCode: "KFG-JOIN-IMAARA-FAM", active: true, expiresAt: "2026-12-31T21:00:00.000Z", scanCount: 18, abuseProtection: ["opaque_code", "rate_limit_placeholder", "tenant_attribution"] },
  { id: "qr-imaara-checkin", tenantId: "tenant-kings-grace", groupId: "group-imaara-family", purpose: "meeting_check_in", publicCode: "KFG-CHECKIN-IMAARA-FAM", active: true, expiresAt: "2026-07-15T21:00:00.000Z", scanCount: 4, abuseProtection: ["expires", "meeting_window", "no_internal_ids"] },
];

export const groupCommunicationEvents: GroupCommunicationEvent[] = [
  { id: "comm-report-reminder", tenantId: "tenant-kings-grace", groupId: "group-ruiru-youth", kind: "report_reminder", safeMetadata: "Ruiru Youth Connect report awaiting review. No confidential content included.", channelProvider: "placeholder", respectsConsent: true, status: "queued_placeholder" },
  { id: "comm-join-response", tenantId: "tenant-kings-grace", groupId: "group-imaara-family", kind: "join_request_response", safeMetadata: "Join request received for Imaara Family Fellowship.", channelProvider: "placeholder", respectsConsent: true, status: "queued_placeholder" },
];
