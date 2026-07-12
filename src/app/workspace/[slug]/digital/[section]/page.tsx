import { notFound } from "next/navigation";
import { DigitalAdminSection, DigitalPrinciplesNotice } from "@/components/digital";
import { WorkspaceShell } from "@/components/shells";
import { getTenantBySlug } from "@/lib/data";

export default async function DigitalAdminSectionPage({ params }: { params: Promise<{ slug: string; section: string }> }) {
  const { slug, section } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <DigitalAdminSection section={section} slug={slug} tenantId={tenant.id} />
      <div className="mt-8"><DigitalPrinciplesNotice /></div>
    </WorkspaceShell>
  );
}
