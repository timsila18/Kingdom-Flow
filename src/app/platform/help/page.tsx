import { PlatformShell } from "@/components/shells";
import { PageHeader, ButtonLink } from "@/components/ui";
export default function HelpPage() {
  return (
    <PlatformShell>
      <PageHeader title="Help" />
      <ol className="mt-6 grid gap-6">
        <li>
          <h2 className="font-semibold">1. Register a church</h2>
          <div className="mt-3">
            <ButtonLink href="/onboarding">Add church</ButtonLink>
          </div>
        </li>
        <li>
          <h2 className="font-semibold">2. Review the registration</h2>
          <div className="mt-3">
            <ButtonLink href="/platform/churches">Review churches</ButtonLink>
          </div>
        </li>
        <li>
          <h2 className="font-semibold">3. Set up the church</h2>
          <div className="mt-3">
            <ButtonLink href="/auth/workspaces">Open your churches</ButtonLink>
          </div>
        </li>
      </ol>
    </PlatformShell>
  );
}
