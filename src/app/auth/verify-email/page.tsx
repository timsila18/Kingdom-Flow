import { AuthShell } from "@/components/shells";
import { ButtonLink } from "@/components/ui";

export default function VerifyEmailPage() {
  return (
    <AuthShell title="Verify your email">
      <p className="text-sm leading-6 text-muted">Email verification is required before a workspace can be activated or an invitation can be accepted.</p>
      <div className="mt-5"><ButtonLink href="/auth/sign-in">Back to sign in</ButtonLink></div>
    </AuthShell>
  );
}
