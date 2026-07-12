import { describe, expect, it } from "vitest";
import {
  applyServiceTemplate,
  detectRosterConflicts,
  eligibleReplacements,
  generateServiceInstance,
  getServiceDashboard,
  getServiceReports,
  getVolunteerEligibility,
  publishRoster,
  redactIncidentForUser,
  reorderPlanItem,
  requestReplacement,
  reviewServiceReport,
  wouldCreateDepartmentCycle,
} from "./services-engine";
import { rosterAssignments } from "./services-data";

describe("Prompt 7 service and ministry operations engine", () => {
  it("generates recurring service instances without duplicates or paused dates", () => {
    expect(generateServiceInstance("sched-imaara-sunday", "2026-08-16").created).toBe(false);
    expect(generateServiceInstance("sched-imaara-sunday", "2026-07-19").reason).toContain("already exists");
  });

  it("applies and reorders order-of-service templates", () => {
    expect(applyServiceTemplate("service-sunday-20260719", "template-main-sunday")).toHaveLength(7);
    expect(reorderPlanItem("service-sunday-20260719", "sitem-sermon", 1)[0]?.id).toBe("sitem-sermon");
  });

  it("prevents circular department hierarchies", () => {
    expect(wouldCreateDepartmentCycle("dept-worship", "dept-worship")).toBe(true);
  });

  it("detects roster conflicts and blocks unsafe publication reasons", () => {
    expect(detectRosterConflicts(rosterAssignments.find((item) => item.id === "rost-usher-david")!)[0]?.explanation).toContain("already");
    expect(publishRoster("service-sunday-20260719", "user-admin").allowed).toBe(true);
  });

  it("keeps replacement history and suggests eligible replacements", () => {
    const request = requestReplacement("rost-usher-david", "Unavailable");
    expect(request.originalAssignmentId).toBe("rost-usher-david");
    expect(eligibleReplacements("rost-media-amina").length).toBeGreaterThan(0);
  });

  it("redacts restricted incidents for ordinary users", () => {
    const incident = redactIncidentForUser("incident-child-safe", "user-volunteer");
    expect(incident?.restrictedNotes).toBeUndefined();
    expect(incident?.summary).toContain("Restricted");
  });

  it("blocks self approval of service reports", () => {
    expect(reviewServiceReport("sreport-sunday", "user-branch", "approved").allowed).toBe(false);
  });

  it("does not auto-activate volunteers based on programme completion", () => {
    expect(getVolunteerEligibility("vapp-mary-media").note).toContain("never automatically");
  });

  it("builds dashboards and privacy-safe reports from real service data", () => {
    const context = { tenantId: "tenant-kings-grace", userId: "user-admin" };
    expect(getServiceDashboard(context).upcomingServices).toBeGreaterThan(0);
    expect(JSON.stringify(getServiceReports(context).incidents)).not.toContain("Restricted;");
  });
});
