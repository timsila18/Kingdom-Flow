import { describe, expect, it } from "vitest";
import { approvalRequests } from "./authority-data";
import {
  authorizationDiagnostic,
  can,
  canApprove,
  canAssignRole,
  canDelegate,
  getAccessibleScopes,
  getEffectivePermissions,
  simulateReferralRoute,
  wouldCreateReportingCycle,
} from "./authority-engine";
import { decideApproval } from "./approval-engine";

describe("Prompt 2 authority engine", () => {
  it("allows direct scoped role permission inside descendant branches", () => {
    const decision = can("user-branch", "branch.view", {
      tenantId: "tenant-kings-grace",
      scopeType: "branch",
      scopeId: "branch-imaara",
    });
    expect(decision.allowed).toBe(true);
    expect(decision.reason).toContain("Regional Pastor");
  });

  it("denies cross-tenant access", () => {
    const decision = can("user-branch", "branch.view", {
      tenantId: "tenant-pending",
      scopeType: "tenant",
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain("not a member");
  });

  it("ignores expired assignments", () => {
    const scopes = getAccessibleScopes("user-branch", "communication.send_scoped", "tenant-kings-grace");
    expect(scopes).toHaveLength(0);
  });

  it("resolves delegated programme approval within scope", () => {
    const decision = can("user-branch", "programme.approve", {
      tenantId: "tenant-kings-grace",
      scopeType: "branch",
      scopeId: "branch-imaara",
    });
    expect(decision.allowed).toBe(true);
    expect(decision.source?.source).toBe("delegation");
  });

  it("exposes acting appointment permissions", () => {
    const effective = getEffectivePermissions("user-admin", "tenant-kings-grace");
    expect(effective.some((item) => item.source === "acting" && item.permission === "branch.view")).toBe(true);
  });

  it("prevents self and circular reporting lines", () => {
    expect(wouldCreateReportingCycle([{ id: "a" }], "a", "a")).toBe(true);
    expect(wouldCreateReportingCycle([{ id: "a", reportsToAssignmentId: "b" }, { id: "b" }], "b", "a")).toBe(true);
  });

  it("simulates pastoral referral routing without creating a case", () => {
    const route = simulateReferralRoute({
      tenantId: "tenant-kings-grace",
      fromAssignmentId: "leader-branch-imaara",
      category: "counselling",
      sensitivity: "confidential",
      urgency: "soon",
    });
    expect(route.receiver?.id).toBe("leader-regional-east");
    expect(route.reason).toContain("routed upward");
  });

  it("requires approval for sensitive role assignment", () => {
    const decision = canAssignRole("user-admin", "role-youth-coordinator", {
      tenantId: "tenant-kings-grace",
      scopeType: "unit",
      scopeId: "unit-youth",
    });
    expect(decision.allowed).toBe(false);
    expect(decision.requiredApproval).toBe("role.assignment.sensitive");
  });

  it("allows delegation only when actor has permission and delegation authority", () => {
    const decision = canDelegate("user-admin", "programme.approve", {
      tenantId: "tenant-kings-grace",
      scopeType: "branch",
      scopeId: "branch-imaara",
    });
    expect(decision.allowed).toBe(true);
  });

  it("blocks self approval", () => {
    const decision = canApprove("user-admin", "role.assign", {
      tenantId: "tenant-kings-grace",
      scopeType: "unit",
      scopeId: "unit-youth",
      actorUserId: "user-admin",
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain("self-approval");
  });

  it("advances approved workflow steps", () => {
    const result = decideApproval(approvalRequests[0], "user-admin", "approved");
    expect(result.allowed).toBe(true);
    expect(result.request.status).toBe("approved");
  });

  it("returns diagnostic metadata without mutating access", () => {
    const diagnostic = authorizationDiagnostic("user-branch", "finance.transaction.approve", {
      tenantId: "tenant-kings-grace",
      scopeType: "branch",
      scopeId: "branch-imaara",
    });
    expect(diagnostic.metadataOnly).toBe(true);
    expect(diagnostic.allowed).toBe(false);
  });
});
