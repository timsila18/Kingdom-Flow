import type { TeamMember, WorkspaceRecord } from "./workspace-store";

export function selectCareWorker(
  team: TeamMember[],
  records: WorkspaceRecord[],
) {
  const workers = team.filter((member) =>
    [member.type, ...(member.types ?? [])].includes("care_worker"),
  );
  const departments = records.filter(
    (record) =>
      record.kind === "departments" &&
      record.fields.archived !== "yes" &&
      /care|follow.?up/i.test(record.fields.name ?? ""),
  );
  const preferred = workers.filter((worker) =>
    departments.some(
      (department) =>
        department.fields.assignedTo === worker.id ||
        worker.assignedIds.includes(department.id),
    ),
  );
  const workload = (id: string) =>
    records.filter(
      (record) =>
        record.kind === "people" &&
        record.fields.archived !== "yes" &&
        record.fields.assignedTo === id,
    ).length;
  return [...(preferred.length ? preferred : workers)].sort(
    (a, b) => workload(a.id) - workload(b.id) || a.id.localeCompare(b.id),
  )[0];
}
