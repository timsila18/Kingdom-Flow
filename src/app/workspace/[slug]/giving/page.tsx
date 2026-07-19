import { notFound } from "next/navigation";
import { GivingHome, GivingPrivacyNotice } from "@/components/giving";
import { WorkspaceShell } from "@/components/shells";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function GivingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      <GivingHome slug={slug} tenantId={tenant.id} userId="user-admin" />
      <div className="mt-8"><GivingPrivacyNotice /></div>
    </WorkspaceShell>
  );
}
