import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@yapzi/shared";
import { resolveBackendOrigin } from "@/lib/backendUrl";

let socket:
  | Socket<ServerToClientEvents, ClientToServerEvents>
  | null = null;

function resolveSocketUrl() {
  return resolveBackendOrigin();
}

export function getSocket() {
  if (typeof window === "undefined") return null;
  if (!socket) {
    socket = io(resolveSocketUrl(), {
      autoConnect: false,
    });
  }
  return socket;
}
