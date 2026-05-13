"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TopNav } from "@/components/TopNav";
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
        <div className="brutal-shell">
          <TopNav />
          <main className="brutal-main">
            <header className="brutal-topbar brutal-panel">
              <div>
                <p className="eyebrow">ROOM SESSION</p>
                <h2>Room {room.code}</h2>
                <p className="text-sm text-text-secondary">Status: {room.status} · {room.players.length} players connected</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <RoomCodeBlock code={room.code} />
                <Badge variant="lime" pulse>{room.players.length} players</Badge>
              </div>
            </header>

            <nav className="brutal-grid-two">
              <Link href={`/room/${room.code}`} className="btn-game btn-primary justify-center text-center">Lobby</Link>
              <Link href={`/room/${room.code}/game`} className="btn-game btn-secondary justify-center text-center">Game</Link>
              <Link href={`/room/${room.code}/results`} className="btn-game btn-ghost justify-center text-center">Results</Link>
              <Link href={`/room/${room.code}/scoreboard`} className="btn-game btn-success justify-center text-center">Scoreboard</Link>
              <Link href={`/room/${room.code}/admin`} className="btn-game btn-ghost justify-center text-center">Admin</Link>
            </nav>

            {children(room)}
          </main>
        </div>
      )}
    </RoomGuard>
  );
}
