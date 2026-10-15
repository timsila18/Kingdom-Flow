import Link from "next/link";
import { AuthShell } from "@/components/shells";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    logged_out?: string;
    next?: string;
    registered?: string;
    reset?: string;
    confirmation?: string;
  }>;
}) {
  const query = await searchParams;
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  return (
    <AuthShell title="Sign in">
      {query.registered ? (
        <p role="status" className="mb-4 text-sm text-success">
          {query.confirmation
            ? "Check your email to confirm your church-creator account, then sign in."
            : "Your account has been created. Sign in to continue."}
        </p>
      ) : null}
      {query.reset ? (
        <p role="status" className="mb-4 text-sm text-success">
          Your password has been updated. Sign in with your new password.
        </p>
      ) : null}
      {query.logged_out ? (
        <p className="mb-4 rounded-md border border-border bg-surface-muted p-3 text-sm text-muted">
          You have been logged out.
        </p>
      ) : null}
      {query.error === "demo-disabled" ? (
        <p className="mb-4 rounded-md border border-warning/60 bg-surface-muted p-3 text-sm text-warning">
          Demo accounts are no longer available.
        </p>
      ) : null}
      {query.error === "invalid-login" ? (
        <p className="mb-4 rounded-md border border-danger/60 bg-surface-muted p-3 text-sm text-danger">
          The email or password was not recognised.
        </p>
      ) : null}
      {query.error === "too-many-attempts" ? (
        <p className="mb-4 rounded-md border border-warning/60 bg-surface-muted p-3 text-sm text-warning">
          Too many sign-in attempts. Please wait 15 minutes and try again.
        </p>
      ) : null}
      {query.error === "auth-not-configured" ? (
        <p className="mb-4 rounded-md border border-warning/60 bg-surface-muted p-3 text-sm text-warning">
          Real authentication is not configured yet.
        </p>
      ) : null}
      {!supabaseConfigured ? (
        <p className="mb-4 rounded-md border border-warning/60 bg-surface-muted p-3 text-sm text-warning">
          Real authentication is not configured yet. Add Supabase Auth
          environment variables and create real users to enable sign in.
        </p>
      ) : null}
      <form className="grid gap-4" action="/auth/login" method="post">
        <label className="grid gap-2 text-sm font-medium">
          Email
          <input
            className="rounded-md border border-border bg-surface px-3 py-2 text-foreground"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Password
          <input
            className="rounded-md border border-border bg-surface px-3 py-2 text-foreground"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        {query.next ? (
          <input type="hidden" name="next" value={query.next} />
        ) : null}
        <button
          disabled={!supabaseConfigured}
          className="min-h-11 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sign in
        </button>
      </form>
      <div className="mt-5 grid gap-2 text-sm text-muted">
        <Link href="/auth/forgot-password">Forgot password?</Link>
        <Link href="/auth/register" className="font-medium text-primary">
          Create account / Join a church
        </Link>
        <Link href="/onboarding">Create a church account</Link>
      </div>
    </AuthShell>
  );
}
