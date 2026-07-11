import { notFound } from "next/navigation";
import { SeparationPanel } from "@/components/authority";
import { WorkspaceShell } from "@/components/shells";
import { Badge, Card, PageHeader } from "@/components/ui";
import { getAllRoles, getRoleWarnings } from "@/lib/authority-engine";
import { profiles, getTenantBySlug } from "@/lib/data";

export default async function RoleDetailPage({ params }: { params: Promise<{ slug: string; roleId: string }> }) {
  const { slug, roleId } = await params;
  const tenant = getTenantBySlug(slug);
  const role = getAllRoles().find((item) => item.id === roleId);
  if (!tenant || !role) notFound();
  const warnings = getRoleWarnings(role.permissions);
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <PageHeader title={role.displayName} description={role.description ?? "Role details, current holders and change history."} actions={<Badge tone={role.systemTemplate ? "accent" : "neutral"}>{role.systemTemplate ? "Template" : "Custom"}</Badge>} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <h2 className="text-lg font-semibold">Permissions</h2>
          <div className="mt-4 flex flex-wrap gap-2">{role.permissions.map((permission) => <Badge key={permission}>{permission}</Badge>)}</div>
          <h3 className="mt-6 font-semibold">Warnings</h3>
          <div className="mt-3 grid gap-2 text-sm text-muted">{warnings.length ? warnings.map((warning) => <p key={warning}>{warning}</p>) : <p>No dependency or conflict warnings.</p>}</div>
        </Card>
        <div className="grid gap-6">
          <Card><h2 className="text-lg font-semibold">Current holders</h2><p className="mt-3 text-sm text-muted">{profiles.find((profile) => profile.id === "user-admin")?.fullName} and scoped users where assigned.</p></Card>
          <SeparationPanel />
        </div>
      </div>
    </WorkspaceShell>
  );
}
