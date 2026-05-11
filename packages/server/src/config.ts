import dotenv from 'dotenv';

dotenv.config();

function normalizeOrigin(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  try {
    return new URL(trimmed).origin;
  } catch {
    return null;
  }
}

function parseClientOrigins(value: string | undefined): string[] {
  const defaults = ['http://localhost:3000'];
  const parsed = (value ?? defaults[0])
    .split(',')
    .map((item) => normalizeOrigin(item))
    .filter((item): item is string => Boolean(item));

  if (parsed.length === 0) {
    return defaults;
  }

  return Array.from(new Set(parsed));
}

const clientOrigins = parseClientOrigins(process.env.CLIENT_ORIGIN);

export const config = {
  port: Number(process.env.PORT ?? 4000),
  redisUrl: process.env.REDIS_URL,
  databaseUrl: process.env.DATABASE_URL,
  clientOrigin: clientOrigins[0],
  clientOrigins,
  adminUsername: process.env.ADMIN_USERNAME ?? 'Frontman',
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH,
  appEncryptionKey: process.env.APP_ENCRYPTION_KEY
};

export function isAllowedClientOrigin(origin: string | undefined): boolean {
  if (!origin) {
    return true;
  }
  const normalized = normalizeOrigin(origin);
  if (!normalized) {
    return false;
  }
  return config.clientOrigins.includes(normalized);
}
