export type AccountType = "asset" | "liability" | "equity" | "income" | "expense";
export type AdminStatus = "draft" | "submitted" | "under_review" | "pending_approval" | "approved" | "active" | "posted" | "paid" | "rejected" | "cancelled" | "closed" | "locked";
export type JournalSource = "giving" | "programme_payment" | "event_payment" | "welfare" | "procurement" | "supplier_invoice" | "payroll" | "bank" | "cash" | "assets" | "inventory" | "projects" | "manual_adjustment" | "opening_balance" | "reversal" | "depreciation" | "accrual" | "custom";

export interface Account {
  id: string;
  tenantId: string;
  branchId?: string;
  code: string;
  name: string;
  type: AccountType;
  subtype: string;
  parentId?: string;
  currency: string;
  controlAccount: boolean;
  restrictedFundCompatible: boolean;
  projectCompatible: boolean;
  departmentCompatible: boolean;
  postingAllowed: boolean;
  active: boolean;
  openingBalance: number;
  createdBy: string;
  updatedBy: string;
}

export interface AccountingPeriod {
  id: string;
  tenantId: string;
  name: string;
  periodType: "financial_year" | "quarter" | "month" | "custom";
  startDate: string;
  endDate: string;
  status: "open" | "soft_closed" | "closed" | "locked";
  closedBy?: string;
  closeDate?: string;
  lockReason?: string;
}

export interface Journal {
  id: string;
  tenantId: string;
  branchId?: string;
  departmentId?: string;
  projectId?: string;
  fundId?: string;
  periodId: string;
  journalNumber: string;
  journalDate: string;
  source: JournalSource;
  reference: string;
  description: string;
  status: AdminStatus | "pending_review" | "reversed";
  createdBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  postedBy?: string;
  postingDate?: string;
  reversalReference?: string;
  attachments: string[];
}

export interface JournalLine {
  id: string;
  tenantId: string;
  journalId: string;
  accountId: string;
  debit: number;
  credit: number;
  currency: string;
  exchangeRate?: number;
  branchId?: string;
  departmentId?: string;
  projectId?: string;
  fundId?: string;
  personId?: string;
  supplierId?: string;
  customerId?: string;
  restrictedFundReference?: string;
  sourceTransactionId?: string;
  memo: string;
}

export interface PostingRule {
  id: string;
  tenantId: string;
  source: JournalSource;
  debitAccountId: string;
  creditAccountId: string;
  active: boolean;
  previewRequired: boolean;
  approvalRequired: boolean;
}

export interface FundBalance {
  fundId: string;
  tenantId: string;
  inflows: number;
  outflows: number;
  commitments: number;
  restricted: boolean;
}

export interface FinancialAccount {
  id: string;
  tenantId: string;
  branchId?: string;
  label: string;
  accountType: "bank" | "mpesa_paybill" | "mpesa_till" | "cash_office" | "petty_cash" | "foreign_currency" | "card_settlement" | "cheque" | "custom";
  accountId: string;
  paymentDestinationId?: string;
  custodianUserId: string;
  signatories: string[];
  currency: string;
  openingBalance: number;
  active: boolean;
  reconciliationRequired: boolean;
  statementFormat: string;
}

export interface BankStatementRow {
  id: string;
  tenantId: string;
  financialAccountId: string;
  statementDate: string;
  description: string;
  reference: string;
  amount: number;
  matchedJournalId?: string;
  status: "unmatched" | "auto_matched" | "manual_matched" | "ignored";
}

export interface BankReconciliation {
  id: string;
  tenantId: string;
  financialAccountId: string;
  periodId: string;
  openingBalance: number;
  statementClosingBalance: number;
  systemClosingBalance: number;
  unmatchedTotal: number;
  status: "draft" | "in_progress" | "ready_for_review" | "approved" | "locked" | "reopened";
  preparedBy: string;
  approvedBy?: string;
}

export interface Budget {
  id: string;
  tenantId: string;
  name: string;
  financialYear: string;
  branchId?: string;
  departmentId?: string;
  projectId?: string;
  fundId?: string;
  ownerUserId: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "active" | "revised" | "closed" | "archived";
  version: number;
  notes: string;
}

export interface BudgetLine {
  id: string;
  tenantId: string;
  budgetId: string;
  accountId: string;
  category: string;
  period: string;
  amount: number;
  committedAmount: number;
  actualAmount: number;
  fundId?: string;
  projectId?: string;
  departmentId?: string;
  justification: string;
}

export interface BudgetControl {
  id: string;
  tenantId: string;
  budgetId: string;
  warningPercent: number;
  blockAboveBudget: boolean;
  allowOverride: boolean;
  emergencyOverride: boolean;
}

export interface PaymentRequest {
  id: string;
  tenantId: string;
  branchId?: string;
  departmentId?: string;
  projectId?: string;
  fundId?: string;
  budgetLineId?: string;
  requesterUserId: string;
  supplierId?: string;
  payeeName: string;
  purpose: string;
  amount: number;
  currency: string;
  dueDate: string;
  paymentMethod: string;
  procurementReferenceId?: string;
  welfareReferenceId?: string;
  status: "draft" | "submitted" | "pending_review" | "pending_approval" | "approved" | "rejected" | "returned" | "scheduled" | "paid" | "cancelled" | "expired";
  approvalWorkflowId?: string;
  attachments: string[];
}

export interface PaymentVoucher {
  id: string;
  tenantId: string;
  voucherNumber: string;
  paymentRequestId: string;
  payeeName: string;
  amount: number;
  deductions: number;
  netAmount: number;
  paymentAccountId: string;
  paymentMethod: string;
  transactionReference?: string;
  voucherDate: string;
  preparedBy: string;
  checkedBy?: string;
  approvedBy?: string;
  paidBy?: string;
  journalId?: string;
  status: "draft" | "checked" | "approved" | "paid" | "cancelled";
}

export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  supplierType: string;
  registrationNumber?: string;
  taxNumberPlaceholder?: string;
  contactEmail: string;
  branchScope?: string;
  approvalStatus: "draft" | "pending_due_diligence" | "approved" | "suspended" | "reactivation_pending";
  riskStatus: "low" | "medium" | "high";
  active: boolean;
  conflictDeclaration: string;
  bankDetailsRestricted: boolean;
}

export interface ProcurementRequest {
  id: string;
  tenantId: string;
  requesterUserId: string;
  departmentId?: string;
  branchId?: string;
  itemOrService: string;
  quantity: number;
  specification: string;
  estimatedCost: number;
  budgetLineId?: string;
  fundId?: string;
  requiredDate: string;
  urgency: "normal" | "urgent" | "emergency";
  preferredSupplierId?: string;
  justification: string;
  status: "draft" | "submitted" | "pending_approval" | "approved" | "rejected" | "converted";
}

export interface QuotationEvaluation {
  id: string;
  tenantId: string;
  procurementRequestId: string;
  supplierScores: { supplierId: string; price: number; compliance: number; deliveryDays: number; conflictDeclared: boolean }[];
  criteria: string[];
  recommendedSupplierId: string;
  approvedBy?: string;
  status: "draft" | "recommended" | "approved";
}

export interface PurchaseOrder {
  id: string;
  tenantId: string;
  poNumber: string;
  supplierId: string;
  procurementRequestId: string;
  total: number;
  fundId?: string;
  projectId?: string;
  status: "draft" | "pending_approval" | "approved" | "issued" | "partially_received" | "fully_received" | "cancelled" | "closed";
}

export interface GoodsReceipt {
  id: string;
  tenantId: string;
  purchaseOrderId: string;
  supplierId: string;
  receivedBy: string;
  receiptDate: string;
  quantityOrdered: number;
  quantityReceived: number;
  condition: "accepted" | "partially_rejected" | "rejected";
  deliveryNote: string;
  storeId?: string;
  discrepancy?: string;
}

export interface SupplierInvoice {
  id: string;
  tenantId: string;
  supplierId: string;
  invoiceNumber: string;
  invoiceDate: string;
  purchaseOrderId?: string;
  goodsReceiptId?: string;
  amount: number;
  dueDate: string;
  fundId?: string;
  projectId?: string;
  expenseAccountId: string;
  approvalStatus: "draft" | "pending_approval" | "approved" | "rejected";
  paymentStatus: "unpaid" | "part_paid" | "paid";
  journalStatus: "not_posted" | "posted";
}

export interface CustomerInvoice {
  id: string;
  tenantId: string;
  customerName: string;
  source: "hall_hire" | "bookshop" | "training" | "sponsorship" | "rental" | "service_contract" | "custom";
  amount: number;
  dueDate: string;
  paidAmount: number;
  status: "draft" | "issued" | "part_paid" | "paid" | "overdue" | "cancelled";
}

export interface InventoryItem {
  id: string;
  tenantId: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  branchId?: string;
  storeId: string;
  reorderLevel: number;
  cost: number;
  quantityOnHand: number;
  reservedQuantity: number;
  expiryTracking: boolean;
  batchTracking: boolean;
  serialTracking: boolean;
  active: boolean;
}

export interface Store {
  id: string;
  tenantId: string;
  name: string;
  storeType: "central" | "branch" | "department" | "event" | "project" | "mobile" | "custom";
  custodianUserId: string;
  branchId?: string;
  location: string;
  active: boolean;
  countSchedule: string;
}

export interface InventoryTransaction {
  id: string;
  tenantId: string;
  itemId: string;
  transactionType: "receipt" | "issue" | "transfer" | "return" | "adjustment" | "wastage" | "damage" | "expiry" | "donation" | "reservation" | "release";
  quantity: number;
  sourceStoreId?: string;
  destinationStoreId?: string;
  reason: string;
  authorizedBy: string;
  transactionDate: string;
  cost: number;
}

export interface StockCount {
  id: string;
  tenantId: string;
  storeId: string;
  countType: "full" | "cycle" | "branch" | "department" | "blind" | "recount";
  status: "draft" | "counted" | "discrepancy" | "approved" | "adjusted";
  countedBy: string[];
  approvedBy?: string;
}

export interface Asset {
  id: string;
  tenantId: string;
  assetNumber: string;
  name: string;
  category: string;
  serialNumber?: string;
  branchId?: string;
  location: string;
  custodianUserId?: string;
  departmentId?: string;
  acquisitionDate: string;
  acquisitionCost: number;
  supplierId?: string;
  fundId?: string;
  projectId?: string;
  condition: "new" | "good" | "fair" | "damaged" | "lost";
  status: "available" | "assigned" | "maintenance" | "disposed" | "lost";
  usefulLifeMonths: number;
  depreciationMethod: "straight_line" | "none" | "custom";
  residualValue: number;
}

export interface Project {
  id: string;
  tenantId: string;
  name: string;
  branchId?: string;
  fundId?: string;
  budgetId?: string;
  managerUserId: string;
  status: "draft" | "approved" | "active" | "on_hold" | "completed" | "closed";
  publicUpdates: boolean;
}

export interface FacilityBooking {
  id: string;
  tenantId: string;
  facilityId: string;
  requesterUserId: string;
  title: string;
  startAt: string;
  endAt: string;
  setupRequirements: string[];
  status: "requested" | "conflict" | "pending_approval" | "approved" | "cancelled";
}

export interface Vehicle {
  id: string;
  tenantId: string;
  registrationNumber: string;
  branchId?: string;
  status: "available" | "assigned" | "maintenance" | "retired";
  custodianUserId: string;
}

export interface EmploymentRecord {
  id: string;
  tenantId: string;
  personId: string;
  userId?: string;
  employeeNumber: string;
  positionId: string;
  branchId?: string;
  departmentId?: string;
  employmentType: "employee" | "clergy" | "contractor" | "volunteer_staff";
  status: "active" | "probation" | "on_leave" | "suspended" | "exited";
  salaryRestricted: boolean;
}

export interface LeaveRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  requesterUserId: string;
  leaveType: string;
  startsAt: string;
  endsAt: string;
  actingUserId?: string;
  status: "draft" | "submitted" | "pending_approval" | "approved" | "rejected" | "cancelled";
}

export interface PayrollRun {
  id: string;
  tenantId: string;
  periodId: string;
  status: "open" | "calculated" | "reviewed" | "approved" | "locked" | "posted" | "paid";
  preparedBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  grossPay: number;
  deductions: number;
  netPay: number;
}

export interface PayrollResult {
  id: string;
  tenantId: string;
  payrollRunId: string;
  employeeId: string;
  grossPay: number;
  deductions: number;
  netPay: number;
  journalId?: string;
}

export interface Payslip {
  id: string;
  tenantId: string;
  payrollRunId: string;
  employeeId: string;
  issueDate: string;
  grossPay: number;
  deductions: number;
  netPay: number;
  secureTokenPreview: string;
}

export interface StaffTrainingRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  programmeId: string;
  completionStatus: "required" | "in_progress" | "completed" | "expired";
  expiryDate?: string;
}

export interface PerformanceReview {
  id: string;
  tenantId: string;
  employeeId: string;
  supervisorUserId: string;
  cycle: string;
  status: "draft" | "self_review" | "manager_review" | "completed" | "improvement_plan";
}

export interface DisciplinaryCase {
  id: string;
  tenantId: string;
  employeeId: string;
  caseType: string;
  status: "reported" | "investigation" | "hearing" | "decision" | "appeal" | "closed";
  safeguardingLinked: boolean;
  restricted: boolean;
}
