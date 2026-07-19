import { notFound } from "next/navigation";
import { GroupsHome, GroupPrivacyNotice } from "@/components/groups";
import { WorkspaceShell } from "@/components/shells";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function GroupsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      <GroupsHome slug={slug} tenantId={tenant.id} userId="user-admin" />
      <div className="mt-8"><GroupPrivacyNotice /></div>
    </WorkspaceShell>
  );
}
