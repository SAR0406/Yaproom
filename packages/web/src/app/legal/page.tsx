import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";

export default function LegalPage() {
  return (
    <PageLayout>
      <Card className="max-w-3xl space-y-4">
        <p className="eyebrow">Legal</p>
        <h1 className="text-4xl text-shimmer">Keep it fun</h1>
        <p className="text-sm text-text-secondary">
          Yapzi is an early access experience. Be kind, keep it fun, and don&apos;t share personal data you wouldn&apos;t want on a leaderboard.
        </p>
        <div className="space-y-3 text-sm text-text-secondary">
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
