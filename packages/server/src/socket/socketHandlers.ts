/**
 * Socket Event Handlers - Main entry point for all Socket.io events
 * This file orchestrates client-server communication
 */

import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, RoomState } from '@yapzi/shared';
import { roomManager } from '../core/rooms/RoomManager.js';

interface PlayerSession {
  roomId: string;
  playerId: string;
  sessionToken: string;
}

// Map socket ID to player session
const playerSessions = new Map<string, PlayerSession>();

/**
 * Register all Socket.io event handlers
 */
export function registerSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>
) {
  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log(`[Socket] Player connected: ${socket.id}`);

    // ====================================================================
    // CONNECTION EVENTS
    // ====================================================================

    socket.on('join_room', async (data, callback) => {
      try {
        const room = roomManager.getRoomByCode(data.roomCode);
        if (!room) {
          callback?.('Room not found');
          return;
        }

        // Add player to room
        const player = room.addPlayer({
          name: data.playerName,
          avatarIndex: data.avatarIndex,
          role: 'player',
        });

        // Store session info
        const session: PlayerSession = {
          roomId: room.id,
          playerId: player.id,
          sessionToken: player.sessionToken!,
        };
        playerSessions.set(socket.id, session);

        // Join socket to room namespace
        socket.join(`room:${room.id}`);

        // Notify other players
        io.to(`room:${room.id}`).emit('player_joined', player);

        // Send state to joining player
        socket.emit('room_state_updated', room.getState());

        callback?.(null, player.id);
      } catch (error) {
        console.error('[Socket] join_room error:', error);
        callback?.(String(error));
      }
    });

    socket.on('leave_room', async (data, callback) => {
      try {
        const session = playerSessions.get(socket.id);
        if (!session) {
          callback?.();
          return;
        }

        const room = roomManager.getRoom(session.roomId);
        if (room) {
          room.removePlayer(session.playerId);
          io.to(`room:${room.id}`).emit('player_left', {
            playerId: session.playerId,
            reason: data.reason,
          });

          // Delete room if empty
          if (room.getPlayerCount() === 0) {
            roomManager.deleteRoom(room.id);
          }
        }

        playerSessions.delete(socket.id);
        socket.leave(`room:${session.roomId}`);
        callback?.();
      } catch (error) {
        console.error('[Socket] leave_room error:', error);
        callback?.();
      }
    });

    socket.on('reconnect_player', async (data, callback) => {
      try {
        const room = roomManager.getRoomByCode(data.roomCode);
        if (!room) {
          callback?.('Room not found');
          return;
        }

        const player = room.getPlayer(data.playerId);
        if (!player || player.sessionToken !== data.sessionToken) {
          callback?.('Invalid session token');
          return;
        }

        // Update player status
        room.updatePlayerStatus(data.playerId, 'connected');

        // Store new session
        const session: PlayerSession = {
          roomId: room.id,
          playerId: data.playerId,
          sessionToken: data.sessionToken,
        };
        playerSessions.set(socket.id, session);
        socket.join(`room:${room.id}`);

        // Notify others
        io.to(`room:${room.id}`).emit('player_reconnected', player);

        // Send full state to reconnected player
        callback?.(null, room.getState());
      } catch (error) {
        console.error('[Socket] reconnect_player error:', error);
        callback?.(String(error));
      }
    });

    // ====================================================================
    // GAME ACTIONS
    // ====================================================================

    socket.on('ready_up', async (data, callback) => {
      try {
        const session = playerSessions.get(socket.id);
        if (!session) {
          callback?.();
          return;
        }

        const room = roomManager.getRoom(session.roomId);
        if (room) {
          room.updatePlayerReady(session.playerId, data.ready);
          io.to(`room:${room.id}`).emit('room_state_updated', room.getState());
        }

        callback?.();
      } catch (error) {
        console.error('[Socket] ready_up error:', error);
        callback?.();
      }
    });

    socket.on('start_game', async (callback) => {
      try {
        const session = playerSessions.get(socket.id);
        if (!session) {
          callback?.();
          return;
        }

        const room = roomManager.getRoom(session.roomId);
        if (!room) {
          callback?.();
          return;
        }

        // Check if sender is host
        const player = room.getPlayer(session.playerId);
        if (!player || player.role !== 'host') {
          callback?.();
          return;
        }

        // Start game
        await room.startGame();
        io.to(`room:${room.id}`).emit('room_state_updated', room.getState());
        callback?.();
      } catch (error) {
        console.error('[Socket] start_game error:', error);
        callback?.();
      }
    });

    socket.on('next_round', async (callback) => {
      try {
        const session = playerSessions.get(socket.id);
        if (!session) {
          callback?.();
          return;
        }

        const room = roomManager.getRoom(session.roomId);
        if (!room) {
          callback?.();
          return;
        }

        const engine = room.getEngine();
        await engine.nextRound();
        io.to(`room:${room.id}`).emit('room_state_updated', room.getState());
        callback?.();
      } catch (error) {
        console.error('[Socket] next_round error:', error);
        callback?.();
      }
    });

    socket.on('submit_action', async (data, callback) => {
      try {
        const session = playerSessions.get(socket.id);
        if (!session) {
          callback?.('Not in a room');
          return;
        }

        const room = roomManager.getRoom(session.roomId);
        if (!room) {
          callback?.('Room not found');
          return;
        }

        // Validate player is in the room
        const player = room.getPlayer(session.playerId);
        if (!player) {
          callback?.('Player not in room');
          return;
        }

        // Create action object
        const action = {
          id: `${session.playerId}-${Date.now()}`,
          type: data.type,
          playerId: session.playerId,
          roomId: room.id,
          timestamp: Date.now(),
          phase: room.getState().phase,
          payload: data.payload,
          validated: true,
        };

        // Submit to engine
        const engine = room.getEngine();
        await engine.submitAction(action);

        // Broadcast state update
        io.to(`room:${room.id}`).emit('room_state_updated', room.getState());
        io.to(`room:${room.id}`).emit('action_received', {
          actionId: action.id,
          playerId: session.playerId,
          success: true,
        });

        callback?.(null);
      } catch (error) {
        console.error('[Socket] submit_action error:', error);
        callback?.(String(error));
      }
    });

    socket.on('submit_vote', async (data, callback) => {
      try {
        const session = playerSessions.get(socket.id);
        if (!session) {
          callback?.();
          return;
        }

        const room = roomManager.getRoom(session.roomId);
        if (!room) {
          callback?.();
          return;
        }

        // Emit vote event to room
        io.to(`room:${room.id}`).emit('action_received', {
          actionId: `vote-${Date.now()}`,
          playerId: session.playerId,
          success: true,
        });

        callback?.();
      } catch (error) {
        console.error('[Socket] submit_vote error:', error);
        callback?.();
      }
    });

    socket.on('send_reaction', async (data, callback) => {
      try {
        const session = playerSessions.get(socket.id);
        if (!session) {
          callback?.();
          return;
        }

        const room = roomManager.getRoom(session.roomId);
        if (room) {
          io.to(`room:${room.id}`).emit('reaction_received', {
            playerId: session.playerId,
            emoji: data.emoji,
          });
        }

        callback?.();
      } catch (error) {
        console.error('[Socket] send_reaction error:', error);
        callback?.();
      }
    });

    socket.on('request_state_sync', (callback) => {
      try {
        const session = playerSessions.get(socket.id);
        if (!session) {
          return;
        }

        const room = roomManager.getRoom(session.roomId);
        if (room) {
          callback?.(room.getState());
        }
      } catch (error) {
        console.error('[Socket] request_state_sync error:', error);
      }
    });

    // ====================================================================
    // HOST ACTIONS
    // ====================================================================

    socket.on('host_kick_player', async (data, callback) => {
      try {
        const session = playerSessions.get(socket.id);
        if (!session) {
          callback?.();
          return;
        }

        const room = roomManager.getRoom(session.roomId);
        if (!room) {
          callback?.();
          return;
        }

        // Check if sender is host
        const player = room.getPlayer(session.playerId);
        if (!player || player.role !== 'host') {
          callback?.();
          return;
        }

        // Kick player
        room.removePlayer(data.playerId);
        io.to(`room:${room.id}`).emit('player_left', {
          playerId: data.playerId,
          reason: 'kicked',
        });

        callback?.();
      } catch (error) {
        console.error('[Socket] host_kick_player error:', error);
        callback?.();
      }
    });

    socket.on('disconnect', () => {
      try {
        const session = playerSessions.get(socket.id);
        if (session) {
          const room = roomManager.getRoom(session.roomId);
          if (room) {
            const player = room.getPlayer(session.playerId);
            if (player) {
              // Mark as disconnected (don't remove immediately to allow reconnect)
              room.updatePlayerStatus(session.playerId, 'disconnected');
              io.to(`room:${session.roomId}`).emit('player_disconnected', {
                playerId: session.playerId,
                willReconnectIn: 30000, // 30 seconds
              });

              // Auto-remove after 30 seconds if not reconnected
              setTimeout(() => {
                if (
                  room.getPlayer(session.playerId)?.status === 'disconnected'
                ) {
                  room.removePlayer(session.playerId);
                  io.to(`room:${session.roomId}`).emit('player_left', {
                    playerId: session.playerId,
                    reason: 'timeout',
                  });

                  // Delete room if empty
                  if (room.getPlayerCount() === 0) {
                    roomManager.deleteRoom(room.id);
                  }
                }
              }, 30000);
            }
          }

          playerSessions.delete(socket.id);
        }

        console.log(`[Socket] Player disconnected: ${socket.id}`);
      } catch (error) {
        console.error('[Socket] disconnect error:', error);
      }
    });
  });

  // Periodic cleanup
  setInterval(() => {
    const cleaned = roomManager.cleanupExpiredRooms();
    if (cleaned > 0) {
      console.log(`[RoomManager] Cleaned up ${cleaned} expired rooms`);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}
