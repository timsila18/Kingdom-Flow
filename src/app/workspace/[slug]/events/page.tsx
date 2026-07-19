import { notFound } from "next/navigation";
import { EventPrivacyNotice, EventsHome } from "@/components/events";
import { WorkspaceShell } from "@/components/shells";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function EventsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      <EventsHome slug={slug} tenantId={tenant.id} userId="user-admin" />
      <div className="mt-8"><EventPrivacyNotice /></div>
    </WorkspaceShell>
  );
}
