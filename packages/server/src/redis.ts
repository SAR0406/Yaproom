import Redis from 'ioredis';
import { config } from './config.js';

const redisUrl = config.redisUrl ?? 'redis://127.0.0.1:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 2,
  enableReadyCheck: false,
  lazyConnect: true
});
