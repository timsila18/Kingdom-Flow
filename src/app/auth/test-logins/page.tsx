import { AuthShell } from "@/components/shells";
import { Card } from "@/components/ui";
import { testLoginAccounts } from "@/lib/data";

export default function TestLoginsPage() {
  return (
    <AuthShell title="Test logins">
      <div className="grid gap-4">
        {testLoginAccounts.map((account) => (
          <Card key={account.email}>
            <p className="font-semibold">{account.role}</p>
            <p className="mt-2 text-sm text-muted">{account.workspace}</p>
            <dl className="mt-3 grid gap-2 text-sm">
              <div><dt className="text-muted">Email</dt><dd className="font-mono text-foreground">{account.email}</dd></div>
              <div><dt className="text-muted">Password</dt><dd className="font-mono text-accent">{account.password}</dd></div>
            </dl>
            <p className="mt-3 text-sm leading-6 text-muted">{account.coverage}</p>
            <div className="mt-4"><a href={`/auth/demo-login?email=${encodeURIComponent(account.email)}`} className="inline-flex min-h-10 items-center justify-center rounded-md border border-accent/70 bg-primary px-4 text-sm font-semibold text-black shadow-[0_1px_0_rgba(255,255,255,.12)_inset] transition hover:-translate-y-0.5 hover:bg-accent">Sign in and open area</a></div>
          </Card>
        ))}
      </div>
    </AuthShell>
  );
}
