import { notFound } from "next/navigation";
import { DigitalAdminHome, DigitalPrinciplesNotice } from "@/components/digital";
import { WorkspaceShell } from "@/components/shells";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function DigitalAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      <DigitalAdminHome slug={slug} tenantId={tenant.id} />
      <div className="mt-8"><DigitalPrinciplesNotice /></div>
    </WorkspaceShell>
  );
}
