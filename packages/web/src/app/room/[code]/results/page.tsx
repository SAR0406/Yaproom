'use client';

import type { RoomState, AiRecapResult } from '@yapzi/shared';
import { useEffect, useState } from 'react';
import { RoomLayout } from '@/components/RoomLayout';
import { Card } from '@/components/Card';
import { GameReveal } from '@/components/GameReveal';
import { Button } from '@/components/Button';
import { nextRound } from '@/lib/roomActions';
import { useRoomStore } from '@/stores/roomStore';
import { buildRecap } from '@/lib/recap';
import { fetchAiRecap } from '@/lib/ai';

function ResultsContent({ room }: { room: RoomState }) {
  const playerId = useRoomStore((state) => state.playerId);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [aiRecap, setAiRecap] = useState<AiRecapResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const isHost = room.players.find((p) => p.id === playerId)?.isHost;

  useEffect(() => {
    let active = true;
    setIsAiLoading(true);
    void fetchAiRecap({
      roomCode: room.code,
      mode: room.game?.mode ?? 'imposter',
      players: room.players.map((player) => ({
        nickname: player.nickname,
        score: player.score
      })),
      highlights: room.game?.chaosEvents
        ? room.game.chaosEvents.slice(-2).map((event) => event.label)
        : []
    })
      .then((result) => {
        if (active) {
          setAiRecap(result);
        }
      })
      .catch(() => {
        if (active) {
          setAiRecap(null);
        }
      })
      .finally(() => {
        if (active) {
          setIsAiLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [room.id, room.code, room.game?.mode, room.game?.round.id, room.game?.chaosEvents, room.players]);

  const fallbackRecap = buildRecap(room);
  const recap = aiRecap ? { summary: aiRecap.summary, roast: aiRecap.roast } : fallbackRecap;
  const recapSourceLabel = aiRecap?.source === 'nim' ? 'NVIDIA NIM' : 'Local fallback';
  const shareText = `Yapzi ${room.code}: ${recap.summary} ${recap.roast}`;

  return (
    <div className="gameplay-grid">
      <Card className="hud-card mission-brief">
        <h2 className="text-2xl font-semibold text-foreground">Round recap</h2>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
          Source: {recapSourceLabel}
          {isAiLoading ? ' · generating…' : ''}
        </p>
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
                .catch(() => setShareStatus('Copy failed. Use the fallback text shown below.'));
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
      <Card className="space-y-3 hud-card director-tools">
        <h3 className="text-lg font-semibold text-foreground">Next up</h3>
        <p className="text-sm text-muted">Queue: {room.queue.join(' → ')}</p>
        {isHost ? <Button onClick={() => nextRound()}>Start next round</Button> : null}
      </Card>
    </div>
  );
}

export default function ResultsPage() {
  return <RoomLayout>{(room) => <ResultsContent room={room} />}</RoomLayout>;
}
