import { ArrowRight, Building2, LockKeyhole, Network, ShieldCheck } from "lucide-react";
import { productPrinciples } from "@/lib/constants";
import { MarketingShell } from "@/components/shells";
import { ButtonLink, Card } from "@/components/ui";

export default function Home() {
  return (
    <MarketingShell>
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-normal text-primary md:text-6xl">
            KingdomFlow
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            A calm, secure and denomination-neutral operating system foundation for church ministry, discipleship, member care, structure and administration.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/onboarding">Create church account</ButtonLink>
            <ButtonLink href="/workspace/kings-grace" variant="secondary">Open demo workspace</ButtonLink>
          </div>
        </div>
        <Card className="bg-primary text-white">
          <div className="flex items-center gap-3">
            <ShieldCheck />
            <p className="font-semibold">Prompt 1 foundation</p>
          </div>
          <dl className="mt-6 grid gap-4 text-sm">
            <div className="flex justify-between border-b border-white/20 pb-3"><dt>Tenant isolation</dt><dd>RLS ready</dd></div>
            <div className="flex justify-between border-b border-white/20 pb-3"><dt>Authorization</dt><dd>Permission keys</dd></div>
            <div className="flex justify-between border-b border-white/20 pb-3"><dt>Audit trail</dt><dd>Immutable model</dd></div>
            <div className="flex justify-between"><dt>Billing</dt><dd>Plan foundation</dd></div>
          </dl>
        </Card>
      </section>
      <section className="border-y border-border bg-surface px-6 py-12">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {[
            [Building2, "Church autonomy", "Every tenant owns its branding, terminology, structure, workflows and data."],
            [Network, "Flexible structure", "Unlimited organization units support branches, cells, regions, programmes and custom models."],
            [LockKeyhole, "Privacy by design", "Server authorization, RLS policies, scoped roles and audit logs are designed in from the start."],
          ].map(([Icon, title, text]) => (
            <Card key={String(title)}>
              <Icon className="text-accent" />
              <h2 className="mt-4 text-lg font-semibold">{title as string}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{text as string}</p>
            </Card>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div>
            <h2 className="text-2xl font-semibold">Product principles</h2>
            <p className="mt-3 text-sm leading-6 text-muted">These are documented and reflected in the platform architecture.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {productPrinciples.map((principle) => (
              <div key={principle} className="flex gap-3 rounded-lg border border-border bg-surface p-4 text-sm leading-6">
                <ArrowRight className="mt-1 shrink-0 text-accent" size={16} />
                <span>{principle}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
