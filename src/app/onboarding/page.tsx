import { MarketingShell } from "@/components/shells";
import { Badge, ButtonLink, Card, PageHeader } from "@/components/ui";

const steps = ["Ministry identity", "Leadership", "Organizational model", "Size and subscription", "Branding", "Initial structure", "Review and declaration"];

const inputClass = "rounded-md border border-border bg-surface px-3 py-2 text-foreground";
const labelClass = "grid gap-2 text-sm font-medium";

function Section({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-lg border border-border/80 bg-surface-muted/30 p-4">
      <legend className="px-2 text-sm font-semibold text-accent">{number}. {title}</legend>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export default function OnboardingPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-7xl px-6 py-10">
        <PageHeader title="Create church account" description="A complete church onboarding flow for identity, leadership, governance, size, branding, structure, departments and declarations." actions={<Badge tone="accent">Super admin review required</Badge>} />
        <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
          <Card className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
            <ol className="grid gap-3 text-sm">
              {steps.map((step, index) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-semibold">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <form className="grid gap-6" action="/onboarding/submit" method="post">
              <Section number={1} title="Ministry Identity">
                <label className={labelClass}>Ministry / church name<input name="publicName" className={inputClass} defaultValue="Hope Assembly" required /></label>
                <label className={labelClass}>Legal name<input name="legalName" className={inputClass} defaultValue="Hope Assembly" required /></label>
                <label className={labelClass}>Preferred workspace slug<input name="slug" className={inputClass} defaultValue="hope-assembly" required /></label>
                <label className={labelClass}>Church type<select name="churchType" className={inputClass} defaultValue="Independent church"><option>Independent church</option><option>Denominational church</option><option>Multi-branch church</option><option>Church plant</option><option>Fellowship ministry</option></select></label>
                <label className={labelClass}>Denomination / network<input name="denominationOrNetwork" className={inputClass} defaultValue="Independent" /></label>
                <label className={labelClass}>Founding year<input name="foundingYear" className={inputClass} defaultValue="2024" /></label>
                <label className={labelClass}>Country<input name="country" className={inputClass} defaultValue="Kenya" /></label>
                <label className={labelClass}>County / region<input name="region" className={inputClass} defaultValue="Kiambu County" /></label>
                <label className={labelClass}>Physical address<input name="physicalAddress" className={inputClass} defaultValue="Ruiru" /></label>
                <label className={labelClass}>Website / social page<input name="website" className={inputClass} defaultValue="https://example.org" /></label>
              </Section>

              <Section number={2} title="Leadership">
                <label className={labelClass}>Principal leader title<input name="ministryHeadTitle" className={inputClass} defaultValue="Senior Pastor" /></label>
                <label className={labelClass}>Principal leader name<input name="principalLeaderName" className={inputClass} defaultValue="Pastor Grace Wanjiku" /></label>
                <label className={labelClass}>Leader email<input name="principalLeaderEmail" type="email" className={inputClass} defaultValue="pastor@hope.test" /></label>
                <label className={labelClass}>Leader phone<input name="principalLeaderPhone" className={inputClass} defaultValue="+254700000003" /></label>
                <label className={labelClass}>Church contact email<input name="contactEmail" type="email" className={inputClass} defaultValue="hello@hope.test" required /></label>
                <label className={labelClass}>Church contact phone<input name="contactPhone" className={inputClass} defaultValue="+254700000002" /></label>
              </Section>

              <Section number={3} title="Organizational Model">
                <label className={labelClass}>Governance model<select name="governanceModel" className={inputClass} defaultValue="Senior pastor led"><option>Senior pastor led</option><option>Founder led</option><option>Board governed</option><option>Council governed</option><option>Bishop / overseer led</option><option>Hybrid</option></select></label>
                <label className={labelClass}>Approval model<select name="approvalModel" className={inputClass} defaultValue="Two-person approval for sensitive actions"><option>Single admin for routine actions</option><option>Two-person approval for sensitive actions</option><option>Board approval for finance</option><option>Pastor approval for ministry changes</option><option>Custom workflow</option></select></label>
                <label className={labelClass}>Preferred branch label<input name="branchTerminology" className={inputClass} defaultValue="Branch" /></label>
                <label className={labelClass}>Preferred member label<input name="membershipTerminology" className={inputClass} defaultValue="Member" /></label>
                <label className={labelClass}>Preferred small-group label<input name="smallGroupTerminology" className={inputClass} defaultValue="Fellowship" /></label>
                <label className={labelClass}>Primary service day<input name="primaryServiceDay" className={inputClass} defaultValue="Sunday" /></label>
              </Section>

              <Section number={4} title="Size And Subscription">
                <label className={labelClass}>Estimated members<input name="estimatedMembers" type="number" min="0" className={inputClass} defaultValue="250" /></label>
                <label className={labelClass}>Average weekly attendance<input name="averageAttendance" type="number" min="0" className={inputClass} defaultValue="180" /></label>
                <label className={labelClass}>Branches planned<input name="branchesPlanned" type="number" min="1" className={inputClass} defaultValue="1" /></label>
                <label className={labelClass}>Subscription tier<select name="subscriptionTier" className={inputClass} defaultValue="Starter"><option>Starter</option><option>Growth</option><option>Multi-Branch</option><option>Network / Diocese</option></select></label>
              </Section>

              <Section number={5} title="Branding">
                <label className={labelClass}>Brand tone<select name="brandTone" className={inputClass} defaultValue="Warm, dignified and modern"><option>Warm, dignified and modern</option><option>Traditional and formal</option><option>Youthful and expressive</option><option>Minimal and administrative</option></select></label>
                <label className={labelClass}>Logo status<select name="logoStatus" className={inputClass} defaultValue="Use default KingdomFlow mark until uploaded"><option>Use default KingdomFlow mark until uploaded</option><option>Logo ready for upload</option><option>Needs design help</option></select></label>
              </Section>

              <Section number={6} title="Initial Structure">
                <label className={labelClass}>First branch / campus name<input name="firstBranchName" className={inputClass} defaultValue="Main Branch" /></label>
                <label className={labelClass}>First branch location<input name="firstBranchLocation" className={inputClass} defaultValue="Ruiru" /></label>
                <label className={`${labelClass} md:col-span-2`}>Departments to create<textarea name="departments" className={`${inputClass} min-h-28`} defaultValue={"Worship\nUshers\nMedia\nChildren\nDiscipleship\nPastoral Care\nFinance\nAdministration"} /></label>
                <label className={`${labelClass} md:col-span-2`}>Programmes to start with<textarea name="programmes" className={`${inputClass} min-h-24`} defaultValue={"Foundation Class\nDiscipleship\nMembership Class\nLeadership Academy"} /></label>
              </Section>

              <fieldset className="rounded-lg border border-border p-4">
                <legend className="px-2 text-sm font-semibold text-accent">7. Review And Declaration</legend>
                <div className="mt-3 grid gap-3">
                  {["I am authorized to register this church.", "The church controls its ministry data.", "KingdomFlow is a technology platform, not a spiritual authority.", "The information provided is accurate enough for platform review."].map((item) => (
                    <label key={item} className="flex gap-3 text-sm"><input type="checkbox" required />{item}</label>
                  ))}
                </div>
              </fieldset>

              <div className="sticky bottom-0 -mx-5 -mb-5 flex flex-wrap gap-3 border-t border-border bg-surface/95 p-5 backdrop-blur">
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
