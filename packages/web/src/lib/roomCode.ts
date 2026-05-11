export function normalizeRoomCode(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4);
}
