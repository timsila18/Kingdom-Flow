import Link from "next/link";
import { AlertTriangle, CalendarCheck, FileLock2, HandHeart, HeartHandshake, LockKeyhole, NotebookTabs, ShieldAlert } from "lucide-react";
import { Badge, ButtonLink, Card, EmptyPhase, PageHeader, StatCard } from "@/components/ui";
import {
  acceptReferral,
  describeAssignedUser,
  describeBranch,
  describePerson,
  getCaseDetail,
  getConfigSummary,
  getPastorWorkspace,
  getPastoralDashboardStats,
  getPastoralReports,
  getPrayerDashboard,
  getPrayerFollowUps,
  getWelfareAssessment,
  getWelfareDashboard,
  searchPastoralCases,
} from "@/lib/pastoral-engine";
import {
  bereavementCases,
  carePlans,
  confidentialityLevels,
  counsellingAppointments,
  pastoralCaseCategories,
  pastoralCases,
  pastoralReferrals,
  pastoralVisits,
  prayerRequests,
  prayerTeams,
  professionalReferrals,
  safeguardingActions,
  safeguardingCases,
  testimonies,
} from "@/lib/pastoral-data";

export const pastoralLinks = [
  ["Dashboard", ""],
  ["My Workspace", "workspace"],
  ["Cases", "cases"],
  ["Case Intake", "intake"],
  ["Prayer Requests", "prayer"],
  ["Prayer Teams", "prayer-teams"],
  ["Testimonies", "testimonies"],
  ["Counselling", "counselling"],
  ["Visits", "visits"],
  ["Bereavement", "bereavement"],
  ["Welfare", "welfare"],
  ["Assessments", "welfare-assessments"],
  ["Referrals", "referrals"],
  ["Safeguarding", "safeguarding"],
  ["Care Plans", "care-plans"],
  ["Reports", "reports"],
  ["Settings", "settings"],
  ["Confidentiality", "confidentiality"],
  ["Referral Rules", "referral-rules"],
] as const;

function PrivacyBanner() {
  return (
    <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-slate-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
      <div className="flex gap-3">
        <FileLock2 className="mt-1 shrink-0" size={18} />
        <p>Pastoral records show only minimum necessary information. Safeguarding cases, welfare assessments and restricted counselling notes require explicit permissions and audit-ready access reasons.</p>
      </div>
    </div>
  );
}

function CaseCard({ pastoralCase, slug }: { pastoralCase: typeof pastoralCases[number]; slug: string }) {
  const tone = pastoralCase.confidentiality === "safeguarding" ? "danger" : pastoralCase.confidentiality === "general" ? "success" : "warning";
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-muted">{pastoralCase.caseNumber}</p>
          <h2 className="mt-1 font-semibold">{pastoralCase.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{pastoralCase.summary}</p>
        </div>
        <Badge tone={tone}>{pastoralCase.confidentiality.replaceAll("_", " ")}</Badge>
      </div>
      <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
        <p><strong>Subject:</strong> {describePerson(pastoralCase.subjectPersonId)}</p>
        <p><strong>Branch:</strong> {describeBranch(pastoralCase.branchId)}</p>
        <p><strong>Next:</strong> {pastoralCase.nextAction}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <ButtonLink href={`/workspace/${slug}/pastoral-care/cases/${pastoralCase.id}`} variant="secondary">Open case</ButtonLink>
        <ButtonLink href={`/workspace/${slug}/pastoral-care/referrals`} variant="secondary">Referral history</ButtonLink>
      </div>
    </Card>
  );
}

export function PastoralHome({ slug, tenantId, userId }: { slug: string; tenantId: string; userId: string }) {
  const stats = getPastoralDashboardStats({ tenantId, userId });
  return (
    <>
      <PageHeader title="Pastoral Care" description="Confidential case management for prayer, counselling, visitation, bereavement, welfare, referrals and safeguarding without exposing private notes." actions={<ButtonLink href={`/workspace/${slug}/pastoral-care/intake`}>New intake</ButtonLink>} />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="New care requests" value={stats.newCareRequests} detail="No private details in summary." />
        <StatCard label="Urgent cases" value={stats.urgentCases} detail="Escalation rules vary by category." />
        <StatCard label="Overdue tasks" value={stats.overdueFirstResponse} detail="Care plans and first response." />
        <StatCard label="Referrals waiting" value={stats.referralsAwaitingAcceptance} detail="Acceptance and handover tracked." />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <StatCard label="Prayer assigned" value={stats.prayerRequestsAssigned} detail="Prayer-team scope enforced." />
        <StatCard label="Hospital visits" value={stats.hospitalVisitsPending} detail="Pending or scheduled." />
        <StatCard label="Welfare reviews" value={stats.welfareAssessmentsPending} detail="Assessment and approval only." />
        <StatCard label="Safeguarding alerts" value={stats.safeguardingAlerts} detail="Only for authorized users." />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {pastoralLinks.slice(1).map(([label, path]) => (
          <Link key={path} href={`/workspace/${slug}/pastoral-care/${path}`} className="rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-accent">
            <p className="font-semibold">{label}</p>
            <p className="mt-2 text-sm leading-6 text-muted">Open {label.toLowerCase()}.</p>
          </Link>
        ))}
      </div>
      <PrivacyBanner />
    </>
  );
}

export function PastoralWorkspace({ tenantId, userId, slug }: { tenantId: string; userId: string; slug: string }) {
  const workspace = getPastorWorkspace({ tenantId, userId });
  return (
    <>
      <PageHeader title="My Pastoral Workspace" description="Assigned cases, referrals, visits, tasks and confidential-access warnings for field ministry." />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Assigned cases" value={workspace.assignedCases.length} />
        <StatCard label="New referrals" value={workspace.newReferrals.length} />
        <StatCard label="Tasks due" value={workspace.tasksDue.length} />
        <StatCard label="Confidential warnings" value={workspace.confidentialWarnings} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <h2 className="font-semibold">Assigned care</h2>
          <div className="mt-4 grid gap-3">{workspace.assignedCases.map((pastoralCase) => <CaseCard key={pastoralCase.id} pastoralCase={pastoralCase} slug={slug} />)}</div>
        </Card>
        <Card>
          <h2 className="font-semibold">Mobile actions</h2>
          <div className="mt-4 grid gap-2 text-sm">
            {["Record contact", "Schedule appointment", "Complete visit", "Refer higher", "Capture consent", "Upload secure document placeholder"].map((item) => <div key={item} className="rounded-md bg-surface-muted p-3">{item}</div>)}
          </div>
        </Card>
      </div>
    </>
  );
}

export function CasesPanel({ tenantId, userId, slug }: { tenantId: string; userId: string; slug: string }) {
  const cases = searchPastoralCases({ tenantId, userId }, "");
  return (
    <>
      <PageHeader title="Pastoral Cases" description="Search respects confidentiality. Safeguarding and highly confidential records are hidden unless explicit permission allows access." actions={<ButtonLink href={`/workspace/${slug}/pastoral-care/intake`}>Create case</ButtonLink>} />
      <div className="mt-8 grid gap-4">{cases.map((pastoralCase) => <CaseCard key={pastoralCase.id} pastoralCase={pastoralCase} slug={slug} />)}</div>
    </>
  );
}

export function CaseDetailPanel({ tenantId, userId, caseId, slug }: { tenantId: string; userId: string; caseId: string; slug: string }) {
  const detail = getCaseDetail(caseId, { tenantId, userId });
  if (!detail) return <EmptyPhase title="Case unavailable" description="This case may not exist, may belong to another tenant, or may require explicit confidential access." />;
  const { pastoralCase } = detail;
  return (
    <>
      <PageHeader title={pastoralCase.title} description={`${pastoralCase.caseNumber} · ${pastoralCase.status.replaceAll("_", " ")} · ${pastoralCase.publicSafeSummary}`} actions={<Badge tone={pastoralCase.confidentiality === "safeguarding" ? "danger" : "warning"}>{pastoralCase.confidentiality.replaceAll("_", " ")}</Badge>} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          <Card>
            <h2 className="font-semibold">Case Summary</h2>
            <div className="mt-4 grid gap-2 text-sm md:grid-cols-2">
              <p><strong>Subject:</strong> {describePerson(pastoralCase.subjectPersonId)}</p>
              <p><strong>Assigned pastor:</strong> {describeAssignedUser(pastoralCase.assignedPastorId)}</p>
              <p><strong>Urgency:</strong> {pastoralCase.urgency}</p>
              <p><strong>Next action:</strong> {pastoralCase.nextAction}</p>
            </div>
          </Card>
          <Card>
            <h2 className="font-semibold">Timeline</h2>
            <div className="mt-4 grid gap-3">{detail.timeline.map((entry) => <div key={entry.id} className="rounded-md bg-surface-muted p-3 text-sm"><p className="font-medium">{entry.eventType.replaceAll("_", " ")}</p><p className="mt-1 text-muted">{entry.safeSummary}</p></div>)}</div>
          </Card>
          <Card>
            <h2 className="font-semibold">Visible Notes</h2>
            <div className="mt-4 grid gap-3">{detail.notes.map((note) => <div key={note.id} className="rounded-md bg-surface-muted p-3 text-sm"><div className="flex justify-between gap-3"><span className="font-medium">{note.type.replaceAll("_", " ")}</span><Badge tone={note.exportProhibited ? "warning" : "neutral"}>{note.exportProhibited ? "no export" : "export controlled"}</Badge></div><p className="mt-2 text-muted">{note.content}</p></div>)}</div>
          </Card>
        </div>
        <div className="grid gap-4">
          <Card>
            <h2 className="font-semibold">Tasks</h2>
            <div className="mt-3 grid gap-2">{detail.tasks.map((task) => <div key={task.id} className="rounded-md bg-surface-muted p-3 text-sm">{task.description}</div>)}</div>
          </Card>
          <Card>
            <h2 className="font-semibold">Referrals</h2>
            <div className="mt-3 grid gap-2">{detail.referrals.map((referral) => <div key={referral.id} className="rounded-md bg-surface-muted p-3 text-sm">{referral.direction} · {referral.sharedInformation.join(", ")}</div>)}</div>
          </Card>
          <ButtonLink href={`/workspace/${slug}/pastoral-care/cases`} variant="secondary">Back to cases</ButtonLink>
        </div>
      </div>
    </>
  );
}

export function IntakePanel() {
  return (
    <>
      <PageHeader title="Case Intake" description="Supported sources include member portal, public prayer form, staff entry, follow-up conversion, visitor forms, welfare desk, service response cards, events, phone, email and anonymous submissions." />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {["Prayer request", "Counselling request", "Hospital visit", "Bereavement support", "Welfare request", "Safeguarding concern"].map((item) => <Card key={item}><HandHeart className="text-accent" /><p className="mt-3 font-semibold">{item}</p><p className="mt-2 text-sm text-muted">Records source, consent, confidentiality, urgency, branch, duplicate review and safe raw submission reference.</p></Card>)}
      </div>
    </>
  );
}

export function PrayerPanel({ tenantId, userId }: { tenantId: string; userId: string }) {
  const dashboard = getPrayerDashboard({ tenantId, userId });
  return (
    <>
      <PageHeader title="Prayer Requests" description="Private, prayer-team, small-group, church-wide review and anonymous prayer requests with consent and review dates." />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Visible requests" value={dashboard.requestCount} />
        <StatCard label="Urgent" value={dashboard.urgentRequests} />
        <StatCard label="Due for review" value={dashboard.dueForReview} />
        <StatCard label="Testimony linked" value={dashboard.testimonyLinked} />
      </div>
      <div className="mt-8 grid gap-4">{prayerRequests.map((request) => <Card key={request.id}><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-semibold">{request.title}</h2><p className="mt-2 text-sm text-muted">{request.confidentiality} · {request.status}</p></div><Badge tone={request.permissionToShare ? "success" : "warning"}>{request.permissionToShare ? "share allowed" : "private"}</Badge></div><p className="mt-3 text-sm text-muted">Follow-ups: {getPrayerFollowUps(request.id).length}</p></Card>)}</div>
    </>
  );
}

export function PrayerTeamsPanel() {
  return (
    <>
      <PageHeader title="Prayer Teams" description="Branch, category, capacity, language and confidentiality clearance determine prayer assignment." />
      <div className="mt-8 grid gap-4 md:grid-cols-2">{prayerTeams.map((team) => <Card key={team.id}><h2 className="font-semibold">{team.name}</h2><p className="mt-2 text-sm text-muted">{team.scope} · {team.language} · {team.availability}</p><p className="mt-3 text-sm">Clearance: {team.confidentialityClearance.join(", ")}</p></Card>)}</div>
    </>
  );
}

export function TestimoniesPanel() {
  return (
    <>
      <PageHeader title="Testimonies" description="Testimonies require consent, authorized review, confidentiality checks and publication scope before anything is published." />
      <div className="mt-8 grid gap-4">{testimonies.map((testimony) => <Card key={testimony.id}><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-semibold">{testimony.title}</h2><p className="mt-2 text-sm text-muted">{testimony.status} · anonymity: {testimony.preferredAnonymity}</p></div><Badge tone={testimony.permissionToPublish ? "success" : "warning"}>{testimony.permissionToPublish ? "publish consent" : "not publishable"}</Badge></div></Card>)}</div>
    </>
  );
}

export function CounsellingPanel() {
  return (
    <>
      <PageHeader title="Counselling Appointments" description="Appointment requests, scheduling, rescheduling, session outcomes and restricted notes without fake calendar synchronization." />
      <div className="mt-8 grid gap-4">{counsellingAppointments.map((appointment) => <Card key={appointment.id}><CalendarCheck className="text-accent" /><h2 className="mt-3 font-semibold">{describePerson(appointment.personId)}</h2><p className="mt-2 text-sm text-muted">{appointment.status} · {appointment.mode} · {new Date(appointment.startsAt).toLocaleString()}</p></Card>)}</div>
    </>
  );
}

export function VisitsPanel() {
  return (
    <>
      <PageHeader title="Pastoral Visits" description="Hospital, home, bereavement, elderly-member and recovery visits with restricted health details." />
      <div className="mt-8 grid gap-4">{pastoralVisits.map((visit) => <Card key={visit.id}><h2 className="font-semibold">{visit.visitType}</h2><p className="mt-2 text-sm text-muted">{visit.status} · {visit.location} · visitor {describeAssignedUser(visit.assignedVisitorId)}</p><p className="mt-3 text-sm">{visit.nextAction}</p></Card>)}</div>
    </>
  );
}

export function BereavementPanel() {
  return (
    <>
      <PageHeader title="Bereavement Support" description="Family support, visitation, transport and programme support without automatic death announcements." />
      <div className="mt-8 grid gap-4">{bereavementCases.map((item) => <Card key={item.id}><h2 className="font-semibold">{describePerson(item.primaryFamilyContactPersonId)}</h2><p className="mt-2 text-sm text-muted">{item.status} · funeral date {item.funeralDate ?? "not set"}</p><Badge tone={item.announcementsConsent ? "success" : "warning"}>{item.announcementsConsent ? "announcement consent" : "no announcement consent"}</Badge></Card>)}</div>
    </>
  );
}

export function WelfarePanel({ tenantId, userId }: { tenantId: string; userId: string }) {
  const dashboard = getWelfareDashboard({ tenantId, userId });
  if (!dashboard.allowed) return <EmptyPhase title="Welfare restricted" description="Welfare requests require explicit welfare permission and are not visible to ordinary pastoral or finance users." />;
  return (
    <>
      <PageHeader title="Welfare Requests" description="Structured welfare assessment and approval records. Payment and accounting remain reserved for later finance integration." />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Urgent needs" value={dashboard.urgentNeeds ?? 0} />
        <StatCard label="Assessments pending" value={dashboard.assessmentsPending ?? 0} />
        <StatCard label="Approvals pending" value={dashboard.approvalsPending ?? 0} />
        <StatCard label="Requests" value={dashboard.requests.length} />
      </div>
      <div className="mt-8 grid gap-4">{dashboard.requests.map((request) => <Card key={request.id}><h2 className="font-semibold">{request.category}</h2><p className="mt-2 text-sm text-muted">{request.approvalStatus} · amount {request.amountRequested ? `KES ${request.amountRequested}` : "non-financial"}</p><p className="mt-3 text-sm">Assessment: {getWelfareAssessment(request.id)?.referralRecommendation ?? request.recommendation ?? "Pending"}</p></Card>)}</div>
    </>
  );
}

export function ReferralsPanel() {
  return (
    <>
      <PageHeader title="Pastoral Referrals" description="Upward, specialist, safeguarding, welfare and professional referrals share selected information only." />
      <div className="mt-8 grid gap-4">{pastoralReferrals.map((referral) => { const accepted = acceptReferral(referral.id, referral.receivingUserId ?? "user-admin"); return <Card key={referral.id}><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-semibold">{referral.direction.replaceAll("_", " ")}</h2><p className="mt-2 text-sm text-muted">{referral.status} · shared: {referral.sharedInformation.join(", ")}</p></div><Badge tone={accepted.allowed ? "success" : "warning"}>{accepted.allowed ? "handover controlled" : "recipient only"}</Badge></div></Card>; })}</div>
      <div className="mt-6 grid gap-4">{professionalReferrals.map((referral) => <Card key={referral.id}><h2 className="font-semibold">{referral.serviceName}</h2><p className="mt-2 text-sm text-muted">{referral.referralType} · provider label: {referral.providerVerification.replaceAll("_", " ")}</p></Card>)}</div>
    </>
  );
}

export function SafeguardingPanel() {
  return (
    <>
      <PageHeader title="Safeguarding" description="Dedicated restricted workflow, independent audit, urgent routing and conflict controls. Ordinary pastoral search excludes these records." actions={<Badge tone="danger">restricted</Badge>} />
      <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-950 dark:border-red-900 dark:bg-red-950 dark:text-red-50">
        <div className="flex gap-3"><ShieldAlert className="mt-1 shrink-0" size={18} /><p>If someone is in immediate danger, use the appropriate local emergency services and safeguarding procedures. Do not rely only on the software workflow.</p></div>
      </div>
      <div className="mt-8 grid gap-4">{safeguardingCases.map((item) => <Card key={item.id}><h2 className="font-semibold">{item.category}</h2><p className="mt-2 text-sm text-muted">{item.status} · {item.urgency}</p><p className="mt-3 text-sm">Actions: {safeguardingActions.filter((action) => action.safeguardingCaseId === item.id).length}</p></Card>)}</div>
    </>
  );
}

export function CarePlansPanel() {
  return (
    <>
      <PageHeader title="Care Plans" description="Goals, actions, responsible people, reviews and closure criteria without framing outcomes as guaranteed." />
      <div className="mt-8 grid gap-4">{carePlans.map((plan) => <Card key={plan.id}><h2 className="font-semibold">{plan.status}</h2><p className="mt-2 text-sm text-muted">{plan.goals.join(", ")}</p><p className="mt-3 text-sm">Review: {plan.reviewDate}</p></Card>)}</div>
    </>
  );
}

export function ReportsPanel({ tenantId, userId }: { tenantId: string; userId: string }) {
  const reports = getPastoralReports({ tenantId, userId });
  return (
    <>
      <PageHeader title="Pastoral Reports" description="Aggregate reporting omits restricted content, excludes safeguarding details from ordinary reports and requires extra permissions for case-level export." />
      <div className="mt-8 grid gap-4 md:grid-cols-3">{reports.categoryCounts.map((item) => <Card key={item.category}><h2 className="font-semibold">{item.category}</h2><p className="mt-3 text-3xl font-semibold">{item.count}</p></Card>)}</div>
      <PrivacyBanner />
    </>
  );
}

export function SettingsPanel({ mode }: { mode: "settings" | "confidentiality" | "referral-rules" }) {
  const config = getConfigSummary();
  if (mode === "confidentiality") {
    return <><PageHeader title="Confidentiality Settings" description="Levels define existence visibility, summary visibility, detailed note access, export rules, reason capture and audit." /><div className="mt-8 grid gap-4">{confidentialityLevels.map((level) => <Card key={level.key}><div className="flex flex-wrap justify-between gap-3"><h2 className="font-semibold">{level.label}</h2><Badge tone={level.downloadProhibited ? "warning" : "neutral"}>{level.downloadProhibited ? "download prohibited" : "export controlled"}</Badge></div><p className="mt-2 text-sm text-muted">Detail permissions: {level.viewDetailPermissions.join(", ")}</p></Card>)}</div></>;
  }
  if (mode === "referral-rules") {
    return <><PageHeader title="Referral Rules" description="Referral routing uses the Prompt 2 hierarchy foundation and requires selected information sharing." /><div className="mt-8 grid gap-4">{config.escalationExamples.map((rule) => <Card key={rule}><AlertTriangle className="text-warning" /><p className="mt-3 font-semibold">{rule}</p></Card>)}</div></>;
  }
  return (
    <>
      <PageHeader title="Pastoral Settings" description="Configurable categories, retention, anonymous intake, escalation deadlines and member-visible content policies." />
      <div className="mt-8 grid gap-4 md:grid-cols-2">{pastoralCaseCategories.map((category) => <Card key={category.id}><NotebookTabs className="text-accent" /><h2 className="mt-3 font-semibold">{category.name}</h2><p className="mt-2 text-sm text-muted">Default: {category.defaultSensitivity} · escalation: {category.escalationHours}h · retention: {category.retentionMonths} months</p></Card>)}</div>
      <div className="mt-8"><EmptyPhase title="Anonymous request metadata" description={config.anonymousMetadata.join(", ")} /></div>
    </>
  );
}

export function PastoralSectionPanel({ section, slug, tenantId, userId }: { section: string; slug: string; tenantId: string; userId: string }) {
  if (section === "workspace") return <PastoralWorkspace tenantId={tenantId} userId={userId} slug={slug} />;
  if (section === "cases") return <CasesPanel tenantId={tenantId} userId={userId} slug={slug} />;
  if (section === "intake") return <IntakePanel />;
  if (section === "prayer") return <PrayerPanel tenantId={tenantId} userId={userId} />;
  if (section === "prayer-teams") return <PrayerTeamsPanel />;
  if (section === "testimonies") return <TestimoniesPanel />;
  if (section === "counselling") return <CounsellingPanel />;
  if (section === "visits") return <VisitsPanel />;
  if (section === "bereavement") return <BereavementPanel />;
  if (section === "welfare" || section === "welfare-assessments") return <WelfarePanel tenantId={tenantId} userId={userId} />;
  if (section === "referrals") return <ReferralsPanel />;
  if (section === "safeguarding") return <SafeguardingPanel />;
  if (section === "care-plans") return <CarePlansPanel />;
  if (section === "reports") return <ReportsPanel tenantId={tenantId} userId={userId} />;
  if (section === "settings" || section === "confidentiality" || section === "referral-rules") return <SettingsPanel mode={section} />;
  return <PastoralHome slug={slug} tenantId={tenantId} userId={userId} />;
}

export function PastoralPrinciples() {
  return (
    <div className="mt-8 grid gap-3 md:grid-cols-2">
      {["Human care first", "Confidentiality by default", "Minimum necessary access", "Consent and dignity", "Safeguarding overrides ordinary confidentiality", "Technology does not replace professional help", "No spiritual scoring", "Private details never become public testimony automatically"].map((principle) => (
        <div key={principle} className="flex gap-3 rounded-lg border border-border bg-surface p-4 text-sm"><LockKeyhole className="mt-0.5 shrink-0 text-accent" size={16} /><span>{principle}</span></div>
      ))}
    </div>
  );
}

export function PastoralIconStrip() {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      <Card><HeartHandshake className="text-accent" /><p className="mt-3 font-semibold">Care with dignity</p></Card>
      <Card><FileLock2 className="text-accent" /><p className="mt-3 font-semibold">Confidential by default</p></Card>
      <Card><ShieldAlert className="text-danger" /><p className="mt-3 font-semibold">Safeguarding separated</p></Card>
    </div>
  );
}
