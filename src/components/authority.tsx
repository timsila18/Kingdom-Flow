import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, KeyRound, ShieldCheck, UserCheck } from "lucide-react";
import { permissionGroups } from "@/lib/constants";
import { approvalRequests, approvalWorkflows, authorityLimits, authorityRoles, delegations, governanceSettings, leadershipAssignments, leadershipPositions, separationOfDutiesRules, userRoleAssignments } from "@/lib/authority-data";
import { authorizationDiagnostic, getEffectivePermissions, getPermissionCatalogue, getRoleWarnings, simulateReferralRoute } from "@/lib/authority-engine";
import { getApprovalHistory } from "@/lib/approval-engine";
import { profiles, roles } from "@/lib/data";
import { Badge, ButtonLink, Card, EmptyPhase, PageHeader, StatCard } from "./ui";

export const authorityLinks = [
  ["Roles & Permissions", "roles-permissions"],
  ["Role Builder", "role-builder"],
  ["User Access", "user-access"],
  ["Leadership Hierarchy", "leadership"],
  ["Governance Settings", "governance"],
  ["Delegations", "delegations"],
  ["Acting Appointments", "acting"],
  ["Approval Workflows", "workflows"],
  ["Approval Inbox", "approvals"],
  ["Access Reviews", "access-reviews"],
  ["Effective Access", "effective-access"],
  ["Diagnostic Tool", "diagnostic"],
  ["Authority Limits", "limits"],
] as const;

export function AuthorityHome({ slug, tenantId }: { slug: string; tenantId: string }) {
  return (
    <>
      <PageHeader title="Governance & Authority" description="Centralized role, scope, hierarchy, delegation and approval controls for every future KingdomFlow module." actions={<ButtonLink href={`/workspace/${slug}/authority/role-builder`}>Create role</ButtonLink>} />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Authority roles" value={authorityRoles.filter((role) => role.tenantId === tenantId).length + roles.filter((role) => role.tenantId === tenantId).length} detail="System and custom roles." />
        <StatCard label="Scoped assignments" value={userRoleAssignments.filter((item) => item.tenantId === tenantId && item.active).length} detail="Includes tenant, branch and unit scopes." />
        <StatCard label="Active delegations" value={delegations.filter((item) => item.tenantId === tenantId && item.status === "active").length} detail="Time-bound authority." />
        <StatCard label="Pending approvals" value={approvalRequests.filter((item) => item.tenantId === tenantId && item.status !== "approved").length} detail="Workflow-backed requests." />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {authorityLinks.map(([label, path]) => (
          <Link key={path} href={`/workspace/${slug}/authority/${path}`} className="rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-accent">
            <p className="font-semibold">{label}</p>
            <p className="mt-2 text-sm leading-6 text-muted">Open the {label.toLowerCase()} workspace.</p>
          </Link>
        ))}
      </div>
    </>
  );
}

export function RolesPermissionsPanel({ slug }: { slug: string }) {
  return (
    <>
      <PageHeader title="Roles & Permissions" description="Roles remain separate from permissions, scopes, hierarchy and delegations. Display names are configurable and never grant authority by themselves." actions={<ButtonLink href={`/workspace/${slug}/authority/role-builder`}>New role</ButtonLink>} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          <h2 className="text-lg font-semibold">Role catalogue</h2>
          <div className="mt-4 grid gap-3">
            {[...roles, ...authorityRoles].map((role) => (
              <Link key={role.id} href={`/workspace/${slug}/authority/roles-permissions/${role.id}`} className="rounded-md border border-border bg-surface-muted p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><p className="font-semibold">{role.displayName}</p><p className="text-sm text-muted">{role.description ?? "Prompt 1 role template"}</p></div>
                  <Badge tone={role.systemTemplate ? "accent" : "neutral"}>{role.systemTemplate ? "Template" : "Custom"}</Badge>
                </div>
                <p className="mt-3 text-xs text-muted">{role.permissions.length} permissions · level {role.authorityLevel ?? "not set"} · default scope {role.defaultScopeType ?? "tenant"}</p>
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Permission groups</h2>
          <div className="mt-4 grid gap-2 text-sm">
            {getPermissionCatalogue().map((group) => <div key={group.key} className="flex justify-between rounded-md bg-surface-muted px-3 py-2"><span>{group.label}</span><span>{group.count}</span></div>)}
          </div>
        </Card>
      </div>
    </>
  );
}

export function RoleBuilderPanel() {
  const selected = ["programme.view", "programme.update", "communication.create", "communication.send_scoped"];
  const warnings = getRoleWarnings(selected);
  return (
    <>
      <PageHeader title="Role Builder" description="Build roles from stable permission keys, assign category, authority level, default scope and approval rules." />
      <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <form className="grid gap-3">
            <input className="rounded-md border border-border px-3 py-2 text-sm" defaultValue="National Youth Coordinator" />
            <textarea className="min-h-24 rounded-md border border-border px-3 py-2 text-sm" defaultValue="Coordinates youth programmes with scoped communication permissions." />
            <select className="rounded-md border border-border px-3 py-2 text-sm" defaultValue="unit"><option value="tenant">Entire church</option><option value="unit">Selected organizational unit</option><option value="branch">Selected branch</option><option value="self">Self only</option></select>
            <label className="flex gap-3 text-sm"><input type="checkbox" defaultChecked /> Requires approval before assignment</label>
            <label className="flex gap-3 text-sm"><input type="checkbox" defaultChecked /> May receive delegated authority</label>
            <button className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white">Save role and create approval request</button>
          </form>
        </Card>
        <Card>
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Permissions</h2><Badge tone="accent">{selected.length} selected</Badge></div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {permissionGroups.map((group) => (
              <div key={group.key} className="rounded-md border border-border p-4">
                <div className="flex items-center justify-between gap-3"><p className="font-semibold">{group.label}</p><button className="text-xs text-accent">Select all</button></div>
                <div className="mt-3 grid gap-2 text-sm">{group.permissions.slice(0, 6).map((permission) => <label key={permission} className="flex gap-2"><input type="checkbox" defaultChecked={selected.includes(permission)} />{permission}</label>)}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-2 rounded-md bg-amber-50 p-3 text-sm text-warning dark:bg-amber-950">
            <AlertTriangle size={16} />
            Separation of duties warning: payment creation and approval, self-elevation, and sensitive data export combinations require second approval or documented exception.
          </div>
          <div className="mt-6 grid gap-2">{warnings.map((warning) => <div key={warning} className="flex gap-2 rounded-md bg-amber-50 p-3 text-sm text-warning dark:bg-amber-950"><AlertTriangle size={16} />{warning}</div>)}</div>
        </Card>
      </div>
    </>
  );
}

export function UserAccessPanel() {
  return (
    <>
      <PageHeader title="User Access" description="Review scoped role assignments, effective dates, approval source and assignment reason." />
      <Card className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-muted"><tr><th className="py-2">User</th><th>Role</th><th>Scope</th><th>Status</th><th>Reason</th></tr></thead>
          <tbody>{userRoleAssignments.map((assignment) => {
            const profile = profiles.find((item) => item.id === assignment.userId);
            const role = [...roles, ...authorityRoles].find((item) => item.id === assignment.roleId);
            return <tr key={assignment.id} className="border-t border-border"><td className="py-3">{profile?.fullName}</td><td>{role?.displayName}</td><td>{assignment.scopeType} {assignment.scopeId}</td><td><Badge tone={assignment.active ? "success" : "neutral"}>{assignment.active ? "active" : "inactive"}</Badge></td><td>{assignment.assignmentReason}</td></tr>;
          })}</tbody>
        </table>
      </Card>
    </>
  );
}

export function LeadershipPanel() {
  const simulation = simulateReferralRoute({ tenantId: "tenant-kings-grace", fromAssignmentId: "leader-branch-imaara", category: "counselling", sensitivity: "confidential", urgency: "soon" });
  return (
    <>
      <PageHeader title="Pastoral Hierarchy" description="Model reporting lines, positions, acting leaders, referral receivers and vacant offices without hard-coded church titles." />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <h2 className="text-lg font-semibold">Reporting line</h2>
          <div className="mt-4 grid gap-3">
            {leadershipAssignments.map((assignment) => {
              const position = leadershipPositions.find((item) => item.id === assignment.positionId);
              const profile = profiles.find((item) => item.id === assignment.userId);
              return <div key={assignment.id} className="rounded-md border border-border bg-surface-muted p-4" style={{ marginLeft: assignment.reportsToAssignmentId ? 24 : 0 }}><p className="font-semibold">{position?.title}</p><p className="text-sm text-muted">{profile?.fullName} · {assignment.status}</p></div>;
            })}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Referral simulator</h2>
          <p className="mt-3 text-sm leading-6 text-muted">{simulation.reason}</p>
          <p className="mt-4 font-semibold">Receiver: {profiles.find((item) => item.id === simulation.receiver?.userId)?.fullName ?? "No receiver"}</p>
          <div className="mt-5"><Badge tone="warning">Vacant positions: {leadershipPositions.filter((item) => item.status === "vacant").length}</Badge></div>
        </Card>
      </div>
    </>
  );
}

export function GovernancePanel() {
  const settings = governanceSettings[0];
  return (
    <>
      <PageHeader title="Governance Settings" description="Governance defaults guide approvals and escalation, but granular permissions and scopes remain authoritative." />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card><ShieldCheck className="text-accent" /><h2 className="mt-3 font-semibold">Governance model</h2><p className="mt-2 text-sm text-muted">{settings.governanceModel.replaceAll("_", " ")}</p></Card>
        <Card><UserCheck className="text-accent" /><h2 className="mt-3 font-semibold">Principal authority</h2><p className="mt-2 text-sm text-muted">{settings.principalAuthorityTitle} · {profiles.find((item) => item.id === settings.principalAuthorityUserId)?.fullName}</p></Card>
        <Card><AlertTriangle className="text-accent" /><h2 className="mt-3 font-semibold">Separation of duties</h2><p className="mt-2 text-sm text-muted">{settings.separationOfDutiesMode.replaceAll("_", " ")}</p></Card>
        <Card><Clock className="text-accent" /><h2 className="mt-3 font-semibold">Emergency authority</h2><p className="mt-2 text-sm text-muted">{settings.emergencyAuthorityEnabled ? "Enabled with audit requirement" : "Disabled"}</p></Card>
      </div>
    </>
  );
}

export function DelegationsPanel() {
  return (
    <>
      <PageHeader title="Delegations" description="Specific, scoped and time-limited authority grants. Delegation never exceeds the delegator's own effective authority." />
      <div className="mt-8 grid gap-4">{delegations.map((delegation) => <Card key={delegation.id}><div className="flex flex-wrap justify-between gap-3"><div><p className="font-semibold">{profiles.find((item) => item.id === delegation.delegateUserId)?.fullName}</p><p className="text-sm text-muted">{delegation.permissionKeys.join(", ")} · {delegation.scopeType} {delegation.scopeId}</p></div><Badge tone="success">{delegation.status}</Badge></div></Card>)}</div>
    </>
  );
}

export function ActingPanel() {
  return (
    <>
      <PageHeader title="Acting Appointments" description="Temporary selected-permission inheritance for unavailable leaders. Original authority resumes according to configured dates." />
      <EmptyPhase title="Acting Branch Pastor active" description="Amina Otieno is acting for Imaara Campus with selected branch, member-summary and programme visibility only." />
    </>
  );
}

export function WorkflowsPanel() {
  return (
    <>
      <PageHeader title="Approval Workflows" description="Generic workflow definitions support sequential, parallel, any-one and all-required approval patterns." />
      <div className="mt-8 grid gap-4">{approvalWorkflows.map((workflow) => <Card key={workflow.id}><h2 className="font-semibold">{workflow.name}</h2><p className="mt-2 text-sm text-muted">{workflow.actionType} · version {workflow.version}</p><div className="mt-4 grid gap-2">{workflow.steps.map((step) => <div key={step.id} className="rounded-md bg-surface-muted p-3 text-sm">Step {step.order}: {step.mode} · due in {step.dueHours}h</div>)}</div></Card>)}</div>
    </>
  );
}

export function ApprovalsPanel() {
  return (
    <>
      <PageHeader title="Approval Inbox" description="Approvers must load and validate the underlying request before acting. Notifications do not approve directly." />
      <div className="mt-8 grid gap-4">{approvalRequests.map((request) => <Link key={request.id} href={`approvals/${request.id}`} className="rounded-lg border border-border bg-surface p-5 shadow-sm"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-semibold">{request.summary}</p><p className="mt-1 text-sm text-muted">{request.reason}</p></div><Badge tone="warning">{request.status.replace("_", " ")}</Badge></div></Link>)}</div>
    </>
  );
}

export function ApprovalDetailPanel({ requestId }: { requestId: string }) {
  const request = approvalRequests.find((item) => item.id === requestId);
  if (!request) return <EmptyPhase title="Approval not found" description="The request may have been archived or belongs to another tenant." />;
  const history = getApprovalHistory(request.id);
  return (
    <>
      <PageHeader title={request.summary} description={request.reason} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card><h2 className="font-semibold">Decision controls</h2><div className="mt-4 flex flex-wrap gap-2">{["Approve", "Reject", "Return for revision", "Recuse"].map((item) => <button key={item} className="rounded-md border border-border px-3 py-2 text-sm font-semibold">{item}</button>)}</div></Card>
        <Card><h2 className="font-semibold">History</h2><div className="mt-4 grid gap-2">{history.map((item) => <div key={item.id} className="rounded-md bg-surface-muted p-3 text-sm">{item.decision}: {item.comment}</div>)}</div></Card>
      </div>
    </>
  );
}

export function AccessReviewsPanel() {
  return (
    <>
      <PageHeader title="Access Reviews" description="Review elevated, expired, dormant, tenant-wide, confidential and finance-authority access." />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {["Elevated permissions", "Expired assignment still active", "Delegation nearing expiry", "Tenant-wide scope", "Confidential access", "Finance approval rights"].map((item) => <Card key={item}><p className="font-semibold">{item}</p><p className="mt-2 text-sm text-muted">Outcome: retain, modify, revoke, suspend or request clarification.</p></Card>)}
      </div>
    </>
  );
}

export function EffectiveAccessPanel() {
  const effective = getEffectivePermissions("user-branch", "tenant-kings-grace");
  return (
    <>
      <PageHeader title="Effective Access Viewer" description="Shows access metadata only: source role, delegation, acting appointment, scope and expiry. It does not reveal confidential records." />
      <div className="mt-8 grid gap-3">{effective.map((item) => <Card key={`${item.sourceId}-${item.permission}`}><div className="flex gap-3"><KeyRound className="text-accent" size={18} /><div><p className="font-semibold">{item.permission}</p><p className="mt-1 text-sm text-muted">{item.explanation}</p></div></div></Card>)}</div>
    </>
  );
}

export function DiagnosticPanel() {
  const decision = authorizationDiagnostic("user-branch", "programme.approve", { tenantId: "tenant-kings-grace", scopeType: "branch", scopeId: "branch-imaara" });
  return (
    <>
      <PageHeader title="Authorization Diagnostic Tool" description="Test a user, permission and target scope without changing access. Diagnostic access is auditable." />
      <Card className="mt-8">
        <div className="flex items-center gap-3">{decision.allowed ? <CheckCircle2 className="text-success" /> : <AlertTriangle className="text-warning" />}<p className="font-semibold">{decision.allowed ? "Allowed" : "Denied"}</p></div>
        <p className="mt-3 text-sm leading-6 text-muted">{decision.reason}</p>
      </Card>
    </>
  );
}

export function LimitsPanel() {
  return (
    <>
      <PageHeader title="Authority Limits" description="Reusable amount and approval-stage limits for finance, projects, procurement and programme payments." />
      <div className="mt-8 grid gap-4">{authorityLimits.map((limit) => <Card key={limit.id}><div className="flex flex-wrap justify-between gap-3"><p className="font-semibold">{[...roles, ...authorityRoles].find((role) => role.id === limit.roleId)?.displayName}</p><Badge tone="accent">{limit.currency} {limit.maxAmount.toLocaleString()}</Badge></div><p className="mt-2 text-sm text-muted">{limit.permissionKey} · {limit.transactionType} · {limit.scopeType}</p></Card>)}</div>
    </>
  );
}

export function SeparationPanel() {
  return (
    <Card>
      <h2 className="text-lg font-semibold">Separation-of-duties rules</h2>
      <div className="mt-4 grid gap-2">{separationOfDutiesRules.map((rule) => <div key={rule.id} className="rounded-md bg-surface-muted p-3 text-sm"><p className="font-medium">{rule.firstPermission} + {rule.secondPermission}</p><p className="text-muted">{rule.mode}: {rule.description}</p></div>)}</div>
    </Card>
  );
}
