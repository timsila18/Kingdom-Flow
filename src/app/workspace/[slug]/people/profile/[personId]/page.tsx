import { notFound } from "next/navigation";
import { PersonProfile, PrivacyNotice } from "@/components/people";
import { WorkspaceShell } from "@/components/shells";
import { getTenantBySlug } from "@/lib/data";

export default async function PersonProfilePage({ params }: { params: Promise<{ slug: string; personId: string }> }) {
  const { slug, personId } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <PersonProfile personId={personId} userId="user-admin" />
      <div className="mt-8"><PrivacyNotice /></div>
    </WorkspaceShell>
  );
}
