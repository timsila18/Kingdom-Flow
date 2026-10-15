import { AuthShell } from "@/components/shells";
import { ButtonLink } from "@/components/ui";
export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const query = await searchParams;
  return <AuthShell title="Forgot password">{query.sent ? <p role="status" className="mb-5 text-sm text-success">If an account exists for this email, you will receive a reset link.</p> : null}{query.error ? <p role="alert" className="mb-5 text-sm text-danger">{query.error}</p> : null}<form action="/auth/forgot-password/send" method="post" className="grid gap-4"><label className="grid gap-2 text-sm font-medium">Email<input name="email" type="email" autoComplete="email" required /></label><button className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-white">Send reset link</button></form><div className="mt-5"><ButtonLink href="/auth/sign-in" variant="secondary">Back to sign in</ButtonLink></div></AuthShell>;
}
