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
      <section className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold text-foreground">How Yapzi works</h1>
        <p className="text-muted">
          The fastest way to turn a group chat into a party night.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <Card key={step}>
            <p className="text-sm text-muted">Step {index + 1}</p>
            <h3 className="text-lg font-semibold text-foreground">{step}</h3>
          </Card>
        ))}
      </section>
    </PageLayout>
  );
}
