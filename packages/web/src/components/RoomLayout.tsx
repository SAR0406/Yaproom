"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { RoomGuard } from "@/components/RoomGuard";
import { RoomCodeBlock } from "@/components/RoomCodeBlock";
import { Badge } from "@/components/Badge";

export function RoomLayout({
  children,
}: {
  children: (room: import("@yapzi/shared").RoomState) => ReactNode;
}) {
  return (
    <RoomGuard>
      {(room) => (
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-6">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Room {room.code}
              </h1>
              <p className="text-sm text-muted">{room.status}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <RoomCodeBlock code={room.code} />
              <Badge>{room.players.length} players</Badge>
            </div>
          </header>
          <nav className="flex flex-wrap gap-3 text-sm text-muted">
            <Link href={`/room/${room.code}`} className="hover:text-foreground">
              Lobby
            </Link>
            <Link
              href={`/room/${room.code}/game`}
              className="hover:text-foreground"
            >
              Game
            </Link>
            <Link
              href={`/room/${room.code}/results`}
              className="hover:text-foreground"
            >
              Results
            </Link>
            <Link
              href={`/room/${room.code}/scoreboard`}
              className="hover:text-foreground"
            >
              Scoreboard
            </Link>
            <Link
              href={`/room/${room.code}/admin`}
              className="hover:text-foreground"
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
