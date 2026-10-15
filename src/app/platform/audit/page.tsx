import { PlatformShell } from "@/components/shells";
import { PageHeader } from "@/components/ui";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getVisibleTenants } from "@/lib/tenant-store";
export default async function AuditPage() {
  const tenants = await getVisibleTenants();
  const { data, error } = tenants.length ? await getSupabaseAdmin().from("audit_logs").select("id,action,reason,created_at,tenant_id").eq("entity_type", "tenant").in("tenant_id", tenants.map(tenant => tenant.id)).order("created_at", { ascending: false }).limit(100) : { data: [], error: null };
  return <PlatformShell><PageHeader title="Church review history" />{error ? <p role="alert" className="mt-6 text-danger">Review history could not be loaded.</p> : <ul className="mt-6 divide-y divide-border">{data?.map(log => <li key={log.id} className="py-4"><p className="font-medium">{tenants.find(tenant => tenant.id === log.tenant_id)?.publicName}</p><p className="text-sm">{log.action.replaceAll(".", " ").replaceAll("_", " ")}</p><p className="text-sm text-muted">{new Date(log.created_at).toLocaleString()}{log.reason ? ` · ${log.reason}` : ""}</p></li>)}{!data?.length ? <li className="py-6 text-muted">No church decisions recorded yet.</li> : null}</ul>}</PlatformShell>;
}
