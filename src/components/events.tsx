import Link from "next/link";
import { AlertTriangle, BadgeCheck, Bus, CalendarDays, CheckCircle2, ClipboardList, HeartHandshake, MapPin, Shield, Ticket, UsersRound } from "lucide-react";
import { Badge, ButtonLink, Card, PageHeader, StatCard } from "@/components/ui";
import { people } from "@/lib/people-data";
import { getPersonName } from "@/lib/people-engine";
import {
  accommodationAllocations,
  campusFellowships,
  childCheckIns,
  eventIncidents,
  eventMealPlans,
  eventRegistrations,
  eventReports,
  eventRooms,
  eventSessions,
  eventSpeakers,
  eventTickets,
  ministryEvents,
  missionApplications,
  missionTrips,
  outreachCampaigns,
  outreachContacts,
  passengerManifests,
  transportRoutes,
  youthMinistryRecords,
} from "@/lib/events-data";
import { calculateRegistrationTotal, getCampusDashboard, getChildrenDashboard, getEventDashboard, getEventReports, getPublicEventPage, getYouthDashboard, redactEventIncident } from "@/lib/events-engine";

export const eventLinks = [
  ["Dashboard", ""],
  ["Calendar", "calendar"],
  ["Event Details", "details"],
  ["Event Builder", "builder"],
  ["Sessions", "sessions"],
  ["Registrations", "registrations"],
  ["Waitlist", "waitlist"],
  ["Tickets", "tickets"],
  ["Check-In", "check-in"],
  ["Badges", "badges"],
  ["Speakers", "speakers"],
  ["Venues", "venues"],
  ["Meals", "meals"],
  ["Accommodation", "accommodation"],
  ["Transport", "transport"],
  ["Volunteers", "volunteers"],
  ["Security Plan", "security"],
  ["Safeguarding Plan", "safeguarding"],
  ["Incidents", "incidents"],
  ["Event Reports", "reports"],
  ["Feedback", "feedback"],
  ["Outreach", "outreach"],
  ["Missions", "missions"],
  ["Children's Ministry", "children"],
  ["Child Check-In", "child-check-in"],
  ["Child Pickup", "child-pickup"],
  ["Teen Ministry", "teens"],
  ["Youth Ministry", "youth"],
  ["Campus Ministry", "campus"],
  ["Public Event Page", "public"],
  ["Guardian Portal", "guardian"],
  ["Coordinator", "coordinator"],
] as const;

function personName(personId: string) {
  const person = people.find((item) => item.id === personId);
  return person ? getPersonName(person) : "Participant";
}

function EventCard({ event, slug }: { event: typeof ministryEvents[number]; slug: string }) {
  return (
    <Card>
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-muted">{event.startDate} - {event.endDate}</p>
          <h2 className="mt-1 font-semibold">{event.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{event.theme} · {event.venue} · {event.city}</p>
        </div>
        <Badge tone={event.status.includes("open") || event.status === "published" ? "success" : "warning"}>{event.status.replaceAll("_", " ")}</Badge>
      </div>
      <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
        <p><strong>Capacity:</strong> {event.capacity}</p>
        <p><strong>Safeguarding:</strong> {event.safeguardingLevel.replaceAll("_", " ")}</p>
        <p><strong>Registration:</strong> {event.registrationStatus.replaceAll("_", " ")}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3"><ButtonLink href={`/workspace/${slug}/events/registrations`} variant="secondary">Registrations</ButtonLink><ButtonLink href={`/workspace/${slug}/events/check-in`} variant="secondary">Check-In</ButtonLink></div>
    </Card>
  );
}

export function EventsHome({ slug, tenantId, userId }: { slug: string; tenantId: string; userId: string }) {
  const stats = getEventDashboard({ tenantId, userId });
  return (
    <>
      <PageHeader title="Events & Missions" description="Plan conferences, outreach, missions, children, youth, campus ministry, registrations, tickets, logistics and safeguarding." actions={<ButtonLink href={`/workspace/${slug}/events/coordinator`}>Coordinator workspace</ButtonLink>} />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Upcoming events" value={stats.upcomingEvents} />
        <StatCard label="Registrations" value={stats.registrations} />
        <StatCard label="Checked in" value={stats.checkedIn} />
        <StatCard label="Safeguarding gaps" value={stats.safeguardingGaps} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <StatCard label="Transport routes" value={stats.transportReady} />
        <StatCard label="Accommodation" value={stats.accommodationReady} />
        <StatCard label="Incidents" value={stats.incidents} />
        <StatCard label="Follow-up actions" value={stats.followUp} />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">{ministryEvents.map((event) => <EventCard key={event.id} event={event} slug={slug} />)}</div>
      <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-4">{eventLinks.slice(1).map(([label, path]) => <Link key={path} href={`/workspace/${slug}/events/${path}`} className="rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-accent"><p className="font-semibold">{label}</p><p className="mt-2 text-sm leading-6 text-muted">Open {label.toLowerCase()}.</p></Link>)}</div>
    </>
  );
}

export function EventPlanningPanel({ mode, slug }: { mode: "calendar" | "details" | "builder" | "sessions" | "public"; slug: string }) {
  if (mode === "sessions") return <><PageHeader title="Event Sessions" description="Plenaries, workshops, children sessions, meals and transport windows with room capacity and check-in rules." /><div className="mt-8 grid gap-4">{eventSessions.map((session) => <Card key={session.id}><CalendarDays className="text-accent" /><p className="mt-3 font-semibold">{session.title}</p><p className="mt-2 text-sm text-muted">{session.date} · {session.startTime}-{session.endTime} · capacity {session.capacity}</p></Card>)}</div></>;
  if (mode === "public") {
    const page = getPublicEventPage("event-conference-2026");
    return <><PageHeader title="Public Event Page" description="Approved public content only: schedule, speakers, fees, privacy notice and registration options." /><Card className="mt-8"><p className="font-semibold">{page?.event.title}</p><p className="mt-2 text-sm text-muted">{page?.privacyNotice}</p><p className="mt-3 text-sm">Categories {page?.categories.length} · speakers {page?.speakers.length}</p></Card></>;
  }
  if (mode === "builder") return <><PageHeader title="Event Builder" description="Configure details, planning team, sessions, registration, pricing, logistics, safeguarding, public page and approval submission." /><Card className="mt-8"><ClipboardList className="text-accent" /><p className="mt-3 font-semibold">Approval-gated builder</p><p className="mt-2 text-sm text-muted">Publication stays blocked until approval and mandatory safeguarding setup are complete.</p></Card></>;
  return <><PageHeader title={mode === "calendar" ? "Event Calendar" : "Event Details"} description="Central event register for conferences, camps, outreach, missions, weddings, funerals, concerts and custom ministry activities." /><div className="mt-8 grid gap-4">{ministryEvents.map((event) => <EventCard key={event.id} event={event} slug={slug} />)}</div></>;
}

export function RegistrationPanel({ mode }: { mode: "registrations" | "waitlist" | "tickets" | "check-in" | "badges" | "guardian" }) {
  if (mode === "tickets" || mode === "badges") return <><PageHeader title={mode === "tickets" ? "Tickets & Access Passes" : "Badges"} description="QR passes, child wristband placeholders, printable badge metadata and privacy-safe access indicators." /><div className="mt-8 grid gap-4">{eventTickets.map((ticket) => <Card key={ticket.id}><Ticket className="text-accent" /><p className="mt-3 font-semibold">{ticket.code}</p><p className="mt-2 text-sm text-muted">{ticket.accessLevel.replaceAll("_", " ")} · {ticket.status}</p></Card>)}</div></>;
  if (mode === "check-in") return <><PageHeader title="Event Check-In" description="Mobile-ready QR/search/manual check-in with offline-friendly records and minimum participant data." /><div className="mt-8 grid gap-4">{eventRegistrations.map((registration) => <Card key={registration.id}><CheckCircle2 className="text-success" /><p className="mt-3 font-semibold">{personName(registration.personId)}</p><p className="mt-2 text-sm text-muted">{registration.checkInStatus.replaceAll("_", " ")} · {registration.status.replaceAll("_", " ")}</p></Card>)}</div></>;
  if (mode === "waitlist") return <><PageHeader title="Event Waitlist" description="Category capacity, family/group handling, promotion deadlines and manual priority without overbooking." /><Card className="mt-8"><UsersRound className="text-accent" /><p className="mt-3 font-semibold">Capacity-aware waitlist</p><p className="mt-2 text-sm text-muted">Promotion requires an available category slot or explicit authorized override.</p></Card></>;
  if (mode === "guardian") return <><PageHeader title="Guardian Portal" description="Guardian registrations, consent, pickup codes and child attendance without exposing full child records." /><Card className="mt-8"><Shield className="text-accent" /><p className="mt-3 font-semibold">Grace Otieno</p><p className="mt-2 text-sm text-muted">Pickup code issued · authorized adults only · photo consent withdrawn</p></Card></>;
  return <><PageHeader title="Event Registrations" description="Public, member, household, group, invite-only, child, youth, volunteer, speaker and walk-in registrations." /><div className="mt-8 grid gap-4">{eventRegistrations.map((registration) => { const total = calculateRegistrationTotal(registration.categoryId); return <Card key={registration.id}><p className="font-semibold">{personName(registration.personId)}</p><p className="mt-2 text-sm text-muted">{registration.status.replaceAll("_", " ")} · payment {registration.paymentStatus} · total KES {total.total}</p></Card>; })}</div></>;
}

export function LogisticsPanel({ mode }: { mode: "speakers" | "venues" | "meals" | "accommodation" | "transport" | "volunteers" | "security" | "safeguarding" | "incidents" | "feedback" }) {
  if (mode === "speakers") return <><PageHeader title="Speakers & Ministers" description="Guest itineraries, public bios, hospitality and technical needs with protected contact details." /><div className="mt-8 grid gap-4">{eventSpeakers.map((speaker) => <Card key={speaker.id}><p className="font-semibold">{speaker.name}</p><p className="mt-2 text-sm text-muted">{speaker.title} · {speaker.status} · contact protected</p></Card>)}</div></>;
  if (mode === "venues") return <><PageHeader title="Venues & Rooms" description="Halls, rooms, child areas, registration points, dining, parking, medical points and readiness issues." /><div className="mt-8 grid gap-4">{eventRooms.map((room) => <Card key={room.id}><MapPin className="text-accent" /><p className="mt-3 font-semibold">{room.name}</p><p className="mt-2 text-sm text-muted">{room.spaceType} · capacity {room.capacity} · {room.readinessStatus}</p></Card>)}</div></>;
  if (mode === "meals") return <><PageHeader title="Meals & Catering" description="Meal plans, dietary notes, meal tickets and serving counts without procurement or stock accounting." /><div className="mt-8 grid gap-4">{eventMealPlans.map((meal) => <Card key={meal.id}><p className="font-semibold">{meal.mealType}</p><p className="mt-2 text-sm text-muted">{meal.quantity} portions · {meal.servingTime} · {meal.status}</p></Card>)}</div></>;
  if (mode === "accommodation") return <><PageHeader title="Accommodation" description="Room allocation, family grouping, check-in/out and minor safeguarding controls." /><div className="mt-8 grid gap-4">{accommodationAllocations.map((allocation) => <Card key={allocation.id}><p className="font-semibold">{allocation.site} · {allocation.room}</p><p className="mt-2 text-sm text-muted">{allocation.status} · {allocation.minorSafeguardingStatus.replaceAll("_", " ")}</p></Card>)}</div></>;
  if (mode === "transport") return <><PageHeader title="Transport & Manifests" description="Routes, vehicles, boarding, child manifests, emergency contacts and return tracking." /><div className="mt-8 grid gap-4">{transportRoutes.map((route) => <Card key={route.id}><Bus className="text-accent" /><p className="mt-3 font-semibold">{route.name}</p><p className="mt-2 text-sm text-muted">{route.pickupPoint} · capacity {route.capacity} · manifest rows {passengerManifests.filter((item) => item.routeId === route.id).length}</p></Card>)}</div></>;
  if (mode === "incidents") return <><PageHeader title="Event Incidents" description="Operational summaries only; safeguarding, child and medical details route to restricted workflows." /><div className="mt-8 grid gap-4">{eventIncidents.map((incident) => { const redacted = redactEventIncident(incident.id, "user-volunteer"); return <Card key={incident.id}><AlertTriangle className="text-warning" /><p className="mt-3 font-semibold">{incident.category.replaceAll("_", " ")}</p><p className="mt-2 text-sm text-muted">{redacted?.summary}</p></Card>; })}</div></>;
  if (mode === "safeguarding" || mode === "security") return <><PageHeader title={mode === "safeguarding" ? "Safeguarding Plan" : "Security Plan"} description="Leads, restricted areas, ratios, emergency processes, gates, evacuation and incident escalation." /><Card className="mt-8"><Shield className="text-accent" /><p className="mt-3 font-semibold">Mandatory readiness controls</p><p className="mt-2 text-sm text-muted">Minor/vulnerable-person events cannot publish while required setup is incomplete.</p></Card></>;
  if (mode === "feedback") return <><PageHeader title="Feedback & Surveys" description="Attendee, volunteer, speaker and guardian feedback with safeguarding-concern routing." /><Card className="mt-8"><BadgeCheck className="text-accent" /><p className="mt-3 font-semibold">Feedback foundation</p><p className="mt-2 text-sm text-muted">Identifiable feedback is not published without consent.</p></Card></>;
  return <><PageHeader title="Event Volunteers" description="Event roles reuse department and roster foundations instead of duplicating volunteer profiles." /><Card className="mt-8"><UsersRound className="text-accent" /><p className="mt-3 font-semibold">Roster-linked coverage</p><p className="mt-2 text-sm text-muted">Registration, protocol, hospitality, media, medical, children, youth and follow-up roles are event-scoped.</p></Card></>;
}

export function MinistryPanel({ mode }: { mode: "outreach" | "missions" | "children" | "child-check-in" | "child-pickup" | "teens" | "youth" | "campus" | "reports" | "coordinator" }) {
  if (mode === "outreach") return <><PageHeader title="Outreach" description="Campaigns, team assignments, consent-based contact capture, new-convert handoff and reports." /><div className="mt-8 grid gap-4">{outreachCampaigns.map((campaign) => <Card key={campaign.id}><HeartHandshake className="text-accent" /><p className="mt-3 font-semibold">{campaign.name}</p><p className="mt-2 text-sm text-muted">{campaign.targetArea} · contacts {outreachContacts.length} · {campaign.status}</p></Card>)}</div></>;
  if (mode === "missions") return <><PageHeader title="Mission Trips" description="Mission proposals, applications, approvals, secure documents, itinerary, participation and reports." /><div className="mt-8 grid gap-4">{missionTrips.map((trip) => <Card key={trip.id}><p className="font-semibold">{trip.title}</p><p className="mt-2 text-sm text-muted">{trip.destination} · applications {missionApplications.length} · documents restricted</p></Card>)}</div></>;
  if (mode === "children" || mode === "child-check-in" || mode === "child-pickup") { const stats = getChildrenDashboard(); return <><PageHeader title={mode === "children" ? "Children's Ministry" : mode === "child-check-in" ? "Child Check-In" : "Child Pickup"} description="Guardian-linked child ministry with pickup codes, authorized adults, ratios, attendance and restricted incidents." /><div className="mt-8 grid gap-4 md:grid-cols-4"><StatCard label="Checked in" value={stats.checkedInChildren} /><StatCard label="Pickup issues" value={stats.pickupIssues} /><StatCard label="Classes" value={stats.upcomingClasses} /><StatCard label="Guardian gaps" value={stats.guardianLinksMissing} /></div><div className="mt-8 grid gap-4">{childCheckIns.map((checkIn) => <Card key={checkIn.id}><Shield className="text-accent" /><p className="mt-3 font-semibold">{personName(checkIn.childPersonId)}</p><p className="mt-2 text-sm text-muted">{checkIn.status} · pickup code protected</p></Card>)}</div></>; }
  if (mode === "teens" || mode === "youth") { const stats = getYouthDashboard(); return <><PageHeader title={mode === "teens" ? "Teen Ministry" : "Youth Ministry"} description="Guardian-aware events, camps, mentorship, programmes, service, leadership pathways and campus transition." /><div className="mt-8 grid gap-4 md:grid-cols-4"><StatCard label="Active records" value={stats.activeRecords} /><StatCard label="Programmes" value={stats.programmeInvites} /><StatCard label="Camp events" value={stats.campEvents} /><StatCard label="Transitions" value={stats.campusTransitions} /></div><div className="mt-8 grid gap-4">{youthMinistryRecords.map((record) => <Card key={record.id}><p className="font-semibold">{personName(record.personId)}</p><p className="mt-2 text-sm text-muted">{record.ageBand} · {record.nextStep}</p></Card>)}</div></>; }
  if (mode === "campus") { const stats = getCampusDashboard(); return <><PageHeader title="Campus Ministry" description="Institutions, fellowships, student leaders, outreach, discipleship and transitions without duplicating people." /><div className="mt-8 grid gap-4 md:grid-cols-4"><StatCard label="Fellowships" value={stats.activeFellowships} /><StatCard label="Student leaders" value={stats.studentLeaders} /><StatCard label="Transitions" value={stats.transitions} /><StatCard label="Next steps" value={stats.newConverts} /></div><div className="mt-8 grid gap-4">{campusFellowships.map((fellowship) => <Card key={fellowship.id}><p className="font-semibold">{fellowship.fellowshipName}</p><p className="mt-2 text-sm text-muted">{fellowship.institution} · {fellowship.meetingSchedule}</p></Card>)}</div></>; }
  if (mode === "coordinator") return <><PageHeader title="Event Coordinator Workspace" description="Planning status, registrations, speakers, logistics, safeguarding, incidents and post-event follow-up." /><EventsHome slug="kings-grace" tenantId="tenant-kings-grace" userId="user-admin" /></>;
  const reports = getEventReports({ tenantId: "tenant-kings-grace", userId: "user-admin" });
  return <><PageHeader title="Event Reports" description="Registers, registrations, tickets, check-ins, sessions, volunteers, transport, accommodation, meals, speakers, incidents and follow-up." /><div className="mt-8 grid gap-4 md:grid-cols-4"><StatCard label="Events" value={reports.eventRegister.length} /><StatCard label="Registrations" value={reports.registrations.length} /><StatCard label="Tickets" value={reports.tickets.length} /><StatCard label="Incidents" value={reports.incidents.length} /></div><div className="mt-8 grid gap-4">{eventReports.map((report) => <Card key={report.id}><p className="font-semibold">{report.status}</p><p className="mt-2 text-sm text-muted">{report.safeIncidentSummary}</p></Card>)}</div></>;
}

export function EventSectionPanel({ section, slug, tenantId, userId }: { section: string; slug: string; tenantId: string; userId: string }) {
  if (section === "calendar" || section === "details" || section === "builder" || section === "sessions" || section === "public") return <EventPlanningPanel mode={section} slug={slug} />;
  if (section === "registrations" || section === "waitlist" || section === "tickets" || section === "check-in" || section === "badges" || section === "guardian") return <RegistrationPanel mode={section} />;
  if (section === "speakers" || section === "venues" || section === "meals" || section === "accommodation" || section === "transport" || section === "volunteers" || section === "security" || section === "safeguarding" || section === "incidents" || section === "feedback") return <LogisticsPanel mode={section} />;
  if (section === "outreach" || section === "missions" || section === "children" || section === "child-check-in" || section === "child-pickup" || section === "teens" || section === "youth" || section === "campus" || section === "reports" || section === "coordinator") return <MinistryPanel mode={section} />;
  return <EventsHome slug={slug} tenantId={tenantId} userId={userId} />;
}

export function EventPrivacyNotice() {
  return <div className="rounded-lg border border-border bg-surface p-4 text-sm leading-6 text-muted"><p>Event operations use minimum necessary access. Public pages show approved content only; registrations, child data, pickup codes, medical details, mission documents and safeguarding incidents stay restricted.</p></div>;
}
