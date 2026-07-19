import { notFound } from "next/navigation";
import { ProductionSection } from "@/components/production";
import { WorkspaceShell } from "@/components/shells";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function ProductionSectionPage({ params }: { params: Promise<{ slug: string; section: string }> }) {
  const { slug, section } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      <ProductionSection section={section} tenantId={tenant.id} />
    </WorkspaceShell>
  );
}
