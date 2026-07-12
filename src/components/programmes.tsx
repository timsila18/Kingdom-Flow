import Link from "next/link";
import { Award, BookOpenCheck, CalendarDays, CircleDollarSign, GraduationCap, LockKeyhole, ShieldCheck } from "lucide-react";
import { Badge, ButtonLink, Card, PageHeader, StatCard } from "@/components/ui";
import { profiles } from "@/lib/data";
import { people } from "@/lib/people-data";
import { getPersonName } from "@/lib/people-engine";
import {
  assessmentResults,
  certificates,
  classSessions,
  learningMaterials,
  leadershipPathways,
  mentorships,
  programmeApplications,
  programmeCohorts,
  programmeEnrolments,
  programmeLessons,
  programmeModules,
  programmePayments,
  programmes,
  programmeTypes,
  scholarships,
  trainerAssignments,
} from "@/lib/programmes-data";
import {
  attendancePercentage,
  evaluateCompletion,
  getFeeDisclosure,
  getLearnerPortal,
  getProgrammeCatalogue,
  getProgrammeDashboard,
  getProgrammeReports,
  getProgrammeTypeName,
  getTrainerWorkspace,
  verifyCertificate,
} from "@/lib/programmes-engine";

export const programmeLinks = [
  ["Dashboard", ""],
  ["Catalogue", "catalogue"],
  ["Programme Builder", "builder"],
  ["Curriculum", "curriculum"],
  ["Cohorts", "cohorts"],
  ["Applications", "applications"],
  ["Enrolments", "enrolments"],
  ["Waitlist", "waitlist"],
  ["Trainers", "trainers"],
  ["Schedule", "schedule"],
  ["Attendance", "attendance"],
  ["Materials", "materials"],
  ["Assignments", "assignments"],
  ["Assessments", "assessments"],
  ["Grading", "grading"],
  ["Results", "results"],
  ["Scholarships", "scholarships"],
  ["Payments", "payments"],
  ["Certificates", "certificates"],
  ["Graduation", "graduation"],
  ["Leadership Pathways", "pathways"],
  ["Mentorship", "mentorship"],
  ["Reports", "reports"],
  ["Learner Portal", "learner"],
  ["Trainer Workspace", "trainer"],
  ["Settings", "settings"],
] as const;

function ProgrammeCard({ programme, slug }: { programme: typeof programmes[number]; slug: string }) {
  const fee = getFeeDisclosure(programme.id);
  return (
    <Card>
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-muted">{programme.code} · {getProgrammeTypeName(programme.programmeTypeId)}</p>
          <h2 className="mt-1 font-semibold">{programme.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{programme.description}</p>
        </div>
        <Badge tone={programme.status === "enrolment_open" ? "success" : "neutral"}>{programme.status.replaceAll("_", " ")}</Badge>
      </div>
      <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
        <p><strong>Mode:</strong> {programme.deliveryMode.replaceAll("_", " ")}</p>
        <p><strong>Fee:</strong> {programme.currency} {fee.totalPayableByLearner}</p>
        <p><strong>Tech fee:</strong> {programme.currency} {fee.technologyFee} · {fee.technologyFeeTreatment.replaceAll("_", " ")}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <ButtonLink href={`/workspace/${slug}/programmes/enrolments`} variant="secondary">Enrolments</ButtonLink>
        <ButtonLink href={`/workspace/${slug}/programmes/payments`} variant="secondary">Payments</ButtonLink>
      </div>
    </Card>
  );
}

export function ProgrammesHome({ slug, tenantId, userId }: { slug: string; tenantId: string; userId: string }) {
  const stats = getProgrammeDashboard({ tenantId, userId });
  return (
    <>
      <PageHeader title="Discipleship & Classes" description="Church-controlled programmes, cohorts, enrolment, assessments, transparent fees, certificates and leadership development." actions={<ButtonLink href={`/workspace/${slug}/programmes/catalogue`}>Open catalogue</ButtonLink>} />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Active programmes" value={stats.activeProgrammes} />
        <StatCard label="Learners" value={stats.learners} />
        <StatCard label="Cohorts near capacity" value={stats.cohortsNearingCapacity} />
        <StatCard label="Certificate queue" value={stats.certificateQueue} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <StatCard label="New converts invited" value={stats.newConvertsInvited} />
        <StatCard label="Overdue payments" value={stats.overduePayments} />
        <StatCard label="Graduation ready" value={stats.graduationReady} />
        <StatCard label="Pending approvals" value={stats.pendingApprovals} />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">{programmes.map((programme) => <ProgrammeCard key={programme.id} programme={programme} slug={slug} />)}</div>
      <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-4">{programmeLinks.slice(1).map(([label, path]) => <Link key={path} href={`/workspace/${slug}/programmes/${path}`} className="rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-accent"><p className="font-semibold">{label}</p><p className="mt-2 text-sm leading-6 text-muted">Open {label.toLowerCase()}.</p></Link>)}</div>
    </>
  );
}

export function CataloguePanel({ tenantId, userId }: { tenantId: string; userId: string }) {
  const rows = getProgrammeCatalogue({ tenantId, userId });
  return <><PageHeader title="Programme Catalogue" description="Published programmes show target audience, duration, prerequisites, certificate availability and clear fee disclosure." /><div className="mt-8 grid gap-4 md:grid-cols-2">{rows.map((programme) => <Card key={programme.id}><h2 className="font-semibold">{programme.title}</h2><p className="mt-2 text-sm text-muted">{programme.targetAudience} · {programme.durationSummary}</p><p className="mt-3 text-sm">Total payable: {programme.currency} {programme.feeDisclosure.totalPayableByLearner} · Tech fee: {programme.currency} {programme.feeDisclosure.technologyFee}</p><p className="mt-2 text-sm text-muted">Prerequisites: {programme.prerequisiteSummary}</p></Card>)}</div></>;
}

export function BuilderCurriculumPanel({ mode }: { mode: "builder" | "curriculum" | "settings" }) {
  if (mode === "settings") return <><PageHeader title="Programme Settings" description="Configure programme types, fee treatment, progression rules and certificate defaults without erasing history." /><div className="mt-8 grid gap-4">{programmeTypes.map((type) => <Card key={type.id}><BookOpenCheck className="text-accent" /><p className="mt-3 font-semibold">{type.displayName}</p><p className="mt-2 text-sm text-muted">{type.defaultProgressionRule}</p></Card>)}</div></>;
  if (mode === "curriculum") return <><PageHeader title="Curriculum Builder" description="Programmes use versions, modules, lessons and sessions. Existing learners remain attached to the version they enrolled in." /><div className="mt-8 grid gap-4">{programmeModules.map((mod) => <Card key={mod.id}><h2 className="font-semibold">{mod.title}</h2><p className="mt-2 text-sm text-muted">{mod.description}</p><div className="mt-3 grid gap-2">{programmeLessons.filter((lesson) => lesson.moduleId === mod.id).map((lesson) => <p key={lesson.id} className="rounded-md bg-surface-muted p-3 text-sm">{lesson.title} · {lesson.durationMinutes} minutes</p>)}</div></Card>)}</div></>;
  return <><PageHeader title="Programme Builder" description="Create, approve, publish, archive and version programmes with transparent fee and certificate rules." /><div className="mt-8 grid gap-4">{programmes.map((programme) => <ProgrammeCard key={programme.id} programme={programme} slug="kings-grace" />)}</div></>;
}

export function CohortsApplicationsPanel({ mode }: { mode: "cohorts" | "applications" | "enrolments" | "waitlist" }) {
  if (mode === "cohorts") return <><PageHeader title="Cohorts & Intakes" description="One programme can run many intakes without duplicating curriculum." /><div className="mt-8 grid gap-4">{programmeCohorts.map((cohort) => <Card key={cohort.id}><h2 className="font-semibold">{cohort.name}</h2><p className="mt-2 text-sm text-muted">{cohort.schedule} · capacity {cohort.capacity} · {cohort.enrolmentStatus}</p></Card>)}</div></>;
  if (mode === "waitlist") return <><PageHeader title="Waitlist" description="Capacity-aware waitlist with promotion, expiry and branch alternatives." /><div className="mt-8 grid gap-4">{programmeApplications.filter((app) => app.status === "waitlisted").map((app) => <Card key={app.id}><p className="font-semibold">{getPersonName(people.find((person) => person.id === app.personId)!)}</p><p className="mt-2 text-sm text-muted">{programmes.find((programme) => programme.id === app.programmeId)?.title} · promotion notice placeholder</p></Card>)}</div></>;
  const rows = mode === "applications" ? programmeApplications : programmeEnrolments;
  return <><PageHeader title={mode === "applications" ? "Applications" : "Enrolments"} description="Eligibility, approval, payment, scholarship, consent and mentor assignment are tracked per learner and programme version." /><div className="mt-8 grid gap-4">{rows.map((row) => <Card key={row.id}><div className="flex justify-between gap-3"><div><p className="font-semibold">{getPersonName(people.find((person) => person.id === row.personId)!)}</p><p className="mt-1 text-sm text-muted">{programmes.find((programme) => programme.id === row.programmeId)?.title} · {row.source.replaceAll("_", " ")}</p></div><Badge tone={row.status === "approved" || row.status === "completed" ? "success" : "warning"}>{row.status.replaceAll("_", " ")}</Badge></div></Card>)}</div></>;
}

export function TrainerSchedulePanel({ mode, tenantId }: { mode: "trainers" | "schedule" | "attendance" | "materials" | "trainer"; tenantId: string }) {
  if (mode === "trainer") {
    const workspace = getTrainerWorkspace({ tenantId, userId: "user-branch" });
    return <><PageHeader title="Trainer Workspace" description="Assigned cohorts only: classes, roster, grading queue and learners at risk." /><div className="mt-8 grid gap-4 md:grid-cols-4"><StatCard label="Assignments" value={workspace.assignments.length} /><StatCard label="Classes" value={workspace.upcomingClasses.length} /><StatCard label="Learners" value={workspace.learnerRoster.length} /><StatCard label="At risk" value={workspace.learnersAtRisk.length} /></div></>;
  }
  if (mode === "trainers") return <><PageHeader title="Trainers & Facilitators" description="Programme-scoped teaching, attendance, grading, certificate and communication rights." /><div className="mt-8 grid gap-4">{trainerAssignments.map((assignment) => <Card key={assignment.id}><p className="font-semibold">{profiles.find((profile) => profile.id === assignment.userId)?.fullName}</p><p className="mt-2 text-sm text-muted">{assignment.role.replaceAll("_", " ")} · {assignment.permissions.join(", ")}</p></Card>)}</div></>;
  if (mode === "materials") return <><PageHeader title="Learning Materials" description="Tenant-safe material placeholders with release rules, download permissions and copyright ownership." /><div className="mt-8 grid gap-4">{learningMaterials.map((mat) => <Card key={mat.id}><LockKeyhole className="text-accent" /><p className="mt-3 font-semibold">{mat.title}</p><p className="mt-2 text-sm text-muted">{mat.type.replaceAll("_", " ")} · {mat.storageStatus}</p></Card>)}</div></>;
  if (mode === "attendance") return <><PageHeader title="Class Attendance" description="Manual, QR, learner self-check-in, trainer check-in, online, late, excused and make-up attendance feed completion rules." /><div className="mt-8 grid gap-4">{programmeEnrolments.map((enrolment) => <Card key={enrolment.id}><p className="font-semibold">{getPersonName(people.find((person) => person.id === enrolment.personId)!)}</p><p className="mt-2 text-sm text-muted">Attendance: {attendancePercentage(enrolment.id)}% · completion {evaluateCompletion(enrolment.id).percent}%</p></Card>)}</div></>;
  return <><PageHeader title="Class Schedule" description="Recurring, intensive, evening, online, hybrid, self-paced, rescheduled and make-up sessions." /><div className="mt-8 grid gap-4">{classSessions.map((session) => <Card key={session.id}><CalendarDays className="text-accent" /><p className="mt-3 font-semibold">{programmeLessons.find((lesson) => lesson.id === session.lessonId)?.title}</p><p className="mt-2 text-sm text-muted">{session.date} · {session.startTime} · {session.venueOrLink}</p></Card>)}</div></>;
}

export function AssessmentPanel({ mode }: { mode: "assignments" | "assessments" | "grading" | "results" }) {
  return <><PageHeader title={mode === "assignments" ? "Assignments" : mode === "assessments" ? "Assessments" : mode === "grading" ? "Grading" : "Results"} description="Assignments, quizzes, moderation, result release and grade changes preserve review history." /><div className="mt-8 grid gap-4">{assessmentResults.map((result) => <Card key={result.id}><h2 className="font-semibold">{result.grade} · {result.score}%</h2><p className="mt-2 text-sm text-muted">{result.feedback} · moderation {result.moderationStatus}</p></Card>)}</div></>;
}

export function FinanceCertificatePanel({ mode }: { mode: "scholarships" | "payments" | "certificates" | "graduation" }) {
  if (mode === "payments") return <><PageHeader title="Programme Payments" description="Transparent church fee, technology fee, provider fee, manual verification and duplicate-reference review. No fake online success." /><div className="mt-8 grid gap-4">{programmePayments.map((payment) => <Card key={payment.id}><CircleDollarSign className="text-accent" /><p className="mt-3 font-semibold">KES {payment.totalPaid} paid</p><p className="mt-2 text-sm text-muted">Church amount KES {payment.churchAmount} · tech fee KES {payment.technologyFee} · {payment.status.replaceAll("_", " ")}</p></Card>)}</div></>;
  if (mode === "scholarships") return <><PageHeader title="Scholarships" description="Restricted hardship details require explicit permissions; ordinary reports show safe summaries only." /><div className="mt-8 grid gap-4">{scholarships.map((scholarship) => <Card key={scholarship.id}><ShieldCheck className="text-accent" /><p className="mt-3 font-semibold">{scholarship.type.replaceAll("_", " ")} · KES {scholarship.amount}</p><p className="mt-2 text-sm text-muted">Reason restricted · status {scholarship.status}</p></Card>)}</div></>;
  if (mode === "graduation") return <><PageHeader title="Graduation" description="Graduation requires eligible learner review, fee clearance, approval, certificate issue and consent-aware communication." /><div className="mt-8 grid gap-4">{programmeEnrolments.map((enrolment) => <Card key={enrolment.id}><GraduationCap className="text-accent" /><p className="mt-3 font-semibold">{getPersonName(people.find((person) => person.id === enrolment.personId)!)}</p><p className="mt-2 text-sm text-muted">Eligible: {evaluateCompletion(enrolment.id).eligible ? "yes" : "not yet"}</p></Card>)}</div></>;
  return <><PageHeader title="Certificates" description="Certificates are issued only after completion and approval rules, with QR verification and no private learner data." /><div className="mt-8 grid gap-4">{certificates.map((cert) => <Card key={cert.id}><Award className="text-accent" /><p className="mt-3 font-semibold">{cert.certificateNumber}</p><p className="mt-2 text-sm text-muted">{verifyCertificate(cert.verificationCode).programme} · {cert.status}</p><Link className="mt-3 inline-block text-accent" href={`/verify/certificates/${cert.verificationCode}`}>Verify certificate</Link></Card>)}</div></>;
}

export function PathwayMentorshipReportsPanel({ mode, tenantId, userId }: { mode: "pathways" | "mentorship" | "reports" | "learner"; tenantId: string; userId: string }) {
  if (mode === "learner") {
    const portal = getLearnerPortal("person-newconvert-john");
    return <><PageHeader title="Learner Portal" description="Mobile-friendly enrolments, progress, sessions, payments, scholarship status, certificates and next recommended step." /><div className="mt-8 grid gap-4 md:grid-cols-4"><StatCard label="Enrolments" value={portal.enrolments.length} /><StatCard label="Sessions" value={portal.upcomingSessions.length} /><StatCard label="Certificates" value={portal.certificates.length} /><StatCard label="Payments" value={portal.payments.length} /></div><Card className="mt-8"><p className="font-semibold">Next step</p><p className="mt-2 text-sm text-muted">{portal.nextRecommendedStep}</p></Card></>;
  }
  if (mode === "reports") {
    const reports = getProgrammeReports({ tenantId, userId });
    return <><PageHeader title="Programme Reports" description="Permission-scoped reports for registers, cohorts, enrolments, payments, scholarships, attendance, results, certificates and leadership pathways." /><div className="mt-8 grid gap-4 md:grid-cols-4"><StatCard label="Programmes" value={reports.programmeRegister.length} /><StatCard label="Applications" value={reports.applications.length} /><StatCard label="Payments" value={reports.payments.length} /><StatCard label="Certificates" value={reports.certificates.length} /></div></>;
  }
  if (mode === "mentorship") return <><PageHeader title="Mentorship" description="Programme-linked mentoring with controlled visibility notes and progress review." /><div className="mt-8 grid gap-4">{mentorships.map((item) => <Card key={item.id}><p className="font-semibold">{profiles.find((profile) => profile.id === item.mentorUserId)?.fullName}</p><p className="mt-2 text-sm text-muted">{item.goals.join(", ")} · {item.status.replaceAll("_", " ")}</p></Card>)}</div></>;
  return <><PageHeader title="Leadership Pathways" description="Pathways recommend eligibility for review only. Governance appointments remain in Prompt 2 authority workflows." /><div className="mt-8 grid gap-4">{leadershipPathways.map((path) => <Card key={path.id}><h2 className="font-semibold">{path.name}</h2><div className="mt-3 grid gap-2">{path.stages.map((stage) => <p key={stage.name} className="rounded-md bg-surface-muted p-3 text-sm">{stage.name} · {stage.approvalRequired ? "approval" : "tracked"}</p>)}</div></Card>)}</div></>;
}

export function ProgrammeSectionPanel({ section, slug, tenantId, userId }: { section: string; slug: string; tenantId: string; userId: string }) {
  if (section === "catalogue") return <CataloguePanel tenantId={tenantId} userId={userId} />;
  if (section === "builder" || section === "curriculum" || section === "settings") return <BuilderCurriculumPanel mode={section} />;
  if (section === "cohorts" || section === "applications" || section === "enrolments" || section === "waitlist") return <CohortsApplicationsPanel mode={section} />;
  if (section === "trainers" || section === "schedule" || section === "attendance" || section === "materials" || section === "trainer") return <TrainerSchedulePanel mode={section} tenantId={tenantId} />;
  if (section === "assignments" || section === "assessments" || section === "grading" || section === "results") return <AssessmentPanel mode={section} />;
  if (section === "scholarships" || section === "payments" || section === "certificates" || section === "graduation") return <FinanceCertificatePanel mode={section} />;
  if (section === "pathways" || section === "mentorship" || section === "reports" || section === "learner") return <PathwayMentorshipReportsPanel mode={section} tenantId={tenantId} userId={userId} />;
  return <ProgrammesHome slug={slug} tenantId={tenantId} userId={userId} />;
}

export function ProgrammePrinciplesNotice() {
  return <div className="rounded-lg border border-border bg-surface p-4 text-sm leading-6 text-muted"><p>Churches control curriculum, fees, teachers, certificates and progression. KingdomFlow does not enforce doctrine, sell spiritual outcomes, rank faith, fake payments or automatically appoint leaders.</p></div>;
}
