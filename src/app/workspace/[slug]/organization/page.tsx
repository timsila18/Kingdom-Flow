import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/shells";
import { Badge, ButtonLink, Card, PageHeader } from "@/components/ui";
import { getTenantBySlug, organizationUnits } from "@/lib/data";

export default async function OrganizationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  const units = organizationUnits.filter((unit) => unit.tenantId === tenant.id).sort((a, b) => a.reportingOrder - b.reportingOrder);
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <PageHeader title="Organizational structure" description="A generic hierarchy builder for regions, branches, cells, departments, programmes and custom units. Circular moves are blocked by domain logic and database triggers." actions={<ButtonLink href={`/workspace/${tenant.slug}/branches`}>View branches</ButtonLink>} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <h2 className="text-lg font-semibold">Tree view</h2>
          <div className="mt-4 grid gap-3">
            {units.map((unit) => (
              <div key={unit.id} className="rounded-md border border-border bg-surface-muted p-4" style={{ marginLeft: unit.parentId ? 24 : 0 }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><p className="font-semibold">{unit.name}</p><p className="text-sm text-muted">{unit.unitType} · {unit.code}</p></div>
                  <Badge tone={unit.status === "active" ? "success" : "neutral"}>{unit.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Create unit</h2>
          <form className="mt-4 grid gap-3" action={`/workspace/${tenant.slug}/organization`}>
            <input className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground" placeholder="Unit name" />
            <input className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground" placeholder="Code" />
            <select className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground"><option>branch</option><option>region</option><option>cell</option><option>department</option><option>custom</option></select>
            <button className="rounded-md border border-accent/70 bg-primary px-4 py-2.5 text-sm font-semibold text-black">Create audited unit</button>
          </form>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
