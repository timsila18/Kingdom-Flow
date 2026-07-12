import Link from "next/link";
import { Activity, Bot, BrainCircuit, FileText, GitBranch, LineChart, MapPinned, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { Badge, ButtonLink, Card, PageHeader, StatCard } from "@/components/ui";
import { analyticsPrinciples } from "@/lib/intelligence-data";
import { calculateKpiResults, getExecutiveBriefing, getFellowshipHealth, getLeadershipCommandCenter, getNetworkDashboard, getNewConvertAssimilationFunnel, getOperationalAnalytics, getVisitorJourneyFunnel, runExecutiveAiQuery } from "@/lib/intelligence-engine";

export const intelligenceLinks = [
  ["Command Center", ""],
  ["Executive Briefing", "briefing"],
  ["Action Center", "actions"],
  ["Visitor Journey", "visitors"],
  ["New Converts", "new-converts"],
  ["Discipleship", "discipleship"],
  ["Fellowship Health", "fellowships"],
  ["Service Analytics", "services"],
  ["Volunteer Sustainability", "volunteers"],
  ["Pastoral Workload", "pastoral"],
  ["Network Oversight", "network"],
  ["KPI Engine", "kpis"],
  ["Ethical Growth Engine", "growth"],
  ["Reports", "reports"],
  ["Forecasting", "forecasting"],
  ["Scenario Planning", "scenarios"],
  ["Data Quality", "data-quality"],
  ["AI Executive Copilot", "ai"],
] as const;

function IntelligenceTile({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="group rounded-lg border border-border bg-surface/90 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-md">
      <p className="font-semibold">{label}</p>
      <p className="mt-2 text-sm leading-6 text-muted">Open {label.toLowerCase()}.</p>
    </Link>
  );
}

function Funnel({ stages }: { stages: ReturnType<typeof getVisitorJourneyFunnel> }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {stages.map((stage) => (
        <Card key={stage.key} className={stage.bottleneck ? "border-amber-300" : undefined}>
          <GitBranch className="text-accent" />
          <p className="mt-3 font-semibold">{stage.label}</p>
          <p className="mt-2 text-3xl font-semibold">{stage.count}</p>
          <p className="mt-2 text-sm text-muted">{stage.percentOfStart}% of starting stage{stage.medianDaysFromPrevious ? ` · median ${stage.medianDaysFromPrevious} days` : ""}</p>
        </Card>
      ))}
    </div>
  );
}

export function IntelligenceHome({ slug, tenantId }: { slug: string; tenantId: string }) {
  const center = getLeadershipCommandCenter(tenantId, ["analytics.finance.view"]);
  return (
    <>
      <PageHeader
        title="Leadership Command Center"
        description="Ethical ministry intelligence for people being noticed, followed up, connected, discipled, cared for, protected and equipped."
        actions={<ButtonLink href={`/workspace/${slug}/intelligence/ai`}>Ask KingdomFlow</ButtonLink>}
      />
      <div className="mt-6 rounded-xl border border-accent/30 bg-[linear-gradient(135deg,rgba(6,44,34,.95),rgba(16,83,61,.9))] p-5 text-white shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-serif text-2xl font-semibold">Ask KingdomFlow anything...</p>
            <p className="mt-2 text-sm text-white/75">Which new converts have not been contacted? Which fellowships need review? What changed this week?</p>
          </div>
          <Badge tone="accent">AI cites source metrics</Badge>
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-5">
        {center.cards.slice(0, 10).map((card) => (
          <StatCard key={card.key} label={card.label} value={card.unit ? `${card.unit} ${Number(card.value).toLocaleString()}` : card.value} detail={`${card.detail} ${card.sourceCompleteness}% source completeness.`} />
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {intelligenceLinks.slice(1).map(([label, path]) => <IntelligenceTile key={path} href={`/workspace/${slug}/intelligence/${path}`} label={label} />)}
      </div>
    </>
  );
}

export function IntelligenceSection({ section, tenantId }: { section: string; slug: string; tenantId: string }) {
  if (section === "briefing" || section === "actions") {
    const briefing = getExecutiveBriefing(tenantId);
    return (
      <>
        <PageHeader title={section === "actions" ? "Action Center" : "Executive Briefing"} description="Weekly leadership brief with attention items, risks, decisions needed and safe AI narrative boundaries." />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card><Sparkles className="text-accent" /><p className="mt-3 font-semibold">{briefing.overview}</p><p className="mt-2 text-sm text-muted">{briefing.aiSafetyNote}</p></Card>
          <Card><Activity className="text-accent" /><p className="mt-3 font-semibold">Attention items</p><p className="mt-2 text-sm text-muted">{briefing.attentionItems.join(" · ")}</p></Card>
          <Card><ShieldCheck className="text-accent" /><p className="mt-3 font-semibold">Decisions needed</p><p className="mt-2 text-sm text-muted">{briefing.decisionsNeeded.join(" · ")}</p></Card>
        </div>
      </>
    );
  }
  if (section === "visitors") return <><PageHeader title="Visitor Journey Analytics" description="First visit, follow-up, fellowship connection and programme enrolment with confidence notes and no pressure language." /><div className="mt-8"><Funnel stages={getVisitorJourneyFunnel(tenantId)} /></div></>;
  if (section === "new-converts") return <><PageHeader title="New-Convert Assimilation Funnel" description="Operational pathway only: decision recorded, assigned, contacted, enrolled, completed and fellowship placed. No salvation score exists." /><div className="mt-8"><Funnel stages={getNewConvertAssimilationFunnel(tenantId)} /></div></>;
  if (section === "fellowships") {
    const health = getFellowshipHealth(tenantId);
    return <><PageHeader title="Fellowship Health Indicators" description="Separate operational indicators for attendance, reports, capacity and leadership. No single spiritual score." /><div className="mt-8 grid gap-4">{health.map((item) => <Card key={item.group.id}><UsersRound className="text-accent" /><p className="mt-3 font-semibold">{item.group.name}</p><p className="mt-2 text-sm text-muted">Multiplication review suggested {String(item.multiplicationReviewSuggested)} · spiritual score created {String(item.spiritualScoreCreated)}</p></Card>)}</div></>;
  }
  if (section === "kpis") {
    const results = calculateKpiResults(tenantId);
    return <><PageHeader title="Configurable KPI Engine" description="Controlled metric definitions, versioning and thresholds. Formulas are metric keys, not arbitrary executable code." /><div className="mt-8 grid gap-4 md:grid-cols-3">{results.map((result) => <StatCard key={result.definition.id} label={result.definition.name} value={`${result.value}%`} detail={result.explanation} />)}</div></>;
  }
  if (section === "network") {
    const network = getNetworkDashboard("network-east-africa");
    return <><PageHeader title="Network & Denomination Oversight" description="Federated aggregate sharing across independent churches. Individual members remain invisible unless explicitly shared, which KingdomFlow does not enable by default." /><div className="mt-8 grid gap-4 md:grid-cols-4"><StatCard label="Churches" value={network.churches} /><StatCard label="Shared categories" value={network.sharedCategories.length} /><StatCard label="Aggregate attendance" value={network.aggregateAttendance} /><StatCard label="Individuals visible" value={String(network.individualMembersVisible)} /></div></>;
  }
  if (section === "ai") {
    const answer = runExecutiveAiQuery(tenantId, "Why did attendance fall last month?");
    return <><PageHeader title="AI Executive Copilot" description="Authorized AI analysis that cites metrics, discloses missing data, avoids invented causes and never makes spiritual judgments." /><Card className="mt-8"><Bot className="text-accent" /><p className="mt-3 font-semibold">{answer.answer}</p><p className="mt-2 text-sm text-muted">Spiritual judgment made {String(answer.spiritualJudgmentMade)} · unauthorized data included {String(answer.unauthorizedDataIncluded)}</p></Card></>;
  }
  if (section === "growth" || section === "data-quality") {
    const center = getLeadershipCommandCenter(tenantId);
    return <><PageHeader title={section === "growth" ? "Ethical Growth Engine" : "Data Quality Scorecard"} description="Rules detect operational patterns, duplicate alerts are controlled, and confidence is limited when source reports are incomplete." /><div className="mt-8 grid gap-4">{center.insights.map((insight) => <Card key={insight.id}><BrainCircuit className="text-accent" /><p className="mt-3 font-semibold">{insight.title}</p><p className="mt-2 text-sm text-muted">{insight.evidence.join(" ")} Confidence: {insight.confidence}.</p></Card>)}</div></>;
  }
  if (section === "forecasting" || section === "scenarios") return <><PageHeader title={section === "forecasting" ? "Forecasting Foundation" : "Scenario Planning"} description="Conservative what-if planning for attendance, volunteers, facilities, programmes, cash flow and projects. Scenarios never alter live records." /><Card className="mt-8"><LineChart className="text-accent" /><p className="mt-3 font-semibold">Attendance +20% scenario</p><p className="mt-2 text-sm text-muted">Review seating, fellowship capacity, volunteer demand and budget impact. Forecasts are assumptions, not certainty.</p></Card></>;
  if (section === "reports") return <><PageHeader title="Executive & Governance Reports" description="Weekly senior leadership briefs, monthly branch reports, annual ministry reports and board reports with secure links and permission checks." /><Card className="mt-8"><FileText className="text-accent" /><p className="mt-3 font-semibold">Scheduled board report</p><p className="mt-2 text-sm text-muted">Confidential case details excluded. Sensitive downloads require permission, reason, approval and audit.</p></Card></>;
  const ops = getOperationalAnalytics(tenantId);
  return <><PageHeader title={intelligenceLinks.find(([, path]) => path === section)?.[0] ?? "Intelligence"} description="Role-aware analytics surfaces with drill-downs gated by centralized permissions and scope." /><div className="mt-8 grid gap-4 md:grid-cols-4"><StatCard label="Pastoral open" value={ops.pastoral.open} /><StatCard label="Active volunteers" value={ops.volunteers.active} /><StatCard label="Roster conflicts" value={ops.volunteers.conflicts} /><StatCard label="Budget basis" value={`KES ${ops.finance.budgetTotal.toLocaleString()}`} /></div><Card className="mt-8"><MapPinned className="text-accent" /><p className="mt-3 font-semibold">Geographical and role dashboards</p><p className="mt-2 text-sm text-muted">Branch, ministry, fellowship, safeguarding, finance and HR surfaces are permission-aware and aggregate-first.</p></Card></>;
}

export function IntelligencePrinciplesNotice() {
  return <div className="rounded-lg border border-border bg-surface/85 p-4 text-sm leading-6 text-muted">{analyticsPrinciples.map((item) => <p key={item}>{item}</p>)}</div>;
}
