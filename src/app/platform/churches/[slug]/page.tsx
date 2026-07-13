import { notFound } from "next/navigation";
import { PlatformShell } from "@/components/shells";
import { Badge, Card, PageHeader } from "@/components/ui";
import { getTenantSubscription } from "@/lib/data";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function PlatformChurchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  const subscription = getTenantSubscription(tenant.id);
  return (
    <PlatformShell>
      <PageHeader title={tenant.publicName} description="Platform admins can inspect non-confidential tenant metadata and take audited approval actions. Confidential pastoral/member records are intentionally not exposed here." actions={<Badge tone="accent">{tenant.status.replace("_", " ")}</Badge>} />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Registration summary</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div><dt className="text-muted">Legal name</dt><dd className="font-medium">{tenant.legalName}</dd></div>
            <div><dt className="text-muted">Contact</dt><dd className="font-medium">{tenant.contactEmail} · {tenant.contactPhone}</dd></div>
            <div><dt className="text-muted">Region</dt><dd className="font-medium">{tenant.country}, {tenant.region}</dd></div>
            <div><dt className="text-muted">Plan</dt><dd className="font-medium">{subscription.plan.name}</dd></div>
          </dl>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Audited actions</h2>
          <form className="mt-4 grid gap-3" action={`/platform/churches/${tenant.slug}/action`} method="post">
            <textarea name="reason" className="min-h-28 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground" placeholder="Reason required for approval, clarification, rejection, suspension or reactivation." />
            <div className="flex flex-wrap gap-2">
              <button name="decision" value="approve" className="rounded-md border border-border px-3 py-2 text-sm font-semibold hover:border-accent">Approve</button>
              <button name="decision" value="clarification" className="rounded-md border border-border px-3 py-2 text-sm font-semibold hover:border-accent">Request clarification</button>
              <button name="decision" value="reject" className="rounded-md border border-border px-3 py-2 text-sm font-semibold hover:border-accent">Reject</button>
              <button name="decision" value="suspend" className="rounded-md border border-border px-3 py-2 text-sm font-semibold hover:border-accent">Suspend</button>
              <button name="decision" value="reactivate" className="rounded-md border border-border px-3 py-2 text-sm font-semibold hover:border-accent">Reactivate</button>
            </div>
          </form>
        </Card>
      </div>
    </PlatformShell>
  );
}
