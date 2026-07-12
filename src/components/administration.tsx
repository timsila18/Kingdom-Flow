import Link from "next/link";
import { BadgeDollarSign, Banknote, Boxes, BriefcaseBusiness, Building2, Bus, ClipboardCheck, ClipboardList, FileBarChart2, FileText, Landmark, PackageCheck, ReceiptText, Shield, Truck, UsersRound, WalletCards } from "lucide-react";
import { ButtonLink, Card, PageHeader, StatCard } from "@/components/ui";
import { accounts, assets, bankReconciliations, budgetLines, budgets, customerInvoices, employmentRecords, facilityBookings, financialAccounts, goodsReceipts, inventoryItems, paymentRequests, paymentVouchers, payrollRuns, projects, purchaseOrders, quotationEvaluations, stockCounts, stores, supplierInvoices, suppliers, vehicles } from "@/lib/administration-data";
import { getAdministrationDashboard, getAdministrationReports, getFinancialStatements, getFundStatement } from "@/lib/administration-engine";

export const administrationLinks = [
  ["Dashboard", ""],
  ["Chart of Accounts", "accounts"],
  ["Journals", "journals"],
  ["Ledger", "ledger"],
  ["Trial Balance", "trial-balance"],
  ["Financial Statements", "statements"],
  ["Funds", "funds"],
  ["Bank Accounts", "bank-accounts"],
  ["Reconciliation", "reconciliation"],
  ["Petty Cash", "petty-cash"],
  ["Budgets", "budgets"],
  ["Budget Controls", "budget-controls"],
  ["Payment Requests", "payment-requests"],
  ["Payment Vouchers", "payment-vouchers"],
  ["Suppliers", "suppliers"],
  ["Procurement Requests", "procurement"],
  ["Quotations", "quotations"],
  ["Purchase Orders", "purchase-orders"],
  ["Goods Receipts", "goods-receipts"],
  ["Supplier Invoices", "supplier-invoices"],
  ["Receivables", "receivables"],
  ["Inventory", "inventory"],
  ["Stores", "stores"],
  ["Stock Counts", "stock-counts"],
  ["Assets", "assets"],
  ["Maintenance", "maintenance"],
  ["Projects", "projects"],
  ["Project Details", "project-details"],
  ["Facilities", "facilities"],
  ["Bookings", "bookings"],
  ["Utilities", "utilities"],
  ["Vehicles", "vehicles"],
  ["Transport Requests", "transport"],
  ["Trip Logs", "trip-logs"],
  ["HR Dashboard", "hr"],
  ["Employees", "employees"],
  ["Positions", "positions"],
  ["Recruitment", "recruitment"],
  ["Contracts", "contracts"],
  ["Onboarding", "onboarding"],
  ["Leave", "leave"],
  ["Attendance", "attendance"],
  ["Payroll", "payroll"],
  ["Payslips", "payslips"],
  ["Performance", "performance"],
  ["Training", "training"],
  ["Discipline", "discipline"],
  ["Staff Self-Service", "self-service"],
  ["Reports", "reports"],
] as const;

function AdminTile({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-accent"><p className="font-semibold">{label}</p><p className="mt-2 text-sm leading-6 text-muted">Open {label.toLowerCase()}.</p></Link>;
}

export function AdministrationHome({ slug, tenantId, userId }: { slug: string; tenantId: string; userId: string }) {
  const dashboard = getAdministrationDashboard({ tenantId, userId });
  return (
    <>
      <PageHeader title="Finance & Operations" description="Accounting, budgets, payments, procurement, inventory, assets, projects, facilities, transport, HR and payroll with accountable workflows." actions={<ButtonLink href={`/workspace/${slug}/administration/payment-requests`}>New payment request</ButtonLink>} />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Cash and bank accounts" value={dashboard.cashAndBank} />
        <StatCard label="Unreconciled accounts" value={dashboard.unreconciledAccounts} />
        <StatCard label="Payables due" value={dashboard.payablesDue} />
        <StatCard label="Inventory value" value={`KES ${dashboard.inventoryValue.toLocaleString()}`} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <StatCard label="Pending payments" value={dashboard.paymentRequestsPending} />
        <StatCard label="Contributions awaiting posting" value={dashboard.contributionsAwaitingPosting} />
        <StatCard label="Payroll status" value={dashboard.payrollStatus ?? "not opened"} />
        <StatCard label="Restricted funds" value={dashboard.restrictedFundBalances.length} />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-4">{administrationLinks.slice(1).map(([label, path]) => <AdminTile key={path} href={`/workspace/${slug}/administration/${path}`} label={label} />)}</div>
    </>
  );
}

export function AccountingPanel({ mode }: { mode: "accounts" | "journals" | "ledger" | "trial-balance" | "statements" | "funds" | "bank-accounts" | "reconciliation" | "petty-cash" }) {
  const statements = getFinancialStatements("tenant-kings-grace");
  if (mode === "accounts") return <><PageHeader title="Chart of Accounts" description="Configurable asset, liability, accumulated fund, income and expense accounts with posting controls." /><div className="mt-8 grid gap-4">{accounts.map((account) => <Card key={account.id}><Landmark className="text-accent" /><p className="mt-3 font-semibold">{account.code} · {account.name}</p><p className="mt-2 text-sm text-muted">{account.type} · {account.subtype} · posting {account.postingAllowed ? "allowed" : "blocked"}</p></Card>)}</div></>;
  if (mode === "trial-balance" || mode === "ledger" || mode === "statements") return <><PageHeader title={mode === "trial-balance" ? "Trial Balance" : mode === "ledger" ? "General Ledger" : "Financial Statements"} description="Posted journal lines feed the ledger, trial balance, income statement, balance sheet and cash-flow foundation." /><div className="mt-8 grid gap-4">{statements.trialBalance.map((line) => <Card key={line.accountCode}><FileBarChart2 className="text-accent" /><p className="mt-3 font-semibold">{line.accountCode} · {line.accountName}</p><p className="mt-2 text-sm text-muted">debit KES {line.debit.toLocaleString()} · credit KES {line.credit.toLocaleString()} · balance KES {line.balance.toLocaleString()}</p></Card>)}</div></>;
  if (mode === "funds") { const fund = getFundStatement("fund-building"); return <><PageHeader title="Fund Accounting" description="Restricted, unrestricted, project and branch funds with inflows, outflows, commitments and remaining balance." /><Card className="mt-8"><Shield className="text-accent" /><p className="mt-3 font-semibold">Building restricted fund</p><p className="mt-2 text-sm text-muted">available KES {fund.availableBalance.toLocaleString()} · commitments KES {fund.commitments.toLocaleString()} · restricted-fund integrity preserved</p></Card></>; }
  if (mode === "bank-accounts" || mode === "petty-cash") return <><PageHeader title={mode === "petty-cash" ? "Petty Cash" : "Bank, Cash & Mobile Money"} description="Financial accounts extend Prompt 9 payment destinations into bank, Paybill, Till, cash-office and petty-cash controls." /><div className="mt-8 grid gap-4">{financialAccounts.map((account) => <Card key={account.id}><WalletCards className="text-accent" /><p className="mt-3 font-semibold">{account.label}</p><p className="mt-2 text-sm text-muted">{account.accountType.replaceAll("_", " ")} · custodian protected · reconciliation {account.reconciliationRequired ? "required" : "optional"}</p></Card>)}</div></>;
  if (mode === "reconciliation") return <><PageHeader title="Bank Reconciliation" description="Statement import, auto matching, manual matching, unmatched items, bank charges, approval and lock." /><div className="mt-8 grid gap-4">{bankReconciliations.map((recon) => <Card key={recon.id}><ClipboardCheck className="text-accent" /><p className="mt-3 font-semibold">{recon.status.replaceAll("_", " ")}</p><p className="mt-2 text-sm text-muted">statement KES {recon.statementClosingBalance.toLocaleString()} · system KES {recon.systemClosingBalance.toLocaleString()} · unmatched KES {recon.unmatchedTotal.toLocaleString()}</p></Card>)}</div></>;
  return <><PageHeader title="Journals" description="Draft, submitted, reviewed, approved, posted, reversed and cancelled double-entry journals. Posted records are corrected through reversals." /><div className="mt-8 grid gap-4"><Card><ReceiptText className="text-accent" /><p className="mt-3 font-semibold">JV-2026-0001</p><p className="mt-2 text-sm text-muted">posted · giving source · balanced debit and credit · original contribution unchanged</p></Card></div></>;
}

export function BudgetPaymentPanel({ mode }: { mode: "budgets" | "budget-controls" | "payment-requests" | "payment-vouchers" }) {
  if (mode === "budgets" || mode === "budget-controls") return <><PageHeader title={mode === "budgets" ? "Budgets" : "Budget Controls"} description="Annual, branch, department, programme, event, project and fund budgets with phased lines, revisions and emergency overrides." /><div className="mt-8 grid gap-4">{budgets.map((budget) => <Card key={budget.id}><BadgeDollarSign className="text-accent" /><p className="mt-3 font-semibold">{budget.name}</p><p className="mt-2 text-sm text-muted">{budget.status} · version {budget.version} · lines {budgetLines.filter((line) => line.budgetId === budget.id).length}</p></Card>)}</div></>;
  if (mode === "payment-vouchers") return <><PageHeader title="Payment Vouchers" description="Approved requests become vouchers. Paid status requires an actual payment reference or approved manual confirmation." /><div className="mt-8 grid gap-4">{paymentVouchers.map((voucher) => <Card key={voucher.id}><Banknote className="text-accent" /><p className="mt-3 font-semibold">{voucher.voucherNumber}</p><p className="mt-2 text-sm text-muted">{voucher.payeeName} · net KES {voucher.netAmount.toLocaleString()} · {voucher.status}</p></Card>)}</div></>;
  return <><PageHeader title="Payment Requests" description="Requester, branch, department, project, fund, budget, supplier, attachments and approval chain in one workflow." /><div className="mt-8 grid gap-4">{paymentRequests.map((request) => <Card key={request.id}><ClipboardList className="text-accent" /><p className="mt-3 font-semibold">{request.purpose}</p><p className="mt-2 text-sm text-muted">{request.payeeName} · KES {request.amount.toLocaleString()} · {request.status.replaceAll("_", " ")}</p></Card>)}</div></>;
}

export function ProcurementPanel({ mode }: { mode: "suppliers" | "procurement" | "quotations" | "purchase-orders" | "goods-receipts" | "supplier-invoices" | "receivables" }) {
  if (mode === "suppliers") return <><PageHeader title="Suppliers" description="Supplier onboarding, due diligence, conflict declarations, bank-detail approvals and restricted payment details." /><div className="mt-8 grid gap-4">{suppliers.map((supplier) => <Card key={supplier.id}><BriefcaseBusiness className="text-accent" /><p className="mt-3 font-semibold">{supplier.name}</p><p className="mt-2 text-sm text-muted">{supplier.approvalStatus.replaceAll("_", " ")} · risk {supplier.riskStatus} · bank details restricted</p></Card>)}</div></>;
  if (mode === "quotations") return <><PageHeader title="Quotations & Evaluation" description="Supplier invitations, quotation upload, price, delivery, compliance, panel evaluation and conflict declarations." /><div className="mt-8 grid gap-4">{quotationEvaluations.map((evaluation) => <Card key={evaluation.id}><ClipboardCheck className="text-accent" /><p className="mt-3 font-semibold">Evaluation criteria</p><p className="mt-2 text-sm text-muted">{evaluation.criteria.join(", ")} · cheapest supplier not automatically selected</p></Card>)}</div></>;
  if (mode === "purchase-orders") return <><PageHeader title="Purchase Orders" description="Approved POs with supplier, requisition, items, delivery location, fund, project and receipt status." /><div className="mt-8 grid gap-4">{purchaseOrders.map((po) => <Card key={po.id}><PackageCheck className="text-accent" /><p className="mt-3 font-semibold">{po.poNumber}</p><p className="mt-2 text-sm text-muted">KES {po.total.toLocaleString()} · {po.status.replaceAll("_", " ")}</p></Card>)}</div></>;
  if (mode === "goods-receipts") return <><PageHeader title="Goods & Service Receipts" description="Goods received, service confirmation, discrepancies, rejected quantities and payment blocking when receipts are missing." /><div className="mt-8 grid gap-4">{goodsReceipts.map((receipt) => <Card key={receipt.id}><Truck className="text-accent" /><p className="mt-3 font-semibold">{receipt.deliveryNote}</p><p className="mt-2 text-sm text-muted">received {receipt.quantityReceived} of {receipt.quantityOrdered} · {receipt.condition}</p></Card>)}</div></>;
  if (mode === "supplier-invoices") return <><PageHeader title="Supplier Invoices & Payables" description="PO/GRN matching, duplicate detection, due dates, approval, payment status and journal status." /><div className="mt-8 grid gap-4">{supplierInvoices.map((invoice) => <Card key={invoice.id}><FileText className="text-accent" /><p className="mt-3 font-semibold">{invoice.invoiceNumber}</p><p className="mt-2 text-sm text-muted">KES {invoice.amount.toLocaleString()} · {invoice.paymentStatus.replaceAll("_", " ")} · {invoice.journalStatus.replaceAll("_", " ")}</p></Card>)}</div></>;
  if (mode === "receivables") return <><PageHeader title="Accounts Receivable" description="Hall hire, bookshop, training, sponsorship, rental and service-contract receivables. Pledges are not receivables unless configured." /><div className="mt-8 grid gap-4">{customerInvoices.map((invoice) => <Card key={invoice.id}><ReceiptText className="text-accent" /><p className="mt-3 font-semibold">{invoice.customerName}</p><p className="mt-2 text-sm text-muted">{invoice.source.replaceAll("_", " ")} · outstanding KES {(invoice.amount - invoice.paidAmount).toLocaleString()}</p></Card>)}</div></>;
  return <><PageHeader title="Procurement Requests" description="Requisitions use value, branch, category, budget and fund routing before quotation and PO." /><Card className="mt-8"><ClipboardList className="text-accent" /><p className="mt-3 font-semibold">Camera kit for media ministry</p><p className="mt-2 text-sm text-muted">approved · budget checked · quotations required</p></Card></>;
}

export function OperationsPanel({ mode }: { mode: "inventory" | "stores" | "stock-counts" | "assets" | "maintenance" | "projects" | "project-details" | "facilities" | "bookings" | "utilities" | "vehicles" | "transport" | "trip-logs" }) {
  if (mode === "inventory") return <><PageHeader title="Inventory" description="Stores, stock on hand, reservations, reorder, expiry, batch, serial and transaction controls." /><div className="mt-8 grid gap-4">{inventoryItems.map((item) => <Card key={item.id}><Boxes className="text-accent" /><p className="mt-3 font-semibold">{item.sku} · {item.name}</p><p className="mt-2 text-sm text-muted">{item.quantityOnHand} {item.unit} on hand · reorder at {item.reorderLevel}</p></Card>)}</div></>;
  if (mode === "stores" || mode === "stock-counts") return <><PageHeader title={mode === "stores" ? "Stores & Locations" : "Stock Counts"} description="Central, branch, department, event, project and mobile stores with custodians, counts and discrepancy approvals." /><div className="mt-8 grid gap-4">{(mode === "stores" ? stores : stockCounts).map((item) => <Card key={item.id}><PackageCheck className="text-accent" /><p className="mt-3 font-semibold">{"name" in item ? item.name : item.countType}</p><p className="mt-2 text-sm text-muted">{"location" in item ? item.location : item.status}</p></Card>)}</div></>;
  if (mode === "assets" || mode === "maintenance") return <><PageHeader title={mode === "assets" ? "Asset Register" : "Maintenance"} description="Assets, assignments, transfers, maintenance, depreciation proposal and disposal with custody history." /><div className="mt-8 grid gap-4">{assets.map((asset) => <Card key={asset.id}><Building2 className="text-accent" /><p className="mt-3 font-semibold">{asset.assetNumber} · {asset.name}</p><p className="mt-2 text-sm text-muted">{asset.status} · {asset.condition} · KES {asset.acquisitionCost.toLocaleString()}</p></Card>)}</div></>;
  if (mode === "projects" || mode === "project-details") return <><PageHeader title={mode === "projects" ? "Projects" : "Project Details"} description="Project budgets, funds, milestones, risks, commitments, expenditure and safe public updates." /><div className="mt-8 grid gap-4">{projects.map((project) => <Card key={project.id}><ClipboardCheck className="text-accent" /><p className="mt-3 font-semibold">{project.name}</p><p className="mt-2 text-sm text-muted">{project.status} · restricted fund linked · public updates {String(project.publicUpdates)}</p></Card>)}</div></>;
  if (mode === "vehicles" || mode === "transport" || mode === "trip-logs") return <><PageHeader title={mode === "vehicles" ? "Vehicles" : mode === "trip-logs" ? "Trip Logs" : "Transport Requests"} description="Fleet, drivers, assignments, trip logs, fuel, incidents and maintenance." /><div className="mt-8 grid gap-4">{vehicles.map((vehicle) => <Card key={vehicle.id}><Bus className="text-accent" /><p className="mt-3 font-semibold">{vehicle.registrationNumber}</p><p className="mt-2 text-sm text-muted">{vehicle.status} · custodian assigned · fuel logs controlled</p></Card>)}</div></>;
  return <><PageHeader title={mode === "bookings" ? "Facility Bookings" : mode === "utilities" ? "Utilities" : "Facilities"} description="Facilities, venue bookings, conflict detection, setup requirements, utilities and maintenance requests." /><div className="mt-8 grid gap-4">{facilityBookings.map((booking) => <Card key={booking.id}><Building2 className="text-accent" /><p className="mt-3 font-semibold">{booking.title}</p><p className="mt-2 text-sm text-muted">{booking.status} · setup {booking.setupRequirements.join(", ")}</p></Card>)}</div></>;
}

export function HrPanel({ mode }: { mode: "hr" | "employees" | "positions" | "recruitment" | "contracts" | "onboarding" | "leave" | "attendance" | "payroll" | "payslips" | "performance" | "training" | "discipline" | "self-service" }) {
  if (mode === "payroll" || mode === "payslips") return <><PageHeader title={mode === "payroll" ? "Payroll" : "Payslips"} description="Configurable payroll periods, earning and deduction types, review, approval, payment advice, journals and private payslips." /><div className="mt-8 grid gap-4">{payrollRuns.map((run) => <Card key={run.id}><Banknote className="text-accent" /><p className="mt-3 font-semibold">{run.status} payroll</p><p className="mt-2 text-sm text-muted">gross KES {run.grossPay.toLocaleString()} · net KES {run.netPay.toLocaleString()} · rates configurable</p></Card>)}</div></>;
  if (mode === "employees" || mode === "hr") return <><PageHeader title={mode === "hr" ? "HR Dashboard" : "Employees"} description="Employees, clergy, ministry staff, contracts, leave, attendance, training, performance and restricted HR cases." /><div className="mt-8 grid gap-4">{employmentRecords.map((employee) => <Card key={employee.id}><UsersRound className="text-accent" /><p className="mt-3 font-semibold">{employee.employeeNumber}</p><p className="mt-2 text-sm text-muted">{employee.employmentType} · {employee.status} · salary restricted</p></Card>)}</div></>;
  if (mode === "leave" || mode === "attendance" || mode === "self-service") return <><PageHeader title={mode === "self-service" ? "Staff Self-Service" : mode === "attendance" ? "Attendance" : "Leave"} description="Self-service profile, contracts, leave, own payslips, reimbursements, assigned assets, goals and HR requests." /><Card className="mt-8"><ClipboardCheck className="text-accent" /><p className="mt-3 font-semibold">Leave and acting appointment</p><p className="mt-2 text-sm text-muted">Branch Pastor leave can create a Prompt 2 acting appointment with defined limits.</p></Card></>;
  if (mode === "performance" || mode === "training" || mode === "discipline") return <><PageHeader title={mode === "discipline" ? "Disciplinary Foundation" : mode === "training" ? "Staff Training" : "Performance"} description="Controlled HR workflows. No legal conclusions, no forced spiritual scoring unless lawfully configured and role-relevant." /><Card className="mt-8"><Shield className="text-accent" /><p className="mt-3 font-semibold">Restricted HR access</p><p className="mt-2 text-sm text-muted">Pastors do not automatically see payroll or disciplinary files. Safeguarding allegations link to Prompt 4.</p></Card></>;
  return <><PageHeader title={mode === "positions" ? "Positions" : mode === "contracts" ? "Contracts" : mode === "onboarding" ? "Onboarding" : "Recruitment"} description="Establishment, vacancies, applications, interviews, contracts, onboarding tasks and expiry alerts." /><Card className="mt-8"><BriefcaseBusiness className="text-accent" /><p className="mt-3 font-semibold">Employment controls</p><p className="mt-2 text-sm text-muted">Salary, bank details and identity exports require explicit permission, reason and audit trail.</p></Card></>;
}

export function AdministrationReportsPanel({ tenantId, userId }: { tenantId: string; userId: string }) {
  const reports = getAdministrationReports({ tenantId, userId });
  return (
    <>
      <PageHeader title="Operational Reports" description="Finance, procurement, inventory, assets, projects, facilities, transport, HR and payroll reports with scope and permission controls." />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Ledger lines" value={reports.generalLedger.length} />
        <StatCard label="Payables" value={reports.payableAgeing.length} />
        <StatCard label="Receivables" value={reports.receivableAgeing.length} />
        <StatCard label="Assets" value={reports.assetRegister.length} />
      </div>
      <Card className="mt-8"><FileBarChart2 className="text-accent" /><p className="mt-3 font-semibold">Sensitive exports</p><p className="mt-2 text-sm text-muted">Payroll, supplier bank details, employee identity data, disciplinary records, asset disposal and detailed ledger exports require permission, reason, approval where configured and an audit trail.</p></Card>
    </>
  );
}

export function AdministrationSectionPanel({ section, slug, tenantId, userId }: { section: string; slug: string; tenantId: string; userId: string }) {
  if (section === "accounts" || section === "journals" || section === "ledger" || section === "trial-balance" || section === "statements" || section === "funds" || section === "bank-accounts" || section === "reconciliation" || section === "petty-cash") return <AccountingPanel mode={section} />;
  if (section === "budgets" || section === "budget-controls" || section === "payment-requests" || section === "payment-vouchers") return <BudgetPaymentPanel mode={section} />;
  if (section === "suppliers" || section === "procurement" || section === "quotations" || section === "purchase-orders" || section === "goods-receipts" || section === "supplier-invoices" || section === "receivables") return <ProcurementPanel mode={section} />;
  if (section === "inventory" || section === "stores" || section === "stock-counts" || section === "assets" || section === "maintenance" || section === "projects" || section === "project-details" || section === "facilities" || section === "bookings" || section === "utilities" || section === "vehicles" || section === "transport" || section === "trip-logs") return <OperationsPanel mode={section} />;
  if (section === "hr" || section === "employees" || section === "positions" || section === "recruitment" || section === "contracts" || section === "onboarding" || section === "leave" || section === "attendance" || section === "payroll" || section === "payslips" || section === "performance" || section === "training" || section === "discipline" || section === "self-service") return <HrPanel mode={section} />;
  if (section === "reports") return <AdministrationReportsPanel tenantId={tenantId} userId={userId} />;
  return <AdministrationHome slug={slug} tenantId={tenantId} userId={userId} />;
}

export function AdministrationPrinciplesNotice() {
  return <div className="rounded-lg border border-border bg-surface p-4 text-sm leading-6 text-muted"><p>Giving remains separate from accounting, restricted funds retain their purpose, posted records use reversals, and payroll/HR/giving access stays domain-specific.</p></div>;
}
