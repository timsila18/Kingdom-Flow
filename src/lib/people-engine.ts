import { can } from "./authority-engine";
import { branches } from "./data";
import {
  activitySignals,
  contactAttempts,
  duplicateCandidates,
  followUpAssignments,
  followUpTasks,
  followUpWorkers,
  households,
  newConvertRecords,
  people,
  personConsents,
  transferRequests,
  visitorRecords,
} from "./people-data";
import type { ContactAttempt, LifecycleStageKey, Person } from "./people-types";
import type { PermissionKey } from "./types";

export interface PeopleContext {
  tenantId: string;
  userId: string;
  branchId?: string;
}

export function getPersonName(person: Person) {
  return [person.title, person.preferredName ?? person.firstName, person.surname].filter(Boolean).join(" ");
}

function personScope(person: Person) {
  return { scopeType: "branch" as const, scopeId: person.branchId };
}

export function canAccessPerson(userId: string, person: Person, permission: PermissionKey) {
  if (person.privacyRestrictions.includes("child_protected") && permission !== "child.view_basic" && permission !== "child.view_sensitive" && permission !== "child.manage") {
    return { allowed: false, reason: "Denied: child-protected record requires explicit child permission." };
  }
  return can(userId, permission, { tenantId: person.tenantId, ...personScope(person) });
}

export function getAccessiblePeople(context: PeopleContext, permission: PermissionKey = "people.view") {
  return people.filter((person) => {
    if (person.tenantId !== context.tenantId || person.archived) return false;
    if (person.privacyRestrictions.includes("child_protected")) {
      return canAccessPerson(context.userId, person, "child.view_basic").allowed;
    }
    return canAccessPerson(context.userId, person, permission).allowed;
  });
}

export function maskPersonForUser(person: Person, userId: string) {
  const sensitiveAllowed = person.privacyRestrictions.includes("child_protected")
    ? canAccessPerson(userId, person, "child.view_sensitive").allowed
    : canAccessPerson(userId, person, "people.view").allowed;

  return {
    ...person,
    restrictedNationalId: sensitiveAllowed ? person.restrictedNationalId : undefined,
    physicalAddress: sensitiveAllowed ? person.physicalAddress : person.physicalAddress ? "Restricted" : undefined,
    phoneNumbers: sensitiveAllowed || !person.privacyRestrictions.includes("guardian_contact_only") ? person.phoneNumbers : [],
  };
}

export function createPerson(input: Omit<Person, "id" | "createdAt" | "updatedAt" | "archived">) {
  const id = `person-${input.firstName.toLowerCase()}-${input.surname.toLowerCase()}-${people.length + 1}`;
  return {
    ...input,
    id,
    archived: false,
    createdAt: "2026-07-11T13:00:00.000Z",
    updatedAt: "2026-07-11T13:00:00.000Z",
  };
}

export function changeLifecycle(personId: string, newStage: LifecycleStageKey, reason: string, performedBy: string) {
  const person = people.find((item) => item.id === personId);
  if (!person) throw new Error("Person not found");
  return {
    id: `life-${personId}-${newStage}`,
    tenantId: person.tenantId,
    personId,
    previousStage: person.lifecycleStage,
    newStage,
    reason,
    branchId: person.branchId,
    effectiveDate: "2026-07-11",
    performedBy,
    createdAt: "2026-07-11T13:00:00.000Z",
  };
}

export function generateMemberNumber(tenantPrefix: string, existingNumbers: string[]) {
  let sequence = existingNumbers.length + 1;
  let candidate = `${tenantPrefix}-${String(sequence).padStart(6, "0")}`;
  while (existingNumbers.includes(candidate)) {
    sequence += 1;
    candidate = `${tenantPrefix}-${String(sequence).padStart(6, "0")}`;
  }
  return candidate;
}

export function detectDuplicate(input: { tenantId: string; firstName: string; surname: string; phone?: string; email?: string; dateOfBirth?: string }) {
  return people
    .filter((person) => person.tenantId === input.tenantId)
    .map((person) => {
      const signals: string[] = [];
      if (input.phone && person.phoneNumbers.includes(input.phone)) signals.push("matching phone");
      if (input.email && person.emailAddresses.includes(input.email)) signals.push("matching email");
      if (input.dateOfBirth && person.dateOfBirth === input.dateOfBirth) signals.push("matching date of birth");
      if (`${person.firstName} ${person.surname}`.toLowerCase() === `${input.firstName} ${input.surname}`.toLowerCase()) signals.push("exact name");
      return { person, signals };
    })
    .filter((match) => match.signals.length > 0);
}

export function submitVisitorForm(input: { tenantId: string; branchId: string; firstName: string; surname: string; phone?: string; email?: string; consentToContact: boolean; madeFaithDecision: boolean }) {
  const duplicates = detectDuplicate(input);
  const matchedPerson = duplicates[0]?.person;
  const person =
    matchedPerson ??
    createPerson({
      tenantId: input.tenantId,
      firstName: input.firstName,
      surname: input.surname,
      ageGroup: "unknown",
      phoneNumbers: input.phone ? [input.phone] : [],
      emailAddresses: input.email ? [input.email] : [],
      preferredContactMethod: input.phone ? "phone" : input.email ? "email" : "none",
      preferredLanguage: "en",
      branchId: input.branchId,
      communicationPreferences: input.consentToContact ? ["phone", "email"] : [],
      consentStatus: input.consentToContact ? "granted" : "withdrawn",
      privacyRestrictions: [],
      sourceOfFirstContact: "Public visitor form",
      lifecycleStage: input.madeFaithDecision ? "new_convert" : "first_time_visitor",
      relationshipStatus: input.madeFaithDecision ? "prospective" : "visitor",
      firstVisitDate: "2026-07-11",
      lastMeaningfulActivityDate: "2026-07-11",
      active: true,
      createdBy: "public-form",
      updatedBy: "public-form",
    });

  return {
    person,
    duplicateReviewRequired: duplicates.length > 0,
    visit: {
      id: `visit-${person.id}`,
      tenantId: input.tenantId,
      personId: person.id,
      branchId: input.branchId,
      visitDate: "2026-07-11",
      captureMethod: "qr" as const,
      firstEverVisit: !matchedPerson,
      returningVisitor: Boolean(matchedPerson),
      wantsFollowUp: input.consentToContact,
      madeFaithDecision: input.madeFaithDecision,
      wantsFellowship: false,
      wantsClass: input.madeFaithDecision,
      consentToContact: input.consentToContact,
    },
  };
}

export function chooseFollowUpWorker(input: { tenantId: string; branchId: string; language?: string; ageGroup?: string }) {
  const ranked = followUpWorkers
    .filter((worker) => worker.tenantId === input.tenantId && worker.active && !worker.unavailableUntil)
    .map((worker) => {
      const workload = followUpAssignments.filter((assignment) => assignment.tenantId === input.tenantId && assignment.workerUserId === worker.userId && ["pending", "accepted"].includes(assignment.status)).length;
      const branchScore = worker.preferredBranchId === input.branchId ? 2 : 0;
      const languageScore = input.language && worker.languages.includes(input.language) ? 1 : 0;
      const capacityRemaining = worker.maxActiveAssignments - workload;
      return { worker, workload, score: capacityRemaining * 10 + branchScore + languageScore };
    })
    .filter((item) => item.worker.maxActiveAssignments > item.workload)
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.worker;
}

export function registerNewConvert(personId: string) {
  const person = people.find((item) => item.id === personId);
  if (!person) throw new Error("Person not found");
  const worker = chooseFollowUpWorker({ tenantId: person.tenantId, branchId: person.branchId ?? "", language: person.preferredLanguage, ageGroup: person.ageGroup });
  return {
    record: {
      id: `convert-${personId}`,
      tenantId: person.tenantId,
      personId,
      decisionDate: "2026-07-11",
      branchId: person.branchId ?? "",
      recordedBy: "user-branch",
      preferredFollowUpMethod: person.preferredContactMethod,
      consentToFollowUp: person.consentStatus !== "withdrawn",
      assignedWorkerId: worker?.userId,
      status: worker ? "assigned" : "awaiting_assignment",
      urgency: "normal",
      requestedBaptismInfo: false,
      attendsAnotherChurch: false,
    },
    task: worker
      ? {
          id: `task-${personId}-first-contact`,
          tenantId: person.tenantId,
          personId,
          assignedUserId: worker.userId,
          taskType: "first_contact",
          description: "First contact within 24 hours",
          dueDate: "2026-07-12T13:00:00.000Z",
          priority: "normal",
          branchId: person.branchId ?? "",
          status: "pending",
        }
      : undefined,
  };
}

export function recordContactAttempt(personId: string, result: ContactAttempt["result"], attemptedBy: string) {
  const person = people.find((item) => item.id === personId);
  if (!person) throw new Error("Person not found");
  return {
    id: `contact-${personId}-${result}`,
    tenantId: person.tenantId,
    personId,
    attemptedBy,
    attemptedAt: "2026-07-11T13:30:00.000Z",
    method: person.preferredContactMethod,
    result,
    followUpNeeded: !["not_interested", "declined_contact", "wrong_number"].includes(result),
    requestedNoFurtherContact: result === "declined_contact",
  };
}

export function withdrawConsent(personId: string, consentType: ContactAttempt["method"], recordedBy: string) {
  const person = people.find((item) => item.id === personId);
  if (!person) throw new Error("Person not found");
  return {
    id: `consent-${personId}-${consentType}-withdrawn`,
    tenantId: person.tenantId,
    personId,
    consentType,
    status: "withdrawn",
    date: "2026-07-11",
    method: "privacy_preference_center",
    source: "person request",
    recordedBy,
    withdrawalDate: "2026-07-11",
  };
}

export function getEveryPersonMattersStats(tenantId: string, userId: string) {
  const scopedPeople = getAccessiblePeople({ tenantId, userId });
  const personIds = new Set(scopedPeople.map((person) => person.id));
  const tenantVisitors = visitorRecords.filter((record) => record.tenantId === tenantId && personIds.has(record.personId));
  const tenantAssignments = followUpAssignments.filter((assignment) => assignment.tenantId === tenantId && personIds.has(assignment.personId));
  const tenantTasks = followUpTasks.filter((task) => task.tenantId === tenantId && personIds.has(task.personId));
  return {
    firstTimeVisitors: tenantVisitors.filter((record) => record.firstEverVisit).length,
    returningVisitors: tenantVisitors.filter((record) => record.returningVisitor).length,
    newConverts: newConvertRecords.filter((record) => record.tenantId === tenantId && personIds.has(record.personId)).length,
    unassignedNewConverts: newConvertRecords.filter((record) => record.tenantId === tenantId && !record.assignedWorkerId).length,
    overdueAssignments: tenantAssignments.filter((assignment) => new Date(assignment.dueAt) < new Date("2026-07-11T13:00:00.000Z") && assignment.status !== "completed").length,
    firstContactsCompleted: contactAttempts.filter((attempt) => attempt.tenantId === tenantId && personIds.has(attempt.personId) && attempt.result === "reached").length,
    fellowshipRequests: tenantVisitors.filter((record) => record.wantsFellowship).length,
    classRequests: tenantVisitors.filter((record) => record.wantsClass).length,
    inactiveMembers: scopedPeople.filter((person) => person.lifecycleStage === "inactive").length,
    pendingTransfers: transferRequests.filter((request) => request.tenantId === tenantId && !["completed", "rejected", "cancelled"].includes(request.status)).length,
    duplicateReviews: duplicateCandidates.filter((candidate) => candidate.tenantId === tenantId && candidate.status === "pending_review").length,
    workersAtCapacity: followUpWorkers.filter((worker) => worker.tenantId === tenantId && followUpAssignments.filter((assignment) => assignment.workerUserId === worker.userId && ["pending", "accepted"].includes(assignment.status)).length >= worker.maxActiveAssignments).length,
    consentWithdrawals: personConsents.filter((consent) => consent.tenantId === tenantId && consent.status === "withdrawn").length,
    completedTasks: tenantTasks.filter((task) => task.status === "completed").length,
  };
}

export function searchPeople(tenantId: string, userId: string, query: string) {
  const lowered = query.toLowerCase();
  return getAccessiblePeople({ tenantId, userId }).filter((person) => {
    const household = households.find((item) => item.primaryContactPersonId === person.id);
    return [
      person.firstName,
      person.surname,
      person.preferredName,
      person.memberNumber,
      person.phoneNumbers.join(" "),
      person.emailAddresses.join(" "),
      household?.name,
      person.lifecycleStage,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(lowered);
  });
}

export function requestTransfer(personId: string, destinationBranchId: string, requestedBy: string) {
  const person = people.find((item) => item.id === personId);
  if (!person?.branchId) throw new Error("Person with source branch is required");
  return {
    id: `transfer-${personId}-${destinationBranchId}`,
    tenantId: person.tenantId,
    personId,
    sourceBranchId: person.branchId,
    destinationBranchId,
    reason: "Member-requested branch transfer",
    requestedBy,
    effectiveDate: "2026-08-01",
    status: "pending_source_approval" as const,
  };
}

export function completeTransfer(requestId: string) {
  const request = transferRequests.find((item) => item.id === requestId);
  if (!request) throw new Error("Transfer not found");
  const destination = branches.find((branch) => branch.id === request.destinationBranchId);
  return {
    ...request,
    status: "completed" as const,
    handoverTask: `Follow-up handover created for ${destination?.name ?? "destination branch"}`,
  };
}

export function mergeDuplicate(candidateId: string, survivingPersonId: string) {
  const candidate = duplicateCandidates.find((item) => item.id === candidateId);
  if (!candidate) throw new Error("Duplicate candidate not found");
  return {
    candidate: { ...candidate, status: "merged" as const },
    survivingPersonId,
    sourceIdentifierPreserved: candidate.possibleDuplicatePersonId,
  };
}

export function validateImportRows(rows: Array<Record<string, string>>, tenantBranchIds: string[]) {
  return rows.map((row, index) => {
    const errors: string[] = [];
    if (!row.firstName || !row.surname) errors.push("Name fields are required");
    if (row.branchId && !tenantBranchIds.includes(row.branchId)) errors.push("Branch does not belong to tenant");
    if (row.restrictedNationalId) errors.push("Sensitive field requires explicit mapping permission");
    return { rowNumber: index + 1, valid: errors.length === 0, errors };
  });
}

export function prepareExport(userId: string, tenantId: string, sensitive: boolean) {
  const permission = sensitive ? "people.export_sensitive" : "people.export_basic";
  const decision = can(userId, permission, { tenantId, scopeType: "tenant" });
  return {
    allowed: decision.allowed,
    reason: decision.allowed ? "Export prepared with expiring secure download metadata." : decision.reason,
    fields: sensitive ? ["name", "contact", "lifecycle", "restricted fields with approval"] : ["name", "branch", "lifecycle", "consent status"],
  };
}

export function getMonthlyActiveSignals(tenantId: string) {
  return activitySignals.filter((signal) => signal.tenantId === tenantId && signal.billableEligible);
}
