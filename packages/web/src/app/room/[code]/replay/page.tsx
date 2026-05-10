"use client";

import Link from "next/link";
import { RoomLayout } from "@/components/RoomLayout";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export default function ReplayPage() {
  return (
    <RoomLayout>
      {(room) => (
        <Card className="max-w-2xl">
          <h2 className="text-2xl font-semibold text-foreground">Replay</h2>
          <p className="mt-2 text-sm text-muted">
            Run it back, remix the setlist, or share the recap.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button>Rematch</Button>
            <Link href={`/room/${room.code}/admin/games`}>
              <Button variant="secondary">Edit setlist</Button>
            </Link>
          </div>
        </Card>
      )}
    </RoomLayout>
  );
}
