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

  const actionStream = [
    "SYSTEM BOOT: Matchmaking relays online",
    "SQUAD CHECK: Invite links secured",
    "VOICE LEVELS: Chaos calibration complete",
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-6 md:py-10">
      <section className="space-y-4 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-lime-300/50 bg-lime-400/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.12em] text-lime-200 shadow-[0_0_18px_rgba(57,255,20,0.25)]">
          <span className="status-dot" aria-hidden />
          Live party grid online
        </p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-black uppercase tracking-tight md:text-7xl"
        >
          Join fast. Fire faster.
        </motion.h1>
        <p className="mx-auto max-w-3xl text-sm text-cyan-50/80 md:text-lg">
          Minimal commands. Maximum impact. Spin up a room, lock in your squad,
          and launch straight into high-energy multiplayer sessions.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Card className="space-y-5 lg:sticky lg:top-8 lg:h-fit">
          <h2 className="text-lg font-black uppercase tracking-[0.1em] text-cyan-100">
            Player Card
          </h2>
          <div className="rounded-2xl border border-cyan-300/30 bg-cyan-400/8 p-4">
            <p className="text-xs uppercase tracking-[0.1em] text-cyan-200/80">Status</p>
            <p className="mt-1 text-2xl font-black uppercase text-lime-200">Ready to engage</p>
            <p className="mt-2 text-xs text-slate-200/70">Level 07 Lobby Instigator</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold uppercase tracking-[0.08em]">
            <div className="rounded-xl border border-fuchsia-300/35 bg-fuchsia-500/10 p-2 text-fuchsia-100">
              Sessions 42
            </div>
            <div className="rounded-xl border border-cyan-300/35 bg-cyan-500/10 p-2 text-cyan-100">
              Wins 18
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.09em] text-cyan-100/90">
              Action Stream
            </p>
            <div className="space-y-3 text-xs text-slate-200/78">
              {actionStream.map((entry) => (
                <p key={entry} className="action-stream-line">
                  {entry}
                </p>
              ))}
            </div>
          </div>
        </Card>

        <Card className="space-y-5">
          <h2 className="text-lg font-black uppercase tracking-[0.1em] text-fuchsia-100">
            Command Terminal
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <Button variant={tab === "join" ? "primary" : "ghost"} onClick={() => setTab("join")}>
              Mission Select: Join
            </Button>
            <Button
              variant={tab === "create" ? "secondary" : "ghost"}
              onClick={() => setTab("create")}
            >
              Mission Select: Create
            </Button>
          </div>

          <Input
            label="Pilot Handle"
            placeholder="Enter your codename"
            value={name}
            maxLength={NICKNAME_MAX_LENGTH}
            onChange={(event) => setName(event.target.value)}
          />

          {tab === "join" ? (
            <>
              <Input
                label="Access Sequence"
                placeholder="ABCD"
                value={normalizedCode}
                maxLength={ROOM_CODE_LENGTH}
                onChange={(event) =>
                  setRoomCode(normalizeRoomCode(event.target.value))
                }
              />
              <Button disabled={!canJoin} onClick={handleJoin}>
                Initialize Link
              </Button>
            </>
          ) : (
            <Input
              label="Squad Launch"
              placeholder="Ready when you are"
              value="Auto-generated room code"
              readOnly
            />
          )}

          {tab === "create" ? (
            <Button variant="secondary" disabled={!canCreate} onClick={handleCreate}>
              Fire Message
            </Button>
          ) : (
            <p className="text-xs uppercase tracking-[0.08em] text-cyan-100/75">
              Status: Ready to engage
            </p>
          )}

          <div className="grid gap-2 rounded-2xl border border-cyan-300/30 bg-[#0b1330]/90 p-3 text-xs text-cyan-100/75 sm:grid-cols-3">
            <p>Desktop: full FX stack</p>
            <p>Tablet: touch-optimized</p>
            <p>Mobile: compact controls</p>
          </div>
        </Card>
      </section>

      <section className="grid gap-3 text-center text-xs uppercase tracking-[0.1em] text-cyan-100/70 md:grid-cols-3">
        <div className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-3 py-2">
          Cyan = trust / primary actions
        </div>
        <div className="rounded-xl border border-fuchsia-300/30 bg-fuchsia-500/10 px-3 py-2">
          Magenta = excitement / secondary actions
        </div>
        <div className="rounded-xl border border-lime-300/30 bg-lime-500/10 px-3 py-2">
          Lime = success / live-ready states
        </div>
      </section>
    </main>
  );
}
