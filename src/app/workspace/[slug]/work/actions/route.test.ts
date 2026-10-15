import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WorkspaceData, TeamMember } from "@/lib/workspace-store";

const state = vi.hoisted(() => ({
  workspace: { team: [], records: [] } as WorkspaceData,
  member: {} as TeamMember,
}));

vi.mock("@/lib/tenant-store", () => ({
  getVisibleTenantBySlug: async () => ({ id: "tenant-1", status: "approved" }),
}));
vi.mock("@/lib/workspace-store", () => ({
  getWorkspaceAccess: async () => ({ user: { id: state.member.id }, member: state.member, workspace: state.workspace }),
  mutateWorkspace: async (_tenantId: string, mutate: (workspace: WorkspaceData) => WorkspaceData) => {
    state.workspace = mutate(structuredClone(state.workspace));
    return state.workspace;
  },
  canOpenSection: () => true,
  visibleRecords: (workspace: WorkspaceData, _member: TeamMember, kind: string) =>
    workspace.records.filter((record) => record.kind === kind && record.fields.archived !== "yes"),
}));
vi.mock("@/lib/supabase-admin", () => ({ getSupabaseAdmin: () => ({}) }));

import { POST } from "./route";

async function submit(action: string, section: string, fields: Record<string, string>) {
  const form = new FormData();
  form.set("action", action);
  form.set("section", section);
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  const response = await POST(
    new Request("http://localhost/workspace/demo/work/actions", { method: "POST", headers: { origin: "http://localhost" }, body: form }),
    { params: Promise.resolve({ slug: "demo" }) },
  );
  return new URL(response.headers.get("location") || "http://localhost");
}

beforeEach(() => {
  state.member = { id: "admin-1", name: "Administrator", email: "admin@example.com", type: "church_admin", title: "", personId: "", assignedIds: [] };
  state.workspace = {
    team: [state.member],
    records: [
      { id: "person-1", kind: "people", createdBy: "admin-1", createdAt: "2026-10-01", fields: { name: "New believer" } },
      { id: "class-1", kind: "classes", createdBy: "admin-1", createdAt: "2026-10-01", fields: { name: "Foundation", track: "Foundation", requiredSessions: "2" } },
      { id: "department-1", kind: "departments", createdBy: "admin-1", createdAt: "2026-10-01", fields: { name: "Welcome team", published: "yes" } },
    ],
  };
});

describe("church journey actions", () => {
  it("requires attendance and assessment before graduation", async () => {
    expect((await submit("enrol", "people", { personId: "person-1", classId: "class-1" })).searchParams.get("saved")).toBe("1");
    expect((await submit("complete-class", "people", { personId: "person-1", classId: "class-1" })).searchParams.get("error")).toContain("attended session");
    expect((await submit("assess-class", "people", { personId: "person-1", classId: "class-1", assessment: "Passed" })).searchParams.get("saved")).toBe("1");
    for (const date of ["2026-10-01", "2026-10-08"])
      expect((await submit("save", "attendance", { personId: "person-1", ministryId: "class-1", date, status: "Present" })).searchParams.get("saved")).toBe("1");
    expect((await submit("complete-class", "people", { personId: "person-1", classId: "class-1" })).searchParams.get("saved")).toBe("1");
    expect(state.workspace.records.find((record) => record.kind === "enrolments")?.fields.status).toBe("Completed");
  });

  it("holds volunteer duties until a department request is approved", async () => {
    state.member = { id: "member-1", name: "New believer", email: "member@example.com", type: "member", title: "", personId: "person-1", assignedIds: [] };
    expect((await submit("request-department", "my-service", { departmentId: "department-1" })).searchParams.get("saved")).toBe("1");
    state.member = state.workspace.team[0];
    const duty = { personId: "person-1", ministryId: "department-1", name: "Welcome guests", date: "2026-10-11", recurrence: "Weekly" };
    expect((await submit("save", "duties", duty)).searchParams.get("error")).toContain("Approve department service");
    const request = state.workspace.records.find((record) => record.kind === "department-memberships");
    expect((await submit("review-department", "people", { id: request!.id, status: "Active" })).searchParams.get("saved")).toBe("1");
    expect((await submit("save", "duties", duty)).searchParams.get("saved")).toBe("1");
  });

  it("requires a different reviewer before pastoral access is granted", async () => {
    state.workspace.records.push({ id: "person-2", kind: "people", createdBy: "admin-1", createdAt: "2026-10-01", fields: { name: "Candidate", membershipConfirmedBy: "admin-1" } });
    const candidate: TeamMember = { id: "candidate-1", name: "Candidate", email: "candidate@example.com", type: "member", title: "", personId: "person-2", assignedIds: [] };
    state.workspace.team.push(candidate);
    const account = { id: candidate.id, name: candidate.name, email: candidate.email, type: "church_leader", personId: candidate.personId, section: "team" };
    expect((await submit("save-team", "team", account)).searchParams.get("error")).toContain("Approve a leadership appointment");
    expect((await submit("nominate-leader", "people", { personId: "person-2", title: "Pastor", note: "Training and calling reviewed" })).searchParams.get("saved")).toBe("1");
    const nomination = state.workspace.records.find((record) => record.kind === "leadership-nominations")!;
    expect((await submit("review-leader", "people", { id: nomination.id, status: "Approved" })).searchParams.get("error")).toContain("different leader");
    state.member = { id: "leader-1", name: "Senior Pastor", email: "leader@example.com", type: "church_leader", title: "Senior Pastor", personId: "person-3", assignedIds: [] };
    expect((await submit("review-leader", "people", { id: nomination.id, status: "Approved" })).searchParams.get("saved")).toBe("1");
    state.member = state.workspace.team[0];
    expect((await submit("save-team", "team", account)).searchParams.get("saved")).toBe("1");
    expect(state.workspace.team.find((member) => member.id === candidate.id)?.type).toBe("church_leader");
  });
});
