import { AuthShell } from "@/components/shells";
import { ButtonLink, Card } from "@/components/ui";
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
            <div className="mt-4"><ButtonLink href={account.path}>Open test area</ButtonLink></div>
          </Card>
        ))}
      </div>
    </AuthShell>
  );
}
