import { notFound } from "next/navigation";
import { PastoralPrinciples, PastoralSectionPanel } from "@/components/pastoral";
import { WorkspaceShell } from "@/components/shells";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function PastoralCareSectionPage({ params }: { params: Promise<{ slug: string; section: string }> }) {
  const { slug, section } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      <PastoralSectionPanel section={section} slug={slug} tenantId={tenant.id} userId="user-admin" />
      <PastoralPrinciples />
    </WorkspaceShell>
  );
}
