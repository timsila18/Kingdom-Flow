import Link from "next/link";
import { AlertTriangle, CheckCircle2, ClipboardList, QrCode, Search, Shield } from "lucide-react";
import { Badge, ButtonLink, Card, EmptyPhase, PageHeader, StatCard } from "@/components/ui";
import { branches, profiles } from "@/lib/data";
import {
  duplicateCandidates,
  exportJobs,
  followUpAssignments,
  followUpTasks,
  followUpWorkers,
  formDefinitions,
  householdMembers,
  households,
  importJobs,
  lifecycleEvents,
  lifecycleStages,
  newConvertRecords,
  people,
  personConsents,
  qrCodes,
  transferRequests,
  visitorRecords,
} from "@/lib/people-data";
import { getEveryPersonMattersStats, getPersonName, maskPersonForUser, searchPeople } from "@/lib/people-engine";

export const peopleLinks = [
  ["Every Person Matters", ""],
  ["Directory", "directory"],
  ["Member Register", "members"],
  ["Visitors", "visitors"],
  ["First-Timers", "first-timers"],
  ["New Converts", "new-converts"],
  ["Follow-Up Dashboard", "follow-up"],
  ["Follow-Up Tasks", "tasks"],
  ["Worker Workload", "workload"],
  ["Households", "households"],
  ["Transfers", "transfers"],
  ["Duplicate Review", "duplicates"],
  ["Imports", "imports"],
  ["Exports", "exports"],
  ["Public Forms", "forms"],
  ["QR Codes", "qr-codes"],
  ["Lifecycle Settings", "lifecycle"],
  ["Follow-Up Templates", "templates"],
  ["Consent Settings", "consent"],
  ["Reports", "reports"],
] as const;

export function PeopleHome({ slug, tenantId, userId }: { slug: string; tenantId: string; userId: string }) {
  const stats = getEveryPersonMattersStats(tenantId, userId);
  return (
    <>
      <PageHeader title="Every Person Matters" description="A real-data care dashboard for visitors, new believers, members, households, consent and follow-up responsibility." actions={<ButtonLink href={`/workspace/${slug}/people/forms`}>Open forms</ButtonLink>} />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="First-time visitors" value={stats.firstTimeVisitors} detail="From visit records." />
        <StatCard label="New converts" value={stats.newConverts} detail="Linked to central people profiles." />
        <StatCard label="Unassigned new converts" value={stats.unassignedNewConverts} detail="Assignment target: within 24 hours." />
        <StatCard label="Overdue assignments" value={stats.overdueAssignments} detail="Permission and scope aware." />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <StatCard label="First contacts completed" value={stats.firstContactsCompleted} detail="Contact attempts reached." />
        <StatCard label="Fellowship requests" value={stats.fellowshipRequests} detail="People asking to belong." />
        <StatCard label="Duplicate reviews" value={stats.duplicateReviews} detail="Manual merge required." />
        <StatCard label="Consent withdrawals" value={stats.consentWithdrawals} detail="Stops affected outreach." />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {peopleLinks.slice(1).map(([label, path]) => (
          <Link key={path} href={`/workspace/${slug}/people/${path}`} className="rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-accent">
            <p className="font-semibold">{label}</p>
            <p className="mt-2 text-sm leading-6 text-muted">Open {label.toLowerCase()}.</p>
          </Link>
        ))}
      </div>
    </>
  );
}

export function PeopleDirectory({ slug, tenantId, userId }: { slug: string; tenantId: string; userId: string }) {
  const results = searchPeople(tenantId, userId, "");
  return (
    <>
      <PageHeader title="People Directory" description="One central profile per person, with lifecycle and branch history preserved as they move from visitor to member, volunteer and leader." actions={<ButtonLink href={`/workspace/${slug}/people/imports`}>Import people</ButtonLink>} />
      <Card className="mt-8">
        <div className="mb-4 flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm text-muted"><Search size={16} /> Search by name, phone, email, household, member number, branch, tag or lifecycle stage</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted"><tr><th className="py-2">Name</th><th>Stage</th><th>Branch</th><th>Consent</th><th>Privacy</th><th>Action</th></tr></thead>
            <tbody>{results.map((person) => {
              const safe = maskPersonForUser(person, userId);
              return <tr key={person.id} className="border-t border-border"><td className="py-3 font-medium">{getPersonName(safe)}</td><td>{safe.lifecycleStage.replaceAll("_", " ")}</td><td>{branches.find((branch) => branch.id === safe.branchId)?.name}</td><td>{safe.consentStatus}</td><td>{safe.privacyRestrictions.join(", ") || "standard"}</td><td><Link className="text-accent" href={`/workspace/${slug}/people/profile/${person.id}`}>View</Link></td></tr>;
            })}</tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

export function PersonProfile({ personId, userId }: { personId: string; userId: string }) {
  const person = people.find((item) => item.id === personId);
  if (!person) return <EmptyPhase title="Person not found" description="The profile may have been archived or belongs to another tenant." />;
  const safe = maskPersonForUser(person, userId);
  const household = householdMembers.find((item) => item.personId === person.id);
  return (
    <>
      <PageHeader title={getPersonName(safe)} description={`${safe.lifecycleStage.replaceAll("_", " ")} · ${branches.find((branch) => branch.id === safe.branchId)?.name ?? "No branch"}`} actions={<Badge tone={safe.privacyRestrictions.includes("child_protected") ? "warning" : "success"}>{safe.privacyRestrictions.includes("child_protected") ? "Child protected" : "Standard privacy"}</Badge>} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="grid gap-4 md:grid-cols-3">
            {["Overview", "Contact", "Household", "Church Journey", "Follow-Up", "Assignments", "Programmes placeholder", "Attendance placeholder", "Pastoral Care summary", "Communications", "Documents", "Audit History"].map((tab) => <div key={tab} className="rounded-md bg-surface-muted p-3 text-sm font-medium">{tab}</div>)}
          </div>
          <div className="mt-6 grid gap-3 text-sm">
            <p><strong>Preferred contact:</strong> {safe.preferredContactMethod}</p>
            <p><strong>Phone:</strong> {safe.phoneNumbers.join(", ") || "Restricted or not supplied"}</p>
            <p><strong>Email:</strong> {safe.emailAddresses.join(", ") || "Not supplied"}</p>
            <p><strong>Next action:</strong> {followUpTasks.find((task) => task.personId === person.id && task.status !== "completed")?.description ?? "No open follow-up task"}</p>
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold">Household</h2>
          <p className="mt-2 text-sm text-muted">{households.find((item) => item.id === household?.householdId)?.name ?? "No household linked"}</p>
          <h2 className="mt-6 font-semibold">Lifecycle history</h2>
          <div className="mt-3 grid gap-2">{lifecycleEvents.filter((event) => event.personId === person.id).map((event) => <div key={event.id} className="rounded-md bg-surface-muted p-3 text-sm">{event.previousStage} to {event.newStage}</div>)}</div>
        </Card>
      </div>
    </>
  );
}

export function VisitorsPanel() {
  return (
    <>
      <PageHeader title="Visitors & First-Timers" description="Public QR, kiosk, usher, mobile, event, import and share-link capture paths all create or match central person profiles." />
      <div className="mt-8 grid gap-4 md:grid-cols-2">{visitorRecords.map((record) => <Card key={record.id}><div className="flex justify-between gap-3"><div><p className="font-semibold">{getPersonName(people.find((person) => person.id === record.personId)!)}</p><p className="mt-1 text-sm text-muted">{record.captureMethod} · {record.visitDate}</p></div><Badge tone={record.firstEverVisit ? "accent" : "neutral"}>{record.firstEverVisit ? "First-time" : "Returning"}</Badge></div><p className="mt-4 text-sm text-muted">Consent: {record.consentToContact ? "contact allowed" : "no outreach"} · Follow-up: {record.wantsFollowUp ? "requested" : "not requested"}</p></Card>)}</div>
    </>
  );
}

export function NewConvertsPanel() {
  return (
    <>
      <PageHeader title="New Converts" description="New-believer journeys are linked to central person profiles, human assignment, follow-up tasks and pastoral oversight without pressuring people away from another church." />
      <div className="mt-8 grid gap-4">{newConvertRecords.map((record) => <Card key={record.id}><div className="flex flex-wrap justify-between gap-3"><div><p className="font-semibold">{getPersonName(people.find((person) => person.id === record.personId)!)}</p><p className="mt-1 text-sm text-muted">Assigned worker: {profiles.find((profile) => profile.id === record.assignedWorkerId)?.fullName ?? "Unassigned"}</p></div><Badge tone={record.assignedWorkerId ? "success" : "warning"}>{record.status.replaceAll("_", " ")}</Badge></div></Card>)}</div>
    </>
  );
}

export function FollowUpPanel() {
  return (
    <>
      <PageHeader title="Follow-Up Dashboard" description="Track assigned workers, current stage, next action, due dates, contact attempts, outcomes, escalation and closure." />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card><h2 className="font-semibold">Tasks</h2><div className="mt-4 grid gap-3">{followUpTasks.map((task) => <div key={task.id} className="rounded-md bg-surface-muted p-3 text-sm"><div className="flex justify-between gap-3"><span>{task.description}</span><Badge tone={task.status === "completed" ? "success" : "warning"}>{task.status}</Badge></div><p className="mt-1 text-muted">Due {new Date(task.dueDate).toLocaleString()}</p></div>)}</div></Card>
        <Card><h2 className="font-semibold">Worker workload</h2><div className="mt-4 grid gap-2">{followUpWorkers.map((worker) => { const active = followUpAssignments.filter((assignment) => assignment.workerUserId === worker.userId && ["pending", "accepted"].includes(assignment.status)).length; return <div key={worker.id} className="rounded-md bg-surface-muted p-3 text-sm">{profiles.find((profile) => profile.id === worker.userId)?.fullName}: {active}/{worker.maxActiveAssignments}</div>; })}</div></Card>
      </div>
    </>
  );
}

export function HouseholdsPanel() {
  return (
    <>
      <PageHeader title="Households" description="Households link adults, children, guardians and dependants without inferring relationships automatically." />
      <div className="mt-8 grid gap-4">{households.map((household) => <Card key={household.id}><h2 className="font-semibold">{household.name}</h2><p className="mt-2 text-sm text-muted">Primary contact: {getPersonName(people.find((person) => person.id === household.primaryContactPersonId)!)}</p><p className="mt-3 text-sm">Members: {householdMembers.filter((member) => member.householdId === household.id).length}</p></Card>)}</div>
    </>
  );
}

export function TransfersPanel() {
  return (
    <>
      <PageHeader title="Branch Transfers" description="Transfer workflows preserve person history, avoid duplicate profiles and create follow-up handover." />
      <div className="mt-8 grid gap-4">{transferRequests.map((request) => <Card key={request.id}><p className="font-semibold">{getPersonName(people.find((person) => person.id === request.personId)!)}</p><p className="mt-2 text-sm text-muted">{branches.find((branch) => branch.id === request.sourceBranchId)?.name} to {branches.find((branch) => branch.id === request.destinationBranchId)?.name}</p><Badge tone="warning">{request.status.replaceAll("_", " ")}</Badge></Card>)}</div>
    </>
  );
}

export function DuplicatesPanel() {
  return (
    <>
      <PageHeader title="Duplicate Review" description="Review matching signals; merge only with permission, confirmation, audit and preserved source identifiers." />
      <div className="mt-8 grid gap-4">{duplicateCandidates.map((candidate) => <Card key={candidate.id}><div className="flex gap-3"><AlertTriangle className="text-warning" /><div><p className="font-semibold">Potential duplicate</p><p className="mt-1 text-sm text-muted">{candidate.signals.join(", ")}</p></div></div><div className="mt-4 flex gap-2"><button className="rounded-md border border-border px-3 py-2 text-sm font-semibold">Merge safely</button><button className="rounded-md border border-border px-3 py-2 text-sm font-semibold">Not same person</button></div></Card>)}</div>
    </>
  );
}

export function ImportsExportsPanel({ mode }: { mode: "imports" | "exports" }) {
  const rows = mode === "imports" ? importJobs : exportJobs;
  return (
    <>
      <PageHeader title={mode === "imports" ? "People Imports" : "People Exports"} description={mode === "imports" ? "Dry-run validation, field mapping, duplicate detection and error reporting." : "Permission-aware exports with sensitive-field approval and expiring downloads."} />
      <div className="mt-8 grid gap-4">{rows.map((row) => <Card key={row.id}><p className="font-semibold">{mode === "imports" ? (row as typeof importJobs[number]).category : (row as typeof exportJobs[number]).exportType}</p><p className="mt-2 text-sm text-muted">Status: {row.status}</p></Card>)}</div>
    </>
  );
}

export function FormsQrPanel({ mode }: { mode: "forms" | "qr" }) {
  return (
    <>
      <PageHeader title={mode === "forms" ? "Public & Staff Forms" : "QR Codes"} description="Branded, branch-specific, consent-aware capture paths with duplicate checking and assignment rules." />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {(mode === "forms" ? formDefinitions : qrCodes).map((item) => <Card key={item.id}>{mode === "forms" ? <><ClipboardList className="text-accent" /><p className="mt-3 font-semibold">{(item as typeof formDefinitions[number]).name}</p><p className="mt-2 text-sm text-muted">{(item as typeof formDefinitions[number]).consentStatement}</p></> : <><QrCode className="text-accent" /><p className="mt-3 font-semibold">{(item as typeof qrCodes[number]).code}</p><p className="mt-2 text-sm text-muted">Scans {(item as typeof qrCodes[number]).scans} · submissions {(item as typeof qrCodes[number]).submissions}</p></>}</Card>)}
      </div>
    </>
  );
}

export function LifecycleConsentPanel({ mode }: { mode: "lifecycle" | "consent" | "templates" | "reports" }) {
  if (mode === "lifecycle") {
    return <><PageHeader title="Lifecycle Settings" description="Rename, reorder and configure transitions without erasing history." /><div className="mt-8 grid gap-2">{lifecycleStages.map((stage) => <div key={stage.key} className="rounded-md border border-border bg-surface p-3 text-sm">{stage.order}. {stage.displayName} {stage.approvalRequired ? "(approval)" : ""}</div>)}</div></>;
  }
  if (mode === "consent") {
    return <><PageHeader title="Consent Settings" description="Consent is granular by channel and purpose; withdrawal stops affected non-essential outreach only." /><div className="mt-8 grid gap-3">{personConsents.map((consent) => <Card key={consent.id}><p className="font-semibold">{consent.consentType}</p><p className="mt-1 text-sm text-muted">{consent.status} · {consent.source}</p></Card>)}</div></>;
  }
  if (mode === "reports") {
    return <><PageHeader title="People Reports" description="Real totals for registers, visitor lists, new converts, assignments, workload, lifecycle progression, consent and duplicates." /><div className="mt-8 grid gap-4 md:grid-cols-3">{["Member register", "Visitor register", "New converts", "Assignment status", "Follow-up worker workload", "Lifecycle progression", "Branch distribution", "Consent status", "Duplicate review"].map((report) => <Card key={report}><CheckCircle2 className="text-success" /><p className="mt-3 font-semibold">{report}</p></Card>)}</div></>;
  }
  return <><PageHeader title="Follow-Up Templates" description="Versioned task sequences for visitors, new converts, inactive members, families and youth journeys." /><EmptyPhase title="New Convert 30-Day Journey" description="Welcome message, first call, fellowship invitation, foundation programme invitation and pastoral introduction. Existing journeys retain their template version." /></>;
}

export function PeopleSectionPanel({ section, slug, tenantId, userId }: { section: string; slug: string; tenantId: string; userId: string }) {
  if (section === "directory" || section === "members") return <PeopleDirectory slug={slug} tenantId={tenantId} userId={userId} />;
  if (section === "visitors" || section === "first-timers") return <VisitorsPanel />;
  if (section === "new-converts") return <NewConvertsPanel />;
  if (section === "follow-up" || section === "tasks" || section === "workload") return <FollowUpPanel />;
  if (section === "households") return <HouseholdsPanel />;
  if (section === "transfers") return <TransfersPanel />;
  if (section === "duplicates") return <DuplicatesPanel />;
  if (section === "imports") return <ImportsExportsPanel mode="imports" />;
  if (section === "exports") return <ImportsExportsPanel mode="exports" />;
  if (section === "forms") return <FormsQrPanel mode="forms" />;
  if (section === "qr-codes") return <FormsQrPanel mode="qr" />;
  if (section === "lifecycle" || section === "consent" || section === "templates" || section === "reports") return <LifecycleConsentPanel mode={section} />;
  return <PeopleHome slug={slug} tenantId={tenantId} userId={userId} />;
}

export function PrivacyNotice() {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 text-sm leading-6 text-muted">
      <div className="flex gap-3"><Shield className="mt-1 text-accent" size={18} /><p>Private notes, national IDs, medical data, child details and pastoral information are masked unless explicit permissions allow access.</p></div>
    </div>
  );
}
