"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RoomGuard } from "@/components/RoomGuard";
import { RoomCodeBlock } from "@/components/RoomCodeBlock";
import { Badge } from "@/components/Badge";
import { joinRoom } from "@/lib/roomActions";
import { normalizeRoomCode } from "@/lib/roomCode";
import { useRoomStore } from "@/stores/roomStore";

export function RoomLayout({
  children,
}: {
  children: (room: import("@yapzi/shared").RoomState) => ReactNode;
}) {
  const roomInStore = useRoomStore((state) => state.room);
  const params = useParams<{ code: string }>();
  const code = normalizeRoomCode(params.code);

  useEffect(() => {
    if (roomInStore || !code) return;
    const name = new URLSearchParams(window.location.search).get("name");
    if (!name) return;
    const storedId = window.localStorage.getItem("yapzi:playerId");
    joinRoom({ code, nickname: name, playerId: storedId ?? undefined });
  }, [roomInStore, code]);

  return (
    <RoomGuard>
      {(room) => (
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-4 md:px-6 md:py-6">
          <header className="glass-panel card-game flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="eyebrow">ROOM SESSION</p>
              <h1 className="text-3xl md:text-5xl text-shimmer">Room {room.code}</h1>
              <p className="text-sm text-text-secondary">Status: {room.status} · {room.players.length} players connected</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <RoomCodeBlock code={room.code} />
              <Badge variant="lime" pulse>{room.players.length} players</Badge>
            </div>
          </header>

          <nav className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-5">
            <Link href={`/room/${room.code}`} className="btn-game btn-primary justify-center text-center">Lobby</Link>
            <Link href={`/room/${room.code}/game`} className="btn-game btn-secondary justify-center text-center">Game</Link>
            <Link href={`/room/${room.code}/results`} className="btn-game btn-ghost justify-center text-center">Results</Link>
            <Link href={`/room/${room.code}/scoreboard`} className="btn-game btn-success justify-center text-center">Scoreboard</Link>
            <Link href={`/room/${room.code}/admin`} className="btn-game btn-ghost justify-center text-center">Admin</Link>
          </nav>

          {children(room)}
        </div>
      )}
    </RoomGuard>
  );
}
