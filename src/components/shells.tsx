import Link from "next/link";
import type { ReactNode } from "react";
import { Bell, Building2, ChevronDown, LayoutDashboard, ShieldCheck } from "lucide-react";
import { navigationModules } from "@/lib/constants";
import { ButtonLink } from "./ui";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <span className="grid size-9 place-items-center rounded-md bg-primary text-sm text-white">KF</span>
          <span>KingdomFlow</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <Link href="/onboarding">Create church account</Link>
          <Link href="/platform">Platform admin</Link>
          <Link href="/workspace/kings-grace">Demo workspace</Link>
        </nav>
        <ButtonLink href="/auth/sign-in">Sign in</ButtonLink>
      </header>
      {children}
    </main>
  );
}

export function WorkspaceShell({ children, tenantName }: { children: ReactNode; tenantName: string }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
      <aside className="border-r border-border bg-surface px-4 py-5">
        <Link href="/workspace/kings-grace" className="flex items-center gap-3 px-2 font-semibold">
          <span className="grid size-9 place-items-center rounded-md bg-primary text-white">KF</span>
          <span>{tenantName}</span>
        </Link>
        <button className="mt-5 flex w-full items-center justify-between rounded-md border border-border bg-surface-muted px-3 py-2 text-left text-sm" aria-label="Switch workspace">
          <span>Workspace: King&apos;s Grace</span>
          <ChevronDown size={16} />
        </button>
        <nav className="mt-6 grid gap-1 text-sm">
          {navigationModules.map(([label, href]) =>
            href === "later" ? (
              <span key={label} className="flex items-center justify-between rounded-md px-3 py-2 text-muted">
                {label}
                <span className="text-[10px] uppercase">Later</span>
              </span>
            ) : (
              <Link key={label} href={href} className="rounded-md px-3 py-2 text-foreground hover:bg-surface-muted">
                {label}
              </Link>
            ),
          )}
        </nav>
      </aside>
      <div>
        <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <LayoutDashboard size={16} />
            <span>Church workspace</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-md border border-border p-2" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <ButtonLink href="/auth/workspaces" variant="secondary">Switch</ButtonLink>
          </div>
        </header>
        <main className="px-5 py-7 md:px-8">{children}</main>
      </div>
    </div>
  );
}

export function PlatformShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/platform" className="flex items-center gap-3 font-semibold">
            <ShieldCheck size={22} />
            KingdomFlow Platform Admin
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/platform/churches">Churches</Link>
            <Link href="/platform/plans">Plans</Link>
            <Link href="/platform/audit">Audit</Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}

export function AuthShell({ children, title }: { children: ReactNode; title: string }) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-sm">
        <Link href="/" className="mb-8 flex items-center gap-3 font-semibold">
          <Building2 size={22} />
          KingdomFlow
        </Link>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}
