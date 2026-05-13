import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";

const steps = [
  "Enter a nickname",
  "Create or join a private room",
  "Ready up in the lobby",
  "Host starts the game set",
  "Laugh through five fast rounds",
  "Share the recap and rematch",
];

export default function HowItWorksPage() {
  return (
    <PageLayout>
      <section className="space-y-2">
        <p className="eyebrow">How it works</p>
        <h1 className="text-5xl text-shimmer">From room code to chaos</h1>
        <p className="max-w-2xl text-text-secondary">
          The flow is intentionally short, loud, and fast so the party stays moving.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <Card key={step}>
            <p className="eyebrow">Step {index + 1}</p>
            <h3 className="text-2xl text-shimmer">{step}</h3>
          </Card>
        ))}
      </section>
    </PageLayout>
  );
}
