"use client";

import { RoomLayout } from "@/components/RoomLayout";
import { Card } from "@/components/Card";
import { PromptCard } from "@/components/PromptCard";
import { TimerRing } from "@/components/TimerRing";
import { VoteGrid } from "@/components/VoteGrid";
import { GameReveal } from "@/components/GameReveal";
import { ChaosOverlay } from "@/components/ChaosOverlay";
import { Button } from "@/components/Button";
import { useRoomStore } from "@/stores/roomStore";
import { nextRound } from "@/lib/roomActions";
import { describePhase, gameModeLabels } from "@/lib/gameEngine";

export default function GamePage() {
  const playerId = useRoomStore((state) => state.playerId);

  return (
    <RoomLayout>
      {(room) => {
        if (!room.game) {
          return (
            <Card>
              <h2 className="text-xl font-semibold text-foreground">
                Waiting for the host to start
              </h2>
              <p className="mt-2 text-sm text-muted">
                Grab a snack while the lobby locks in.
              </p>
            </Card>
          );
        }

        const phase = room.game.round.phase;
        const isHost = room.players.find((p) => p.id === playerId)?.isHost;

        return (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              <PromptCard>
                <h2 className="text-2xl font-bold text-foreground">
                  {gameModeLabels[room.game.mode]} — {describePhase(phase)}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Prompt: {room.game.round.prompt ?? "Stay chaotic."}
                </p>
              </PromptCard>
              {phase === "vote" ? (
                <VoteGrid players={room.players} />
              ) : null}
              {phase === "reveal" ? (
                <GameReveal
                  title="Chaos reveal!"
                  subtitle="Someone played it way too smooth."
                />
              ) : null}
            </div>

            <div className="space-y-4">
              <Card className="flex flex-col items-center gap-4">
                <TimerRing progress={64} label="Round time" />
                {isHost ? (
                  <Button onClick={() => nextRound()}>Advance phase</Button>
                ) : null}
              </Card>
              {room.game.chaosEvents.at(-1) ? (
                <ChaosOverlay
                  message={room.game.chaosEvents.at(-1)?.label ?? "Chaos"}
                />
              ) : null}
            </div>
          </div>
        );
      }}
    </RoomLayout>
  );
}
