import { describe, expect, it } from "vitest";
import { calculateKpiResults, getFellowshipHealth, getLeadershipCommandCenter, getNetworkDashboard, getNewConvertAssimilationFunnel, getVisitorJourneyFunnel, runExecutiveAiQuery } from "./intelligence-engine";

describe("Prompt 12 intelligence engine", () => {
  it("builds a real command center from existing ministry records", () => {
    const center = getLeadershipCommandCenter("tenant-kings-grace", ["analytics.finance.view"]);
    expect(center.cards.find((card) => card.key === "new_converts")?.value).toBe(1);
    expect(center.cards.find((card) => card.key === "giving_summary")?.detail).toContain("no giver ranking");
    expect(center.alerts.length).toBeGreaterThan(0);
  });

  it("calculates visitor and new-convert funnels without spiritual scoring", () => {
    expect(getVisitorJourneyFunnel("tenant-kings-grace").map((stage) => stage.key)).toContain("programme");
    const convertFunnel = getNewConvertAssimilationFunnel("tenant-kings-grace");
    expect(convertFunnel[0].label).toBe("Decision recorded");
    expect(convertFunnel.some((stage) => stage.label.toLowerCase().includes("salvation score"))).toBe(false);
  });

  it("keeps fellowship health as separate operational indicators", () => {
    const health = getFellowshipHealth("tenant-kings-grace");
    expect(health[0].spiritualScoreCreated).toBe(false);
    expect(health[0].indicators.length).toBeGreaterThan(2);
  });

  it("calculates controlled KPI definitions", () => {
    const results = calculateKpiResults("tenant-kings-grace");
    expect(results.map((result) => result.definition.metricKey)).toContain("follow_up_completed");
    expect(results.every((result) => Number.isFinite(result.value))).toBe(true);
  });

  it("does not expose individual records across church networks", () => {
    const network = getNetworkDashboard("network-east-africa");
    expect(network.churches).toBe(1);
    expect(network.individualMembersVisible).toBe(false);
  });

  it("AI executive query cites metrics and avoids invented causes", () => {
    const answer = runExecutiveAiQuery("tenant-kings-grace", "Why did attendance fall last month?");
    expect(answer.citedMetrics.length).toBeGreaterThan(0);
    expect(answer.answer).toContain("cannot determine causation");
    expect(answer.spiritualJudgmentMade).toBe(false);
    expect(answer.unauthorizedDataIncluded).toBe(false);
  });
});
