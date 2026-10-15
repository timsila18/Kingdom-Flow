import { describe, expect, it } from "vitest";
import { selectCareWorker } from "./care-allocation";
import type { TeamMember, WorkspaceRecord } from "./workspace-store";
const worker = (
  id: string,
  types: TeamMember["types"] = [],
  assignedIds: string[] = [],
): TeamMember => ({
  id,
  name: id,
  email: `${id}@example.com`,
  type: "church_leader",
  types,
  assignedIds,
  personId: "",
  title: "",
});
const record = (
  id: string,
  kind: string,
  fields: Record<string, string>,
): WorkspaceRecord => ({ id, kind, fields, createdAt: "", createdBy: "" });
describe("care allocation", () => {
  it("does not assign an unauthorised leader", () =>
    expect(selectCareWorker([worker("a")], [])).toBeUndefined());
  it("includes additional care responsibilities", () =>
    expect(selectCareWorker([worker("a", ["care_worker"])], [])?.id).toBe("a"));
  it("prefers the care department team", () =>
    expect(
      selectCareWorker(
        [
          worker("a", ["care_worker"]),
          worker("b", ["care_worker"], ["department"]),
        ],
        [record("department", "departments", { name: "Care & Follow-up" })],
      )?.id,
    ).toBe("b"));
  it("balances people assignments", () =>
    expect(
      selectCareWorker(
        [worker("a", ["care_worker"]), worker("b", ["care_worker"])],
        [record("person", "people", { assignedTo: "a" })],
      )?.id,
    ).toBe("b"));
  it("ignores archived people", () =>
    expect(
      selectCareWorker(
        [worker("a", ["care_worker"]), worker("b", ["care_worker"])],
        [record("person", "people", { assignedTo: "a", archived: "yes" })],
      )?.id,
    ).toBe("a"));
});
