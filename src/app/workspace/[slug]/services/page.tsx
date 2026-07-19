import { notFound } from "next/navigation";
import { ServicePrivacyNotice, ServicesHome } from "@/components/services";
import { WorkspaceShell } from "@/components/shells";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function ServicesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      <ServicesHome slug={slug} tenantId={tenant.id} userId="user-admin" />
      <div className="mt-8"><ServicePrivacyNotice /></div>
    </WorkspaceShell>
  );
}
