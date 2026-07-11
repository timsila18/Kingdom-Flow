import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/shells";
import { Card, PageHeader } from "@/components/ui";
import { subscriptionPlans } from "@/lib/constants";
import { getTenantBySlug, getTenantSubscription } from "@/lib/data";

export default async function SubscriptionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  const current = getTenantSubscription(tenant.id);
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <PageHeader title="Subscription overview" description={`Current plan: ${current.plan.name}. Live M-Pesa charging is not implemented in Prompt 1.`} />
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {subscriptionPlans.map((plan) => (
          <Card key={plan.id} className={plan.id === current.plan.id ? "border-accent" : ""}>
            <h2 className="font-semibold">{plan.name}</h2>
            <p className="mt-2 text-sm text-muted">{plan.minActivePeople.toLocaleString()} {plan.maxActivePeople ? `- ${plan.maxActivePeople.toLocaleString()}` : "+"} monthly active people</p>
            <p className="mt-4 text-2xl font-semibold">{plan.monthlyKes === undefined ? "Custom" : `KSh ${plan.monthlyKes.toLocaleString()}`}</p>
            <p className="mt-2 text-xs text-muted">{plan.annualKes === undefined ? "Annual terms by agreement" : `KSh ${plan.annualKes.toLocaleString()} yearly`}</p>
          </Card>
        ))}
      </div>
    </WorkspaceShell>
  );
}
