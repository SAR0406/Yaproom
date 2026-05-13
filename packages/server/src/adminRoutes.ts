import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Server } from 'socket.io';
import type { ClientToServerEvents, RoomState, ServerToClientEvents } from '@yapzi/shared';
import { z } from 'zod';
import { getRoom, listRooms, removeRoom, saveRoom } from './roomStore.js';
import {
  createAdminSessionToken,
  parseBasicAuth,
  parseBearerAuth,
  verifyAdminCredentials,
  verifyAdminSessionToken
} from './security.js';
import { recordRoomEvent } from './db.js';
import { assertSafeText } from './contentSafety.js';

const codeParamsSchema = z.object({ code: z.string().min(1) });

const statusSchema = z.object({
  status: z.enum(['open', 'locked', 'ended'])
});

const targetSchema = z.object({
  targetId: z.string().min(1),
  reason: z.string().max(200).optional()
});

const announcementSchema = z.object({
  message: z.string().min(1).max(200)
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

const roomSettingsPatchSchema = z.object({
  chaosLevel: z.enum(['low', 'medium', 'high']).optional(),
  roundLengthSec: z.number().int().min(15).max(600).optional(),
  allowLateJoin: z.boolean().optional(),
  allowSpectators: z.boolean().optional(),
  anonymousMode: z.boolean().optional(),
  voiceEnabled: z.boolean().optional()
});

export function registerAdminRoutes(
  app: FastifyInstance,
  io: Server<ClientToServerEvents, ServerToClientEvents>
) {
  app.post('/admin/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid login payload' });
    }

    const { username, password } = parsed.data;
    if (!verifyAdminCredentials(username, password)) {
      return reply.code(401).send({ error: 'Invalid username or password' });
    }

    const token = createAdminSessionToken(username);
    const session = verifyAdminSessionToken(token);

    return {
      ok: true,
      token,
      expiresAt: session?.expiresAt ?? Date.now(),
      username
    };
  });

  app.get('/admin/session', async (request, reply) => {
    if (!isAuthorized(request)) {
      return unauthorized(reply);
    }

    return { ok: true };
  });

  app.get('/admin', async (request, reply) => {
    if (!isAuthorized(request)) {
      return unauthorized(reply);
    }

    const rooms = await listRooms();
    return {
      ok: true,
      rooms: rooms.length,
      connectedSockets: io.engine.clientsCount
    };
  });

  app.get('/admin/rooms', async (request, reply) => {
    if (!isAuthorized(request)) {
      return unauthorized(reply);
    }

    const rooms = await listRooms();
    return {
      rooms: rooms.map((room) => ({
        code: room.code,
        status: room.status,
        players: room.players.length,
        hostId: room.hostId
      }))
    };
  });

  app.get('/admin/rooms/:code', async (request, reply) => {
    if (!isAuthorized(request)) {
      return unauthorized(reply);
    }

    const code = parseRoomCodeParam(request.params);
    if (!code) {
      return reply.code(400).send({ error: 'Invalid request' });
    }

    const room = await getRoom(code);
    if (!room) {
      return reply.code(404).send({ error: 'Room not found' });
    }

    return {
      room: {
        code: room.code,
        status: room.status,
        hostId: room.hostId,
        settings: room.settings,
        players: room.players.map((player) => ({
          id: player.id,
          nickname: player.nickname,
          isHost: player.isHost,
          isMuted: player.isMuted,
          score: player.score,
          isConnected: player.isConnected
        }))
      }
    };
  });

  app.post('/admin/rooms/:code/settings', async (request, reply) => {
    if (!isAuthorized(request)) {
      return unauthorized(reply);
    }

    const code = parseRoomCodeParam(request.params);
    const parsed = roomSettingsPatchSchema.safeParse(request.body);
    if (!code || !parsed.success) {
      return reply.code(400).send({ error: 'Invalid request' });
    }

    const room = await getRoom(code);
    if (!room) {
      return reply.code(404).send({ error: 'Room not found' });
    }

    room.settings = {
      ...room.settings,
      ...parsed.data
    };

    await saveRoom(room);
    io.to(room.code).emit('room:update', room);
    await recordRoomEvent(room.id, 'admin:settings', parsed.data);

    return { ok: true, settings: room.settings };
  });

  app.post('/admin/rooms/:code/status', async (request, reply) => {
    if (!isAuthorized(request)) {
      return unauthorized(reply);
    }

    const code = parseRoomCodeParam(request.params);
    const parsed = statusSchema.safeParse(request.body);
    if (!code || !parsed.success) {
      return reply.code(400).send({ error: 'Invalid request' });
    }

    const room = await getRoom(code);
    if (!room) {
      return reply.code(404).send({ error: 'Room not found' });
    }

    room.status = parsed.data.status;
    if (room.status === 'ended') {
      io.to(room.code).emit('room:error', {
        code: 'UNKNOWN',
        message: 'Room ended by administrator.'
      });
      io.in(room.code).disconnectSockets(true);
      await removeRoom(room.code);
      await recordRoomEvent(room.id, 'admin:status', parsed.data);
      return { ok: true, roomCode: room.code, status: room.status, ended: true };
    }

    await saveRoom(room);
    io.to(room.code).emit('room:update', room);
    await recordRoomEvent(room.id, 'admin:status', parsed.data);

    return { ok: true, roomCode: room.code, status: room.status };
  });

  app.post('/admin/rooms/:code/mute', async (request, reply) => {
    if (!isAuthorized(request)) {
      return unauthorized(reply);
    }

    const code = parseRoomCodeParam(request.params);
    const parsed = targetSchema.safeParse(request.body);
    if (!code || !parsed.success) {
      return reply.code(400).send({ error: 'Invalid request' });
    }

    const room = await getRoom(code);
    if (!room) {
      return reply.code(404).send({ error: 'Room not found' });
    }

    room.players = room.players.map((player) =>
      player.id === parsed.data.targetId ? { ...player, isMuted: true } : player
    );

    await saveRoom(room);
    io.to(room.code).emit('room:update', room);
    await recordRoomEvent(room.id, 'admin:global-mute', parsed.data);

    return { ok: true };
  });

  app.post('/admin/rooms/:code/kick', async (request, reply) => {
    if (!isAuthorized(request)) {
      return unauthorized(reply);
    }

    const code = parseRoomCodeParam(request.params);
    const parsed = targetSchema.safeParse(request.body);
    if (!code || !parsed.success) {
      return reply.code(400).send({ error: 'Invalid request' });
    }

    const room = await getRoom(code);
    if (!room) {
      return reply.code(404).send({ error: 'Room not found' });
    }

    room.players = room.players.filter((player) => player.id !== parsed.data.targetId);
    await saveRoom(room);
    io.to(room.code).emit('room:update', room);
    disconnectTarget(io, room, parsed.data.targetId, 'PLAYER_KICKED', 'You were removed by admin.');
    await recordRoomEvent(room.id, 'admin:global-kick', parsed.data);

    return { ok: true };
  });

  app.post('/admin/rooms/:code/ban', async (request, reply) => {
    if (!isAuthorized(request)) {
      return unauthorized(reply);
    }

    const code = parseRoomCodeParam(request.params);
    const parsed = targetSchema.safeParse(request.body);
    if (!code || !parsed.success) {
      return reply.code(400).send({ error: 'Invalid request' });
    }

    const room = await getRoom(code);
    if (!room) {
      return reply.code(404).send({ error: 'Room not found' });
    }

    if (!room.bannedPlayerIds.includes(parsed.data.targetId)) {
      room.bannedPlayerIds.push(parsed.data.targetId);
    }
    room.players = room.players.filter((player) => player.id !== parsed.data.targetId);

    await saveRoom(room);
    io.to(room.code).emit('room:update', room);
    disconnectTarget(io, room, parsed.data.targetId, 'PLAYER_BANNED', 'You were banned by admin.');
    await recordRoomEvent(room.id, 'admin:global-ban', parsed.data);

    return { ok: true };
  });

  app.post('/admin/rooms/:code/announce', async (request, reply) => {
    if (!isAuthorized(request)) {
      return unauthorized(reply);
    }

    const code = parseRoomCodeParam(request.params);
    const parsed = announcementSchema.safeParse(request.body);
    if (!code || !parsed.success) {
      return reply.code(400).send({ error: 'Invalid request' });
    }

    const safe = assertSafeText(parsed.data.message);
    if (!safe.ok) {
      return reply.code(400).send({ error: safe.message });
    }

    const room = await getRoom(code);
    if (!room) {
      return reply.code(404).send({ error: 'Room not found' });
    }

    io.to(room.code).emit('room:error', {
      code: 'UNKNOWN',
      message: `[ADMIN NOTICE] ${parsed.data.message.trim()}`
    });

    await recordRoomEvent(room.id, 'admin:announcement', parsed.data);
    return { ok: true };
  });
}

function isAuthorized(request: FastifyRequest): boolean {
  const bearerToken = parseBearerAuth(request);
  if (bearerToken) {
    const session = verifyAdminSessionToken(bearerToken);
    if (session) {
      return true;
    }
  }

  const credentials = parseBasicAuth(request);
  if (!credentials) {
    return false;
  }
  return verifyAdminCredentials(credentials.username, credentials.password);
}

function unauthorized(reply: FastifyReply) {
  return reply
    .code(401)
    .header('WWW-Authenticate', 'Basic realm="Yapzi Admin"')
    .send({ error: 'Unauthorized' });
}

function parseRoomCodeParam(params: unknown): string | null {
  const parsed = codeParamsSchema.safeParse(params);
  if (!parsed.success) {
    return null;
  }
  return parsed.data.code;
}

function disconnectTarget(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  room: RoomState,
  targetId: string,
  code: 'PLAYER_KICKED' | 'PLAYER_BANNED',
  message: string
) {
  for (const client of io.sockets.sockets.values()) {
    if (client.data.roomCode === room.code && client.data.playerId === targetId) {
      client.emit('room:error', { code, message });
      void client.leave(room.code);
    }
  }
}
