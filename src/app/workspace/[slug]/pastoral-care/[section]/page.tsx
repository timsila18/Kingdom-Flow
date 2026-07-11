import { notFound } from "next/navigation";
import { PastoralPrinciples, PastoralSectionPanel } from "@/components/pastoral";
import { WorkspaceShell } from "@/components/shells";
import { getTenantBySlug } from "@/lib/data";

export default async function PastoralCareSectionPage({ params }: { params: Promise<{ slug: string; section: string }> }) {
  const { slug, section } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <PastoralSectionPanel section={section} slug={slug} tenantId={tenant.id} userId="user-admin" />
      <PastoralPrinciples />
    </WorkspaceShell>
  );
}
