import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata = { title: "Data protection | KingdomFlow" };

export default function DataProcessingPage() {
  return (
    <LegalPage
      title="Data protection commitments"
      summary="A plain-language summary of the controls that support a church's data-protection responsibilities."
    >
      <LegalSection title="Processing instructions">
        <p>
          KingdomFlow processes church-controlled personal information to
          provide the subscribed service and documented support. The church is
          responsible for lawful instructions, notices, consent where required,
          and the access it grants to its users.
        </p>
      </LegalSection>
      <LegalSection title="Access and confidentiality">
        <p>
          Access is limited by tenant, role, and workspace. Personnel and
          service providers with access are expected to follow confidentiality
          and security obligations appropriate to their duties.
        </p>
      </LegalSection>
      <LegalSection title="Security incidents">
        <p>
          Suspected incidents are investigated, contained, documented, and
          communicated to affected customers where required by law or contract.
          Churches should report concerns promptly to
          security@kingdomflow.co.ke.
        </p>
      </LegalSection>
      <LegalSection title="Return, export, and deletion">
        <p>
          Authorised administrators can request an export or deletion when a
          subscription ends, subject to identity checks, backups, active legal
          holds, and statutory retention duties. Backup copies expire through
          controlled retention cycles.
        </p>
      </LegalSection>
      <LegalSection title="Formal agreement">
        <p>
          This page is a product summary, not a signed data-processing
          agreement. Enterprise and regulated customers should execute a formal
          agreement describing scope, sub-processors, retention, assistance,
          audits, and cross-border safeguards before production use.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
