import { ROOM_CODE_LENGTH } from "@/lib/constraints";

export function normalizeRoomCode(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, ROOM_CODE_LENGTH)
    .toUpperCase();
}
