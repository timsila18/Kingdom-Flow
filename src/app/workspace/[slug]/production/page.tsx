import { notFound } from "next/navigation";
import { ProductionHome } from "@/components/production";
import { WorkspaceShell } from "@/components/shells";
import { getTenantBySlug } from "@/lib/data";

export default async function ProductionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <ProductionHome slug={slug} tenantId={tenant.id} />
    </WorkspaceShell>
  );
}
