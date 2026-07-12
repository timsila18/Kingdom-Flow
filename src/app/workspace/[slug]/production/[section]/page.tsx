import { notFound } from "next/navigation";
import { ProductionSection } from "@/components/production";
import { WorkspaceShell } from "@/components/shells";
import { getTenantBySlug } from "@/lib/data";

export default async function ProductionSectionPage({ params }: { params: Promise<{ slug: string; section: string }> }) {
  const { slug, section } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <ProductionSection section={section} tenantId={tenant.id} />
    </WorkspaceShell>
  );
}
