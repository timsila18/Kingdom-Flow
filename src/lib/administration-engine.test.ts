import { describe, expect, it } from "vitest";
import { bankStatementRows, journalLines, paymentRequests, supplierInvoices } from "./administration-data";
import { approveBankReconciliation, approveLeaveRequest, approvePaymentRequest, approvePayrollRun, approveStockCount, calculatePayrollRun, capitalizeInventoryAsAsset, checkBudgetAvailability, detectFacilityConflict, evaluateQuotation, executeVoucherPayment, exportAdministrationData, getAdministrationDashboard, getAdministrationReports, getFinancialStatements, getFundStatement, getPayslipForUser, importStatementRows, postJournal, preparePaymentVoucher, previewGivingPosting, processSupplierInvoice, reverseJournal, validateAccountHierarchy, validateJournal, applyInventoryTransaction } from "./administration-engine";

describe("Prompt 10 administration backbone", () => {
  it("validates balanced journals and blocks invalid lines", () => {
    expect(validateJournal(journalLines.filter((line) => line.journalId === "journal-giving-building")).valid).toBe(true);
    expect(validateJournal([{ ...journalLines[0], debit: 10, credit: 5 }, journalLines[1]]).valid).toBe(false);
    expect(validateAccountHierarchy("acct-bank-main", "acct-bank-main").valid).toBe(false);
  });

  it("posts, reverses, and blocks locked periods", () => {
    expect(postJournal("journal-giving-building", "user-admin").allowed).toBe(true);
    expect(reverseJournal("journal-giving-building", "user-admin", "Correction").allowed).toBe(true);
    expect(postJournal("journal-payroll-aug", "user-volunteer").allowed).toBe(false);
  });

  it("creates giving posting previews without mutating original contribution", () => {
    const preview = previewGivingPosting("contrib-amina-building");
    expect(preview.allowed).toBe(true);
    expect(preview.originalContributionUnchanged).toBe(true);
    expect(preview.validation?.valid).toBe(true);
  });

  it("returns ledger statements and restricted fund balances", () => {
    expect(getFinancialStatements("tenant-kings-grace").trialBalance.length).toBeGreaterThan(0);
    expect(getFundStatement("fund-building").restrictedFundIntegrity).toBe(true);
  });

  it("imports and approves bank reconciliations with separation of duties", () => {
    const imported = importStatementRows("finacc-building-paybill", [{ ...bankStatementRows[0], reference: "contrib-amina-building" }]);
    expect(imported[0].status).toBe("auto_matched");
    expect(approveBankReconciliation("recon-building-aug", "user-admin").allowed).toBe(false);
    expect(approveBankReconciliation("recon-building-aug", "user-branch").allowed).toBe(false);
  });

  it("checks budgets and payment request approvals", () => {
    expect(checkBudgetAvailability("bline-building-materials", 250000).allowed).toBe(true);
    expect(checkBudgetAvailability("bline-building-materials", 400000).allowed).toBe(false);
    expect(approvePaymentRequest("payreq-camera", paymentRequests[0].requesterUserId).allowed).toBe(false);
  });

  it("prepares vouchers and refuses fake payment completion", () => {
    const voucher = preparePaymentVoucher("payreq-camera", "user-admin");
    expect(voucher.allowed).toBe(true);
    expect(executeVoucherPayment("pv-camera", "user-admin").allowed).toBe(false);
    expect(executeVoucherPayment("pv-camera", "user-admin", "BANK-9088").allowed).toBe(true);
  });

  it("handles procurement, supplier invoices, inventory and assets", () => {
    expect(evaluateQuotation("qeval-camera").cheapestAutomaticallySelected).toBe(false);
    expect(processSupplierInvoice({ ...supplierInvoices[0], id: "dup" }).allowed).toBe(false);
    expect(applyInventoryTransaction({ id: "itx-over", tenantId: "tenant-kings-grace", itemId: "item-camera-kit", transactionType: "issue", quantity: 5, sourceStoreId: "store-media", reason: "test", authorizedBy: "user-admin", transactionDate: "2026-08-20", cost: 178000 }).allowed).toBe(false);
    expect(capitalizeInventoryAsAsset("item-camera-kit", "user-branch").asset.assetNumber).toMatch("KGC-AST");
    expect(approveStockCount("stock-media-aug", "user-branch").allowed).toBe(false);
  });

  it("detects facility conflicts and protects payroll self-service", () => {
    expect(detectFacilityConflict({ tenantId: "tenant-kings-grace", facilityId: "facility-main-hall", requesterUserId: "user-admin", title: "Youth conference", startAt: "2026-08-23T09:00:00.000Z", endAt: "2026-08-23T11:00:00.000Z", setupRequirements: ["sound"] }).conflict).toBe(true);
    expect(calculatePayrollRun("payroll-aug").netPay).toBe(156000);
    expect(approvePayrollRun("payroll-aug", "user-admin").allowed).toBe(false);
    expect(getPayslipForUser("payslip-branch-aug", "user-volunteer").allowed).toBe(false);
    expect(getPayslipForUser("payslip-branch-aug", "user-branch").allowed).toBe(true);
  });

  it("supports leave acting appointment and permission-aware reports", () => {
    expect(approveLeaveRequest("leave-branch-aug", "user-branch").allowed).toBe(false);
    expect(getAdministrationDashboard({ tenantId: "tenant-kings-grace", userId: "user-admin" }).inventoryValue).toBeGreaterThan(0);
    expect(getAdministrationReports({ tenantId: "tenant-kings-grace", userId: "user-branch" }).payrollSummary).toEqual([]);
    expect(exportAdministrationData({ tenantId: "tenant-kings-grace", userId: "user-admin" }, "payroll").allowed).toBe(false);
  });
});
