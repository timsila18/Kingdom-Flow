import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { getCurrentUser } from "./app-auth";
import { getSupabaseAdmin } from "./supabase-admin";
import { roleSections, type ChurchUserType } from "./user-types";

export type WorkspaceRecord = {
  id: string;
  kind: string;
  createdBy: string;
  createdAt: string;
  fields: Record<string, string>;
};
export type TeamMember = {
  id: string;
  email: string;
  name: string;
  type: ChurchUserType;
  title: string;
  personId: string;
  assignedIds: string[];
  types?: ChurchUserType[];
};
export type WorkspaceData = { team: TeamMember[]; records: WorkspaceRecord[] };
export const emptyWorkspace = (): WorkspaceData => ({ team: [], records: [] });

export const readWorkspace = cache(
  async (tenantId: string): Promise<WorkspaceData> => {
    const { data, error } = await getSupabaseAdmin()
      .from("tenant_settings")
      .select("regional_settings")
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (error)
      throw new Error("Church records could not be loaded. Please try again.");
    const value = data?.regional_settings?.workspace;
    return value && Array.isArray(value.team) && Array.isArray(value.records)
      ? (value as WorkspaceData)
      : emptyWorkspace();
  },
);

// Compare-and-swap preserves simultaneous edits to the shared church document.
export async function mutateWorkspace(
  tenantId: string,
  mutate: (workspace: WorkspaceData) => WorkspaceData,
) {
  const client = getSupabaseAdmin();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await client
      .from("tenant_settings")
      .select("regional_settings,updated_at")
      .eq("tenant_id", tenantId)
      .single();
    if (error) throw new Error("Church records could not be saved.");
    const current = data.regional_settings?.workspace ?? emptyWorkspace();
    const workspace = mutate(structuredClone(current));
    const { data: saved, error: saveError } = await client
      .from("tenant_settings")
      .update({
        regional_settings: { ...data.regional_settings, workspace },
        updated_at: new Date().toISOString(),
      })
      .eq("tenant_id", tenantId)
      .eq("updated_at", data.updated_at)
      .select("tenant_id");
    if (saveError) throw new Error("Church records could not be saved.");
    if (saved?.length) return workspace;
  }
  throw new Error("Someone else is updating these records. Please try again.");
}

export async function getWorkspaceAccess(tenantId: string) {
  const user = await getCurrentUser();
  if (!user) return undefined;
  const workspace = await readWorkspace(tenantId);
  const member = workspace.team.find((item) => item.id === user.id);
  if (!member) return undefined;
  const selected = (await cookies()).get("kingdomflow_active_type")?.value;
  const types = Array.from(new Set([member.type, ...(member.types ?? [])]));
  const active =
    types.find((type) => selected === `${tenantId}:${type}`) ?? member.type;
  return { user, member: { ...member, type: active, types }, workspace };
}

export function canOpenSection(type: ChurchUserType, section: string) {
  return roleSections[type].includes(section);
}

export function visibleRecords(
  workspace: WorkspaceData,
  member: TeamMember,
  kind: string,
) {
  const records = workspace.records.filter(
    (record) => record.kind === kind && record.fields.archived !== "yes",
  );
  if (member.type === "church_admin" || member.type === "finance_officer")
    return records;
  if (member.type === "church_leader")
    return records.filter(
      (record) => !["care", "prayer", "visits"].includes(record.kind),
    );
  if (member.type === "member") {
    if (["events", "classes", "departments"].includes(kind))
      return records.filter((record) => record.fields.published === "yes");
    return records.filter(
      (record) =>
        record.createdBy === member.id ||
        (record.fields.personId === member.personId &&
          Boolean(member.personId)),
    );
  }
  if (member.type === "care_worker")
    return records.filter(
      (record) =>
        record.fields.assignedTo === member.id ||
        record.createdBy === member.id ||
        member.assignedIds.includes(record.id) ||
        workspace.records.some(
          (person) =>
            person.kind === "people" &&
            person.id === record.fields.personId &&
            (person.fields.assignedTo === member.id ||
              member.assignedIds.includes(person.id)),
        ),
    );
  return records.filter(
    (record) =>
      record.fields.assignedTo === member.id ||
      record.createdBy === member.id ||
      member.assignedIds.includes(record.id) ||
      member.assignedIds.includes(record.fields.ministryId) ||
      (kind === "people" &&
        workspace.records.some(
          (link) =>
            link.fields.personId === record.id &&
            (member.assignedIds.includes(link.fields.ministryId) ||
              member.assignedIds.includes(link.fields.groupId)),
        )),
  );
}
