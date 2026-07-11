import { AuthShell } from "@/components/shells";

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Forgot password">
      <form className="grid gap-4">
        <p className="text-sm leading-6 text-muted">Enter your email and KingdomFlow will send a reset link through the configured email adapter.</p>
        <label className="grid gap-2 text-sm font-medium">Email<input className="rounded-md border border-border bg-surface px-3 py-2" type="email" required /></label>
        <button className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white">Send reset link</button>
      </form>
    </AuthShell>
  );
}
