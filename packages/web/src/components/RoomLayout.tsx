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
  const params = useParams();
  const code = normalizeRoomCode((params.code as string) ?? "");

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
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-6">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border-[3px] border-black bg-cyan-300 px-5 py-4 text-black shadow-[8px_8px_0_0_#000]">
            <div className="space-y-1">
              <h1 className="text-2xl font-black uppercase">
                Room {room.code}
              </h1>
              <p className="text-sm font-semibold">Status: {room.status}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <RoomCodeBlock code={room.code} />
              <Badge>{room.players.length} players</Badge>
            </div>
          </header>
          <nav className="flex flex-wrap gap-3 text-sm font-bold text-black">
            <Link href={`/room/${room.code}`} className="rounded-xl border-[2px] border-black bg-white px-3 py-1 shadow-[3px_3px_0_0_#000]">
              Lobby
            </Link>
            <Link
              href={`/room/${room.code}/game`}
              className="rounded-xl border-[2px] border-black bg-white px-3 py-1 shadow-[3px_3px_0_0_#000]"
            >
              Game
            </Link>
            <Link
              href={`/room/${room.code}/results`}
              className="rounded-xl border-[2px] border-black bg-white px-3 py-1 shadow-[3px_3px_0_0_#000]"
            >
              Results
            </Link>
            <Link
              href={`/room/${room.code}/scoreboard`}
              className="rounded-xl border-[2px] border-black bg-white px-3 py-1 shadow-[3px_3px_0_0_#000]"
            >
              Scoreboard
            </Link>
            <Link
              href={`/room/${room.code}/admin`}
              className="rounded-xl border-[2px] border-black bg-white px-3 py-1 shadow-[3px_3px_0_0_#000]"
            >
              Admin
            </Link>
          </nav>
          {children(room)}
        </div>
      )}
    </RoomGuard>
  );
}
