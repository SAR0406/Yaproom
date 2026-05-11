import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Server } from 'socket.io';
import type { ClientToServerEvents, RoomState, ServerToClientEvents } from '@yapzi/shared';
import { z } from 'zod';
import { getRoom, listRooms, saveRoom } from './roomStore';
import { parseBasicAuth, verifyAdminCredentials } from './security';
import { recordRoomEvent } from './db';
import { assertSafeText } from './contentSafety';

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

export function registerAdminRoutes(
  app: FastifyInstance,
  io: Server<ClientToServerEvents, ServerToClientEvents>
) {
  app.addHook('preHandler', async (request, reply) => {
    if (!request.routeOptions.url.startsWith('/admin')) {
      return;
    }
    if (!isAuthorized(request)) {
      reply
        .code(401)
        .header('WWW-Authenticate', 'Basic realm="Yapzi Admin"')
        .send({ error: 'Unauthorized' });
    }
  });

  app.get('/admin', async () => {
    const rooms = await listRooms();
    return {
      ok: true,
      rooms: rooms.length,
      connectedSockets: io.engine.clientsCount
    };
  });

  app.get('/admin/rooms', async () => {
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

  app.post('/admin/rooms/:code/status', async (request, reply) => {
    const parsed = statusSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid body' });
    }

    const room = await getRoom(request.params.code);
    if (!room) {
      return reply.code(404).send({ error: 'Room not found' });
    }

    room.status = parsed.data.status;
    await saveRoom(room);
    io.to(room.code).emit('room:update', room);
    await recordRoomEvent(room.id, 'admin:status', parsed.data);

    return { ok: true, roomCode: room.code, status: room.status };
  });

  app.post('/admin/rooms/:code/mute', async (request, reply) => {
    const parsed = targetSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid body' });
    }

    const room = await getRoom(request.params.code);
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
    const parsed = targetSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid body' });
    }

    const room = await getRoom(request.params.code);
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
    const parsed = targetSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid body' });
    }

    const room = await getRoom(request.params.code);
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
    const parsed = announcementSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid body' });
    }

    const safe = assertSafeText(parsed.data.message);
    if (!safe.ok) {
      return reply.code(400).send({ error: safe.message });
    }

    const room = await getRoom(request.params.code);
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
  const credentials = parseBasicAuth(request);
  if (!credentials) {
    return false;
  }
  return verifyAdminCredentials(credentials.username, credentials.password);
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
