import Link from "next/link";
import { Church, Plus, ArrowRight } from "lucide-react";
import { PlatformShell } from "@/components/shells";
import { Badge, ButtonLink, PageHeader } from "@/components/ui";
import { getVisibleTenants } from "@/lib/tenant-store";
export const dynamic = "force-dynamic";
export default async function PlatformPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  const query = await searchParams;
  const tab = ["approved", "other"].includes(query.tab ?? "")
    ? query.tab!
    : "pending";
  const churches = await getVisibleTenants();
  const selected = churches.filter((church) =>
    tab === "approved"
      ? church.status === "approved"
      : tab === "pending"
        ? ["submitted", "under_review", "needs_clarification"].includes(
            church.status,
          )
        : ![
            "approved",
            "submitted",
            "under_review",
            "needs_clarification",
          ].includes(church.status),
  );
  return (
    <PlatformShell>
      <PageHeader
        title="Churches"
        actions={
          <ButtonLink href="/onboarding">
            <Plus size={18} />
            Add church
          </ButtonLink>
        }
      />
      {query.error ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-danger"
        >
          {query.error}
        </p>
      ) : null}
      <nav
        aria-label="Church status"
        className="mt-6 flex flex-wrap gap-3 border-b border-border"
      >
        {[
          ["pending", "Waiting for approval"],
          ["approved", "Approved churches"],
          ["other", "Other churches"],
        ].map(([key, label]) => (
          <Link
            key={key}
            href={`/platform/churches?tab=${key}`}
            aria-current={tab === key ? "page" : undefined}
            className={`min-h-12 border-b-2 px-3 py-3 text-sm font-medium ${tab === key ? "border-primary text-primary" : "border-transparent text-muted"}`}
          >
            {label}
          </Link>
        ))}
      </nav>
      {selected.length ? (
        <div className="mt-4 divide-y divide-border">
          {selected.map((church) => (
            <div
              key={church.id}
              className="flex flex-wrap items-center justify-between gap-4 py-5"
            >
              <div>
                <h2 className="font-semibold">{church.publicName}</h2>
                <p className="mt-1 text-sm text-muted">
                  {church.region} {church.country}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  tone={church.status === "approved" ? "success" : "warning"}
                >
                  {church.status.replaceAll("_", " ")}
                </Badge>
                <ButtonLink
                  href={`/platform/churches/${church.slug}`}
                  variant="secondary"
                >
                  {church.status === "approved" ? "View church" : "Review"}
                  <ArrowRight size={16} />
                </ButtonLink>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <section className="flex min-h-80 flex-col items-center justify-center gap-4 py-12 text-center">
          <Church size={52} className="text-primary" />
          <h2 className="text-xl font-semibold">
            {tab === "pending"
              ? "No churches waiting for approval"
              : tab === "approved"
                ? "No approved churches yet"
                : "No other churches"}
          </h2>
          <ButtonLink href="/onboarding" variant="secondary">
            Add a church
          </ButtonLink>
        </section>
      )}
    </PlatformShell>
  );
}
