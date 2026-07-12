import { notFound } from "next/navigation";
import { ProgrammePrinciplesNotice, ProgrammeSectionPanel } from "@/components/programmes";
import { WorkspaceShell } from "@/components/shells";
import { getTenantBySlug } from "@/lib/data";

export default async function ProgrammeSectionPage({ params }: { params: Promise<{ slug: string; section: string }> }) {
  const { slug, section } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <ProgrammeSectionPanel section={section} slug={slug} tenantId={tenant.id} userId="user-admin" />
      <div className="mt-8"><ProgrammePrinciplesNotice /></div>
    </WorkspaceShell>
  );
}
