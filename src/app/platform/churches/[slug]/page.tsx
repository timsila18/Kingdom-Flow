import { notFound } from "next/navigation";
import { PlatformShell } from "@/components/shells";
import { Badge, ButtonLink, PageHeader } from "@/components/ui";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";
import { getWorkspaceAccess } from "@/lib/workspace-store";
export default async function ReviewChurchPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ updated?: string; error?: string }> }) {
  const { slug } = await params;
  const query = await searchParams;
  const tenant = await getVisibleTenantBySlug(slug);
  if (!tenant) notFound();
  const access = await getWorkspaceAccess(tenant.id);
  const profile = tenant.onboardingProfile;
  return <PlatformShell><div className="mb-4"><ButtonLink href="/platform/churches" variant="secondary">Back to churches</ButtonLink></div><PageHeader title={tenant.publicName} actions={<Badge tone={tenant.status === "approved" ? "success" : "warning"}>{tenant.status.replaceAll("_", " ")}</Badge>} />
    {query.updated ? <p role="status" className="mt-4 text-sm text-success">Church status updated successfully.</p> : null}{query.error ? <p role="alert" className="mt-4 text-sm text-danger">{query.error}</p> : null}
    <dl className="mt-6 grid gap-5 sm:grid-cols-2"><div><dt className="text-sm text-muted">Contact email</dt><dd>{tenant.contactEmail}</dd></div><div><dt className="text-sm text-muted">Phone</dt><dd>{tenant.contactPhone}</dd></div><div><dt className="text-sm text-muted">Location</dt><dd>{tenant.region}, {tenant.country}</dd></div><div><dt className="text-sm text-muted">Church leader</dt><dd>{profile?.principalLeaderName ?? "Not provided"}{profile?.principalLeaderName ? ` · ${tenant.ministryHeadTitle}` : ""}</dd></div><div><dt className="text-sm text-muted">Departments</dt><dd>{profile?.departments.join(", ") || "None added yet"}</dd></div><div><dt className="text-sm text-muted">Classes</dt><dd>{profile?.programmes.join(", ") || "None added yet"}</dd></div></dl>
    <section className="mt-8 border-t border-border pt-6"><h2 className="text-lg font-semibold">Review church</h2><form method="post" action={`/platform/churches/${slug}/action`} className="mt-4 grid max-w-xl gap-4"><label className="grid gap-2 text-sm font-medium">Review note<textarea name="reason" rows={3} maxLength={2000} /></label><div className="flex flex-wrap gap-3">{["submitted", "under_review", "needs_clarification", "draft"].includes(tenant.status) ? <><button name="decision" value="approve" className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-white">Approve church</button><button name="decision" value="clarification" className="min-h-11 rounded-md border border-border bg-surface px-4 text-sm font-semibold">Ask for more information</button><button name="decision" value="reject" className="min-h-11 px-4 text-sm font-semibold text-danger">Reject</button></> : tenant.status === "approved" ? <button name="decision" value="suspend" className="min-h-11 rounded-md border border-border bg-surface px-4 text-sm font-semibold text-danger">Suspend church</button> : <button name="decision" value="reactivate" className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-white">Approve church</button>}</div></form>{tenant.status === "approved" && access ? <div className="mt-5"><ButtonLink href={`/workspace/${slug}`}>Open church</ButtonLink></div> : null}</section>
  </PlatformShell>;
}
