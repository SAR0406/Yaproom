import { Server, Socket } from 'socket.io';
import type {
  AdminActionPayload,
  ClientToServerEvents,
  GameMode,
  RoomCreatePayload,
  RoomJoinPayload,
  RoomSettings,
  RoomState,
  ServerToClientEvents
} from '@yapzi/shared';
import { createGameSession, advancePhase } from './gameEngine';
import { recordRoomEvent } from './db';
import { createPlayer, createRoom, defaultQueue, defaultSettings } from './roomUtils';
import { getRoom, removeRoom, saveRoom } from './roomStore';

const supportedModes: Set<GameMode> = new Set([
  'imposter',
  'drawing',
  'expose',
  'confession',
  'split'
]);

export type YapziSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  never,
  SocketData
>;

interface SocketData {
  roomCode?: string;
  playerId?: string;
}

export function registerSocketHandlers(io: Server<ClientToServerEvents, ServerToClientEvents>) {
  io.on('connection', (socket: YapziSocket) => {
    socket.on('room:create', async (payload: RoomCreatePayload) => {
      const settings = sanitizeSettings(payload.settings ?? defaultSettings);
      const queue = sanitizeQueue(payload.queue);
      const host = createPlayer(sanitizeNickname(payload.nickname), true);
      const room = createRoom(host, settings, queue);
      await saveRoom(room);

      socket.data = { roomCode: room.code, playerId: host.id };
      await socket.join(room.code);
      socket.emit('room:sync', { room, playerId: host.id });
      io.to(room.code).emit('room:update', room);
      await recordRoomEvent(room.id, 'room:create', { hostId: host.id });
    });

    socket.on('room:join', async (payload: RoomJoinPayload) => {
      const room = await getRoom(sanitizeRoomCode(payload.code));
      if (!room) {
        socket.emit('room:error', { code: 'INVALID_CODE', message: 'Room not found.' });
        return;
      }
      if (room.status === 'locked') {
        socket.emit('room:error', { code: 'ROOM_LOCKED', message: 'Room is locked.' });
        return;
      }
      if (room.status === 'in_game' && !room.settings.allowLateJoin) {
        socket.emit('room:error', {
          code: 'GAME_IN_PROGRESS',
          message: 'Game already started. Late join is disabled.'
        });
        return;
      }

      const existing = payload.playerId
        ? room.players.find((player) => player.id === payload.playerId)
        : undefined;

      if (payload.playerId && room.bannedPlayerIds.includes(payload.playerId)) {
        socket.emit('room:error', { code: 'PLAYER_BANNED', message: 'You were banned.' });
        return;
      }

      if (!existing && room.players.length >= room.settings.maxPlayers) {
        socket.emit('room:error', { code: 'ROOM_FULL', message: 'Room is full.' });
        return;
      }

      const player = existing
        ? {
            ...existing,
            nickname: sanitizeNickname(payload.nickname),
            isConnected: true,
            isBanned: false,
            lastActiveAt: new Date().toISOString()
          }
        : createPlayer(sanitizeNickname(payload.nickname), false, {
            id: payload.playerId
          });

      if (!existing) {
        room.players.push(player);
      } else {
        room.players = room.players.map((p) => (p.id === player.id ? player : p));
      }
      await saveRoom(room);

      socket.data = { roomCode: room.code, playerId: player.id };
      await socket.join(room.code);
      socket.emit(existing ? 'reconnect:sync' : 'room:sync', {
        room,
        playerId: player.id
      });
      io.to(room.code).emit('room:update', room);
      await recordRoomEvent(room.id, 'room:join', { playerId: player.id });
    });

    socket.on('room:leave', () => {
      void handleDisconnect(socket, io, true);
    });

    socket.on('room:ready', async ({ playerId, isReady }) => {
      const room = await getRoomFromSocket(socket);
      if (!room || playerId !== socket.data.playerId) return;
      room.players = room.players.map((player) =>
        player.id === playerId
          ? { ...player, isReady, lastActiveAt: new Date().toISOString() }
          : player
      );
      await saveRoom(room);
      io.to(room.code).emit('room:update', room);
    });

    socket.on('room:settings', async (settings: RoomSettings) => {
      const room = await getRoomFromSocket(socket);
      if (!room || room.hostId !== socket.data.playerId) return;
      room.settings = sanitizeSettings(settings);
      await saveRoom(room);
      io.to(room.code).emit('room:update', room);
      await recordRoomEvent(room.id, 'room:settings', { settings: room.settings });
    });

    socket.on('room:status', async ({ status }) => {
      const room = await getRoomFromSocket(socket);
      if (!room || room.hostId !== socket.data.playerId) return;
      if (status !== 'open' && status !== 'locked') return;
      room.status = status;
      await saveRoom(room);
      io.to(room.code).emit('room:update', room);
      await recordRoomEvent(room.id, 'room:status', { status });
    });

    socket.on('room:queue', async ({ queue }) => {
      const room = await getRoomFromSocket(socket);
      if (!room || room.hostId !== socket.data.playerId) return;
      room.queue = sanitizeQueue(queue);
      if (room.game) {
        room.game.queue = [...room.queue];
      }
      await saveRoom(room);
      io.to(room.code).emit('room:update', room);
      await recordRoomEvent(room.id, 'room:queue', { queue: room.queue });
    });

    socket.on('game:start', async ({ mode }: { mode: GameMode }) => {
      const room = await getRoomFromSocket(socket);
      if (!room || room.hostId !== socket.data.playerId) return;
      if (!supportedModes.has(mode)) return;
      room.status = 'in_game';
      room.game = createGameSession(mode, room.queue ?? [], room);
      await saveRoom(room);
      io.to(room.code).emit('game:mode', mode);
      io.to(room.code).emit('room:update', room);
      await recordRoomEvent(room.id, 'game:start', { mode });
    });

    socket.on('round:next', async () => {
      const room = await getRoomFromSocket(socket);
      if (!room || room.hostId !== socket.data.playerId) return;
      const updated = advancePhase(room);
      await saveRoom(updated);
      if (updated.game) {
        io.to(room.code).emit('game:phase', {
          round: updated.game.round,
          phase: updated.game.round.phase
        });
      }
      io.to(room.code).emit('room:update', updated);
      await recordRoomEvent(room.id, 'round:next', {
        phase: updated.game?.round.phase,
        round: updated.game?.round.number
      });
    });

    socket.on('reaction:send', async (payload) => {
      const room = await getRoomFromSocket(socket);
      if (!room) return;
      io.to(room.code).emit('reaction:receive', payload);
    });

    socket.on('vote:submit', async (payload) => {
      const room = await getRoomFromSocket(socket);
      if (!room?.game || payload.playerId !== socket.data.playerId) return;
      const votes = (room.game.round.payload?.votes as typeof payload[] | undefined) ?? [];
      room.game.round.payload = {
        ...room.game.round.payload,
        votes: [...votes.filter((vote) => vote.playerId !== payload.playerId), payload]
      };
      await saveRoom(room);
      io.to(room.code).emit('room:update', room);
    });

    socket.on('guess:submit', async (payload) => {
      const room = await getRoomFromSocket(socket);
      if (!room?.game || payload.playerId !== socket.data.playerId) return;
      const key = room.game.mode === 'split' ? 'choices' : 'guesses';
      const current = (room.game.round.payload?.[key] as typeof payload[] | undefined) ?? [];
      room.game.round.payload = {
        ...room.game.round.payload,
        [key]: [...current.filter((guess) => guess.playerId !== payload.playerId), payload]
      };
      await saveRoom(room);
      io.to(room.code).emit('room:update', room);
    });

    socket.on('confession:submit', async (payload) => {
      const room = await getRoomFromSocket(socket);
      if (!room?.game || payload.playerId !== socket.data.playerId) return;
      const confessions =
        (room.game.round.payload?.confessions as typeof payload[] | undefined) ?? [];
      room.game.round.payload = {
        ...room.game.round.payload,
        confessions: [...confessions.filter((entry) => entry.playerId !== payload.playerId), payload]
      };
      await saveRoom(room);
      io.to(room.code).emit('room:update', room);
    });

    socket.on('draw:path', async (payload) => {
      const room = await getRoomFromSocket(socket);
      if (!room?.game || payload.playerId !== socket.data.playerId) return;
      const drawPaths = (room.game.round.payload?.drawPaths as typeof payload[] | undefined) ?? [];
      room.game.round.payload = {
        ...room.game.round.payload,
        drawPaths: [...drawPaths, payload]
      };
      await saveRoom(room);
      io.to(room.code).emit('room:update', room);
    });

    socket.on('admin:kick', async (payload: AdminActionPayload) => {
      await handleAdminAction(socket, io, payload, 'kick');
    });
    socket.on('admin:mute', async (payload: AdminActionPayload) => {
      await handleAdminAction(socket, io, payload, 'mute');
    });
    socket.on('admin:ban', async (payload: AdminActionPayload) => {
      await handleAdminAction(socket, io, payload, 'ban');
    });

    socket.on('disconnect', () => {
      void handleDisconnect(socket, io, false);
    });
  });
}

function getRoomFromSocket(socket: YapziSocket) {
  const roomCode = socket.data.roomCode;
  if (!roomCode) return null;
  return getRoom(roomCode);
}

async function handleAdminAction(
  socket: YapziSocket,
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  payload: AdminActionPayload,
  action: 'kick' | 'mute' | 'ban'
) {
  const room = await getRoomFromSocket(socket);
  if (!room || room.hostId !== socket.data.playerId) return;
  if (payload.adminId !== socket.data.playerId) return;
  if (payload.targetId === room.hostId) return;

  room.players = room.players.map((player) => {
    if (player.id !== payload.targetId) return player;
    if (action === 'mute') return { ...player, isMuted: true };
    if (action === 'ban') return { ...player, isBanned: true };
    return player;
  });

  if (action === 'kick' || action === 'ban') {
    room.players = room.players.filter((player) => player.id !== payload.targetId);
  }

  if (action === 'ban' && !room.bannedPlayerIds.includes(payload.targetId)) {
    room.bannedPlayerIds.push(payload.targetId);
  }

  if (!room.players.find((player) => player.id === room.hostId)) {
    assignNextHost(room);
  }

  await saveRoom(room);
  io.to(room.code).emit('room:update', room);

  for (const client of io.sockets.sockets.values()) {
    if (client.data.roomCode === room.code && client.data.playerId === payload.targetId) {
      client.emit('room:error', {
        code: action === 'ban' ? 'PLAYER_BANNED' : 'PLAYER_KICKED',
        message: action === 'ban' ? 'You were banned from this room.' : 'You were removed by the host.'
      });
      void client.leave(room.code);
    }
  }

  await recordRoomEvent(room.id, `admin:${action}`, { ...payload });
}

async function handleDisconnect(
  socket: YapziSocket,
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  isLeave: boolean
) {
  const room = await getRoomFromSocket(socket);
  if (!room) return;
  const playerId = socket.data.playerId;
  if (!playerId) return;

  room.players = room.players.map((player) =>
    player.id === playerId
      ? {
          ...player,
          isConnected: false,
          isReady: false,
          lastActiveAt: new Date().toISOString()
        }
      : player
  );

  if (isLeave) {
    room.players = room.players.filter((player) => player.id !== playerId);
  }

  if (!room.players.length) {
    await removeRoom(room.code);
    return;
  }

  if (!room.players.find((player) => player.id === room.hostId)) {
    assignNextHost(room);
  }

  await saveRoom(room);
  io.to(room.code).emit('room:update', room);

  const host = room.players.find((player) => player.id === room.hostId);
  if (host && !host.isConnected) {
    io.to(room.code).emit('room:error', {
      code: 'HOST_DISCONNECTED',
      message: 'Host disconnected. Waiting for reconnect.'
    });
  }
}

function sanitizeNickname(value: string): string {
  const trimmed = value.trim().slice(0, 24);
  return trimmed || 'Player';
}

function sanitizeRoomCode(code: string): string {
  return code.trim().toUpperCase();
}

function sanitizeSettings(settings: RoomSettings): RoomSettings {
  return {
    ...settings,
    maxPlayers: clamp(settings.maxPlayers, 2, 20),
    roundLengthSec: clamp(settings.roundLengthSec, 15, 180)
  };
}

function sanitizeQueue(queue?: GameMode[]): GameMode[] {
  if (!queue?.length) return defaultQueue;
  const cleaned = queue.filter((mode) => supportedModes.has(mode));
  return cleaned.length ? cleaned : defaultQueue;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}

function assignNextHost(room: RoomState) {
  const nextHost = room.players.find((player) => player.isConnected) ?? room.players[0];
  if (!nextHost) return;
  room.hostId = nextHost.id;
  room.players = room.players.map((player) => ({
    ...player,
    isHost: player.id === nextHost.id
  }));
}
