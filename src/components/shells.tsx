import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { LogOut, Menu, ChevronDown, ArrowLeftRight } from "lucide-react";
import { getCurrentUser } from "@/lib/app-auth";
import { getVisibleTenantBySlug } from "@/lib/tenant-store";
import { getWorkspaceAccess } from "@/lib/workspace-store";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { userTypes, type ChurchUserType } from "@/lib/user-types";
import { SimpleNavigation, type NavigationItem } from "./simple-navigation";
import { ButtonLink } from "./ui";

function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="flex shrink-0 items-center gap-3 font-semibold"
    >
      <Image
        src="/kingdom-flow-logo.png"
        alt="KingdomFlow"
        width={44}
        height={44}
        className="rounded-md bg-black object-contain"
      />
      <span>KingdomFlow</span>
    </Link>
  );
}
async function UserMenu({ role }: { role?: string }) {
  const user = await getCurrentUser();
  if (!user) return <ButtonLink href="/auth/sign-in">Sign in</ButtonLink>;
  return (
    <div className="flex min-w-0 items-center gap-3 text-sm">
      <span className="hidden max-w-56 truncate text-muted md:block">
        {role ?? user.role}
      </span>
      <a
        href="/auth/logout"
        className="flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 py-2 font-medium text-primary hover:bg-primary-soft"
      >
        <LogOut size={18} />
        <span>Sign out</span>
      </a>
    </div>
  );
}

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Brand />
          <UserMenu />
        </div>
      </header>
      {children}
    </main>
  );
}

const navigation: Record<
  ChurchUserType,
  [string, string, NavigationItem["icon"]][]
> = {
  church_admin: [
    ["People", "people", "people"],
    ["Ministry", "ministry", "ministry"],
    ["Settings", "settings", "settings"],
  ],
  church_leader: [
    ["People", "people", "people"],
    ["Decisions", "decisions", "tasks"],
    ["Reports", "reports", "reports"],
  ],
  ministry_coordinator: [
    ["My people", "people", "people"],
    ["My ministry", "ministry", "ministry"],
    ["Reports", "reports", "reports"],
  ],
  care_worker: [
    ["My people", "people", "people"],
    ["Follow-up", "follow-up", "care"],
    ["Visits", "visits", "events"],
  ],
  finance_officer: [
    ["Giving", "giving", "giving"],
    ["Expenses", "expenses", "expenses"],
    ["Reports", "reports", "reports"],
  ],
  member: [
    ["My classes", "my-classes", "ministry"],
    ["Serve", "my-service", "care"],
    ["Events", "events", "events"],
    ["My profile", "profile", "profile"],
  ],
};

function AppFrame({
  children,
  items,
  name,
  role,
  home,
  workspace = false,
  roleSwitcher,
}: {
  children: ReactNode;
  items: NavigationItem[];
  name: string;
  role: string;
  home: string;
  workspace?: boolean;
  roleSwitcher?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex min-h-18 items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3 md:px-6">
        <Brand href={home} />
        <UserMenu role={role} />
      </header>
      <div className="grid lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="sticky top-[70px] hidden h-[calc(100dvh-70px)] flex-col border-r border-border bg-surface px-3 py-5 lg:flex">
          {workspace ? (
            <Link
              href="/auth/workspaces"
              className="mb-5 flex items-center justify-between gap-2 rounded-md border border-border px-3 py-3 text-sm"
            >
              <span className="truncate font-medium">{name}</span>
              <ChevronDown size={16} className="shrink-0" />
            </Link>
          ) : null}
          <nav className="kf-scrollbar grid content-start gap-1 overflow-y-auto">
            <SimpleNavigation items={items} />
          </nav>
          {roleSwitcher}
          <p className="mt-auto px-3 pt-6 text-xs text-muted">{role}</p>
        </aside>
        <div className="min-w-0">
          <details className="border-b border-border bg-surface px-4 py-3 lg:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold">
              <Menu size={20} />
              Menu
            </summary>
            <nav className="mt-2 grid gap-1">
              <SimpleNavigation items={items} />
              {workspace ? (
                <Link
                  href="/auth/workspaces"
                  className="px-3 py-3 text-sm text-primary"
                >
                  Switch church
                </Link>
              ) : null}
            </nav>
            {roleSwitcher}
          </details>
          <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export async function WorkspaceShell({
  children,
  tenantName,
  tenantSlug = "",
}: {
  children: ReactNode;
  tenantName: string;
  tenantSlug?: string;
}) {
  const tenant = await getVisibleTenantBySlug(tenantSlug);
  const access = tenant ? await getWorkspaceAccess(tenant.id) : undefined;
  const type = access?.member.type ?? "member";
  const base = `/workspace/${tenantSlug}`;
  const hrManager = [
    "church_admin",
    "church_leader",
    "finance_officer",
  ].includes(type);
  const ownStaff =
    !hrManager && tenant && access
      ? await getSupabaseAdmin()
          .from("kf_hr_staff")
          .select("id")
          .eq("tenant_id", tenant.id)
          .eq("user_id", access.user.id)
          .limit(1)
      : undefined;
  const items: NavigationItem[] = [
    { label: "Home", href: base, icon: "home" },
    ...navigation[type].map(([label, section, icon]) => ({
      label,
      href: `${base}/work/${section}`,
      icon,
    })),
    ...(hrManager || ownStaff?.data?.length
      ? [
          {
            label: hrManager ? "Church HR" : "My staff account",
            href: `${base}/hr`,
            icon: "hr" as const,
          },
        ]
      : []),
  ];
  return (
    <AppFrame
      items={items}
      name={tenantName}
      role={userTypes[type]}
      home={base}
      workspace
      roleSwitcher={
        access && (access.member.types?.length ?? 0) > 1 ? (
          <form
            action={`${base}/work/switch`}
            method="post"
            className="mt-4 grid gap-2"
          >
            <label className="grid gap-2 text-xs font-medium">
              Your view
              <select name="type" defaultValue={type}>
                {access.member.types?.map((option) => (
                  <option key={option} value={option}>
                    {userTypes[option]}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-border text-sm font-medium"
              type="submit"
            >
              <ArrowLeftRight size={16} /> Switch view
            </button>
          </form>
        ) : undefined
      }
    >
      {children}
    </AppFrame>
  );
}

export function PlatformShell({ children }: { children: ReactNode }) {
  const items: NavigationItem[] = [
    { label: "Home", href: "/platform", icon: "home" },
    { label: "Churches", href: "/platform/churches", icon: "churches" },
    { label: "Help", href: "/platform/help", icon: "help" },
    { label: "Settings", href: "/platform/settings", icon: "settings" },
  ];
  return (
    <AppFrame
      items={items}
      name="KingdomFlow"
      role="Platform Admin"
      home="/platform"
    >
      {children}
    </AppFrame>
  );
}

export function AuthShell({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-border bg-surface p-6">
        <div className="mb-8">
          <Brand />
        </div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <div className="mt-6">{children}</div>
        <footer className="mt-8 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-5 text-xs text-muted">
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/data-processing">Data protection</Link>
        </footer>
      </section>
    </main>
  );
}
