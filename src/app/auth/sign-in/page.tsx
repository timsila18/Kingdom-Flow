import Link from "next/link";
import { AuthShell } from "@/components/shells";
import { ButtonLink, Card } from "@/components/ui";
import { testLoginAccounts, testLoginPassword } from "@/lib/data";

export default function SignInPage() {
  return (
    <AuthShell title="Sign in">
      <form className="grid gap-4" action="/auth/workspaces">
        <label className="grid gap-2 text-sm font-medium">Email<input className="rounded-md border border-border bg-surface px-3 py-2 text-foreground" name="email" type="email" defaultValue="superadmin@kingdomflow.co.ke" required /></label>
        <label className="grid gap-2 text-sm font-medium">Password<input className="rounded-md border border-border bg-surface px-3 py-2 text-foreground" name="password" type="password" defaultValue={testLoginPassword} required /></label>
        <button className="rounded-md border border-accent/70 bg-primary px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-accent">Sign in securely</button>
      </form>
      <div className="mt-5 grid gap-2 text-sm text-muted">
        <Link href="/auth/forgot-password">Forgot password?</Link>
        <Link href="/onboarding">Create a church account</Link>
        <Link href="/auth/test-logins">View all test logins</Link>
      </div>
      <Card className="mt-6">
        <p className="font-semibold">Quick test login</p>
        <p className="mt-2 text-sm text-muted">{testLoginAccounts[0].email}</p>
        <p className="mt-1 font-mono text-sm text-accent">{testLoginPassword}</p>
        <div className="mt-4"><ButtonLink href={testLoginAccounts[0].path}>Continue as super admin</ButtonLink></div>
      </Card>
    </AuthShell>
  );
}
