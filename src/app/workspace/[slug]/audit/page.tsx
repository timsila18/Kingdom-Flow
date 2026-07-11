import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/shells";
import { Card, PageHeader } from "@/components/ui";
import { auditLogs, getTenantBySlug } from "@/lib/data";

export default async function AuditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  const logs = auditLogs.filter((log) => log.tenantId === tenant.id);
  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <PageHeader title="Audit trail" description="Searchable administrative activity foundation. Secrets are redacted and records are immutable in the schema." />
      <Card className="mt-8">
        <input className="mb-4 w-full rounded-md border border-border px-3 py-2 text-sm" placeholder="Search action, actor or entity" />
        <table className="w-full text-left text-sm">
          <thead className="text-muted"><tr><th className="py-2">Action</th><th>Actor</th><th>Scope</th><th>Result</th><th>Time</th></tr></thead>
          <tbody>{logs.map((log) => <tr key={log.id} className="border-t border-border"><td className="py-3">{log.action}</td><td>{log.actorName}</td><td>{log.scopeType}</td><td>{log.result}</td><td>{new Date(log.createdAt).toLocaleString()}</td></tr>)}</tbody>
        </table>
      </Card>
    </WorkspaceShell>
  );
}
