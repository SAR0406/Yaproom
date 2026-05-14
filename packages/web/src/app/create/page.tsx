"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { createRoom } from "@/lib/roomActions";
import type { RoomSettings } from "@yapzi/shared";
import { useRoomStore } from "@/stores/roomStore";
import { MAX_PLAYERS, MIN_PLAYERS, NICKNAME_MAX_LENGTH } from "@/lib/constraints";
import { getModeBlueprint, launchPresets } from "@/lib/modeCatalog";

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

type LaunchPresetKey = keyof typeof launchPresets;

const presetOrder: LaunchPresetKey[] = ["starter", "pressure", "showcase"];

export default function CreateRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const room = useRoomStore((state) => state.room);
  const [nickname, setNickname] = useState(() => searchParams.get("name") ?? "");
  const [maxPlayers, setMaxPlayers] = useState("10");
  const canCreate = Boolean(nickname.trim());
  const [presetKey, setPresetKey] = useState<LaunchPresetKey>("starter");
  const queue = launchPresets[presetKey];

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
    createRoom({ nickname: nickname.trim(), settings, queue });
  };

  return (
    <PageLayout>
      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <Card className="space-y-5 brutal-panel">
          <div className="space-y-2">
            <p className="eyebrow">Host setup</p>
            <h1 className="text-4xl text-shimmer">Create a room</h1>
            <p className="text-sm text-text-secondary">
              Pick a launch preset, tune the room, and spin up a session that already has a rhythm.
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
            <div className="rounded-2xl border-[4px] border-black bg-white p-4 shadow-[6px_6px_0_0_#111]">
              <p className="eyebrow">Launch preset</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {presetOrder.map((key) => (
                  <Button
                    key={key}
                    variant={presetKey === key ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setPresetKey(key)}
                  >
                    {key}
                  </Button>
                ))}
              </div>
              <p className="mt-3 text-sm text-text-secondary">
                {launchPresets[presetKey].map((mode) => getModeBlueprint(mode).title).join(" → ")}
              </p>
            </div>
            <Button disabled={!canCreate} onClick={handleCreate}>Create room</Button>
          </div>
        </Card>

        <Card className="space-y-4 brutal-panel">
          <p className="eyebrow">Queue preview</p>
          <h2 className="text-3xl">{presetKey} stack</h2>
          <p className="text-sm text-text-secondary">
            Every preset is built from live modes only, so the host can launch immediately without any fake menu states.
          </p>
          <div className="grid gap-3">
            {queue.map((mode, index) => {
              const blueprint = getModeBlueprint(mode);
              return (
                <div key={mode} className="rounded-2xl border-[4px] border-black bg-white p-4 shadow-[6px_6px_0_0_#111]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="eyebrow">{index + 1}. {blueprint.title}</p>
                    <span className="rounded-full border border-black px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em]">
                      {blueprint.playerRange}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">{blueprint.shortPitch}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </PageLayout>
  );
}
