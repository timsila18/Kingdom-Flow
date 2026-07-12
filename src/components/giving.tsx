import Link from "next/link";
import { BadgeCheck, Banknote, ClipboardList, FileCheck2, Gift, HandCoins, Landmark, ReceiptText, Repeat, Shield, WalletCards } from "lucide-react";
import { Badge, ButtonLink, Card, PageHeader, StatCard } from "@/components/ui";
import { cashCollections, contributions, funds, givingCampaigns, givingCategories, partnerships, paymentDestinations, paymentDisputes, pledges, receipts, reconciliationImports } from "@/lib/giving-data";
import { getGivingDashboard, getGivingReports, getMemberGivingPortal, getPaymentInstructions, getPledgeProgress, verifyReceiptPublic } from "@/lib/giving-engine";

export const givingLinks = [
  ["Dashboard", ""],
  ["Contributions", "contributions"],
  ["Contribution Details", "contribution-details"],
  ["Giving Categories", "categories"],
  ["Funds", "funds"],
  ["Restricted Funds", "restricted-funds"],
  ["Payment Destinations", "destinations"],
  ["Destination Approval", "destination-approval"],
  ["Cash Collections", "cash-collections"],
  ["Cash Count", "cash-count"],
  ["Handovers", "handovers"],
  ["Receipts", "receipts"],
  ["Statements", "statements"],
  ["Pledges", "pledges"],
  ["Partnerships", "partnerships"],
  ["Campaigns", "campaigns"],
  ["In-Kind Contributions", "in-kind"],
  ["Reconciliation", "reconciliation"],
  ["Statement Imports", "imports"],
  ["Missing Payments", "missing-payments"],
  ["Disputes", "disputes"],
  ["Refunds", "refunds"],
  ["Giving Reports", "reports"],
  ["Giving Settings", "settings"],
  ["Member Giving Portal", "member"],
  ["Public Giving Instructions", "public"],
  ["Receipt Verification", "verify"],
] as const;

function ContributionCard({ contribution }: { contribution: typeof contributions[number] }) {
  const category = givingCategories.find((item) => item.id === contribution.categoryId);
  const fund = funds.find((item) => item.id === contribution.fundId);
  return (
    <Card>
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-muted">{contribution.contributionDate} · {contribution.source.replaceAll("_", " ")}</p>
          <h2 className="mt-1 font-semibold">{category?.name}</h2>
          <p className="mt-2 text-sm text-muted">{fund?.name} · {contribution.currency} {contribution.amount.toLocaleString()} · {contribution.anonymous ? "anonymous" : "identified/restricted"}</p>
        </div>
        <Badge tone={contribution.verificationStatus === "verified" ? "success" : "warning"}>{contribution.verificationStatus}</Badge>
      </div>
    </Card>
  );
}

export function GivingHome({ slug, tenantId, userId }: { slug: string; tenantId: string; userId: string }) {
  const stats = getGivingDashboard({ tenantId, userId });
  return (
    <>
      <PageHeader title="Giving & Stewardship" description="Church-owned giving categories, funds, payment destinations, contributions, receipts, pledges, partnerships and reconciliation foundations." actions={<ButtonLink href={`/workspace/${slug}/giving/member`}>Member portal</ButtonLink>} />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Verified giving" value={`KES ${stats.verifiedGiving.toLocaleString()}`} />
        <StatCard label="Unverified" value={stats.unverifiedContributions} />
        <StatCard label="Receipts pending" value={stats.receiptsPending} />
        <StatCard label="Restricted inflows" value={`KES ${stats.restrictedInflows.toLocaleString()}`} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <StatCard label="Active pledges" value={stats.activePledges} />
        <StatCard label="Partnerships" value={stats.partnerships} />
        <StatCard label="Unmatched rows" value={stats.unmatchedTransactions} />
        <StatCard label="Disputes" value={stats.disputesPending} />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">{contributions.slice(0, 4).map((contribution) => <ContributionCard key={contribution.id} contribution={contribution} />)}</div>
      <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-4">{givingLinks.slice(1).map(([label, path]) => <Link key={path} href={`/workspace/${slug}/giving/${path}`} className="rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-accent"><p className="font-semibold">{label}</p><p className="mt-2 text-sm leading-6 text-muted">Open {label.toLowerCase()}.</p></Link>)}</div>
    </>
  );
}

export function GivingSetupPanel({ mode }: { mode: "categories" | "funds" | "restricted-funds" | "destinations" | "destination-approval" | "settings" | "public" }) {
  if (mode === "categories") return <><PageHeader title="Giving Categories" description="Configurable church categories without doctrinal assumptions, rankings or pressure." /><div className="mt-8 grid gap-4">{givingCategories.map((category) => <Card key={category.id}><Gift className="text-accent" /><p className="mt-3 font-semibold">{category.name}</p><p className="mt-2 text-sm text-muted">{category.categoryType.replaceAll("_", " ")} · restricted fund {category.restrictedFundRequired ? "required" : "not required"}</p></Card>)}</div></>;
  if (mode === "funds" || mode === "restricted-funds") return <><PageHeader title={mode === "funds" ? "Funds" : "Restricted Funds"} description="Funds preserve purpose, restrictions, responsible officers and reporting visibility. Full balances post in Prompt 10." /><div className="mt-8 grid gap-4">{funds.filter((fund) => mode === "funds" || fund.restricted).map((fund) => <Card key={fund.id}><Shield className="text-accent" /><p className="mt-3 font-semibold">{fund.name}</p><p className="mt-2 text-sm text-muted">{fund.purpose} · {fund.reportingVisibility.replaceAll("_", " ")}</p></Card>)}</div></>;
  if (mode === "destinations" || mode === "destination-approval") return <><PageHeader title={mode === "destinations" ? "Payment Destinations" : "Destination Approval"} description="Church-owned Paybills, Tills and bank accounts with approval, verification and historical traceability." /><div className="mt-8 grid gap-4">{paymentDestinations.map((destination) => <Card key={destination.id}><Landmark className="text-accent" /><p className="mt-3 font-semibold">{destination.label}</p><p className="mt-2 text-sm text-muted">{destination.paymentType.replaceAll("_", " ")} · {destination.status.replaceAll("_", " ")} · {destination.verificationStatus.replaceAll("_", " ")}</p></Card>)}</div></>;
  if (mode === "public") { const instructions = getPaymentInstructions("pdest-general-till"); return <><PageHeader title="Public Giving Instructions" description="Approved member-facing instructions only. Internal verification evidence stays hidden." /><Card className="mt-8"><WalletCards className="text-accent" /><p className="mt-3 font-semibold">{instructions?.label}</p><p className="mt-2 text-sm text-muted">{instructions?.instructions}</p></Card></>; }
  return <><PageHeader title="Giving Settings" description="Privacy defaults, anonymous giving, statements, household statements and group-leader total-only controls." /><Card className="mt-8"><Shield className="text-accent" /><p className="mt-3 font-semibold">Privacy by default</p><p className="mt-2 text-sm text-muted">Pastors and group leaders do not see individual giving unless explicitly granted finance permissions.</p></Card></>;
}

export function ContributionsPanel({ mode }: { mode: "contributions" | "contribution-details" | "cash-collections" | "cash-count" | "handovers" | "reconciliation" | "imports" }) {
  if (mode === "cash-collections" || mode === "cash-count" || mode === "handovers") return <><PageHeader title={mode === "cash-count" ? "Cash Count" : mode === "handovers" ? "Handovers" : "Cash Collections"} description="Service, fellowship, event and branch cash collections with count teams, handovers, deposit references and discrepancies." /><div className="mt-8 grid gap-4">{cashCollections.map((collection) => <Card key={collection.id}><HandCoins className="text-accent" /><p className="mt-3 font-semibold">{collection.source.replaceAll("_", " ")} · KES {collection.countedAmount.toLocaleString()}</p><p className="mt-2 text-sm text-muted">{collection.status.replaceAll("_", " ")} · team {collection.countTeamUserIds.length} · discrepancy {collection.discrepancy ?? 0}</p></Card>)}</div></>;
  if (mode === "reconciliation" || mode === "imports") return <><PageHeader title={mode === "imports" ? "Statement Imports" : "Reconciliation"} description="CSV/spreadsheet import, dry-run validation, duplicate detection, unmatched rows and manual match review. No journals yet." /><div className="mt-8 grid gap-4">{reconciliationImports.map((batch) => <Card key={batch.id}><ClipboardList className="text-accent" /><p className="mt-3 font-semibold">{batch.importType.replaceAll("_", " ")}</p><p className="mt-2 text-sm text-muted">valid {batch.validRows} · duplicates {batch.duplicateRows} · unmatched {batch.unmatchedRows} · dry run {String(batch.dryRun)}</p></Card>)}</div></>;
  return <><PageHeader title={mode === "contributions" ? "Contributions" : "Contribution Details"} description="Identified, anonymous, household, branch, service, group, event, programme, pledge, partnership and imported contributions." /><div className="mt-8 grid gap-4">{contributions.map((contribution) => <ContributionCard key={contribution.id} contribution={contribution} />)}</div></>;
}

export function ReceiptsPanel({ mode }: { mode: "receipts" | "statements" | "verify" }) {
  if (mode === "statements") return <><PageHeader title="Donor Statements" description="Authorized person/household statements with no rankings, no pastoral notes and audited issuance." /><Card className="mt-8"><FileCheck2 className="text-accent" /><p className="mt-3 font-semibold">Secure statement foundation</p><p className="mt-2 text-sm text-muted">Anonymous giving remains excluded. Exports require reason and permission.</p></Card></>;
  if (mode === "verify") { const receipt = verifyReceiptPublic("RCPT-KGC-000001"); return <><PageHeader title="Receipt Verification" description="Public verification reveals only church, receipt number, amount, date, category/fund and status." /><Card className="mt-8"><ReceiptText className="text-accent" /><p className="mt-3 font-semibold">{receipt?.receiptNumber}</p><p className="mt-2 text-sm text-muted">{receipt?.church} · {receipt?.currency} {receipt?.amount.toLocaleString()} · {receipt?.status}</p></Card></>; }
  return <><PageHeader title="Receipts" description="Receipt numbering, QR verification, voiding and replacement history. Issued receipts are never deleted." /><div className="mt-8 grid gap-4">{receipts.map((receipt) => <Card key={receipt.id}><ReceiptText className="text-accent" /><p className="mt-3 font-semibold">{receipt.receiptNumber}</p><p className="mt-2 text-sm text-muted">{receipt.payerName} · {receipt.currency} {receipt.amount.toLocaleString()} · {receipt.status}</p></Card>)}</div></>;
}

export function CommitmentsPanel({ mode }: { mode: "pledges" | "partnerships" | "campaigns" | "in-kind" | "missing-payments" | "disputes" | "refunds" | "member" | "reports" }) {
  if (mode === "pledges") return <><PageHeader title="Pledges" description="Private pledge schedules, respectful reminders, fulfilment tracking and no moral judgement." /><div className="mt-8 grid gap-4">{pledges.map((pledge) => { const progress = getPledgeProgress(pledge.id); return <Card key={pledge.id}><Repeat className="text-accent" /><p className="mt-3 font-semibold">KES {pledge.amount.toLocaleString()} pledge</p><p className="mt-2 text-sm text-muted">fulfilled KES {progress.fulfilledAmount.toLocaleString()} · outstanding KES {progress.outstandingAmount.toLocaleString()}</p></Card>; })}</div></>;
  if (mode === "partnerships") return <><PageHeader title="Partnerships" description="Recurring ministry partnerships that remain separate from membership status." /><div className="mt-8 grid gap-4">{partnerships.map((partnership) => <Card key={partnership.id}><Repeat className="text-accent" /><p className="mt-3 font-semibold">{partnership.partnerName}</p><p className="mt-2 text-sm text-muted">{partnership.partnershipType} · KES {partnership.amount.toLocaleString()} · {partnership.frequency}</p></Card>)}</div></>;
  if (mode === "campaigns") return <><PageHeader title="Campaigns" description="Public campaign progress where enabled, without pressure messaging or expenditure claims." /><div className="mt-8 grid gap-4">{givingCampaigns.map((campaign) => <Card key={campaign.id}><Banknote className="text-accent" /><p className="mt-3 font-semibold">{campaign.title}</p><p className="mt-2 text-sm text-muted">KES {campaign.receivedAmount.toLocaleString()} of KES {campaign.targetAmount.toLocaleString()} · public {String(campaign.publicProgress)}</p></Card>)}</div></>;
  if (mode === "missing-payments" || mode === "disputes" || mode === "refunds") return <><PageHeader title={mode === "refunds" ? "Refunds" : mode === "disputes" ? "Disputes" : "Missing Payments"} description="Missing payment, dispute and refund-review workflows. No fake refund or payment completion." /><div className="mt-8 grid gap-4">{paymentDisputes.map((dispute) => <Card key={dispute.id}><BadgeCheck className="text-warning" /><p className="mt-3 font-semibold">{dispute.issueType.replaceAll("_", " ")}</p><p className="mt-2 text-sm text-muted">{dispute.status.replaceAll("_", " ")} · reference protected in notifications</p></Card>)}</div></>;
  if (mode === "member") { const portal = getMemberGivingPortal("person-amina"); return <><PageHeader title="Member Giving Portal" description="Own verified contributions, receipts, pledges, partnerships, payment instructions and missing-payment reports." /><div className="mt-8 grid gap-4 md:grid-cols-4"><StatCard label="My verified gifts" value={portal.contributions.length} /><StatCard label="Receipts" value={portal.receipts.length} /><StatCard label="Pledges" value={portal.pledges.length} /><StatCard label="Partnerships" value={portal.partnerships.length} /></div><Card className="mt-8"><p className="font-semibold">Privacy note</p><p className="mt-2 text-sm text-muted">{portal.privacyNote}</p></Card></>; }
  if (mode === "reports") { const reports = getGivingReports({ tenantId: "tenant-kings-grace", userId: "user-admin" }); return <><PageHeader title="Giving Reports" description="Contribution register, category/fund totals, branch totals, receipts, pledges, partnerships, campaigns, restrictions and reconciliation exceptions." /><div className="mt-8 grid gap-4 md:grid-cols-4"><StatCard label="Register" value={reports.contributionRegister.length} /><StatCard label="Receipts issued" value={reports.receiptsIssued} /><StatCard label="Anonymous total" value={`KES ${reports.anonymousGiving.toLocaleString()}`} /><StatCard label="Exceptions" value={reports.reconciliationExceptions.length} /></div></>; }
  return <><PageHeader title="In-Kind Contributions" description="Non-cash contribution placeholder with evidence, valuation metadata and handover records." /><Card className="mt-8"><Gift className="text-accent" /><p className="mt-3 font-semibold">In-kind foundation</p><p className="mt-2 text-sm text-muted">Full stock/procurement accounting arrives in Prompt 10.</p></Card></>;
}

export function GivingSectionPanel({ section, slug, tenantId, userId }: { section: string; slug: string; tenantId: string; userId: string }) {
  if (section === "categories" || section === "funds" || section === "restricted-funds" || section === "destinations" || section === "destination-approval" || section === "settings" || section === "public") return <GivingSetupPanel mode={section} />;
  if (section === "contributions" || section === "contribution-details" || section === "cash-collections" || section === "cash-count" || section === "handovers" || section === "reconciliation" || section === "imports") return <ContributionsPanel mode={section} />;
  if (section === "receipts" || section === "statements" || section === "verify") return <ReceiptsPanel mode={section} />;
  if (section === "pledges" || section === "partnerships" || section === "campaigns" || section === "in-kind" || section === "missing-payments" || section === "disputes" || section === "refunds" || section === "member" || section === "reports") return <CommitmentsPanel mode={section} />;
  return <GivingHome slug={slug} tenantId={tenantId} userId={userId} />;
}

export function GivingPrivacyNotice() {
  return <div className="rounded-lg border border-border bg-surface p-4 text-sm leading-6 text-muted"><p>Giving records are private by default. KingdomFlow does not take a percentage of church giving, does not rank generosity, and keeps subscription billing separate from church funds.</p></div>;
}
