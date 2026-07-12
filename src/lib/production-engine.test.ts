import { describe, expect, it } from "vitest";
import { calculateMonthlyActivePeople, getDataExportCatalogue, getGracePeriodAccess, getProductionReadiness, getSupportAccessWorkflow, getTenantOffboardingPlan, recommendSubscriptionPlan } from "./production-engine";

describe("Prompt 13 production readiness engine", () => {
  it("calculates monthly active people from activity and protected exclusions", () => {
    const active = calculateMonthlyActivePeople("tenant-kings-grace", "2026-07");
    expect(active.basis).toContain("service_attendance");
    expect(active.activePeople).toBeGreaterThanOrEqual(1);
    expect(active.deduplicatedPersonIds.length).toBe(active.activePeople);
  });

  it("uses a three-month recommendation instead of a single spike", () => {
    const recommendation = recommendSubscriptionPlan("tenant-kings-grace");
    expect(recommendation.rollingThreeMonthAverage).toBeGreaterThanOrEqual(0);
    expect(recommendation.explanation).toContain("three-month average");
    expect(recommendation.requiresManualReview).toBe(false);
  });

  it("keeps essential ministry and export access during grace", () => {
    const grace = getGracePeriodAccess("grace_period");
    expect(grace.essentialEnabled).toContain("pastoral_care");
    expect(grace.essentialEnabled).toContain("authorized_export");
    expect(grace.dataTrapped).toBe(false);
  });

  it("marks sensitive exports for approval", () => {
    const catalogue = getDataExportCatalogue();
    expect(catalogue.find((item) => item.key === "giving")?.approvalRequired).toBe(true);
    expect(catalogue.find((item) => item.key === "attendance")?.approvalRequired).toBe(false);
  });

  it("tracks launch gates without storing secrets in source", () => {
    const readiness = getProductionReadiness();
    expect(readiness.secretsInSource).toBe(false);
    expect(readiness.hardBlockers).toHaveLength(0);
  });

  it("requires audited support access and controlled offboarding", () => {
    expect(getSupportAccessWorkflow("tenant-kings-grace").requiredSteps).toContain("access is audited");
    const offboarding = getTenantOffboardingPlan("tenant-kings-grace");
    expect(offboarding.abruptDeletionAllowed).toBe(false);
    expect(offboarding.exportBlockedByOverdueFees).toBe(false);
  });
});
