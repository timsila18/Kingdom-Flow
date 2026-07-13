import { AuthShell } from "@/components/shells";
import { ButtonLink, Card } from "@/components/ui";
import { getVisibleTenants } from "@/lib/tenant-store";

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
      <div className="mt-5">
        <ButtonLink href="/auth/test-logins" variant="secondary">View test logins</ButtonLink>
      </div>
    </AuthShell>
  );
}
