import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata = { title: "Privacy notice | KingdomFlow" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy notice"
      summary="How KingdomFlow handles personal information when churches and their people use the service."
    >
      <LegalSection title="Who controls your information">
        <p>
          The church or ministry that invited you normally decides why your
          member, pastoral, giving, ministry, or employment information is used.
          KingdomFlow processes that information to provide the service. For
          platform account, security, billing, and support information,
          KingdomFlow may act as the data controller.
        </p>
      </LegalSection>
      <LegalSection title="Information we process">
        <p>
          Depending on the features your church uses, this can include account
          and contact details, church participation, attendance, follow-up,
          pastoral-care records, giving records, staff and payroll records,
          device information, and security logs.
        </p>
      </LegalSection>
      <LegalSection title="Why we process it">
        <p>
          We process information to authenticate users, operate church
          workflows, protect the service, provide support, meet contractual and
          legal duties, and improve reliability. Sensitive pastoral or HR data
          is only exposed to authorised roles configured by the church.
        </p>
      </LegalSection>
      <LegalSection title="Retention and sharing">
        <p>
          Churches control their operational retention settings, subject to
          applicable law. Information may be shared with infrastructure,
          authentication, payment, email, or messaging providers only where
          needed to deliver configured services. KingdomFlow does not sell
          personal information.
        </p>
      </LegalSection>
      <LegalSection title="Your choices and rights">
        <p>
          Ask your church to access, correct, export, restrict, or delete church
          records about you. Platform privacy questions can be sent to
          privacy@kingdomflow.co.ke. Requests may require identity verification
          and may be limited by legal retention obligations.
        </p>
      </LegalSection>
      <LegalSection title="Security and international processing">
        <p>
          KingdomFlow uses role-based access, encrypted transport, audit trails,
          and service-provider controls. No system is risk-free. Where data is
          processed outside Kenya, appropriate contractual and technical
          safeguards should be used.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
