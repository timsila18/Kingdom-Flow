import { notFound } from "next/navigation";
import { ProgrammePrinciplesNotice, ProgrammesHome } from "@/components/programmes";
import { WorkspaceShell } from "@/components/shells";
import { getTenantBySlug } from "@/lib/data";

export default async function ProgrammesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <ProgrammesHome slug={slug} tenantId={tenant.id} userId="user-admin" />
      <div className="mt-8"><ProgrammePrinciplesNotice /></div>
    </WorkspaceShell>
  );
}
