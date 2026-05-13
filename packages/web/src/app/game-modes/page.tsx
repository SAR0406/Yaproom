import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";

const modes = [
  {
    title: "Imposter / Undercover",
    description: "One friend gets the wrong word. Everyone else sniffs them out.",
  },
  {
    title: "Cursed Drawing",
    description: "Draw fast, guess faster, survive the chaos modifiers.",
  },
  {
    title: "Expose / Vote",
    description: "Vote on who fits the prompt. Points for pure chaos energy.",
  },
  {
    title: "Confession / Guess Who",
    description: "Anonymous confessions. Guess who wrote the tea.",
  },
  {
    title: "Split or Steal",
    description: "Secret choices, public betrayals, instant drama.",
  },
];

export default function GameModesPage() {
  return (
    <PageLayout>
      <section className="space-y-2">
        <p className="eyebrow">Game modes</p>
        <h1 className="text-5xl text-shimmer">One room, many flavors of chaos</h1>
        <p className="max-w-2xl text-text-secondary">
          Each mode pushes a different social pressure point while keeping the same neon-brutal vibe.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {modes.map((mode) => (
          <Card key={mode.title}>
            <p className="eyebrow">Mode</p>
            <h3 className="text-2xl text-shimmer">{mode.title}</h3>
            <p className="mt-3 text-sm text-text-secondary">{mode.description}</p>
          </Card>
        ))}
      </section>
    </PageLayout>
  );
}
