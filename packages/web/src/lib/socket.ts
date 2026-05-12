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

  socket.on('error', (error) => {
    console.error('[Socket] Error:', error);
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

    socket.emit(
      'join_room',
      { roomCode, playerName, avatarIndex },
      (error?: string | null, playerId?: string) => {
        if (error) {
          reject(new Error(error));
        } else if (playerId) {
          resolve(playerId);
        } else {
          reject(new Error('No player ID returned'));
        }
      }
    );
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

    socket.emit('leave_room', { reason }, () => {
      resolve();
    });
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

    socket.emit(
      'reconnect_player',
      { roomCode, playerId, sessionToken },
      (error?: string | null, state?: RoomState) => {
        if (error) {
          reject(new Error(error));
        } else if (state) {
          resolve(state);
        } else {
          reject(new Error('No state returned'));
        }
      }
    );
  });
}

/**
 * Submit ready status
 */
export function readyUp(ready: boolean): void {
  if (!socket) return;
  socket.emit('ready_up', { ready });
}

/**
 * Start game (host only)
 */
export function startGame(): void {
  if (!socket) return;
  socket.emit('start_game', {});
}

/**
 * Next round
 */
export function nextRound(): void {
  if (!socket) return;
  socket.emit('next_round', {});
}

/**
 * Submit action
 */
export function submitAction(type: string, payload: any): void {
  if (!socket) return;
  socket.emit('submit_action', { type, payload });
}

/**
 * Submit vote
 */
export function submitVote(votedPlayerId: string, reason?: string): void {
  if (!socket) return;
  socket.emit('submit_vote', { votedPlayerId, reason });
}

/**
 * Send reaction emoji
 */
export function sendReaction(emoji: string): void {
  if (!socket) return;
  socket.emit('send_reaction', { emoji });
}

/**
 * Request state sync
 */
export function requestStateSync(): Promise<RoomState | undefined> {
  return new Promise((resolve) => {
    if (!socket) {
      resolve(undefined);
      return;
    }

    socket.emit('request_state_sync', (state?: RoomState) => {
      resolve(state);
    });
  });
}
