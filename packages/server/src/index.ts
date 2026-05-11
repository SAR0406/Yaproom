import fastify from 'fastify';
import cors from '@fastify/cors';
import { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@yapzi/shared';

import { config, isAllowedClientOrigin } from './config.js';
import { registerSocketHandlers } from './socketHandlers.js';   // ✅ FIXED
import { registerAdminRoutes } from './adminRoutes.js';         // ✅ FIXED
import { registerAiRoutes } from './aiRoutes.js';

const app = fastify({ logger: true });

function checkAllowedOrigin(origin: string | undefined, channel: 'http' | 'socket'): boolean {
  const allowed = isAllowedClientOrigin(origin);
  if (!allowed) {
    app.log.warn({ channel, origin }, 'Rejected disallowed client origin');
  }
  return allowed;
}

await app.register(cors, {
  origin: (origin, cb) => cb(null, checkAllowedOrigin(origin, 'http')),
  credentials: true
});

app.addHook('onSend', async (_request, reply) => {
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('Referrer-Policy', 'no-referrer');
  reply.header('Permissions-Policy', 'camera=(), microphone=()');
  reply.header('Cross-Origin-Resource-Policy', 'same-site');
  reply.header('Cross-Origin-Opener-Policy', 'same-origin');
  reply.header('Cross-Origin-Embedder-Policy', 'require-corp');
});

app.get('/health', () => ({ status: 'ok' }));

const io = new Server<ClientToServerEvents, ServerToClientEvents>(app.server, {
  cors: {
    origin: (origin, cb) => cb(null, checkAllowedOrigin(origin, 'socket'))
  }
});

registerSocketHandlers(io);
registerAdminRoutes(app, io);
registerAiRoutes(app);

const start = async () => {
  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void start();
