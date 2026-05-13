/**
 * Socket.io Client Setup
 * Initializes and manages WebSocket connection to the backend
 */

import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents, RoomState } from '@yapzi/shared';
import { resolveBackendOrigin } from '@/lib/backendUrl';

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

/**
 * Initialize Socket.io connection
 */
export function initializeSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (socket && socket.connected) {
    return socket;
  }

  const url = resolveBackendOrigin();
  socket = io(url, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected');
  });

  socket.on('disconnect', () => {
    console.log('[Socket] Disconnected');
  });

  socket.on('room:error', (error) => {
    console.error('[Socket] Room error:', error);
  });

  return socket;
}

/**
 * Get the socket instance
 */
export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
  return socket;
}

/**
 * Disconnect socket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Join a room
 */
export function joinRoom(
  roomCode: string,
  playerName: string,
  avatarIndex: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!socket) {
      reject(new Error('Socket not initialized'));
      return;
    }

    const handleSync = (payload: { playerId: string }) => {
      cleanup();
      resolve(payload.playerId);
    };
    const handleError = (payload: { message: string }) => {
      cleanup();
      reject(new Error(payload.message));
    };
    const cleanup = () => {
      socket?.off('room:sync', handleSync);
      socket?.off('reconnect:sync', handleSync);
      socket?.off('room:error', handleError);
    };

    socket.on('room:sync', handleSync);
    socket.on('reconnect:sync', handleSync);
    socket.on('room:error', handleError);

    const storedPlayerId =
      typeof window !== 'undefined' ? window.localStorage.getItem('yapzi:playerId') : null;

    socket.emit('room:join', {
      code: roomCode,
      nickname: playerName,
      playerId: storedPlayerId ?? undefined
    });
  });
}

/**
 * Leave current room
 */
export function leaveRoom(reason: string = 'user_left'): Promise<void> {
  return new Promise((resolve) => {
    if (!socket) {
      resolve();
      return;
    }

    void reason;
    socket.emit('room:leave');
    resolve();
  });
}

/**
 * Reconnect to a room
 */
export function reconnectToRoom(
  roomCode: string,
  playerId: string,
  sessionToken: string
): Promise<RoomState> {
  return new Promise((resolve, reject) => {
    if (!socket) {
      reject(new Error('Socket not initialized'));
      return;
    }

    void sessionToken;
    socket.once('room:sync', (payload) => resolve(payload.room));
    socket.once('room:error', (error) => reject(new Error(error.message)));
    socket.emit('room:join', {
      code: roomCode,
      nickname: 'Reconnecting player',
      playerId
    });
  });
}

/**
 * Submit ready status
 */
export function readyUp(ready: boolean): void {
  if (!socket) return;
  const playerId =
    typeof window !== 'undefined' ? window.localStorage.getItem('yapzi:playerId') : null;
  if (!playerId) return;
  socket.emit('room:ready', { playerId, isReady: ready });
}

/**
 * Start game (host only)
 */
export function startGame(): void {
  if (!socket) return;
  socket.emit('round:next');
}

/**
 * Next round
 */
export function nextRound(): void {
  if (!socket) return;
  socket.emit('round:next');
}

/**
 * Submit action
 */
export function submitAction(type: string, payload: any): void {
  void type;
  void payload;
}

/**
 * Submit vote
 */
export function submitVote(votedPlayerId: string, reason?: string): void {
  if (!socket) return;
  void reason;
  const playerId =
    typeof window !== 'undefined' ? window.localStorage.getItem('yapzi:playerId') : null;
  if (!playerId) return;
  socket.emit('vote:submit', { playerId, targetId: votedPlayerId });
}

/**
 * Send reaction emoji
 */
export function sendReaction(emoji: string): void {
  if (!socket) return;
  const playerId =
    typeof window !== 'undefined' ? window.localStorage.getItem('yapzi:playerId') : null;
  if (!playerId) return;
  socket.emit('reaction:send', { playerId, reaction: emoji });
}

/**
 * Request state sync
 */
export function requestStateSync(): Promise<RoomState | undefined> {
  return Promise.resolve(undefined);
}
