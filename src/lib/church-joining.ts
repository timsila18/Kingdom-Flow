import "server-only";
import { getSupabaseAdmin } from "./supabase-admin";
import { mutateWorkspace } from "./workspace-store";
import { selectCareWorker } from "./care-allocation";

export async function publicChurchOptions() {
  const { data, error } = await getSupabaseAdmin()
    .from("tenants")
    .select("id,public_name,region")
    .eq("status", "approved")
    .is("archived_at", null)
    .neq("slug", "kingdomflow-demo")
    .order("public_name");
  if (error)
    throw new Error("Church list could not be loaded. Please try again.");
  return data ?? [];
}

export async function joinChurch(
  user: { id: string; email: string; name: string },
  churchId: string,
  phone = "",
  journeyStage = "Visitor",
) {
  const { data: church, error } = await getSupabaseAdmin()
    .from("tenants")
    .select("id,slug")
    .eq("id", churchId)
    .eq("status", "approved")
    .is("archived_at", null)
    .neq("slug", "kingdomflow-demo")
    .maybeSingle();
  if (error || !church)
    throw new Error("This church is not available for joining.");
  await mutateWorkspace(church.id, (workspace) => {
    if (workspace.team.some((member) => member.id === user.id))
      return workspace;
    const worker = selectCareWorker(workspace.team, workspace.records);
    const personId = crypto.randomUUID();
    workspace.records.push({
      id: personId,
      kind: "people",
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      fields: {
        name: user.name.slice(0, 200),
        email: user.email,
        phone: phone.slice(0, 50),
        stage: journeyStage === "New convert" ? "New convert" : "Visitor",
        assignedTo: worker?.id ?? "",
        joinedVia: "Self-registration",
      },
    });
    workspace.team.push({
      id: user.id,
      email: user.email,
      name: user.name.slice(0, 200),
      type: "member",
      title: "",
      personId,
      assignedIds: [],
    });
    return workspace;
  });
  return church.slug;
}
