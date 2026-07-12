import type { CashCollectionSession, Contribution, DestinationApproval, Fund, FundRestriction, GivingCampaign, GivingCategory, Partnership, PaymentDestination, PaymentDispute, Pledge, Receipt, ReconciliationImport } from "./giving-types";

export const givingCategories: GivingCategory[] = [
  { id: "gcat-offering", tenantId: "tenant-kings-grace", branchId: "branch-imaara", name: "Sunday Offering", code: "OFF", description: "General freewill offering configured by the church.", categoryType: "offering", currency: "KES", restrictedFundRequired: false, linkedFundId: "fund-general", receiptWording: "Thank you for your contribution.", anonymousSupported: true, individualRecordSupported: true, totalOnlySupported: true, publicVisible: true, financeVisible: true, approvalRequired: false, status: "active" },
  { id: "gcat-building", tenantId: "tenant-kings-grace", branchId: "branch-imaara", name: "Building Project", code: "BLD", description: "Restricted building project contributions.", categoryType: "building_project", currency: "KES", restrictedFundRequired: true, linkedFundId: "fund-building", receiptWording: "Contribution designated for the Building Fund.", anonymousSupported: true, individualRecordSupported: true, totalOnlySupported: false, publicVisible: true, financeVisible: true, approvalRequired: true, status: "active" },
  { id: "gcat-missions", tenantId: "tenant-kings-grace", name: "Missions Giving", code: "MIS", description: "Restricted support for missions.", categoryType: "missions", currency: "KES", restrictedFundRequired: true, linkedFundId: "fund-missions", receiptWording: "Contribution designated for missions.", anonymousSupported: true, individualRecordSupported: true, totalOnlySupported: false, publicVisible: true, financeVisible: true, approvalRequired: true, status: "active" },
  { id: "gcat-event-gift", tenantId: "tenant-kings-grace", name: "Conference Voluntary Contribution", code: "EVG", description: "Voluntary contribution separate from event tickets.", categoryType: "donation", currency: "KES", restrictedFundRequired: false, linkedFundId: "fund-conference", linkedEventId: "event-conference-2026", receiptWording: "Voluntary event contribution received.", anonymousSupported: true, individualRecordSupported: true, totalOnlySupported: true, publicVisible: true, financeVisible: true, approvalRequired: false, status: "active" },
];

export const funds: Fund[] = [
  { id: "fund-general", tenantId: "tenant-kings-grace", branchId: "branch-imaara", name: "General Fund", code: "GEN", description: "Unrestricted general church fund.", fundType: "general", restricted: false, purpose: "General ministry operations", responsibleOfficerUserId: "user-admin", approvalAuthorityUserId: "user-admin", reportingVisibility: "summary", balancePlaceholder: 0, status: "active" },
  { id: "fund-building", tenantId: "tenant-kings-grace", branchId: "branch-imaara", name: "Building Fund", code: "BLD", description: "Restricted building and facility development fund.", fundType: "building", restricted: true, purpose: "Imaara building project", targetAmount: 5000000, responsibleOfficerUserId: "user-admin", approvalAuthorityUserId: "user-branch", reportingVisibility: "finance_only", balancePlaceholder: 0, status: "active" },
  { id: "fund-missions", tenantId: "tenant-kings-grace", name: "Missions Fund", code: "MIS", description: "Restricted missions support fund.", fundType: "missions", restricted: true, purpose: "Mission trips and mission support", targetAmount: 1200000, responsibleOfficerUserId: "user-branch", approvalAuthorityUserId: "user-admin", reportingVisibility: "restricted", balancePlaceholder: 0, status: "active" },
  { id: "fund-conference", tenantId: "tenant-kings-grace", name: "Conference Fund", code: "CNF", description: "Conference stewardship metadata, separate from event ticket fees.", fundType: "conference", restricted: false, purpose: "Conference voluntary contributions", responsibleOfficerUserId: "user-admin", approvalAuthorityUserId: "user-admin", reportingVisibility: "summary", balancePlaceholder: 0, status: "active" },
];

export const fundRestrictions: FundRestriction[] = [
  { id: "frest-building-purpose", tenantId: "tenant-kings-grace", fundId: "fund-building", restrictionType: "project", description: "Funds must support the Imaara building project.", source: "church_designated", effectiveDate: "2026-07-01", releaseConditions: "Building committee and finance approval.", approvalRequired: true, documentationPath: "restricted/funds/building-policy.pdf", active: true },
  { id: "frest-missions-donor", tenantId: "tenant-kings-grace", fundId: "fund-missions", restrictionType: "purpose", description: "Missions gifts must remain traceable to mission purpose.", source: "donor_or_church_designated", effectiveDate: "2026-07-01", releaseConditions: "Mission lead and finance review.", approvalRequired: true, documentationPath: "restricted/funds/missions-restriction.pdf", active: true },
];

export const paymentDestinations: PaymentDestination[] = [
  { id: "pdest-building-paybill", tenantId: "tenant-kings-grace", branchId: "branch-imaara", label: "Building Project Paybill", purpose: "Building Fund contributions", paymentType: "mpesa_paybill", paybillNumber: "400200", accountInstructions: "Use account BLD-{member number or name}.", currency: "KES", referenceRule: "BLD-{giver}", linkedCategoryIds: ["gcat-building"], linkedFundIds: ["fund-building"], displayInstructions: "Paybill 400200, Account BLD followed by your name or member number.", verificationStatus: "pending_verification", status: "pending_approval", createdBy: "user-admin" },
  { id: "pdest-general-till", tenantId: "tenant-kings-grace", branchId: "branch-imaara", label: "General Giving Till", purpose: "General offering and thanksgiving", paymentType: "mpesa_till", tillNumber: "900111", accountInstructions: "Reference optional.", currency: "KES", referenceRule: "Optional giver reference", linkedCategoryIds: ["gcat-offering"], linkedFundIds: ["fund-general"], displayInstructions: "Till 900111 for general giving. Giving remains voluntary.", verificationStatus: "verified_internally", status: "active", createdBy: "user-admin" },
  { id: "pdest-missions-bank", tenantId: "tenant-kings-grace", label: "Missions Bank Account", purpose: "Missions Fund", paymentType: "bank_account", bankName: "Kingdom Bank", accountName: "King's Grace Missions", accountNumber: "1234567890", accountInstructions: "Reference MIS and your name if you want a receipt.", currency: "KES", referenceRule: "MIS-{giver}", linkedCategoryIds: ["gcat-missions"], linkedFundIds: ["fund-missions"], displayInstructions: "Bank transfer to King's Grace Missions, account 1234567890.", verificationStatus: "verified_internally", status: "active", createdBy: "user-admin" },
];

export const destinationApprovals: DestinationApproval[] = [
  { id: "dapp-building", tenantId: "tenant-kings-grace", destinationId: "pdest-building-paybill", requestedByUserId: "user-admin", reviewerUserId: "user-branch", changeSummary: "Create Building Project Paybill instructions.", status: "reviewed" },
];

export const contributions: Contribution[] = [
  { id: "contrib-amina-building", tenantId: "tenant-kings-grace", branchId: "branch-imaara", giverPersonId: "person-amina", householdId: "household-otieno", anonymous: false, categoryId: "gcat-building", fundId: "fund-building", amount: 10000, currency: "KES", paymentMethod: "mpesa", destinationId: "pdest-building-paybill", transactionReference: "RFA123BUILD", contributionDate: "2026-08-01", source: "pledge_payment", pledgeId: "pledge-amina-building", receiptStatus: "issued", verificationStatus: "verified", reconciliationStatus: "matched", restricted: true, createdBy: "user-admin", verifiedBy: "user-branch" },
  { id: "contrib-anon-service", tenantId: "tenant-kings-grace", branchId: "branch-imaara", anonymous: true, categoryId: "gcat-offering", fundId: "fund-general", amount: 2500, currency: "KES", paymentMethod: "cash", contributionDate: "2026-08-02", source: "service", serviceId: "service-sunday-20260719", receiptStatus: "draft", verificationStatus: "verified", reconciliationStatus: "reconciled_later", restricted: false, createdBy: "user-branch", verifiedBy: "user-admin" },
  { id: "contrib-mary-event", tenantId: "tenant-kings-grace", branchId: "branch-imaara", giverPersonId: "person-visitor-mary", anonymous: false, categoryId: "gcat-event-gift", fundId: "fund-conference", amount: 1000, currency: "KES", paymentMethod: "mpesa", destinationId: "pdest-general-till", transactionReference: "RFAEVENT001", contributionDate: "2026-08-21", source: "event", eventId: "event-conference-2026", receiptStatus: "draft", verificationStatus: "pending", reconciliationStatus: "unmatched", restricted: false, createdBy: "user-admin" },
  { id: "contrib-mission-donor", tenantId: "tenant-kings-grace", branchId: "branch-ruiru", donorName: "Mission Partner", anonymous: false, categoryId: "gcat-missions", fundId: "fund-missions", amount: 20000, currency: "KES", paymentMethod: "bank_transfer", destinationId: "pdest-missions-bank", transactionReference: "BANK-MIS-001", contributionDate: "2026-08-05", source: "manual_finance_entry", receiptStatus: "draft", verificationStatus: "verified", reconciliationStatus: "matched", restricted: true, createdBy: "user-admin", verifiedBy: "user-branch" },
];

export const cashCollections: CashCollectionSession[] = [
  { id: "cash-service-sunday", tenantId: "tenant-kings-grace", branchId: "branch-imaara", source: "service", sourceId: "service-sunday-20260719", collectionDate: "2026-08-02", expectedAmount: 38000, countedAmount: 37500, countTeamUserIds: ["user-admin", "user-branch"], receiverUserId: "user-admin", discrepancy: -500, depositReference: "DEP-IMA-001", depositDate: "2026-08-03", status: "discrepancy" },
];

export const receipts: Receipt[] = [
  { id: "receipt-amina-building", tenantId: "tenant-kings-grace", branchId: "branch-imaara", receiptNumber: "KGC-IMA-2026-000001", contributionId: "contrib-amina-building", payerName: "Amina Otieno", amount: 10000, currency: "KES", categoryId: "gcat-building", fundId: "fund-building", paymentMethod: "M-Pesa", transactionReference: "RFA123BUILD", destinationId: "pdest-building-paybill", purpose: "Building Fund", issuedAt: "2026-08-01T10:00:00.000Z", issuedBy: "user-admin", verificationCode: "RCPT-KGC-000001", status: "issued" },
];

export const pledges: Pledge[] = [
  { id: "pledge-amina-building", tenantId: "tenant-kings-grace", personId: "person-amina", confidential: true, amount: 60000, currency: "KES", fundId: "fund-building", startDate: "2026-08-01", targetDate: "2027-01-31", frequency: "monthly", reminderPreference: "email", status: "partially_fulfilled", fulfilledAmount: 20000, outstandingAmount: 40000, consent: true },
];

export const partnerships: Partnership[] = [
  { id: "partner-missions", tenantId: "tenant-kings-grace", personId: "person-visitor-mary", partnerName: "Mary Wairimu", partnershipType: "missions", amount: 3000, frequency: "monthly", startDate: "2026-08-01", destinationId: "pdest-missions-bank", fundId: "fund-missions", communicationPreference: "whatsapp", status: "active", consent: true },
];

export const reconciliationImports: ReconciliationImport[] = [
  { id: "recon-mpesa-aug", tenantId: "tenant-kings-grace", destinationId: "pdest-building-paybill", importType: "mpesa_statement", status: "validated", validRows: 24, invalidRows: 1, duplicateRows: 1, unmatchedRows: 2, dryRun: true },
];

export const paymentDisputes: PaymentDispute[] = [
  { id: "disp-missing-mary", tenantId: "tenant-kings-grace", reporterPersonId: "person-visitor-mary", transactionReference: "RFAEVENT001", amount: 1000, currency: "KES", issueType: "missing_payment", status: "assigned", assignedFinanceUserId: "user-admin" },
];

export const givingCampaigns: GivingCampaign[] = [
  { id: "camp-building", tenantId: "tenant-kings-grace", fundId: "fund-building", title: "Imaara Building Project", targetAmount: 5000000, receivedAmount: 30000, publicProgress: true, status: "published" },
];
