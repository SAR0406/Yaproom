import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";

import { PhaserStage } from "@/components/PhaserStage";
import { modeCatalog, liveModeCatalog } from "@/lib/modeCatalog";

const roadmapModes = modeCatalog.filter((entry) => entry.status === "roadmap");

export default function GameModesPage() {
  return (
    <PageLayout>
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="space-y-5 brutal-panel">
          <div className="space-y-2">
            <p className="eyebrow">Game modes</p>
            <h1 className="text-5xl text-shimmer">One room, many pressure points</h1>
            <p className="max-w-2xl text-text-secondary">
              The live set is small on purpose: each mode has a clear job, a clear pace, and a visible role in the night.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.12em] text-black/70">
            <span className="rounded-full border border-black bg-lime-200 px-3 py-1">{liveModeCatalog.length} live modes</span>
            <span className="rounded-full border border-black bg-cyan-200 px-3 py-1">Roadmap visible</span>
            <span className="rounded-full border border-black bg-magenta-200 px-3 py-1">Built for room energy</span>
          </div>
          <PhaserStage
            label="Mode atlas"
            subtitle="The stage mirrors the product: clear, loud, and designed around live room flow."
            highlights={liveModeCatalog.slice(0, 3).map((entry) => entry.title)}
            className="bg-panel"
          />
        </Card>

        <Card className="space-y-4 brutal-panel">
          <p className="eyebrow">Launch logic</p>
          <h2 className="text-3xl">Live modes first</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {liveModeCatalog.map((mode) => (
              <div key={mode.mode} className="rounded-2xl border-[4px] border-black bg-white p-4 shadow-[6px_6px_0_0_#111]">
                <div className="flex items-center justify-between gap-2">
                  <p className="eyebrow">{mode.title}</p>
                  <span className="rounded-full border border-black px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em]">Live</span>
                </div>
                <p className="mt-2 text-sm text-text-secondary">{mode.shortPitch}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-black/60">{mode.playerRange}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-black/70">
                  {mode.vibeTags.map((tag) => (
                    <span key={tag} className="rounded-full border border-black px-2 py-1">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {roadmapModes.map((mode) => (
          <Card key={mode.mode} className="space-y-3 brutal-panel">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Roadmap</p>
                <h3 className="text-2xl text-shimmer">{mode.title}</h3>
              </div>
              <span className="rounded-full border border-black bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                Coming later
              </span>
            </div>
            <p className="text-sm text-text-secondary">{mode.summary}</p>
            <p className="text-sm font-semibold text-black/80">Best for: {mode.bestFor}</p>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-black/70">
              {mode.loop.map((step) => (
                <span key={step} className="rounded-full border border-black px-2 py-1">{step}</span>
              ))}
            </div>
          </Card>
        ))}
      </section>
    </PageLayout>
  );
}
