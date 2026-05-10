import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";

export default function LegalPage() {
  return (
    <PageLayout>
      <Card className="max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground">Legal</h1>
        <p className="mt-2 text-sm text-muted">
          Yapzi is an early access experience. Be kind, keep it fun, and don&apos;t
          share personal data you wouldn&apos;t want on a leaderboard.
        </p>
        <div className="mt-6 space-y-3 text-sm text-muted">
          <p>
            We collect anonymous room activity to keep games running smoothly.
          </p>
          <p>
            Moderation tools let hosts remove harmful content and players. Report
            abuse via the host.
          </p>
        </div>
      </Card>
    </PageLayout>
  );
}
