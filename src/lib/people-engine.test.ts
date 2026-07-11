import { describe, expect, it } from "vitest";
import { branches } from "./data";
import {
  chooseFollowUpWorker,
  completeTransfer,
  createPerson,
  detectDuplicate,
  generateMemberNumber,
  getAccessiblePeople,
  getEveryPersonMattersStats,
  getMonthlyActiveSignals,
  maskPersonForUser,
  mergeDuplicate,
  prepareExport,
  recordContactAttempt,
  registerNewConvert,
  requestTransfer,
  submitVisitorForm,
  validateImportRows,
  withdrawConsent,
} from "./people-engine";
import { people } from "./people-data";

describe("Prompt 3 people ministry engine", () => {
  it("creates a central person profile without duplicating lifecycle records", () => {
    const person = createPerson({
      tenantId: "tenant-kings-grace",
      firstName: "Jane",
      surname: "Njeri",
      ageGroup: "adult",
      phoneNumbers: ["+254700555555"],
      emailAddresses: [],
      preferredContactMethod: "phone",
      preferredLanguage: "en",
      communicationPreferences: ["phone"],
      consentStatus: "granted",
      privacyRestrictions: [],
      sourceOfFirstContact: "Usher entry",
      lifecycleStage: "visitor",
      relationshipStatus: "visitor",
      active: true,
      createdBy: "user-admin",
      updatedBy: "user-admin",
    });
    expect(person.id).toContain("person-jane-njeri");
    expect(person.lifecycleStage).toBe("visitor");
  });

  it("generates unique member numbers", () => {
    expect(generateMemberNumber("KGC", ["KGC-000001", "KGC-000002"])).toBe("KGC-000003");
  });

  it("enforces scope-limited access and cross-tenant denial", () => {
    expect(getAccessiblePeople({ tenantId: "tenant-kings-grace", userId: "user-admin" }).length).toBeGreaterThan(0);
    expect(getAccessiblePeople({ tenantId: "tenant-pending", userId: "user-admin" })).toHaveLength(0);
  });

  it("masks child-sensitive records without sensitive child permission", () => {
    const child = people.find((person) => person.id === "person-child-grace")!;
    const masked = maskPersonForUser(child, "user-branch");
    expect(masked.phoneNumbers).toHaveLength(0);
  });

  it("submits public visitor form and detects duplicates", () => {
    const submission = submitVisitorForm({
      tenantId: "tenant-kings-grace",
      branchId: "branch-imaara",
      firstName: "Mary",
      surname: "Wairimu",
      phone: "+254722000010",
      consentToContact: true,
      madeFaithDecision: false,
    });
    expect(submission.duplicateReviewRequired).toBe(true);
    expect(submission.visit.returningVisitor).toBe(true);
  });

  it("detects duplicate signals without merging on name alone", () => {
    const matches = detectDuplicate({ tenantId: "tenant-kings-grace", firstName: "Mary", surname: "Wairimu" });
    expect(matches[0].signals).toContain("exact name");
  });

  it("assigns new converts to available human workers", () => {
    const worker = chooseFollowUpWorker({ tenantId: "tenant-kings-grace", branchId: "branch-ruiru", language: "sw", ageGroup: "youth" });
    expect(worker?.userId).toBe("user-branch");
    const registration = registerNewConvert("person-newconvert-john");
    expect(registration.record.assignedWorkerId).toBe("user-branch");
    expect(registration.task?.taskType).toBe("first_contact");
  });

  it("records contact attempts and consent withdrawal separately", () => {
    const attempt = recordContactAttempt("person-newconvert-john", "reached", "user-branch");
    expect(attempt.followUpNeeded).toBe(true);
    const consent = withdrawConsent("person-visitor-mary", "whatsapp", "user-admin");
    expect(consent.status).toBe("withdrawn");
    expect(consent.consentType).toBe("whatsapp");
  });

  it("handles transfer workflow without duplicating person", () => {
    const request = requestTransfer("person-david", "branch-ruiru", "user-admin");
    expect(request.status).toBe("pending_source_approval");
    const completed = completeTransfer("transfer-david-1");
    expect(completed.status).toBe("completed");
    expect(people.filter((person) => person.id === "person-david")).toHaveLength(1);
  });

  it("merges duplicates with source identifier preservation", () => {
    const merge = mergeDuplicate("dup-mary-1", "person-visitor-mary");
    expect(merge.candidate.status).toBe("merged");
    expect(merge.sourceIdentifierPreserved).toBe("person-newconvert-john");
  });

  it("validates imports and blocks cross-tenant branch identifiers", () => {
    const rows = validateImportRows([{ firstName: "Test", surname: "Person", branchId: "branch-outside" }], branches.map((branch) => branch.id));
    expect(rows[0].valid).toBe(false);
    expect(rows[0].errors.join(" ")).toContain("Branch");
  });

  it("enforces export permissions", () => {
    const basic = prepareExport("user-admin", "tenant-kings-grace", false);
    const sensitive = prepareExport("user-branch", "tenant-kings-grace", true);
    expect(basic.allowed).toBe(true);
    expect(sensitive.allowed).toBe(false);
  });

  it("builds every person matters stats from real data", () => {
    const stats = getEveryPersonMattersStats("tenant-kings-grace", "user-admin");
    expect(stats.firstTimeVisitors).toBe(2);
    expect(stats.newConverts).toBe(1);
    expect(stats.duplicateReviews).toBe(1);
  });

  it("counts only billable-eligible activity signals for future subscription logic", () => {
    expect(getMonthlyActiveSignals("tenant-kings-grace")).toHaveLength(1);
  });
});
