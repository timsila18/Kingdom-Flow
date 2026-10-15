import { cookies } from "next/headers";
import { appSessionCookie } from "./auth-constants";
import { createClient } from "@supabase/supabase-js";
import { cache } from "react";

export const getCurrentUser = cache(async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(appSessionCookie)?.value;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!token || !url || !key) return undefined;
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user?.email) return undefined;
  const isSuperAdmin = ["super_admin", "platform_admin"].includes(
    user.app_metadata?.role,
  );

  return {
    email: user.email,
    id: user.id,
    name:
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : user.email,
    role: isSuperAdmin ? "Platform Admin" : "Church user",
    isSuperAdmin,
  };
});
