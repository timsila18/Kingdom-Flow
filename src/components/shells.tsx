import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { Bell, ChevronDown, LayoutDashboard } from "lucide-react";
import { navigationModules } from "@/lib/constants";
import { ButtonLink } from "./ui";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <Image src="/kingdom-flow-logo.png" alt="KingdomFlow" width={48} height={48} className="rounded-md object-contain" />
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
    <div className="grid min-h-screen lg:grid-cols-[300px_1fr]">
      <aside className="sticky top-0 hidden h-screen overflow-hidden border-r border-[#443620] bg-[linear-gradient(165deg,#050504,#11100d_45%,#1b160d)] px-4 py-5 text-foreground shadow-[20px_0_70px_rgba(0,0,0,.45)] lg:block">
        <Link href="/workspace/kings-grace" className="flex items-center gap-3 px-2 font-semibold">
          <Image src="/kingdom-flow-logo.png" alt="KingdomFlow" width={48} height={48} className="rounded-lg object-contain shadow-[0_0_28px_rgba(229,200,120,.18)]" />
          <span className="min-w-0 truncate">{tenantName}</span>
        </Link>
        <Link href="/auth/workspaces" className="mt-5 flex w-full items-center justify-between rounded-md border border-border bg-surface-muted px-3 py-2 text-left text-sm text-foreground shadow-[0_1px_0_rgba(255,255,255,.08)_inset]" aria-label="Switch workspace">
          <span>Workspace: King&apos;s Grace</span>
          <ChevronDown size={16} />
        </Link>
        <nav className="kf-scrollbar mt-6 grid max-h-[calc(100vh-132px)] gap-1 overflow-y-auto pr-1 text-sm">
          {navigationModules.map(([label, href]) => (
            <Link key={label} href={href} className="rounded-md px-3 py-2 text-muted transition hover:bg-surface-muted hover:text-foreground hover:shadow-[0_0_24px_rgba(229,200,120,.10)]">
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border/70 bg-surface/90 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-2 text-sm text-muted">
            <LayoutDashboard size={16} />
            <span className="hidden sm:inline">Church workspace</span>
            <span className="font-medium text-foreground sm:hidden">KingdomFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-md border border-border bg-surface p-2" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <ButtonLink href="/auth/workspaces" variant="secondary">Switch</ButtonLink>
          </div>
        </header>
        <nav className="kf-scrollbar flex gap-2 overflow-x-auto border-b border-border/70 bg-surface/80 px-5 py-3 text-sm lg:hidden">
          {navigationModules.map(([label, href]) => (
            <Link key={label} href={href} className="shrink-0 rounded-full border border-border bg-surface px-3 py-2 font-medium text-foreground">
              {label}
            </Link>
          ))}
        </nav>
        <main className="px-5 py-7 md:px-8">{children}</main>
      </div>
    </div>
  );
}

export function PlatformShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface text-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/platform" className="flex items-center gap-3 font-semibold">
            <Image src="/kingdom-flow-logo.png" alt="KingdomFlow" width={44} height={44} className="rounded-md object-contain" />
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
      <section className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-[0_24px_70px_rgba(0,0,0,.35)]">
        <Link href="/" className="mb-8 flex items-center gap-3 font-semibold">
          <Image src="/kingdom-flow-logo.png" alt="KingdomFlow" width={56} height={56} className="rounded-md object-contain" />
          KingdomFlow
        </Link>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}
