import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/app-auth";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";
import { getWorkspaceAccess } from "@/lib/workspace-store";
export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(await getCurrentUser()))
    redirect(`/auth/sign-in?next=/workspace/${slug}`);
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  if (!(await getWorkspaceAccess(tenant.id))) redirect("/auth/workspaces");
  if (tenant.status !== "approved") redirect(`/auth/pending?church=${slug}`);
  return children;
}
