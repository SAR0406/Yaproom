/**
 * Game Store - Zustand
 * Client-side state management for the game
 */

import { create } from 'zustand';
import type { RoomState, Player, GamePhase, GameType } from '@yapzi/shared';
import { initializeSocket, getSocket, joinRoom as socketJoinRoom } from '@/lib/socket';

interface GameStore {
  // Room info
  roomId: string | null;
  roomCode: string | null;
  playerId: string | null;
  sessionToken: string | null;

  // Game state
  roomState: RoomState | null;
  players: Player[];
  currentPlayer: Player | null;
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

    socket.on('connection_established', (data) => {
      set({
        playerId: data.playerId,
        sessionToken: data.sessionToken,
        isConnected: true,
        isConnecting: false,
      });
    });

    socket.on('room_state_updated', (state) => {
      set((prev) => {
        const currentPlayer = state.players.find((p) => p.id === prev.playerId);
        return {
          roomState: state,
          players: [...state.players, ...state.spectators],
          currentPlayer: currentPlayer || prev.currentPlayer,
          phase: state.phase,
        };
      });
    });

    socket.on('player_joined', (player) => {
      set((prev) => ({
        players: [...prev.players, player],
      }));
    });

    socket.on('player_left', (data) => {
      set((prev) => ({
        players: prev.players.filter((p) => p.id !== data.playerId),
      }));
    });

    socket.on('phase_changed', (data) => {
      set({
        phase: data.newPhase,
      });
    });

    socket.on('error', (data) => {
      set({
        error: data.message,
      });
    });

    socket.on('disconnect', () => {
      set({
        isConnected: false,
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
          players: [...state.players, ...state.spectators],
          currentPlayer: currentPlayer || prev.currentPlayer,
          phase: state.phase,
        };
      });
    },

    readyUp: (ready: boolean) => {
      const socket = getSocket();
      if (socket) {
        socket.emit('ready_up', { ready });
      }
    },

    startGame: () => {
      const socket = getSocket();
      if (socket) {
        socket.emit('start_game', {});
      }
    },

    nextRound: () => {
      const socket = getSocket();
      if (socket) {
        socket.emit('next_round', {});
      }
    },

    submitAction: (type: string, payload: any) => {
      const socket = getSocket();
      if (socket) {
        socket.emit('submit_action', { type, payload });
      }
    },

    submitVote: (playerId: string) => {
      const socket = getSocket();
      if (socket) {
        socket.emit('submit_vote', { votedPlayerId: playerId });
      }
    },

    sendReaction: (emoji: string) => {
      const socket = getSocket();
      if (socket) {
        socket.emit('send_reaction', { emoji });
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
