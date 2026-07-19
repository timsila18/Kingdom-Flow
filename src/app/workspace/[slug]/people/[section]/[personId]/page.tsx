import { notFound } from "next/navigation";
import { PeopleSectionPanel, PersonProfile, PrivacyNotice } from "@/components/people";
import { WorkspaceShell } from "@/components/shells";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function PeopleNestedSectionPage({ params }: { params: Promise<{ slug: string; section: string; personId: string }> }) {
  const { slug, section, personId } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      {section === "profile" ? <PersonProfile personId={personId} userId="user-admin" /> : <PeopleSectionPanel section={section} slug={slug} tenantId={tenant.id} userId="user-admin" />}
      <div className="mt-8"><PrivacyNotice /></div>
    </WorkspaceShell>
  );
}
