import { redirect } from "next/navigation";
import { AuthShell } from "@/components/shells";
import { ButtonLink } from "@/components/ui";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";
export default async function PendingPage({
  searchParams,
}: {
  searchParams: Promise<{ church?: string }>;
}) {
  const query = await searchParams;
  const tenant = query.church
    ? await getVisibleTenantBySlug(query.church)
    : undefined;
  if (tenant?.status === "approved") redirect(`/workspace/${tenant.slug}`);
  return (
    <AuthShell
      title={
        tenant?.status === "suspended"
          ? "Church access suspended"
          : tenant?.status === "rejected"
            ? "Registration not approved"
            : "Waiting for approval"
      }
    >
      <p className="text-sm leading-6 text-muted">
        {tenant?.publicName ?? "Your church"}
        {tenant?.status === "needs_clarification"
          ? " needs more information before approval. Contact the platform administrator."
          : tenant?.status === "rejected" || tenant?.status === "suspended"
            ? ": contact the platform administrator for the next step."
            : " has been submitted for review."}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <ButtonLink
          href={
            query.church
              ? `/auth/pending?church=${query.church}`
              : "/auth/workspaces"
          }
        >
          Check status
        </ButtonLink>
        <ButtonLink href="/auth/workspaces" variant="secondary">
          Your churches
        </ButtonLink>
      </div>
    </AuthShell>
  );
}
