import { can } from "./authority-engine";
import { approvalWorkflows, leadershipAssignments, leadershipPositions } from "./authority-data";
import { branches, profiles } from "./data";
import {
  carePlans,
  caseTasks,
  caseTimeline,
  confidentialityLevels,
  counsellingAppointments,
  pastoralCaseAccessGrants,
  pastoralCaseCategories,
  pastoralCases,
  pastoralNotes,
  pastoralNoteVersions,
  pastoralReferrals,
  pastoralVisits,
  prayerAssignments,
  prayerFollowUps,
  prayerRequests,
  prayerTeams,
  professionalReferrals,
  safeguardingCases,
  testimonies,
  welfareAssessments,
  welfareRequests,
} from "./pastoral-data";
import type { ConfidentialityLevelKey, PastoralCase, PastoralNote, PrayerRequest, SharedInformationLevel, Testimony, WelfareRequest } from "./pastoral-types";
import { getPersonName } from "./people-engine";
import { people } from "./people-data";
import type { PermissionKey } from "./types";

export interface PastoralContext {
  tenantId: string;
  userId: string;
  branchId?: string;
  now?: Date;
}

const DEFAULT_NOW = new Date("2026-07-11T13:00:00.000Z");

function activeCaseGrant(userId: string, caseId: string, permission: PermissionKey, now = DEFAULT_NOW) {
  return pastoralCaseAccessGrants.some((grant) => {
    if (!grant.active || grant.caseId !== caseId || grant.userId !== userId || !grant.permissions.includes(permission)) return false;
    const start = new Date(grant.startsAt);
    const end = grant.expiresAt ? new Date(grant.expiresAt) : undefined;
    return start <= now && (!end || end > now);
  });
}

function caseScope(pastoralCase: PastoralCase) {
  return pastoralCase.branchId ? ({ scopeType: "branch" as const, scopeId: pastoralCase.branchId }) : ({ scopeType: "tenant" as const });
}

function levelFor(key: ConfidentialityLevelKey) {
  const level = confidentialityLevels.find((item) => item.key === key);
  if (!level) throw new Error(`Unknown confidentiality level: ${key}`);
  return level;
}

function hasAnyPermission(userId: string, permissions: PermissionKey[], pastoralCase: PastoralCase, tenantId = pastoralCase.tenantId) {
  return permissions.some((permission) => can(userId, permission, { tenantId, ...caseScope(pastoralCase) }).allowed || activeCaseGrant(userId, pastoralCase.id, permission));
}

export function canViewCaseExistence(userId: string, pastoralCase: PastoralCase) {
  const level = levelFor(pastoralCase.confidentiality);
  if (pastoralCase.assignedWorkerId === userId || pastoralCase.assignedPastorId === userId || pastoralCase.supervisingPastorId === userId) {
    if (pastoralCase.confidentiality === "safeguarding") return hasAnyPermission(userId, level.viewExistencePermissions, pastoralCase);
    return true;
  }
  return hasAnyPermission(userId, level.viewExistencePermissions, pastoralCase);
}

export function canViewCaseSummary(userId: string, pastoralCase: PastoralCase) {
  const level = levelFor(pastoralCase.confidentiality);
  if (!canViewCaseExistence(userId, pastoralCase)) return false;
  if (pastoralCase.assignedWorkerId === userId || pastoralCase.assignedPastorId === userId || pastoralCase.supervisingPastorId === userId) {
    return pastoralCase.confidentiality !== "safeguarding" || hasAnyPermission(userId, level.viewSummaryPermissions, pastoralCase);
  }
  return hasAnyPermission(userId, level.viewSummaryPermissions, pastoralCase);
}

export function canViewCaseDetails(userId: string, pastoralCase: PastoralCase) {
  const level = levelFor(pastoralCase.confidentiality);
  return hasAnyPermission(userId, level.viewDetailPermissions, pastoralCase);
}

export function canViewNote(userId: string, note: PastoralNote) {
  const pastoralCase = pastoralCases.find((item) => item.id === note.caseId);
  if (!pastoralCase) return false;
  if (note.visibility === "member_visible") return canViewCaseSummary(userId, pastoralCase);
  if (note.sensitivity === "safeguarding") return can(userId, "safeguarding.case.view", { tenantId: note.tenantId, ...caseScope(pastoralCase) }).allowed;
  if (note.sensitivity === "welfare_finance") return can(userId, "welfare_request.view", { tenantId: note.tenantId, ...caseScope(pastoralCase) }).allowed || can(userId, "welfare_request.manage", { tenantId: note.tenantId, ...caseScope(pastoralCase) }).allowed;
  if (note.sensitivity === "restricted" || note.sensitivity === "highly_confidential") return canViewCaseDetails(userId, pastoralCase);
  return canViewCaseSummary(userId, pastoralCase);
}

export function redactCaseForUser(pastoralCase: PastoralCase, userId: string) {
  const summaryAllowed = canViewCaseSummary(userId, pastoralCase);
  const detailsAllowed = canViewCaseDetails(userId, pastoralCase);
  return {
    ...pastoralCase,
    title: summaryAllowed ? pastoralCase.title : "Restricted pastoral case",
    summary: summaryAllowed ? pastoralCase.summary : "Restricted summary",
    restrictedNotePreview: detailsAllowed ? pastoralCase.restrictedNotePreview : undefined,
    publicSafeSummary: pastoralCase.publicSafeSummary ?? "Restricted pastoral support record",
    subjectPersonId: summaryAllowed ? pastoralCase.subjectPersonId : undefined,
    additionalPersonIds: summaryAllowed ? pastoralCase.additionalPersonIds : [],
  };
}

export function getAccessiblePastoralCases(context: PastoralContext, includeSafeguarding = false) {
  return pastoralCases
    .filter((pastoralCase) => pastoralCase.tenantId === context.tenantId)
    .filter((pastoralCase) => includeSafeguarding || pastoralCase.confidentiality !== "safeguarding")
    .filter((pastoralCase) => canViewCaseExistence(context.userId, pastoralCase))
    .map((pastoralCase) => redactCaseForUser(pastoralCase, context.userId));
}

export function searchPastoralCases(context: PastoralContext, query: string) {
  const normalized = query.trim().toLowerCase();
  return getAccessiblePastoralCases(context, can(context.userId, "safeguarding.case.view", { tenantId: context.tenantId, scopeType: "tenant" }).allowed).filter((pastoralCase) => {
    const subject = people.find((person) => person.id === pastoralCase.subjectPersonId);
    return [pastoralCase.caseNumber, pastoralCase.title, pastoralCase.summary, pastoralCase.status, pastoralCase.urgency, pastoralCase.categoryId, subject ? getPersonName(subject) : ""]
      .join(" ")
      .toLowerCase()
      .includes(normalized);
  });
}

export function getPastoralDashboardStats(context: PastoralContext) {
  const accessible = getAccessiblePastoralCases(context);
  const accessibleIds = new Set(accessible.map((item) => item.id));
  const authorizedSafeguarding = can(context.userId, "safeguarding.case.view", { tenantId: context.tenantId, scopeType: "tenant" }).allowed;
  const prayerRequestIds = new Set(prayerRequests.filter((request) => request.tenantId === context.tenantId).map((request) => request.id));
  return {
    newCareRequests: accessible.filter((item) => item.status === "new" || item.status === "triage").length,
    unassignedCases: accessible.filter((item) => !item.assignedPastorId && item.status !== "closed").length,
    urgentCases: accessible.filter((item) => ["urgent", "immediate"].includes(item.urgency)).length,
    overdueFirstResponse: caseTasks.filter((task) => accessibleIds.has(task.caseId) && task.status !== "completed" && new Date(task.dueAt) < (context.now ?? DEFAULT_NOW)).length,
    counsellingRequestsPending: counsellingAppointments.filter((appointment) => appointment.tenantId === context.tenantId && ["requested", "pending_assignment"].includes(appointment.status)).length,
    hospitalVisitsPending: pastoralVisits.filter((visit) => visit.tenantId === context.tenantId && ["requested", "assigned", "scheduled"].includes(visit.status)).length,
    bereavementSupportCases: accessible.filter((item) => item.categoryId === "cat-bereavement").length,
    welfareAssessmentsPending: welfareRequests.filter((request) => request.tenantId === context.tenantId && ["assessment", "branch_review", "higher_approval_required"].includes(request.approvalStatus)).length,
    referralsAwaitingAcceptance: pastoralReferrals.filter((referral) => referral.tenantId === context.tenantId && ["submitted", "received"].includes(referral.status)).length,
    prayerRequestsAssigned: prayerAssignments.filter((assignment) => prayerRequestIds.has(assignment.requestId)).length,
    casesClosedThisPeriod: accessible.filter((item) => item.status === "closed").length,
    safeguardingAlerts: authorizedSafeguarding ? safeguardingCases.filter((item) => item.tenantId === context.tenantId && item.status !== "closed").length : 0,
  };
}

export function getPastorWorkspace(context: PastoralContext) {
  const assignedCases = getAccessiblePastoralCases(context, true).filter((pastoralCase) => [pastoralCase.assignedPastorId, pastoralCase.assignedWorkerId, pastoralCase.supervisingPastorId].includes(context.userId));
  const caseIds = new Set(assignedCases.map((item) => item.id));
  return {
    assignedCases,
    newReferrals: pastoralReferrals.filter((referral) => referral.tenantId === context.tenantId && referral.receivingUserId === context.userId && ["submitted", "received"].includes(referral.status)),
    upcomingAppointments: counsellingAppointments.filter((appointment) => appointment.tenantId === context.tenantId && appointment.assignedCounsellorId === context.userId && ["scheduled", "confirmed"].includes(appointment.status)),
    tasksDue: caseTasks.filter((task) => task.tenantId === context.tenantId && task.assignedUserId === context.userId && task.status !== "completed"),
    visitsScheduled: pastoralVisits.filter((visit) => visit.tenantId === context.tenantId && visit.assignedVisitorId === context.userId && ["assigned", "scheduled"].includes(visit.status)),
    carePlans: carePlans.filter((plan) => caseIds.has(plan.caseId)),
    confidentialWarnings: assignedCases.filter((item) => ["restricted", "highly_confidential", "safeguarding", "welfare_finance"].includes(item.confidentiality)).length,
  };
}

export function submitPrayerRequest(input: Omit<PrayerRequest, "id" | "status" | "createdAt">) {
  return {
    ...input,
    id: `prayer-${input.tenantId}-${prayerRequests.length + 1}`,
    status: "submitted" as const,
    createdAt: "2026-07-11T13:00:00.000Z",
  };
}

export function assignPrayerTeam(requestId: string, assignedBy: string) {
  const request = prayerRequests.find((item) => item.id === requestId);
  if (!request) throw new Error("Prayer request not found");
  const team = prayerTeams.find((item) => item.tenantId === request.tenantId && item.active && item.availability !== "unavailable" && (!request.branchId || item.branchId === request.branchId) && item.categoriesHandled.includes(request.category));
  if (!team) return undefined;
  return {
    id: `prayer-assignment-${request.id}-${team.id}`,
    tenantId: request.tenantId,
    requestId: request.id,
    teamId: team.id,
    assignedBy,
    assignedAt: "2026-07-11T13:05:00.000Z",
    status: "assigned" as const,
  };
}

export function getPrayerRequestForUser(request: PrayerRequest, userId: string) {
  const assignedTeamIds = prayerAssignments.filter((assignment) => assignment.requestId === request.id).map((assignment) => assignment.teamId);
  const assignedPrayerTeam = prayerTeams.some((team) => assignedTeamIds.includes(team.id) && (team.leaderUserIds.includes(userId) || team.memberUserIds.includes(userId)));
  const manager = can(userId, "prayer_request.manage", { tenantId: request.tenantId, scopeType: request.branchId ? "branch" : "tenant", scopeId: request.branchId }).allowed;
  if (!assignedPrayerTeam && !manager) return undefined;
  const redact = request.confidentiality === "private" && !manager;
  return {
    ...request,
    details: redact ? "Private request. Pray using the approved safe summary and do not share details." : request.details,
  };
}

export function submitTestimony(input: Omit<Testimony, "id" | "status">) {
  return { ...input, id: `testimony-${input.tenantId}-${testimonies.length + 1}`, status: "submitted" as const };
}

export function reviewTestimony(testimonyId: string, reviewerUserId: string, decision: "approved" | "rejected", approvedVersion?: string) {
  const testimony = testimonies.find((item) => item.id === testimonyId);
  if (!testimony) throw new Error("Testimony not found");
  const authorized = can(reviewerUserId, "testimony.review", { tenantId: testimony.tenantId, scopeType: testimony.branchId ? "branch" : "tenant", scopeId: testimony.branchId }).allowed;
  if (!authorized) return { allowed: false, reason: "Denied: testimony review requires explicit permission." };
  if (decision === "approved" && !testimony.permissionToPublish) return { allowed: false, reason: "Denied: testimony cannot be approved for publication without explicit publication consent." };
  return { allowed: true, testimony: { ...testimony, status: decision, reviewerUserId, approvedVersion } };
}

export function createPastoralReferral(input: {
  caseId: string;
  referringUserId: string;
  direction: "upward" | "specialist" | "safeguarding" | "welfare" | "professional";
  sharedInformation: SharedInformationLevel[];
  reason: string;
}) {
  const sourceCase = pastoralCases.find((item) => item.id === input.caseId);
  if (!sourceCase) throw new Error("Pastoral case not found");
  const authorized = can(input.referringUserId, input.direction === "safeguarding" ? "safeguarding.case.refer" : "pastoral_case.refer", { tenantId: sourceCase.tenantId, ...caseScope(sourceCase) }).allowed;
  if (!authorized) return { allowed: false, reason: "Denied: referral requires scoped referral permission." };
  const receivingUserId = input.direction === "upward" ? resolveSupervisingPastor(sourceCase)?.userId : input.direction === "safeguarding" ? "user-admin" : undefined;
  return {
    allowed: true,
    referral: {
      id: `referral-${sourceCase.id}-${pastoralReferrals.length + 1}`,
      tenantId: sourceCase.tenantId,
      caseId: sourceCase.id,
      referringUserId: input.referringUserId,
      receivingUserId,
      direction: input.direction,
      reason: input.reason,
      urgency: sourceCase.urgency,
      summary: input.sharedInformation.includes("full_case_summary") ? sourceCase.summary : sourceCase.publicSafeSummary ?? "Redacted referral summary",
      sharedInformation: input.sharedInformation,
      permissionsGranted: ["pastoral_case.view_assigned"],
      consentStatus: sourceCase.consentStatus === "emergency_override" ? "emergency_override" : "granted",
      dueAt: sourceCase.nextActionDueAt ?? "2026-07-13T13:00:00.000Z",
      status: "submitted" as const,
      accessExpiresAt: "2026-07-18T13:00:00.000Z",
    },
  };
}

export function resolveSupervisingPastor(pastoralCase: PastoralCase) {
  const assigned = leadershipAssignments.find((assignment) => assignment.userId === pastoralCase.assignedPastorId && assignment.status !== "inactive");
  const supervisor = leadershipAssignments.find((assignment) => assignment.id === assigned?.reportsToAssignmentId);
  if (supervisor) return supervisor;
  const principalPosition = leadershipPositions.find((position) => position.tenantId === pastoralCase.tenantId && position.receivesReferrals && position.authorityLevel === 100);
  return leadershipAssignments.find((assignment) => assignment.positionId === principalPosition?.id);
}

export function acceptReferral(referralId: string, userId: string) {
  const referral = pastoralReferrals.find((item) => item.id === referralId);
  if (!referral) throw new Error("Referral not found");
  if (referral.receivingUserId && referral.receivingUserId !== userId) return { allowed: false, reason: "Denied: referral belongs to a different recipient." };
  return { allowed: true, referral: { ...referral, status: "accepted" as const, decision: "Accepted", nextAction: "Proceed with agreed handover or consultation." } };
}

export function createWelfareApprovalDecision(request: WelfareRequest, approverUserId: string, decision: "approved" | "declined") {
  if (request.requesterUserId === approverUserId) return { allowed: false, reason: "Denied: requester cannot approve their own welfare support." };
  const permission = request.amountRequested && request.amountRequested > 50000 ? "welfare_request.approve" : "welfare_request.manage";
  const authorized = can(approverUserId, permission, { tenantId: request.tenantId, scopeType: "tenant", amount: request.amountRequested }).allowed;
  if (!authorized) return { allowed: false, reason: `Denied: ${permission} is required for this welfare decision.` };
  const workflow = approvalWorkflows.find((item) => item.id === "workflow-welfare-support");
  return {
    allowed: true,
    workflowRequired: Boolean(workflow || (request.amountRequested && request.amountRequested > 50000)),
    request: { ...request, approvalStatus: decision, provisionStatus: decision === "approved" ? "reserved_for_finance_phase" : request.provisionStatus },
  };
}

export function getWelfareDashboard(context: PastoralContext) {
  const allowed = can(context.userId, "welfare_request.view", { tenantId: context.tenantId, scopeType: "tenant" }).allowed || can(context.userId, "welfare_request.manage", { tenantId: context.tenantId, scopeType: "tenant" }).allowed;
  if (!allowed) return { allowed: false, requests: [] as WelfareRequest[] };
  return {
    allowed: true,
    newRequests: welfareRequests.filter((request) => request.tenantId === context.tenantId && request.approvalStatus === "draft").length,
    urgentNeeds: welfareRequests.filter((request) => request.tenantId === context.tenantId && request.urgency === "urgent").length,
    assessmentsPending: welfareRequests.filter((request) => request.tenantId === context.tenantId && request.approvalStatus === "assessment").length,
    approvalsPending: welfareRequests.filter((request) => request.tenantId === context.tenantId && request.approvalStatus === "higher_approval_required").length,
    requests: welfareRequests.filter((request) => request.tenantId === context.tenantId),
  };
}

export function getPastoralReports(context: PastoralContext) {
  const cases = getAccessiblePastoralCases(context);
  const categoryCounts = pastoralCaseCategories.map((category) => ({
    category: category.name,
    count: cases.filter((pastoralCase) => pastoralCase.categoryId === category.id).length,
  }));
  return {
    categoryCounts,
    statusCounts: Array.from(new Set(cases.map((item) => item.status))).map((status) => ({ status, count: cases.filter((item) => item.status === status).length })),
    prayerStatusCounts: Array.from(new Set(prayerRequests.map((item) => item.status))).map((status) => ({ status, count: prayerRequests.filter((item) => item.status === status && item.tenantId === context.tenantId).length })),
    testimonyReviewStatus: Array.from(new Set(testimonies.map((item) => item.status))).map((status) => ({ status, count: testimonies.filter((item) => item.status === status && item.tenantId === context.tenantId).length })),
    safeguardingExcluded: true,
  };
}

export function getCaseDetail(caseId: string, context: PastoralContext) {
  const pastoralCase = pastoralCases.find((item) => item.id === caseId && item.tenantId === context.tenantId);
  if (!pastoralCase || !canViewCaseExistence(context.userId, pastoralCase)) return undefined;
  const visibleNotes = pastoralNotes.filter((note) => note.caseId === caseId && canViewNote(context.userId, note));
  const visibleTimeline = caseTimeline.filter((entry) => {
    if (entry.caseId !== caseId) return false;
    if (entry.visibility === "safeguarding_only") return can(context.userId, "safeguarding.case.view", { tenantId: context.tenantId, ...caseScope(pastoralCase) }).allowed;
    if (entry.visibility === "restricted_notes") return canViewCaseDetails(context.userId, pastoralCase);
    return canViewCaseSummary(context.userId, pastoralCase);
  });
  return {
    pastoralCase: redactCaseForUser(pastoralCase, context.userId),
    notes: visibleNotes,
    noteVersions: pastoralNoteVersions.filter((version) => visibleNotes.some((note) => note.id === version.noteId)),
    tasks: caseTasks.filter((task) => task.caseId === caseId),
    referrals: pastoralReferrals.filter((referral) => referral.caseId === caseId),
    professionalReferrals: professionalReferrals.filter((referral) => referral.caseId === caseId),
    appointments: counsellingAppointments.filter((appointment) => appointment.caseId === caseId),
    visits: pastoralVisits.filter((visit) => visit.caseId === caseId),
    timeline: visibleTimeline,
  };
}

export function closeCase(caseId: string, userId: string, closureReason: string, outcomeCategory: string) {
  const pastoralCase = pastoralCases.find((item) => item.id === caseId);
  if (!pastoralCase) throw new Error("Pastoral case not found");
  const authorized = can(userId, pastoralCase.confidentiality === "safeguarding" ? "safeguarding.case.close" : "pastoral_case.close", { tenantId: pastoralCase.tenantId, ...caseScope(pastoralCase) }).allowed;
  if (!authorized) return { allowed: false, reason: "Denied: closing this case requires closure authority." };
  if (!closureReason || !outcomeCategory) return { allowed: false, reason: "Denied: closure requires reason and outcome category." };
  return { allowed: true, case: { ...pastoralCase, status: "closed" as const, closureReason, outcomeCategory, closedAt: "2026-07-11T13:15:00.000Z" } };
}

export function reopenCase(caseId: string, userId: string, reason: string) {
  const pastoralCase = pastoralCases.find((item) => item.id === caseId);
  if (!pastoralCase) throw new Error("Pastoral case not found");
  const authorized = can(userId, "pastoral_case.reopen", { tenantId: pastoralCase.tenantId, ...caseScope(pastoralCase) }).allowed || can(userId, "pastoral_case.manage", { tenantId: pastoralCase.tenantId, ...caseScope(pastoralCase) }).allowed;
  if (!authorized) return { allowed: false, reason: "Denied: reopening this case requires reopen authority." };
  return { allowed: true, case: { ...pastoralCase, status: "reopened" as const, closureReason: pastoralCase.closureReason, nextAction: reason } };
}

export function getNotificationQueue(context: PastoralContext) {
  const workspace = getPastorWorkspace(context);
  return [
    ...workspace.newReferrals.map((referral) => ({ type: "referral_received", deepLink: `/workspace/kings-grace/pastoral-care/referrals`, safeMessage: `Referral ${referral.id} requires review.` })),
    ...workspace.tasksDue.map((task) => ({ type: "case_task_due", deepLink: `/workspace/kings-grace/pastoral-care/cases/${task.caseId}`, safeMessage: `Pastoral care task due: ${task.taskType}.` })),
  ];
}

export function describePerson(personId?: string) {
  const person = people.find((item) => item.id === personId);
  return person ? getPersonName(person) : "Anonymous or household case";
}

export function describeAssignedUser(userId?: string) {
  return profiles.find((profile) => profile.id === userId)?.fullName ?? "Unassigned";
}

export function describeBranch(branchId?: string) {
  return branches.find((branch) => branch.id === branchId)?.name ?? "No branch";
}

export function getPrayerDashboard(context: PastoralContext) {
  const managed = prayerRequests.filter((request) => getPrayerRequestForUser(request, context.userId));
  return {
    newRequests: managed.filter((request) => request.status === "submitted" || request.status === "received").length,
    unassignedRequests: managed.filter((request) => !prayerAssignments.some((assignment) => assignment.requestId === request.id)).length,
    urgentRequests: managed.filter((request) => request.urgent).length,
    dueForReview: managed.filter((request) => new Date(request.reviewAt) <= (context.now ?? DEFAULT_NOW)).length,
    followUpNeeded: managed.filter((request) => request.status === "follow_up_needed").length,
    testimonyLinked: managed.filter((request) => request.testimonyId).length,
    withdrawn: managed.filter((request) => request.status === "withdrawn").length,
    requestCount: managed.length,
  };
}

export function getConfigSummary() {
  return {
    categories: pastoralCaseCategories,
    confidentialityLevels,
    escalationExamples: [
      "Safeguarding case unaccepted for 30 minutes",
      "Hospital visit not assigned within 4 hours",
      "Counselling request pending for 3 days",
      "Welfare request overdue for 48 hours",
    ],
    anonymousMetadata: ["tenant id", "branch id", "submitted timestamp", "technical rate-limit key", "optional contact supplied by submitter"],
  };
}

export function getWelfareAssessment(requestId: string) {
  return welfareAssessments.find((assessment) => assessment.requestId === requestId);
}

export function getPrayerFollowUps(requestId: string) {
  return prayerFollowUps.filter((followUp) => followUp.requestId === requestId);
}
