import { notFound } from "next/navigation";
import { AdministrationHome, AdministrationPrinciplesNotice } from "@/components/administration";
import { WorkspaceShell } from "@/components/shells";
import { getTenantBySlug } from "@/lib/data";

export default async function AdministrationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <AdministrationHome slug={slug} tenantId={tenant.id} userId="user-admin" />
      <div className="mt-8"><AdministrationPrinciplesNotice /></div>
    </WorkspaceShell>
  );
}
