import { notFound } from "next/navigation";
import { PeopleHome, PrivacyNotice } from "@/components/people";
import { WorkspaceShell } from "@/components/shells";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function PeoplePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      <PeopleHome slug={slug} tenantId={tenant.id} userId="user-admin" />
      <div className="mt-8"><PrivacyNotice /></div>
    </WorkspaceShell>
  );
}
