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
      <Card className="max-w-2xl space-y-5">
        <div className="space-y-2">
          <p className="eyebrow">Host setup</p>
          <h1 className="text-4xl text-shimmer">Create a room</h1>
          <p className="text-sm text-text-secondary">
            Set the pace, choose the queue, and spin up your live Yaproom session.
          </p>
        </div>
        <div className="grid gap-4">
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
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_0_28px_rgba(0,245,255,0.08)] backdrop-blur-xl">
            <p className="text-sm font-bold text-text-secondary">Default setlist</p>
            <p className="text-sm font-bold text-text-primary">
              {modes.join(" → ")}
            </p>
          </div>
          <Button disabled={!canCreate} onClick={handleCreate}>Create room</Button>
        </div>
      </Card>
    </PageLayout>
  );
}
