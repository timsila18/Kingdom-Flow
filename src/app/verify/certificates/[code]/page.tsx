import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/shells";
import { Badge, Card, PageHeader } from "@/components/ui";
import { verifyCertificate } from "@/lib/programmes-engine";

export default async function CertificateVerificationPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const result = verifyCertificate(code);
  if (result.status === "not found") notFound();
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-6 py-12">
        <PageHeader title="Certificate Verification" description="Public verification shows only safe certificate details." actions={<Badge tone={result.status === "valid" ? "success" : "warning"}>{result.status}</Badge>} />
        <Card className="mt-8">
          <p className="text-sm text-muted">Certificate number</p>
          <h2 className="mt-1 text-xl font-semibold">{result.certificateNumber}</h2>
          <div className="mt-6 grid gap-3 text-sm md:grid-cols-2">
            <p><strong>Learner:</strong> {result.learnerName}</p>
            <p><strong>Programme:</strong> {result.programme}</p>
            <p><strong>Church:</strong> {result.church}</p>
            <p><strong>Issue date:</strong> {result.issueDate}</p>
          </div>
        </Card>
      </section>
    </MarketingShell>
  );
}
