import { notFound } from "next/navigation";
import { AuthorityHome } from "@/components/authority";
import { WorkspaceShell } from "@/components/shells";
import { getTenantBySlug } from "@/lib/data";

export default async function AuthorityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <AuthorityHome slug={slug} tenantId={tenant.id} />
    </WorkspaceShell>
  );
}
