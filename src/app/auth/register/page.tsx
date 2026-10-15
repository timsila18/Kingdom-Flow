import { AuthShell } from "@/components/shells";
import Link from "next/link";
import { AccountRegistration } from "@/components/account-registration";
import { publicChurchOptions } from "@/lib/church-joining";
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mode?: string }>;
}) {
  const query = await searchParams;
  const churches = await publicChurchOptions();
  return (
    <AuthShell title="Create your account">
      {query.error ? (
        <p role="alert" className="mb-4 text-sm text-danger">
          {query.error}
        </p>
      ) : null}
      <AccountRegistration
        churches={churches}
        initialMode={query.mode === "church" ? "church" : "join"}
      />
      <Link href="/auth/sign-in" className="mt-5 block text-sm text-primary">
        Already have an account? Sign in
      </Link>
    </AuthShell>
  );
}
