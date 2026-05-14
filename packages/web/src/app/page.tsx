"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { joinRoom } from "@/lib/roomActions";
import { normalizeRoomCode } from "@/lib/roomCode";
import { NICKNAME_MAX_LENGTH, ROOM_CODE_LENGTH } from "@/lib/constraints";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { PageLayout } from "@/components/PageLayout";
import { PhaserStage } from "@/components/PhaserStage";
import { gameModeLabels } from "@/lib/gameEngine";
import { getModeBlueprint, liveModeCatalog, liveModeQueue } from "@/lib/modeCatalog";

const heroStats = [
  { label: "Live now", value: liveModeCatalog.length.toString(), note: "Supported room modes" },
  { label: "Flow", value: "Join → lobby → play", note: "A short path to the first round" },
  { label: "Stage", value: "Phaser 4", note: "Animated canvas previews" }
];

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState<"join" | "create">("join");
  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");

  const normalizedCode = normalizeRoomCode(roomCode);
  const canJoin = Boolean(name.trim()) && normalizedCode.length === ROOM_CODE_LENGTH;
  const canCreate = Boolean(name.trim());

  const handleJoin = () => {
    if (!canJoin) return;
    joinRoom({ code: normalizedCode, nickname: name.trim() });
    router.push(`/room/${normalizedCode}?name=${encodeURIComponent(name.trim())}`);
  };

  const handleCreate = () => {
    if (!canCreate) return;
    router.push(`/create?name=${encodeURIComponent(name.trim())}`);
  };

  return (
    <PageLayout>
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-6 overflow-hidden brutal-panel">
          <div className="flex flex-wrap items-center gap-3">
            <span className="badge badge-lime">Live room stack</span>
            <span className="badge badge-cyan">Phaser 4</span>
            <span className="badge badge-magenta">Mode-by-mode design</span>
          </div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl text-5xl md:text-7xl"
            >
              Turn a room code into a loud social game night.
            </motion.h1>
            <p className="max-w-2xl text-base text-text-secondary md:text-lg">
              Yaproom now reads like a real live product: one launch flow, a live mode atlas, animated stage previews, and room-first gameplay that keeps moving.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border-[4px] border-black bg-white p-4 shadow-[8px_8px_0_0_#111]"
              >
                <p className="eyebrow">{item.label}</p>
                <h3 className="text-2xl">{item.value}</h3>
                <p className="mt-2 text-sm text-text-secondary">{item.note}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={handleCreate}>Create room</Button>
            <Button variant="secondary" onClick={() => setTab("join")}>Join room</Button>
            <Button variant="ghost" onClick={() => router.push('/game-modes')}>Explore mode atlas</Button>
          </div>
        </Card>

        <Card className="space-y-4 brutal-panel">
          <div className="space-y-2">
            <p className="eyebrow">Stage preview</p>
            <h2 className="text-3xl">Room energy</h2>
            <p className="text-sm text-text-secondary">
              The canvas preview keeps the screen feeling like a game even before the first round starts.
            </p>
          </div>
          <PhaserStage
            label={getModeBlueprint(liveModeQueue[0] ?? 'imposter').title}
            subtitle="Live rooms, bold turns, and a stage that keeps moving."
            highlights={liveModeCatalog.slice(0, 3).map((entry) => entry.title)}
            className="bg-panel"
          />
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-5 brutal-panel">
          <div className="space-y-2">
            <p className="eyebrow">Mode atlas</p>
            <h2 className="text-3xl">Supported live modes</h2>
            <p className="text-sm text-text-secondary">
              The server launches these today. The rest of the catalog stays visible as roadmap energy instead of fake buttons.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {liveModeCatalog.map((entry) => (
              <div key={entry.mode} className="rounded-2xl border-[4px] border-black bg-white p-4 shadow-[6px_6px_0_0_#111]">
                <p className="eyebrow">{gameModeLabels[entry.mode]}</p>
                <h3 className="text-2xl">{entry.shortPitch}</h3>
                <p className="mt-2 text-sm text-text-secondary">{entry.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-black/70">
                  {entry.vibeTags.map((tag) => (
                    <span key={tag} className="rounded-full border border-black px-2 py-1">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-5 brutal-panel">
          <div className="space-y-2">
            <p className="eyebrow">Launch panel</p>
            <h2 className="text-3xl">Join or host</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant={tab === "join" ? "primary" : "ghost"} onClick={() => setTab("join")}>
              Join
            </Button>
            <Button variant={tab === "create" ? "secondary" : "ghost"} onClick={() => setTab("create")}>
              Create
            </Button>
          </div>

          <Input
            label="Player name"
            placeholder="Enter your codename"
            value={name}
            maxLength={NICKNAME_MAX_LENGTH}
            onChange={(event) => setName(event.target.value)}
          />

          {tab === "join" ? (
            <>
              <Input
                label="Room code"
                placeholder="ABCD"
                value={normalizedCode}
                maxLength={ROOM_CODE_LENGTH}
                onChange={(event) => setRoomCode(normalizeRoomCode(event.target.value))}
              />
              <Button disabled={!canJoin} onClick={handleJoin}>
                Enter room
              </Button>
            </>
          ) : (
            <>
              <div className="rounded-2xl border-[4px] border-black bg-white p-4 text-sm text-text-secondary shadow-[8px_8px_0_0_#111]">
                Host setup now routes to a full launch screen with queue presets, room settings, and live mode control.
              </div>
              <Button variant="secondary" disabled={!canCreate} onClick={handleCreate}>
                Start room
              </Button>
            </>
          )}
        </Card>
      </section>
    </PageLayout>
  );
}
