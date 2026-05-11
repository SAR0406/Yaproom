'use client';

import { RoomLayout } from '@/components/RoomLayout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { gameModeLabels } from '@/lib/gameEngine';
import { startGame, updateQueue } from '@/lib/roomActions';
import type { GameMode } from '@yapzi/shared';

const allModes: GameMode[] = ['imposter', 'drawing', 'expose', 'confession', 'split'];

export default function GameSelectionPage() {
  return (
    <RoomLayout>
      {(room) => (
        <Card>
          <h2 className="text-xl font-semibold text-foreground">Game selection</h2>
          <p className="mt-2 text-sm text-muted">Set tonight&apos;s setlist and launch any mode.</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => updateQueue(allModes)}>
              Reset default setlist
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => updateQueue(shuffleModes(allModes))}
            >
              Randomize all modes
            </Button>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-foreground">
            {room.queue.map((mode, index) => (
              <li
                key={`${mode}-${index}`}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-surface px-4 py-3"
              >
                <span>
                  {index + 1}. {gameModeLabels[mode]}
                </span>
                <div className="flex gap-2">
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
            ))}
          </ul>
        </Card>
      )}
    </RoomLayout>
  );
}

function shuffleModes(modes: GameMode[]): GameMode[] {
  const next = [...modes];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}
