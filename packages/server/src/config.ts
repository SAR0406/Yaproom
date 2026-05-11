import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 4000),
  redisUrl: process.env.REDIS_URL,
  databaseUrl: process.env.DATABASE_URL,
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:3000',
  adminUsername: process.env.ADMIN_USERNAME ?? 'Frontman',
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH,
  appEncryptionKey: process.env.APP_ENCRYPTION_KEY
};
