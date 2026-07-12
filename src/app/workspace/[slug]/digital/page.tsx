import { notFound } from "next/navigation";
import { DigitalAdminHome, DigitalPrinciplesNotice } from "@/components/digital";
import { WorkspaceShell } from "@/components/shells";
import { getTenantBySlug } from "@/lib/data";

export default async function DigitalAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <DigitalAdminHome slug={slug} tenantId={tenant.id} />
      <div className="mt-8"><DigitalPrinciplesNotice /></div>
    </WorkspaceShell>
  );
}
