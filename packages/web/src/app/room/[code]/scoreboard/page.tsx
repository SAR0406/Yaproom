"use client";

import { RoomLayout } from "@/components/RoomLayout";
import { Card } from "@/components/Card";
import { ScoreBoard } from "@/components/ScoreBoard";

export default function ScoreboardPage() {
  return (
    <RoomLayout>
      {(room) => (
        <Card className="max-w-2xl">
          <h2 className="text-2xl font-semibold text-foreground">Scoreboard</h2>
          <p className="mt-2 text-sm text-muted">Live standings.</p>
          <div className="mt-4">
            <ScoreBoard players={room.players} />
          </div>
        </Card>
      )}
    </RoomLayout>
  );
}
