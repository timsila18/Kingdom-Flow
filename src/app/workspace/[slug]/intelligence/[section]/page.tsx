import { notFound } from "next/navigation";
import { IntelligenceSection } from "@/components/intelligence";
import { WorkspaceShell } from "@/components/shells";
import { getTenantBySlug } from "@/lib/data";

export default async function IntelligenceSectionPage({ params }: { params: Promise<{ slug: string; section: string }> }) {
  const { slug, section } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <IntelligenceSection section={section} slug={slug} tenantId={tenant.id} />
    </WorkspaceShell>
  );
}
