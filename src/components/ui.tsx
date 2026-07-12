import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { clsx } from "clsx";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" | "accent" }) {
  const tones = {
    neutral: "border-border bg-surface-muted text-foreground",
    success: "border-green-200 bg-green-50 text-success dark:bg-green-950",
    warning: "border-amber-200 bg-amber-50 text-warning dark:bg-amber-950",
    danger: "border-red-200 bg-red-50 text-danger dark:bg-red-950",
    accent: "border-amber-200 bg-accent-soft text-accent",
  };
  return <span className={clsx("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", tones[tone])}>{children}</span>;
}

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: "primary" | "secondary" }) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex min-h-10 items-center justify-center rounded-md px-4 text-sm font-semibold shadow-[0_1px_0_rgba(255,255,255,.12)_inset] transition hover:-translate-y-0.5",
        variant === "primary" ? "border border-accent/70 bg-primary text-black hover:bg-accent" : "border border-border bg-surface text-foreground hover:border-accent hover:bg-surface-muted",
      )}
    >
      {children}
    </Link>
  );
}

export function Card({ children, className, ...props }: ComponentPropsWithoutRef<"section">) {
  return <section className={clsx("rounded-lg border border-border/90 bg-surface/92 p-5 shadow-[0_1px_0_rgba(255,255,255,.08)_inset,0_22px_60px_rgba(0,0,0,.28)] backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-[0_1px_0_rgba(255,255,255,.12)_inset,0_26px_70px_rgba(0,0,0,.36)]", className)} {...props}>{children}</section>;
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal text-foreground md:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <Card>
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-foreground tabular-nums">{value}</p>
      {detail ? <p className="mt-2 text-xs leading-5 text-muted">{detail}</p> : null}
    </Card>
  );
}

export function EmptyPhase({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface-muted p-6 text-sm text-muted">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-2 leading-6">{description}</p>
    </div>
  );
}
