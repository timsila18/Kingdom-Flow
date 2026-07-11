import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/shells";
import { Badge, Card, EmptyPhase, PageHeader } from "@/components/ui";
import { getTenantBySlug } from "@/lib/data";
import { labelFor } from "@/lib/terminology";

export default async function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  const sections = ["Ministry Profile", "Branding", "Terminology", "Organizational Structure", "Branches", "Users", "Roles & Permissions", "Regional Settings", "Communication Defaults", "Privacy", "Security", "Data Management", "Subscription", "Integrations", "Audit Trail"];
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <PageHeader title="Settings" description="Prompt 1 implements profile, branding, terminology, structure, users, roles, subscription and audit foundations. Future integrations are explicitly unavailable in this phase." />
      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
        <Card><nav className="grid gap-1 text-sm">{sections.map((section) => <a key={section} href={`#${section.toLowerCase().replaceAll(" ", "-")}`} className="rounded-md px-3 py-2 hover:bg-surface-muted">{section}</a>)}</nav></Card>
        <div className="grid gap-6">
          <Card id="ministry-profile"><h2 className="text-lg font-semibold">Ministry Profile</h2><p className="mt-2 text-sm text-muted">{tenant.legalName} · {tenant.country}, {tenant.region}</p></Card>
          <Card id="branding"><h2 className="text-lg font-semibold">Branding</h2><div className="mt-4 flex gap-3">{[tenant.primaryColor, tenant.secondaryColor, tenant.accentColor].map((color) => <span key={color} className="size-12 rounded-md border border-border" style={{ background: color }} />)}</div></Card>
          <Card id="terminology"><h2 className="text-lg font-semibold">Terminology</h2><div className="mt-4 grid gap-2 text-sm md:grid-cols-3">{(["member", "visitor", "new_convert", "pastor", "senior_pastor", "small_group", "branch", "department", "foundation_class"] as const).map((key) => <div key={key} className="rounded-md bg-surface-muted p-3"><span className="text-muted">{key}</span><p className="font-medium">{labelFor(tenant.id, key)}</p></div>)}</div></Card>
          <Card id="security"><h2 className="text-lg font-semibold">Security safeguards</h2><div className="mt-3 flex flex-wrap gap-2"><Badge tone="success">RLS required</Badge><Badge tone="success">Audit cannot be disabled</Badge><Badge tone="success">Server authorization</Badge></div></Card>
          <EmptyPhase title="Integrations unavailable in this phase" description="M-Pesa, email delivery providers, shared auth, webhooks and external accounting integrations are intentionally reserved for later prompts." />
        </div>
      </div>
    </WorkspaceShell>
  );
}
