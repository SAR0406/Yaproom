import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@yapzi/shared";

let socket:
  | Socket<ServerToClientEvents, ClientToServerEvents>
  | null = null;

function getSocketUrl() {
  const configured = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:4000";
    }
    return window.location.origin;
  }

  return "http://localhost:4000";
}

export function getSocket() {
  if (typeof window === "undefined") return null;
  if (!socket) {
    socket = io(getSocketUrl(), {
      autoConnect: false,
    });
  }
  return socket;
}
