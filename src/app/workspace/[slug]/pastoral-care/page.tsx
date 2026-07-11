import { notFound } from "next/navigation";
import { PastoralHome, PastoralIconStrip, PastoralPrinciples } from "@/components/pastoral";
import { WorkspaceShell } from "@/components/shells";
import { getTenantBySlug } from "@/lib/data";

export default async function PastoralCarePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <PastoralHome slug={slug} tenantId={tenant.id} userId="user-admin" />
      <PastoralPrinciples />
      <PastoralIconStrip />
    </WorkspaceShell>
  );
}
