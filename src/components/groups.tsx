import Link from "next/link";
import { BarChart3, CheckCircle2, CircleDollarSign, MapPin, QrCode, Shield } from "lucide-react";
import { Badge, ButtonLink, Card, PageHeader, StatCard } from "@/components/ui";
import {
  financeHandovers,
  groupCommunicationEvents,
  groupHealthSnapshots,
  groupJoinRequests,
  groupMeetingReports,
  groupMeetings,
  groupQrCodes,
  groupReportTemplates,
  groupTransfers,
  multiplicationProposals,
  smallGroups,
} from "@/lib/groups-data";
import {
  calculateMeetingGiving,
  describeTemplate,
  getAccessibleGroups,
  getEveryPersonMattersGroupAdditions,
  getGroupAnalytics,
  getGroupHealth,
  getGroupLeaderName,
  getGroupMembershipSummary,
  getGroupReports,
  getGroupTypeName,
  getLeaderWorkspace,
  getPublicGroupDirectory,
  getSupervisingPastorWorkspace,
  summarizeAttendance,
} from "@/lib/groups-engine";
import { branches, profiles } from "@/lib/data";
import { people } from "@/lib/people-data";
import { getPersonName } from "@/lib/people-engine";

export const groupLinks = [
  ["Dashboard", ""],
  ["Leader Workspace", "leader"],
  ["Supervising Pastor", "pastor"],
  ["Directory", "directory"],
  ["Map", "map"],
  ["Groups", "groups"],
  ["Meetings", "meetings"],
  ["Attendance", "attendance"],
  ["Reports", "reports"],
  ["Report Templates", "templates"],
  ["Join Requests", "join-requests"],
  ["Transfers", "transfers"],
  ["Giving Totals", "giving"],
  ["Finance Handover", "handover"],
  ["Health", "health"],
  ["Growth", "growth"],
  ["Multiplication", "multiplication"],
  ["Closure & Handover", "closure"],
  ["QR Codes", "qr-codes"],
  ["Communication", "communication"],
  ["Analytics", "analytics"],
] as const;

function GroupCard({ group, slug }: { group: typeof smallGroups[number]; slug: string }) {
  const summary = getGroupMembershipSummary(group.id);
  const health = getGroupHealth(group.id);
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-muted">{group.code} · {getGroupTypeName(group.groupTypeId)}</p>
          <h2 className="mt-1 font-semibold">{group.name}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{group.description}</p>
        </div>
        <Badge tone={group.status === "active" ? "success" : group.status === "under_review" ? "warning" : "neutral"}>{group.status.replaceAll("_", " ")}</Badge>
      </div>
      <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
        <p><strong>Leader:</strong> {getGroupLeaderName(group)}</p>
        <p><strong>Branch:</strong> {branches.find((branch) => branch.id === group.branchId)?.name}</p>
        <p><strong>Members:</strong> {summary.active} active · {summary.visitors} visitors</p>
        <p><strong>Schedule:</strong> {group.scheduleSummary}</p>
        <p><strong>Location:</strong> {group.approximateLocation}</p>
        <p><strong>Health:</strong> {health?.label ?? "Stable"}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <ButtonLink href={`/workspace/${slug}/groups/groups`} variant="secondary">View register</ButtonLink>
        <ButtonLink href={`/workspace/${slug}/groups/reports`} variant="secondary">Reports</ButtonLink>
      </div>
    </Card>
  );
}

export function GroupsHome({ slug, tenantId, userId }: { slug: string; tenantId: string; userId: string }) {
  const analytics = getGroupAnalytics({ tenantId, userId });
  const epm = getEveryPersonMattersGroupAdditions({ tenantId, userId });
  return (
    <>
      <PageHeader title="Cells & Fellowships" description="Operational care for small groups, meetings, attendance, reports, safe giving totals, follow-up, growth and multiplication." actions={<ButtonLink href={`/workspace/${slug}/groups/leader`}>Leader workspace</ButtonLink>} />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Active groups" value={analytics.activeGroups} detail="Permission-scoped register." />
        <StatCard label="Meetings tracked" value={analytics.meetingsThisPeriod} detail="Scheduled and completed." />
        <StatCard label="First-timers" value={analytics.firstTimers} detail="From group attendance." />
        <StatCard label="Join requests" value={analytics.joinRequests} detail="Placement requests awaiting care." />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <StatCard label="Absent follow-up" value={analytics.absentNeedingFollowUp} detail="Neutral care thresholds." />
        <StatCard label="New converts" value={analytics.newConverts} detail="Meeting-linked journeys." />
        <StatCard label="Multiplication review" value={analytics.multiplicationReadiness} detail="Recommendations only." />
        <StatCard label="Giving totals" value={`KES ${analytics.givingGrandTotal.toLocaleString()}`} detail="Totals only by default." />
      </div>
      <Card className="mt-8">
        <h2 className="font-semibold">Every Person Matters additions</h2>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
          <p>First-timers from groups: <strong>{epm.firstTimersFromGroups}</strong></p>
          <p>New converts from groups: <strong>{epm.newConvertsFromGroups}</strong></p>
          <p>Fellowship placement requests: <strong>{epm.peopleRequestingFellowshipPlacement}</strong></p>
        </div>
      </Card>
      <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {groupLinks.slice(1).map(([label, path]) => (
          <Link key={path} href={`/workspace/${slug}/groups/${path}`} className="rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-accent">
            <p className="font-semibold">{label}</p>
            <p className="mt-2 text-sm leading-6 text-muted">Open {label.toLowerCase()}.</p>
          </Link>
        ))}
      </div>
    </>
  );
}

export function LeaderWorkspacePanel({ tenantId, userId }: { tenantId: string; userId: string }) {
  const workspace = getLeaderWorkspace({ tenantId, userId });
  return (
    <>
      <PageHeader title="Group Leader Workspace" description="Mobile-friendly next actions for attendance, reports, visitors, new converts, follow-up, referrals, handover and multiplication tasks." />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="My groups" value={workspace.groups.length} />
        <StatCard label="Next meetings" value={workspace.nextMeetings.length} />
        <StatCard label="Reports due" value={workspace.reportsDue.length} />
        <StatCard label="Follow-up needed" value={workspace.membersNeedingFollowUp.length} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <h2 className="font-semibold">Today and next</h2>
          <div className="mt-4 grid gap-3">{workspace.nextMeetings.map((meeting) => <div key={meeting.id} className="rounded-md bg-surface-muted p-3 text-sm"><strong>{smallGroups.find((group) => group.id === meeting.groupId)?.name}</strong><p className="mt-1 text-muted">{meeting.meetingDate} · {meeting.startTime} · {meeting.theme}</p></div>)}</div>
        </Card>
        <Card>
          <h2 className="font-semibold">Quick actions</h2>
          <div className="mt-4 grid gap-2 text-sm">{["Start attendance", "Add visitor", "Record new convert", "Submit report", "Contact absent member", "Create referral", "View members", "Reschedule meeting"].map((action) => <div key={action} className="rounded-md bg-surface-muted p-3">{action}</div>)}</div>
        </Card>
      </div>
    </>
  );
}

export function PastorWorkspacePanel({ tenantId, userId }: { tenantId: string; userId: string }) {
  const workspace = getSupervisingPastorWorkspace({ tenantId, userId });
  return (
    <>
      <PageHeader title="Supervising Pastor Workspace" description="Review group health, overdue reports, capacity pressure, inactive groups and multiplication proposals without exposing confidential case contents." />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Groups supervised" value={workspace.groups.length} />
        <StatCard label="Reports awaiting review" value={workspace.reportsAwaitingReview.length} />
        <StatCard label="Groups at capacity" value={workspace.groupsAtCapacity.length} />
        <StatCard label="Multiplication proposals" value={workspace.multiplicationProposals.length} />
      </div>
      <div className="mt-8 grid gap-4">{workspace.groups.map((group) => <GroupCard key={group.id} group={group} slug="kings-grace" />)}</div>
    </>
  );
}

export function DirectoryPanel({ tenantId, userId }: { tenantId: string; userId: string }) {
  const rows = getPublicGroupDirectory({ tenantId, userId });
  return (
    <>
      <PageHeader title="Group Directory" description="Member-facing discoverability with approximate locations, availability and join requests. Private residential addresses are never shown here." />
      <div className="mt-8 grid gap-4 md:grid-cols-2">{rows.map((row) => <Card key={row.id}><div className="flex justify-between gap-3"><div><h2 className="font-semibold">{row.name}</h2><p className="mt-1 text-sm text-muted">{row.type} · {row.branch}</p></div><Badge tone={row.availability === "available" ? "success" : "warning"}>{row.availability}</Badge></div><p className="mt-4 text-sm">{row.generalLocation} · {row.meetingTime} · {row.language}</p><p className="mt-2 text-sm text-muted">Leader: {row.leaderLabel} · {row.onlineOrPhysical}</p></Card>)}</div>
    </>
  );
}

export function MapPanel({ tenantId, userId }: { tenantId: string; userId: string }) {
  const groups = getAccessibleGroups({ tenantId, userId }).filter((group) => group.publicDiscoverable);
  return (
    <>
      <PageHeader title="Group Map" description="Authorized area coverage view using approximate pins for private homes." />
      <Card className="mt-8">
        <div className="grid gap-4 md:grid-cols-3">{groups.map((group) => <div key={group.id} className="rounded-md bg-surface-muted p-4 text-sm"><MapPin className="mb-3 text-accent" /><p className="font-semibold">{group.name}</p><p className="mt-1 text-muted">{group.approximateLocation}</p><p className="mt-1 text-muted">{group.exactAddressRestricted ? "Approximate pin" : "Public venue"}</p></div>)}</div>
      </Card>
    </>
  );
}

export function GroupsRegisterPanel({ slug, tenantId, userId }: { slug: string; tenantId: string; userId: string }) {
  const groups = getAccessibleGroups({ tenantId, userId });
  return (
    <>
      <PageHeader title="Group Register" description="Creation, hierarchy, leadership, schedules, join policy, status and multiplication lineage are preserved." />
      <div className="mt-8 grid gap-4">{groups.map((group) => <GroupCard key={group.id} group={group} slug={slug} />)}</div>
    </>
  );
}

export function MeetingsAttendancePanel({ mode }: { mode: "meetings" | "attendance" }) {
  if (mode === "attendance") {
    return <><PageHeader title="Attendance Capture" description="Manual, QR, leader mobile, household, online and offline-queue architecture with first-timer, visitor and new-convert categories." /><div className="mt-8 grid gap-4">{groupMeetings.map((meeting) => { const summary = summarizeAttendance(meeting.id); return <Card key={meeting.id}><h2 className="font-semibold">{smallGroups.find((group) => group.id === meeting.groupId)?.name}</h2><p className="mt-2 text-sm text-muted">{meeting.meetingDate} · {meeting.theme}</p><div className="mt-4 grid gap-2 text-sm md:grid-cols-6"><p>Present {summary.present}</p><p>Absent {summary.absent}</p><p>Visitors {summary.visitors}</p><p>First-timers {summary.firstTimers}</p><p>New converts {summary.newConverts}</p><p>Online {summary.online}</p></div></Card>; })}</div></>;
  }
  return <><PageHeader title="Meeting Schedule" description="Recurring and one-time meetings with report status, cancellation, reschedule and template-aware meeting types." /><div className="mt-8 grid gap-4">{groupMeetings.map((meeting) => <Card key={meeting.id}><div className="flex justify-between gap-3"><div><h2 className="font-semibold">{meeting.theme}</h2><p className="mt-1 text-sm text-muted">{smallGroups.find((group) => group.id === meeting.groupId)?.name} · {meeting.meetingDate} · {meeting.startTime}</p></div><Badge tone={meeting.reportStatus === "approved" || meeting.reportStatus === "locked" ? "success" : "warning"}>{meeting.reportStatus.replaceAll("_", " ")}</Badge></div></Card>)}</div></>;
}

export function ReportsPanel({ mode }: { mode: "reports" | "templates" }) {
  if (mode === "templates") {
    return <><PageHeader title="Report Templates" description="Versioned templates define sections, finance visibility, pastoral referral metadata, attendance model, approval workflow and lock rules." /><div className="mt-8 grid gap-4">{groupReportTemplates.map((template) => <Card key={template.id}><h2 className="font-semibold">{template.name} v{template.version}</h2><p className="mt-2 text-sm text-muted">Sections: {template.requiredSections.join(", ")}</p><p className="mt-2 text-sm">Finance: {template.financeSectionEnabled ? "enabled" : "hidden"} · Pastoral referrals: {template.pastoralReferralSectionEnabled ? "safe metadata" : "disabled"} · Lock after approval: {template.lockAfterApproval ? "yes" : "no"}</p></Card>)}</div></>;
  }
  return <><PageHeader title="Meeting Reports" description="Draft, submitted, returned, approved, locked and reopened reports with safe referral summaries and no confidential case contents." /><div className="mt-8 grid gap-4">{groupMeetingReports.map((report) => <Card key={report.id}><div className="flex justify-between gap-3"><div><h2 className="font-semibold">{smallGroups.find((group) => group.id === report.groupId)?.name}</h2><p className="mt-1 text-sm text-muted">{describeTemplate(report.templateId)} · {report.submittedAt ?? "Not submitted"}</p></div><Badge tone={report.status === "locked" ? "success" : "warning"}>{report.status.replaceAll("_", " ")}</Badge></div><p className="mt-4 text-sm text-muted">{report.safeReferralSummary.join("; ") || "No referrals."}</p></Card>)}</div></>;
}

export function RequestsTransfersPanel({ mode }: { mode: "join-requests" | "transfers" }) {
  if (mode === "transfers") {
    return <><PageHeader title="Group Transfers" description="Source approval, destination approval, member acknowledgement and follow-up handover preserve one person record without duplicates." /><div className="mt-8 grid gap-4">{groupTransfers.map((transfer) => <Card key={transfer.id}><p className="font-semibold">{getPersonName(people.find((person) => person.id === transfer.personId)!)}</p><p className="mt-2 text-sm text-muted">{smallGroups.find((group) => group.id === transfer.sourceGroupId)?.name} to {smallGroups.find((group) => group.id === transfer.destinationGroupId)?.name}</p><Badge tone="warning">{transfer.status.replaceAll("_", " ")}</Badge></Card>)}</div></>;
  }
  return <><PageHeader title="Join Requests" description="Portal, invitation, staff, follow-up, new-convert, public directory, QR and programme sources are tracked with approval and waitlist states." /><div className="mt-8 grid gap-4">{groupJoinRequests.map((request) => <Card key={request.id}><div className="flex justify-between gap-3"><div><p className="font-semibold">{request.requesterName}</p><p className="mt-1 text-sm text-muted">{smallGroups.find((group) => group.id === request.groupId)?.name} · {request.source}</p></div><Badge tone={request.status === "accepted" ? "success" : "warning"}>{request.status.replaceAll("_", " ")}</Badge></div></Card>)}</div></>;
}

export function GivingHandoverPanel({ mode }: { mode: "giving" | "handover" }) {
  if (mode === "handover") {
    return <><PageHeader title="Finance Handover" description="Meeting-fund handover captures amount, categories, parties, deposit reference, discrepancy, evidence placeholder and separation of duties. Accounting posting is reserved for finance." /><div className="mt-8 grid gap-4">{financeHandovers.map((handover) => <Card key={handover.id}><CircleDollarSign className="text-accent" /><p className="mt-3 font-semibold">KES {handover.amount.toLocaleString()}</p><p className="mt-2 text-sm text-muted">Status: {handover.status.replaceAll("_", " ")} · Deposit: {handover.depositReference ?? "pending"}</p></Card>)}</div></>;
  }
  return <><PageHeader title="Meeting Giving Totals" description="Totals only category and payment-method capture with no individual giver detail, no ranking and restricted finance visibility." /><div className="mt-8 grid gap-4">{groupMeetings.map((meeting) => { const giving = calculateMeetingGiving(meeting.id); if (!giving.rows.length) return null; return <Card key={meeting.id}><h2 className="font-semibold">{smallGroups.find((group) => group.id === meeting.groupId)?.name}</h2><p className="mt-2 text-sm text-muted">{meeting.meetingDate} · Grand total {giving.currency} {giving.grandTotal.toLocaleString()}</p><div className="mt-4 grid gap-2 text-sm">{giving.rows.map((row) => <p key={row.id}>{row.category?.name}: {row.currency} {row.total.toLocaleString()} · {row.reconciliationStatus.replaceAll("_", " ")}</p>)}</div></Card>; })}</div></>;
}

export function HealthGrowthPanel({ mode, tenantId, userId }: { mode: "health" | "growth"; tenantId: string; userId: string }) {
  if (mode === "growth") {
    const analytics = getGroupAnalytics({ tenantId, userId });
    return <><PageHeader title="Growth Tracking" description="Real counts for joining, visitors, converts, attendance, transfers, outreach, leadership pipeline, daughter groups and meeting frequency." /><div className="mt-8 grid gap-4 md:grid-cols-3">{Object.entries(analytics).filter(([, value]) => typeof value === "number").map(([key, value]) => <StatCard key={key} label={key.replaceAll(/([A-Z])/g, " $1").toLowerCase()} value={value as number} />)}</div></>;
  }
  return <><PageHeader title="Group Health" description="Neutral operational indicators for care and planning. No spiritual score, public ranking or giving-based leaderboard." /><div className="mt-8 grid gap-4">{groupHealthSnapshots.map((snapshot) => <Card key={snapshot.id}><div className="flex justify-between gap-3"><h2 className="font-semibold">{smallGroups.find((group) => group.id === snapshot.groupId)?.name}</h2><Badge tone={snapshot.label === "Capacity Pressure" ? "warning" : "success"}>{snapshot.label}</Badge></div><div className="mt-4 grid gap-2">{snapshot.indicators.map((indicator) => <p key={indicator.key} className="text-sm"><strong>{indicator.label}:</strong> {indicator.explanation}</p>)}</div></Card>)}</div></>;
}

export function MultiplicationClosurePanel({ mode }: { mode: "multiplication" | "closure" }) {
  if (mode === "closure") {
    return <><PageHeader title="Closure & Leader Handover" description="Closure, merger and leader handover require active-member transfers, open follow-up transfer, pastoral metadata protection, pending report resolution and approval." /><div className="mt-8 grid gap-4 md:grid-cols-3">{["Transfer active members", "Transfer follow-up tasks", "Transfer pastoral metadata", "Resolve pending reports", "Reassign leaders", "Preserve history"].map((item) => <Card key={item}><CheckCircle2 className="text-success" /><p className="mt-3 font-semibold">{item}</p></Card>)}</div></>;
  }
  return <><PageHeader title="Multiplication" description="Readiness recommendations and approvals for daughter groups. The system never automatically splits a group or deletes the parent." /><div className="mt-8 grid gap-4">{multiplicationProposals.map((proposal) => <Card key={proposal.id}><div className="flex justify-between gap-3"><div><h2 className="font-semibold">{proposal.proposedName}</h2><p className="mt-1 text-sm text-muted">From {smallGroups.find((group) => group.id === proposal.parentGroupId)?.name}</p></div><Badge tone="warning">{proposal.status.replaceAll("_", " ")}</Badge></div><p className="mt-4 text-sm">Proposed leader: {profiles.find((profile) => profile.id === proposal.proposedLeaderUserId)?.fullName}</p><p className="mt-2 text-sm text-muted">{proposal.readinessIndicators.join(", ")}</p></Card>)}</div></>;
}

export function QrCommunicationPanel({ mode }: { mode: "qr-codes" | "communication" }) {
  if (mode === "communication") {
    return <><PageHeader title="Communication Foundation" description="Provider abstractions for announcements, reminders, responses, leader changes, reschedules and programme invitations. No fake SMS, WhatsApp or email delivery." /><div className="mt-8 grid gap-4">{groupCommunicationEvents.map((event) => <Card key={event.id}><p className="font-semibold">{event.kind.replaceAll("_", " ")}</p><p className="mt-2 text-sm text-muted">{event.safeMetadata}</p><Badge tone="neutral">{event.channelProvider}</Badge></Card>)}</div></>;
  }
  return <><PageHeader title="Group QR Codes" description="Opaque QR codes for join requests, check-in, visitor registration, group information, outreach and authorized report access." /><div className="mt-8 grid gap-4 md:grid-cols-2">{groupQrCodes.map((qr) => <Card key={qr.id}><QrCode className="text-accent" /><p className="mt-3 font-semibold">{qr.publicCode}</p><p className="mt-2 text-sm text-muted">{qr.purpose.replaceAll("_", " ")} · scans {qr.scanCount} · {qr.active ? "active" : "inactive"}</p><p className="mt-2 text-sm">Protection: {qr.abuseProtection.join(", ")}</p></Card>)}</div></>;
}

export function AnalyticsPanel({ tenantId, userId }: { tenantId: string; userId: string }) {
  const reports = getGroupReports({ tenantId, userId });
  return (
    <>
      <PageHeader title="Group Analytics & Reports" description="Role-scoped reports for register, schedules, attendance, first-timers, converts, follow-up, approvals, workload, transfers, giving totals, handover, outreach and health." />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Register rows" value={reports.groupRegister.length} />
        <StatCard label="Schedule rows" value={reports.meetingSchedule.length} />
        <StatCard label="Attendance rows" value={reports.attendanceTrend.length} />
        <StatCard label="Report statuses" value={reports.reportStatus.length} />
      </div>
      <Card className="mt-8">
        <BarChart3 className="text-accent" />
        <p className="mt-3 font-semibold">Authorized exports placeholder</p>
        <p className="mt-2 text-sm text-muted">Exports inherit scope, protect giving privacy and omit confidential case details.</p>
      </Card>
    </>
  );
}

export function GroupSectionPanel({ section, slug, tenantId, userId }: { section: string; slug: string; tenantId: string; userId: string }) {
  if (section === "leader") return <LeaderWorkspacePanel tenantId={tenantId} userId="user-branch" />;
  if (section === "pastor") return <PastorWorkspacePanel tenantId={tenantId} userId={userId} />;
  if (section === "directory") return <DirectoryPanel tenantId={tenantId} userId={userId} />;
  if (section === "map") return <MapPanel tenantId={tenantId} userId={userId} />;
  if (section === "groups") return <GroupsRegisterPanel slug={slug} tenantId={tenantId} userId={userId} />;
  if (section === "meetings" || section === "attendance") return <MeetingsAttendancePanel mode={section} />;
  if (section === "reports" || section === "templates") return <ReportsPanel mode={section} />;
  if (section === "join-requests" || section === "transfers") return <RequestsTransfersPanel mode={section} />;
  if (section === "giving" || section === "handover") return <GivingHandoverPanel mode={section} />;
  if (section === "health" || section === "growth") return <HealthGrowthPanel mode={section} tenantId={tenantId} userId={userId} />;
  if (section === "multiplication" || section === "closure") return <MultiplicationClosurePanel mode={section} />;
  if (section === "qr-codes" || section === "communication") return <QrCommunicationPanel mode={section} />;
  if (section === "analytics") return <AnalyticsPanel tenantId={tenantId} userId={userId} />;
  return <GroupsHome slug={slug} tenantId={tenantId} userId={userId} />;
}

export function GroupPrivacyNotice() {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 text-sm leading-6 text-muted">
      <div className="flex gap-3"><Shield className="mt-1 text-accent" size={18} /><p>Group reports show safe referral metadata only. Giving is totals-only by default, private homes use approximate locations, and health indicators are for care planning rather than public ranking.</p></div>
    </div>
  );
}
