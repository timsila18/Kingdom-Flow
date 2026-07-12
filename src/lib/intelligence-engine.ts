import { analyticsAlerts, churchNetworks, kpiDefinitions, networkMemberships } from "./intelligence-data";
import type { ExecutiveBriefing, FunnelStageResult, GrowthInsight, KpiResult, MetricCard, MetricStatus } from "./intelligence-types";
import { followUpAssignments, followUpTasks, newConvertRecords, people, visitorRecords } from "./people-data";
import { programmeEnrolments } from "./programmes-data";
import { groupAttendanceRecords, groupMeetingReports, groupMeetings, smallGroups } from "./groups-data";
import { serviceReports, services, rosterAssignments, volunteerProfiles, rosterConflicts } from "./services-data";
import { pastoralCases, prayerRequests, welfareRequests } from "./pastoral-data";
import { budgets, budgetLines, projects } from "./administration-data";
import { contributions } from "./giving-data";

const period = "Jul 2026";
const lastUpdated = "2026-07-12T13:45:00.000Z";

function pct(numerator: number, denominator: number) {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

function statusFromPercent(value: number, target: number, warning: number, critical: number): MetricStatus {
  if (value >= target) return "healthy";
  if (value >= warning) return "watch";
  if (value >= critical) return "attention";
  return "critical";
}

function tenantFilter<T extends { tenantId: string }>(items: T[], tenantId: string) {
  return items.filter((item) => item.tenantId === tenantId);
}

export function getLeadershipCommandCenter(tenantId: string, permissions: string[] = []) {
  const tenantPeople = tenantFilter(people, tenantId);
  const activeMembers = tenantPeople.filter((person) => person.active && !person.archived && ["member", "leader", "serving_member"].includes(person.lifecycleStage)).length;
  const visits = tenantFilter(visitorRecords, tenantId);
  const converts = tenantFilter(newConvertRecords, tenantId);
  const tasks = tenantFilter(followUpTasks, tenantId);
  const reports = tenantFilter(serviceReports, tenantId);
  const groupReports = tenantFilter(groupMeetingReports, tenantId);
  const cards: MetricCard[] = [
    { key: "active_members", label: "Active members", value: activeMembers, status: "healthy", detail: "Active, non-archived member and leader records.", period, lastUpdated, sourceCompleteness: 92, drilldownPermission: "analytics.member_drilldown" },
    { key: "first_timers", label: "First-timers", value: visits.filter((visit) => visit.firstEverVisit).length, status: "healthy", detail: "Visitor records captured from QR and usher workflows.", period, lastUpdated, sourceCompleteness: 88 },
    { key: "returning_visitors", label: "Returning visitors", value: visits.filter((visit) => visit.returningVisitor).length, status: "watch", detail: "Return count depends on complete attendance capture.", period, lastUpdated, sourceCompleteness: 72 },
    { key: "new_converts", label: "New converts", value: converts.length, status: converts.some((item) => item.status !== "assigned") ? "attention" : "watch", detail: "Operational decision records only; no salvation score is created.", period, lastUpdated, sourceCompleteness: 90 },
    { key: "follow_up_pending", label: "Follow-up pending", value: tasks.filter((task) => task.status !== "completed").length, status: "attention", detail: "Pending tasks should become caring human contact.", period, lastUpdated, sourceCompleteness: 86 },
    { key: "fellowship_participation", label: "Fellowship participation", value: tenantFilter(groupAttendanceRecords, tenantId).filter((item) => item.status === "present" || item.status === "visitor").length, status: "healthy", detail: "Meeting attendance and fellowship placement signals.", period, lastUpdated, sourceCompleteness: 82 },
    { key: "service_attendance", label: "Service attendance", value: reports.reduce((sum, report) => sum + report.attendanceSummary.total, 0), status: "healthy", detail: "Estimated values must remain marked in service reports.", period, lastUpdated, sourceCompleteness: reports.length ? 80 : 0 },
    { key: "volunteer_gaps", label: "Volunteer gaps", value: rosterConflicts.filter((item) => item.tenantId === tenantId).length, status: "watch", detail: "Scheduling conflicts and training gaps, not burnout diagnoses.", period, lastUpdated, sourceCompleteness: 77 },
    { key: "pastoral_backlog", label: "Pastoral backlog", value: tenantFilter(pastoralCases, tenantId).filter((item) => item.status !== "closed").length, status: "watch", detail: "Aggregate workload only; confidential notes stay out of executive cards.", period, lastUpdated, sourceCompleteness: 84, drilldownPermission: "analytics.pastoral_aggregate.view" },
    { key: "reports_complete", label: "Reports complete", value: `${groupReports.filter((item) => item.status === "locked").length}/${tenantFilter(groupMeetings, tenantId).filter((item) => item.status === "completed").length}`, status: "watch", detail: "Expected versus submitted fellowship and service reports.", period, lastUpdated, sourceCompleteness: 78 },
  ];

  if (permissions.includes("analytics.finance.view")) {
    cards.push({ key: "giving_summary", label: "Authorized giving summary", value: tenantFilter(contributions, tenantId).reduce((sum, item) => sum + item.amount, 0), unit: "KES", status: "healthy", detail: "Aggregate total only; no giver ranking.", period, lastUpdated, sourceCompleteness: 79 });
  }

  return { cards, alerts: tenantFilter(analyticsAlerts, tenantId), insights: getEthicalGrowthInsights(tenantId) };
}

export function getVisitorJourneyFunnel(tenantId: string): FunnelStageResult[] {
  const visits = tenantFilter(visitorRecords, tenantId);
  const start = Math.max(visits.length, 1);
  const contacted = visits.filter((visit) => followUpAssignments.some((item) => item.personId === visit.personId && item.tenantId === tenantId)).length;
  const fellowship = visits.filter((visit) => groupAttendanceRecords.some((item) => item.personId === visit.personId && item.tenantId === tenantId)).length;
  const programme = visits.filter((visit) => programmeEnrolments.some((item) => item.personId === visit.personId && item.tenantId === tenantId)).length;
  return [
    { key: "first_visit", label: "First visit", count: visits.filter((visit) => visit.firstEverVisit).length, percentOfStart: 100 },
    { key: "follow_up", label: "Follow-up contact assigned", count: contacted, percentOfStart: pct(contacted, start) },
    { key: "fellowship", label: "Fellowship connection", count: fellowship, percentOfStart: pct(fellowship, start), medianDaysFromPrevious: 2 },
    { key: "programme", label: "Programme enrolment", count: programme, percentOfStart: pct(programme, start), medianDaysFromPrevious: 26, bottleneck: programme < fellowship },
  ];
}

export function getNewConvertAssimilationFunnel(tenantId: string): FunnelStageResult[] {
  const converts = tenantFilter(newConvertRecords, tenantId);
  const start = Math.max(converts.length, 1);
  const assigned = converts.filter((item) => Boolean(item.assignedWorkerId)).length;
  const contactAttempted = converts.filter((item) => followUpTasks.some((task) => task.personId === item.personId && task.tenantId === tenantId)).length;
  const enrolled = converts.filter((item) => programmeEnrolments.some((enrolment) => enrolment.personId === item.personId && enrolment.tenantId === tenantId)).length;
  const completed = converts.filter((item) => programmeEnrolments.some((enrolment) => enrolment.personId === item.personId && enrolment.enrolmentStatus === "completed" && enrolment.tenantId === tenantId)).length;
  const placed = converts.filter((item) => groupAttendanceRecords.some((record) => record.personId === item.personId && record.tenantId === tenantId)).length;
  return [
    { key: "decision_recorded", label: "Decision recorded", count: converts.length, percentOfStart: 100 },
    { key: "assigned", label: "Follow-up assigned", count: assigned, percentOfStart: pct(assigned, start), medianDaysFromPrevious: 0 },
    { key: "contact_attempted", label: "First contact attempted", count: contactAttempted, percentOfStart: pct(contactAttempted, start), medianDaysFromPrevious: 1 },
    { key: "enrolled", label: "Foundation enrolled", count: enrolled, percentOfStart: pct(enrolled, start), medianDaysFromPrevious: 26 },
    { key: "completed", label: "Foundation completed", count: completed, percentOfStart: pct(completed, start), bottleneck: completed < enrolled },
    { key: "fellowship", label: "Fellowship placed", count: placed, percentOfStart: pct(placed, start) },
  ];
}

export function calculateKpiResults(tenantId: string): KpiResult[] {
  return kpiDefinitions.filter((item) => item.tenantId === tenantId && item.status === "active").map((definition) => {
    let numerator = 0;
    let denominator = 1;
    if (definition.metricKey === "follow_up_completed") {
      const tasks = tenantFilter(followUpTasks, tenantId);
      numerator = tasks.filter((task) => task.status === "completed").length;
      denominator = tasks.length;
    }
    if (definition.metricKey === "foundation_completion") {
      const enrolments = tenantFilter(programmeEnrolments, tenantId);
      numerator = enrolments.filter((item) => item.enrolmentStatus === "completed").length;
      denominator = enrolments.length;
    }
    if (definition.metricKey === "fellowship_reporting") {
      const meetings = tenantFilter(groupMeetings, tenantId).filter((item) => item.status === "completed");
      numerator = tenantFilter(groupMeetingReports, tenantId).filter((item) => item.status === "locked").length;
      denominator = meetings.length;
    }
    const value = pct(numerator, denominator);
    return { definition, numerator, denominator, value, status: statusFromPercent(value, definition.target, definition.warningThreshold, definition.criticalThreshold), explanation: `${numerator} of ${denominator} records met the controlled metric definition.` };
  });
}

export function getEthicalGrowthInsights(tenantId: string): GrowthInsight[] {
  const reports = tenantFilter(serviceReports, tenantId);
  const firstTimers = reports.reduce((sum, report) => sum + report.attendanceSummary.firstTimers, 0);
  const pendingFollowUp = tenantFilter(followUpTasks, tenantId).filter((task) => task.status !== "completed").length;
  const missingReports = tenantFilter(services, tenantId).filter((service) => service.reportStatus === "not_started").length;
  return [
    {
      id: "insight-first-timer-followup",
      tenantId,
      title: "First-timer growth needs follow-up capacity review",
      severity: pendingFollowUp > 0 ? "attention" : "healthy",
      period,
      evidence: [`${firstTimers} first-timers were recorded in submitted service reports.`, `${pendingFollowUp} follow-up task remains open.`],
      confidence: missingReports ? "limited" : "medium",
      recommendedAction: "Review welcome and follow-up ownership before drawing conclusions from attendance change.",
      requiresHumanReview: true,
    },
    {
      id: "insight-reporting-completeness",
      tenantId,
      title: "Reporting completeness affects confidence",
      severity: missingReports ? "watch" : "healthy",
      period,
      evidence: [`${missingReports} service report is incomplete or not started.`, "Analytics cards show source completeness instead of claiming real-time certainty."],
      confidence: missingReports ? "limited" : "high",
      recommendedAction: "Ask service and fellowship leaders to complete missing reports before the leadership meeting.",
      requiresHumanReview: true,
    },
  ];
}

export function getFellowshipHealth(tenantId: string) {
  return tenantFilter(smallGroups, tenantId).map((group) => {
    const reports = groupMeetingReports.filter((report) => report.groupId === group.id);
    const latest = reports.at(-1);
    const capacityPercent = pct(group.currentMembership, group.capacity);
    const assistantReady = Boolean(group.assistantLeaderUserId);
    return {
      group,
      indicators: [
        { label: "Attendance consistency", status: latest ? "healthy" : "attention", detail: latest ? `${latest.attendanceSummary.present} present in latest report.` : "No report submitted." },
        { label: "Report submission", status: latest?.status === "locked" ? "healthy" : "watch", detail: latest ? latest.status.replaceAll("_", " ") : "Missing report." },
        { label: "Capacity", status: capacityPercent >= 85 ? "attention" : "healthy", detail: `${capacityPercent}% of configured capacity.` },
        { label: "Assistant leader", status: assistantReady ? "healthy" : "watch", detail: assistantReady ? "Assistant leader configured." : "Assistant leader missing." },
      ],
      multiplicationReviewSuggested: capacityPercent >= 85 && assistantReady,
      spiritualScoreCreated: false,
    };
  });
}

export function getOperationalAnalytics(tenantId: string) {
  const openPastoral = tenantFilter(pastoralCases, tenantId).filter((item) => item.status !== "closed");
  const activeVolunteers = tenantFilter(volunteerProfiles, tenantId).filter((item) => item.active);
  const activeBudgets = tenantFilter(budgets, tenantId);
  const budgetTotal = budgetLines.filter((line) => activeBudgets.some((budget) => budget.id === line.budgetId)).reduce((sum, line) => sum + line.amount, 0);
  return {
    pastoral: { open: openPastoral.length, prayerRequests: tenantFilter(prayerRequests, tenantId).length, welfareRequests: tenantFilter(welfareRequests, tenantId).length, detailsExposed: false },
    volunteers: { active: activeVolunteers.length, assignments: tenantFilter(rosterAssignments, tenantId).length, conflicts: tenantFilter(rosterConflicts, tenantId).length, burnoutDiagnosisCreated: false },
    finance: { budgetTotal, projectCount: tenantFilter(projects, tenantId).length, givingRankingCreated: false },
  };
}

export function getNetworkDashboard(networkId: string) {
  const network = churchNetworks.find((item) => item.id === networkId);
  const memberships = networkMemberships.filter((item) => item.networkId === networkId && item.status === "accepted");
  return {
    network,
    churches: memberships.length,
    sharedCategories: [...new Set(memberships.flatMap((item) => item.sharedCategories))],
    individualMembersVisible: memberships.some((item) => item.individualDataShared),
    aggregateAttendance: memberships.reduce((sum, item) => sum + getLeadershipCommandCenter(item.tenantId).cards.filter((card) => card.key === "service_attendance").reduce((inner, card) => inner + Number(card.value), 0), 0),
  };
}

export function getExecutiveBriefing(tenantId: string): ExecutiveBriefing {
  const alerts = tenantFilter(analyticsAlerts, tenantId);
  const insights = getEthicalGrowthInsights(tenantId);
  return {
    period,
    overview: "KingdomFlow shows operational health across people, follow-up, fellowship, services, volunteers, care, finance and reporting completeness.",
    attentionItems: alerts.map((alert) => alert.title),
    risks: insights.filter((item) => item.severity !== "healthy").map((item) => item.title),
    decisionsNeeded: ["Assign pending follow-up review.", "Confirm fellowship report gap owner.", "Review volunteer conflict before next published roster."],
    aiSafetyNote: "AI may summarize authorized metrics, but it cannot determine spiritual condition or causation from incomplete records.",
    sources: ["visitor_records", "follow_up_tasks", "service_reports", "group_reports", "programme_enrolments"],
  };
}

export function runExecutiveAiQuery(tenantId: string, question: string) {
  const insights = getEthicalGrowthInsights(tenantId);
  return {
    question,
    period,
    answer: "Recorded attendance and reporting completeness were reviewed. The system can identify patterns and missing reports, but it cannot determine causation from available data.",
    citedMetrics: insights.flatMap((item) => item.evidence),
    missingData: insights.filter((item) => item.confidence === "limited").map((item) => item.title),
    spiritualJudgmentMade: false,
    unauthorizedDataIncluded: false,
  };
}
