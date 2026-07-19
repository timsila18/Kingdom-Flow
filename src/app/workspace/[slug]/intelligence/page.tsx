import { notFound } from "next/navigation";
import { IntelligenceHome, IntelligencePrinciplesNotice } from "@/components/intelligence";
import { WorkspaceShell } from "@/components/shells";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function IntelligencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      <IntelligenceHome slug={slug} tenantId={tenant.id} />
      <div className="mt-8"><IntelligencePrinciplesNotice /></div>
    </WorkspaceShell>
  );
}
