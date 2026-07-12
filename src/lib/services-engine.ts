import { can } from "./authority-engine";
import { people } from "./people-data";
import { getPersonName } from "./people-engine";
import {
  departments,
  equipmentChecklistItems,
  mediaRequests,
  recurringServiceSchedules,
  rehearsals,
  replacementRequests,
  rosterAssignments,
  rosterConflicts,
  serviceIncidents,
  servicePlanItems,
  serviceReports,
  services,
  serviceTemplates,
  serviceTypes,
  volunteerApplications,
  volunteerAvailability,
  volunteerCheckIns,
  volunteerProfiles,
} from "./services-data";
import type { ChurchService, RosterAssignment } from "./services-types";
import type { PermissionKey } from "./types";

export interface ServiceContext {
  tenantId: string;
  userId: string;
  branchId?: string;
}

function serviceScope(service: ChurchService) {
  return { scopeType: "branch" as const, scopeId: service.branchId };
}

function isAssignedServiceUser(userId: string, service: ChurchService) {
  return [service.presidingMinisterUserId, service.preacherUserId, service.serviceCoordinatorUserId, service.worshipLeaderUserId, service.branchPastorUserId].includes(userId);
}

export function canAccessService(userId: string, service: ChurchService, permission: PermissionKey = "service.view") {
  if (isAssignedServiceUser(userId, service)) return { allowed: true, reason: "Allowed: user is assigned to this service." };
  return can(userId, permission, { tenantId: service.tenantId, ...serviceScope(service) });
}

export function getAccessibleServices(context: ServiceContext, permission: PermissionKey = "service.view") {
  return services.filter((service) => service.tenantId === context.tenantId && canAccessService(context.userId, service, permission).allowed);
}

export function generateServiceInstance(scheduleId: string, date: string) {
  const schedule = recurringServiceSchedules.find((item) => item.id === scheduleId);
  if (!schedule) throw new Error("Schedule not found");
  if (schedule.pausedDates.includes(date)) return { created: false, reason: "Schedule paused for this date." };
  const duplicate = services.find((service) => service.branchId === schedule.branchId && service.serviceTypeId === schedule.serviceTypeId && service.serviceDate === date);
  if (duplicate) return { created: false, reason: "Service instance already exists.", service: duplicate };
  const type = serviceTypes.find((item) => item.id === schedule.serviceTypeId);
  return { created: true, service: { id: `service-${schedule.branchId}-${date}`, tenantId: schedule.tenantId, branchId: schedule.branchId, serviceTypeId: schedule.serviceTypeId, title: type?.displayName ?? "Service", serviceDate: date } };
}

export function applyServiceTemplate(serviceId: string, templateId: string) {
  const service = services.find((item) => item.id === serviceId);
  const template = serviceTemplates.find((item) => item.id === templateId);
  if (!service || !template) throw new Error("Service or template not found");
  return template.defaultItems.map((title, index) => ({ title, serviceId, templateVersion: template.version, sortOrder: index + 1 }));
}

export function reorderPlanItem(serviceId: string, itemId: string, newOrder: number) {
  const items = servicePlanItems.filter((item) => item.serviceId === serviceId).sort((a, b) => a.sortOrder - b.sortOrder);
  const moving = items.find((item) => item.id === itemId);
  if (!moving) return items;
  const remaining = items.filter((item) => item.id !== itemId);
  const targetIndex = Math.max(0, Math.min(newOrder - 1, remaining.length));
  const reordered = [...remaining.slice(0, targetIndex), { ...moving, status: "changed" as const }, ...remaining.slice(targetIndex)];
  return reordered.map((item, index) => ({ ...item, sortOrder: index + 1 }));
}

export function wouldCreateDepartmentCycle(departmentId: string, proposedParentId?: string): boolean {
  if (!proposedParentId) return false;
  if (departmentId === proposedParentId) return true;
  let cursor = departments.find((department) => department.id === proposedParentId);
  while (cursor) {
    if (cursor.parentDepartmentId === departmentId) return true;
    cursor = departments.find((department) => department.id === cursor?.parentDepartmentId);
  }
  return false;
}

export function getVolunteerName(profileId: string) {
  const profile = volunteerProfiles.find((item) => item.id === profileId);
  const person = people.find((item) => item.id === profile?.personId);
  return person ? getPersonName(person) : "Volunteer";
}

export function detectRosterConflicts(assignment: RosterAssignment) {
  const profile = volunteerProfiles.find((item) => item.id === assignment.volunteerProfileId);
  const availability = volunteerAvailability.find((item) => item.volunteerProfileId === assignment.volunteerProfileId);
  const service = services.find((item) => item.id === assignment.serviceId);
  const conflicts = rosterConflicts.filter((item) => item.rosterAssignmentId === assignment.id);
  if (service && availability?.unavailableDates.includes(service.serviceDate)) {
    conflicts.push({ id: `conflict-${assignment.id}-unavailable`, tenantId: assignment.tenantId, rosterAssignmentId: assignment.id, conflictType: "unavailable", explanation: `${getVolunteerName(assignment.volunteerProfileId)} is unavailable on ${service.serviceDate}.`, severity: "blocking" });
  }
  if (profile && !profile.departmentIds.includes(assignment.departmentId)) {
    conflicts.push({ id: `conflict-${assignment.id}-department`, tenantId: assignment.tenantId, rosterAssignmentId: assignment.id, conflictType: "wrong_branch", explanation: "Volunteer is not assigned to this department.", severity: "warning" });
  }
  return conflicts;
}

export function suggestRoster(serviceId: string, departmentId: string) {
  const service = services.find((item) => item.id === serviceId);
  if (!service) throw new Error("Service not found");
  return volunteerProfiles.filter((profile) => profile.branchId === service.branchId && profile.departmentIds.includes(departmentId) && profile.active && !profile.temporaryUnavailableUntil);
}

export function publishRoster(serviceId: string, actorUserId: string) {
  const service = services.find((item) => item.id === serviceId);
  if (!service) throw new Error("Service not found");
  if (service.approvalStatus !== "approved") return { allowed: false, reason: "Roster cannot publish before service approval." };
  const allowed = canAccessService(actorUserId, service, "roster.publish");
  if (!allowed.allowed) return allowed;
  const blockers = rosterAssignments.filter((assignment) => assignment.serviceId === serviceId).flatMap(detectRosterConflicts).filter((conflict) => conflict.severity === "blocking");
  return blockers.length ? { allowed: false, reason: blockers.map((item) => item.explanation).join("; ") } : { allowed: true, notification: "Roster published with safe assignment notifications." };
}

export function requestReplacement(assignmentId: string, reason: string) {
  const assignment = rosterAssignments.find((item) => item.id === assignmentId);
  if (!assignment) throw new Error("Assignment not found");
  return { id: `replace-${assignmentId}`, tenantId: assignment.tenantId, originalAssignmentId: assignmentId, requestedByProfileId: assignment.volunteerProfileId, reason, status: "requested" as const };
}

export function eligibleReplacements(assignmentId: string) {
  const assignment = rosterAssignments.find((item) => item.id === assignmentId);
  if (!assignment) throw new Error("Assignment not found");
  return suggestRoster(assignment.serviceId, assignment.departmentId).filter((profile) => profile.id !== assignment.volunteerProfileId);
}

export function redactIncidentForUser(incidentId: string, userId: string) {
  const incident = serviceIncidents.find((item) => item.id === incidentId);
  if (!incident) return undefined;
  const canViewRestricted = can(userId, "service.incident.manage", { tenantId: incident.tenantId, scopeType: "branch", scopeId: incident.branchId }).allowed;
  return { ...incident, restrictedNotes: canViewRestricted ? incident.restrictedNotes : undefined, summary: incident.category === "child_safeguarding" && !canViewRestricted ? "Restricted safeguarding incident routed to care system." : incident.summary };
}

export function submitServiceReport(reportId: string, userId: string) {
  const report = serviceReports.find((item) => item.id === reportId);
  if (!report) throw new Error("Report not found");
  const service = services.find((item) => item.id === report.serviceId);
  if (!service) throw new Error("Service not found");
  const allowed = canAccessService(userId, service, "service.report.create");
  if (!allowed.allowed) return allowed;
  return { allowed: true, report: { ...report, status: "submitted" as const, submittedByUserId: userId } };
}

export function reviewServiceReport(reportId: string, reviewerUserId: string, decision: "approved" | "reviewed") {
  const report = serviceReports.find((item) => item.id === reportId);
  if (!report) throw new Error("Report not found");
  if (report.submittedByUserId === reviewerUserId && decision === "approved") return { allowed: false, reason: "Denied: report submitters cannot self-approve." };
  const service = services.find((item) => item.id === report.serviceId);
  if (!service) throw new Error("Service not found");
  const allowed = canAccessService(reviewerUserId, service, decision === "approved" ? "service.report.approve" : "service.report.review");
  if (!allowed.allowed) return allowed;
  return { allowed: true, report: { ...report, status: decision === "approved" ? "locked" as const : "reviewed" as const, reviewedByUserId: reviewerUserId } };
}

export function getServiceCoordinatorWorkspace(context: ServiceContext) {
  const accessible = getAccessibleServices(context);
  const serviceIds = new Set(accessible.map((service) => service.id));
  return {
    upcomingServices: accessible.filter((service) => ["published", "scheduled"].includes(service.status)),
    rosterGaps: rosterConflicts.filter((conflict) => conflict.severity !== "info").length,
    pendingMedia: mediaRequests.filter((request) => serviceIds.has(request.serviceId) && !["completed", "cancelled"].includes(request.status)),
    equipmentIssues: equipmentChecklistItems.filter((item) => serviceIds.has(item.serviceId) && item.readinessStatus !== "ready"),
    incidents: serviceIncidents.filter((incident) => serviceIds.has(incident.serviceId)).map((incident) => redactIncidentForUser(incident.id, context.userId)),
    reportsDue: accessible.filter((service) => service.reportStatus !== "locked"),
  };
}

export function getDepartmentDashboard(departmentId: string) {
  const department = departments.find((item) => item.id === departmentId);
  if (!department) throw new Error("Department not found");
  return {
    upcomingServices: services.filter((service) => service.branchId === department.branchId),
    rosterAssignments: rosterAssignments.filter((assignment) => assignment.departmentId === departmentId),
    confirmationsPending: rosterAssignments.filter((assignment) => assignment.departmentId === departmentId && assignment.confirmation === "pending").length,
    rehearsals: rehearsals.filter((rehearsal) => rehearsal.serviceId && department.id === "dept-worship"),
    equipmentIssues: equipmentChecklistItems.filter((item) => item.departmentId === departmentId && item.readinessStatus !== "ready"),
  };
}

export function getVolunteerPortal(profileId: string) {
  return {
    assignments: rosterAssignments.filter((assignment) => assignment.volunteerProfileId === profileId),
    replacementRequests: replacementRequests.filter((request) => request.requestedByProfileId === profileId),
    checkIns: volunteerCheckIns.filter((checkIn) => rosterAssignments.some((assignment) => assignment.id === checkIn.rosterAssignmentId && assignment.volunteerProfileId === profileId)),
    availability: volunteerAvailability.find((item) => item.volunteerProfileId === profileId),
  };
}

export function getServiceReports(context: ServiceContext) {
  const serviceIds = new Set(getAccessibleServices(context).map((service) => service.id));
  return {
    schedule: services.filter((service) => serviceIds.has(service.id)),
    orderTiming: servicePlanItems.filter((item) => serviceIds.has(item.serviceId)).map((item) => ({ title: item.title, duration: item.durationMinutes, status: item.status })),
    rosterCoverage: rosterAssignments.filter((assignment) => serviceIds.has(assignment.serviceId)),
    volunteerAttendance: volunteerCheckIns,
    replacements: replacementRequests,
    rehearsalReadiness: rehearsals.filter((rehearsal) => serviceIds.has(rehearsal.serviceId)),
    equipmentIssues: equipmentChecklistItems.filter((item) => serviceIds.has(item.serviceId) && item.readinessStatus !== "ready"),
    incidents: serviceIncidents.filter((incident) => serviceIds.has(incident.serviceId)).map((incident) => ({ ...incident, restrictedNotes: undefined })),
    attendanceSummary: serviceReports.filter((report) => serviceIds.has(report.serviceId)).map((report) => report.attendanceSummary),
  };
}

export function getServiceDashboard(context: ServiceContext) {
  const accessible = getAccessibleServices(context);
  const serviceIds = new Set(accessible.map((service) => service.id));
  return {
    upcomingServices: accessible.filter((service) => ["published", "scheduled"].includes(service.status)).length,
    rosterGaps: rosterConflicts.filter((conflict) => conflict.severity !== "info").length,
    volunteersConfirmed: rosterAssignments.filter((assignment) => serviceIds.has(assignment.serviceId) && assignment.confirmation === "confirmed").length,
    serviceReportsPending: accessible.filter((service) => !["approved", "locked"].includes(service.reportStatus)).length,
    firstTimers: serviceReports.reduce((sum, report) => serviceIds.has(report.serviceId) ? sum + report.attendanceSummary.firstTimers : sum, 0),
    newConverts: serviceReports.reduce((sum, report) => serviceIds.has(report.serviceId) ? sum + report.attendanceSummary.newConverts : sum, 0),
    equipmentIssues: equipmentChecklistItems.filter((item) => serviceIds.has(item.serviceId) && item.readinessStatus !== "ready").length,
    postServiceActions: serviceReports.flatMap((report) => serviceIds.has(report.serviceId) ? report.nextActions : []).length,
  };
}

export function getVolunteerEligibility(applicationId: string) {
  const application = volunteerApplications.find((item) => item.id === applicationId);
  if (!application) throw new Error("Application not found");
  const profile = volunteerProfiles.find((item) => item.personId === application.personId);
  const missing: string[] = [];
  if (!profile) missing.push("Volunteer profile required");
  for (const training of application.requiredTraining) {
    if (profile?.inductionStatus !== "completed") missing.push(training);
  }
  return { eligible: missing.length === 0, missing, note: "Completion of a programme never automatically activates a volunteer or appoints a leader." };
}
