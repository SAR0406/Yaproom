"use client";

import Link from "next/link";
import { RoomLayout } from "@/components/RoomLayout";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export default function AdminPage() {
  return (
    <RoomLayout>
      {(room) => (
        <div className="grid gap-4 md:grid-cols-2">
          <Card variant="cyan" className="space-y-4">
            <h2 className="text-2xl font-display text-glow-cyan">Room Admin Deck</h2>
            <p className="text-sm text-text-secondary">
              This room is linked with the central Yaproom admin console for live power and design controls.
            </p>
            <div className="grid gap-3">
              <Link href={`/room/${room.code}/admin/moderation`}>
                <Button variant="secondary" className="w-full">Moderation panel</Button>
              </Link>
              <Link href={`/room/${room.code}/admin/games`}>
                <Button variant="primary" className="w-full">Game selection</Button>
              </Link>
              <Link href={`/room/${room.code}/admin/customize`}>
                <Button variant="ghost" className="w-full">Customization</Button>
              </Link>
              <Link href="/admin">
                <Button variant="success" className="w-full">Open global admin center</Button>
              </Link>
            </div>
          </Card>

          <Card variant="magenta" className="space-y-3">
            <h3 className="text-xl font-display text-glow-magenta">Live Room Snapshot</h3>
            <p className="text-sm text-text-secondary">Room code: {room.code}</p>
            <p className="text-sm text-text-secondary">Players: {room.players.length}</p>
            <p className="text-sm text-text-secondary">Max players: {room.settings.maxPlayers}</p>
            <p className="text-sm text-text-secondary">Chaos level: {room.settings.chaosLevel}</p>
          </Card>
        </div>
      )}
    </RoomLayout>
  );
}
