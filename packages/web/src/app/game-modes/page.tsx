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
      <section className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold text-foreground">Game modes</h1>
        <p className="text-muted">
          Five mini-games. One room. Infinite inside jokes.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {modes.map((mode) => (
          <Card key={mode.title}>
            <h3 className="text-lg font-semibold text-foreground">{mode.title}</h3>
            <p className="mt-2 text-sm text-muted">{mode.description}</p>
          </Card>
        ))}
      </section>
    </PageLayout>
  );
}
