import { Pool } from 'pg';
import { config } from './config';

const pool = config.databaseUrl
  ? new Pool({ connectionString: config.databaseUrl })
  : null;

export async function recordRoomEvent(
  roomId: string,
  type: string,
  payload: Record<string, unknown>
): Promise<void> {
  if (!pool) return;
  try {
    await pool.query(
      'INSERT INTO room_events (room_id, type, payload) VALUES ($1, $2, $3)',
      [roomId, type, payload]
    );
  } catch (error) {
    console.warn('Failed to record room event', error);
  }
}

export async function closeDb(): Promise<void> {
  if (!pool) return;
  await pool.end();
}
