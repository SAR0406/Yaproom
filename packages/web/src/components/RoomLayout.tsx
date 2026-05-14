"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const code = normalizeRoomCode(params.code);

  const navItems = [
    { label: "Lobby", href: `/room/${code}`, tone: "btn-primary" },
    { label: "Game", href: `/room/${code}/game`, tone: "btn-secondary" },
    { label: "Results", href: `/room/${code}/results`, tone: "btn-ghost" },
    { label: "Scoreboard", href: `/room/${code}/scoreboard`, tone: "btn-success" },
    { label: "Admin", href: `/room/${code}/admin`, tone: "btn-ghost" },
  ] as const;

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
        <div className="brutal-shell game-scene room-shell">
          <TopNav />
          <main className="brutal-main game-main">
            <header className="brutal-topbar brutal-panel room-hero">
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

            <nav className="room-nav">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`btn-game ${item.tone} room-nav-link ${pathname === item.href ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <section className="room-stage">{children(room)}</section>
          </main>
        </div>
      )}
    </RoomGuard>
  );
}
