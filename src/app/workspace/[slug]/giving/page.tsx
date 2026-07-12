import { notFound } from "next/navigation";
import { GivingHome, GivingPrivacyNotice } from "@/components/giving";
import { WorkspaceShell } from "@/components/shells";
import { getTenantBySlug } from "@/lib/data";

export default async function GivingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <GivingHome slug={slug} tenantId={tenant.id} userId="user-admin" />
      <div className="mt-8"><GivingPrivacyNotice /></div>
    </WorkspaceShell>
  );
}
