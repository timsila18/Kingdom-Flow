import Link from "next/link";
import { AuthShell } from "@/components/shells";
import { Card } from "@/components/ui";
import { testLoginAccounts, testLoginPassword } from "@/lib/data";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string; logged_out?: string; next?: string }> }) {
  const query = await searchParams;
  return (
    <AuthShell title="Sign in">
      {query.logged_out ? <p className="mb-4 rounded-md border border-border bg-surface-muted p-3 text-sm text-muted">You have been logged out.</p> : null}
      {query.error ? <p className="mb-4 rounded-md border border-danger/60 bg-surface-muted p-3 text-sm text-danger">That demo login was not recognised.</p> : null}
      <form className="grid gap-4" action="/auth/demo-login" method="post">
        <label className="grid gap-2 text-sm font-medium">Email<input className="rounded-md border border-border bg-surface px-3 py-2 text-foreground" name="email" type="email" defaultValue="superadmin@kingdomflow.co.ke" required /></label>
        <label className="grid gap-2 text-sm font-medium">Password<input className="rounded-md border border-border bg-surface px-3 py-2 text-foreground" name="password" type="password" defaultValue={testLoginPassword} required /></label>
        {query.next ? <input type="hidden" name="next" value={query.next} /> : null}
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
        <div className="mt-4"><a href={`/auth/demo-login?email=${encodeURIComponent(testLoginAccounts[0].email)}`} className="inline-flex min-h-10 items-center justify-center rounded-md border border-accent/70 bg-primary px-4 text-sm font-semibold text-black shadow-[0_1px_0_rgba(255,255,255,.12)_inset] transition hover:-translate-y-0.5 hover:bg-accent">Continue as super admin</a></div>
      </Card>
    </AuthShell>
  );
}
