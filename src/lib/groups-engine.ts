import { can } from "./authority-engine";
import { branches, profiles } from "./data";
import {
  financeHandovers,
  givingCategories,
  groupAttendanceRecords,
  groupCommunicationEvents,
  groupHealthSnapshots,
  groupJoinRequests,
  groupLeadershipAssignments,
  groupMeetingReports,
  groupMeetings,
  groupMemberships,
  groupQrCodes,
  groupReportTemplates,
  groupTransfers,
  meetingGivingTotals,
  multiplicationProposals,
  smallGroups,
  smallGroupTypes,
} from "./groups-data";
import type { GroupAttendanceRecord, GroupHealthSnapshot, GroupMeetingReport, HealthLabel, MeetingGivingTotal, SmallGroup } from "./groups-types";
import { followUpTasks, newConvertRecords, people, visitorRecords } from "./people-data";
import { detectDuplicate, getPersonName, registerNewConvert, submitVisitorForm } from "./people-engine";
import type { PermissionKey } from "./types";

export interface GroupsContext {
  tenantId: string;
  userId: string;
  branchId?: string;
  now?: Date;
}

const DEFAULT_NOW = new Date("2026-07-12T09:00:00.000Z");

function groupScope(group: SmallGroup) {
  return { scopeType: "branch" as const, scopeId: group.branchId };
}

function isAssignedGroupLeader(userId: string, groupId: string, permission?: PermissionKey) {
  return groupLeadershipAssignments.some((assignment) => {
    if (assignment.groupId !== groupId || assignment.userId !== userId || !["active", "acting"].includes(assignment.status)) return false;
    return permission ? assignment.permissions.includes(permission) : true;
  });
}

export function canAccessGroup(userId: string, group: SmallGroup, permission: PermissionKey = "small_group.view") {
  if (isAssignedGroupLeader(userId, group.id, permission) || group.leaderUserId === userId || group.assistantLeaderUserId === userId || group.supervisingPastorUserId === userId) {
    return { allowed: true, reason: "Allowed: user is assigned to this group without broad branch access." };
  }
  return can(userId, permission, { tenantId: group.tenantId, ...groupScope(group) });
}

export function getAccessibleGroups(context: GroupsContext, permission: PermissionKey = "small_group.view") {
  return smallGroups.filter((group) => group.tenantId === context.tenantId && canAccessGroup(context.userId, group, permission).allowed);
}

export function getGroupTypeName(groupTypeId: string) {
  return smallGroupTypes.find((type) => type.id === groupTypeId)?.displayName ?? "Group";
}

export function getGroupLeaderName(group: SmallGroup) {
  return profiles.find((profile) => profile.id === group.leaderUserId)?.fullName ?? "Unassigned";
}

export function wouldCreateGroupCycle(groupId: string, proposedParentGroupId?: string) {
  if (!proposedParentGroupId) return false;
  if (groupId === proposedParentGroupId) return true;
  let cursor = smallGroups.find((group) => group.id === proposedParentGroupId);
  while (cursor) {
    if (cursor.parentGroupId === groupId) return true;
    cursor = smallGroups.find((group) => group.id === cursor?.parentGroupId);
  }
  return false;
}

export function canMoveGroup(input: { actorUserId: string; groupId: string; destinationBranchId: string; parentGroupId?: string }) {
  const group = smallGroups.find((item) => item.id === input.groupId);
  if (!group) return { allowed: false, reason: "Group not found." };
  if (wouldCreateGroupCycle(input.groupId, input.parentGroupId)) return { allowed: false, reason: "Move blocked: hierarchy cycle would be created." };
  if (group.branchId !== input.destinationBranchId) {
    const source = can(input.actorUserId, "small_group.manage", { tenantId: group.tenantId, scopeType: "branch", scopeId: group.branchId });
    const destination = can(input.actorUserId, "small_group.manage", { tenantId: group.tenantId, scopeType: "branch", scopeId: input.destinationBranchId });
    if (!source.allowed || !destination.allowed) return { allowed: false, reason: "Move blocked: cross-branch placement requires authority in both branches." };
  }
  return { allowed: true, reason: "Move can proceed with history preserved." };
}

export function canActivateGroup(groupId: string, actorUserId: string) {
  const group = smallGroups.find((item) => item.id === groupId);
  if (!group) return { allowed: false, reason: "Group not found." };
  if (!["proposed", "pending_approval"].includes(group.status)) return { allowed: false, reason: "Only proposed or pending groups can be activated." };
  const decision = can(actorUserId, "small_group.manage", { tenantId: group.tenantId, ...groupScope(group) });
  return decision.allowed ? { allowed: true, reason: "Activation requires the configured approval workflow record." } : decision;
}

export function getGroupMembershipSummary(groupId: string) {
  const memberships = groupMemberships.filter((membership) => membership.groupId === groupId);
  return {
    active: memberships.filter((item) => ["active", "leader", "regular"].includes(item.status)).length,
    visitors: memberships.filter((item) => ["visitor", "first_timer", "guest", "prospective"].includes(item.status)).length,
    children: memberships.filter((item) => item.status === "child").length,
    inactive: memberships.filter((item) => item.status === "inactive").length,
    transfers: memberships.filter((item) => item.status === "transferred").length,
  };
}

export function summarizeAttendance(meetingId: string) {
  const rows = groupAttendanceRecords.filter((record) => record.meetingId === meetingId);
  return {
    present: rows.filter((row) => ["present", "late", "early_departure", "online", "visitor"].includes(row.status)).length,
    absent: rows.filter((row) => ["absent", "excused", "unexcused"].includes(row.status)).length,
    visitors: rows.filter((row) => ["first_timer", "returning_visitor", "guest"].includes(row.attendeeType)).length,
    firstTimers: rows.filter((row) => row.attendeeType === "first_timer").length,
    newConverts: rows.filter((row) => row.attendeeType === "new_convert").length,
    online: rows.filter((row) => row.status === "online" || row.attendeeType === "remote").length,
  };
}

export function recordAttendance(input: Omit<GroupAttendanceRecord, "id">) {
  const meeting = groupMeetings.find((item) => item.id === input.meetingId);
  if (!meeting) throw new Error("Meeting not found");
  if (meeting.groupId !== input.groupId) throw new Error("Attendance group does not match meeting group");
  return { ...input, id: `att-${input.meetingId}-${groupAttendanceRecords.length + 1}` };
}

export function captureUnregisteredAttendee(input: { tenantId: string; branchId: string; groupId: string; meetingId: string; firstName: string; surname: string; phone?: string; email?: string; consentToContact: boolean; madeFaithDecision: boolean }) {
  const duplicates = detectDuplicate(input);
  const visitor = submitVisitorForm(input);
  return {
    duplicateReviewRequired: duplicates.length > 0,
    visitor,
    attendance: recordAttendance({
      tenantId: input.tenantId,
      meetingId: input.meetingId,
      groupId: input.groupId,
      personId: visitor.person.id,
      displayName: getPersonName(visitor.person),
      status: "visitor",
      attendeeType: input.madeFaithDecision ? "new_convert" : "first_timer",
      recordedByUserId: "public-qr",
      source: "qr",
      notes: "Captured from group meeting without forcing full membership.",
    }),
  };
}

export function recordFaithDecisionFromMeeting(personId: string, meetingId: string) {
  if (newConvertRecords.some((record) => record.personId === personId && ["awaiting_assignment", "assigned", "in_follow_up"].includes(record.status))) {
    return { created: false, reason: "Existing active new-convert journey found." };
  }
  const journey = registerNewConvert(personId);
  return { created: true, meetingId, ...journey, programmeRecommendation: "Foundation programme placeholder" };
}

export function buildAbsenceFollowUpTasks(groupId: string) {
  return groupMemberships
    .filter((membership) => membership.groupId === groupId && membership.missedConsecutiveMeetings >= 2)
    .map((membership) => {
      const person = people.find((item) => item.id === membership.personId);
      const threshold = membership.missedConsecutiveMeetings >= 4 ? "pastoral_escalation" : membership.missedConsecutiveMeetings >= 3 ? "leader_follow_up" : "contact_needed";
      return {
        id: `group-absence-${membership.id}`,
        tenantId: membership.tenantId,
        personId: membership.personId,
        groupId,
        threshold,
        description: `${person ? getPersonName(person) : "Member"} needs ${threshold.replaceAll("_", " ")} after ${membership.missedConsecutiveMeetings} missed meetings.`,
      };
    });
}

export function submitMeetingReport(reportId: string, submittedByUserId: string) {
  const report = groupMeetingReports.find((item) => item.id === reportId);
  if (!report) throw new Error("Report not found");
  const group = smallGroups.find((item) => item.id === report.groupId);
  if (!group) throw new Error("Group not found");
  const allowed = canAccessGroup(submittedByUserId, group, "small_group.report.submit");
  if (!allowed.allowed) return allowed;
  return { allowed: true, report: { ...report, status: "submitted" as const, submittedByUserId, submittedAt: DEFAULT_NOW.toISOString() } };
}

export function reviewMeetingReport(reportId: string, reviewerUserId: string, decision: "approved" | "returned" | "rejected", reason?: string) {
  const report = groupMeetingReports.find((item) => item.id === reportId);
  if (!report) throw new Error("Report not found");
  const group = smallGroups.find((item) => item.id === report.groupId);
  if (!group) throw new Error("Group not found");
  if (report.submittedByUserId === reviewerUserId && decision === "approved") return { allowed: false, reason: "Denied: report submitters cannot self-approve." };
  const allowed = canAccessGroup(reviewerUserId, group, decision === "approved" ? "small_group.report.approve" : "small_group.report.review");
  if (!allowed.allowed) return allowed;
  return {
    allowed: true,
    report: {
      ...report,
      status: decision === "approved" ? "locked" as const : decision,
      reviewerUserId,
      approverUserId: decision === "approved" ? reviewerUserId : report.approverUserId,
      correctionReason: decision === "returned" ? reason : report.correctionReason,
      lockedAt: decision === "approved" ? DEFAULT_NOW.toISOString() : report.lockedAt,
    },
  };
}

export function calculateGivingRow(row: Pick<MeetingGivingTotal, "cash" | "mpesa" | "bank" | "card" | "cheque" | "other">) {
  const values = [row.cash, row.mpesa, row.bank, row.card, row.cheque, row.other];
  if (values.some((value) => value < 0)) throw new Error("Giving totals cannot be negative.");
  return values.reduce((sum, value) => sum + value, 0);
}

export function calculateMeetingGiving(meetingId: string) {
  const rows = meetingGivingTotals.filter((row) => row.meetingId === meetingId);
  const currencies = new Set(rows.map((row) => row.currency));
  if (currencies.size > 1) throw new Error("Meeting giving totals must use one currency.");
  return {
    currency: rows[0]?.currency ?? "KES",
    rows: rows.map((row) => ({ ...row, category: givingCategories.find((category) => category.id === row.categoryId), total: calculateGivingRow(row) })),
    grandTotal: rows.reduce((sum, row) => sum + calculateGivingRow(row), 0),
  };
}

export function redactReportForUser(report: GroupMeetingReport, userId: string) {
  const group = smallGroups.find((item) => item.id === report.groupId);
  if (!group) return report;
  const financeAllowed = can(userId, "small_group.giving.view", { tenantId: report.tenantId, ...groupScope(group) }).allowed || can(userId, "finance.view_summary", { tenantId: report.tenantId, ...groupScope(group) }).allowed;
  return {
    ...report,
    safeReferralSummary: report.safeReferralSummary,
    giving: financeAllowed ? calculateMeetingGiving(report.meetingId) : undefined,
    restrictedFinanceNotice: financeAllowed ? undefined : "Giving totals are hidden without explicit finance permission.",
  };
}

export function getGroupHealth(groupId: string): GroupHealthSnapshot | undefined {
  const seeded = groupHealthSnapshots.find((snapshot) => snapshot.groupId === groupId);
  if (seeded) return seeded;
  const group = smallGroups.find((item) => item.id === groupId);
  if (!group) return undefined;
  const membership = getGroupMembershipSummary(groupId);
  const label: HealthLabel = membership.active >= group.capacity ? "Capacity Pressure" : group.assistantLeaderUserId ? "Stable" : "Leadership Gap";
  return { id: `health-${groupId}`, tenantId: group.tenantId, groupId, capturedAt: DEFAULT_NOW.toISOString(), label, visibleToRoles: ["branch_pastor"], indicators: [] };
}

export function getMultiplicationCandidates(context: GroupsContext) {
  return getAccessibleGroups(context, "small_group.view").filter((group) => {
    const type = smallGroupTypes.find((item) => item.id === group.groupTypeId);
    return Boolean(type?.multiplicationEnabled && group.currentMembership >= Math.floor(group.capacity * 0.85));
  });
}

export function getLeaderWorkspace(context: GroupsContext) {
  const groups = smallGroups.filter((group) => group.tenantId === context.tenantId && [group.leaderUserId, group.assistantLeaderUserId, group.secretaryUserId].includes(context.userId));
  const groupIds = new Set(groups.map((group) => group.id));
  return {
    groups,
    nextMeetings: groupMeetings.filter((meeting) => groupIds.has(meeting.groupId) && meeting.status === "scheduled"),
    reportsDue: groupMeetings.filter((meeting) => groupIds.has(meeting.groupId) && ["not_started", "draft", "returned"].includes(meeting.reportStatus)),
    membersNeedingFollowUp: groups.flatMap((group) => buildAbsenceFollowUpTasks(group.id)),
    firstTimers: groupAttendanceRecords.filter((record) => groupIds.has(record.groupId) && record.attendeeType === "first_timer"),
    newConverts: groupAttendanceRecords.filter((record) => groupIds.has(record.groupId) && record.attendeeType === "new_convert"),
    pendingJoinRequests: groupJoinRequests.filter((request) => groupIds.has(request.groupId) && ["requested", "pending_approval"].includes(request.status)),
    safeReferrals: groupMeetingReports.filter((report) => groupIds.has(report.groupId)).flatMap((report) => report.safeReferralSummary),
    handoverTasks: financeHandovers.filter((handover) => groupMeetings.some((meeting) => meeting.id === handover.meetingId && groupIds.has(meeting.groupId)) && !["verified", "cancelled"].includes(handover.status)),
    multiplicationTasks: multiplicationProposals.filter((proposal) => groupIds.has(proposal.parentGroupId) && proposal.status !== "launched"),
  };
}

export function getSupervisingPastorWorkspace(context: GroupsContext) {
  const groups = smallGroups.filter((group) => group.tenantId === context.tenantId && group.supervisingPastorUserId === context.userId);
  const groupIds = new Set(groups.map((group) => group.id));
  return {
    groups,
    reportsAwaitingReview: groupMeetingReports.filter((report) => groupIds.has(report.groupId) && ["submitted", "under_review", "returned"].includes(report.status)),
    overdueReports: groupMeetings.filter((meeting) => groupIds.has(meeting.groupId) && meeting.status === "completed" && ["not_started", "draft"].includes(meeting.reportStatus)),
    groupsWithoutLeaders: groups.filter((group) => !group.leaderUserId),
    groupsAtCapacity: groups.filter((group) => group.currentMembership >= group.capacity),
    multiplicationProposals: multiplicationProposals.filter((proposal) => groupIds.has(proposal.parentGroupId)),
    inactiveGroups: groups.filter((group) => ["paused", "under_review", "closed"].includes(group.status)),
    leaderWorkload: groups.reduce<Record<string, number>>((acc, group) => ({ ...acc, [group.leaderUserId]: (acc[group.leaderUserId] ?? 0) + 1 }), {}),
  };
}

export function getPublicGroupDirectory(context: GroupsContext) {
  return getAccessibleGroups(context, "small_group.view")
    .filter((group) => group.publicDiscoverable && group.status === "active")
    .map((group) => ({
      id: group.id,
      name: group.name,
      type: getGroupTypeName(group.groupTypeId),
      branch: branches.find((branch) => branch.id === group.branchId)?.name,
      generalLocation: group.approximateLocation,
      exactAddress: undefined,
      meetingTime: group.scheduleSummary,
      language: group.language,
      targetAudience: group.targetAudience,
      availability: group.currentMembership >= group.capacity ? "waitlist" : "available",
      leaderLabel: getGroupLeaderName(group).split(" ")[0],
      onlineOrPhysical: group.onlineLink ? "hybrid" : "physical",
      joinPolicy: group.joinPolicy,
    }));
}

export function getGroupAnalytics(context: GroupsContext) {
  const groups = getAccessibleGroups(context);
  const groupIds = new Set(groups.map((group) => group.id));
  return {
    activeGroups: groups.filter((group) => group.status === "active").length,
    meetingsThisPeriod: groupMeetings.filter((meeting) => groupIds.has(meeting.groupId)).length,
    reportsSubmitted: groupMeetingReports.filter((report) => groupIds.has(report.groupId) && ["submitted", "locked", "approved"].includes(report.status)).length,
    firstTimers: groupAttendanceRecords.filter((record) => groupIds.has(record.groupId) && record.attendeeType === "first_timer").length,
    newConverts: groupAttendanceRecords.filter((record) => groupIds.has(record.groupId) && record.attendeeType === "new_convert").length,
    absentNeedingFollowUp: groups.flatMap((group) => buildAbsenceFollowUpTasks(group.id)).length,
    joinRequests: groupJoinRequests.filter((request) => groupIds.has(request.groupId) && ["requested", "pending_approval"].includes(request.status)).length,
    transfers: groupTransfers.filter((transfer) => groupIds.has(transfer.sourceGroupId) || groupIds.has(transfer.destinationGroupId)).length,
    multiplicationReadiness: getMultiplicationCandidates(context).length,
    givingGrandTotal: groups.reduce((sum, group) => {
      const meetingIds = groupMeetings.filter((meeting) => meeting.groupId === group.id).map((meeting) => meeting.id);
      return sum + meetingIds.reduce((meetingSum, meetingId) => meetingSum + calculateMeetingGiving(meetingId).grandTotal, 0);
    }, 0),
    healthLabels: groups.map((group) => ({ groupId: group.id, label: getGroupHealth(group.id)?.label ?? "Stable" })),
  };
}

export function getGroupReports(context: GroupsContext) {
  const groupIds = new Set(getAccessibleGroups(context).map((group) => group.id));
  return {
    groupRegister: smallGroups.filter((group) => groupIds.has(group.id)),
    meetingSchedule: groupMeetings.filter((meeting) => groupIds.has(meeting.groupId)),
    attendanceTrend: groupMeetings.filter((meeting) => groupIds.has(meeting.groupId)).map((meeting) => ({ meetingId: meeting.id, date: meeting.meetingDate, ...summarizeAttendance(meeting.id) })),
    reportStatus: groupMeetingReports.filter((report) => groupIds.has(report.groupId)).map((report) => ({ reportId: report.id, status: report.status })),
    financeHandoverStatus: financeHandovers.filter((handover) => groupMeetings.some((meeting) => meeting.id === handover.meetingId && groupIds.has(meeting.groupId))),
    qrs: groupQrCodes.filter((qr) => groupIds.has(qr.groupId)),
    communications: groupCommunicationEvents.filter((event) => groupIds.has(event.groupId)),
  };
}

export function getEveryPersonMattersGroupAdditions(context: GroupsContext) {
  const groupIds = new Set(getAccessibleGroups(context).map((group) => group.id));
  return {
    firstTimersFromGroups: groupAttendanceRecords.filter((record) => groupIds.has(record.groupId) && record.attendeeType === "first_timer").length,
    newConvertsFromGroups: groupAttendanceRecords.filter((record) => groupIds.has(record.groupId) && record.attendeeType === "new_convert").length,
    unassignedGroupVisitors: visitorRecords.filter((visit) => visit.wantsFellowship && !groupMemberships.some((membership) => membership.personId === visit.personId)).length,
    absentMembersNeedingFollowUp: getAccessibleGroups(context).flatMap((group) => buildAbsenceFollowUpTasks(group.id)).length,
    peopleRequestingFellowshipPlacement: groupJoinRequests.filter((request) => groupIds.has(request.groupId) && ["requested", "pending_approval"].includes(request.status)).length,
    groupJoinRequests: groupJoinRequests.filter((request) => groupIds.has(request.groupId)).length,
    existingFollowUpTasksLinked: followUpTasks.filter((task) => groupMemberships.some((membership) => membership.personId === task.personId && groupIds.has(membership.groupId))).length,
  };
}

export function describeTemplate(templateId: string) {
  const template = groupReportTemplates.find((item) => item.id === templateId);
  return template ? `${template.name} v${template.version}` : "Unknown template";
}
