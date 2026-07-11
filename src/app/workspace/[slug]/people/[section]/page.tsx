import { notFound } from "next/navigation";
import { PeopleSectionPanel, PrivacyNotice } from "@/components/people";
import { WorkspaceShell } from "@/components/shells";
import { getTenantBySlug } from "@/lib/data";

export default async function PeopleSectionPage({ params }: { params: Promise<{ slug: string; section: string }> }) {
  const { slug, section } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <PeopleSectionPanel section={section} slug={slug} tenantId={tenant.id} userId="user-admin" />
      <div className="mt-8"><PrivacyNotice /></div>
    </WorkspaceShell>
  );
}
