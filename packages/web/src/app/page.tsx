"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { joinRoom } from "@/lib/roomActions";
import { normalizeRoomCode } from "@/lib/roomCode";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState<"join" | "create">("join");
  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");

  const normalizedCode = normalizeRoomCode(roomCode);
  const canJoin = Boolean(name.trim()) && normalizedCode.length === 4;
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
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <section className="space-y-4 text-center">
        <p className="inline-block rounded-full border-[3px] border-black bg-yellow-300 px-4 py-1 text-sm font-black text-black shadow-[4px_4px_0_0_#000]">
          Multiplayer chaos, now in neobrutal mode
        </p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-black uppercase tracking-tight md:text-7xl"
        >
          Join fast. Roast faster.
        </motion.h1>
        <p className="mx-auto max-w-2xl text-base text-white/80 md:text-lg">
          Build your room, invite your friends, and jump into loud games with a
          crisp lobby experience.
        </p>
      </section>

      <Card className="mx-auto w-full max-w-2xl space-y-5 bg-pink-300">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={tab === "join" ? "primary" : "ghost"}
            onClick={() => setTab("join")}
          >
            Join room
          </Button>
          <Button
            variant={tab === "create" ? "primary" : "ghost"}
            onClick={() => setTab("create")}
          >
            Create room
          </Button>
        </div>

        <Input
          label="Nickname"
          placeholder="Your chaos name"
          value={name}
          maxLength={24}
          onChange={(event) => setName(event.target.value)}
        />

        {tab === "join" ? (
          <>
            <Input
              label="Room code"
              placeholder="ABCD"
              value={normalizedCode}
              maxLength={4}
              onChange={(event) =>
                setRoomCode(normalizeRoomCode(event.target.value))
              }
            />
            <Button disabled={!canJoin} onClick={handleJoin}>
              Enter lobby
            </Button>
          </>
        ) : (
          <Button variant="secondary" disabled={!canCreate} onClick={handleCreate}>
            Start new room
          </Button>
        )}
      </Card>
    </main>
  );
}
