import type { AnalyticsAlert, ChurchNetwork, KpiDefinition, NetworkMembership } from "./intelligence-types";

export const analyticsPrinciples = [
  "People are not merely statistics; metrics exist to help leaders serve people better.",
  "KingdomFlow does not create spiritual scores, holiness ratings, faith rankings or giving-based member rankings.",
  "Operational signals are prompts for wise human review, not spiritual verdicts.",
  "Executive analytics aggregate first and reveal individual drill-downs only where permission and pastoral scope allow.",
  "AI briefings cite source metrics, disclose missing data and never fabricate causes.",
];

export const churchNetworks: ChurchNetwork[] = [
  {
    id: "network-east-africa",
    tenantId: "tenant-kings-grace",
    name: "East Africa Fellowship Network",
    networkType: "denomination",
    status: "active",
  },
];

export const networkMemberships: NetworkMembership[] = [
  {
    id: "netmem-kings-grace",
    networkId: "network-east-africa",
    tenantId: "tenant-kings-grace",
    status: "accepted",
    sharedCategories: ["aggregate_attendance", "aggregate_membership", "aggregate_new_converts", "aggregate_discipleship"],
    individualDataShared: false,
  },
];

export const kpiDefinitions: KpiDefinition[] = [
  {
    id: "kpi-followup-24h",
    tenantId: "tenant-kings-grace",
    name: "First contact within 24 hours",
    domain: "visitors",
    metricKey: "follow_up_completed",
    target: 90,
    warningThreshold: 75,
    criticalThreshold: 50,
    period: "monthly",
    scopeType: "tenant",
    visibilityPermission: "analytics.dashboard.view",
    version: 1,
    effectiveFrom: "2026-07-01",
    status: "active",
  },
  {
    id: "kpi-foundation-completion",
    tenantId: "tenant-kings-grace",
    name: "Foundation completion",
    domain: "discipleship",
    metricKey: "foundation_completion",
    target: 80,
    warningThreshold: 65,
    criticalThreshold: 45,
    period: "quarterly",
    scopeType: "programme",
    visibilityPermission: "analytics.executive.view",
    version: 1,
    effectiveFrom: "2026-07-01",
    status: "active",
  },
  {
    id: "kpi-fellowship-reporting",
    tenantId: "tenant-kings-grace",
    name: "Fellowship report submission",
    domain: "fellowships",
    metricKey: "fellowship_reporting",
    target: 95,
    warningThreshold: 80,
    criticalThreshold: 60,
    period: "monthly",
    scopeType: "fellowship",
    visibilityPermission: "analytics.branch.view",
    version: 1,
    effectiveFrom: "2026-07-01",
    status: "active",
  },
];

export const analyticsAlerts: AnalyticsAlert[] = [
  {
    id: "alert-new-convert-unassigned",
    tenantId: "tenant-kings-grace",
    title: "New-convert first contact still pending",
    severity: "attention",
    sourceType: "follow_up_task",
    sourceId: "task-john-call",
    assignedTo: "user-branch",
    acknowledged: false,
  },
  {
    id: "alert-fellowship-report-gap",
    tenantId: "tenant-kings-grace",
    title: "One fellowship report is submitted but not approved",
    severity: "watch",
    sourceType: "group_report",
    sourceId: "report-ruiru-20260710",
    assignedTo: "user-admin",
    acknowledged: false,
  },
];
