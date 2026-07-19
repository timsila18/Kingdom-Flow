import { notFound } from "next/navigation";
import { DigitalPrinciplesNotice, MemberCardPreview, MemberHome } from "@/components/digital";
import { WorkspaceShell } from "@/components/shells";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";

export default async function MemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName} tenantSlug={tenant.slug}>
      <MemberHome slug={slug} tenantId={tenant.id} userId="user-admin" personId="person-amina" />
      <div className="mt-8 grid gap-4 md:grid-cols-2"><MemberCardPreview /><DigitalPrinciplesNotice /></div>
    </WorkspaceShell>
  );
}
