import { can } from "./authority-engine";
import { followUpAssignments, householdMembers, people } from "./people-data";
import { getPersonName } from "./people-engine";
import { rosterAssignments } from "./services-data";
import {
  accommodationAllocations,
  authorizedPickups,
  campusFellowships,
  campusTransitions,
  childCheckIns,
  childPickupAttempts,
  childrenClasses,
  eventCheckIns,
  eventIncidents,
  eventMealPlans,
  eventRegistrationCategories,
  eventRegistrations,
  eventReports,
  eventSessions,
  eventSpeakers,
  eventTeamAssignments,
  eventTickets,
  eventTypes,
  ministryEvents,
  missionApplications,
  missionDocuments,
  missionTrips,
  passengerManifests,
  safeguardingRatioRules,
  transportRoutes,
  youthMinistryRecords,
} from "./events-data";
import type { EventRegistration, MinistryEvent } from "./events-types";
import type { PermissionKey } from "./types";

export interface EventContext {
  tenantId: string;
  userId: string;
  branchId?: string;
}

function eventScope(event: MinistryEvent) {
  return { scopeType: "branch" as const, scopeId: event.branchId };
}

export function isEventTeamMember(userId: string, eventId: string, permission?: string) {
  return eventTeamAssignments.some((assignment) => assignment.eventId === eventId && assignment.userId === userId && assignment.status === "active" && (!permission || assignment.permissions.includes(permission)));
}

export function canAccessEvent(userId: string, event: MinistryEvent, permission: PermissionKey = "event.view") {
  if ([event.ownerUserId, event.coordinatorUserId, event.presidingMinisterUserId].includes(userId)) return { allowed: true, reason: "Allowed: user is assigned to this event." };
  if (isEventTeamMember(userId, event.id, permission)) return { allowed: true, reason: "Allowed: event-scoped planning team assignment." };
  return can(userId, permission, { tenantId: event.tenantId, ...eventScope(event) });
}

export function getAccessibleEvents(context: EventContext, permission: PermissionKey = "event.view") {
  return ministryEvents.filter((event) => event.tenantId === context.tenantId && canAccessEvent(context.userId, event, permission).allowed);
}

export function createEventDraft(input: Pick<MinistryEvent, "tenantId" | "branchId" | "organizationUnitId" | "eventTypeId" | "title" | "description" | "venue" | "city" | "startDate" | "endDate" | "ownerUserId" | "coordinatorUserId">) {
  const type = eventTypes.find((item) => item.id === input.eventTypeId);
  return {
    ...input,
    id: `event-${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    theme: "Draft theme",
    objectives: [],
    targetAudience: [],
    ageGroup: type?.guardianConsentRequired ? "children" as const : "all" as const,
    onlineHybridStatus: "onsite" as const,
    registrationOpenAt: `${input.startDate}T06:00:00.000Z`,
    registrationCloseAt: `${input.startDate}T20:00:00.000Z`,
    capacity: 0,
    expectedAttendance: 0,
    approvalStatus: "draft" as const,
    publicationStatus: "private" as const,
    registrationStatus: "not_open" as const,
    paymentStatus: type?.defaultTicketingMode === "free" ? "free" as const : "not_started" as const,
    safeguardingLevel: type?.safeguardingLevel ?? "standard" as const,
    securityLevel: "standard" as const,
    transportRequired: Boolean(type?.transportRequired),
    accommodationRequired: Boolean(type?.accommodationRequired),
    mealsRequired: Boolean(type?.mealRequired),
    status: "draft" as const,
  };
}

export function submitEventForApproval(eventId: string, actorUserId: string) {
  const event = ministryEvents.find((item) => item.id === eventId);
  if (!event) throw new Error("Event not found");
  const allowed = canAccessEvent(actorUserId, event, "event.update");
  if (!allowed.allowed) return allowed;
  return { allowed: true, event: { ...event, approvalStatus: "pending" as const, status: "pending_approval" as const } };
}

export function publishEvent(eventId: string, actorUserId: string) {
  const event = ministryEvents.find((item) => item.id === eventId);
  if (!event) throw new Error("Event not found");
  if (event.approvalStatus !== "approved") return { allowed: false, reason: "Event cannot publish before required approvals." };
  const readiness = getSafeguardingReadiness(eventId);
  if (event.safeguardingLevel !== "standard" && !readiness.ready) return { allowed: false, reason: readiness.gaps.join("; ") };
  const allowed = canAccessEvent(actorUserId, event, "event.publish");
  if (!allowed.allowed) return allowed;
  return { allowed: true, event: { ...event, publicationStatus: "public" as const, registrationStatus: "open" as const, status: "published" as const } };
}

export function cancelEvent(eventId: string, actorUserId: string, reason: string) {
  const event = ministryEvents.find((item) => item.id === eventId);
  if (!event) throw new Error("Event not found");
  const allowed = canAccessEvent(actorUserId, event, "event.cancel");
  if (!allowed.allowed) return allowed;
  return {
    allowed: true,
    event: { ...event, registrationStatus: "closed" as const, status: "cancelled" as const },
    registrations: eventRegistrations.filter((registration) => registration.eventId === eventId).map((registration) => ({ ...registration, status: "cancelled" as const, paymentStatus: registration.paymentStatus === "verified" ? "refund_review" as const : registration.paymentStatus })),
    notificationPreview: `Event cancelled. Refund review required where applicable. Reason: ${reason}`,
  };
}

export function calculateRegistrationTotal(categoryId: string) {
  const category = eventRegistrationCategories.find((item) => item.id === categoryId);
  if (!category) throw new Error("Category not found");
  return {
    eventFee: category.price,
    technologyFee: category.technologyFee,
    providerFee: category.providerFee,
    total: category.price + category.technologyFee + category.providerFee,
    churchAmount: category.price,
    refundPolicy: "Church-controlled refund review. No fake confirmations.",
  };
}

export function registerParticipant(input: Pick<EventRegistration, "tenantId" | "eventId" | "personId" | "categoryId" | "branchId" | "ageGroup" | "guardianPersonId" | "householdId" | "source" | "emergencyContact">) {
  const event = ministryEvents.find((item) => item.id === input.eventId);
  const category = eventRegistrationCategories.find((item) => item.id === input.categoryId);
  if (!event || !category) throw new Error("Event or category not found");
  const confirmedCount = eventRegistrations.filter((registration) => registration.eventId === input.eventId && registration.categoryId === input.categoryId && !["cancelled", "refunded"].includes(registration.status)).length;
  const isMinor = input.ageGroup === "child" || input.ageGroup === "teen";
  if (isMinor && !input.guardianPersonId) return { accepted: false, status: "blocked", reason: "Guardian consent is required for minor registration." };
  if (confirmedCount >= category.capacity) return { accepted: true, status: "waitlisted", reason: "Category capacity reached; registration placed on waitlist." };
  const fee = calculateRegistrationTotal(input.categoryId);
  return {
    accepted: true,
    registration: {
      ...input,
      id: `ereg-${input.eventId}-${input.personId}`,
      paymentStatus: fee.total > 0 ? "pending" as const : "free" as const,
      checkInStatus: "not_checked_in" as const,
      attendanceStatus: "registered" as const,
      status: fee.total > 0 ? "pending_payment" as const : category.approvalRequired ? "pending_approval" as const : "confirmed" as const,
    },
  };
}

export function issueTicket(registrationId: string, actorUserId: string) {
  const registration = eventRegistrations.find((item) => item.id === registrationId);
  if (!registration) throw new Error("Registration not found");
  const event = ministryEvents.find((item) => item.id === registration.eventId);
  if (!event) throw new Error("Event not found");
  const allowed = canAccessEvent(actorUserId, event, "event.ticket.issue");
  if (!allowed.allowed) return allowed;
  if (!["confirmed", "checked_in"].includes(registration.status) && registration.paymentStatus !== "verified" && registration.paymentStatus !== "free") return { allowed: false, reason: "Ticket cannot be issued before confirmation or verified/free payment." };
  return { allowed: true, ticket: { id: `ticket-${registration.id}`, tenantId: registration.tenantId, eventId: registration.eventId, registrationId, code: `KFE-${registration.id.toUpperCase()}`, qrPayload: `event:${registration.eventId}:${registration.id}`, accessLevel: registration.ageGroup === "child" ? "child" as const : "full_event" as const, issuedAt: new Date("2026-07-12T09:00:00.000Z").toISOString(), expiresAt: event.endDate, transferPolicy: "not_transferable" as const, status: "issued" as const } };
}

export function scanTicket(code: string, actorUserId: string) {
  const ticket = eventTickets.find((item) => item.code === code);
  if (!ticket) return { allowed: false, status: "denied", reason: "Ticket not found." };
  const event = ministryEvents.find((item) => item.id === ticket.eventId);
  if (!event) throw new Error("Event not found");
  const allowed = canAccessEvent(actorUserId, event, "event.check_in");
  if (!allowed.allowed) return allowed;
  const duplicate = eventCheckIns.some((checkIn) => checkIn.registrationId === ticket.registrationId && checkIn.status === "accepted");
  if (duplicate) return { allowed: true, status: "duplicate", reason: "Already checked in; mark as re-entry if policy allows." };
  return { allowed: true, status: "accepted", checkIn: { id: `ecin-${ticket.registrationId}`, tenantId: ticket.tenantId, eventId: ticket.eventId, registrationId: ticket.registrationId, checkedAt: new Date("2026-08-21T17:00:00.000Z").toISOString(), gate: "Main Gate", checkedByUserId: actorUserId, method: "qr" as const, reEntry: false, status: "accepted" as const } };
}

export function getCheckInRecordForVolunteer(registrationId: string) {
  const registration = eventRegistrations.find((item) => item.id === registrationId);
  if (!registration) return undefined;
  const person = people.find((item) => item.id === registration.personId);
  return {
    registrationId: registration.id,
    displayName: person ? getPersonName(person) : "Participant",
    category: eventRegistrationCategories.find((item) => item.id === registration.categoryId)?.name,
    checkInStatus: registration.checkInStatus,
    ticketCode: eventTickets.find((item) => item.registrationId === registrationId)?.code,
    privateProfileHidden: true,
  };
}

export function assignAccommodation(registrationId: string, room: string) {
  const registration = eventRegistrations.find((item) => item.id === registrationId);
  if (!registration) throw new Error("Registration not found");
  const person = people.find((item) => item.id === registration.personId);
  const isMinor = person?.ageGroup === "child" || person?.ageGroup === "youth";
  if (isMinor && !registration.guardianPersonId) return { assigned: false, reason: "Minor accommodation requires guardian linkage and restricted review." };
  return { assigned: true, allocation: { id: `eacc-${registrationId}`, tenantId: registration.tenantId, eventId: registration.eventId, registrationId, site: "Assigned site", room, bed: "1", familyGrouping: Boolean(registration.householdId), minorSafeguardingStatus: isMinor ? "guardian_linked" as const : "not_minor" as const, status: "assigned" as const } };
}

export function boardPassenger(routeId: string, registrationId: string) {
  const route = transportRoutes.find((item) => item.id === routeId);
  if (!route) throw new Error("Route not found");
  const boarded = passengerManifests.filter((item) => item.routeId === routeId && item.boarded).length;
  if (boarded >= route.capacity) return { boarded: false, reason: "Vehicle capacity reached." };
  return { boarded: true, manifest: { id: `eman-${routeId}-${registrationId}`, tenantId: route.tenantId, routeId, registrationId, boarded: true, disembarked: false, childStatus: "not_child" as const, emergencyContact: "Restricted manifest contact" } };
}

export function validateChildPickup(childCheckInId: string, attemptedByPersonId: string, codePresented: string) {
  const checkIn = childCheckIns.find((item) => item.id === childCheckInId);
  if (!checkIn) throw new Error("Child check-in not found");
  const authorization = authorizedPickups.find((item) => item.childPersonId === checkIn.childPersonId && item.authorizedPersonId === attemptedByPersonId && item.pickupCode === codePresented);
  if (!authorization) {
    return { allowed: false, attempt: { id: `pickattempt-${childCheckInId}`, tenantId: checkIn.tenantId, childCheckInId, attemptedByPersonId, codePresented, successful: false, reason: "Unauthorized pickup blocked and logged.", recordedByUserId: "user-admin" } };
  }
  return { allowed: true, checkout: { childCheckInId, childPersonId: checkIn.childPersonId, checkedOutAt: "2026-08-01T12:10:00.000Z", releasedToPersonId: attemptedByPersonId, recordedByUserId: "user-admin" } };
}

export function getSafeguardingReadiness(eventId: string) {
  const event = ministryEvents.find((item) => item.id === eventId);
  if (!event) throw new Error("Event not found");
  const relevantClasses = childrenClasses.filter((item) => item.eventId === eventId);
  const teacherCount = relevantClasses.reduce((sum, item) => sum + item.teacherUserIds.length, 0);
  const rule = safeguardingRatioRules.find((item) => relevantClasses.some((klass) => klass.safeguardingRuleId === item.id));
  const gaps: string[] = [];
  if (event.safeguardingLevel !== "standard" && !isEventTeamMember(event.ownerUserId, eventId) && !eventTeamAssignments.some((item) => item.eventId === eventId && item.role.toLowerCase().includes("safeguarding"))) gaps.push("Safeguarding lead is required.");
  if (rule?.twoAdultRule && teacherCount < rule.minimumAdults) gaps.push("Two-adult/minimum volunteer rule is not satisfied.");
  if (event.ageGroup === "children" && relevantClasses.length === 0) gaps.push("Children's class setup is required.");
  return { ready: gaps.length === 0, gaps, teacherCount, rule };
}

export function redactEventIncident(incidentId: string, userId: string) {
  const incident = eventIncidents.find((item) => item.id === incidentId);
  if (!incident) return undefined;
  const allowed = can(userId, "event.safeguarding.manage", { tenantId: incident.tenantId, scopeType: "branch", scopeId: ministryEvents.find((event) => event.id === incident.eventId)?.branchId }).allowed;
  return { ...incident, restrictedDetails: allowed ? incident.restrictedDetails : undefined, summary: incident.routedToSafeguarding && !allowed ? "Restricted safeguarding or pickup incident routed securely." : incident.summary };
}

export function captureOutreachContact(contact: { tenantId: string; campaignId: string; name: string; phone?: string; consent: boolean; churchInterest: boolean; programmeInterest: boolean; fellowshipInterest: boolean; newConvertStatus: "none" | "recorded" | "follow_up_needed" }) {
  if (!contact.consent) return { accepted: false, reason: "Consent is required before follow-up contact is assigned." };
  const duplicate = people.find((person) => contact.phone && person.phoneNumbers.includes(contact.phone));
  return {
    accepted: true,
    contact: { id: `ocontact-${contact.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, location: "Captured outreach location", preferredContact: "phone", status: duplicate ? "duplicate_review" as const : "assigned_follow_up" as const, ...contact },
    duplicatePersonId: duplicate?.id,
    followUpTask: contact.newConvertStatus !== "none" ? "Create Prompt 3 follow-up assignment" : "No new-convert follow-up requested",
  };
}

export function approveMissionApplication(applicationId: string, actorUserId: string) {
  const application = missionApplications.find((item) => item.id === applicationId);
  if (!application) throw new Error("Application not found");
  const trip = missionTrips.find((item) => item.id === application.missionTripId);
  if (!trip) throw new Error("Mission trip not found");
  const allowed = can(actorUserId, "mission.manage", { tenantId: trip.tenantId, scopeType: "branch", scopeId: trip.branchId });
  if (!allowed.allowed) return allowed;
  if (application.pastoralRecommendationStatus !== "approved") return { allowed: false, reason: "Mission applications require pastoral recommendation before approval." };
  return { allowed: true, application: { ...application, approvalStatus: "approved" as const, readinessStatus: "ready" as const } };
}

export function canAccessMissionDocument(documentId: string, userId: string) {
  const document = missionDocuments.find((item) => item.id === documentId);
  if (!document) return { allowed: false, reason: "Document not found." };
  if (!document.restricted) return { allowed: true, reason: "Unrestricted mission document." };
  return can(userId, "mission.manage", { tenantId: document.tenantId, scopeType: "branch", scopeId: missionTrips.find((trip) => trip.id === document.missionTripId)?.branchId });
}

export function getEventDashboard(context: EventContext) {
  const accessible = getAccessibleEvents(context);
  const eventIds = new Set(accessible.map((event) => event.id));
  return {
    upcomingEvents: accessible.filter((event) => ["published", "registration_open", "pending_approval"].includes(event.status)).length,
    registrations: eventRegistrations.filter((registration) => eventIds.has(registration.eventId)).length,
    checkedIn: eventRegistrations.filter((registration) => eventIds.has(registration.eventId) && registration.checkInStatus === "checked_in").length,
    volunteerGaps: accessible.filter((event) => event.transportRequired || event.mealsRequired).length - rosterAssignments.length,
    safeguardingGaps: accessible.filter((event) => !getSafeguardingReadiness(event.id).ready).length,
    transportReady: transportRoutes.filter((route) => eventIds.has(route.eventId)).length,
    accommodationReady: accommodationAllocations.filter((allocation) => eventIds.has(allocation.eventId)).length,
    incidents: eventIncidents.filter((incident) => eventIds.has(incident.eventId)).length,
    followUp: eventReports.flatMap((report) => eventIds.has(report.eventId) ? report.followUpActions : []).length,
  };
}

export function getEventReports(context: EventContext) {
  const eventIds = new Set(getAccessibleEvents(context).map((event) => event.id));
  return {
    eventRegister: ministryEvents.filter((event) => eventIds.has(event.id)),
    registrations: eventRegistrations.filter((registration) => eventIds.has(registration.eventId)),
    tickets: eventTickets.filter((ticket) => eventIds.has(ticket.eventId)),
    checkIns: eventCheckIns.filter((checkIn) => eventIds.has(checkIn.eventId)),
    sessions: eventSessions.filter((session) => eventIds.has(session.eventId)),
    volunteerCoverage: eventTeamAssignments.filter((assignment) => eventIds.has(assignment.eventId)),
    transportManifests: passengerManifests,
    accommodation: accommodationAllocations.filter((allocation) => eventIds.has(allocation.eventId)),
    meals: eventMealPlans.filter((meal) => eventIds.has(meal.eventId)),
    speakers: eventSpeakers.filter((speaker) => eventIds.has(speaker.eventId)).map((speaker) => ({ ...speaker, restrictedContact: undefined })),
    incidents: eventIncidents.filter((incident) => eventIds.has(incident.eventId)).map((incident) => ({ ...incident, restrictedDetails: undefined })),
    followUpAssignments,
  };
}

export function getChildrenDashboard() {
  return {
    checkedInChildren: childCheckIns.filter((item) => item.status === "present").length,
    collectionPending: childCheckIns.filter((item) => item.status === "present").length,
    pickupIssues: childPickupAttempts.filter((item) => !item.successful).length,
    volunteerRatio: getSafeguardingReadiness("event-child-2026"),
    incidents: eventIncidents.filter((item) => item.category === "pickup_issue").length,
    guardianLinksMissing: people.filter((person) => person.ageGroup === "child" && !householdMembers.some((member) => member.personId === person.id && member.guardianForPersonId === person.id)).length,
    upcomingClasses: childrenClasses.filter((item) => item.status === "active").length,
  };
}

export function getYouthDashboard() {
  return {
    activeRecords: youthMinistryRecords.filter((item) => item.status === "active").length,
    programmeInvites: youthMinistryRecords.flatMap((item) => item.programmeIds).length,
    campEvents: ministryEvents.filter((item) => item.ageGroup === "youth").length,
    mentorship: youthMinistryRecords.filter((item) => item.mentorUserId).length,
    campusTransitions: campusTransitions.filter((item) => item.status === "pending").length,
  };
}

export function getCampusDashboard() {
  return {
    activeFellowships: campusFellowships.filter((item) => item.status === "active").length,
    studentLeaders: new Set(campusFellowships.map((item) => item.studentLeaderUserId)).size,
    transitions: campusTransitions.length,
    newConverts: youthMinistryRecords.filter((item) => item.nextStep.toLowerCase().includes("foundation")).length,
  };
}

export function getPublicEventPage(eventId: string) {
  const event = ministryEvents.find((item) => item.id === eventId);
  if (!event || event.publicationStatus !== "public") return undefined;
  return {
    event,
    schedule: eventSessions.filter((session) => session.eventId === eventId && session.status !== "cancelled"),
    speakers: eventSpeakers.filter((speaker) => speaker.eventId === eventId).map((speaker) => ({ name: speaker.name, title: speaker.title, organization: speaker.organization, publicBio: speaker.publicBio })),
    categories: eventRegistrationCategories.filter((category) => category.eventId === eventId).map((category) => ({ ...category, total: calculateRegistrationTotal(category.id).total })),
    privacyNotice: "Only approved public content is shown. Registration data, child details and incident records remain private.",
  };
}
