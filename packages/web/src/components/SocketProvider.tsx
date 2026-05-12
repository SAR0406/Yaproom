"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { getSocket, initializeSocket } from "@/lib/socket";
import { useRoomStore } from "@/stores/roomStore";

export function SocketProvider({
  children,
}: {
  children: ReactNode;
}) {
  const setRoom = useRoomStore((state) => state.setRoom);
  const setPlayerId = useRoomStore((state) => state.setPlayerId);
  const setError = useRoomStore((state) => state.setError);
  const setConnected = useRoomStore((state) => state.setConnected);

  useEffect(() => {
    const socket = getSocket() ?? initializeSocket();
    if (!socket) return;

    socket.connect();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("room:sync", (payload) => {
      setRoom(payload.room);
      setPlayerId(payload.playerId);
      setError(null);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("yapzi:playerId", payload.playerId);
      }
    });
    socket.on("reconnect:sync", (payload) => {
      setRoom(payload.room);
      setPlayerId(payload.playerId);
      setError(null);
    });
    socket.on("room:update", (room) => {
      setRoom(room);
      setError(null);
    });
    socket.on("room:error", (payload) => setError(payload));

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("room:sync");
      socket.off("room:update");
      socket.off("room:error");
      socket.off("reconnect:sync");
    };
  }, [setConnected, setError, setPlayerId, setRoom]);

  return <>{children}</>;
}
