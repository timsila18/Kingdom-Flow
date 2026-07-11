import { AuthShell } from "@/components/shells";

export default function PendingPage() {
  return (
    <AuthShell title="Account pending approval">
      <p className="text-sm leading-6 text-muted">Your church registration has been submitted and is waiting for KingdomFlow platform review.</p>
    </AuthShell>
  );
}
