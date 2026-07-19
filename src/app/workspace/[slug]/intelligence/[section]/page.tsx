import { notFound } from "next/navigation";
import { IntelligenceSection } from "@/components/intelligence";
import { WorkspaceShell } from "@/components/shells";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function IntelligenceSectionPage({ params }: { params: Promise<{ slug: string; section: string }> }) {
  const { slug, section } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      <IntelligenceSection section={section} slug={slug} tenantId={tenant.id} />
    </WorkspaceShell>
  );
}
