import { notFound } from "next/navigation";
import { AdministrationPrinciplesNotice, AdministrationSectionPanel } from "@/components/administration";
import { WorkspaceShell } from "@/components/shells";
import { getTenantBySlug } from "@/lib/data";

export default async function AdministrationSectionPage({ params }: { params: Promise<{ slug: string; section: string }> }) {
  const { slug, section } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <AdministrationSectionPanel section={section} slug={slug} tenantId={tenant.id} userId="user-admin" />
      <div className="mt-8"><AdministrationPrinciplesNotice /></div>
    </WorkspaceShell>
  );
}
