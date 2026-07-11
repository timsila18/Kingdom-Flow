import { describe, expect, it } from "vitest";
import { can } from "./authz";
import { memberships, organizationUnits } from "./data";
import { tenantScoped, wouldCreateCircularParent } from "./organization";
import { labelFor } from "./terminology";

describe("KingdomFlow tenant foundation", () => {
  it("filters tenant-owned records by tenant id", () => {
    expect(tenantScoped(organizationUnits, "tenant-kings-grace")).toHaveLength(5);
    expect(tenantScoped(organizationUnits, "tenant-other")).toHaveLength(0);
  });

  it("authorizes by permission key instead of role name", () => {
    expect(can({ id: "user-admin" }, "organization.manage", { tenantId: "tenant-kings-grace", scopeType: "tenant" })).toBe(true);
    expect(can({ id: "user-branch" }, "organization.manage", { tenantId: "tenant-kings-grace", scopeType: "tenant" })).toBe(false);
  });

  it("does not let membership in one tenant imply access to another tenant", () => {
    expect(memberships.some((membership) => membership.tenantId === "tenant-pending" && membership.userId === "user-admin")).toBe(false);
    expect(can({ id: "user-admin" }, "tenant.view", { tenantId: "tenant-pending", scopeType: "tenant" })).toBe(false);
  });

  it("resolves tenant terminology from canonical keys", () => {
    expect(labelFor("tenant-kings-grace", "branch")).toBe("Campus");
    expect(labelFor("unknown", "branch")).toBe("Branch");
  });

  it("prevents circular organization parent moves", () => {
    expect(wouldCreateCircularParent(organizationUnits, "unit-head", "unit-imaara")).toBe(true);
    expect(wouldCreateCircularParent(organizationUnits, "unit-imaara", "unit-head")).toBe(false);
  });
});
