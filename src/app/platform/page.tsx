import { PlatformShell } from "@/components/shells";
import { Badge, ButtonLink, Card, PageHeader, StatCard } from "@/components/ui";
import { auditLogs } from "@/lib/data";
import { getVisibleTenants } from "@/lib/tenant-store";

export default async function PlatformPage() {
  const tenants = await getVisibleTenants();
  const pending = tenants.filter((tenant) => tenant.status === "under_review").length;
  const approved = tenants.filter((tenant) => tenant.status === "approved").length;
  return (
    <PlatformShell>
      <PageHeader title="Platform administration" description="Visible and audited platform operations for church registration review, plan assignment and tenant metadata oversight." actions={<ButtonLink href="/platform/churches">Review churches</ButtonLink>} />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Registered churches" value={tenants.length} detail="Uses tenant records only." />
        <StatCard label="Pending approval" value={pending} detail="Submitted or under review." />
        <StatCard label="Approved churches" value={approved} detail="Active workspaces." />
        <StatCard label="Suspended churches" value={tenants.filter((tenant) => tenant.status === "suspended").length} detail="No demo suspensions seeded." />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <h2 className="text-lg font-semibold">Church review queue</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted"><tr><th className="py-2">Church</th><th>Status</th><th>Region</th><th>Action</th></tr></thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="border-t border-border">
                    <td className="py-3 font-medium">{tenant.publicName}</td>
                    <td><Badge tone={tenant.status === "approved" ? "success" : tenant.status === "rejected" || tenant.status === "suspended" ? "danger" : "warning"}>{tenant.status.replace("_", " ")}</Badge></td>
                    <td>{tenant.region}</td>
                    <td><ButtonLink href={`/platform/churches/${tenant.slug}`} variant="secondary">Inspect</ButtonLink></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Recent platform audit</h2>
          <div className="mt-4 grid gap-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="rounded-md bg-surface-muted p-3 text-sm">
                <p className="font-medium">{log.action}</p>
                <p className="mt-1 text-muted">{log.actorName} · {new Date(log.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PlatformShell>
  );
}
