import { AuthShell } from "@/components/shells";
import { ButtonLink } from "@/components/ui";
import { invitations, roles, tenants } from "@/lib/data";

export default async function AcceptInvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invitation = invitations[0];
  const tenant = tenants.find((item) => item.id === invitation.tenantId);
  const role = roles.find((item) => item.id === invitation.roleId);
  return (
    <AuthShell title="Accept invitation">
      <p className="text-sm leading-6 text-muted">Token reference: {token}</p>
      <div className="mt-4 rounded-lg border border-border bg-surface-muted p-4 text-sm">
        <p><strong>Church:</strong> {tenant?.publicName}</p>
        <p><strong>Role:</strong> {role?.displayName}</p>
        <p><strong>Scope:</strong> {invitation.scopeType}</p>
      </div>
      <div className="mt-5"><ButtonLink href="/auth/workspaces">Sign in and accept</ButtonLink></div>
    </AuthShell>
  );
}
