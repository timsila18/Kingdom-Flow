import { AuthShell } from "@/components/shells";

export default function SuspendedPage() {
  return (
    <AuthShell title="Workspace suspended">
      <p className="text-sm leading-6 text-muted">This workspace is temporarily unavailable. Contact platform support or your church administrator for the reviewed reason.</p>
    </AuthShell>
  );
}
