export type ContributionStatus = "unverified" | "pending" | "verified" | "mismatch" | "duplicate" | "rejected" | "reversed" | "disputed";
export type ReceiptStatus = "draft" | "issued" | "voided" | "replaced" | "cancelled";

export interface GivingCategory {
  id: string;
  tenantId: string;
  branchId?: string;
  name: string;
  code: string;
  description: string;
  categoryType: "offering" | "tithe" | "seed_offering" | "thanksgiving" | "pastoral_gift" | "missions" | "welfare" | "building_project" | "programme_contribution" | "partnership" | "special_project" | "benevolence" | "transport_support" | "donation" | "pledge_payment" | "custom";
  currency: string;
  restrictedFundRequired: boolean;
  linkedFundId?: string;
  linkedProgrammeId?: string;
  linkedEventId?: string;
  receiptWording: string;
  anonymousSupported: boolean;
  individualRecordSupported: boolean;
  totalOnlySupported: boolean;
  publicVisible: boolean;
  financeVisible: boolean;
  approvalRequired: boolean;
  status: "active" | "archived";
}

export interface Fund {
  id: string;
  tenantId: string;
  branchId?: string;
  name: string;
  code: string;
  description: string;
  fundType: string;
  restricted: boolean;
  purpose: string;
  targetAmount?: number;
  responsibleOfficerUserId: string;
  approvalAuthorityUserId: string;
  reportingVisibility: "summary" | "finance_only" | "restricted";
  balancePlaceholder: number;
  status: "active" | "inactive";
}

export interface FundRestriction {
  id: string;
  tenantId: string;
  fundId: string;
  restrictionType: "donor" | "church_designated" | "legal" | "project" | "programme" | "time" | "branch" | "purpose";
  description: string;
  source: string;
  effectiveDate: string;
  expiryDate?: string;
  releaseConditions: string;
  approvalRequired: boolean;
  documentationPath?: string;
  active: boolean;
}

export interface PaymentDestination {
  id: string;
  tenantId: string;
  branchId?: string;
  label: string;
  purpose: string;
  paymentType: "mpesa_paybill" | "mpesa_till" | "bank_account" | "mobile_money" | "card_gateway" | "cheque" | "cash_office" | "direct_debit_placeholder" | "international_transfer" | "custom";
  paybillNumber?: string;
  tillNumber?: string;
  accountInstructions: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  swiftBic?: string;
  currency: string;
  phoneNumber?: string;
  referenceRule: string;
  linkedCategoryIds: string[];
  linkedFundIds: string[];
  displayInstructions: string;
  verificationStatus: "unverified" | "pending_verification" | "verified_internally" | "verified_by_provider" | "rejected" | "suspended" | "expired";
  status: "draft" | "pending_approval" | "active" | "inactive" | "archived";
  createdBy: string;
}

export interface DestinationApproval {
  id: string;
  tenantId: string;
  destinationId: string;
  requestedByUserId: string;
  reviewerUserId?: string;
  approverUserId?: string;
  changeSummary: string;
  status: "pending_review" | "reviewed" | "approved" | "rejected";
}

export interface Contribution {
  id: string;
  tenantId: string;
  branchId: string;
  giverPersonId?: string;
  householdId?: string;
  donorName?: string;
  anonymous: boolean;
  categoryId: string;
  fundId: string;
  amount: number;
  currency: string;
  originalCurrency?: string;
  originalAmount?: number;
  exchangeRatePlaceholder?: number;
  paymentMethod: "cash" | "mpesa" | "bank_transfer" | "card" | "cheque" | "mobile_money" | "standing_order" | "direct_debit_placeholder" | "in_kind" | "foreign_currency" | "custom";
  destinationId?: string;
  transactionReference?: string;
  contributionDate: string;
  source: "service" | "fellowship" | "programme" | "event" | "outreach" | "online_giving_page" | "branch_office" | "bank_import" | "mpesa_callback" | "manual_finance_entry" | "pledge_payment" | "partnership" | "custom";
  serviceId?: string;
  groupId?: string;
  eventId?: string;
  programmeId?: string;
  pledgeId?: string;
  partnershipId?: string;
  receiptStatus: ReceiptStatus;
  verificationStatus: ContributionStatus;
  reconciliationStatus: "unmatched" | "matched" | "exception" | "reconciled_later";
  notes?: string;
  restricted: boolean;
  createdBy: string;
  verifiedBy?: string;
}

export interface CashCollectionSession {
  id: string;
  tenantId: string;
  branchId: string;
  source: "service" | "fellowship" | "event" | "branch_office";
  sourceId: string;
  collectionDate: string;
  expectedAmount: number;
  countedAmount: number;
  countTeamUserIds: string[];
  receiverUserId?: string;
  discrepancy?: number;
  depositReference?: string;
  depositDate?: string;
  status: "pending_count" | "counted" | "handed_over" | "received" | "discrepancy" | "deposited" | "verified" | "reconciled_later";
}

export interface Receipt {
  id: string;
  tenantId: string;
  branchId: string;
  receiptNumber: string;
  contributionId: string;
  payerName: string;
  amount: number;
  currency: string;
  categoryId: string;
  fundId: string;
  paymentMethod: string;
  transactionReference?: string;
  destinationId?: string;
  purpose: string;
  issuedAt?: string;
  issuedBy?: string;
  verificationCode: string;
  status: ReceiptStatus;
  replacementForReceiptId?: string;
  voidReason?: string;
}

export interface Pledge {
  id: string;
  tenantId: string;
  personId?: string;
  householdId?: string;
  donorName?: string;
  confidential: boolean;
  amount: number;
  currency: string;
  fundId: string;
  startDate: string;
  targetDate: string;
  frequency: "one_time" | "weekly" | "monthly" | "quarterly" | "milestone" | "custom";
  reminderPreference: "none" | "in_app" | "email" | "sms";
  status: "draft" | "active" | "partially_fulfilled" | "fulfilled" | "paused" | "cancelled" | "expired" | "written_off_administratively";
  fulfilledAmount: number;
  outstandingAmount: number;
  consent: boolean;
}

export interface Partnership {
  id: string;
  tenantId: string;
  personId?: string;
  partnerName: string;
  partnershipType: string;
  amount: number;
  frequency: "monthly" | "quarterly" | "annual" | "custom";
  startDate: string;
  endDate?: string;
  destinationId: string;
  fundId: string;
  communicationPreference: string;
  status: "active" | "paused" | "ended";
  consent: boolean;
}

export interface ReconciliationImport {
  id: string;
  tenantId: string;
  destinationId: string;
  importType: "mpesa_statement" | "bank_statement" | "provider_export" | "legacy_giving";
  status: "draft" | "validated" | "matched" | "approved" | "rejected";
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  unmatchedRows: number;
  dryRun: boolean;
}

export interface PaymentDispute {
  id: string;
  tenantId: string;
  reporterPersonId?: string;
  transactionReference: string;
  amount: number;
  currency: string;
  issueType: "missing_payment" | "wrong_receipt" | "duplicate_charge" | "incorrect_amount" | "wrong_fund" | "unrecognized_transaction";
  status: "submitted" | "assigned" | "under_review" | "resolved" | "closed";
  assignedFinanceUserId?: string;
}

export interface GivingCampaign {
  id: string;
  tenantId: string;
  fundId: string;
  title: string;
  targetAmount: number;
  receivedAmount: number;
  publicProgress: boolean;
  status: "draft" | "published" | "closed";
}
