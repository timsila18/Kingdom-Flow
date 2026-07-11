import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/shells";
import { Badge, Card, PageHeader } from "@/components/ui";
import { branches, getTenantBySlug } from "@/lib/data";

export default async function BranchesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  const tenantBranches = branches.filter((branch) => branch.tenantId === tenant.id);
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <PageHeader title={`${tenant.branchTerminology} directory`} description="Branch and campus profiles are backed by generic organization units and prepared for scope-aware access control." />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {tenantBranches.map((branch) => (
          <Card key={branch.id}>
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="text-lg font-semibold">{branch.name}</h2><p className="mt-1 text-sm text-muted">{branch.address}</p></div>
              <Badge tone={branch.status === "active" ? "success" : "warning"}>{branch.status}</Badge>
            </div>
            <dl className="mt-5 grid gap-2 text-sm">
              <div><dt className="text-muted">Leader</dt><dd>{branch.leaderName}</dd></div>
              <div><dt className="text-muted">Administrator</dt><dd>{branch.administratorName}</dd></div>
              <div><dt className="text-muted">Service times</dt><dd>{branch.serviceTimes.join(", ")}</dd></div>
              <div><dt className="text-muted">Payment instructions</dt><dd>Placeholder reserved for future finance integration.</dd></div>
            </dl>
          </Card>
        ))}
      </div>
    </WorkspaceShell>
  );
}
