import { notFound } from "next/navigation";
import { AdministrationHome, AdministrationPrinciplesNotice } from "@/components/administration";
import { WorkspaceShell } from "@/components/shells";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function AdministrationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      <AdministrationHome slug={slug} tenantId={tenant.id} userId="user-admin" />
      <div className="mt-8"><AdministrationPrinciplesNotice /></div>
    </WorkspaceShell>
  );
}
