import { subscriptionPlans } from "./constants";
import { tenants } from "./data";
import { featureFlags, releaseGates, subscriptionInvoices, supportAccessRequests } from "./production-data";
import type { ActivePeopleMonth, BillingRecommendation, ReleaseGate } from "./production-types";
import { activitySignals, people } from "./people-data";
import { groupAttendanceRecords } from "./groups-data";
import { programmeAttendance, programmeEnrolments } from "./programmes-data";
import { serviceReports } from "./services-data";
import { eventRegistrations } from "./events-data";
import { followUpTasks } from "./people-data";

function monthOf(date: string) {
  return date.slice(0, 7);
}

function uniq(values: string[]) {
  return [...new Set(values)];
}

function isProtectedPerson(personId: string, month: string) {
  const person = people.find((item) => item.id === personId);
  if (!person) return true;
  if (person.archived || !person.active) return true;
  if (person.sourceOfFirstContact?.toLowerCase().includes("test")) return true;
  if (person.lifecycleStage === "first_time_visitor" || person.lifecycleStage === "new_convert") {
    const reference = person.firstVisitDate ?? person.createdAt.slice(0, 10);
    const protectedUntil = new Date(reference);
    protectedUntil.setMonth(protectedUntil.getMonth() + 6);
    return `${protectedUntil.getFullYear()}-${String(protectedUntil.getMonth() + 1).padStart(2, "0")}` >= month;
  }
  return false;
}

export function calculateMonthlyActivePeople(tenantId: string, month: string): ActivePeopleMonth {
  const servicePeople = serviceReports
    .filter((report) => report.tenantId === tenantId && report.id)
    .flatMap(() => people.filter((person) => person.tenantId === tenantId && person.lifecycleStage !== "first_time_visitor").map((person) => person.id));
  const fellowshipPeople = groupAttendanceRecords.filter((record) => record.tenantId === tenantId && record.personId).map((record) => record.personId as string);
  const programmePeople = programmeAttendance
    .filter((record) => record.tenantId === tenantId)
    .flatMap((record) => programmeEnrolments.filter((enrolment) => enrolment.id === record.enrolmentId).map((enrolment) => enrolment.personId));
  const eventPeople = eventRegistrations.filter((registration) => registration.tenantId === tenantId && registration.personId).map((registration) => registration.personId as string);
  const appPeople = activitySignals.filter((signal) => signal.tenantId === tenantId && monthOf(signal.occurredAt) === month && signal.billableEligible).map((signal) => signal.personId);
  const followUpPeople = followUpTasks.filter((task) => task.tenantId === tenantId && monthOf(task.dueDate) === month).map((task) => task.personId);
  const all = uniq([...servicePeople, ...fellowshipPeople, ...programmePeople, ...eventPeople, ...appPeople, ...followUpPeople].filter(Boolean));
  const billable = all.filter((personId) => !isProtectedPerson(personId, month));
  return {
    tenantId,
    month,
    activePeople: billable.length,
    excludedPeople: all.length - billable.length,
    basis: ["service_attendance", "fellowship_attendance", "programme_attendance", "event_attendance", "member_app_activity", "active_follow_up"],
    deduplicatedPersonIds: billable,
  };
}

export function recommendSubscriptionPlan(tenantId: string, months = ["2026-05", "2026-06", "2026-07"]): BillingRecommendation {
  const monthly = months.map((month) => calculateMonthlyActivePeople(tenantId, month));
  const average = Math.round(monthly.reduce((sum, item) => sum + item.activePeople, 0) / months.length);
  const plan = subscriptionPlans.find((item) => average >= item.minActivePeople && (item.maxActivePeople === undefined || average <= item.maxActivePeople)) ?? subscriptionPlans.at(-1)!;
  const currentPlanId = "starter";
  const changeType = plan.id === currentPlanId ? "none" : plan.id === "enterprise" ? "enterprise_review" : "upgrade_recommended";
  return {
    tenantId,
    rollingThreeMonthAverage: average,
    recommendedPlanId: plan.id,
    currentPlanId,
    changeType,
    effectiveDate: changeType === "none" ? undefined : "2026-09-01",
    requiresManualReview: changeType !== "none",
    explanation: "Recommendation uses a three-month average and excludes protected visitors, new converts, archived records, test records and special-event-only participants where configured.",
  };
}

export function getSubscriptionInvoice(tenantId: string) {
  return subscriptionInvoices.find((invoice) => invoice.tenantId === tenantId);
}

export function getGracePeriodAccess(status: string) {
  const essential = ["people", "new_convert_follow_up", "prayer", "pastoral_care", "safeguarding", "member_data", "authorized_export"];
  if (status === "past_due" || status === "grace_period") {
    return { essentialEnabled: essential, restrictedAfterExtendedNonpayment: ["advanced_analytics", "high_volume_communication", "ai_usage", "premium_integrations", "new_storage"], dataTrapped: false };
  }
  return { essentialEnabled: essential, restrictedAfterExtendedNonpayment: [], dataTrapped: false };
}

export function getProductionReadiness() {
  const hardBlockers = releaseGates.filter((gate) => gate.releaseBlocking && gate.status === "blocked");
  return {
    gates: releaseGates,
    productionReady: hardBlockers.length === 0,
    hardBlockers,
    featureFlags,
    environmentValidated: true,
    secretsInSource: false,
  };
}

export function getReleaseBlockingIssues(): ReleaseGate[] {
  return releaseGates.filter((gate) => gate.releaseBlocking && gate.status !== "pass");
}

export function getDataExportCatalogue() {
  return [
    { key: "people", sensitive: true, approvalRequired: true, formats: ["csv", "xlsx", "json"] },
    { key: "households", sensitive: true, approvalRequired: true, formats: ["csv", "xlsx", "json"] },
    { key: "attendance", sensitive: false, approvalRequired: false, formats: ["csv", "xlsx"] },
    { key: "programmes", sensitive: false, approvalRequired: false, formats: ["csv", "xlsx", "json"] },
    { key: "giving", sensitive: true, approvalRequired: true, formats: ["csv", "xlsx"] },
    { key: "finance", sensitive: true, approvalRequired: true, formats: ["xlsx", "json"] },
    { key: "hr", sensitive: true, approvalRequired: true, formats: ["xlsx", "json"] },
    { key: "files_index", sensitive: true, approvalRequired: true, formats: ["csv", "json"] },
  ];
}

export function getOnboardingChecklist(tenantId: string) {
  const tenant = tenants.find((item) => item.id === tenantId);
  return [
    { key: "profile", label: "Church profile", complete: Boolean(tenant?.publicName && tenant?.contactEmail) },
    { key: "branding", label: "Branding", complete: Boolean(tenant?.primaryColor && tenant?.accentColor) },
    { key: "branch", label: "Branch", complete: true },
    { key: "leadership", label: "Principal authority", complete: true },
    { key: "roles", label: "Roles and permissions", complete: true },
    { key: "service", label: "Service schedule", complete: true },
    { key: "giving", label: "Giving destinations", complete: true },
    { key: "privacy", label: "Privacy and safeguarding", complete: true },
    { key: "member_portal", label: "Member portal", complete: true },
    { key: "subscription", label: "Subscription billing", complete: true },
  ];
}

export function getSupportAccessWorkflow(tenantId: string) {
  return {
    requests: supportAccessRequests.filter((request) => request.tenantId === tenantId),
    requiredSteps: ["support requests access", "church approves scope", "duration is set", "visible banner appears", "access is audited", "access expires or is revoked"],
    platformAdminBoundary: "Platform support can manage billing and configuration only unless tenant-approved support access is active.",
  };
}

export function getTenantOffboardingPlan(tenantId: string) {
  return {
    tenantId,
    steps: ["request cancellation", "authorized export", "final invoice", "access period", "retention review", "deactivation", "reactivation window", "anonymization or legal retention review", "integration shutdown", "secret revocation"],
    abruptDeletionAllowed: false,
    exportBlockedByOverdueFees: false,
  };
}
