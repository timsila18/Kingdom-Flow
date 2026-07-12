export type MetricStatus = "healthy" | "watch" | "attention" | "critical";
export type AnalyticsDomain =
  | "people"
  | "visitors"
  | "new_converts"
  | "discipleship"
  | "fellowships"
  | "services"
  | "volunteers"
  | "pastoral"
  | "safeguarding"
  | "finance"
  | "projects"
  | "operations";

export interface MetricCard {
  key: string;
  label: string;
  value: number | string;
  unit?: string;
  status: MetricStatus;
  detail: string;
  period: string;
  lastUpdated: string;
  sourceCompleteness: number;
  drilldownPermission?: string;
}

export interface FunnelStageResult {
  key: string;
  label: string;
  count: number;
  percentOfStart: number;
  medianDaysFromPrevious?: number;
  bottleneck?: boolean;
}

export interface KpiDefinition {
  id: string;
  tenantId: string;
  name: string;
  domain: AnalyticsDomain;
  metricKey: string;
  target: number;
  warningThreshold: number;
  criticalThreshold: number;
  period: "monthly" | "quarterly" | "annual" | "campaign";
  scopeType: "tenant" | "branch" | "department" | "fellowship" | "programme" | "event" | "project";
  visibilityPermission: string;
  version: number;
  effectiveFrom: string;
  status: "active" | "archived";
}

export interface KpiResult {
  definition: KpiDefinition;
  numerator: number;
  denominator: number;
  value: number;
  status: MetricStatus;
  explanation: string;
}

export interface GrowthInsight {
  id: string;
  tenantId: string;
  title: string;
  severity: MetricStatus;
  period: string;
  evidence: string[];
  confidence: "high" | "medium" | "limited";
  recommendedAction: string;
  requiresHumanReview: boolean;
}

export interface AnalyticsAlert {
  id: string;
  tenantId: string;
  title: string;
  severity: MetricStatus;
  sourceType: string;
  sourceId: string;
  assignedTo?: string;
  acknowledged: boolean;
  cooldownUntil?: string;
}

export interface ChurchNetwork {
  id: string;
  name: string;
  networkType: "denomination" | "diocese" | "region" | "district" | "partner_churches" | "custom";
  tenantId: string;
  status: "active" | "inviting" | "archived";
}

export interface NetworkMembership {
  id: string;
  networkId: string;
  tenantId: string;
  status: "invited" | "accepted" | "declined" | "revoked";
  sharedCategories: string[];
  individualDataShared: false;
}

export interface ExecutiveBriefing {
  period: string;
  overview: string;
  attentionItems: string[];
  risks: string[];
  decisionsNeeded: string[];
  aiSafetyNote: string;
  sources: string[];
}
