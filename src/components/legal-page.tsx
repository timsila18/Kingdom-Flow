import Link from "next/link";
import type { ReactNode } from "react";
import { MarketingShell } from "./shells";

export function LegalPage({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <MarketingShell>
      <article className="mx-auto max-w-3xl px-4 py-10 md:py-16">
        <p className="text-sm font-semibold text-primary">KingdomFlow legal</p>
        <h1 className="mt-2 text-3xl font-semibold md:text-4xl">{title}</h1>
        <p className="mt-4 text-lg text-muted">{summary}</p>
        <p className="mt-3 text-sm text-muted">Effective 25 September 2026</p>
        <div className="prose-kf mt-10 space-y-8">{children}</div>
        <nav className="mt-12 flex flex-wrap gap-4 border-t border-border pt-6 text-sm text-primary">
          <Link href="/legal/privacy">Privacy notice</Link>
          <Link href="/legal/terms">Terms of service</Link>
          <Link href="/legal/data-processing">Data protection</Link>
        </nav>
      </article>
    </MarketingShell>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3 space-y-3 leading-7 text-muted">{children}</div>
    </section>
  );
}
