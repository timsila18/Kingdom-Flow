import { AuthShell } from "@/components/shells";
import { ButtonLink, Card } from "@/components/ui";
import { getVisibleTenants } from "@/lib/tenant-store";
import { getWorkspaceAccess } from "@/lib/workspace-store";
import { getCurrentUser } from "@/lib/app-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function WorkspaceSelectorPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");
  const visible = await getVisibleTenants();
  const access = await Promise.all(
    visible.map(async (tenant) =>
      (await getWorkspaceAccess(tenant.id)) ? tenant : undefined,
    ),
  );
  const tenants = access.filter(
    (tenant): tenant is NonNullable<typeof tenant> => Boolean(tenant),
  );
  return (
    <AuthShell title="Your churches">
      <div className="grid gap-3">
        {tenants.map((tenant) => (
          <Card key={tenant.id}>
            <p className="font-semibold">{tenant.publicName}</p>
            <p className="mt-1 text-sm text-muted">
              {tenant.status.replace("_", " ")}
            </p>
            <div className="mt-4">
              <ButtonLink
                href={
                  tenant.status === "approved"
                    ? `/workspace/${tenant.slug}`
                    : `/auth/pending?church=${tenant.slug}`
                }
              >
                {tenant.status === "approved" ? "Open church" : "Check status"}
              </ButtonLink>
            </div>
          </Card>
        ))}
      </div>
      {!tenants.length ? (
        <p className="mt-5 text-sm leading-6 text-muted">
          No church has been assigned to your account yet.
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <ButtonLink href="/auth/join-church" variant="secondary">
          Join a church
        </ButtonLink>
        <ButtonLink href="/onboarding" variant="secondary">
          Add your church
        </ButtonLink>
        {user.isSuperAdmin ? (
          <ButtonLink href="/platform">Platform administration</ButtonLink>
        ) : null}
      </div>
    </AuthShell>
  );
}
