import { notFound } from "next/navigation";
import { PastoralHome, PastoralIconStrip, PastoralPrinciples } from "@/components/pastoral";
import { WorkspaceShell } from "@/components/shells";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function PastoralCarePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      <PastoralHome slug={slug} tenantId={tenant.id} userId="user-admin" />
      <PastoralPrinciples />
      <PastoralIconStrip />
    </WorkspaceShell>
  );
}
