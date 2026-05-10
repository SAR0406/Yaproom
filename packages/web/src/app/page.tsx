import Link from "next/link";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { LandingJoinCard } from "@/components/LandingJoinCard";
import { PageLayout } from "@/components/PageLayout";

export default function Home() {
  return (
    <PageLayout>
      <section className="flex flex-col gap-10 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-col gap-6">
          <Badge>One room. Five kinds of chaos.</Badge>
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
            Yapzi turns your group chat into a live party game.
          </h1>
          <p className="text-lg text-muted">
            Jump in with a nickname, vibe in the lobby, and rotate through five
            fast mini-games built for Discord chaos and IG friend groups.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/create">
              <Button size="lg">Create a room</Button>
            </Link>
            <Link href="/game-modes">
              <Button variant="secondary" size="lg">
                Explore game modes
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <LandingJoinCard />
          <Card className="grid gap-4">
            <div>
              <p className="text-sm text-muted">Tonight&apos;s Setlist</p>
              <p className="text-lg font-semibold text-foreground">
                Imposter → Drawing → Expose → Confession → Split or Steal
              </p>
            </div>
            <div className="grid gap-2 text-sm text-muted">
              <span>⚡ 10-second join flow</span>
              <span>🎙️ Voice-first, camera optional</span>
              <span>🔥 Chaos events keep rounds spicy</span>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Instant join",
            text: "No accounts, no friction. Drop a nickname and go.",
          },
          {
            title: "Private rooms",
            text: "Lock the code, control the chaos, keep it cozy.",
          },
          {
            title: "Replayable mini-games",
            text: "Five modes, endless inside jokes, nightly rematches.",
          },
        ].map((item) => (
          <Card key={item.title}>
            <h3 className="text-lg font-semibold text-foreground">
              {item.title}
            </h3>
            <p className="mt-2 text-sm text-muted">{item.text}</p>
          </Card>
        ))}
      </section>
    </PageLayout>
  );
}
