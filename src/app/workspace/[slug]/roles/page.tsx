import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/shells";
import { Badge, Card, PageHeader } from "@/components/ui";
import { permissionKeys, systemRoleTemplates } from "@/lib/constants";
import { roles } from "@/lib/data";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function RolesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  const tenantRoles = roles.filter((role) => role.tenantId === tenant.id);
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      <PageHeader title="Roles & permissions foundation" description="Permission checks use keys and scopes rather than hard-coded role names. Display titles can later be renamed per church." />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <h2 className="text-lg font-semibold">Configured roles</h2>
          <div className="mt-4 grid gap-3">
            {tenantRoles.map((role) => <div key={role.id} className="rounded-md bg-surface-muted p-4"><div className="flex justify-between gap-3"><p className="font-semibold">{role.displayName}</p><Badge>{role.permissions.length} permissions</Badge></div><p className="mt-2 text-xs text-muted">{role.permissions.join(", ")}</p></div>)}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">System templates</h2>
          <div className="mt-4 grid gap-2 text-sm text-muted">{systemRoleTemplates.map((role) => <div key={role} className="rounded-md border border-border px-3 py-2">{role}</div>)}</div>
          <h3 className="mt-6 text-sm font-semibold">Permission catalog</h3>
          <p className="mt-2 text-xs leading-5 text-muted">{permissionKeys.join(", ")}</p>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
