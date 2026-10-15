import { AuthShell } from "@/components/shells";
import { ButtonLink } from "@/components/ui";

export default function TestLoginsPage() {
  return (
    <AuthShell title="Test logins removed">
      <p className="text-sm leading-6 text-muted">
        Demo sign-in is disabled. Use an authorized Supabase account for platform or church workspace access.
      </p>
      <div className="mt-5">
        <ButtonLink href="/auth/sign-in">Back to sign in</ButtonLink>
      </div>
    </AuthShell>
  );
}
