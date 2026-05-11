'use client';

import { useState } from 'react';
import { RoomLayout } from '@/components/RoomLayout';
import { Card } from '@/components/Card';
import { GameReveal } from '@/components/GameReveal';
import { Button } from '@/components/Button';
import { nextRound } from '@/lib/roomActions';
import { useRoomStore } from '@/stores/roomStore';
import { buildRecap } from '@/lib/recap';

export default function ResultsPage() {
  const playerId = useRoomStore((state) => state.playerId);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  return (
    <RoomLayout>
      {(room) => {
        const isHost = room.players.find((p) => p.id === playerId)?.isHost;
        const recap = buildRecap(room);
        const shareText = `Yapzi ${room.code}: ${recap.summary} ${recap.roast}`;

        return (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card>
              <h2 className="text-2xl font-semibold text-foreground">Round recap</h2>
              <p className="mt-2 text-sm text-muted">AI summary: {recap.summary}</p>
              <div className="mt-6">
                <GameReveal title="Funniest moment" subtitle={recap.roast} />
              </div>
              <div className="mt-6 space-y-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard
                      .writeText(shareText)
                      .then(() => setShareStatus('Copied. Drop it in the group chat.'))
                      .catch(() =>
                        setShareStatus('Copy failed. Use the fallback text shown below.')
                      );
                  }}
                >
                  Copy share card text
                </Button>
                {shareStatus ? <p className="text-sm text-muted">{shareStatus}</p> : null}
                <p className="rounded-2xl border border-white/10 bg-surface px-3 py-2 text-xs text-muted">
                  Fallback text: {shareText}
                </p>
              </div>
            </Card>
            <Card className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Next up</h3>
              <p className="text-sm text-muted">Queue: {room.queue.join(' → ')}</p>
              {isHost ? <Button onClick={() => nextRound()}>Start next round</Button> : null}
            </Card>
          </div>
        );
      }}
    </RoomLayout>
  );
}
