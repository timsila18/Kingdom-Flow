import { AuthShell } from "@/components/shells";
import { ButtonLink } from "@/components/ui";

export default function TestLoginsPage() {
  return (
    <AuthShell title="Test logins removed">
      <p className="text-sm leading-6 text-muted">
        Demo accounts have been removed from KingdomFlow. Use real Supabase Auth users for platform and church workspace access.
      </p>
      <div className="mt-5">
        <ButtonLink href="/auth/sign-in">Back to sign in</ButtonLink>
      </div>
    </AuthShell>
  );
}
