import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@yapzi/shared";

let socket:
  | Socket<ServerToClientEvents, ClientToServerEvents>
  | null = null;

export function getSocket() {
  if (typeof window === "undefined") return null;
  if (!socket) {
    socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000",
      {
        autoConnect: false,
      }
    );
  }
  return socket;
}
