import Link from "next/link";
import { AlertTriangle, CheckCircle2, ClipboardList, Mic2, Music, Radio, Shield, UsersRound } from "lucide-react";
import { Badge, ButtonLink, Card, PageHeader, StatCard } from "@/components/ui";
import { profiles } from "@/lib/data";
import {
  departments,
  equipmentChecklistItems,
  mediaRequests,
  musicTeams,
  rehearsals,
  replacementRequests,
  rosterAssignments,
  serviceIncidents,
  servicePlanItems,
  serviceReports,
  services,
  songs,
  volunteerApplications,
  volunteerProfiles,
  worshipSets,
} from "@/lib/services-data";
import {
  getDepartmentDashboard,
  getServiceCoordinatorWorkspace,
  getServiceDashboard,
  getServiceReports,
  getVolunteerName,
  getVolunteerPortal,
} from "@/lib/services-engine";

export const serviceLinks = [
  ["Dashboard", ""],
  ["Calendar", "calendar"],
  ["Service Details", "details"],
  ["Order of Service", "order"],
  ["Templates", "templates"],
  ["Sermons", "sermons"],
  ["Worship Sets", "worship"],
  ["Song Library", "songs"],
  ["Music Teams", "music-teams"],
  ["Rehearsals", "rehearsals"],
  ["Departments", "departments"],
  ["Volunteers", "volunteers"],
  ["Applications", "applications"],
  ["Availability", "availability"],
  ["Rosters", "rosters"],
  ["Roster Builder", "roster-builder"],
  ["Replacements", "replacements"],
  ["Equipment", "equipment"],
  ["Technical Plan", "technical"],
  ["Media Requests", "media"],
  ["Livestream", "livestream"],
  ["Protocol", "protocol"],
  ["Hospitality", "hospitality"],
  ["Security", "security"],
  ["Announcements", "announcements"],
  ["Reports", "reports"],
  ["Incidents", "incidents"],
  ["Post-Service", "post-service"],
  ["Volunteer Portal", "volunteer"],
  ["Coordinator", "coordinator"],
] as const;

function ServiceCard({ service, slug }: { service: typeof services[number]; slug: string }) {
  return (
    <Card>
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-muted">{service.serviceDate} · {service.startTime}</p>
          <h2 className="mt-1 font-semibold">{service.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{service.theme} · {service.venue}</p>
        </div>
        <Badge tone={service.status === "published" ? "success" : "warning"}>{service.status.replaceAll("_", " ")}</Badge>
      </div>
      <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
        <p><strong>Coordinator:</strong> {profiles.find((profile) => profile.id === service.serviceCoordinatorUserId)?.fullName}</p>
        <p><strong>Preacher:</strong> {profiles.find((profile) => profile.id === service.preacherUserId)?.fullName}</p>
        <p><strong>Report:</strong> {service.reportStatus.replaceAll("_", " ")}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3"><ButtonLink href={`/workspace/${slug}/services/order`} variant="secondary">Order</ButtonLink><ButtonLink href={`/workspace/${slug}/services/rosters`} variant="secondary">Rosters</ButtonLink></div>
    </Card>
  );
}

export function ServicesHome({ slug, tenantId, userId }: { slug: string; tenantId: string; userId: string }) {
  const stats = getServiceDashboard({ tenantId, userId });
  return (
    <>
      <PageHeader title="Services & Volunteers" description="Plan services, worship, departments, rosters, volunteers, technical readiness, incidents and reports." actions={<ButtonLink href={`/workspace/${slug}/services/coordinator`}>Coordinator workspace</ButtonLink>} />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Upcoming services" value={stats.upcomingServices} />
        <StatCard label="Roster gaps" value={stats.rosterGaps} />
        <StatCard label="Volunteers confirmed" value={stats.volunteersConfirmed} />
        <StatCard label="Reports pending" value={stats.serviceReportsPending} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <StatCard label="First-timers" value={stats.firstTimers} />
        <StatCard label="New converts" value={stats.newConverts} />
        <StatCard label="Equipment issues" value={stats.equipmentIssues} />
        <StatCard label="Post-service actions" value={stats.postServiceActions} />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">{services.map((service) => <ServiceCard key={service.id} service={service} slug={slug} />)}</div>
      <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-4">{serviceLinks.slice(1).map(([label, path]) => <Link key={path} href={`/workspace/${slug}/services/${path}`} className="rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-accent"><p className="font-semibold">{label}</p><p className="mt-2 text-sm leading-6 text-muted">Open {label.toLowerCase()}.</p></Link>)}</div>
    </>
  );
}

export function ServiceSchedulePanel({ mode, slug }: { mode: "calendar" | "details" | "templates"; slug: string }) {
  if (mode === "templates") return <><PageHeader title="Service Templates" description="Versioned order-of-service defaults preserve the template version used by each service." /><Card className="mt-8"><ClipboardList className="text-accent" /><p className="mt-3 font-semibold">Main Sunday Service v1</p><p className="mt-2 text-sm text-muted">Opening Prayer, Praise, Worship, Announcements, Offering, Sermon, Closing Prayer</p></Card></>;
  return <><PageHeader title={mode === "calendar" ? "Service Calendar" : "Service Details"} description="Recurring schedules generate safe service instances with exceptions, pauses and one-instance edits." /><div className="mt-8 grid gap-4">{services.map((service) => <ServiceCard key={service.id} service={service} slug={slug} />)}</div></>;
}

export function OrderSermonPanel({ mode }: { mode: "order" | "sermons" | "technical" | "livestream" | "announcements" }) {
  if (mode === "sermons") return <><PageHeader title="Sermons" description="Pastors control what is uploaded; unpublished notes remain restricted." /><Card className="mt-8"><Mic2 className="text-accent" /><p className="mt-3 font-semibold">Serving with Grace</p><p className="mt-2 text-sm text-muted">Public summary approved. Cell-study conversion placeholder ready.</p></Card></>;
  if (mode === "technical" || mode === "livestream" || mode === "announcements") return <><PageHeader title={mode === "technical" ? "Technical Plan" : mode === "livestream" ? "Livestream Plan" : "Service Announcements"} description="Adapter-ready planning without fake livestream or communication delivery." /><div className="mt-8 grid gap-4">{equipmentChecklistItems.map((item) => <Card key={item.id}><Radio className="text-accent" /><p className="mt-3 font-semibold">{item.item}</p><p className="mt-2 text-sm text-muted">{item.readinessStatus.replaceAll("_", " ")} · {item.issue ?? "No issue"}</p></Card>)}</div></>;
  return <><PageHeader title="Order of Service" description="Structured service-plan items support keyboard-accessible reordering, assignments, cues and reporting." /><div className="mt-8 grid gap-4">{servicePlanItems.sort((a, b) => a.sortOrder - b.sortOrder).map((item) => <Card key={item.id}><div className="flex justify-between gap-3"><h2 className="font-semibold">{item.sortOrder}. {item.title}</h2><Badge tone={item.status === "ready" ? "success" : "warning"}>{item.status}</Badge></div><p className="mt-2 text-sm text-muted">{item.startTime} · {item.durationMinutes} min · {item.technicalCue ?? "No technical cue"}</p></Card>)}</div></>;
}

export function WorshipPanel({ mode }: { mode: "worship" | "songs" | "music-teams" | "rehearsals" }) {
  if (mode === "songs") return <><PageHeader title="Song Library" description="Church-controlled song metadata, key history and licensing notes. Unauthorized lyrics are not stored by default." /><div className="mt-8 grid gap-4">{songs.map((song) => <Card key={song.id}><Music className="text-accent" /><p className="mt-3 font-semibold">{song.title}</p><p className="mt-2 text-sm text-muted">{song.defaultKey} · {song.tempo} · {song.licensingNote}</p></Card>)}</div></>;
  if (mode === "music-teams") return <><PageHeader title="Music Teams" description="Operational readiness labels for choir, band and worship teams without public talent rankings." /><div className="mt-8 grid gap-4">{musicTeams.map((team) => <Card key={team.id}><p className="font-semibold">{team.name}</p><p className="mt-2 text-sm text-muted">{team.teamType.replaceAll("_", " ")} · {team.readinessLabel}</p></Card>)}</div></>;
  if (mode === "rehearsals") return <><PageHeader title="Rehearsals" description="Schedule rehearsals, track attendance, equipment needs and readiness without humiliating volunteers." /><div className="mt-8 grid gap-4">{rehearsals.map((rehearsal) => <Card key={rehearsal.id}><p className="font-semibold">{rehearsal.date} · {rehearsal.time}</p><p className="mt-2 text-sm text-muted">{rehearsal.readinessStatus.replaceAll("_", " ")} · {rehearsal.notes}</p></Card>)}</div></>;
  return <><PageHeader title="Worship Sets" description="Songs, keys, musicians, transitions, technical notes and licensing notes for worship planning." /><div className="mt-8 grid gap-4">{worshipSets.map((set) => <Card key={set.id}><Music className="text-accent" /><p className="mt-3 font-semibold">{set.setType.replaceAll("_", " ")}</p><p className="mt-2 text-sm text-muted">{set.songs.length} songs · {set.durationMinutes} minutes · {set.licensingNote}</p></Card>)}</div></>;
}

export function DepartmentsVolunteersPanel({ mode }: { mode: "departments" | "volunteers" | "applications" | "availability" | "volunteer" }) {
  if (mode === "volunteer") {
    const portal = getVolunteerPortal("vol-david");
    return <><PageHeader title="Volunteer Portal" description="Mobile-friendly assignment confirmation, replacement requests, check-in history and availability settings." /><div className="mt-8 grid gap-4 md:grid-cols-4"><StatCard label="Assignments" value={portal.assignments.length} /><StatCard label="Replacements" value={portal.replacementRequests.length} /><StatCard label="Check-ins" value={portal.checkIns.length} /><StatCard label="Max/month" value={portal.availability?.maximumServicesPerMonth ?? 0} /></div></>;
  }
  if (mode === "departments") return <><PageHeader title="Departments" description="Branch-scoped departments, service responsibilities, leaders and training requirements with hierarchy protection." /><div className="mt-8 grid gap-4">{departments.map((dept) => { const dash = getDepartmentDashboard(dept.id); return <Card key={dept.id}><p className="font-semibold">{dept.name}</p><p className="mt-2 text-sm text-muted">{dept.purpose}</p><p className="mt-3 text-sm">Assignments {dash.rosterAssignments.length} · equipment issues {dash.equipmentIssues.length}</p></Card>; })}</div></>;
  if (mode === "applications") return <><PageHeader title="Volunteer Applications" description="Serving applications require approval, training and activation; programme completion does not auto-accept a volunteer." /><div className="mt-8 grid gap-4">{volunteerApplications.map((app) => <Card key={app.id}><p className="font-semibold">{app.status.replaceAll("_", " ")}</p><p className="mt-2 text-sm text-muted">{app.motivation} · {app.requiredTraining.join(", ")}</p></Card>)}</div></>;
  if (mode === "availability") return <><PageHeader title="Availability" description="Leaders see availability before rostering; overrides require visible reason." /><Card className="mt-8"><CheckCircle2 className="text-success" /><p className="mt-3 font-semibold">Availability-aware rostering enabled</p><p className="mt-2 text-sm text-muted">Declared unavailability creates conflict warnings.</p></Card></>;
  return <><PageHeader title="Volunteers" description="Volunteer profiles link to people records, departments, roles, training, availability and service history without public performance scores." /><div className="mt-8 grid gap-4">{volunteerProfiles.map((profile) => <Card key={profile.id}><UsersRound className="text-accent" /><p className="mt-3 font-semibold">{getVolunteerName(profile.id)}</p><p className="mt-2 text-sm text-muted">{profile.roles.join(", ")} · {profile.inductionStatus.replaceAll("_", " ")}</p></Card>)}</div></>;
}

export function RosterOperationsPanel({ mode }: { mode: "rosters" | "roster-builder" | "replacements" | "equipment" | "media" | "protocol" | "hospitality" | "security" }) {
  if (mode === "replacements") return <><PageHeader title="Replacement Workflow" description="Original assignment history is preserved while eligible replacements are invited and confirmed." /><div className="mt-8 grid gap-4">{replacementRequests.map((req) => <Card key={req.id}><p className="font-semibold">{req.status.replaceAll("_", " ")}</p><p className="mt-2 text-sm text-muted">{req.reason}</p></Card>)}</div></>;
  if (mode === "equipment") return <><PageHeader title="Equipment Checklists" description="Service readiness links to future asset records without fake stock deduction." /><div className="mt-8 grid gap-4">{equipmentChecklistItems.map((item) => <Card key={item.id}><p className="font-semibold">{item.item}</p><p className="mt-2 text-sm text-muted">{item.quantity} · {item.readinessStatus.replaceAll("_", " ")} · {item.issue ?? "ready"}</p></Card>)}</div></>;
  if (mode === "media") return <><PageHeader title="Media Requests" description="Internal media workflows for slides, artwork, livestream thumbnails and revisions." /><div className="mt-8 grid gap-4">{mediaRequests.map((request) => <Card key={request.id}><p className="font-semibold">{request.assetType}</p><p className="mt-2 text-sm text-muted">{request.status.replaceAll("_", " ")} · deadline {request.deadline}</p></Card>)}</div></>;
  if (mode === "protocol" || mode === "hospitality" || mode === "security") return <><PageHeader title={mode === "protocol" ? "Protocol" : mode === "hospitality" ? "Hospitality" : "Security Plan"} description="Guest, hospitality, parking, safety and incident readiness with protected contact and incident details." /><Card className="mt-8"><Shield className="text-accent" /><p className="mt-3 font-semibold">Operational plan placeholder</p><p className="mt-2 text-sm text-muted">Details remain team-scoped and do not demean ordinary attendees.</p></Card></>;
  return <><PageHeader title={mode === "roster-builder" ? "Roster Builder" : "Rosters"} description="Assisted roster suggestions use availability, training, branch, workload, conflicts and human review before publication." /><div className="mt-8 grid gap-4">{rosterAssignments.map((assignment) => <Card key={assignment.id}><div className="flex justify-between gap-3"><p className="font-semibold">{getVolunteerName(assignment.volunteerProfileId)} · {assignment.role}</p><Badge tone={assignment.confirmation === "confirmed" ? "success" : "warning"}>{assignment.confirmation}</Badge></div><p className="mt-2 text-sm text-muted">{assignment.station} · report {assignment.reportingTime}</p></Card>)}</div></>;
}

export function ReportsIncidentsPanel({ mode, tenantId, userId }: { mode: "reports" | "incidents" | "post-service" | "coordinator"; tenantId: string; userId: string }) {
  if (mode === "coordinator") {
    const workspace = getServiceCoordinatorWorkspace({ tenantId, userId });
    return <><PageHeader title="Service Coordinator Workspace" description="Upcoming services, approvals, roster gaps, media, guest protocol, technical readiness and post-service actions." /><div className="mt-8 grid gap-4 md:grid-cols-4"><StatCard label="Upcoming" value={workspace.upcomingServices.length} /><StatCard label="Roster gaps" value={workspace.rosterGaps} /><StatCard label="Media pending" value={workspace.pendingMedia.length} /><StatCard label="Equipment issues" value={workspace.equipmentIssues.length} /></div></>;
  }
  if (mode === "incidents") return <><PageHeader title="Incidents" description="Restricted incident records route safeguarding details to Prompt 4 and hide sensitive notes from ordinary reports." /><div className="mt-8 grid gap-4">{serviceIncidents.map((incident) => <Card key={incident.id}><AlertTriangle className="text-warning" /><p className="mt-3 font-semibold">{incident.category.replaceAll("_", " ")}</p><p className="mt-2 text-sm text-muted">{incident.status === "restricted" ? "Restricted details hidden" : incident.summary}</p></Card>)}</div></>;
  if (mode === "post-service") return <><PageHeader title="Post-Service Review" description="Constructive action items for timing, equipment, volunteer gaps and follow-up readiness." /><div className="mt-8 grid gap-4">{serviceReports.flatMap((report) => report.nextActions).map((action) => <Card key={action}><p className="font-semibold">{action}</p><p className="mt-2 text-sm text-muted">Owner and due-date workflow placeholder.</p></Card>)}</div></>;
  const reports = getServiceReports({ tenantId, userId });
  return <><PageHeader title="Service Reports" description="Reports protect pastoral and safeguarding details while showing attendance, readiness, volunteer and operational data." /><div className="mt-8 grid gap-4 md:grid-cols-4"><StatCard label="Schedule" value={reports.schedule.length} /><StatCard label="Roster rows" value={reports.rosterCoverage.length} /><StatCard label="Equipment issues" value={reports.equipmentIssues.length} /><StatCard label="Incidents" value={reports.incidents.length} /></div></>;
}

export function ServiceSectionPanel({ section, slug, tenantId, userId }: { section: string; slug: string; tenantId: string; userId: string }) {
  if (section === "calendar" || section === "details" || section === "templates") return <ServiceSchedulePanel mode={section} slug={slug} />;
  if (section === "order" || section === "sermons" || section === "technical" || section === "livestream" || section === "announcements") return <OrderSermonPanel mode={section} />;
  if (section === "worship" || section === "songs" || section === "music-teams" || section === "rehearsals") return <WorshipPanel mode={section} />;
  if (section === "departments" || section === "volunteers" || section === "applications" || section === "availability" || section === "volunteer") return <DepartmentsVolunteersPanel mode={section} />;
  if (section === "rosters" || section === "roster-builder" || section === "replacements" || section === "equipment" || section === "media" || section === "protocol" || section === "hospitality" || section === "security") return <RosterOperationsPanel mode={section} />;
  if (section === "reports" || section === "incidents" || section === "post-service" || section === "coordinator") return <ReportsIncidentsPanel mode={section} tenantId={tenantId} userId={userId} />;
  return <ServicesHome slug={slug} tenantId={tenantId} userId={userId} />;
}

export function ServicePrivacyNotice() {
  return <div className="rounded-lg border border-border bg-surface p-4 text-sm leading-6 text-muted"><p>Service operations use minimum necessary access. Sermon notes, guest contact details and sensitive incidents are restricted; volunteer attendance supports planning, not spiritual ranking.</p></div>;
}
