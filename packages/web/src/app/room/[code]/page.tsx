"use client";

import { RoomLayout } from "@/components/RoomLayout";
import { Card } from "@/components/Card";
import { PlayerChip } from "@/components/PlayerChip";
import { Button } from "@/components/Button";
import { CopyInviteLink } from "@/components/CopyInviteLink";
import { ReactionBar } from "@/components/ReactionBar";
import { SoundButton } from "@/components/SoundButton";
import { useRoomStore } from "@/stores/roomStore";
import { setReady, startGame, sendReaction } from "@/lib/roomActions";

export default function LobbyPage() {
  const playerId = useRoomStore((state) => state.playerId);

  return (
    <RoomLayout>
      {(room) => {
        const player = room.players.find((p) => p.id === playerId);
        const isHost = player?.isHost;
        return (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Lobby</h2>
                {room.code ? <CopyInviteLink roomCode={room.code} /> : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {room.players.map((player) => (
                  <PlayerChip
                    key={player.id}
                    name={player.nickname}
                    color={player.color}
                    isHost={player.isHost}
                    isReady={player.isReady}
                  />
                ))}
              </div>
            </Card>

            <div className="space-y-4">
              <Card className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                  Ready check
                </h3>
                <Button
                  variant={player?.isReady ? "secondary" : "primary"}
                  onClick={() =>
                    playerId &&
                    setReady({
                      playerId,
                      isReady: !player?.isReady,
                    })
                  }
                >
                  {player?.isReady ? "Unready" : "I&apos;m ready"}
                </Button>
                {isHost ? (
                  <Button
                    variant="secondary"
                    onClick={() => startGame("imposter")}
                  >
                    Start the chaos
                  </Button>
                ) : null}
              </Card>

              <Card className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                  Soundboard
                </h3>
                <div className="flex flex-wrap gap-2">
                  <SoundButton label="Airhorn" />
                  <SoundButton label="Suspense" />
                  <SoundButton label="Roast" />
                </div>
              </Card>

              <Card className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                  Live reactions
                </h3>
                <ReactionBar
                  onReact={(reaction) =>
                    playerId && sendReaction(playerId, reaction)
                  }
                />
              </Card>
            </div>
          </div>
        );
      }}
    </RoomLayout>
  );
}
