import { notFound } from "next/navigation";
import { CaseDetailPanel, PastoralPrinciples, PastoralSectionPanel } from "@/components/pastoral";
import { WorkspaceShell } from "@/components/shells";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function PastoralNestedSectionPage({ params }: { params: Promise<{ slug: string; section: string; caseId: string }> }) {
  const { slug, section, caseId } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      {section === "cases" ? <CaseDetailPanel caseId={caseId} slug={slug} tenantId={tenant.id} userId="user-admin" /> : <PastoralSectionPanel section={section} slug={slug} tenantId={tenant.id} userId="user-admin" />}
      <PastoralPrinciples />
    </WorkspaceShell>
  );
}
