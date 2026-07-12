import { notFound } from "next/navigation";
import { GroupsHome, GroupPrivacyNotice } from "@/components/groups";
import { WorkspaceShell } from "@/components/shells";
import { getTenantBySlug } from "@/lib/data";

export default async function GroupsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <GroupsHome slug={slug} tenantId={tenant.id} userId="user-admin" />
      <div className="mt-8"><GroupPrivacyNotice /></div>
    </WorkspaceShell>
  );
}
