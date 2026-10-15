"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Church,
  HelpCircle,
  Settings,
  HeartHandshake,
  BookOpen,
  CalendarDays,
  Wallet,
  Receipt,
  ClipboardList,
  BarChart3,
  UserRound,
  BriefcaseBusiness,
} from "lucide-react";
const icons = {
  home: Home,
  people: Users,
  churches: Church,
  help: HelpCircle,
  settings: Settings,
  care: HeartHandshake,
  ministry: BookOpen,
  events: CalendarDays,
  giving: Wallet,
  expenses: Receipt,
  tasks: ClipboardList,
  reports: BarChart3,
  profile: UserRound,
  hr: BriefcaseBusiness,
};
export type NavigationItem = {
  label: string;
  href: string;
  icon: keyof typeof icons;
};
export function SimpleNavigation({ items }: { items: NavigationItem[] }) {
  const path = usePathname();
  return (
    <>
      {items.map((item) => {
        const Icon = icons[item.icon];
        const active =
          path === item.href ||
          (item.icon === "hr" && path.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-12 items-center gap-3 rounded-md px-3 py-3 text-sm font-medium ${active ? "bg-primary-soft text-primary" : "text-foreground hover:bg-surface-muted"}`}
          >
            <Icon size={20} className="shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
