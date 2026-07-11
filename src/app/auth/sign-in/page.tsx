import Link from "next/link";
import { AuthShell } from "@/components/shells";

export default function SignInPage() {
  return (
    <AuthShell title="Sign in">
      <form className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium">Email<input className="rounded-md border border-border bg-surface px-3 py-2" type="email" required /></label>
        <label className="grid gap-2 text-sm font-medium">Password<input className="rounded-md border border-border bg-surface px-3 py-2" type="password" required /></label>
        <button className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white">Sign in securely</button>
      </form>
      <div className="mt-5 grid gap-2 text-sm text-muted">
        <Link href="/auth/forgot-password">Forgot password?</Link>
        <Link href="/onboarding">Create a church account</Link>
      </div>
    </AuthShell>
  );
}
