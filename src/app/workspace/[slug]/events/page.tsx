import { notFound } from "next/navigation";
import { EventPrivacyNotice, EventsHome } from "@/components/events";
import { WorkspaceShell } from "@/components/shells";
import { getTenantBySlug } from "@/lib/data";

export default async function EventsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <EventsHome slug={slug} tenantId={tenant.id} userId="user-admin" />
      <div className="mt-8"><EventPrivacyNotice /></div>
    </WorkspaceShell>
  );
}
