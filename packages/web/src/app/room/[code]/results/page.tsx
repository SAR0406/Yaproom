"use client";

import { RoomLayout } from "@/components/RoomLayout";
import { Card } from "@/components/Card";
import { GameReveal } from "@/components/GameReveal";
import { Button } from "@/components/Button";
import { nextRound } from "@/lib/roomActions";
import { useRoomStore } from "@/stores/roomStore";

export default function ResultsPage() {
  const playerId = useRoomStore((state) => state.playerId);

  return (
    <RoomLayout>
      {(room) => {
        const isHost = room.players.find((p) => p.id === playerId)?.isHost;
        return (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card>
              <h2 className="text-2xl font-semibold text-foreground">
                Round recap
              </h2>
              <p className="mt-2 text-sm text-muted">
                AI summary: Room {room.code} survived peak betrayal energy.
              </p>
              <div className="mt-6">
                <GameReveal
                  title="Funniest moment"
                  subtitle="Someone voted like a politician with zero receipts."
                />
              </div>
            </Card>
            <Card className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Next up
              </h3>
              <p className="text-sm text-muted">
                Queue: {room.queue.join(" → ")}
              </p>
              {isHost ? (
                <Button onClick={() => nextRound()}>Start next round</Button>
              ) : null}
            </Card>
          </div>
        );
      }}
    </RoomLayout>
  );
}
