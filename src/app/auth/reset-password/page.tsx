import { AuthShell } from "@/components/shells";

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Reset password">
      <form className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium">New password<input className="rounded-md border border-border bg-surface px-3 py-2" type="password" required /></label>
        <label className="grid gap-2 text-sm font-medium">Confirm password<input className="rounded-md border border-border bg-surface px-3 py-2" type="password" required /></label>
        <button className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white">Update password</button>
      </form>
    </AuthShell>
  );
}
