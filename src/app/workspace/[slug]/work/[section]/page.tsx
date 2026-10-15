import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, ArrowLeft, ArrowRight, LockKeyhole, Check } from "lucide-react";
import { WorkspaceShell } from "@/components/shells";
import { PageHeader, ButtonLink, Badge } from "@/components/ui";
import {
  Journey,
  MinistryLinks,
  RecordFields,
} from "@/components/workspace-ui";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";
import {
  getWorkspaceAccess,
  canOpenSection,
  visibleRecords,
  type TeamMember,
  type WorkspaceData,
} from "@/lib/workspace-store";
import { sections } from "@/lib/workspace-config";
import { userTypes } from "@/lib/user-types";
import { teamMemberName } from "@/lib/team-label";
import { personJourney, trainingReadiness } from "@/lib/journey";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { upcomingDutyDates } from "@/lib/serving";

const submitClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-accent";
function FormMeta({
  section,
  action = "save",
  id,
}: {
  section: string;
  action?: string;
  id?: string;
}) {
  return (
    <>
      <input type="hidden" name="section" value={section} />
      <input type="hidden" name="action" value={action} />
      {id ? <input type="hidden" name="id" value={id} /> : null}
    </>
  );
}

function TeamForm({
  endpoint,
  workspace,
  edit,
}: {
  endpoint: string;
  workspace: WorkspaceData;
  edit?: TeamMember;
}) {
  return (
    <form action={endpoint} method="post" className="mt-6 grid max-w-xl gap-4">
      <FormMeta section="team" action="save-team" id={edit?.id} />
      <label className="grid gap-2 text-sm font-medium">
        Full name
        <input name="name" required defaultValue={edit?.name} />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Email
        <input
          name="email"
          type="email"
          required
          defaultValue={edit?.email}
          readOnly={Boolean(edit)}
        />
      </label>
      {!edit ? (
        <label className="grid gap-2 text-sm font-medium">
          Initial password
          <input
            name="password"
            type="password"
            minLength={12}
            autoComplete="new-password"
            placeholder="Required for a new account"
          />
        </label>
      ) : null}
      <label className="grid gap-2 text-sm font-medium">
        User type
        <select name="type" defaultValue={edit?.type ?? "member"}>
          {Object.entries(userTypes)
            .filter(([key]) => key !== "platform_admin")
            .map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Church title (optional)
        <input
          name="title"
          defaultValue={edit?.title}
          placeholder="Your church's preferred title"
        />
      </label>
      <details className="rounded-md border border-border p-3">
        <summary className="cursor-pointer text-sm font-medium">
          Additional responsibilities
        </summary>
        <div className="mt-3 grid gap-3">
          {Object.entries(userTypes)
            .filter(([key]) => key !== "platform_admin")
            .map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  name="types"
                  value={key}
                  defaultChecked={edit?.types?.some((type) => type === key)}
                  className="h-4 w-4"
                />
                {label}
              </label>
            ))}
        </div>
      </details>
      <label className="grid gap-2 text-sm font-medium">
        Person profile
        <select name="personId" defaultValue={edit?.personId ?? ""}>
          <option value="">Not linked yet</option>
          {workspace.records
            .filter(
              (record) =>
                record.kind === "people" && record.fields.archived !== "yes",
            )
            .map((record) => (
              <option key={record.id} value={record.id}>
                {record.fields.name}
              </option>
            ))}
        </select>
      </label>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">
          Assigned people and ministries
        </legend>
        <div className="kf-scrollbar grid max-h-48 gap-2 overflow-y-auto rounded-md border border-border p-3">
          {workspace.records
            .filter(
              (record) =>
                ["people", "departments", "classes", "groups"].includes(
                  record.kind,
                ) && record.fields.archived !== "yes",
            )
            .map((record) => (
              <label
                key={record.id}
                className="flex items-center gap-3 text-sm"
              >
                <input
                  type="checkbox"
                  name="assignedIds"
                  value={record.id}
                  defaultChecked={edit?.assignedIds.includes(record.id)}
                />
                {record.fields.name}
              </label>
            ))}
          {!workspace.records.length ? (
            <p className="text-sm text-muted">
              Add people or ministries first.
            </p>
          ) : null}
        </div>
      </fieldset>
      <div className="flex gap-3">
        <button className={submitClass}>
          {edit ? "Save changes" : "Add team account"}
        </button>
        <ButtonLink href="?" variant="secondary">
          Cancel
        </ButtonLink>
      </div>
    </form>
  );
}

export default async function WorkPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; section: string }>;
  searchParams: Promise<{
    new?: string;
    edit?: string;
    id?: string;
    saved?: string;
    error?: string;
    personId?: string;
    ministryId?: string;
  }>;
}) {
  const { slug, section } = await params;
  const query = await searchParams;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  const access = await getWorkspaceAccess(tenant.id);
  if (!access) notFound();
  const { member, workspace } = access;
  const specialAllowed =
    (section === "ministry" &&
      ["church_admin", "church_leader", "ministry_coordinator"].includes(
        member.type,
      )) ||
    (section === "receipts" && member.type === "finance_officer");
  if (!specialAllowed && !canOpenSection(member.type, section))
    return (
      <WorkspaceShell tenantName={tenant.publicName} tenantSlug={slug}>
        <PageHeader title="Access restricted" />
        <p className="mt-6 text-muted">
          This area is not assigned to your account.
        </p>
        <div className="mt-4">
          <ButtonLink href={`/workspace/${slug}`}>Back home</ButtonLink>
        </div>
      </WorkspaceShell>
    );
  const base = `/workspace/${slug}/work`;
  const endpoint = `${base}/actions`;
  const config = sections[section];
  const writable = member.type !== "church_leader" || section === "decisions";
  const canCreate =
    Boolean(config) &&
    writable &&
    !(member.type === "member" && section !== "prayer") &&
    !(member.type === "ministry_coordinator" && section === "people");
  const title =
    config?.title ??
    (
      {
        ministry: "My ministry",
        team: "Church team",
        settings: "Church setup",
        reports: "Reports",
        receipts: "Giving receipts",
        "my-classes": "My classes",
        "my-duties": "My serving duties",
        "my-service": "Serve in a department",
        profile: "My profile",
      } as Record<string, string>
    )[section];
  if (!title) notFound();
  const records = visibleRecords(workspace, member, section);
  const edit = query.edit
    ? records.find((record) => record.id === query.edit)
    : undefined;
  const showForm = canCreate && (query.new === "1" || Boolean(edit));
  const person =
    section === "people" && query.id
      ? records.find((record) => record.id === query.id)
      : undefined;
  const journey = person ? personJourney(workspace.records, person.id) : [];
  const nextJourneyStep = journey.find((step) => step.state !== "done");
  const appointment = person
    ? workspace.records.find(
        (record) =>
          record.kind === "leadership-nominations" &&
          record.fields.personId === person.id &&
          record.fields.archived !== "yes" &&
          ["Pending", "Approved"].includes(record.fields.status),
      )
    : undefined;
  const linkedLeader = person
    ? workspace.team.find(
        (item) =>
          item.personId === person.id &&
          [item.type, ...(item.types ?? [])].includes("church_leader"),
      )
    : undefined;
  const staff =
    person && member.type === "church_admin"
      ? (
          await getSupabaseAdmin()
            .from("kf_hr_staff")
            .select("job_title,employment_type,status")
            .eq("tenant_id", tenant.id)
            .eq("member_id", person.id)
            .limit(1)
        ).data?.[0]
      : undefined;
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={slug}>
      <Link
        href={`/workspace/${slug}`}
        className="mb-4 inline-flex min-h-10 items-center gap-2 text-sm text-primary"
      >
        <ArrowLeft size={16} />
        Home
      </Link>
      <PageHeader
        title={person?.fields.name ?? title}
        actions={
          !person && !showForm && canCreate ? (
            <ButtonLink href={`${base}/${section}?new=1`}>
              <Plus size={18} />
              {config.action}
            </ButtonLink>
          ) : undefined
        }
      />
      {query.saved ? (
        <p
          role="status"
          className="mt-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-success"
        >
          <Check size={18} />
          Saved successfully.
        </p>
      ) : null}
      {query.error ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-danger"
        >
          {query.error}
        </p>
      ) : null}
      {showForm ? (
        <form
          method="post"
          action={endpoint}
          className="mt-6 grid max-w-xl gap-4"
        >
          <FormMeta section={section} id={edit?.id} />
          <RecordFields
            fields={config.fields}
            workspace={workspace}
            member={member}
            values={edit?.fields ?? { personId: query.personId ?? "", ministryId: query.ministryId ?? "" }}
          />
          <div className="flex gap-3">
            <button className={submitClass}>Save</button>
            <ButtonLink href={`${base}/${section}`} variant="secondary">
              Cancel
            </ButtonLink>
          </div>
        </form>
      ) : person ? (
        <>
          <dl className="mt-6 grid gap-3 text-sm">
            <div>
              <dt className="text-muted">Phone</dt>
              <dd>{person.fields.phone || "Not provided"}</dd>
            </div>
            <div>
              <dt className="text-muted">Email</dt>
              <dd>{person.fields.email || "Not provided"}</dd>
            </div>
            <div>
              <dt className="text-muted">Church journey</dt>
              <dd>{person.fields.stage}</dd>
            </div>
            <div>
              <dt className="text-muted">Follow-up worker</dt>
              <dd>
                {teamMemberName(
                  workspace.team.find(
                    (item) => item.id === person.fields.assignedTo,
                  ),
                )}
              </dd>
            </div>
          </dl>
          <section className="mt-6 border-t border-border pt-5">
            <h2 className="text-lg font-semibold">Church journey</h2>
            <Journey workspace={workspace} personId={person.id} />
            <p className="mt-5 text-sm text-muted">
              Next:{" "}
              {nextJourneyStep
                ? nextJourneyStep.state === "in_progress"
                  ? `Continue ${nextJourneyStep.label.toLowerCase()}`
                  : nextJourneyStep.detail
                : "Keep walking with this person."}
            </p>
          </section>
          {canCreate ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink
                href={`${base}/people?edit=${person.id}`}
                variant="secondary"
              >
                Edit person
              </ButtonLink>
              <ButtonLink
                href={`${base}/follow-up?new=1&personId=${person.id}`}
              >
                Record contact
              </ButtonLink>
            </div>
          ) : null}
          {["church_admin", "ministry_coordinator"].includes(member.type) ? (
            <section className="mt-8 border-t border-border pt-5">
              <h2 className="text-lg font-semibold">Choose the next step</h2>
              <div className="mt-5 grid gap-6 md:grid-cols-3">
                {[
                  ["enrol", "classId", "classes", "Enrol in a class"],
                  ["connect", "groupId", "groups", "Connect to fellowship"],
                  [
                    "assign-department",
                    "departmentId",
                    "departments",
                    "Join a department",
                  ],
                ].map(([action, key, kind, label]) => (
                  <form
                    key={action}
                    action={endpoint}
                    method="post"
                    className="grid content-start gap-3"
                  >
                    <h2 className="font-semibold">{label}</h2>
                    <FormMeta section="people" action={action} />
                    <input type="hidden" name="personId" value={person.id} />
                    <label className="grid gap-2 text-sm">
                      {kind === "classes"
                        ? "Class"
                        : kind === "groups"
                          ? "Fellowship"
                          : "Department"}
                      <select name={key} required>
                        <option value="">Choose</option>
                        {visibleRecords(workspace, member, kind).map(
                          (record) => (
                            <option key={record.id} value={record.id}>
                              {record.fields.name}
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                    <button
                      className={submitClass}
                      disabled={!visibleRecords(workspace, member, kind).length}
                    >
                      {label}
                    </button>
                  </form>
                ))}
              </div>
              <div className="mt-7">
                <h3 className="font-semibold">Training in progress</h3>
                {workspace.records
                  .filter(
                    (record) =>
                      record.kind === "enrolments" &&
                      record.fields.personId === person.id &&
                      record.fields.status === "Enrolled" &&
                      record.fields.archived !== "yes",
                  )
                  .map((enrolment) => {
                    const classId = enrolment.fields.classId;
                    const readiness = trainingReadiness(workspace.records, person.id, classId);
                    return (
                      <div key={enrolment.id} className="mt-4 border-b border-border pb-4">
                        <h4 className="font-medium">{workspace.records.find((record) => record.id === classId)?.fields.name ?? "Class"}</h4>
                        <p className="mt-1 text-sm text-muted">Attendance: {readiness.attended} of {readiness.required} sessions. Assessment: {enrolment.fields.assessment || "Not assessed"}.</p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          <ButtonLink href={`${base}/attendance?new=1&personId=${person.id}&ministryId=${classId}`} variant="secondary">Record attendance</ButtonLink>
                        </div>
                        <form action={endpoint} method="post" className="mt-3 grid max-w-lg gap-3">
                          <FormMeta section="people" action="assess-class" />
                          <input type="hidden" name="personId" value={person.id} />
                          <input type="hidden" name="classId" value={classId} />
                          <label className="grid gap-2 text-sm">Assessment
                            <select name="assessment" defaultValue={enrolment.fields.assessment || ""} required>
                              <option value="">Choose result</option>
                              <option value="Passed">Passed</option>
                              <option value="Needs more work">Needs more work</option>
                            </select>
                          </label>
                          <label className="grid gap-2 text-sm">Trainer note
                            <textarea name="note" rows={2} maxLength={1000} defaultValue={enrolment.fields.assessmentNote || ""} />
                          </label>
                          <button className={submitClass}>Save assessment</button>
                        </form>
                        <form action={endpoint} method="post" className="mt-3">
                          <FormMeta section="people" action="complete-class" />
                          <input type="hidden" name="personId" value={person.id} />
                          <input type="hidden" name="classId" value={classId} />
                          <button className={submitClass} disabled={!readiness.ready}>Complete training</button>
                        </form>
                      </div>
                    );
                  })}
              </div>
              <div className="mt-7">
                <h3 className="font-semibold">Department service</h3>
                {workspace.records.filter((record) => record.kind === "department-memberships" && record.fields.personId === person.id && record.fields.archived !== "yes").map((record) => (
                  <div key={record.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3 text-sm">
                    <span>{workspace.records.find((item) => item.id === record.fields.departmentId)?.fields.name ?? "Department"} · {record.fields.status}</span>
                    {record.fields.status === "Requested" ? (
                      <form action={endpoint} method="post" className="flex gap-2">
                        <FormMeta section="people" action="review-department" id={record.id} />
                        <button className={submitClass} name="status" value="Active">Approve</button>
                        <button className="min-h-11 rounded-md border border-border px-3 text-sm" name="status" value="Declined">Decline</button>
                      </form>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink
                  href={`${base}/duties?new=1&personId=${person.id}`}
                  variant="secondary"
                >
                  Assign a serving duty
                </ButtonLink>
                {member.type === "church_admin" ? (
                  <ButtonLink
                    href={`/workspace/${slug}/hr?tab=staff`}
                    variant="secondary"
                  >
                    Review membership and staff
                  </ButtonLink>
                ) : null}
              </div>
            </section>
          ) : null}
          {member.type === "church_admin" ? (
            <section className="mt-8 border-t border-border pt-5">
              <h2 className="text-lg font-semibold">
                Membership and responsibility
              </h2>
              <p className="mt-3 text-sm text-muted">
                Membership, employment and pastoral leadership are approved by
                the church. Completing training does not grant them
                automatically.
              </p>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <p>
                  Membership:{" "}
                  <strong>
                    {person.fields.membershipConfirmedBy
                      ? "Confirmed"
                      : "Not confirmed"}
                  </strong>
                </p>
                <p>
                  Staff:{" "}
                  <strong>
                    {staff
                      ? `${staff.job_title} (${staff.status})`
                      : "Not on staff"}
                  </strong>
                </p>
                <p>
                  Leadership:{" "}
                  <strong>
                    {appointment?.fields.status === "Approved"
                      ? appointment.fields.title
                      : linkedLeader
                        ? linkedLeader.title || "Church Leader"
                        : appointment?.fields.status === "Pending" ? "Awaiting review" : "Not appointed"}
                  </strong>
                </p>
              </div>
              {person.fields.membershipConfirmedBy && !appointment ? (
                <form action={endpoint} method="post" className="mt-5 grid max-w-lg gap-3">
                  <FormMeta section="people" action="nominate-leader" />
                  <input type="hidden" name="personId" value={person.id} />
                  <h3 className="font-semibold">Nominate for pastoral leadership</h3>
                  <label className="grid gap-2 text-sm">Church title <input name="title" required maxLength={100} placeholder="Pastor, Elder, Bishop..." /></label>
                  <label className="grid gap-2 text-sm">Reason and review notes <textarea name="note" required rows={3} maxLength={1000} /></label>
                  <button className={submitClass}>Submit nomination</button>
                </form>
              ) : null}
              {appointment?.fields.status === "Approved" && !linkedLeader ? (
                <div className="mt-5">
                  <ButtonLink href={`${base}/team?${workspace.team.some((item) => item.personId === person.id) ? `edit=${workspace.team.find((item) => item.personId === person.id)?.id}` : "new=1"}`} variant="secondary">Grant church leader access</ButtonLink>
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-3">
                {!person.fields.membershipConfirmedBy ? (
                  <form action={`/workspace/${slug}/hr/actions`} method="post">
                    <input type="hidden" name="action" value="confirm-member" />
                    <input type="hidden" name="section" value="staff" />
                    <input type="hidden" name="memberId" value={person.id} />
                    <button className={submitClass}>Confirm church membership</button>
                  </form>
                ) : (
                  <ButtonLink href={`/workspace/${slug}/hr?tab=staff&new=yes&memberId=${person.id}`} variant="secondary">Add to staff</ButtonLink>
                )}
                <ButtonLink href={`${base}/team`} variant="secondary">
                  Church team access
                </ButtonLink>
              </div>
            </section>
          ) : null}
          {["church_admin", "church_leader"].includes(member.type) && appointment?.fields.status === "Pending" ? (
            <section className="mt-8 border-t border-border pt-5">
              <h2 className="text-lg font-semibold">Leadership nomination awaiting review</h2>
              <p className="mt-2 text-sm">{appointment.fields.title}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{appointment.fields.note}</p>
              {appointment.createdBy !== access.user.id && member.personId !== person.id ? (
                <form action={endpoint} method="post" className="mt-4 flex gap-3">
                  <FormMeta section="people" action="review-leader" id={appointment.id} />
                  <button className={submitClass} name="status" value="Approved">Approve appointment</button>
                  <button className="min-h-11 rounded-md border border-border px-3 text-sm" name="status" value="Rejected">Reject</button>
                </form>
              ) : <p className="mt-3 text-sm text-muted">A different church leader or administrator must review this nomination.</p>}
            </section>
          ) : null}
        </>
      ) : section === "ministry" ? (
        <MinistryLinks base={base} member={member} />
      ) : section === "team" ? (
        <>
          {query.new || query.edit ? (
            <TeamForm
              endpoint={endpoint}
              workspace={workspace}
              edit={workspace.team.find((item) => item.id === query.edit)}
            />
          ) : (
            <>
              <div className="mt-5">
                <ButtonLink href={`${base}/team?new=1`}>
                  <Plus size={18} />
                  Add team account
                </ButtonLink>
              </div>
              <ul className="mt-6 divide-y divide-border">
                {workspace.team.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-4"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted">{item.email}</p>
                      <p className="text-sm text-muted">
                        {userTypes[item.type]}
                        {item.title ? ` · ${item.title}` : ""}
                      </p>
                    </div>
                    <ButtonLink
                      href={`${base}/team?edit=${item.id}`}
                      variant="secondary"
                    >
                      Edit access
                    </ButtonLink>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : section === "settings" ? (
        <>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href={`${base}/departments`} variant="secondary">
              Departments
            </ButtonLink>
            <ButtonLink href={`${base}/team`} variant="secondary">
              Church team
            </ButtonLink>
            <ButtonLink href={`${base}/classes`} variant="secondary">
              Classes
            </ButtonLink>
            <ButtonLink href={`${base}/branches`} variant="secondary">
              Branches
            </ButtonLink>
          </div>
          <form
            method="post"
            action={endpoint}
            className="mt-6 grid max-w-xl gap-4"
          >
            <FormMeta section="settings" action="save-settings" />
            <label className="grid gap-2 text-sm font-medium">
              Church name
              <input
                name="publicName"
                required
                defaultValue={tenant.publicName}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Region
              <input name="region" defaultValue={tenant.region} />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Address
              <input
                name="physicalAddress"
                defaultValue={tenant.physicalAddress}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Church leader title
              <input
                name="ministryHeadTitle"
                defaultValue={tenant.ministryHeadTitle}
              />
            </label>
            <button className={submitClass}>Save church details</button>
          </form>
        </>
      ) : section === "profile" ? (
        <form
          method="post"
          action={endpoint}
          className="mt-6 grid max-w-xl gap-4"
        >
          <FormMeta section="profile" action="save-profile" />
          <label className="grid gap-2 text-sm font-medium">
            Name
            <input name="name" required defaultValue={member.name} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Email
            <input value={member.email} readOnly />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            New password (optional)
            <input
              type="password"
              name="password"
              minLength={12}
              autoComplete="new-password"
            />
          </label>
          <button className={submitClass}>Save profile</button>
        </form>
      ) : section === "reports" ? (
        <>
          <div className="mt-6 divide-y divide-border">
            {(member.type === "finance_officer"
              ? ["giving", "expenses"]
              : [
                  "people",
                  "departments",
                  "groups",
                  "classes",
                  "events",
                  "attendance",
                ]
            ).map((kind) => (
              <div
                key={kind}
                className="flex items-center justify-between py-4"
              >
                <span>{sections[kind].title}</span>
                <span className="font-semibold tabular-nums">
                  {visibleRecords(workspace, member, kind).length}
                </span>
              </div>
            ))}
          </div>
          {member.type === "finance_officer" ? (
            <section className="mt-6">
              <h2 className="font-semibold">Giving totals by currency</h2>
              {Array.from(
                new Set(
                  visibleRecords(workspace, member, "giving").map((record) =>
                    record.fields.currency.toUpperCase(),
                  ),
                ),
              ).map((currency) => (
                <p key={currency} className="mt-3 text-sm">
                  {currency}{" "}
                  {visibleRecords(workspace, member, "giving")
                    .filter(
                      (record) =>
                        record.fields.currency.toUpperCase() === currency,
                    )
                    .reduce(
                      (sum, record) => sum + Number(record.fields.amount),
                      0,
                    )
                    .toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </p>
              ))}
            </section>
          ) : null}
        </>
      ) : section === "receipts" ? (
        <ul className="mt-6 divide-y divide-border">
          {visibleRecords(workspace, member, "giving").map((record) => (
            <li key={record.id} className="py-4">
              <h2 className="font-medium">{record.fields.name}</h2>
              <p className="text-sm">
                {record.fields.currency} {record.fields.amount} ·{" "}
                {record.fields.date}
              </p>
              <p className="text-sm text-muted">
                Reference: {record.fields.reference || record.id}
              </p>
            </li>
          ))}
          {!visibleRecords(workspace, member, "giving").length ? (
            <li className="py-6 text-muted">No giving receipts yet.</li>
          ) : null}
        </ul>
      ) : section === "my-duties" ? (
        <ul className="mt-6 divide-y divide-border">
          {visibleRecords(workspace, member, "duties").map((record) => (
            <li key={record.id} className="py-4">
              <p className="font-medium">{record.fields.name}</p>
              <p className="text-sm text-muted">{workspace.records.find((department) => department.id === record.fields.ministryId)?.fields.name ?? "Department"} · {record.fields.recurrence || "Once"}</p>
              <p className="text-sm text-muted">Next: {upcomingDutyDates(record.fields.date, record.fields.recurrence || "Once").join(", ") || "No upcoming dates"}</p>
            </li>
          ))}
          {!visibleRecords(workspace, member, "duties").length ? (
            <li className="py-6 text-muted">No duties assigned yet.</li>
          ) : null}
        </ul>
      ) : section === "my-service" ? (
        <>
          <p className="mt-5 text-sm text-muted">Choose a ministry team. A coordinator will review your request before any duties are assigned.</p>
          <ul className="mt-5 divide-y divide-border">
            {visibleRecords(workspace, member, "departments").map((department) => {
              const membership = workspace.records.find((record) => record.kind === "department-memberships" && record.fields.personId === member.personId && record.fields.departmentId === department.id && record.fields.archived !== "yes" && record.fields.status !== "Declined");
              return <li key={department.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <span className="font-medium">{department.fields.name}</span>
                {membership ? <Badge>{membership.fields.status}</Badge> : (
                  <form action={endpoint} method="post">
                    <FormMeta section="my-service" action="request-department" />
                    <input type="hidden" name="departmentId" value={department.id} />
                    <button className={submitClass}>Ask to serve</button>
                  </form>
                )}
              </li>;
            })}
          </ul>
          {!visibleRecords(workspace, member, "departments").length ? <p className="mt-6 text-muted">Your church has not opened any departments for requests yet.</p> : null}
        </>
      ) : section === "my-classes" ? (
        <>
          <ul className="mt-6 divide-y divide-border">
            {visibleRecords(workspace, member, "classes").map((record) => {
              const enrolment = workspace.records.find(
                (item) =>
                  item.kind === "enrolments" &&
                  item.fields.classId === record.id &&
                  item.fields.personId === member.personId &&
                  Boolean(member.personId),
              );
              return (
                <li
                  key={record.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4"
                >
                  <div>
                    <h2 className="font-medium">{record.fields.name}</h2>
                    <p className="text-sm text-muted">{record.fields.date}</p>
                  </div>
                  {enrolment ? (
                    <Badge>{enrolment.fields.status}</Badge>
                  ) : (
                    <form action={endpoint} method="post">
                      <FormMeta section="my-classes" action="request-class" />
                      <input type="hidden" name="targetId" value={record.id} />
                      <button className={submitClass}>Ask to join</button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
          {!visibleRecords(workspace, member, "classes").length ? (
            <p className="mt-6 text-muted">No classes available yet.</p>
          ) : null}
        </>
      ) : (
        <>
          {["care", "prayer"].includes(section) ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-muted">
              <LockKeyhole size={16} />
              Only your assigned records are shown.
            </p>
          ) : null}
          {section === "follow-up" && member.type === "care_worker" ? (
            <div className="mt-5 flex gap-3">
              <ButtonLink href={`${base}/care`} variant="secondary">
                My care cases
              </ButtonLink>
              <ButtonLink href={`${base}/prayer`} variant="secondary">
                Prayer requests
              </ButtonLink>
            </div>
          ) : null}
          <ul className="mt-5 divide-y divide-border">
            {records.map((record) => (
              <li
                key={record.id}
                className="flex flex-wrap items-start justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <h2 className="font-medium">
                    {record.fields.name ||
                      workspace.records.find(
                        (item) => item.id === record.fields.personId,
                      )?.fields.name ||
                      config?.title}
                  </h2>
                  <div className="mt-2 grid gap-1 text-sm text-muted">
                    {config?.fields
                      .filter(
                        (field) =>
                          !["name", "note", "personId"].includes(field.key),
                      )
                      .map((field) => {
                        const raw = record.fields[field.key];
                        if (!raw) return null;
                        const label =
                          field.source === "team"
                            ? workspace.team.find((item) => item.id === raw)
                                ?.name
                            : field.source
                              ? workspace.records.find(
                                  (item) => item.id === raw,
                                )?.fields.name
                              : raw;
                        return (
                          <p key={field.key}>
                            {field.label}: {label ?? "Not assigned"}
                          </p>
                        );
                      })}
                    {record.fields.note ? (
                      <p className="max-w-xl whitespace-pre-wrap break-words">
                        {record.fields.note}
                      </p>
                    ) : null}
                    {record.fields.status ? (
                      <Badge>{record.fields.status}</Badge>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {section === "people" ? (
                    <ButtonLink
                      href={`${base}/people?id=${record.id}`}
                      variant="secondary"
                    >
                      Open
                      <ArrowRight size={16} />
                    </ButtonLink>
                  ) : canCreate &&
                    !["Approved", "Rejected"].includes(record.fields.status) ? (
                    <ButtonLink
                      href={`${base}/${section}?edit=${record.id}`}
                      variant="secondary"
                    >
                      Edit
                    </ButtonLink>
                  ) : null}
                  {section === "events" && member.type === "member" ? (
                    workspace.records.some(
                      (item) =>
                        item.kind === "registrations" &&
                        item.fields.eventId === record.id &&
                        item.createdBy === member.id,
                    ) ? (
                      <Badge tone="success">Registered</Badge>
                    ) : (
                      <form method="post" action={endpoint}>
                        <FormMeta section="events" action="join-event" />
                        <input
                          type="hidden"
                          name="targetId"
                          value={record.id}
                        />
                        <button className={submitClass}>Join event</button>
                      </form>
                    )
                  ) : null}
                  {section === "decisions" &&
                  member.type === "church_leader" &&
                  record.fields.status === "Pending" &&
                  record.createdBy !== member.id ? (
                    <form
                      method="post"
                      action={endpoint}
                      className="flex gap-2"
                    >
                      <FormMeta
                        section="decisions"
                        action="review"
                        id={record.id}
                      />
                      <button
                        name="status"
                        value="Approved"
                        className={submitClass}
                      >
                        Approve
                      </button>
                      <button
                        name="status"
                        value="Rejected"
                        className="min-h-11 rounded-md border border-border px-3 text-sm"
                      >
                        Reject
                      </button>
                    </form>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          {!records.length ? (
            <section className="flex min-h-52 flex-col items-center justify-center gap-4 py-8 text-center">
              <h2 className="text-lg font-semibold">{config?.empty}</h2>
              {canCreate ? (
                <ButtonLink
                  href={`${base}/${section}?new=1`}
                  variant="secondary"
                >
                  <Plus size={18} />
                  {config.action}
                </ButtonLink>
              ) : null}
            </section>
          ) : null}
          {section === "decisions" && member.type === "church_leader" ? (
            <section className="mt-8 border-t border-border pt-5">
              <h2 className="font-semibold">Expenses awaiting review</h2>
              {workspace.records
                .filter(
                  (record) =>
                    record.kind === "expenses" &&
                    record.fields.status === "Pending",
                )
                .map((record) => (
                  <div
                    key={record.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-4"
                  >
                    <div>
                      <p>{record.fields.name}</p>
                      <p className="text-sm text-muted">
                        {record.fields.currency} {record.fields.amount}
                      </p>
                    </div>
                    {record.createdBy !== member.id ? (
                      <form
                        method="post"
                        action={endpoint}
                        className="flex gap-2"
                      >
                        <FormMeta
                          section="decisions"
                          action="review"
                          id={record.id}
                        />
                        <button
                          name="status"
                          value="Approved"
                          className={submitClass}
                        >
                          Approve
                        </button>
                        <button
                          name="status"
                          value="Rejected"
                          className="min-h-11 rounded-md border border-border px-3 text-sm"
                        >
                          Reject
                        </button>
                      </form>
                    ) : (
                      <Badge>Another leader must review</Badge>
                    )}
                  </div>
                ))}
            </section>
          ) : null}
          {section === "classes" &&
          ["church_admin", "ministry_coordinator"].includes(member.type) ? (
            <section className="mt-8 border-t border-border pt-5">
              <h2 className="font-semibold">Class requests</h2>
              {workspace.records
                .filter(
                  (record) =>
                    record.kind === "enrolments" &&
                    record.fields.status === "Requested" &&
                    records.some((item) => item.id === record.fields.classId),
                )
                .map((record) => (
                  <div
                    key={record.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-4"
                  >
                    <div>
                      <p>
                        {
                          workspace.records.find(
                            (item) => item.id === record.fields.personId,
                          )?.fields.name
                        }
                      </p>
                      <p className="text-sm text-muted">
                        {
                          records.find(
                            (item) => item.id === record.fields.classId,
                          )?.fields.name
                        }
                      </p>
                    </div>
                    <form method="post" action={endpoint}>
                      <FormMeta section="classes" action="enrol" />
                      <input
                        type="hidden"
                        name="personId"
                        value={record.fields.personId}
                      />
                      <input
                        type="hidden"
                        name="classId"
                        value={record.fields.classId}
                      />
                      <button className={submitClass}>Confirm enrolment</button>
                    </form>
                  </div>
                ))}
            </section>
          ) : null}
          {section === "departments" && ["church_admin", "ministry_coordinator"].includes(member.type) ? (
            <section className="mt-8 border-t border-border pt-5">
              <h2 className="font-semibold">People asking to serve</h2>
              {workspace.records.filter((record) => record.kind === "department-memberships" && record.fields.status === "Requested" && records.some((department) => department.id === record.fields.departmentId) && visibleRecords(workspace, member, "people").some((person) => person.id === record.fields.personId)).map((record) => (
                <div key={record.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-4">
                  <div>
                    <p className="font-medium">{workspace.records.find((person) => person.id === record.fields.personId)?.fields.name ?? "Person"}</p>
                    <p className="text-sm text-muted">{records.find((department) => department.id === record.fields.departmentId)?.fields.name ?? "Department"}</p>
                  </div>
                  <ButtonLink href={`${base}/people?id=${record.fields.personId}`} variant="secondary">Review person</ButtonLink>
                </div>
              ))}
              <h2 className="mt-8 font-semibold">Department roster</h2>
              {records.map((department) => {
                const volunteers = workspace.records.filter((record) => record.kind === "department-memberships" && record.fields.departmentId === department.id && record.fields.status === "Active" && record.fields.archived !== "yes" && visibleRecords(workspace, member, "people").some((person) => person.id === record.fields.personId));
                return <div key={department.id} className="border-b border-border py-4">
                  <h3 className="font-medium">{department.fields.name}</h3>
                  <p className="mt-1 text-sm text-muted">{volunteers.length} approved to serve</p>
                  {volunteers.map((volunteer) => {
                    const person = workspace.records.find((item) => item.id === volunteer.fields.personId);
                    const duties = workspace.records.filter((duty) => duty.kind === "duties" && duty.fields.personId === volunteer.fields.personId && duty.fields.ministryId === department.id && duty.fields.archived !== "yes");
                    return <div key={volunteer.id} className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                      <span>{person?.fields.name ?? "Person"}</span>
                      <span className="text-muted">{duties.length ? duties.map((duty) => `${duty.fields.name}: ${upcomingDutyDates(duty.fields.date, duty.fields.recurrence || "Once", new Date(), 1)[0] || "no upcoming date"}`).join(" · ") : "No duty assigned"}</span>
                    </div>;
                  })}
                </div>;
              })}
            </section>
          ) : null}
          {section === "decisions" && ["church_admin", "church_leader"].includes(member.type) ? (
            <section className="mt-8 border-t border-border pt-5">
              <h2 className="font-semibold">Leadership nominations</h2>
              {workspace.records.filter((record) => record.kind === "leadership-nominations" && record.fields.status === "Pending" && record.fields.archived !== "yes").map((record) => (
                <div key={record.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-4">
                  <div>
                    <p className="font-medium">{workspace.records.find((person) => person.id === record.fields.personId)?.fields.name ?? "Person"}</p>
                    <p className="text-sm text-muted">{record.fields.title}</p>
                  </div>
                  <ButtonLink href={`${base}/people?id=${record.fields.personId}`} variant="secondary">Review nomination</ButtonLink>
                </div>
              ))}
            </section>
          ) : null}
        </>
      )}
    </WorkspaceShell>
  );
}
