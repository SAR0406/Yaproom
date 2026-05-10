import { create } from "zustand";
import type { ErrorPayload, RoomState } from "@yapzi/shared";

interface RoomStore {
  room: RoomState | null;
  playerId: string | null;
  error: ErrorPayload | null;
  connected: boolean;
  setRoom: (room: RoomState | null) => void;
  updateRoom: (updater: (room: RoomState) => RoomState) => void;
  setPlayerId: (playerId: string | null) => void;
  setError: (error: ErrorPayload | null) => void;
  setConnected: (connected: boolean) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  room: null,
  playerId: null,
  error: null,
  connected: false,
  setRoom: (room) => set({ room }),
  updateRoom: (updater) =>
    set((state) => (state.room ? { room: updater(state.room) } : {})),
  setPlayerId: (playerId) => set({ playerId }),
  setError: (error) => set({ error }),
  setConnected: (connected) => set({ connected }),
  reset: () => set({ room: null, playerId: null, error: null }),
}));
