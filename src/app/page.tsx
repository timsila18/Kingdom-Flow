import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/app-auth";
export default async function Home() {
  const user = await getCurrentUser();
  redirect(user ? user.isSuperAdmin ? "/platform" : "/auth/workspaces" : "/auth/sign-in");
}
