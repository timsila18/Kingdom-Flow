import type { Account, AccountingPeriod, Asset, BankReconciliation, BankStatementRow, Budget, BudgetControl, BudgetLine, CustomerInvoice, DisciplinaryCase, EmploymentRecord, FacilityBooking, FinancialAccount, FundBalance, GoodsReceipt, InventoryItem, InventoryTransaction, Journal, JournalLine, LeaveRequest, PaymentRequest, PaymentVoucher, PayrollResult, PayrollRun, Payslip, PerformanceReview, PostingRule, ProcurementRequest, Project, PurchaseOrder, QuotationEvaluation, StaffTrainingRecord, StockCount, Store, Supplier, SupplierInvoice, Vehicle } from "./administration-types";

export const accounts: Account[] = [
  { id: "acct-bank-main", tenantId: "tenant-kings-grace", branchId: "branch-imaara", code: "1000", name: "Main Bank Account", type: "asset", subtype: "bank", currency: "KES", controlAccount: true, restrictedFundCompatible: true, projectCompatible: true, departmentCompatible: false, postingAllowed: true, active: true, openingBalance: 850000, createdBy: "user-admin", updatedBy: "user-admin" },
  { id: "acct-mpesa-building", tenantId: "tenant-kings-grace", branchId: "branch-imaara", code: "1010", name: "Building Paybill Control", type: "asset", subtype: "mobile_money", currency: "KES", controlAccount: true, restrictedFundCompatible: true, projectCompatible: true, departmentCompatible: false, postingAllowed: true, active: true, openingBalance: 0, createdBy: "user-admin", updatedBy: "user-admin" },
  { id: "acct-cash-office", tenantId: "tenant-kings-grace", code: "1020", name: "Cash Office", type: "asset", subtype: "cash", currency: "KES", controlAccount: true, restrictedFundCompatible: true, projectCompatible: false, departmentCompatible: true, postingAllowed: true, active: true, openingBalance: 25000, createdBy: "user-admin", updatedBy: "user-admin" },
  { id: "acct-accounts-payable", tenantId: "tenant-kings-grace", code: "2000", name: "Accounts Payable", type: "liability", subtype: "payable", currency: "KES", controlAccount: true, restrictedFundCompatible: false, projectCompatible: true, departmentCompatible: true, postingAllowed: true, active: true, openingBalance: 0, createdBy: "user-admin", updatedBy: "user-admin" },
  { id: "acct-payroll-liability", tenantId: "tenant-kings-grace", code: "2100", name: "Payroll Liabilities", type: "liability", subtype: "payroll_liability", currency: "KES", controlAccount: true, restrictedFundCompatible: false, projectCompatible: false, departmentCompatible: true, postingAllowed: true, active: true, openingBalance: 0, createdBy: "user-admin", updatedBy: "user-admin" },
  { id: "acct-unrestricted-fund", tenantId: "tenant-kings-grace", code: "3000", name: "Unrestricted Accumulated Fund", type: "equity", subtype: "unrestricted_fund_balance", currency: "KES", controlAccount: true, restrictedFundCompatible: false, projectCompatible: false, departmentCompatible: false, postingAllowed: true, active: true, openingBalance: 500000, createdBy: "user-admin", updatedBy: "user-admin" },
  { id: "acct-restricted-building", tenantId: "tenant-kings-grace", code: "3100", name: "Restricted Building Fund Balance", type: "equity", subtype: "restricted_fund_balance", currency: "KES", controlAccount: true, restrictedFundCompatible: true, projectCompatible: true, departmentCompatible: false, postingAllowed: true, active: true, openingBalance: 200000, createdBy: "user-admin", updatedBy: "user-admin" },
  { id: "acct-giving-income", tenantId: "tenant-kings-grace", code: "4000", name: "Giving Income", type: "income", subtype: "giving_income", currency: "KES", controlAccount: false, restrictedFundCompatible: true, projectCompatible: false, departmentCompatible: true, postingAllowed: true, active: true, openingBalance: 0, createdBy: "user-admin", updatedBy: "user-admin" },
  { id: "acct-event-income", tenantId: "tenant-kings-grace", code: "4100", name: "Event Income", type: "income", subtype: "event_income", currency: "KES", controlAccount: false, restrictedFundCompatible: false, projectCompatible: true, departmentCompatible: true, postingAllowed: true, active: true, openingBalance: 0, createdBy: "user-admin", updatedBy: "user-admin" },
  { id: "acct-ministry-expense", tenantId: "tenant-kings-grace", code: "5000", name: "Ministry Expense", type: "expense", subtype: "ministry_expense", currency: "KES", controlAccount: false, restrictedFundCompatible: true, projectCompatible: true, departmentCompatible: true, postingAllowed: true, active: true, openingBalance: 0, createdBy: "user-admin", updatedBy: "user-admin" },
  { id: "acct-staff-cost", tenantId: "tenant-kings-grace", code: "5100", name: "Staff Cost", type: "expense", subtype: "staff_cost", currency: "KES", controlAccount: false, restrictedFundCompatible: false, projectCompatible: false, departmentCompatible: true, postingAllowed: true, active: true, openingBalance: 0, createdBy: "user-admin", updatedBy: "user-admin" },
  { id: "acct-fixed-assets", tenantId: "tenant-kings-grace", code: "1500", name: "Fixed Assets", type: "asset", subtype: "fixed_asset", currency: "KES", controlAccount: true, restrictedFundCompatible: true, projectCompatible: true, departmentCompatible: true, postingAllowed: true, active: true, openingBalance: 350000, createdBy: "user-admin", updatedBy: "user-admin" },
];

export const accountingPeriods: AccountingPeriod[] = [
  { id: "period-2026-aug", tenantId: "tenant-kings-grace", name: "August 2026", periodType: "month", startDate: "2026-08-01", endDate: "2026-08-31", status: "open" },
  { id: "period-2026-jul", tenantId: "tenant-kings-grace", name: "July 2026", periodType: "month", startDate: "2026-07-01", endDate: "2026-07-31", status: "locked", closedBy: "user-admin", closeDate: "2026-08-05", lockReason: "Board-approved month end close" },
];

export const journals: Journal[] = [
  { id: "journal-giving-building", tenantId: "tenant-kings-grace", branchId: "branch-imaara", fundId: "fund-building", projectId: "project-building", periodId: "period-2026-aug", journalNumber: "JV-2026-0001", journalDate: "2026-08-06", source: "giving", reference: "contrib-amina-building", description: "Verified building fund contribution posting preview", status: "posted", createdBy: "user-admin", reviewedBy: "user-branch", approvedBy: "user-admin", postedBy: "user-admin", postingDate: "2026-08-06", attachments: ["receipt:RCPT-KGC-000001"] },
  { id: "journal-payroll-aug", tenantId: "tenant-kings-grace", departmentId: "unit-head", periodId: "period-2026-aug", journalNumber: "JV-2026-0002", journalDate: "2026-08-31", source: "payroll", reference: "payroll-aug", description: "August payroll accrual", status: "approved", createdBy: "user-admin", reviewedBy: "user-branch", approvedBy: "user-admin", attachments: [] },
];

export const journalLines: JournalLine[] = [
  { id: "jl-giving-dr", tenantId: "tenant-kings-grace", journalId: "journal-giving-building", accountId: "acct-mpesa-building", debit: 50000, credit: 0, currency: "KES", branchId: "branch-imaara", fundId: "fund-building", projectId: "project-building", restrictedFundReference: "fund-building", sourceTransactionId: "contrib-amina-building", memo: "Debit M-Pesa Paybill" },
  { id: "jl-giving-cr", tenantId: "tenant-kings-grace", journalId: "journal-giving-building", accountId: "acct-giving-income", debit: 0, credit: 50000, currency: "KES", branchId: "branch-imaara", fundId: "fund-building", projectId: "project-building", restrictedFundReference: "fund-building", sourceTransactionId: "contrib-amina-building", memo: "Credit restricted giving income" },
  { id: "jl-payroll-dr", tenantId: "tenant-kings-grace", journalId: "journal-payroll-aug", accountId: "acct-staff-cost", debit: 180000, credit: 0, currency: "KES", departmentId: "unit-head", memo: "Gross staff cost" },
  { id: "jl-payroll-cr", tenantId: "tenant-kings-grace", journalId: "journal-payroll-aug", accountId: "acct-payroll-liability", debit: 0, credit: 180000, currency: "KES", departmentId: "unit-head", memo: "Payroll liability" },
];

export const postingRules: PostingRule[] = [
  { id: "rule-giving-mpesa", tenantId: "tenant-kings-grace", source: "giving", debitAccountId: "acct-mpesa-building", creditAccountId: "acct-giving-income", active: true, previewRequired: true, approvalRequired: true },
  { id: "rule-supplier-invoice", tenantId: "tenant-kings-grace", source: "supplier_invoice", debitAccountId: "acct-ministry-expense", creditAccountId: "acct-accounts-payable", active: true, previewRequired: true, approvalRequired: true },
];

export const fundBalances: FundBalance[] = [
  { tenantId: "tenant-kings-grace", fundId: "fund-building", inflows: 50000, outflows: 18000, commitments: 200000, restricted: true },
  { tenantId: "tenant-kings-grace", fundId: "fund-general", inflows: 26000, outflows: 12000, commitments: 35000, restricted: false },
];

export const financialAccounts: FinancialAccount[] = [
  { id: "finacc-building-paybill", tenantId: "tenant-kings-grace", branchId: "branch-imaara", label: "Building Paybill", accountType: "mpesa_paybill", accountId: "acct-mpesa-building", paymentDestinationId: "pdest-building-paybill", custodianUserId: "user-admin", signatories: ["user-admin", "user-branch"], currency: "KES", openingBalance: 0, active: true, reconciliationRequired: true, statementFormat: "mpesa_csv" },
  { id: "finacc-cash-office", tenantId: "tenant-kings-grace", label: "Head Office Cash", accountType: "cash_office", accountId: "acct-cash-office", custodianUserId: "user-branch", signatories: ["user-admin"], currency: "KES", openingBalance: 25000, active: true, reconciliationRequired: true, statementFormat: "cash_count" },
];

export const bankStatementRows: BankStatementRow[] = [
  { id: "stmt-row-1", tenantId: "tenant-kings-grace", financialAccountId: "finacc-building-paybill", statementDate: "2026-08-06", description: "Paybill received AMINA", reference: "QH61BUILD", amount: 50000, matchedJournalId: "journal-giving-building", status: "auto_matched" },
  { id: "stmt-row-2", tenantId: "tenant-kings-grace", financialAccountId: "finacc-building-paybill", statementDate: "2026-08-06", description: "Bank charge", reference: "CHG-0806", amount: -35, status: "unmatched" },
];

export const bankReconciliations: BankReconciliation[] = [
  { id: "recon-building-aug", tenantId: "tenant-kings-grace", financialAccountId: "finacc-building-paybill", periodId: "period-2026-aug", openingBalance: 0, statementClosingBalance: 49965, systemClosingBalance: 50000, unmatchedTotal: -35, status: "ready_for_review", preparedBy: "user-admin" },
];

export const budgets: Budget[] = [
  { id: "budget-building-2026", tenantId: "tenant-kings-grace", name: "Building Project Budget", financialYear: "2026", branchId: "branch-imaara", projectId: "project-building", fundId: "fund-building", ownerUserId: "user-admin", status: "active", version: 1, notes: "Board approved building phase one." },
  { id: "budget-operations-2026", tenantId: "tenant-kings-grace", name: "Operations Budget", financialYear: "2026", ownerUserId: "user-admin", status: "active", version: 2, notes: "Includes ministries, facilities and HR." },
];

export const budgetLines: BudgetLine[] = [
  { id: "bline-building-materials", tenantId: "tenant-kings-grace", budgetId: "budget-building-2026", accountId: "acct-fixed-assets", category: "Building materials", period: "2026-08", amount: 500000, committedAmount: 200000, actualAmount: 18000, fundId: "fund-building", projectId: "project-building", justification: "Phase one foundation materials" },
  { id: "bline-operations-supplies", tenantId: "tenant-kings-grace", budgetId: "budget-operations-2026", accountId: "acct-ministry-expense", category: "Ministry supplies", period: "2026-08", amount: 75000, committedAmount: 12000, actualAmount: 9000, justification: "Service and children ministry supplies" },
];

export const budgetControls: BudgetControl[] = [
  { id: "bctrl-building", tenantId: "tenant-kings-grace", budgetId: "budget-building-2026", warningPercent: 80, blockAboveBudget: true, allowOverride: true, emergencyOverride: false },
  { id: "bctrl-operations", tenantId: "tenant-kings-grace", budgetId: "budget-operations-2026", warningPercent: 75, blockAboveBudget: false, allowOverride: true, emergencyOverride: true },
];

export const suppliers: Supplier[] = [
  { id: "supplier-soundtech", tenantId: "tenant-kings-grace", name: "SoundTech Kenya Ltd", supplierType: "equipment", registrationNumber: "PVT-SND-42", contactEmail: "accounts@soundtech.test", approvalStatus: "approved", riskStatus: "low", active: true, conflictDeclaration: "No related-person conflict declared", bankDetailsRestricted: true },
  { id: "supplier-buildmart", tenantId: "tenant-kings-grace", name: "BuildMart Supplies", supplierType: "construction", registrationNumber: "BN-BLD-11", contactEmail: "orders@buildmart.test", approvalStatus: "pending_due_diligence", riskStatus: "medium", active: true, conflictDeclaration: "Related-person review pending", bankDetailsRestricted: true },
];

export const procurementRequests: ProcurementRequest[] = [
  { id: "preq-camera", tenantId: "tenant-kings-grace", requesterUserId: "user-branch", departmentId: "unit-youth", branchId: "branch-imaara", itemOrService: "Camera kit for media ministry", quantity: 1, specification: "Mirrorless camera, lens, tripod and memory cards", estimatedCost: 180000, budgetLineId: "bline-operations-supplies", requiredDate: "2026-08-20", urgency: "normal", preferredSupplierId: "supplier-soundtech", justification: "Improve service media quality", status: "approved" },
];

export const quotationEvaluations: QuotationEvaluation[] = [
  { id: "qeval-camera", tenantId: "tenant-kings-grace", procurementRequestId: "preq-camera", supplierScores: [{ supplierId: "supplier-soundtech", price: 178000, compliance: 92, deliveryDays: 3, conflictDeclared: false }, { supplierId: "supplier-buildmart", price: 170000, compliance: 68, deliveryDays: 14, conflictDeclared: true }], criteria: ["compliance", "warranty", "delivery", "price"], recommendedSupplierId: "supplier-soundtech", approvedBy: "user-admin", status: "approved" },
];

export const purchaseOrders: PurchaseOrder[] = [
  { id: "po-camera", tenantId: "tenant-kings-grace", poNumber: "PO-2026-0001", supplierId: "supplier-soundtech", procurementRequestId: "preq-camera", total: 178000, status: "issued" },
];

export const goodsReceipts: GoodsReceipt[] = [
  { id: "grn-camera", tenantId: "tenant-kings-grace", purchaseOrderId: "po-camera", supplierId: "supplier-soundtech", receivedBy: "user-branch", receiptDate: "2026-08-18", quantityOrdered: 1, quantityReceived: 1, condition: "accepted", deliveryNote: "DN-778", storeId: "store-media" },
];

export const supplierInvoices: SupplierInvoice[] = [
  { id: "sinv-camera", tenantId: "tenant-kings-grace", supplierId: "supplier-soundtech", invoiceNumber: "ST-778", invoiceDate: "2026-08-18", purchaseOrderId: "po-camera", goodsReceiptId: "grn-camera", amount: 178000, dueDate: "2026-08-25", expenseAccountId: "acct-fixed-assets", approvalStatus: "approved", paymentStatus: "unpaid", journalStatus: "posted" },
];

export const paymentRequests: PaymentRequest[] = [
  { id: "payreq-camera", tenantId: "tenant-kings-grace", branchId: "branch-imaara", departmentId: "unit-youth", budgetLineId: "bline-operations-supplies", requesterUserId: "user-branch", supplierId: "supplier-soundtech", payeeName: "SoundTech Kenya Ltd", purpose: "Camera kit purchase", amount: 178000, currency: "KES", dueDate: "2026-08-25", paymentMethod: "bank_transfer", procurementReferenceId: "po-camera", status: "approved", attachments: ["invoice:ST-778"] },
];

export const paymentVouchers: PaymentVoucher[] = [
  { id: "pv-camera", tenantId: "tenant-kings-grace", voucherNumber: "PV-2026-0001", paymentRequestId: "payreq-camera", payeeName: "SoundTech Kenya Ltd", amount: 178000, deductions: 0, netAmount: 178000, paymentAccountId: "finacc-building-paybill", paymentMethod: "bank_transfer", voucherDate: "2026-08-20", preparedBy: "user-admin", checkedBy: "user-branch", approvedBy: "user-admin", status: "approved" },
];

export const customerInvoices: CustomerInvoice[] = [
  { id: "ar-hall-hire", tenantId: "tenant-kings-grace", customerName: "Community Choir Network", source: "hall_hire", amount: 30000, dueDate: "2026-08-22", paidAmount: 15000, status: "part_paid" },
];

export const stores: Store[] = [
  { id: "store-central", tenantId: "tenant-kings-grace", name: "Central Store", storeType: "central", custodianUserId: "user-admin", location: "Head office", active: true, countSchedule: "monthly" },
  { id: "store-media", tenantId: "tenant-kings-grace", name: "Media Store", storeType: "department", custodianUserId: "user-branch", branchId: "branch-imaara", location: "Imaara media room", active: true, countSchedule: "quarterly" },
];

export const inventoryItems: InventoryItem[] = [
  { id: "item-communion-cups", tenantId: "tenant-kings-grace", sku: "COM-CUP-001", name: "Communion Cups", category: "communion_supplies", unit: "pack", storeId: "store-central", reorderLevel: 10, cost: 350, quantityOnHand: 24, reservedQuantity: 6, expiryTracking: false, batchTracking: true, serialTracking: false, active: true },
  { id: "item-camera-kit", tenantId: "tenant-kings-grace", sku: "MED-CAM-001", name: "Camera Kit", category: "media_supplies", unit: "set", branchId: "branch-imaara", storeId: "store-media", reorderLevel: 1, cost: 178000, quantityOnHand: 1, reservedQuantity: 0, expiryTracking: false, batchTracking: false, serialTracking: true, active: true },
];

export const inventoryTransactions: InventoryTransaction[] = [
  { id: "itx-camera-receipt", tenantId: "tenant-kings-grace", itemId: "item-camera-kit", transactionType: "receipt", quantity: 1, destinationStoreId: "store-media", reason: "Goods receipt PO-2026-0001", authorizedBy: "user-admin", transactionDate: "2026-08-18", cost: 178000 },
];

export const stockCounts: StockCount[] = [
  { id: "stock-media-aug", tenantId: "tenant-kings-grace", storeId: "store-media", countType: "cycle", status: "counted", countedBy: ["user-admin", "user-branch"] },
];

export const assets: Asset[] = [
  { id: "asset-camera", tenantId: "tenant-kings-grace", assetNumber: "KGC-AST-0001", name: "Sony Camera Kit", category: "media_equipment", serialNumber: "SN-CAM-778", branchId: "branch-imaara", location: "Media room", custodianUserId: "user-branch", departmentId: "unit-youth", acquisitionDate: "2026-08-18", acquisitionCost: 178000, supplierId: "supplier-soundtech", condition: "new", status: "assigned", usefulLifeMonths: 36, depreciationMethod: "straight_line", residualValue: 20000 },
];

export const projects: Project[] = [
  { id: "project-building", tenantId: "tenant-kings-grace", name: "Imaara Sanctuary Expansion", branchId: "branch-imaara", fundId: "fund-building", budgetId: "budget-building-2026", managerUserId: "user-admin", status: "active", publicUpdates: true },
];

export const facilityBookings: FacilityBooking[] = [
  { id: "booking-main-hall-service", tenantId: "tenant-kings-grace", facilityId: "facility-main-hall", requesterUserId: "user-admin", title: "Sunday Service", startAt: "2026-08-23T08:00:00.000Z", endAt: "2026-08-23T12:30:00.000Z", setupRequirements: ["sound", "chairs", "ushers"], status: "approved" },
];

export const vehicles: Vehicle[] = [
  { id: "vehicle-van", tenantId: "tenant-kings-grace", registrationNumber: "KDG 123V", branchId: "branch-imaara", status: "available", custodianUserId: "user-branch" },
];

export const employmentRecords: EmploymentRecord[] = [
  { id: "emp-admin", tenantId: "tenant-kings-grace", personId: "person-amina", userId: "user-admin", employeeNumber: "KGC-EMP-001", positionId: "position-principal", employmentType: "employee", status: "active", salaryRestricted: true },
  { id: "emp-branch", tenantId: "tenant-kings-grace", personId: "person-david", userId: "user-branch", employeeNumber: "KGC-EMP-002", positionId: "position-branch-imaara", branchId: "branch-imaara", employmentType: "clergy", status: "active", salaryRestricted: true },
];

export const leaveRequests: LeaveRequest[] = [
  { id: "leave-branch-aug", tenantId: "tenant-kings-grace", employeeId: "emp-branch", requesterUserId: "user-branch", leaveType: "annual", startsAt: "2026-08-24", endsAt: "2026-08-30", actingUserId: "user-admin", status: "pending_approval" },
];

export const payrollRuns: PayrollRun[] = [
  { id: "payroll-aug", tenantId: "tenant-kings-grace", periodId: "period-2026-aug", status: "reviewed", preparedBy: "user-admin", reviewedBy: "user-branch", grossPay: 180000, deductions: 24000, netPay: 156000 },
];

export const payrollResults: PayrollResult[] = [
  { id: "payres-admin", tenantId: "tenant-kings-grace", payrollRunId: "payroll-aug", employeeId: "emp-admin", grossPay: 100000, deductions: 14000, netPay: 86000 },
  { id: "payres-branch", tenantId: "tenant-kings-grace", payrollRunId: "payroll-aug", employeeId: "emp-branch", grossPay: 80000, deductions: 10000, netPay: 70000 },
];

export const payslips: Payslip[] = [
  { id: "payslip-admin-aug", tenantId: "tenant-kings-grace", payrollRunId: "payroll-aug", employeeId: "emp-admin", issueDate: "2026-08-31", grossPay: 100000, deductions: 14000, netPay: 86000, secureTokenPreview: "ps_...admin" },
  { id: "payslip-branch-aug", tenantId: "tenant-kings-grace", payrollRunId: "payroll-aug", employeeId: "emp-branch", issueDate: "2026-08-31", grossPay: 80000, deductions: 10000, netPay: 70000, secureTokenPreview: "ps_...branch" },
];

export const staffTrainingRecords: StaffTrainingRecord[] = [
  { id: "train-finance-admin", tenantId: "tenant-kings-grace", employeeId: "emp-admin", programmeId: "programme-foundations", completionStatus: "completed", expiryDate: "2027-08-01" },
  { id: "train-safeguarding-branch", tenantId: "tenant-kings-grace", employeeId: "emp-branch", programmeId: "programme-foundations", completionStatus: "required" },
];

export const performanceReviews: PerformanceReview[] = [
  { id: "perf-branch-probation", tenantId: "tenant-kings-grace", employeeId: "emp-branch", supervisorUserId: "user-admin", cycle: "2026 H2", status: "manager_review" },
];

export const disciplinaryCases: DisciplinaryCase[] = [
  { id: "disc-confidential", tenantId: "tenant-kings-grace", employeeId: "emp-branch", caseType: "conduct", status: "investigation", safeguardingLinked: false, restricted: true },
];
