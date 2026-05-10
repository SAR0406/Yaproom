"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRoomStore } from "@/stores/roomStore";
import { EmptyState } from "@/components/EmptyState";
import { DisconnectState } from "@/components/DisconnectState";
import { LoadingState } from "@/components/LoadingState";
import type { RoomState } from "@yapzi/shared";

export function RoomGuard({
  children,
}: {
  children: (room: RoomState) => ReactNode;
}) {
  const room = useRoomStore((state) => state.room);
  const connected = useRoomStore((state) => state.connected);
  const error = useRoomStore((state) => state.error);

  if (!connected && room) {
    return <DisconnectState />;
  }

  if (!connected) {
    return <LoadingState label="Connecting to the room..." />;
  }

  if (error) {
    return (
      <EmptyState
        title="Room issue"
        description={error.message}
      >
        <Link href="/join" className="text-primary">
          Join a room
        </Link>
      </EmptyState>
    );
  }

  if (!room) {
    return <LoadingState label="Joining room..." />;
  }

  return <>{children(room)}</>;
}
