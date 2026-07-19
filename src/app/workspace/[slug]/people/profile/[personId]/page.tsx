import { notFound } from "next/navigation";
import { PersonProfile, PrivacyNotice } from "@/components/people";
import { WorkspaceShell } from "@/components/shells";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function PersonProfilePage({ params }: { params: Promise<{ slug: string; personId: string }> }) {
  const { slug, personId } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      <PersonProfile personId={personId} userId="user-admin" />
      <div className="mt-8"><PrivacyNotice /></div>
    </WorkspaceShell>
  );
}
