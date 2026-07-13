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
            <form className="grid gap-5" action="/onboarding/submit" method="post">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">Ministry / church name<input name="publicName" className="rounded-md border border-border bg-surface px-3 py-2 text-foreground" defaultValue="Hope Assembly" required /></label>
                <label className="grid gap-2 text-sm font-medium">Legal name<input name="legalName" className="rounded-md border border-border bg-surface px-3 py-2 text-foreground" defaultValue="Hope Assembly" required /></label>
                <label className="grid gap-2 text-sm font-medium">Preferred slug<input name="slug" className="rounded-md border border-border bg-surface px-3 py-2 text-foreground" defaultValue="hope-assembly" required /></label>
                <label className="grid gap-2 text-sm font-medium">Contact email<input name="contactEmail" type="email" className="rounded-md border border-border bg-surface px-3 py-2 text-foreground" defaultValue="hello@hope.test" required /></label>
                <label className="grid gap-2 text-sm font-medium">Contact phone<input name="contactPhone" className="rounded-md border border-border bg-surface px-3 py-2 text-foreground" defaultValue="+254700000002" /></label>
                <label className="grid gap-2 text-sm font-medium">Country<input name="country" className="rounded-md border border-border bg-surface px-3 py-2 text-foreground" defaultValue="Kenya" /></label>
                <label className="grid gap-2 text-sm font-medium">County / region<input name="region" className="rounded-md border border-border bg-surface px-3 py-2 text-foreground" defaultValue="Kiambu County" /></label>
                <label className="grid gap-2 text-sm font-medium">Physical address<input name="physicalAddress" className="rounded-md border border-border bg-surface px-3 py-2 text-foreground" defaultValue="Ruiru" /></label>
                <label className="grid gap-2 text-sm font-medium">Principal leader title<input name="ministryHeadTitle" className="rounded-md border border-border bg-surface px-3 py-2 text-foreground" defaultValue="Senior Pastor" /></label>
                <label className="grid gap-2 text-sm font-medium">Preferred branch label<input name="branchTerminology" className="rounded-md border border-border bg-surface px-3 py-2 text-foreground" defaultValue="Branch" /></label>
              </div>
              <fieldset className="rounded-lg border border-border p-4">
                <legend className="px-2 text-sm font-semibold">Declarations</legend>
                {["I am authorized to register this church.", "The church controls its ministry data.", "KingdomFlow is a technology platform, not a spiritual authority."].map((item) => (
                  <label key={item} className="mt-3 flex gap-3 text-sm"><input type="checkbox" required />{item}</label>
                ))}
              </fieldset>
              <div className="flex flex-wrap gap-3">
                <button name="intent" value="draft" className="rounded-md border border-border px-4 py-2.5 text-sm font-semibold">Save draft</button>
                <button name="intent" value="submit" className="rounded-md border border-accent/70 bg-primary px-4 py-2.5 text-sm font-semibold text-black">Submit for review</button>
                <ButtonLink href="/auth/pending" variant="secondary">View status</ButtonLink>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </MarketingShell>
  );
}
