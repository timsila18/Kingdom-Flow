import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

nextEnv.loadEnvConfig(process.cwd());
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const key = process.env.ADMIN_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!email || !password || !key || key.includes("SENSITIVE")) {
  throw new Error("Administrator email, password and Supabase admin key are required.");
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
let existing;
for (let page = 1; ; page++) {
  const { data, error } = await client.auth.admin.listUsers({ page, perPage: 100 });
  if (error) throw new Error(`Account lookup failed (${error.status ?? "unknown status"}, ${error.code ?? error.name}): ${error.message}`);
  existing = data.users.find(user => user.email?.toLowerCase() === email.toLowerCase());
  if (existing || data.users.length < 100) break;
}
const attributes = { password, email_confirm: true, app_metadata: { ...existing?.app_metadata, role: "super_admin" } };
const result = existing
  ? await client.auth.admin.updateUserById(existing.id, attributes)
  : await client.auth.admin.createUser({ email, ...attributes });
if (result.error) throw new Error(`Account setup failed: ${result.error.message}`);
const publicClient = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
const login = await publicClient.auth.signInWithPassword({ email, password });
if (login.error || login.data.user?.app_metadata?.role !== "super_admin") throw new Error("Administrator login verification failed.");
console.log("Super administrator account configured; password login and role verified.");
