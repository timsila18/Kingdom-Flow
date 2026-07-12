import Link from "next/link";
import { BadgeCheck, CreditCard, Database, Flag, HelpCircle, LifeBuoy, LockKeyhole, PackageCheck, ShieldCheck, UploadCloud } from "lucide-react";
import { ButtonLink, Card, PageHeader, StatCard } from "@/components/ui";
import { stewardshipCommitment } from "@/lib/production-data";
import { calculateMonthlyActivePeople, getDataExportCatalogue, getGracePeriodAccess, getOnboardingChecklist, getProductionReadiness, getSubscriptionInvoice, getSupportAccessWorkflow, getTenantOffboardingPlan, recommendSubscriptionPlan } from "@/lib/production-engine";

export const productionLinks = [
  ["Launch Readiness", ""],
  ["Subscription Billing", "billing"],
  ["Active People", "active-people"],
  ["Invoices", "invoices"],
  ["Grace Periods", "grace"],
  ["Data Export", "exports"],
  ["Onboarding Checklist", "onboarding"],
  ["Feature Flags", "feature-flags"],
  ["Security Gates", "security"],
  ["Support Tickets", "support"],
  ["Support Access", "support-access"],
  ["Tenant Offboarding", "offboarding"],
  ["Help Center", "help"],
  ["Policies", "policies"],
  ["Deployment", "deployment"],
] as const;

function ProductionTile({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="rounded-lg border border-border bg-surface/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md"><p className="font-semibold">{label}</p><p className="mt-2 text-sm leading-6 text-muted">Open {label.toLowerCase()}.</p></Link>;
}

export function ProductionHome({ slug, tenantId }: { slug: string; tenantId: string }) {
  const readiness = getProductionReadiness();
  const recommendation = recommendSubscriptionPlan(tenantId);
  return (
    <>
      <PageHeader title="Launch & Production Readiness" description="Whole-system completion console for billing, security hardening, onboarding, support, exports, release gates and deployment readiness." actions={<ButtonLink href={`/workspace/${slug}/production/billing`}>Review billing</ButtonLink>} />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Production ready" value={readiness.productionReady ? "Yes" : "No"} detail="Based on release-blocking gates." />
        <StatCard label="Hard blockers" value={readiness.hardBlockers.length} />
        <StatCard label="Recommended plan" value={recommendation.recommendedPlanId} detail={recommendation.explanation} />
        <StatCard label="Secrets in source" value={String(readiness.secretsInSource)} />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-4">{productionLinks.slice(1).map(([label, path]) => <ProductionTile key={path} href={`/workspace/${slug}/production/${path}`} label={label} />)}</div>
    </>
  );
}

export function ProductionSection({ section, tenantId }: { section: string; tenantId: string }) {
  if (section === "billing" || section === "active-people") {
    const active = calculateMonthlyActivePeople(tenantId, "2026-07");
    const recommendation = recommendSubscriptionPlan(tenantId);
    return <><PageHeader title={section === "billing" ? "Subscription Billing" : "Monthly Active People"} description="Ethical subscription calculations use meaningful activity, deduplication, protected groups and a three-month average. Stored people alone do not count." /><div className="mt-8 grid gap-4 md:grid-cols-4"><StatCard label="July active people" value={active.activePeople} /><StatCard label="Protected/excluded" value={active.excludedPeople} /><StatCard label="3-month average" value={recommendation.rollingThreeMonthAverage} /><StatCard label="Manual review" value={String(recommendation.requiresManualReview)} /></div><Card className="mt-8"><CreditCard className="text-accent" /><p className="mt-3 font-semibold">Plan change rule</p><p className="mt-2 text-sm text-muted">{recommendation.explanation} Charges never silently increase.</p></Card></>;
  }
  if (section === "invoices") {
    const invoice = getSubscriptionInvoice(tenantId);
    return <><PageHeader title="Subscription Invoices" description="KingdomFlow invoices stay separate from church giving, receipts and finance ledgers." /><Card className="mt-8"><PackageCheck className="text-accent" /><p className="mt-3 font-semibold">{invoice?.invoiceNumber}</p><p className="mt-2 text-sm text-muted">Total KES {invoice?.totalKes.toLocaleString()} · status {invoice?.status} · {invoice?.paymentInstructions}</p></Card></>;
  }
  if (section === "grace") {
    const grace = getGracePeriodAccess("grace_period");
    return <><PageHeader title="Humane Grace Periods" description="Late payment does not lock churches out of care, safeguarding, member data or authorized data export." /><Card className="mt-8"><ShieldCheck className="text-accent" /><p className="mt-3 font-semibold">Essential ministry remains enabled</p><p className="mt-2 text-sm text-muted">{grace.essentialEnabled.join(", ")}. Data trapped: {String(grace.dataTrapped)}.</p></Card></>;
  }
  if (section === "exports") {
    const exports = getDataExportCatalogue();
    return <><PageHeader title="Church Data Ownership & Exports" description="Structured exports are available with permission, reason, redaction, expiry and audit. Overdue fees do not unfairly trap church data." /><div className="mt-8 grid gap-4 md:grid-cols-3">{exports.map((item) => <Card key={item.key}><Database className="text-accent" /><p className="mt-3 font-semibold">{item.key}</p><p className="mt-2 text-sm text-muted">Sensitive {String(item.sensitive)} · approval {String(item.approvalRequired)} · {item.formats.join(", ")}</p></Card>)}</div></>;
  }
  if (section === "onboarding") {
    const checklist = getOnboardingChecklist(tenantId);
    return <><PageHeader title="Onboarding Checklist" description="New churches can self-onboard through profile, branding, branches, roles, services, giving, privacy, member portal and subscription setup." /><div className="mt-8 grid gap-4 md:grid-cols-3">{checklist.map((item) => <Card key={item.key}><BadgeCheck className="text-accent" /><p className="mt-3 font-semibold">{item.label}</p><p className="mt-2 text-sm text-muted">Complete {String(item.complete)}</p></Card>)}</div></>;
  }
  if (section === "feature-flags" || section === "security" || section === "deployment") {
    const readiness = getProductionReadiness();
    return <><PageHeader title={section === "feature-flags" ? "Feature Flags" : section === "security" ? "Security & Release Gates" : "Deployment Readiness"} description="Global, plan, tenant, branch, beta and emergency flags complement authorization. Release blockers are explicit." /><div className="mt-8 grid gap-4">{(section === "feature-flags" ? readiness.featureFlags : readiness.gates).map((item) => <Card key={item.key}><Flag className="text-accent" /><p className="mt-3 font-semibold">{"label" in item ? item.label : item.key}</p><p className="mt-2 text-sm text-muted">{"status" in item ? `${item.status} · ${item.evidence}` : `${item.enabled} · ${item.reason}`}</p></Card>)}</div></>;
  }
  if (section === "support" || section === "support-access") {
    const support = getSupportAccessWorkflow(tenantId);
    return <><PageHeader title={section === "support" ? "Support Tickets" : "Support Access Requests"} description="Support access requires church approval, selected scope, visible banner, audit and expiry." /><Card className="mt-8"><LifeBuoy className="text-accent" /><p className="mt-3 font-semibold">{support.platformAdminBoundary}</p><p className="mt-2 text-sm text-muted">{support.requiredSteps.join(" · ")}</p></Card></>;
  }
  if (section === "offboarding") {
    const plan = getTenantOffboardingPlan(tenantId);
    return <><PageHeader title="Tenant Offboarding" description="Controlled cancellation, export, final invoice, retention, reactivation and integration shutdown without abrupt data erasure." /><Card className="mt-8"><UploadCloud className="text-accent" /><p className="mt-3 font-semibold">Abrupt deletion allowed {String(plan.abruptDeletionAllowed)}</p><p className="mt-2 text-sm text-muted">{plan.steps.join(" · ")}</p></Card></>;
  }
  if (section === "policies") return <><PageHeader title="Policies & Stewardship Commitment" description="Configurable legal-review pages plus KingdomFlow's clear technology-fee and church-data ownership commitments." /><div className="mt-8 grid gap-4">{stewardshipCommitment.map((item) => <Card key={item}><LockKeyhole className="text-accent" /><p className="font-semibold">{item}</p></Card>)}</div></>;
  return <><PageHeader title="Help Center" description="Searchable support content for getting started, members, follow-up, pastoral care, fellowships, programmes, services, events, giving, finance, HR, subscriptions, privacy, safeguarding and integrations." /><Card className="mt-8"><HelpCircle className="text-accent" /><p className="mt-3 font-semibold">Versioned help articles</p><p className="mt-2 text-sm text-muted">Support tickets and guided onboarding requests are routed without granting tenant data access by default.</p></Card></>;
}
