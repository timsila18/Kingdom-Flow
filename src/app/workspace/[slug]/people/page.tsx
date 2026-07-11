import { notFound } from "next/navigation";
import { PeopleHome, PrivacyNotice } from "@/components/people";
import { WorkspaceShell } from "@/components/shells";
import { getTenantBySlug } from "@/lib/data";

export default async function PeoplePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <PeopleHome slug={slug} tenantId={tenant.id} userId="user-admin" />
      <div className="mt-8"><PrivacyNotice /></div>
    </WorkspaceShell>
  );
}
