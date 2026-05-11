import type { RoomState } from '@yapzi/shared';
import { redis } from './redis.js';

const ROOM_PREFIX = 'room:';

export async function saveRoom(room: RoomState): Promise<void> {
  await redis.set(`${ROOM_PREFIX}${room.code}`, JSON.stringify(room));
}

export async function getRoom(code: string): Promise<RoomState | null> {
  const data = await redis.get(`${ROOM_PREFIX}${code}`);
  if (!data) return null;
  const parsed = JSON.parse(data) as RoomState;
  return {
    ...parsed,
    bannedPlayerIds: parsed.bannedPlayerIds ?? [],
    chatFeed: parsed.chatFeed ?? []
  };
}

export async function listRooms(): Promise<RoomState[]> {
  const keys = await redis.keys(`${ROOM_PREFIX}*`);
  if (!keys.length) return [];
  const values = await redis.mget(...keys);
  return values
    .filter((value): value is string => Boolean(value))
    .map((value) => JSON.parse(value) as RoomState)
    .map((room) => ({
      ...room,
      bannedPlayerIds: room.bannedPlayerIds ?? [],
      chatFeed: room.chatFeed ?? []
    }));
}

export async function removeRoom(code: string): Promise<void> {
  await redis.del(`${ROOM_PREFIX}${code}`);
}
