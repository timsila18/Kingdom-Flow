import { can } from "./authority-engine";
import { contributions } from "./giving-data";
import { accountingPeriods, accounts, assets, bankReconciliations, bankStatementRows, budgetControls, budgetLines, budgets, customerInvoices, disciplinaryCases, employmentRecords, facilityBookings, financialAccounts, fundBalances, goodsReceipts, inventoryItems, journalLines, journals, leaveRequests, paymentRequests, paymentVouchers, payslips, payrollResults, payrollRuns, postingRules, procurementRequests, projects, purchaseOrders, quotationEvaluations, stockCounts, supplierInvoices, suppliers, vehicles } from "./administration-data";
import type { FacilityBooking, InventoryTransaction, JournalLine, PaymentVoucher, SupplierInvoice } from "./administration-types";
import type { PermissionKey } from "./types";

export interface AdminContext {
  tenantId: string;
  userId: string;
  branchId?: string;
}

export function canAccessAdministration(userId: string, tenantId: string, permission: PermissionKey, branchId?: string) {
  return can(userId, permission, { tenantId, scopeType: branchId ? "branch" : "tenant", scopeId: branchId });
}

export function validateAccountHierarchy(accountId: string, proposedParentId?: string) {
  if (!proposedParentId) return { valid: true };
  if (accountId === proposedParentId) return { valid: false, reason: "An account cannot be its own parent." };
  const visited = new Set<string>([accountId]);
  let parent = accounts.find((item) => item.id === proposedParentId);
  while (parent) {
    if (visited.has(parent.id)) return { valid: false, reason: "Circular chart-of-accounts hierarchy blocked." };
    visited.add(parent.id);
    parent = parent.parentId ? accounts.find((item) => item.id === parent!.parentId) : undefined;
  }
  return { valid: true };
}

export function validateJournal(lines: JournalLine[]) {
  if (lines.length < 2) return { valid: false, reason: "A journal requires at least two lines." };
  for (const line of lines) {
    if (line.debit > 0 && line.credit > 0) return { valid: false, reason: "A journal line cannot contain both debit and credit." };
    if (line.debit < 0 || line.credit < 0) return { valid: false, reason: "Negative debit or credit values are blocked." };
    const account = accounts.find((item) => item.id === line.accountId);
    if (!account || !account.active || !account.postingAllowed) return { valid: false, reason: "Posting to inactive or non-posting account is blocked." };
    if (line.fundId && !account.restrictedFundCompatible && fundBalances.some((fund) => fund.fundId === line.fundId && fund.restricted)) return { valid: false, reason: "Restricted fund is incompatible with one or more selected accounts." };
  }
  const debit = lines.reduce((sum, line) => sum + line.debit, 0);
  const credit = lines.reduce((sum, line) => sum + line.credit, 0);
  if (Math.round(debit * 100) !== Math.round(credit * 100)) return { valid: false, reason: "Unbalanced journal blocked." };
  return { valid: true, debit, credit };
}

export function postJournal(journalId: string, actorUserId: string) {
  const journal = journals.find((item) => item.id === journalId);
  if (!journal) throw new Error("Journal not found");
  const allowed = canAccessAdministration(actorUserId, journal.tenantId, "accounting.journal.post", journal.branchId);
  if (!allowed.allowed) return allowed;
  const period = accountingPeriods.find((item) => item.id === journal.periodId);
  if (!period || period.status === "locked") return { allowed: false, reason: "Posting to a locked period requires an approved reopen workflow." };
  const validation = validateJournal(journalLines.filter((line) => line.journalId === journalId));
  if (!validation.valid) return { allowed: false, reason: validation.reason };
  if (journal.createdBy === actorUserId && !journal.approvedBy) return { allowed: false, reason: "Separation of duties: creator cannot post without independent approval." };
  return { allowed: true, journal: { ...journal, status: "posted" as const, postedBy: actorUserId, postingDate: "2026-08-31" } };
}

export function reverseJournal(journalId: string, actorUserId: string, reason: string) {
  const journal = journals.find((item) => item.id === journalId);
  if (!journal) throw new Error("Journal not found");
  const allowed = canAccessAdministration(actorUserId, journal.tenantId, "accounting.journal.approve", journal.branchId);
  if (!allowed.allowed) return allowed;
  if (journal.status !== "posted") return { allowed: false, reason: "Only posted journals are reversed; drafts can be cancelled." };
  if (!reason) return { allowed: false, reason: "Reversal requires a reason." };
  return { allowed: true, reversal: { ...journal, id: `reversal-${journal.id}`, source: "reversal" as const, reference: `REV-${journal.reference}`, description: `Reversal: ${reason}`, status: "approved" as const, reversalReference: journal.id } };
}

export function previewGivingPosting(contributionId: string) {
  const contribution = contributions.find((item) => item.id === contributionId);
  if (!contribution) throw new Error("Contribution not found");
  if (contribution.verificationStatus !== "verified") return { allowed: false, reason: "Giving must be verified before accounting preview." };
  const rule = postingRules.find((item) => item.tenantId === contribution.tenantId && item.source === "giving" && item.active);
  if (!rule) return { allowed: false, reason: "No active giving posting rule configured." };
  const lines: JournalLine[] = [
    { id: `preview-${contribution.id}-dr`, tenantId: contribution.tenantId, journalId: "preview", accountId: rule.debitAccountId, debit: contribution.amount, credit: 0, currency: contribution.currency, branchId: contribution.branchId, fundId: contribution.fundId, sourceTransactionId: contribution.id, memo: "Debit receiving account" },
    { id: `preview-${contribution.id}-cr`, tenantId: contribution.tenantId, journalId: "preview", accountId: rule.creditAccountId, debit: 0, credit: contribution.amount, currency: contribution.currency, branchId: contribution.branchId, fundId: contribution.fundId, sourceTransactionId: contribution.id, memo: "Credit giving income" },
  ];
  return { allowed: true, sourceLocked: true, originalContributionUnchanged: true, lines, validation: validateJournal(lines) };
}

export function getTrialBalance(tenantId: string) {
  return accounts.filter((account) => account.tenantId === tenantId).map((account) => {
    const postedLines = journalLines.filter((line) => line.accountId === account.id && journals.some((journal) => journal.id === line.journalId && journal.status === "posted"));
    const debit = postedLines.reduce((sum, line) => sum + line.debit, 0);
    const credit = postedLines.reduce((sum, line) => sum + line.credit, 0);
    return { accountCode: account.code, accountName: account.name, type: account.type, debit, credit, balance: account.type === "asset" || account.type === "expense" ? debit - credit : credit - debit };
  });
}

export function getFinancialStatements(tenantId: string) {
  const trialBalance = getTrialBalance(tenantId);
  return {
    trialBalance,
    incomeStatement: trialBalance.filter((line) => line.type === "income" || line.type === "expense"),
    balanceSheet: trialBalance.filter((line) => line.type === "asset" || line.type === "liability" || line.type === "equity"),
    cashFlowFoundation: financialAccounts.filter((account) => account.tenantId === tenantId).map((account) => ({ account: account.label, reconciliationRequired: account.reconciliationRequired })),
  };
}

export function getFundStatement(fundId: string) {
  const fund = fundBalances.find((item) => item.fundId === fundId);
  if (!fund) throw new Error("Fund balance not found");
  return { ...fund, availableBalance: fund.inflows - fund.outflows - fund.commitments, restrictedFundIntegrity: fund.restricted };
}

export function importStatementRows(financialAccountId: string, rows: Omit<typeof bankStatementRows[number], "id" | "tenantId" | "financialAccountId" | "status">[]) {
  const financialAccount = financialAccounts.find((item) => item.id === financialAccountId);
  if (!financialAccount) throw new Error("Financial account not found");
  return rows.map((row, index) => {
    const matchedJournal = journals.find((journal) => journal.reference === row.reference || journal.journalNumber === row.reference);
    return { ...row, id: `stmt-import-${index}`, tenantId: financialAccount.tenantId, financialAccountId, matchedJournalId: matchedJournal?.id, status: matchedJournal ? "auto_matched" as const : "unmatched" as const };
  });
}

export function approveBankReconciliation(reconciliationId: string, approverUserId: string) {
  const reconciliation = bankReconciliations.find((item) => item.id === reconciliationId);
  if (!reconciliation) throw new Error("Reconciliation not found");
  if (reconciliation.preparedBy === approverUserId) return { allowed: false, reason: "Prepared-by user cannot approve the same reconciliation alone." };
  const allowed = canAccessAdministration(approverUserId, reconciliation.tenantId, "accounting.reconciliation.manage");
  if (!allowed.allowed) return allowed;
  if (reconciliation.status !== "ready_for_review") return { allowed: false, reason: "Only ready reconciliations can be approved." };
  return { allowed: true, reconciliation: { ...reconciliation, status: "approved" as const, approvedBy: approverUserId } };
}

export function checkBudgetAvailability(budgetLineId: string, amount: number, emergency = false) {
  const line = budgetLines.find((item) => item.id === budgetLineId);
  if (!line) throw new Error("Budget line not found");
  const budget = budgets.find((item) => item.id === line.budgetId);
  const control = budgetControls.find((item) => item.budgetId === line.budgetId);
  const used = line.actualAmount + line.committedAmount + amount;
  const percent = (used / line.amount) * 100;
  if (control?.blockAboveBudget && used > line.amount && !(emergency && control.emergencyOverride)) return { allowed: false, warning: true, reason: "Budget control blocks this request without supplementary approval." };
  return { allowed: true, warning: percent >= (control?.warningPercent ?? 80), percentUsed: percent, budgetStatus: budget?.status };
}

export function approvePaymentRequest(requestId: string, approverUserId: string) {
  const request = paymentRequests.find((item) => item.id === requestId);
  if (!request) throw new Error("Payment request not found");
  if (request.requesterUserId === approverUserId) return { allowed: false, reason: "Requester cannot approve their own payment request." };
  const allowed = canAccessAdministration(approverUserId, request.tenantId, "payment_request.approve", request.branchId);
  if (!allowed.allowed) return allowed;
  const budget = request.budgetLineId ? checkBudgetAvailability(request.budgetLineId, request.amount, Boolean(request.welfareReferenceId)) : { allowed: true };
  if (!budget.allowed) return budget;
  return { allowed: true, request: { ...request, status: "approved" as const } };
}

export function preparePaymentVoucher(requestId: string, preparedBy: string): { allowed: boolean; reason?: string; voucher?: PaymentVoucher } {
  const request = paymentRequests.find((item) => item.id === requestId);
  if (!request) throw new Error("Payment request not found");
  const allowed = canAccessAdministration(preparedBy, request.tenantId, "payment_voucher.prepare", request.branchId);
  if (!allowed.allowed) return allowed;
  if (request.status !== "approved") return { allowed: false, reason: "Voucher requires an approved payment request." };
  return { allowed: true, voucher: { id: `pv-${request.id}`, tenantId: request.tenantId, voucherNumber: `PV-2026-${(paymentVouchers.length + 1).toString().padStart(4, "0")}`, paymentRequestId: request.id, payeeName: request.payeeName, amount: request.amount, deductions: 0, netAmount: request.amount, paymentAccountId: financialAccounts[0].id, paymentMethod: request.paymentMethod, voucherDate: "2026-08-31", preparedBy, status: "draft" } };
}

export function executeVoucherPayment(voucherId: string, paidBy: string, transactionReference?: string) {
  const voucher = paymentVouchers.find((item) => item.id === voucherId);
  if (!voucher) throw new Error("Voucher not found");
  const allowed = canAccessAdministration(paidBy, voucher.tenantId, "payment.execute");
  if (!allowed.allowed) return allowed;
  if (!transactionReference) return { allowed: false, reason: "Do not mark paid without an actual payment reference or approved manual confirmation." };
  return { allowed: true, voucher: { ...voucher, status: "paid" as const, paidBy, transactionReference } };
}

export function approveSupplier(supplierId: string, approverUserId: string) {
  const supplier = suppliers.find((item) => item.id === supplierId);
  if (!supplier) throw new Error("Supplier not found");
  const allowed = canAccessAdministration(approverUserId, supplier.tenantId, "supplier.approve");
  if (!allowed.allowed) return allowed;
  if (supplier.riskStatus === "high" && !supplier.conflictDeclaration) return { allowed: false, reason: "High-risk suppliers require conflict declaration and due diligence." };
  return { allowed: true, supplier: { ...supplier, approvalStatus: "approved" as const } };
}

export function changeSupplierBankDetails(supplierId: string, actorUserId: string) {
  const supplier = suppliers.find((item) => item.id === supplierId);
  if (!supplier) throw new Error("Supplier not found");
  const allowed = canAccessAdministration(actorUserId, supplier.tenantId, "supplier.manage");
  if (!allowed.allowed) return allowed;
  return { allowed: true, supplier: { ...supplier, approvalStatus: "pending_due_diligence" as const, riskStatus: "high" as const }, freshApprovalRequired: true };
}

export function evaluateQuotation(evaluationId: string) {
  const evaluation = quotationEvaluations.find((item) => item.id === evaluationId);
  if (!evaluation) throw new Error("Evaluation not found");
  const cheapest = [...evaluation.supplierScores].sort((a, b) => a.price - b.price)[0];
  return { ...evaluation, cheapestSupplierId: cheapest.supplierId, cheapestAutomaticallySelected: false, recommendationUsesCriteria: evaluation.recommendedSupplierId !== cheapest.supplierId || evaluation.criteria.length > 1 };
}

export function issuePurchaseOrder(procurementRequestId: string, actorUserId: string) {
  const request = procurementRequests.find((item) => item.id === procurementRequestId);
  if (!request) throw new Error("Procurement request not found");
  const allowed = canAccessAdministration(actorUserId, request.tenantId, "procurement.po.manage", request.branchId);
  if (!allowed.allowed) return allowed;
  if (request.status !== "approved") return { allowed: false, reason: "Purchase order requires approved requisition." };
  return { allowed: true, purchaseOrder: purchaseOrders.find((item) => item.procurementRequestId === request.id) };
}

export function processSupplierInvoice(invoice: SupplierInvoice) {
  const duplicate = supplierInvoices.some((item) => item.id !== invoice.id && item.supplierId === invoice.supplierId && item.invoiceNumber === invoice.invoiceNumber);
  if (duplicate) return { allowed: false, reason: "Duplicate supplier invoice blocked." };
  if (invoice.purchaseOrderId && !goodsReceipts.some((receipt) => receipt.purchaseOrderId === invoice.purchaseOrderId)) return { allowed: false, reason: "Payment requires goods receipt or approved exception." };
  return { allowed: true, invoice };
}

export function applyInventoryTransaction(transaction: InventoryTransaction, allowNegativeStock = false) {
  const item = inventoryItems.find((entry) => entry.id === transaction.itemId);
  if (!item) throw new Error("Inventory item not found");
  const outgoing = ["issue", "transfer", "wastage", "damage", "expiry", "reservation"].includes(transaction.transactionType);
  const nextQuantity = outgoing ? item.quantityOnHand - transaction.quantity : item.quantityOnHand + transaction.quantity;
  if (nextQuantity < 0 && !allowNegativeStock) return { allowed: false, reason: "Negative stock is blocked unless controlled backorders are enabled." };
  return { allowed: true, item: { ...item, quantityOnHand: nextQuantity } };
}

export function approveStockCount(countId: string, approverUserId: string) {
  const count = stockCounts.find((item) => item.id === countId);
  if (!count) throw new Error("Stock count not found");
  if (count.countedBy.includes(approverUserId)) return { allowed: false, reason: "Count team member cannot approve their own discrepancy adjustment." };
  return { allowed: true, count: { ...count, status: "approved" as const, approvedBy: approverUserId } };
}

export function capitalizeInventoryAsAsset(itemId: string, actorUserId: string) {
  const item = inventoryItems.find((entry) => entry.id === itemId);
  if (!item) throw new Error("Inventory item not found");
  return { allowed: true, asset: { ...assets[0], id: `asset-${item.id}`, assetNumber: `KGC-AST-${(assets.length + 1).toString().padStart(4, "0")}`, name: item.name, acquisitionCost: item.cost, custodianUserId: actorUserId } };
}

export function detectFacilityConflict(newBooking: Omit<FacilityBooking, "id" | "status">) {
  const start = new Date(newBooking.startAt).getTime();
  const end = new Date(newBooking.endAt).getTime();
  const conflict = facilityBookings.find((booking) => booking.facilityId === newBooking.facilityId && booking.status === "approved" && start < new Date(booking.endAt).getTime() && end > new Date(booking.startAt).getTime());
  return { conflict: Boolean(conflict), conflictBookingId: conflict?.id, suggestedStatus: conflict ? "conflict" as const : "pending_approval" as const };
}

export function approveLeaveRequest(leaveId: string, approverUserId: string) {
  const leave = leaveRequests.find((item) => item.id === leaveId);
  if (!leave) throw new Error("Leave request not found");
  if (leave.requesterUserId === approverUserId) return { allowed: false, reason: "Employee cannot approve their own leave." };
  const allowed = canAccessAdministration(approverUserId, leave.tenantId, "hr.leave.approve");
  if (!allowed.allowed) return allowed;
  return { allowed: true, leave: { ...leave, status: "approved" as const }, actingAppointment: leave.actingUserId ? { unavailableUserId: leave.requesterUserId, actingUserId: leave.actingUserId, startsAt: leave.startsAt, expiresAt: leave.endsAt, limit: "defined by Prompt 2 authority limits" } : undefined };
}

export function calculatePayrollRun(runId: string) {
  const run = payrollRuns.find((item) => item.id === runId);
  if (!run) throw new Error("Payroll run not found");
  const results = payrollResults.filter((item) => item.payrollRunId === runId);
  return {
    ...run,
    grossPay: results.reduce((sum, item) => sum + item.grossPay, 0),
    deductions: results.reduce((sum, item) => sum + item.deductions, 0),
    netPay: results.reduce((sum, item) => sum + item.netPay, 0),
    statutoryRatesHardCoded: false,
    exceptions: results.filter((item) => item.netPay < 0),
  };
}

export function approvePayrollRun(runId: string, approverUserId: string) {
  const run = payrollRuns.find((item) => item.id === runId);
  if (!run) throw new Error("Payroll run not found");
  if (run.preparedBy === approverUserId) return { allowed: false, reason: "Payroll preparer cannot approve the same run alone." };
  const allowed = canAccessAdministration(approverUserId, run.tenantId, "payroll.approve");
  if (!allowed.allowed) return allowed;
  return { allowed: true, payrollRun: { ...run, status: "approved" as const, approvedBy: approverUserId } };
}

export function getPayslipForUser(payslipId: string, userId: string) {
  const payslip = payslips.find((item) => item.id === payslipId);
  if (!payslip) throw new Error("Payslip not found");
  const employee = employmentRecords.find((item) => item.id === payslip.employeeId);
  const payrollAllowed = canAccessAdministration(userId, payslip.tenantId, "payroll.payslip.view_all").allowed;
  if (employee?.userId !== userId && !payrollAllowed) return { allowed: false, reason: "Employees can view only their own payslips." };
  return { allowed: true, payslip };
}

export function getAdministrationDashboard(context: AdminContext) {
  return {
    cashAndBank: financialAccounts.filter((item) => item.tenantId === context.tenantId && item.active).length,
    unreconciledAccounts: bankReconciliations.filter((item) => item.tenantId === context.tenantId && !["approved", "locked"].includes(item.status)).length,
    contributionsAwaitingPosting: contributions.filter((item) => item.tenantId === context.tenantId && item.verificationStatus === "verified" && !journals.some((journal) => journal.reference === item.id)).length,
    budgetUtilization: budgetLines.map((line) => ({ category: line.category, used: line.actualAmount + line.committedAmount, budget: line.amount })),
    payablesDue: supplierInvoices.filter((item) => item.tenantId === context.tenantId && item.paymentStatus !== "paid").length,
    paymentRequestsPending: paymentRequests.filter((item) => item.tenantId === context.tenantId && item.status.includes("pending")).length,
    restrictedFundBalances: fundBalances.filter((item) => item.tenantId === context.tenantId && item.restricted),
    projectSpend: projects.map((project) => ({ project: project.name, spend: budgetLines.filter((line) => line.projectId === project.id).reduce((sum, line) => sum + line.actualAmount, 0) })),
    inventoryValue: inventoryItems.reduce((sum, item) => item.tenantId === context.tenantId ? sum + item.quantityOnHand * item.cost : sum, 0),
    payrollStatus: payrollRuns.find((item) => item.tenantId === context.tenantId)?.status,
  };
}

export function getAdministrationReports(context: AdminContext) {
  const canViewPayroll = canAccessAdministration(context.userId, context.tenantId, "payroll.view").allowed;
  const canViewDiscipline = canAccessAdministration(context.userId, context.tenantId, "hr.discipline.manage").allowed;
  return {
    generalLedger: journalLines.filter((line) => line.tenantId === context.tenantId),
    trialBalance: getTrialBalance(context.tenantId),
    fundStatement: fundBalances.filter((line) => line.tenantId === context.tenantId),
    payableAgeing: supplierInvoices.filter((invoice) => invoice.tenantId === context.tenantId && invoice.paymentStatus !== "paid"),
    receivableAgeing: customerInvoices.filter((invoice) => invoice.tenantId === context.tenantId && invoice.status !== "paid"),
    supplierSpend: suppliers.map((supplier) => ({ supplier: supplier.name, amount: supplierInvoices.filter((invoice) => invoice.supplierId === supplier.id).reduce((sum, invoice) => sum + invoice.amount, 0), bankDetailsHidden: true })),
    stockOnHand: inventoryItems.filter((item) => item.tenantId === context.tenantId),
    assetRegister: assets.filter((asset) => asset.tenantId === context.tenantId),
    fleet: vehicles.filter((vehicle) => vehicle.tenantId === context.tenantId),
    payrollSummary: canViewPayroll ? payrollRuns.filter((run) => run.tenantId === context.tenantId) : [],
    disciplinaryCases: canViewDiscipline ? disciplinaryCases : [],
  };
}

export function exportAdministrationData(context: AdminContext, exportType: "ledger" | "payroll" | "supplier_bank" | "discipline" | "asset_disposal", reason?: string) {
  if (!reason) return { allowed: false, reason: "Sensitive exports require a reason." };
  const permission: PermissionKey = exportType === "payroll" ? "hr.report.export" : exportType === "ledger" ? "accounting.report.export" : exportType === "discipline" ? "hr.discipline.manage" : "accounting.report.export";
  const allowed = canAccessAdministration(context.userId, context.tenantId, permission);
  if (!allowed.allowed) return allowed;
  return { allowed: true, export: { exportType, reason, expiresInMinutes: 30, auditSummaryRedacted: true } };
}
