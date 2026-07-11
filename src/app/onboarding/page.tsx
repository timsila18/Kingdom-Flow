import { MarketingShell } from "@/components/shells";
import { Badge, ButtonLink, Card, PageHeader } from "@/components/ui";

const steps = ["Ministry identity", "Leadership", "Organizational model", "Size and subscription", "Branding", "Initial structure", "Review and declaration"];

export default function OnboardingPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-7xl px-6 py-10">
        <PageHeader title="Create church account" description="A resumable onboarding wizard for registering a tenant, capturing leadership, structure, branding and declarations without assuming one church model." actions={<Badge tone="accent">Auto approval allowed only outside production</Badge>} />
        <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
          <Card>
            <ol className="grid gap-3 text-sm">
              {steps.map((step, index) => <li key={step} className="flex items-center gap-3"><span className="grid size-7 place-items-center rounded-full bg-primary-soft text-xs font-semibold">{index + 1}</span>{step}</li>)}
            </ol>
          </Card>
          <Card>
            <form className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">Ministry / church name<input className="rounded-md border border-border px-3 py-2" defaultValue="Hope Assembly" /></label>
                <label className="grid gap-2 text-sm font-medium">Preferred slug<input className="rounded-md border border-border px-3 py-2" defaultValue="hope-assembly" /></label>
                <label className="grid gap-2 text-sm font-medium">Country<input className="rounded-md border border-border px-3 py-2" defaultValue="Kenya" /></label>
                <label className="grid gap-2 text-sm font-medium">County / region<input className="rounded-md border border-border px-3 py-2" defaultValue="Kiambu County" /></label>
                <label className="grid gap-2 text-sm font-medium">Principal leader title<input className="rounded-md border border-border px-3 py-2" defaultValue="Senior Pastor" /></label>
                <label className="grid gap-2 text-sm font-medium">Preferred branch label<input className="rounded-md border border-border px-3 py-2" defaultValue="Branch" /></label>
              </div>
              <fieldset className="rounded-lg border border-border p-4">
                <legend className="px-2 text-sm font-semibold">Declarations</legend>
                {["I am authorized to register this church.", "The church controls its ministry data.", "KingdomFlow is a technology platform, not a spiritual authority."].map((item) => (
                  <label key={item} className="mt-3 flex gap-3 text-sm"><input type="checkbox" required />{item}</label>
                ))}
              </fieldset>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-md border border-border px-4 py-2.5 text-sm font-semibold">Save draft</button>
                <button className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white">Submit for review</button>
                <ButtonLink href="/auth/pending" variant="secondary">View status</ButtonLink>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </MarketingShell>
  );
}
