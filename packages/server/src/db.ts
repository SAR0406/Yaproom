import { Pool } from 'pg';
import { config } from './config.js';
import { encryptForStorage } from './security.js';

const pool = config.databaseUrl
  ? new Pool({
      connectionString: config.databaseUrl,
      connectionTimeoutMillis: 3000,
      query_timeout: 5000,
      statement_timeout: 5000,
      keepAlive: true
    })
  : null;

let disabledUntil = 0;

export async function recordRoomEvent(
  roomId: string,
  type: string,
  payload: unknown
): Promise<void> {
  if (!pool) return;
  const now = Date.now();
  if (now < disabledUntil) return;

  try {
    await pool.query(
      'INSERT INTO room_events (room_id, type, payload) VALUES ($1, $2, $3)',
      [roomId, type, encryptForStorage(payload)]
    );
  } catch (error) {
    disabledUntil = Date.now() + 30_000;
    console.warn('Failed to record room event; temporarily disabling DB event writes', formatDbError(error));
  }
}

export async function closeDb(): Promise<void> {
  if (!pool) return;
  await pool.end();
}

function formatDbError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return 'Unknown database error';
}
