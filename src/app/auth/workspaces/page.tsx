import { AuthShell } from "@/components/shells";
import { ButtonLink, Card } from "@/components/ui";
import { getVisibleTenants } from "@/lib/tenant-store";

export const dynamic = "force-dynamic";

export default async function WorkspaceSelectorPage() {
  const tenants = await getVisibleTenants();
  return (
    <AuthShell title="Select workspace">
      <div className="grid gap-3">
        {tenants.map((tenant) => (
          <Card key={tenant.id}>
            <p className="font-semibold">{tenant.publicName}</p>
            <p className="mt-1 text-sm text-muted">{tenant.status.replace("_", " ")}</p>
            <div className="mt-4"><ButtonLink href={`/workspace/${tenant.slug}`}>Open workspace</ButtonLink></div>
          </Card>
        ))}
      </div>
      {!tenants.length ? <p className="mt-5 text-sm leading-6 text-muted">No approved church workspaces are available yet.</p> : null}
    </AuthShell>
  );
}
