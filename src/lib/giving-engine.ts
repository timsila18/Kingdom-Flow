import { can } from "./authority-engine";
import { people } from "./people-data";
import { getPersonName } from "./people-engine";
import { cashCollections, contributions, destinationApprovals, fundRestrictions, funds, givingCampaigns, givingCategories, partnerships, paymentDestinations, paymentDisputes, pledges, receipts, reconciliationImports } from "./giving-data";
import type { Contribution, PaymentDestination, Receipt } from "./giving-types";
import type { PermissionKey } from "./types";

export interface GivingContext {
  tenantId: string;
  userId: string;
  branchId?: string;
}

export function canAccessGiving(userId: string, tenantId: string, permission: PermissionKey, branchId?: string) {
  return can(userId, permission, { tenantId, scopeType: branchId ? "branch" : "tenant", scopeId: branchId });
}

export function getPaymentInstructions(destinationId: string) {
  const destination = paymentDestinations.find((item) => item.id === destinationId);
  if (!destination || destination.status !== "active") return undefined;
  return {
    label: destination.label,
    purpose: destination.purpose,
    paymentType: destination.paymentType,
    paybillNumber: destination.paybillNumber,
    tillNumber: destination.tillNumber,
    bankName: destination.bankName,
    accountName: destination.accountName,
    accountNumber: destination.accountNumber,
    currency: destination.currency,
    referenceRule: destination.referenceRule,
    instructions: destination.displayInstructions,
    supportContact: "finance@kingsgrace.test",
    internalVerificationHidden: true,
  };
}

export function createPaymentDestination(input: Omit<PaymentDestination, "id" | "verificationStatus" | "status">) {
  return { ...input, id: `pdest-${input.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, verificationStatus: "unverified" as const, status: "pending_approval" as const, approvalRequired: true };
}

export function approvePaymentDestination(destinationId: string, approverUserId: string) {
  const destination = paymentDestinations.find((item) => item.id === destinationId);
  if (!destination) throw new Error("Destination not found");
  if (destination.createdBy === approverUserId) return { allowed: false, reason: "Separation of duties: creator cannot approve this destination alone." };
  if (destinationApprovals.some((approval) => approval.destinationId === destinationId && approval.reviewerUserId === approverUserId && approval.status === "reviewed")) {
    return { allowed: true, destination: { ...destination, status: "active" as const, verificationStatus: "verified_internally" as const } };
  }
  const allowed = canAccessGiving(approverUserId, destination.tenantId, "giving.destination.approve", destination.branchId);
  if (!allowed.allowed) return allowed;
  return { allowed: true, destination: { ...destination, status: "active" as const, verificationStatus: "verified_internally" as const } };
}

export function verifyContribution(contributionId: string, verifierUserId: string, reference?: string) {
  const contribution = contributions.find((item) => item.id === contributionId);
  if (!contribution) throw new Error("Contribution not found");
  const allowed = canAccessGiving(verifierUserId, contribution.tenantId, "giving.contribution.verify", contribution.branchId);
  if (!allowed.allowed) return allowed;
  const duplicate = reference && contributions.some((item) => item.id !== contributionId && item.transactionReference === reference);
  if (duplicate) return { allowed: false, reason: "Duplicate transaction reference requires review." };
  return { allowed: true, contribution: { ...contribution, transactionReference: reference ?? contribution.transactionReference, verificationStatus: "verified" as const, verifiedBy: verifierUserId } };
}

export function recordAnonymousContribution(input: Pick<Contribution, "tenantId" | "branchId" | "categoryId" | "fundId" | "amount" | "currency" | "paymentMethod" | "contributionDate" | "source" | "createdBy">) {
  return { ...input, id: `contrib-anon-${input.contributionDate}`, anonymous: true, receiptStatus: "draft" as const, verificationStatus: "pending" as const, reconciliationStatus: "unmatched" as const, restricted: Boolean(funds.find((fund) => fund.id === input.fundId)?.restricted) };
}

export function finalizeCashCollection(collectionId: string, actorUserId: string) {
  const collection = cashCollections.find((item) => item.id === collectionId);
  if (!collection) throw new Error("Cash collection not found");
  if (collection.countTeamUserIds.length < 2) return { allowed: false, reason: "Cash count requires at least two count team members." };
  if (collection.countTeamUserIds.includes(actorUserId) && collection.receiverUserId === actorUserId) return { allowed: false, reason: "Separation of duties: counter cannot silently finalize receipt." };
  const allowed = canAccessGiving(actorUserId, collection.tenantId, "giving.cash_count.manage", collection.branchId);
  if (!allowed.allowed) return allowed;
  return { allowed: true, collection: { ...collection, status: collection.discrepancy ? "discrepancy" as const : "verified" as const } };
}

export function issueReceipt(contributionId: string, issuerUserId: string): { allowed: boolean; reason?: string; receipt?: Receipt } {
  const contribution = contributions.find((item) => item.id === contributionId);
  if (!contribution) throw new Error("Contribution not found");
  const allowed = canAccessGiving(issuerUserId, contribution.tenantId, "giving.receipt.issue", contribution.branchId);
  if (!allowed.allowed) return allowed;
  if (contribution.verificationStatus !== "verified") return { allowed: false, reason: "Final receipt cannot be issued before verification." };
  const sequence = receipts.length + 1;
  const payer = contribution.anonymous ? "Anonymous" : contribution.giverPersonId ? getPersonName(people.find((person) => person.id === contribution.giverPersonId)!) : contribution.donorName ?? "Contributor";
  return { allowed: true, receipt: { id: `receipt-${contribution.id}`, tenantId: contribution.tenantId, branchId: contribution.branchId, receiptNumber: `KGC-${contribution.branchId === "branch-imaara" ? "IMA" : "BR"}-2026-${sequence.toString().padStart(6, "0")}`, contributionId, payerName: payer, amount: contribution.amount, currency: contribution.currency, categoryId: contribution.categoryId, fundId: contribution.fundId, paymentMethod: contribution.paymentMethod, transactionReference: contribution.transactionReference, destinationId: contribution.destinationId, purpose: givingCategories.find((category) => category.id === contribution.categoryId)?.name ?? "Contribution", issuedAt: "2026-08-06T10:00:00.000Z", issuedBy: issuerUserId, verificationCode: `RCPT-${contribution.id.toUpperCase()}`, status: "issued" } };
}

export function verifyReceiptPublic(code: string) {
  const receipt = receipts.find((item) => item.verificationCode === code || item.receiptNumber === code);
  if (!receipt) return undefined;
  return {
    church: "King's Grace",
    receiptNumber: receipt.receiptNumber,
    amount: receipt.amount,
    currency: receipt.currency,
    date: receipt.issuedAt?.slice(0, 10),
    category: givingCategories.find((item) => item.id === receipt.categoryId)?.name,
    fund: funds.find((item) => item.id === receipt.fundId)?.name,
    status: receipt.status,
  };
}

export function voidReceipt(receiptId: string, reason: string, actorUserId: string) {
  const receipt = receipts.find((item) => item.id === receiptId);
  if (!receipt) throw new Error("Receipt not found");
  const allowed = canAccessGiving(actorUserId, receipt.tenantId, "giving.receipt.void", receipt.branchId);
  if (!allowed.allowed) return allowed;
  return { allowed: true, receipt: { ...receipt, status: "voided" as const, voidReason: reason } };
}

export function getMemberGivingPortal(personId: string) {
  const ownContributions = contributions.filter((item) => item.giverPersonId === personId && item.verificationStatus === "verified");
  return {
    paymentInstructions: paymentDestinations.filter((item) => item.status === "active").map((item) => getPaymentInstructions(item.id)),
    contributions: ownContributions,
    receipts: receipts.filter((receipt) => ownContributions.some((contribution) => contribution.id === receipt.contributionId)),
    pledges: pledges.filter((pledge) => pledge.personId === personId),
    partnerships: partnerships.filter((partnership) => partnership.personId === personId),
    privacyNote: "Only your own verified giving is shown. No comparisons or rankings are created.",
  };
}

export function getPledgeProgress(pledgeId: string) {
  const pledge = pledges.find((item) => item.id === pledgeId);
  if (!pledge) throw new Error("Pledge not found");
  const matched = contributions.filter((item) => item.pledgeId === pledgeId && item.verificationStatus === "verified").reduce((sum, item) => sum + item.amount, 0);
  return { ...pledge, fulfilledAmount: matched, outstandingAmount: Math.max(pledge.amount - matched, 0), reminderMessage: "A gentle reminder is available if you requested it. No spiritual pressure is attached." };
}

export function requestRestrictedReclassification(contributionId: string, actorUserId: string, reason: string, supportingDocument?: string) {
  const contribution = contributions.find((item) => item.id === contributionId);
  if (!contribution) throw new Error("Contribution not found");
  if (!contribution.restricted) return { allowed: true, reason: "Contribution is not restricted." };
  const allowed = canAccessGiving(actorUserId, contribution.tenantId, "giving.contribution.correct", contribution.branchId);
  if (!allowed.allowed) return allowed;
  if (!reason || !supportingDocument) return { allowed: false, reason: "Restricted reclassification requires a reason and supporting document." };
  return { allowed: true, correctionRequest: { contributionId, reason, supportingDocument, status: "pending_approval" as const } };
}

export function importReconciliationRows(importId: string) {
  const batch = reconciliationImports.find((item) => item.id === importId);
  if (!batch) throw new Error("Import not found");
  return { ...batch, duplicateReviewRequired: batch.duplicateRows > 0, unmatchedReviewRequired: batch.unmatchedRows > 0, noJournalCreated: true };
}

export function getGivingDashboard(context: GivingContext) {
  const verified = contributions.filter((item) => item.tenantId === context.tenantId && item.verificationStatus === "verified");
  return {
    verifiedGiving: verified.reduce((sum, item) => sum + item.amount, 0),
    unverifiedContributions: contributions.filter((item) => item.tenantId === context.tenantId && item.verificationStatus !== "verified").length,
    paymentMethods: new Set(contributions.map((item) => item.paymentMethod)).size,
    categories: givingCategories.filter((item) => item.tenantId === context.tenantId && item.status === "active").length,
    funds: funds.filter((item) => item.tenantId === context.tenantId && item.status === "active").length,
    handoversPending: cashCollections.filter((item) => item.tenantId === context.tenantId && !["verified", "reconciled_later"].includes(item.status)).length,
    unmatchedTransactions: reconciliationImports.reduce((sum, item) => item.tenantId === context.tenantId ? sum + item.unmatchedRows : sum, 0),
    receiptsPending: contributions.filter((item) => item.tenantId === context.tenantId && item.receiptStatus === "draft").length,
    activePledges: pledges.filter((item) => item.tenantId === context.tenantId && item.status.includes("active")).length,
    partnerships: partnerships.filter((item) => item.tenantId === context.tenantId && item.status === "active").length,
    restrictedInflows: verified.filter((item) => item.restricted).reduce((sum, item) => sum + item.amount, 0),
    disputesPending: paymentDisputes.filter((item) => item.tenantId === context.tenantId && !["resolved", "closed"].includes(item.status)).length,
  };
}

export function getGivingReports(context: GivingContext) {
  const canViewIndividual = canAccessGiving(context.userId, context.tenantId, "giving.contribution.view_individual", context.branchId).allowed;
  return {
    contributionRegister: contributions.filter((item) => item.tenantId === context.tenantId).map((item) => canViewIndividual ? item : { ...item, giverPersonId: undefined, donorName: item.anonymous ? undefined : "Restricted" }),
    categoryTotals: givingCategories.map((category) => ({ category: category.name, total: contributions.filter((item) => item.categoryId === category.id && item.verificationStatus === "verified").reduce((sum, item) => sum + item.amount, 0) })),
    fundTotals: funds.map((fund) => ({ fund: fund.name, restricted: fund.restricted, total: contributions.filter((item) => item.fundId === fund.id && item.verificationStatus === "verified").reduce((sum, item) => sum + item.amount, 0) })),
    anonymousGiving: contributions.filter((item) => item.anonymous).reduce((sum, item) => sum + item.amount, 0),
    receiptsIssued: receipts.filter((item) => item.status === "issued").length,
    pledges: canViewIndividual ? pledges : [],
    partnerships: canViewIndividual ? partnerships : [],
    campaigns: givingCampaigns,
    restrictedFunds: fundRestrictions.filter((item) => item.active),
    reconciliationExceptions: reconciliationImports.filter((item) => item.duplicateRows || item.unmatchedRows),
    disputes: paymentDisputes.filter((item) => item.tenantId === context.tenantId),
  };
}
