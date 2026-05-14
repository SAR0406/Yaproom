'use client';

import { RoomLayout } from '@/components/RoomLayout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { startGame, updateQueue } from '@/lib/roomActions';
import { getModeBlueprint, launchPresets, liveModeQueue } from '@/lib/modeCatalog';

const presetOrder = ['starter', 'pressure', 'showcase'] as const;

export default function GameSelectionPage() {
  return (
    <RoomLayout>
      {(room) => {
        const queueBlueprints = room.queue.map((mode) => getModeBlueprint(mode));
        const nextMode = room.queue[0];
        const nextModeBlueprint = nextMode ? getModeBlueprint(nextMode) : null;

        return (
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="space-y-4 brutal-panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">Game selection</p>
                  <h2 className="text-xl font-semibold text-foreground">Set tonight&apos;s setlist</h2>
                </div>
                <span className="rounded-full border border-black bg-lime-200 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-black">
                  {room.queue.length} queued
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {presetOrder.map((preset) => (
                  <Button
                    key={preset}
                    variant="secondary"
                    size="sm"
                    onClick={() => updateQueue(launchPresets[preset])}
                  >
                    {preset}
                  </Button>
                ))}
                <Button variant="secondary" size="sm" onClick={() => updateQueue(liveModeQueue)}>
                  Reset live setlist
                </Button>
                <Button variant="secondary" size="sm" onClick={() => updateQueue(shuffleModes(liveModeQueue))}>
                  Randomize live modes
                </Button>
              </div>

              <ul className="space-y-2 text-sm text-foreground">
                {room.queue.map((mode, index) => {
                  const blueprint = queueBlueprints[index];
                  return (
                    <li
                      key={`${mode}-${index}`}
                      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-surface px-4 py-3 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div>
                        <p className="text-base font-semibold text-foreground">
                          {index + 1}. {blueprint.title}
                        </p>
                        <p className="text-xs text-muted">{blueprint.shortPitch}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={index === 0}
                          onClick={() => {
                            if (index === 0) return;
                            const queue = [...room.queue];
                            [queue[index - 1], queue[index]] = [queue[index], queue[index - 1]];
                            updateQueue(queue);
                          }}
                        >
                          ↑
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={index === room.queue.length - 1}
                          onClick={() => {
                            if (index === room.queue.length - 1) return;
                            const queue = [...room.queue];
                            [queue[index + 1], queue[index]] = [queue[index], queue[index + 1]];
                            updateQueue(queue);
                          }}
                        >
                          ↓
                        </Button>
                        <Button size="sm" onClick={() => startGame(mode)}>
                          Start now
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>

            <Card className="space-y-4 brutal-panel">
              <p className="eyebrow">Next up</p>
              <h3 className="text-3xl text-shimmer">{nextModeBlueprint?.title ?? 'No mode selected'}</h3>
              <p className="text-sm text-muted">
                {nextModeBlueprint?.summary ?? 'Use a preset or reorder the queue to set the session tone.'}
              </p>
              {nextModeBlueprint ? (
                <>
                  <div className="grid gap-2 text-sm text-foreground">
                    <div className="rounded-2xl border border-white/10 bg-surface px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-muted">Player count</p>
                      <p className="font-semibold">{nextModeBlueprint.playerRange}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-surface px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-muted">Loop</p>
                      <p className="font-semibold">{nextModeBlueprint.loop.join(' → ')}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-black/70">
                    {nextModeBlueprint.vibeTags.map((tag) => (
                      <span key={tag} className="rounded-full border border-black px-2 py-1">{tag}</span>
                    ))}
                  </div>
                </>
              ) : null}
            </Card>
          </div>
        );
      }}
    </RoomLayout>
  );
}

function shuffleModes(modes: typeof liveModeQueue): typeof liveModeQueue {
  const next = [...modes];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}
