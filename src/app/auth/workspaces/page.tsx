import { AuthShell } from "@/components/shells";
import { ButtonLink, Card } from "@/components/ui";
import { tenants } from "@/lib/data";

export default function WorkspaceSelectorPage() {
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
    </AuthShell>
  );
}
