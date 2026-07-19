import { notFound } from "next/navigation";
import { ProductionHome } from "@/components/production";
import { WorkspaceShell } from "@/components/shells";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function ProductionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      <ProductionHome slug={slug} tenantId={tenant.id} />
    </WorkspaceShell>
  );
}
