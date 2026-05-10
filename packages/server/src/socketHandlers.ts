import { Server, Socket } from 'socket.io';
import type {
  AdminActionPayload,
  ClientToServerEvents,
  GameMode,
  RoomCreatePayload,
  RoomJoinPayload,
  RoomSettings,
  ServerToClientEvents
} from '@yapzi/shared';
import { createGameSession, advancePhase } from './gameEngine';
import { recordRoomEvent } from './db';
import { createPlayer, createRoom, defaultQueue, defaultSettings } from './roomUtils';
import { getRoom, removeRoom, saveRoom } from './roomStore';

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
      const settings = payload.settings ?? defaultSettings;
      const queue = payload.queue?.length ? payload.queue : defaultQueue;
      const host = createPlayer(payload.nickname, true);
      const room = createRoom(host, settings, queue);
      await saveRoom(room);

      socket.data = { roomCode: room.code, playerId: host.id } as SocketData;
      socket.join(room.code);
      socket.emit('room:sync', { room, playerId: host.id });
      io.to(room.code).emit('room:update', room);
      await recordRoomEvent(room.id, 'room:create', { hostId: host.id });
    });

    socket.on('room:join', async (payload: RoomJoinPayload) => {
      const room = await getRoom(payload.code);
      if (!room) {
        socket.emit('room:error', { code: 'INVALID_CODE', message: 'Room not found.' });
        return;
      }
      if (room.status === 'locked') {
        socket.emit('room:error', { code: 'ROOM_LOCKED', message: 'Room is locked.' });
        return;
      }
      if (room.players.length >= room.settings.maxPlayers) {
        socket.emit('room:error', { code: 'ROOM_FULL', message: 'Room is full.' });
        return;
      }

      const existing = payload.playerId
        ? room.players.find((player) => player.id === payload.playerId)
        : undefined;
      if (existing?.isBanned) {
        socket.emit('room:error', { code: 'PLAYER_BANNED', message: 'You were banned.' });
        return;
      }
      const player = existing
        ? {
            ...existing,
            nickname: payload.nickname,
            isConnected: true,
            lastActiveAt: new Date().toISOString()
          }
        : createPlayer(payload.nickname, false, {
            id: payload.playerId
          });

      if (!existing) {
        room.players.push(player);
      } else {
        room.players = room.players.map((p) => (p.id === player.id ? player : p));
      }
      await saveRoom(room);

      socket.data = { roomCode: room.code, playerId: player.id } as SocketData;
      socket.join(room.code);
      socket.emit(existing ? 'reconnect:sync' : 'room:sync', {
        room,
        playerId: player.id
      });
      io.to(room.code).emit('room:update', room);
      await recordRoomEvent(room.id, 'room:join', { playerId: player.id });
    });

    socket.on('room:leave', async () => {
      await handleDisconnect(socket, io, true);
    });

    socket.on('room:ready', async ({ playerId, isReady }) => {
      const room = await getRoomFromSocket(socket);
      if (!room) return;
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
      room.settings = settings;
      await saveRoom(room);
      io.to(room.code).emit('room:update', room);
    });

    socket.on('game:start', async ({ mode }: { mode: GameMode }) => {
      const room = await getRoomFromSocket(socket);
      if (!room || room.hostId !== socket.data.playerId) return;
      room.status = 'in_game';
      room.game = createGameSession(mode, room.queue ?? [], room);
      await saveRoom(room);
      io.to(room.code).emit('game:mode', mode);
      io.to(room.code).emit('room:update', room);
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
    });

    socket.on('reaction:send', async (payload) => {
      const room = await getRoomFromSocket(socket);
      if (!room) return;
      io.to(room.code).emit('reaction:receive', payload);
    });

    socket.on('vote:submit', async (payload) => {
      const room = await getRoomFromSocket(socket);
      if (!room?.game) return;
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
      if (!room?.game) return;
      const guesses = (room.game.round.payload?.guesses as typeof payload[] | undefined) ?? [];
      room.game.round.payload = {
        ...room.game.round.payload,
        guesses: [...guesses.filter((guess) => guess.playerId !== payload.playerId), payload]
      };
      await saveRoom(room);
      io.to(room.code).emit('room:update', room);
    });

    socket.on('confession:submit', async (payload) => {
      const room = await getRoomFromSocket(socket);
      if (!room?.game) return;
      const confessions =
        (room.game.round.payload?.confessions as typeof payload[] | undefined) ?? [];
      room.game.round.payload = {
        ...room.game.round.payload,
        confessions: [...confessions, payload]
      };
      await saveRoom(room);
      io.to(room.code).emit('room:update', room);
    });

    socket.on('draw:path', async (payload) => {
      const room = await getRoomFromSocket(socket);
      if (!room?.game) return;
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

    socket.on('disconnect', async () => {
      await handleDisconnect(socket, io, false);
    });
  });
}

async function getRoomFromSocket(socket: YapziSocket) {
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

  room.players = room.players.map((player) => {
    if (player.id !== payload.targetId) return player;
    if (action === 'mute') return { ...player, isMuted: true };
    if (action === 'ban') return { ...player, isBanned: true };
    return player;
  });

  if (action === 'kick' || action === 'ban') {
    room.players = room.players.filter((player) => player.id !== payload.targetId);
  }

  await saveRoom(room);
  io.to(room.code).emit('room:update', room);
  await recordRoomEvent(room.id, `admin:${action}`, payload);
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

  await saveRoom(room);
  io.to(room.code).emit('room:update', room);

  const hostDisconnected = room.players.find((player) => player.id === room.hostId);
  if (hostDisconnected && !hostDisconnected.isConnected) {
    io.to(room.code).emit('room:error', {
      code: 'HOST_DISCONNECTED',
      message: 'Host disconnected. Waiting for reconnect.'
    });
  }
}
