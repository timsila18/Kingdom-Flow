import { PlatformShell } from "@/components/shells";
import { Badge, ButtonLink, Card, PageHeader, StatCard } from "@/components/ui";
import { getVisibleTenants } from "@/lib/tenant-store";

export const dynamic = "force-dynamic";

export default async function PlatformPage() {
  const tenants = await getVisibleTenants();
  const pending = tenants.filter((tenant) => tenant.status === "under_review").length;
  const approved = tenants.filter((tenant) => tenant.status === "approved").length;

  return (
    <PlatformShell>
      <PageHeader title="Platform administration" description="Visible and audited platform operations for church registration review, plan assignment and tenant metadata oversight." actions={<ButtonLink href="/platform/churches">Review churches</ButtonLink>} />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Registered churches" value={tenants.length} detail="Submitted tenant records." />
        <StatCard label="Pending approval" value={pending} detail="Submitted or under review." />
        <StatCard label="Approved churches" value={approved} detail="Active workspaces." />
        <StatCard label="Suspended churches" value={tenants.filter((tenant) => tenant.status === "suspended").length} detail="Temporarily unavailable workspaces." />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <h2 className="text-lg font-semibold">Church review queue</h2>
          <div className="mt-4 overflow-x-auto">
            {tenants.length ? (
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
            ) : (
              <p className="py-6 text-sm text-muted">No church registrations have been submitted yet.</p>
            )}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Recent platform audit</h2>
          <p className="mt-4 text-sm leading-6 text-muted">Audit entries will appear after real platform actions are recorded.</p>
        </Card>
      </div>
    </PlatformShell>
  );
}
