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

const bullets = [
  "Neon-brutal cards, thick outlines, loud gradients",
  "Quick room flow for join / create / host",
  "Ready for voice, chat, voting, and live game states",
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
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-4 md:px-6 md:py-6">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-6 overflow-hidden">
          <div className="flex flex-wrap items-center gap-3">
            <span className="badge badge-lime animate-float">Live party grid</span>
            <span className="badge badge-cyan">Neon brutal UI</span>
            <span className="badge badge-magenta">Fast room flow</span>
          </div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl text-5xl md:text-7xl"
            >
              Build chaos in a room that feels like a neon arcade.
            </motion.h1>
            <p className="max-w-2xl text-base text-text-secondary md:text-lg">
              Yaproom mixes live games, voice, voting, and a bold visual system built for fast friend-group chaos.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {bullets.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-text-secondary shadow-[0_0_24px_rgba(0,0,0,0.15)]">
                {item}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={handleCreate}>Create room</Button>
            <Button variant="secondary" onClick={() => setTab("join")}>Join room</Button>
            <Button variant="ghost" onClick={() => router.push('/game-modes')}>View modes</Button>
          </div>
        </Card>

        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="eyebrow">Session controls</p>
            <h2 className="text-3xl text-shimmer">Launch panel</h2>
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
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-text-secondary">
                Host setup lives in the next screen. Your room code will be generated after launch.
              </div>
              <Button variant="secondary" disabled={!canCreate} onClick={handleCreate}>
                Start room
              </Button>
            </>
          )}
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="eyebrow">Visual system</p>
          <h3 className="text-2xl text-shimmer">Color and motion</h3>
          <p className="mt-3 text-sm text-text-secondary">Deep black surfaces, cyan/magenta glow, and chunky outlines give the app its arcade identity.</p>
        </Card>
        <Card>
          <p className="eyebrow">Gameplay</p>
          <h3 className="text-2xl text-shimmer">All core features linked</h3>
          <p className="mt-3 text-sm text-text-secondary">Join, create, lobby, game, recap, admin controls, and room moderation all flow through the same system.</p>
        </Card>
        <Card>
          <p className="eyebrow">Admin</p>
          <h3 className="text-2xl text-shimmer">Backend-powered control</h3>
          <p className="mt-3 text-sm text-text-secondary">Admin login and room control are wired to the server session token flow, not mocked UI.</p>
        </Card>
      </section>
    </main>
  );
}
