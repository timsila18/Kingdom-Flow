import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Users,
  Phone,
  Settings,
  BookOpen,
  CalendarDays,
  HeartHandshake,
  ClipboardCheck,
  Wallet,
  Receipt,
  HandHeart,
} from "lucide-react";
import { WorkspaceShell } from "@/components/shells";
import { PageHeader, ButtonLink } from "@/components/ui";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";
import { getWorkspaceAccess, visibleRecords } from "@/lib/workspace-store";
import type { ChurchUserType } from "@/lib/user-types";
import { Journey } from "@/components/workspace-ui";
import { teamMemberName } from "@/lib/team-label";
const actions = {
  church_admin: [
    ["Add a person", "people?new=1", Users],
    ["Follow up", "follow-up", Phone],
    ["Set up church", "settings", Settings],
  ],
  church_leader: [
    ["People needing attention", "people", HeartHandshake],
    ["Review decisions", "decisions", ClipboardCheck],
    ["View ministry", "ministry", BookOpen],
  ],
  ministry_coordinator: [
    ["Record attendance", "attendance?new=1", ClipboardCheck],
    ["Plan activity", "events?new=1", CalendarDays],
    ["View my ministry", "ministry", Users],
  ],
  care_worker: [
    ["My people", "people", Users],
    ["Record contact", "follow-up?new=1", Phone],
    ["Arrange visit", "visits?new=1", CalendarDays],
  ],
  finance_officer: [
    ["Record giving", "giving?new=1", Wallet],
    ["Add expense", "expenses?new=1", Receipt],
    ["View receipts", "receipts", ClipboardCheck],
  ],
  member: [
    ["View my classes", "my-classes", BookOpen],
    ["Ask to serve", "my-service", HandHeart],
    ["Request prayer", "prayer?new=1", HandHeart],
  ],
} as const;
const headings: Record<ChurchUserType, string> = {
  church_admin: "My church",
  church_leader: "Church overview",
  ministry_coordinator: "My ministry",
  care_worker: "My follow-up",
  finance_officer: "Church finances",
  member: "My church",
};
export default async function WorkspaceHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  const access = await getWorkspaceAccess(tenant.id);
  if (!access) notFound();
  const { member, workspace } = access;
  const base = `/workspace/${slug}/work`;
  const intake = visibleRecords(workspace, member, "people").filter(
    (person) =>
      person.fields.joinedVia === "Self-registration" &&
      !workspace.records.some(
        (record) =>
          record.kind === "follow-up" &&
          record.fields.personId === person.id &&
          ["Contacted", "Completed"].includes(record.fields.result),
      ),
  );
  const ownPerson = workspace.records.find(
    (record) => record.kind === "people" && record.id === member.personId,
  );
  const careWorker = workspace.team.find(
    (worker) => worker.id === ownPerson?.fields.assignedTo,
  );
  const personalTasks = visibleRecords(
    workspace,
    member,
    member.type === "care_worker"
      ? "people"
      : member.type === "finance_officer"
        ? "expenses"
        : "events",
  ).filter((record) => record.fields.archived !== "yes");
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={slug}>
      <PageHeader
        title={headings[member.type]}
        actions={
          member.title ? (
            <span className="text-sm text-muted">{member.title}</span>
          ) : undefined
        }
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {actions[member.type].map(([label, path, Icon]) => (
          <Link
            key={path}
            href={`${base}/${path}`}
            className="flex min-h-28 items-center gap-4 rounded-lg border border-border bg-surface p-5 transition hover:border-primary"
          >
            <Icon size={26} className="shrink-0 text-primary" />
            <span className="font-semibold">{label}</span>
            <ArrowRight size={18} className="ml-auto shrink-0 text-primary" />
          </Link>
        ))}
      </div>
      {["church_admin", "care_worker"].includes(member.type) &&
      intake.length ? (
        <section className="mt-8 border-t border-border pt-6">
          <h2 className="text-lg font-semibold">
            New people to contact ({intake.length})
          </h2>
          <ul className="mt-4 divide-y divide-border">
            {intake.map((person) => (
              <li key={person.id}>
                <Link
                  href={`${base}/people?id=${person.id}`}
                  className="flex min-h-16 items-center justify-between gap-3 py-3"
                >
                  <span className="font-medium">
                    {person.fields.name}
                    <span className="mt-1 block text-sm font-normal text-muted">
                      {person.fields.assignedTo
                        ? `Care worker: ${teamMemberName(workspace.team.find((worker) => worker.id === person.fields.assignedTo))}`
                        : "Needs a care worker"}
                    </span>
                  </span>
                  <ArrowRight size={18} className="shrink-0 text-primary" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {member.type === "church_admin" ? (
        <section className="mt-8 border-t border-border pt-6">
          <h2 className="text-lg font-semibold">Church setup</h2>
          <ol className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              ["Church details", "settings"],
              ["Departments", "departments"],
              ["Team", "team"],
            ].map(([label, path], index) => (
              <li key={path} className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                  {index + 1}
                </span>
                <ButtonLink href={`${base}/${path}`} variant="secondary">
                  {label}
                </ButtonLink>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <ButtonLink href={`${base}/reports`} variant="secondary">
              Church reports
            </ButtonLink>
          </div>
        </section>
      ) : member.type === "member" ? (
        <>
          <section className="mt-8 border-t border-border pt-6">
            {ownPerson?.fields.joinedVia === "Self-registration" ? (
              <p role="status" className="mb-5 text-sm text-muted">
                Welcome to {tenant.publicName}.{" "}
                {careWorker
                  ? `Your care worker is ${teamMemberName(careWorker)}. They will reach out to you.`
                  : "Your church will assign a care worker to welcome you."}
              </p>
            ) : null}
            <h2 className="text-lg font-semibold">My journey</h2>
            <Journey workspace={workspace} personId={member.personId} />
          </section>
          <div className="mt-6">
            <ButtonLink href={`${base}/my-duties`} variant="secondary">
              My serving duties
            </ButtonLink>
            <ButtonLink href={`${base}/events`} variant="secondary">
              Church events
            </ButtonLink>
          </div>
        </>
      ) : (
        <section className="mt-8 border-t border-border pt-6">
          <h2 className="text-lg font-semibold">
            {member.type === "care_worker"
              ? "Assigned people"
              : member.type === "finance_officer"
                ? "Recent expenses"
                : "Activities"}
          </h2>
          {personalTasks.length ? (
            <ul className="mt-4 divide-y divide-border">
              {personalTasks.slice(0, 5).map((record) => (
                <li key={record.id} className="py-3 text-sm">
                  {record.fields.name}
                  <span className="ml-3 text-muted">{record.fields.date}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">
              {member.type === "care_worker"
                ? "No people assigned to you."
                : member.type === "finance_officer"
                  ? "No expenses recorded yet."
                  : "No activities scheduled."}
            </p>
          )}
        </section>
      )}
    </WorkspaceShell>
  );
}
