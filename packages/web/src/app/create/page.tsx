"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { createRoom } from "@/lib/roomActions";
import type { GameMode, RoomSettings } from "@yapzi/shared";
import { useRoomStore } from "@/stores/roomStore";
import { MAX_PLAYERS, MIN_PLAYERS, NICKNAME_MAX_LENGTH } from "@/lib/constraints";

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
  const searchParams = useSearchParams();
  const room = useRoomStore((state) => state.room);
  const [nickname, setNickname] = useState(() => searchParams.get("name") ?? "");
  const [maxPlayers, setMaxPlayers] = useState("10");
  const canCreate = Boolean(nickname.trim());

  useEffect(() => {
    if (room?.code) {
      router.push(`/room/${room.code}`);
    }
  }, [room?.code, router]);

  const handleCreate = () => {
    if (!nickname.trim()) return;
    const settings = {
      ...defaultSettings,
      maxPlayers: Number(maxPlayers) || 10,
    };
    createRoom({ nickname: nickname.trim(), settings, queue: modes });
  };

  return (
    <PageLayout>
      <Card className="max-w-2xl">
        <h1 className="text-3xl font-black uppercase text-black">Create a room</h1>
        <p className="mt-2 text-sm font-semibold text-black/80">
          Set the vibe and launch the chaos.
        </p>
        <div className="mt-6 grid gap-4">
          <Input
            label="Host nickname"
            placeholder="chaos commander"
            value={nickname}
            maxLength={NICKNAME_MAX_LENGTH}
            onChange={(event) => setNickname(event.target.value)}
          />
          <Input
            label="Max players"
            type="number"
            value={maxPlayers}
            min={MIN_PLAYERS}
            max={MAX_PLAYERS}
            onChange={(event) => setMaxPlayers(event.target.value)}
          />
          <div className="rounded-2xl border-[3px] border-black bg-yellow-200 px-4 py-3 shadow-[4px_4px_0_0_#000]">
            <p className="text-sm font-bold text-black/70">Default setlist</p>
            <p className="text-sm font-bold text-black">
              {modes.join(" → ")}
            </p>
          </div>
          <Button disabled={!canCreate} onClick={handleCreate}>Create room</Button>
        </div>
      </Card>
    </PageLayout>
  );
}
