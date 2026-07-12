import { describe, expect, it } from "vitest";
import {
  calculateTechnologyFee,
  evaluateCompletion,
  evaluateEligibility,
  getFeeDisclosure,
  getLeadershipEligibility,
  getProgrammeDashboard,
  getProgrammeReports,
  getTrainerWorkspace,
  issueCertificate,
  promoteFromWaitlist,
  redactScholarshipForUser,
  recommendNewConvertProgramme,
  verifyCertificate,
  verifyProgrammePayment,
} from "./programmes-engine";

describe("Prompt 6 programmes and learning engine", () => {
  it("does not charge technology fees on free programmes", () => {
    expect(getFeeDisclosure("programme-foundation").technologyFee).toBe(0);
  });

  it("calculates launch technology fee bands for paid programmes", () => {
    expect(calculateTechnologyFee(350)).toBe(10);
    expect(getFeeDisclosure("programme-discipleship").totalPayableByLearner).toBe(360);
  });

  it("explains eligibility transparently", () => {
    const result = evaluateEligibility("app-mary-discipleship");
    expect(result.eligible).toBe(true);
    expect(result.reasons.join(" ")).toContain("waived");
  });

  it("keeps scholarship reasons restricted without explicit permission", () => {
    expect(redactScholarshipForUser("scholar-mary", "user-volunteer")?.restrictedReason).toBe("Restricted scholarship reason");
  });

  it("verifies manual payments only with authorized programme access", () => {
    expect(verifyProgrammePayment("pay-mary-discipleship", "user-admin").allowed).toBe(true);
  });

  it("evaluates completion without spiritual ranking", () => {
    const completion = evaluateCompletion("enrol-john-foundation");
    expect(completion.eligible).toBe(true);
    expect(completion.note).toContain("never ranks");
  });

  it("blocks certificates until completion rules pass", () => {
    const blocked = issueCertificate("enrol-mary-discipleship", "user-admin");
    expect(blocked.allowed).toBe(false);
    expect(blocked.reason).toContain("fee clearance");
  });

  it("verifies public certificates without private contact data", () => {
    const result = verifyCertificate("KFCERT-FF-JOHN-001");
    expect(result.status).toBe("valid");
    expect(JSON.stringify(result)).not.toContain("+254");
  });

  it("recommends foundation to new converts without marking spiritual maturity", () => {
    expect(recommendNewConvertProgramme("person-newconvert-john")?.invitation).toContain("invitation");
  });

  it("supports waitlist promotion only when a slot exists", () => {
    expect(promoteFromWaitlist("cohort-discipleship-aug", "user-admin").allowed).toBe(true);
  });

  it("keeps leadership pathway as review, not appointment", () => {
    expect(getLeadershipEligibility("person-newconvert-john").recommendation).toContain("no role assignment is automatic");
  });

  it("builds dashboards, trainer workspace and privacy-safe reports from real data", () => {
    expect(getProgrammeDashboard({ tenantId: "tenant-kings-grace", userId: "user-admin" }).learners).toBeGreaterThan(0);
    expect(getTrainerWorkspace({ tenantId: "tenant-kings-grace", userId: "user-branch" }).learnerRoster.length).toBeGreaterThan(0);
    expect(getProgrammeReports({ tenantId: "tenant-kings-grace", userId: "user-admin" }).scholarships[0]?.restrictedReason).toBe("Restricted scholarship reason");
  });
});
