import { MarketingShell } from "@/components/shells";
import { PageHeader, ButtonLink } from "@/components/ui";
import { ChurchOnboarding } from "@/components/church-onboarding";
import { getCurrentUser } from "@/lib/app-auth";
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  const query = await searchParams;
  return (
    <MarketingShell>
      <section className="mx-auto max-w-4xl px-4 py-8">
        <PageHeader title="Add your church" />
        {query.error ? (
          <p role="alert" className="mt-4 text-danger">
            {query.error}
          </p>
        ) : null}
        {user ? (
          <ChurchOnboarding userId={user.id} />
        ) : (
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/auth/sign-in?next=/onboarding">
              Sign in to continue
            </ButtonLink>
            <ButtonLink href="/auth/register?mode=church" variant="secondary">
              Create your account
            </ButtonLink>
          </div>
        )}
      </section>
    </MarketingShell>
  );
}
