import { PlatformShell } from "@/components/shells";
import { PageHeader, ButtonLink } from "@/components/ui";
export default function SettingsPage() {
  return (
    <PlatformShell>
      <PageHeader title="Platform settings" />
      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href="/platform/plans" variant="secondary">
          Plans
        </ButtonLink>
        <ButtonLink href="/platform/audit" variant="secondary">
          Audit records
        </ButtonLink>
        <ButtonLink href="/auth/workspaces" variant="secondary">
          Your churches
        </ButtonLink>
      </div>
    </PlatformShell>
  );
}
