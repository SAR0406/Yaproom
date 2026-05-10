"use client";

import Link from "next/link";
import { RoomLayout } from "@/components/RoomLayout";
import { Card } from "@/components/Card";

export default function AdminPage() {
  return (
    <RoomLayout>
      {(room) => (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <h2 className="text-xl font-semibold text-foreground">Room controls</h2>
            <p className="mt-2 text-sm text-muted">
              Manage players, timers, and chaos settings.
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-muted">
              <Link href={`/room/${room.code}/admin/moderation`}>
                Moderation panel
              </Link>
              <Link href={`/room/${room.code}/admin/games`}>
                Game selection
              </Link>
              <Link href={`/room/${room.code}/admin/customize`}>
                Customization
              </Link>
            </div>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-foreground">Room settings</h3>
            <p className="mt-2 text-sm text-muted">
              Max players: {room.settings.maxPlayers}
            </p>
            <p className="text-sm text-muted">
              Chaos level: {room.settings.chaosLevel}
            </p>
          </Card>
        </div>
      )}
    </RoomLayout>
  );
}
