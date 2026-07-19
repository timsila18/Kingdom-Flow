import { notFound } from "next/navigation";
import { GroupPrivacyNotice, GroupSectionPanel } from "@/components/groups";
import { WorkspaceShell } from "@/components/shells";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function GroupSectionPage({ params }: { params: Promise<{ slug: string; section: string }> }) {
  const { slug, section } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      <GroupSectionPanel section={section} slug={slug} tenantId={tenant.id} userId="user-admin" />
      <div className="mt-8"><GroupPrivacyNotice /></div>
    </WorkspaceShell>
  );
}
