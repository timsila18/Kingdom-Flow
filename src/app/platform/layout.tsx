import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/app-auth";

export default async function PlatformLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in?next=/platform");
  if (!user.isSuperAdmin) redirect("/auth/workspaces");
  return children;
}
