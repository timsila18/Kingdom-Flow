import { notFound } from "next/navigation";
import { ProgrammePrinciplesNotice, ProgrammesHome } from "@/components/programmes";
import { WorkspaceShell } from "@/components/shells";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function ProgrammesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      <ProgrammesHome slug={slug} tenantId={tenant.id} userId="user-admin" />
      <div className="mt-8"><ProgrammePrinciplesNotice /></div>
    </WorkspaceShell>
  );
}
