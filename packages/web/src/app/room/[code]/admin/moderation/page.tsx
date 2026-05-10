"use client";

import { RoomLayout } from "@/components/RoomLayout";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { adminKick, adminMute, adminBan } from "@/lib/roomActions";
import { useRoomStore } from "@/stores/roomStore";

export default function ModerationPage() {
  const playerId = useRoomStore((state) => state.playerId);

  return (
    <RoomLayout>
      {(room) => (
        <Card>
          <h2 className="text-xl font-semibold text-foreground">Moderation</h2>
          <p className="mt-2 text-sm text-muted">
            Kick, mute, or ban disruptive players.
          </p>
          <div className="mt-4 space-y-3">
            {room.players.map((player) => (
              <div
                key={player.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-surface px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {player.nickname}
                  </p>
                  <p className="text-xs text-muted">{player.id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      playerId && adminMute({ adminId: playerId, targetId: player.id })
                    }
                  >
                    Mute
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      playerId && adminKick({ adminId: playerId, targetId: player.id })
                    }
                  >
                    Kick
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      playerId && adminBan({ adminId: playerId, targetId: player.id })
                    }
                  >
                    Ban
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </RoomLayout>
  );
}
