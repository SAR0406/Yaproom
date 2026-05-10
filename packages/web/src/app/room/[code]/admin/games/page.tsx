"use client";

import { RoomLayout } from "@/components/RoomLayout";
import { Card } from "@/components/Card";

export default function GameSelectionPage() {
  return (
    <RoomLayout>
      {(room) => (
        <Card>
          <h2 className="text-xl font-semibold text-foreground">Game selection</h2>
          <p className="mt-2 text-sm text-muted">
            Tonight&apos;s setlist is locked in. Reorder anytime.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-foreground">
            {room.queue.map((mode, index) => (
              <li
                key={`${mode}-${index}`}
                className="rounded-2xl border border-white/10 bg-surface px-4 py-3"
              >
                {index + 1}. {mode}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </RoomLayout>
  );
}
