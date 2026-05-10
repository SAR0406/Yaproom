import type { RoomState } from '@yapzi/shared';
import { redis } from './redis';

const ROOM_PREFIX = 'room:';

export async function saveRoom(room: RoomState): Promise<void> {
  await redis.set(`${ROOM_PREFIX}${room.code}`, JSON.stringify(room));
}

export async function getRoom(code: string): Promise<RoomState | null> {
  const data = await redis.get(`${ROOM_PREFIX}${code}`);
  return data ? (JSON.parse(data) as RoomState) : null;
}

export async function removeRoom(code: string): Promise<void> {
  await redis.del(`${ROOM_PREFIX}${code}`);
}
