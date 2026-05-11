'use client';

import { useState } from 'react';
import { RoomLayout } from '@/components/RoomLayout';
import { Card } from '@/components/Card';
import { PromptCard } from '@/components/PromptCard';
import { TimerRing } from '@/components/TimerRing';
import { VoteGrid } from '@/components/VoteGrid';
import { GameReveal } from '@/components/GameReveal';
import { ChaosOverlay } from '@/components/ChaosOverlay';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useRoomStore } from '@/stores/roomStore';
import {
  nextRound,
  sendDrawPath,
  submitConfession,
  submitGuess,
  submitVote
} from '@/lib/roomActions';
import { describePhase, gameModeLabels } from '@/lib/gameEngine';

export default function GamePage() {
  const playerId = useRoomStore((state) => state.playerId);
  const [guessText, setGuessText] = useState('');
  const [confessionText, setConfessionText] = useState('');

  return (
    <RoomLayout>
      {(room) => {
        if (!room.game) {
          return (
            <Card>
              <h2 className="text-xl font-semibold text-foreground">Waiting for the host to start</h2>
              <p className="mt-2 text-sm text-muted">Grab a snack while the lobby locks in.</p>
            </Card>
          );
        }

        const phase = room.game.round.phase;
        const isHost = room.players.find((p) => p.id === playerId)?.isHost;
        const payload = (room.game.round.payload ?? {}) as Record<string, unknown>;
        const imposterId = String(payload.imposterId ?? '');
        const myWord = imposterId && playerId === imposterId ? payload.imposterWord : payload.commonWord;
        const splitPair = (payload.pair as [string, string] | undefined) ?? ['', ''];
        const inSplitPair = splitPair.includes(playerId ?? '');

        const started = room.game?.round.startedAt ? Date.parse(room.game.round.startedAt) : Date.now();
        const elapsed = Math.max(0, (Date.now() - started) / 1000);
        const duration = room.settings.roundLengthSec;
        const progress = Math.max(0, Math.min(100, 100 - (elapsed / duration) * 100));

        return (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              <PromptCard>
                <h2 className="text-2xl font-bold text-foreground">
                  {gameModeLabels[room.game.mode]} — {describePhase(phase)}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Prompt: {room.game.round.prompt ?? 'Stay chaotic.'}
                </p>
              </PromptCard>

              {phase === 'role' && room.game.mode === 'imposter' ? (
                <Card>
                  <h3 className="text-lg font-semibold text-foreground">Your secret word</h3>
                  <p className="mt-2 text-2xl font-bold text-secondary">{String(myWord ?? '???')}</p>
                </Card>
              ) : null}

              {phase === 'vote' ? (
                <VoteGrid
                  players={room.players}
                  onSelect={(targetId) => playerId && submitVote({ playerId, targetId })}
                />
              ) : null}

              {phase === 'guess' ? (
                <Card className="space-y-3">
                  <Input
                    label={room.game.mode === 'split' ? 'Choice: split or steal' : 'Your guess'}
                    value={guessText}
                    onChange={(event) => setGuessText(event.target.value)}
                    placeholder={room.game.mode === 'split' ? 'split' : 'type your guess'}
                  />
                  <Button
                    onClick={() => {
                      if (!playerId || !guessText.trim()) return;
                      submitGuess({ playerId, guess: guessText.trim() });
                      setGuessText('');
                    }}
                  >
                    Submit
                  </Button>
                </Card>
              ) : null}

              {phase === 'action' && room.game.mode === 'confession' ? (
                <Card className="space-y-3">
                  <Input
                    label="Anonymous confession"
                    value={confessionText}
                    onChange={(event) => setConfessionText(event.target.value)}
                    placeholder="I once..."
                  />
                  <Button
                    onClick={() => {
                      if (!playerId || !confessionText.trim()) return;
                      submitConfession({ playerId, confession: confessionText.trim() });
                      setConfessionText('');
                    }}
                  >
                    Submit confession
                  </Button>
                </Card>
              ) : null}

              {phase === 'action' && room.game.mode === 'drawing' ? (
                <Card className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Quick sketch action</h3>
                  <Button
                    onClick={() =>
                      playerId &&
                      sendDrawPath({
                        playerId,
                        path: [
                          { x: Math.random() * 300, y: Math.random() * 200 },
                          { x: Math.random() * 300, y: Math.random() * 200 }
                        ]
                      })
                    }
                  >
                    Draw a stroke
                  </Button>
                </Card>
              ) : null}

              {phase === 'action' && room.game.mode === 'split' && inSplitPair ? (
                <Card className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Split or steal?</h3>
                  <div className="flex gap-2">
                    <Button onClick={() => playerId && submitGuess({ playerId, guess: 'split' })}>Split</Button>
                    <Button variant="danger" onClick={() => playerId && submitGuess({ playerId, guess: 'steal' })}>
                      Steal
                    </Button>
                  </div>
                </Card>
              ) : null}

              {phase === 'reveal' ? (
                <GameReveal title="Chaos reveal!" subtitle="Someone played it way too smooth." />
              ) : null}
            </div>

            <div className="space-y-4">
              <Card className="flex flex-col items-center gap-4">
                <TimerRing progress={progress} label="Round time" />
                {isHost ? <Button onClick={() => nextRound()}>Advance phase</Button> : null}
              </Card>
              {room.game.chaosEvents.at(-1) ? (
                <ChaosOverlay message={room.game.chaosEvents.at(-1)?.label ?? 'Chaos'} />
              ) : null}
            </div>
          </div>
        );
      }}
    </RoomLayout>
  );
}
