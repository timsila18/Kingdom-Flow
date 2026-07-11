import { PlatformShell } from "@/components/shells";
import { Card, PageHeader } from "@/components/ui";
import { subscriptionPlans } from "@/lib/constants";

export default function PlatformPlansPage() {
  return (
    <PlatformShell>
      <PageHeader title="Subscription plans" description="Plan catalog for manual platform assignment in Prompt 1. Live charging is reserved for a future billing phase." />
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {subscriptionPlans.map((plan) => (
          <Card key={plan.id}>
            <h2 className="font-semibold">{plan.name}</h2>
            <p className="mt-2 text-sm text-muted">{plan.minActivePeople.toLocaleString()} {plan.maxActivePeople ? `- ${plan.maxActivePeople.toLocaleString()}` : "+"} monthly active people</p>
            <p className="mt-4 text-2xl font-semibold">{plan.monthlyKes === undefined ? "Custom" : `KSh ${plan.monthlyKes.toLocaleString()}`}</p>
          </Card>
        ))}
      </div>
    </PlatformShell>
  );
}
