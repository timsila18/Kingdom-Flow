import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { type Field } from "@/lib/workspace-config";
import { personJourney } from "@/lib/journey";
import { teamMemberName } from "@/lib/team-label";
import {
  visibleRecords,
  type TeamMember,
  type WorkspaceData,
} from "@/lib/workspace-store";
export function Journey({
  workspace,
  personId,
}: {
  workspace: WorkspaceData;
  personId: string;
}) {
  const stages = personJourney(workspace.records, personId);
  return (
    <>
      <ol className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {stages.map((step, index) => (
          <li key={step.label} className="flex items-start gap-3 text-sm">
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${step.state === "done" ? "bg-primary text-white" : step.state === "in_progress" ? "bg-primary-soft text-primary" : "border border-border bg-surface text-muted"}`}
            >
              {step.state === "done" ? <Check size={16} /> : index + 1}
            </span>
            <span className="min-w-0">
              <span className="block font-medium">{step.label}</span>
              <span className="block text-muted">{step.detail}</span>
            </span>
          </li>
        ))}
      </ol>
      {stages[0].state !== "done" ? (
        <p className="mt-4 text-sm text-muted">Journey not yet recorded.</p>
      ) : null}
    </>
  );
}
export function sourceOptions(
  source: string,
  workspace: WorkspaceData,
  member: TeamMember,
) {
  if (source === "team")
    return workspace.team
      .filter((user) =>
        [user.type, ...(user.types ?? [])].some((type) =>
          ["care_worker", "ministry_coordinator", "church_admin"].includes(
            type,
          ),
        ),
      )
      .map((user) => ({ value: user.id, label: teamMemberName(user) }));
  const kinds =
    source === "ministry"
      ? ["classes", "groups", "events", "departments"]
      : [source];
  return kinds
    .flatMap((kind) => visibleRecords(workspace, member, kind))
    .filter((record) => record.fields.archived !== "yes")
    .map((record) => ({
      value: record.id,
      label: record.fields.name || record.fields.result || record.id,
    }));
}
export function RecordFields({
  fields,
  workspace,
  member,
  values = {},
}: {
  fields: Field[];
  workspace: WorkspaceData;
  member: TeamMember;
  values?: Record<string, string>;
}) {
  return (
    <>
      {fields.map((field) => (
        <label key={field.key} className="grid gap-2 text-sm font-medium">
          <span>
            {field.label}
            {field.required ? " *" : ""}
          </span>
          {field.source ? (
            <select
              name={field.key}
              required={field.required}
              defaultValue={values[field.key] ?? ""}
            >
              <option value="">Choose {field.label.toLowerCase()}</option>
              {sourceOptions(field.source, workspace, member).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : field.options ? (
            <select
              name={field.key}
              defaultValue={values[field.key] ?? field.options[0]}
            >
              {field.options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          ) : field.type === "textarea" ? (
            <textarea
              name={field.key}
              defaultValue={values[field.key] ?? ""}
              rows={3}
              maxLength={4000}
            />
          ) : (
            <input
              name={field.key}
              type={field.type ?? "text"}
              required={field.required}
              defaultValue={values[field.key] ?? ""}
              maxLength={500}
              min={field.type === "number" ? "0.01" : undefined}
              step={field.type === "number" ? "0.01" : undefined}
            />
          )}
        </label>
      ))}
    </>
  );
}
export function MinistryLinks({
  base,
  member,
}: {
  base: string;
  member: TeamMember;
}) {
  const links = [
    ["Departments", "departments"],
    ["Groups & fellowships", "groups"],
    ["Discipleship & classes", "classes"],
    ["Events", "events"],
    ["Attendance", "attendance"],
    ["Serving duties", "duties"],
  ];
  return (
    <div className="mt-6 divide-y divide-border">
      {links
        .filter(
          ([, path]) =>
            member.type !== "church_leader" ||
            !["attendance", "duties"].includes(path),
        )
        .map(([label, path]) => (
          <Link
            key={path}
            href={`${base}/${path}`}
            className="flex min-h-16 items-center justify-between gap-3 py-4 font-medium hover:text-primary"
          >
            {label}
            <ArrowRight size={18} />
          </Link>
        ))}
    </div>
  );
}
