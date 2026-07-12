import { describe, expect, it } from "vitest";
import { approvePaymentDestination, finalizeCashCollection, getGivingDashboard, getGivingReports, getMemberGivingPortal, getPaymentInstructions, getPledgeProgress, importReconciliationRows, issueReceipt, recordAnonymousContribution, requestRestrictedReclassification, verifyContribution, verifyReceiptPublic, voidReceipt } from "./giving-engine";

describe("Prompt 9 giving and stewardship engine", () => {
  it("keeps payment destination approval separated from creator approval", () => {
    expect(approvePaymentDestination("pdest-building-paybill", "user-admin").allowed).toBe(false);
    expect(approvePaymentDestination("pdest-building-paybill", "user-branch").allowed).toBe(true);
  });

  it("shows member-facing instructions without verification documents", () => {
    expect(getPaymentInstructions("pdest-general-till")?.internalVerificationHidden).toBe(true);
  });

  it("verifies contributions and flags duplicate references", () => {
    expect(verifyContribution("contrib-mary-event", "user-admin", "RFA123BUILD").allowed).toBe(false);
    expect(verifyContribution("contrib-mary-event", "user-admin", "RFAEVENT002").allowed).toBe(true);
  });

  it("records anonymous giving without creating a giver identity", () => {
    const contribution = recordAnonymousContribution({ tenantId: "tenant-kings-grace", branchId: "branch-imaara", categoryId: "gcat-offering", fundId: "fund-general", amount: 500, currency: "KES", paymentMethod: "cash", contributionDate: "2026-08-07", source: "service", createdBy: "user-branch" });
    expect(contribution.anonymous).toBe(true);
    expect("giverPersonId" in contribution).toBe(false);
  });

  it("enforces multi-person cash count and separation of duties", () => {
    expect(finalizeCashCollection("cash-service-sunday", "user-admin").allowed).toBe(false);
  });

  it("issues, verifies and voids receipts without exposing private details publicly", () => {
    expect(issueReceipt("contrib-amina-building", "user-admin").allowed).toBe(true);
    expect(verifyReceiptPublic("RCPT-KGC-000001")?.receiptNumber).toBe("KGC-IMA-2026-000001");
    expect(voidReceipt("receipt-amina-building", "Correction requested", "user-admin").allowed).toBe(true);
  });

  it("tracks pledge progress without pressure language", () => {
    const progress = getPledgeProgress("pledge-amina-building");
    expect(progress.outstandingAmount).toBe(50000);
    expect(progress.reminderMessage).toContain("No spiritual pressure");
  });

  it("requires reason and evidence for restricted fund reclassification", () => {
    expect(requestRestrictedReclassification("contrib-mission-donor", "user-admin", "").allowed).toBe(false);
    expect(requestRestrictedReclassification("contrib-mission-donor", "user-admin", "Wrong fund selected", "restricted/evidence.pdf").allowed).toBe(true);
  });

  it("prepares reconciliation review without creating fake journals", () => {
    expect(importReconciliationRows("recon-mpesa-aug").noJournalCreated).toBe(true);
  });

  it("builds privacy-safe dashboards and member portal", () => {
    const context = { tenantId: "tenant-kings-grace", userId: "user-admin" };
    expect(getGivingDashboard(context).verifiedGiving).toBeGreaterThan(0);
    expect(getMemberGivingPortal("person-amina").privacyNote).toContain("No comparisons");
    expect(JSON.stringify(getGivingReports({ tenantId: "tenant-kings-grace", userId: "user-volunteer" }).contributionRegister)).not.toContain("person-amina");
  });
});
