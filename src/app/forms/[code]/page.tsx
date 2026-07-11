import { MarketingShell } from "@/components/shells";
import { Badge, Card, PageHeader } from "@/components/ui";
import { formDefinitions, qrCodes } from "@/lib/people-data";

export default async function PublicFormPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const qr = qrCodes.find((item) => item.code.toLowerCase() === code.toLowerCase());
  const form = formDefinitions.find((item) => item.id === qr?.formId) ?? formDefinitions[0];
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-6 py-10">
        <PageHeader title={form.name} description="A consent-aware public capture form. Internal staff fields and tenant people records are not exposed publicly." actions={<Badge tone="accent">Branch form</Badge>} />
        <Card className="mt-8">
          <form className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">Full name<input className="rounded-md border border-border px-3 py-2" required /></label>
            <label className="grid gap-2 text-sm font-medium">Phone<input className="rounded-md border border-border px-3 py-2" /></label>
            <label className="grid gap-2 text-sm font-medium">Email<input className="rounded-md border border-border px-3 py-2" type="email" /></label>
            <label className="grid gap-2 text-sm font-medium">Prayer or follow-up request<textarea className="min-h-24 rounded-md border border-border px-3 py-2" /></label>
            <label className="flex gap-3 text-sm"><input type="checkbox" required />{form.consentStatement}</label>
            <button className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white">Submit securely</button>
          </form>
          <p className="mt-5 text-sm text-muted">{form.confirmationMessage}</p>
        </Card>
      </section>
    </MarketingShell>
  );
}
