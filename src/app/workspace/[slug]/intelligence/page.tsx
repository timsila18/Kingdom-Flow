import { notFound } from "next/navigation";
import { IntelligenceHome, IntelligencePrinciplesNotice } from "@/components/intelligence";
import { WorkspaceShell } from "@/components/shells";
import { getTenantBySlug } from "@/lib/data";

export default async function IntelligencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <IntelligenceHome slug={slug} tenantId={tenant.id} />
      <div className="mt-8"><IntelligencePrinciplesNotice /></div>
    </WorkspaceShell>
  );
}
