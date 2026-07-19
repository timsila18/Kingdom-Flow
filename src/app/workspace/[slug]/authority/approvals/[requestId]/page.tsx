import { notFound } from "next/navigation";
import { ApprovalDetailPanel } from "@/components/authority";
import { WorkspaceShell } from "@/components/shells";
import { approvalRequests } from "@/lib/authority-data";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function ApprovalRequestPage({ params }: { params: Promise<{ slug: string; requestId: string }> }) {
  const { slug, requestId } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  const request = approvalRequests.find((item) => item.id === requestId);
  if (!tenant || !request) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      <ApprovalDetailPanel requestId={requestId} slug={slug} />
    </WorkspaceShell>
  );
}
