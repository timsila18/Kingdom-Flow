import { notFound } from "next/navigation";
import {
  AccessReviewsPanel,
  ActingPanel,
  ApprovalsPanel,
  DelegationsPanel,
  DiagnosticPanel,
  EffectiveAccessPanel,
  GovernancePanel,
  LeadershipPanel,
  LimitsPanel,
  RoleBuilderPanel,
  RolesPermissionsPanel,
  UserAccessPanel,
  WorkflowsPanel,
} from "@/components/authority";
import { WorkspaceShell } from "@/components/shells";
import { getTenantBySlug } from "@/lib/data";

const sections = {
  "roles-permissions": RolesPermissionsPanel,
  "role-builder": RoleBuilderPanel,
  "user-access": UserAccessPanel,
  leadership: LeadershipPanel,
  governance: GovernancePanel,
  delegations: DelegationsPanel,
  acting: ActingPanel,
  workflows: WorkflowsPanel,
  approvals: ApprovalsPanel,
  "access-reviews": AccessReviewsPanel,
  "effective-access": EffectiveAccessPanel,
  diagnostic: DiagnosticPanel,
  limits: LimitsPanel,
};

export default async function AuthoritySectionPage({ params }: { params: Promise<{ slug: string; section: keyof typeof sections }> }) {
  const { slug, section } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) notFound();
  const Panel = sections[section];
  if (!Panel) notFound();

  return (
    <WorkspaceShell tenantName={tenant.publicName}>
      <Panel slug={slug} />
    </WorkspaceShell>
  );
}
