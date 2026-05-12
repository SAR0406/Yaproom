/**
 * Room Manager - Manages game rooms and player state
 * Handles room creation, player joining/leaving, and state persistence
 */

import { nanoid } from 'nanoid';
import type { GameType, RoomState, Player, PlayerRole, PlayerStatus } from '@yapzi/shared';
import { AVATAR_COLORS, GAME_RULES } from '@yapzi/shared';
import { GameEngine } from './GameEngine.js';

export interface RoomConfig {
  gameType: GameType;
  hostId: string;
  maxPlayers?: number;
  isPublic?: boolean;
}

export interface CreatePlayerOptions {
  name: string;
  avatarIndex: number;
  role: PlayerRole;
}

/**
 * Room - Represents a single game room
 */
export class Room {
  readonly id: string;
  readonly code: string;
  readonly gameType: GameType;
  readonly hostId: string;
  private players: Map<string, Player> = new Map();
  private spectators: Map<string, Player> = new Map();
  private engine: GameEngine;
  private createdAt: number;
  private expiresAt: number;

  constructor(config: RoomConfig) {
    this.id = nanoid();
    this.code = this.generateRoomCode();
    this.gameType = config.gameType;
    this.hostId = config.hostId;
    this.createdAt = Date.now();
    this.expiresAt = this.createdAt + 24 * 60 * 60 * 1000; // 24 hour expiry

    // Initialize engine
    this.engine = new GameEngine(
      {
        roomId: this.id,
        gameType: this.gameType,
        players: Array.from(this.players.values()),
        spectators: Array.from(this.spectators.values()),
        hostId: this.hostId,
      },
      {
        onPhaseChange: async () => {},
        onStateChange: async () => {},
        onGameEnd: async () => {},
        onError: (error) => console.error('Engine error:', error),
      }
    );
  }

  /**
   * Generate a unique room code
   */
  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Add a player to the room
   */
  addPlayer(options: CreatePlayerOptions): Player {
    const player: Player = {
      id: nanoid(),
      name: options.name,
      avatar: options.avatarIndex,
      role: options.role,
      status: 'connected',
      joinedAt: Date.now(),
      lastSeenAt: Date.now(),
      score: 0,
      totalScore: 0,
      isReady: false,
      color: AVATAR_COLORS[options.avatarIndex % AVATAR_COLORS.length],
      sessionToken: nanoid(32),
    };

    if (this.isFull()) {
      this.spectators.set(player.id, player);
    } else {
      this.players.set(player.id, player);
    }

    return player;
  }

  /**
   * Remove a player from the room
   */
  removePlayer(playerId: string): void {
    this.players.delete(playerId);
    this.spectators.delete(playerId);
  }

  /**
   * Get a player by ID
   */
  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId) || this.spectators.get(playerId);
  }

  /**
   * Check if room is full
   */
  isFull(): boolean {
    return this.players.size >= GAME_RULES[this.gameType].maxPlayers;
  }

  /**
   * Get player count
   */
  getPlayerCount(): number {
    return this.players.size + this.spectators.size;
  }

  /**
   * Check if enough players to start
   */
  canStart(): boolean {
    return (
      this.players.size >= GAME_RULES[this.gameType].minPlayers &&
      this.hasAllPlayersReady()
    );
  }

  /**
   * Check if all players are ready
   */
  private hasAllPlayersReady(): boolean {
    for (const player of this.players.values()) {
      if (player.role !== 'spectator' && !player.isReady) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get room state
   */
  getState(): RoomState {
    return this.engine.getState();
  }

  /**
   * Start the game
   */
  async startGame(): Promise<void> {
    await this.engine.startGame();
  }

  /**
   * Get the game engine
   */
  getEngine(): GameEngine {
    return this.engine;
  }

  /**
   * Check if room has expired
   */
  hasExpired(): boolean {
    return Date.now() > this.expiresAt;
  }

  /**
   * Update player ready state
   */
  updatePlayerReady(playerId: string, isReady: boolean): void {
    const player = this.getPlayer(playerId);
    if (player) {
      player.isReady = isReady;
      player.lastSeenAt = Date.now();
    }
  }

  /**
   * Update player status
   */
  updatePlayerStatus(playerId: string, status: PlayerStatus): void {
    const player = this.getPlayer(playerId);
    if (player) {
      player.status = status;
      player.lastSeenAt = Date.now();
    }
  }

  /**
   * Get all active players
   */
  getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  /**
   * Get all spectators
   */
  getSpectators(): Player[] {
    return Array.from(this.spectators.values());
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.engine.destroy();
    this.players.clear();
    this.spectators.clear();
  }
}

/**
 * RoomManager - Manages multiple game rooms
 */
export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private roomsByCode: Map<string, string> = new Map(); // code -> room id

  /**
   * Create a new room
   */
  createRoom(hostId: string, gameType: GameType): Room {
    const room = new Room({
      gameType,
      hostId,
    });

    this.rooms.set(room.id, room);
    this.roomsByCode.set(room.code, room.id);

    return room;
  }

  /**
   * Get room by ID
   */
  getRoom(roomId: string): Room | undefined {
    const room = this.rooms.get(roomId);
    if (room && room.hasExpired()) {
      this.deleteRoom(roomId);
      return undefined;
    }
    return room;
  }

  /**
   * Get room by code
   */
  getRoomByCode(code: string): Room | undefined {
    const roomId = this.roomsByCode.get(code);
    if (!roomId) return undefined;
    return this.getRoom(roomId);
  }

  /**
   * Delete a room
   */
  deleteRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.destroy();
      this.rooms.delete(roomId);
      this.roomsByCode.delete(room.code);
    }
  }

  /**
   * Get all active rooms
   */
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values()).filter((room) => !room.hasExpired());
  }

  /**
   * Get room count
   */
  getRoomCount(): number {
    return this.rooms.size;
  }

  /**
   * Cleanup expired rooms
   */
  cleanupExpiredRooms(): number {
    let cleaned = 0;
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.hasExpired()) {
        this.deleteRoom(roomId);
        cleaned++;
      }
    }
    return cleaned;
  }
}

// Export singleton
export const roomManager = new RoomManager();
