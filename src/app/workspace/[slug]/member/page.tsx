import { notFound } from "next/navigation";
import { DigitalPrinciplesNotice, MemberCardPreview, MemberHome } from "@/components/digital";
import { WorkspaceShell } from "@/components/shells";
import { getTenantBySlug } from "@/lib/data";

export default async function MemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <MemberHome slug={slug} tenantId={tenant.id} userId="user-admin" personId="person-amina" />
      <div className="mt-8 grid gap-4 md:grid-cols-2"><MemberCardPreview /><DigitalPrinciplesNotice /></div>
    </WorkspaceShell>
  );
}
