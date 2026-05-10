"use client";

import { RoomLayout } from "@/components/RoomLayout";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export default function CustomizationPage() {
  return (
    <RoomLayout>
      {(room) => (
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Customization</h2>
          <p className="text-sm text-muted">
            Toggle chaos, anonymous mode, and round length.
          </p>
          <div className="grid gap-3 text-sm text-muted">
            <div>Chaos level: {room.settings.chaosLevel}</div>
            <div>Anonymous mode: {room.settings.anonymousMode ? "On" : "Off"}</div>
            <div>Round length: {room.settings.roundLengthSec}s</div>
          </div>
          <Button variant="secondary">Save settings</Button>
        </Card>
      )}
    </RoomLayout>
  );
}
