import fastify from 'fastify';
import cors from '@fastify/cors';
import { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@yapzi/shared';
import { config } from './config';
import { registerSocketHandlers } from './socketHandlers';

const app = fastify({ logger: true });

await app.register(cors, {
  origin: config.clientOrigin
});

app.get('/health', async () => ({ status: 'ok' }));

const io = new Server<ClientToServerEvents, ServerToClientEvents>(app.server, {
  cors: { origin: config.clientOrigin }
});

registerSocketHandlers(io);

const start = async () => {
  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
