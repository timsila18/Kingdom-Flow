import { notFound } from "next/navigation";
import { AuthorityHome } from "@/components/authority";
import { WorkspaceShell } from "@/components/shells";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function AuthorityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      <AuthorityHome slug={slug} tenantId={tenant.id} />
    </WorkspaceShell>
  );
}
