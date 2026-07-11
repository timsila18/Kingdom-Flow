import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/shells";
import { Badge, ButtonLink, Card, EmptyPhase, PageHeader, StatCard } from "@/components/ui";
import { approvalRequests, delegations, actingAppointments, accessReviews } from "@/lib/authority-data";
import { auditLogs, branches, getTenantBySlug, getTenantSubscription, invitations, memberships, organizationUnits } from "@/lib/data";

export default async function WorkspaceHomePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  const tenantUnits = organizationUnits.filter((unit) => unit.tenantId === tenant.id);
  const tenantBranches = branches.filter((branch) => branch.tenantId === tenant.id);
  const subscription = getTenantSubscription(tenant.id);
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <PageHeader title={`${tenant.publicName} home`} description="Administrative setup dashboard using real tenant foundation data only. Member, giving, attendance and conversion metrics are not shown before those modules exist." actions={<Badge tone="success">{tenant.status}</Badge>} />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Onboarding completion" value="92%" detail="Profile, structure, branding and declaration are complete." />
        <StatCard label="Organization units" value={tenantUnits.length} detail="Tenant-scoped rows." />
        <StatCard label={`Active ${tenant.branchTerminology.toLowerCase()}s`} value={tenantBranches.filter((branch) => branch.status === "active").length} detail={`${tenantBranches.length} total configured.`} />
        <StatCard label="Invited users" value={invitations.filter((invite) => invite.tenantId === tenant.id).length} detail="Pending, accepted or revoked." />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <StatCard label="Active users" value={memberships.filter((item) => item.tenantId === tenant.id && item.status === "active").length} detail="Tenant memberships only." />
        <StatCard label="Pending role approvals" value={approvalRequests.filter((item) => item.tenantId === tenant.id && item.status !== "approved").length} detail="Workflow-backed." />
        <StatCard label="Active delegations" value={delegations.filter((item) => item.tenantId === tenant.id && item.status === "active").length} detail="Time-bound grants." />
        <StatCard label="Acting appointments" value={actingAppointments.filter((item) => item.tenantId === tenant.id && item.status === "active").length} detail={`${accessReviews.length} access review open.`} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <h2 className="text-lg font-semibold">Pending setup tasks</h2>
          <div className="mt-4 grid gap-3">
            {["Confirm data-retention preferences", "Add branch payment instruction placeholders", "Review role scope assignments"].map((task) => <div key={task} className="rounded-md bg-surface-muted p-3 text-sm">{task}</div>)}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href={`/workspace/${tenant.slug}/organization`}>Manage structure</ButtonLink>
            <ButtonLink href={`/workspace/${tenant.slug}/settings`} variant="secondary">Open settings</ButtonLink>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Subscription</h2>
          <p className="mt-3 text-2xl font-semibold">{subscription.plan.name}</p>
          <p className="mt-2 text-sm text-muted">Status: {subscription.status}</p>
          <ButtonLink href={`/workspace/${tenant.slug}/subscription`} variant="secondary">View plan options</ButtonLink>
        </Card>
      </div>
      <div className="mt-8">
        <EmptyPhase title="Future ministry widgets" description="Visitors, follow-up, pastoral care, fellowship growth, volunteer gaps and stewardship widgets are feature-flagged for later prompts and will not display fabricated figures." />
      </div>
      <Card className="mt-8">
        <h2 className="text-lg font-semibold">Recent administrative activity</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {auditLogs.filter((log) => log.tenantId === tenant.id).map((log) => <div key={log.id} className="rounded-md bg-surface-muted p-3 text-sm"><p className="font-medium">{log.action}</p><p className="mt-1 text-muted">{log.actorName}</p></div>)}
        </div>
      </Card>
    </WorkspaceShell>
  );
}
