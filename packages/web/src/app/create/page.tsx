"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { createRoom } from "@/lib/roomActions";
import type { GameMode, RoomSettings } from "@yapzi/shared";
import { useRoomStore } from "@/stores/roomStore";

const defaultSettings: RoomSettings = {
  maxPlayers: 10,
  language: "en",
  voiceEnabled: false,
  anonymousMode: false,
  chaosLevel: "medium",
  roundLengthSec: 60,
  autoRotate: true,
  allowLateJoin: true,
  allowSpectators: false,
  audienceMode: false,
};

const modes: GameMode[] = [
  "imposter",
  "drawing",
  "expose",
  "confession",
  "split",
];

export default function CreateRoomPage() {
  const router = useRouter();
  const room = useRoomStore((state) => state.room);
  const [nickname, setNickname] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("10");

  useEffect(() => {
    if (room?.code) {
      router.push(`/room/${room.code}`);
    }
  }, [room?.code, router]);

  const handleCreate = () => {
    if (!nickname) return;
    const settings = {
      ...defaultSettings,
      maxPlayers: Number(maxPlayers) || 10,
    };
    createRoom({ nickname, settings, queue: modes });
  };

  return (
    <PageLayout>
      <Card className="max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground">Create a room</h1>
        <p className="mt-2 text-sm text-muted">
          Set the vibe and launch the chaos.
        </p>
        <div className="mt-6 grid gap-4">
          <Input
            label="Host nickname"
            placeholder="chaos commander"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
          />
          <Input
            label="Max players"
            type="number"
            value={maxPlayers}
            onChange={(event) => setMaxPlayers(event.target.value)}
          />
          <div className="rounded-2xl border border-white/10 bg-surface px-4 py-3">
            <p className="text-sm text-muted">Default setlist</p>
            <p className="text-sm text-foreground">
              {modes.join(" → ")}
            </p>
          </div>
          <Button onClick={handleCreate}>Create room</Button>
        </div>
      </Card>
    </PageLayout>
  );
}
