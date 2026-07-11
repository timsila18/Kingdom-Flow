import { notFound } from "next/navigation";
import { ApprovalDetailPanel } from "@/components/authority";
import { WorkspaceShell } from "@/components/shells";
import { approvalRequests } from "@/lib/authority-data";
import { getTenantBySlug } from "@/lib/data";

export default async function ApprovalRequestPage({ params }: { params: Promise<{ slug: string; requestId: string }> }) {
  const { slug, requestId } = await params;
  const tenant = getTenantBySlug(slug);
  const request = approvalRequests.find((item) => item.id === requestId);
  if (!tenant || !request) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <ApprovalDetailPanel requestId={requestId} />
    </WorkspaceShell>
  );
}
