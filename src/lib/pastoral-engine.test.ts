import { describe, expect, it } from "vitest";
import { pastoralCases, pastoralNotes, prayerRequests, welfareRequests } from "./pastoral-data";
import {
  acceptReferral,
  canViewNote,
  closeCase,
  createPastoralReferral,
  createWelfareApprovalDecision,
  getAccessiblePastoralCases,
  getCaseDetail,
  getPastoralDashboardStats,
  getPrayerRequestForUser,
  reopenCase,
  reviewTestimony,
  searchPastoralCases,
} from "./pastoral-engine";

const tenantId = "tenant-kings-grace";

describe("pastoral care access and workflow engine", () => {
  it("redacts restricted cases for users without detailed note access", () => {
    const branchCases = getAccessiblePastoralCases({ tenantId, userId: "user-branch" }, true);
    const counselling = branchCases.find((item) => item.id === "case-counselling-john");
    expect(counselling?.summary).toContain("John requested");
    expect(counselling?.restrictedNotePreview).toBeUndefined();
  });

  it("excludes safeguarding from ordinary dashboards and search", () => {
    const stats = getPastoralDashboardStats({ tenantId, userId: "user-branch" });
    expect(stats.safeguardingAlerts).toBe(0);
    const search = searchPastoralCases({ tenantId, userId: "user-branch" }, "Safeguarding");
    expect(search.some((item) => item.confidentiality === "safeguarding")).toBe(false);
  });

  it("allows dedicated safeguarding users to see safeguarding details", () => {
    const detail = getCaseDetail("case-safeguarding-grace", { tenantId, userId: "user-admin" });
    expect(detail?.pastoralCase.confidentiality).toBe("safeguarding");
    expect(detail?.notes.some((note) => note.type === "safeguarding")).toBe(true);
  });

  it("requires note-level authorization for restricted notes", () => {
    const restricted = pastoralNotes.find((note) => note.id === "note-john-restricted");
    expect(restricted).toBeDefined();
    expect(canViewNote("user-volunteer", restricted!)).toBe(false);
    expect(canViewNote("user-admin", restricted!)).toBe(true);
  });

  it("creates selective referrals without sharing all notes", () => {
    const result = createPastoralReferral({
      caseId: "case-counselling-john",
      referringUserId: "user-branch",
      direction: "upward",
      sharedInformation: ["redacted_summary", "member_visible_only"],
      reason: "Needs supervisory guidance",
    });
    expect(result.allowed).toBe(true);
    expect(result.referral?.sharedInformation).toEqual(["redacted_summary", "member_visible_only"]);
    expect(result.referral?.summary).toBe("Counselling support in progress.");
  });

  it("accepts referrals only for the intended receiving user", () => {
    expect(acceptReferral("referral-john-specialist", "user-volunteer").allowed).toBe(true);
    expect(acceptReferral("referral-john-specialist", "user-branch").allowed).toBe(false);
  });

  it("blocks welfare self-approval and routes high amount support for approval", () => {
    const request = welfareRequests.find((item) => item.id === "welfare-mary-rent");
    expect(request).toBeDefined();
    expect(createWelfareApprovalDecision(request!, "user-volunteer", "approved").allowed).toBe(false);
    const decision = createWelfareApprovalDecision(request!, "user-admin", "approved");
    expect(decision.allowed).toBe(true);
    expect(decision.workflowRequired).toBe(true);
  });

  it("does not publish testimonies without explicit publication consent", () => {
    const result = reviewTestimony("testimony-mary-1", "user-admin", "approved", "Safe approved version");
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("publication consent");
  });

  it("redacts private prayer request details for prayer-team members", () => {
    const request = prayerRequests.find((item) => item.id === "prayer-mary-private");
    expect(request).toBeDefined();
    const visible = getPrayerRequestForUser(request!, "user-volunteer");
    expect(visible?.details).toContain("Private request");
  });

  it("requires closure authority and preserves reopening as a separate state", () => {
    const caseToClose = pastoralCases.find((item) => item.id === "case-prayer-mary");
    expect(caseToClose).toBeDefined();
    expect(closeCase(caseToClose!.id, "user-volunteer", "Follow-up completed", "resolved").allowed).toBe(false);
    expect(closeCase(caseToClose!.id, "user-admin", "Follow-up completed", "resolved").allowed).toBe(true);
    expect(reopenCase(caseToClose!.id, "user-admin", "New request from member").case?.status).toBe("reopened");
  });
});
