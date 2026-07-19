import { notFound } from "next/navigation";
import { CaseDetailPanel, PastoralPrinciples } from "@/components/pastoral";
import { WorkspaceShell } from "@/components/shells";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function PastoralCaseDetailPage({ params }: { params: Promise<{ slug: string; caseId: string }> }) {
  const { slug, caseId } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      <CaseDetailPanel caseId={caseId} slug={slug} tenantId={tenant.id} userId="user-admin" />
      <PastoralPrinciples />
    </WorkspaceShell>
  );
}
