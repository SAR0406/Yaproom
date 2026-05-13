/**
 * Game Store - Zustand
 * Client-side state management for the game
 */

import { create } from 'zustand';
import type { RoomState, PlayerState, GamePhase, GameMode } from '@yapzi/shared';
import { initializeSocket, getSocket, joinRoom as socketJoinRoom } from '@/lib/socket';

interface GameStore {
  // Room info
  roomId: string | null;
  roomCode: string | null;
  playerId: string | null;
  sessionToken: string | null;

  // Game state
  roomState: RoomState | null;
  players: PlayerState[];
  currentPlayer: PlayerState | null;
  phase: GamePhase;

  // UI state
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;

  // Actions
  initializeConnection: () => void;
  joinRoom: (roomCode: string, playerName: string, avatarIndex: number) => Promise<void>;
  leaveRoom: () => Promise<void>;
  updateRoomState: (state: RoomState) => void;
  readyUp: (ready: boolean) => void;
  startGame: () => void;
  nextRound: () => void;
  submitAction: (type: string, payload: any) => void;
  submitVote: (playerId: string) => void;
  sendReaction: (emoji: string) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const useGameStore = create<GameStore>((set, get) => {
  // Initialize socket listeners
  const setupSocketListeners = () => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('room:sync', (payload) => {
      set({
        playerId: payload.playerId,
        roomState: payload.room,
        players: [...payload.room.players, ...payload.room.bannedPlayerIds.map((id) => ({
          id,
          nickname: 'Banned',
          avatarKey: null,
          color: '#666666',
          isHost: false,
          isReady: false,
          isConnected: false,
          isMuted: false,
          isBanned: true,
          score: 0,
          lastActiveAt: payload.room.createdAt
        }))],
        currentPlayer: payload.room.players.find((p) => p.id === payload.playerId) ?? null,
        phase: payload.room.game?.round.phase ?? 'lobby',
        isConnected: true,
        isConnecting: false,
      });
    });

    socket.on('reconnect:sync', (payload) => {
      set((prev) => {
        const currentPlayer = payload.room.players.find((p) => p.id === payload.playerId);
        return {
          roomState: payload.room,
          players: payload.room.players,
          currentPlayer: currentPlayer || prev.currentPlayer,
          phase: payload.room.game?.round.phase ?? prev.phase,
        };
      });
    });

    socket.on('room:update', (state) => {
      set((prev) => {
        const currentPlayer = state.players.find((p) => p.id === prev.playerId);
        return {
          roomState: state,
          players: state.players,
          currentPlayer: currentPlayer || prev.currentPlayer,
          phase: state.game?.round.phase ?? prev.phase,
        };
      });
    });

    socket.on('player:update', (player) => {
      set((prev) => ({
        players: prev.players.some((p) => p.id === player.id)
          ? prev.players.map((p) => (p.id === player.id ? player : p))
          : [...prev.players, player],
      }));
    });

    socket.on('game:phase', (data) => {
      set({
        phase: data.phase,
      });
    });

    socket.on('room:error', (data) => {
      set({
        error: data.message,
      });
    });
  };

  return {
    // Initial state
    roomId: null,
    roomCode: null,
    playerId: null,
    sessionToken: null,
    roomState: null,
    players: [],
    currentPlayer: null,
    phase: 'lobby',
    isConnected: false,
    isConnecting: false,
    error: null,

    // Actions
    initializeConnection: () => {
      set({ isConnecting: true });
      try {
        const socket = initializeSocket();
        set({ isConnected: socket.connected, isConnecting: false });
        setupSocketListeners();
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Connection failed',
          isConnecting: false,
        });
      }
    },

    joinRoom: async (roomCode: string, playerName: string, avatarIndex: number) => {
      try {
        set({ isConnecting: true });
        const playerId = await socketJoinRoom(roomCode, playerName, avatarIndex);
        set({
          roomCode,
          playerId,
          isConnecting: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to join room',
          isConnecting: false,
        });
        throw error;
      }
    },

    leaveRoom: async () => {
      try {
        // Would call leaveRoom from socket.ts
        set({
          roomId: null,
          roomCode: null,
          playerId: null,
          sessionToken: null,
          roomState: null,
          players: [],
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to leave room',
        });
      }
    },

    updateRoomState: (state: RoomState) => {
      set((prev) => {
        const currentPlayer = state.players.find((p) => p.id === prev.playerId);
        return {
          roomState: state,
          players: state.players,
          currentPlayer: currentPlayer || prev.currentPlayer,
          phase: state.game?.round.phase ?? prev.phase,
        };
      });
    },

    readyUp: (ready: boolean) => {
      const socket = getSocket();
      if (socket) {
        const playerId = get().playerId;
        if (playerId) {
          socket.emit('room:ready', { playerId, isReady: ready });
        }
      }
    },

    startGame: () => {
      const socket = getSocket();
      if (socket) {
        const mode = get().roomState?.queue[0];
        if (mode) {
          socket.emit('game:start', { mode });
        }
      }
    },

    nextRound: () => {
      const socket = getSocket();
      if (socket) {
        socket.emit('round:next');
      }
    },

    submitAction: (type: string, payload: any) => {
      void type;
      void payload;
    },

    submitVote: (playerId: string) => {
      const socket = getSocket();
      if (socket) {
        const voterId = get().playerId;
        if (voterId) {
          socket.emit('vote:submit', { playerId: voterId, targetId: playerId });
        }
      }
    },

    sendReaction: (emoji: string) => {
      const socket = getSocket();
      if (socket) {
        const playerId = get().playerId;
        if (playerId) {
          socket.emit('reaction:send', { playerId, reaction: emoji });
        }
      }
    },

    setError: (error: string | null) => {
      set({ error });
    },

    clear: () => {
      set({
        roomId: null,
        roomCode: null,
        playerId: null,
        sessionToken: null,
        roomState: null,
        players: [],
        currentPlayer: null,
        phase: 'lobby',
        isConnected: false,
        isConnecting: false,
        error: null,
      });
    },
  };
});
