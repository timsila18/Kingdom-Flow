import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/shells";
import { Badge, Card, PageHeader } from "@/components/ui";
import { getTenantBySlug, invitations, memberships, profiles, roles } from "@/lib/data";

export default async function UsersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  const tenantMemberships = memberships.filter((membership) => membership.tenantId === tenant.id);
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <PageHeader title="Users foundation" description="Invite-based workspace membership with role and scope assignment. Membership is never created merely because an email was typed." />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <h2 className="text-lg font-semibold">Active users</h2>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-muted"><tr><th className="py-2">Name</th><th>Email</th><th>Status</th><th>Roles</th></tr></thead>
            <tbody>{tenantMemberships.map((membership) => {
              const profile = profiles.find((item) => item.id === membership.userId);
              const assignedRoles = membership.roleIds.map((roleId) => roles.find((role) => role.id === roleId)?.displayName).filter(Boolean).join(", ");
              return <tr key={membership.id} className="border-t border-border"><td className="py-3">{profile?.fullName}</td><td>{profile?.email}</td><td><Badge tone="success">{membership.status}</Badge></td><td>{assignedRoles}</td></tr>;
            })}</tbody>
          </table>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Invite user</h2>
          <form className="mt-4 grid gap-3" action="/auth/accept-invitation/kf-demo-invite">
            <input className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground" placeholder="Email address" type="email" />
            <select className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground">{roles.map((role) => <option key={role.id}>{role.displayName}</option>)}</select>
            <select className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground"><option>Tenant scope</option><option>Branch scope</option><option>Unit scope</option></select>
            <textarea className="min-h-24 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground" placeholder="Optional welcome message" />
            <button className="rounded-md border border-accent/70 bg-primary px-4 py-2.5 text-sm font-semibold text-black">Create secure invitation</button>
          </form>
          <div className="mt-5 text-sm text-muted">Pending: {invitations.filter((invite) => invite.tenantId === tenant.id && invite.status === "pending").length}</div>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
