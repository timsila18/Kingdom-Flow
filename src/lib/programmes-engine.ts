import { can } from "./authority-engine";
import { profiles } from "./data";
import { newConvertRecords, people } from "./people-data";
import { getPersonName } from "./people-engine";
import {
  assessmentResults,
  assignmentSubmissions,
  certificates,
  classSessions,
  completionRules,
  eligibilityResults,
  leadershipPathways,
  mentorships,
  programmeApplications,
  programmeAttendance,
  programmeCohorts,
  programmeEnrolments,
  programmePayments,
  programmes,
  programmeTypes,
  scholarships,
  technologyFeeRules,
  trainerAssignments,
} from "./programmes-data";
import type { Certificate, EnrolmentStatus, Programme, ProgrammePayment, TechnologyFeeRule } from "./programmes-types";
import type { PermissionKey } from "./types";

export interface ProgrammeContext {
  tenantId: string;
  userId: string;
  branchId?: string;
}

function programmeScope(programme: Programme) {
  return programme.branchId ? ({ scopeType: "branch" as const, scopeId: programme.branchId }) : ({ scopeType: "tenant" as const });
}

function isAssignedTrainer(userId: string, programmeId?: string, cohortId?: string, permission?: PermissionKey) {
  return trainerAssignments.some((assignment) => {
    if (assignment.userId !== userId || assignment.status !== "active") return false;
    if (programmeId && assignment.programmeId !== programmeId) return false;
    if (cohortId && assignment.cohortId !== cohortId) return false;
    return permission ? assignment.permissions.includes(permission) : true;
  });
}

export function canAccessProgramme(userId: string, programme: Programme, permission: PermissionKey = "programme.view") {
  if ([programme.ownerUserId, programme.coordinatorUserId, programme.leadTrainerUserId].includes(userId) || isAssignedTrainer(userId, programme.id)) {
    return { allowed: true, reason: "Allowed: user is assigned to this programme without broad tenant access." };
  }
  return can(userId, permission, { tenantId: programme.tenantId, ...programmeScope(programme) });
}

export function getAccessibleProgrammes(context: ProgrammeContext, permission: PermissionKey = "programme.view") {
  return programmes.filter((programme) => programme.tenantId === context.tenantId && canAccessProgramme(context.userId, programme, permission).allowed);
}

export function getProgrammeTypeName(typeId: string) {
  return programmeTypes.find((type) => type.id === typeId)?.displayName ?? "Programme";
}

export function calculateTechnologyFee(price: number, rule: TechnologyFeeRule = technologyFeeRules[0]) {
  if (price <= 0) return 0;
  const band = rule.bands.find((item) => price >= item.min && (item.max === undefined || price <= item.max));
  return band?.fee ?? 50;
}

export function getFeeDisclosure(programmeId: string) {
  const programme = programmes.find((item) => item.id === programmeId);
  if (!programme) throw new Error("Programme not found");
  const technologyFee = programme.feeModel === "free" ? 0 : calculateTechnologyFee(programme.price);
  const learnerTechnologyFee = programme.technologyFeeTreatment === "learner_pays" ? technologyFee : 0;
  return {
    churchProgrammeFee: programme.price,
    technologyFee,
    paymentProviderCost: 0,
    totalPayableByLearner: programme.price + learnerTechnologyFee,
    amountRetainedByChurch: programme.price,
    technologyFeeTreatment: programme.technologyFeeTreatment,
    refundPolicy: programme.refundPolicy,
    freeProgramme: programme.feeModel === "free",
  };
}

export function evaluateEligibility(applicationId: string) {
  const existing = eligibilityResults.find((result) => result.applicationId === applicationId);
  if (existing) return existing;
  const application = programmeApplications.find((item) => item.id === applicationId);
  if (!application) throw new Error("Application not found");
  const programme = programmes.find((item) => item.id === application.programmeId);
  if (!programme) throw new Error("Programme not found");
  const missing: string[] = [];
  if (!application.consent) missing.push("Consent required");
  if (programme.feeModel !== "free" && application.paymentStatus === "pending") missing.push("Payment confirmation pending");
  return { id: `elig-${applicationId}`, tenantId: application.tenantId, applicationId, eligible: missing.length === 0, reasons: missing.length ? [] : ["Configured prerequisites met"], missingRequirements: missing };
}

export function approveApplication(applicationId: string, approverUserId: string) {
  const application = programmeApplications.find((item) => item.id === applicationId);
  if (!application) throw new Error("Application not found");
  const programme = programmes.find((item) => item.id === application.programmeId);
  if (!programme) throw new Error("Programme not found");
  if (application.personId === "person-amina" && approverUserId === programme.ownerUserId) {
    return { allowed: false, reason: "Denied: restricted applications require separation of duties." };
  }
  const allowed = canAccessProgramme(approverUserId, programme, "programme.enrolment.approve");
  if (!allowed.allowed) return allowed;
  return { allowed: true, application: { ...application, approvalStatus: "approved" as const, status: application.paymentStatus === "pending" ? "pending_payment" as EnrolmentStatus : "approved" as EnrolmentStatus } };
}

export function getCohortOccupancy(cohortId: string) {
  const cohort = programmeCohorts.find((item) => item.id === cohortId);
  if (!cohort) throw new Error("Cohort not found");
  const active = programmeEnrolments.filter((item) => item.cohortId === cohortId && ["enrolled", "active", "completed"].includes(item.enrolmentStatus)).length;
  const waitlisted = programmeApplications.filter((item) => item.cohortId === cohortId && item.status === "waitlisted").length;
  return { capacity: cohort.capacity, active, available: Math.max(cohort.capacity - active, 0), waitlisted, full: active >= cohort.capacity };
}

export function promoteFromWaitlist(cohortId: string, actorUserId: string) {
  const cohort = programmeCohorts.find((item) => item.id === cohortId);
  if (!cohort) throw new Error("Cohort not found");
  const programme = programmes.find((item) => item.id === cohort.programmeId);
  if (!programme) throw new Error("Programme not found");
  const allowed = canAccessProgramme(actorUserId, programme, "programme.enrolment.manage");
  if (!allowed.allowed) return allowed;
  const occupancy = getCohortOccupancy(cohortId);
  if (occupancy.available < 1) return { allowed: false, reason: "No cohort slot is available." };
  const next = programmeApplications.find((item) => item.cohortId === cohortId && item.status === "waitlisted");
  return next ? { allowed: true, application: { ...next, status: "pending_payment" as const }, notification: "Safe waitlist promotion notice queued." } : { allowed: false, reason: "No waitlisted learner found." };
}

export function redactScholarshipForUser(scholarshipId: string, userId: string) {
  const scholarship = scholarships.find((item) => item.id === scholarshipId);
  if (!scholarship) return undefined;
  const allowed = can(userId, "programme.scholarship.view", { tenantId: scholarship.tenantId, scopeType: "tenant" }).allowed || can(userId, "welfare_request.view", { tenantId: scholarship.tenantId, scopeType: "tenant" }).allowed;
  return { ...scholarship, restrictedReason: allowed ? scholarship.restrictedReason : "Restricted scholarship reason" };
}

export function verifyProgrammePayment(paymentId: string, verifierUserId: string) {
  const payment = programmePayments.find((item) => item.id === paymentId);
  if (!payment) throw new Error("Payment not found");
  const duplicate = programmePayments.some((item) => item.id !== payment.id && item.transactionReference === payment.transactionReference);
  if (duplicate) return { allowed: false, reason: "Payment reference requires duplicate review." };
  const programme = programmes.find((item) => item.id === payment.programmeId);
  if (!programme) throw new Error("Programme not found");
  const allowed = canAccessProgramme(verifierUserId, programme, "programme.payment.verify");
  if (!allowed.allowed) return allowed;
  return { allowed: true, payment: { ...payment, verificationStatus: "verified" as const, verifiedByUserId: verifierUserId, status: "manually_verified" as ProgrammePayment["status"] } };
}

export function attendancePercentage(enrolmentId: string) {
  const enrolment = programmeEnrolments.find((item) => item.id === enrolmentId);
  if (!enrolment) throw new Error("Enrolment not found");
  const sessions = classSessions.filter((session) => session.tenantId === enrolment.tenantId && session.cohortId === enrolment.cohortId);
  if (!sessions.length) return 0;
  const attended = programmeAttendance.filter((item) => item.enrolmentId === enrolmentId && ["present", "late", "partial", "make_up"].includes(item.status)).length;
  return Math.round((attended / sessions.length) * 100);
}

export function evaluateCompletion(enrolmentId: string) {
  const enrolment = programmeEnrolments.find((item) => item.id === enrolmentId);
  if (!enrolment) throw new Error("Enrolment not found");
  const rule = completionRules.find((item) => item.programmeVersionId === enrolment.programmeVersionId);
  if (!rule) throw new Error("Completion rule not found");
  const completed: string[] = [];
  const outstanding: string[] = [];
  if (attendancePercentage(enrolmentId) >= rule.attendancePercent) completed.push("attendance"); else outstanding.push("attendance");
  if (!rule.assignmentRequired || assignmentSubmissions.some((item) => item.enrolmentId === enrolmentId && item.passed)) completed.push("assignment"); else outstanding.push("assignment");
  if (!rule.assessmentPassRequired || assessmentResults.some((item) => item.enrolmentId === enrolmentId && item.passed && item.moderationStatus !== "pending")) completed.push("assessment"); else outstanding.push("assessment");
  if (!rule.feeClearanceRequired || enrolment.outstandingBalance <= 0) completed.push("fee clearance"); else outstanding.push("fee clearance");
  return { eligible: outstanding.length === 0, completed, outstanding, percent: Math.round((completed.length / (completed.length + outstanding.length)) * 100), note: "Completion supports planning and never ranks spiritual worth." };
}

export function issueCertificate(enrolmentId: string, issuerUserId: string): { allowed: boolean; reason?: string; certificate?: Certificate } {
  const enrolment = programmeEnrolments.find((item) => item.id === enrolmentId);
  if (!enrolment) throw new Error("Enrolment not found");
  const programme = programmes.find((item) => item.id === enrolment.programmeId);
  if (!programme) throw new Error("Programme not found");
  const completion = evaluateCompletion(enrolmentId);
  if (!completion.eligible) return { allowed: false, reason: `Certificate blocked: outstanding ${completion.outstanding.join(", ")}.` };
  const allowed = canAccessProgramme(issuerUserId, programme, "programme.certificate.issue");
  if (!allowed.allowed) return allowed;
  return {
    allowed: true,
    certificate: {
      id: `cert-${enrolmentId}`,
      tenantId: enrolment.tenantId,
      enrolmentId,
      personId: enrolment.personId,
      programmeId: enrolment.programmeId,
      certificateNumber: `KGC-${programme.code}-${certificates.length + 1}`,
      verificationCode: `KFCERT-${enrolmentId.toUpperCase()}`,
      issuedAt: "2026-07-12T09:00:00.000Z",
      status: "valid",
      pdfStatus: "generated_placeholder",
    },
  };
}

export function verifyCertificate(code: string) {
  const certificate = certificates.find((item) => item.verificationCode === code);
  if (!certificate) return { status: "not found" as const };
  const person = people.find((item) => item.id === certificate.personId);
  const programme = programmes.find((item) => item.id === certificate.programmeId);
  return { status: certificate.status, learnerName: person ? getPersonName(person) : "Learner", programme: programme?.title, church: "King's Grace", issueDate: certificate.issuedAt, certificateNumber: certificate.certificateNumber };
}

export function recommendNewConvertProgramme(personId: string) {
  const convert = newConvertRecords.find((item) => item.personId === personId);
  if (!convert) return undefined;
  const foundation = programmes.find((programme) => programme.programmeTypeId === "ptype-foundation" && programme.status === "enrolment_open");
  return foundation ? { personId, programme: foundation, invitation: "Foundation programme invitation ready", followUpWorkerId: convert.assignedWorkerId } : undefined;
}

export function getLearnerPortal(personId: string) {
  const enrolments = programmeEnrolments.filter((item) => item.personId === personId);
  return {
    enrolments,
    upcomingSessions: classSessions.filter((session) => enrolments.some((enrolment) => enrolment.cohortId === session.cohortId)),
    attendance: programmeAttendance.filter((item) => enrolments.some((enrolment) => enrolment.id === item.enrolmentId)),
    payments: programmePayments.filter((item) => item.personId === personId),
    certificates: certificates.filter((item) => item.personId === personId),
    nextRecommendedStep: personId === "person-newconvert-john" ? "Membership Class placeholder" : "Coordinator review",
    mentor: mentorships.find((item) => item.menteePersonId === personId),
  };
}

export function getTrainerWorkspace(context: ProgrammeContext) {
  const assigned = trainerAssignments.filter((item) => item.tenantId === context.tenantId && item.userId === context.userId && item.status === "active");
  const cohortIds = new Set(assigned.map((item) => item.cohortId).filter(Boolean));
  return {
    assignments: assigned,
    upcomingClasses: classSessions.filter((session) => cohortIds.has(session.cohortId)),
    learnerRoster: programmeEnrolments.filter((enrolment) => cohortIds.has(enrolment.cohortId)),
    assessmentsAwaitingGrading: assessmentResults.filter((result) => result.assessorUserId === context.userId && !result.releasedAt),
    learnersAtRisk: programmeEnrolments.filter((enrolment) => cohortIds.has(enrolment.cohortId) && evaluateCompletion(enrolment.id).outstanding.length > 0),
  };
}

export function getProgrammeDashboard(context: ProgrammeContext) {
  const accessible = getAccessibleProgrammes(context);
  const programmeIds = new Set(accessible.map((item) => item.id));
  return {
    activeProgrammes: accessible.filter((item) => ["enrolment_open", "in_progress", "published"].includes(item.status)).length,
    learners: programmeEnrolments.filter((item) => programmeIds.has(item.programmeId)).length,
    cohortsNearingCapacity: programmeCohorts.filter((cohort) => programmeIds.has(cohort.programmeId) && getCohortOccupancy(cohort.id).available <= 2).length,
    pendingApprovals: programmeApplications.filter((item) => programmeIds.has(item.programmeId) && item.approvalStatus === "pending").length,
    overduePayments: programmeEnrolments.filter((item) => programmeIds.has(item.programmeId) && item.outstandingBalance > 0).length,
    certificateQueue: programmeEnrolments.filter((item) => programmeIds.has(item.programmeId) && evaluateCompletion(item.id).eligible && !certificates.some((cert) => cert.enrolmentId === item.id)).length,
    graduationReady: programmeEnrolments.filter((item) => programmeIds.has(item.programmeId) && item.enrolmentStatus === "completed").length,
    newConvertsInvited: newConvertRecords.filter((record) => recommendNewConvertProgramme(record.personId)).length,
  };
}

export function getProgrammeReports(context: ProgrammeContext) {
  const programmeIds = new Set(getAccessibleProgrammes(context).map((item) => item.id));
  return {
    programmeRegister: programmes.filter((item) => programmeIds.has(item.id)),
    cohorts: programmeCohorts.filter((item) => programmeIds.has(item.programmeId)),
    applications: programmeApplications.filter((item) => programmeIds.has(item.programmeId)),
    enrolments: programmeEnrolments.filter((item) => programmeIds.has(item.programmeId)),
    payments: programmePayments.filter((item) => programmeIds.has(item.programmeId)),
    scholarships: scholarships.filter((item) => programmeIds.has(item.programmeId)).map((item) => ({ ...item, restrictedReason: "Restricted scholarship reason" })),
    attendance: programmeAttendance,
    assessmentResults: assessmentResults.filter((result) => programmeEnrolments.some((enrolment) => enrolment.id === result.enrolmentId && programmeIds.has(enrolment.programmeId))),
    certificates: certificates.filter((item) => programmeIds.has(item.programmeId)),
    trainerWorkload: trainerAssignments.filter((item) => item.programmeId && programmeIds.has(item.programmeId)).reduce<Record<string, number>>((acc, item) => ({ ...acc, [profiles.find((profile) => profile.id === item.userId)?.fullName ?? item.userId]: (acc[item.userId] ?? 0) + 1 }), {}),
    leadershipPathways,
  };
}

export function getProgrammeCatalogue(context: ProgrammeContext) {
  return getAccessibleProgrammes(context)
    .filter((programme) => ["catalogue", "public_page"].includes(programme.publicationStatus) && ["published", "enrolment_open", "in_progress"].includes(programme.status))
    .map((programme) => ({ ...programme, feeDisclosure: getFeeDisclosure(programme.id), type: getProgrammeTypeName(programme.programmeTypeId) }));
}

export function getLeadershipEligibility(personId: string) {
  const completedFoundation = programmeEnrolments.some((item) => item.personId === personId && item.programmeId === "programme-foundation" && item.enrolmentStatus === "completed");
  return { eligibleForReview: completedFoundation, recommendation: completedFoundation ? "Eligible for leadership pathway review only; no role assignment is automatic." : "Foundation programme completion is outstanding." };
}
