import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata = { title: "Terms of service | KingdomFlow" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      summary="The basic rules for churches, administrators, leaders, staff, and members using KingdomFlow."
    >
      <LegalSection title="Using the service">
        <p>
          You must provide accurate information, keep credentials private, and
          use KingdomFlow only for lawful church and ministry operations. A
          church administrator is responsible for assigning appropriate access
          and obtaining any consent required for the records it enters.
        </p>
      </LegalSection>
      <LegalSection title="Account responsibility">
        <p>
          Each person should use their own account. Notify the church and
          KingdomFlow promptly about suspected unauthorised access. We may
          suspend access where needed to protect people, churches, or the
          platform.
        </p>
      </LegalSection>
      <LegalSection title="Subscriptions and payments">
        <p>
          Paid features, prices, billing cycles, taxes, renewal terms, and trial
          conditions are those shown in the accepted order or subscription
          screen. A payment is complete only after confirmation from the
          configured payment provider.
        </p>
      </LegalSection>
      <LegalSection title="Church content and confidentiality">
        <p>
          The church retains responsibility for its records and content.
          KingdomFlow receives the limited rights needed to host, process,
          secure, back up, and return that content. Users must protect pastoral,
          safeguarding, giving, and HR information as confidential.
        </p>
      </LegalSection>
      <LegalSection title="Availability and changes">
        <p>
          We work to keep the service available and will communicate material
          changes where practical. Planned maintenance, emergencies, provider
          outages, and legal or security requirements may affect availability.
        </p>
      </LegalSection>
      <LegalSection title="Liability and governing law">
        <p>
          KingdomFlow is an operational tool and does not replace professional
          legal, safeguarding, accounting, medical, or pastoral judgement.
          Contract-specific liability terms take precedence. Unless an order
          states otherwise, these terms are governed by the laws of Kenya.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
