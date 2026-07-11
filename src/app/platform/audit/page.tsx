import { PlatformShell } from "@/components/shells";
import { Card, PageHeader } from "@/components/ui";
import { auditLogs } from "@/lib/data";

export default function PlatformAuditPage() {
  return (
    <PlatformShell>
      <PageHeader title="Platform audit trail" description="Administrative events are append-only in the database model and not editable through ordinary user interfaces." />
      <Card className="mt-8">
        <table className="w-full text-left text-sm">
          <thead className="text-muted"><tr><th className="py-2">Action</th><th>Actor</th><th>Entity</th><th>Result</th><th>Time</th></tr></thead>
          <tbody>{auditLogs.map((log) => <tr key={log.id} className="border-t border-border"><td className="py-3">{log.action}</td><td>{log.actorName}</td><td>{log.entityType}</td><td>{log.result}</td><td>{new Date(log.createdAt).toLocaleString()}</td></tr>)}</tbody>
        </table>
      </Card>
    </PlatformShell>
  );
}
