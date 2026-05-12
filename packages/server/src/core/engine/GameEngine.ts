/**
 * Core Game Engine - State Machine
 * Handles game phase transitions, timing, and state management
 * This is the heart of the multiplayer system
 */

import { nanoid } from 'nanoid';
import type {
  GameType,
  GamePhase,
  RoomState,
  Player,
  GameAction,
  PHASE_ORDER,
} from '@yapzi/shared';
import { PHASE_ORDER, GAME_RULES } from '@yapzi/shared';

export interface GameEngineConfig {
  roomId: string;
  gameType: GameType;
  players: Player[];
  spectators: Player[];
  hostId: string;
}

export interface PhaseTransitionEvent {
  from: GamePhase;
  to: GamePhase;
  timestamp: number;
  phaseEndsAt: number;
}

export interface GameEngineCallbacks {
  onPhaseChange: (event: PhaseTransitionEvent) => Promise<void>;
  onStateChange: (state: RoomState) => Promise<void>;
  onGameEnd: (finalScores: Record<string, number>) => Promise<void>;
  onError: (error: Error) => void;
}

/**
 * GameEngine - Production state machine for multiplayer games
 * Ensures all phase transitions are valid and server-authoritative
 */
export class GameEngine {
  private roomId: string;
  private gameType: GameType;
  private currentPhase: GamePhase = 'lobby';
  private phaseStartedAt: number = 0;
  private phaseEndsAt: number = 0;
  private roundIndex: number = 0;
  private turnIndex: number = 0;
  private players: Player[];
  private spectators: Player[];
  private hostId: string;
  private gameState: Record<string, any> = {};
  private actionLog: GameAction[] = [];
  private scoreBoard: Record<string, number> = {};
  private completedRounds: any[] = [];
  private callbacks: GameEngineCallbacks;
  private phaseTimer: NodeJS.Timeout | null = null;

  constructor(config: GameEngineConfig, callbacks: GameEngineCallbacks) {
    this.roomId = config.roomId;
    this.gameType = config.gameType;
    this.players = config.players;
    this.spectators = config.spectators;
    this.hostId = config.hostId;
    this.callbacks = callbacks;

    // Initialize score board
    this.players.forEach((p) => {
      this.scoreBoard[p.id] = 0;
    });
  }

  /**
   * Get current room state
   */
  getState(): RoomState {
    return {
      config: {
        roomId: this.roomId,
        roomCode: '', // Will be populated by room manager
        hostId: this.hostId,
        gameType: this.gameType,
        maxPlayers: GAME_RULES[this.gameType].maxPlayers,
        isPublic: true,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      },
      phase: this.currentPhase,
      phaseStartedAt: this.phaseStartedAt,
      phaseEndsAt: this.phaseEndsAt,
      roundIndex: this.roundIndex,
      turnIndex: this.turnIndex,
      players: this.players,
      spectators: this.spectators,
      gameState: this.gameState,
      actionLog: this.actionLog,
      scoreBoard: this.scoreBoard,
      completedRounds: this.completedRounds,
    };
  }

  /**
   * Start the game - transition from lobby to setup
   */
  async startGame(): Promise<void> {
    if (this.currentPhase !== 'lobby') {
      throw new Error(`Cannot start game in phase: ${this.currentPhase}`);
    }

    await this.transitionPhase('lobby', 'setup');
  }

  /**
   * Progress to the next round
   */
  async nextRound(): Promise<void> {
    if (this.currentPhase === 'match_end') {
      throw new Error('Game is already ended');
    }

    this.roundIndex++;
    this.turnIndex = 0;
    this.resetRoundState();

    await this.transitionPhase('scoring', 'next_round');
    // Auto-transition to round_start after brief delay
    setTimeout(() => this.transitionPhase('next_round', 'round_start'), 2000);
  }

  /**
   * Advance to next phase in the state machine
   */
  async advancePhase(): Promise<void> {
    const currentIndex = PHASE_ORDER.indexOf(this.currentPhase);
    if (currentIndex === -1 || currentIndex === PHASE_ORDER.length - 1) {
      throw new Error(`Cannot advance from phase: ${this.currentPhase}`);
    }

    const nextPhase = PHASE_ORDER[currentIndex + 1];
    await this.transitionPhase(this.currentPhase, nextPhase);
  }

  /**
   * Transition between phases with validation
   */
  private async transitionPhase(from: GamePhase, to: GamePhase): Promise<void> {
    if (this.currentPhase !== from) {
      throw new Error(
        `Invalid phase transition: expected ${from}, current is ${this.currentPhase}`
      );
    }

    // Clear any existing timer
    if (this.phaseTimer) {
      clearTimeout(this.phaseTimer);
    }

    // Update phase and timing
    this.currentPhase = to;
    this.phaseStartedAt = Date.now();
    const phaseDuration = GAME_RULES[this.gameType].phaseTimeouts[to] || 0;
    this.phaseEndsAt = this.phaseStartedAt + phaseDuration;

    // Log phase change
    const event: PhaseTransitionEvent = {
      from,
      to,
      timestamp: this.phaseStartedAt,
      phaseEndsAt: this.phaseEndsAt,
    };

    // Notify callbacks
    await this.callbacks.onPhaseChange(event);
    await this.callbacks.onStateChange(this.getState());

    // Set up auto-transition timer if phase has duration
    if (phaseDuration > 0) {
      this.phaseTimer = setTimeout(
        () => this.onPhaseTimeout(to),
        phaseDuration
      );
    }
  }

  /**
   * Handle phase timeout - auto-advance when timer expires
   */
  private async onPhaseTimeout(phase: GamePhase): Promise<void> {
    if (this.currentPhase !== phase) {
      return; // Phase changed, ignore timeout
    }

    try {
      switch (phase) {
        case 'player_action':
        case 'voting':
          // Auto-advance to next phase
          await this.advancePhase();
          break;
        case 'reveal':
        case 'scoring':
          await this.advancePhase();
          break;
        default:
          break;
      }
    } catch (error) {
      this.callbacks.onError(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Submit a validated game action
   */
  async submitAction(action: GameAction): Promise<void> {
    // Validate action
    if (!this.isActionValid(action)) {
      throw new Error(`Invalid action: ${action.type}`);
    }

    // Record action
    this.actionLog.push(action);

    // Update state based on action
    await this.applyAction(action);

    // Notify state change
    await this.callbacks.onStateChange(this.getState());
  }

  /**
   * Validate an action is allowed in current phase
   */
  private isActionValid(action: GameAction): boolean {
    // Check phase matches
    if (action.phase !== this.currentPhase) {
      return false;
    }

    // Check player exists
    const player = this.players.find((p) => p.id === action.playerId);
    if (!player) {
      return false;
    }

    // Check if it's player's turn (if applicable)
    if (
      action.type === 'submit_guess' ||
      action.type === 'submit_clue' ||
      action.type === 'draw_stroke'
    ) {
      if (this.gameState.currentTurnPlayerId !== action.playerId) {
        return false;
      }
    }

    return true;
  }

  /**
   * Apply an action to game state
   */
  private async applyAction(action: GameAction): Promise<void> {
    // This will be overridden by specific game implementations
    // For now, just update game state
    this.gameState[action.id] = action.payload;
  }

  /**
   * End the game
   */
  async endGame(): Promise<void> {
    if (this.currentPhase === 'match_end') {
      return; // Already ended
    }

    // Clear timer
    if (this.phaseTimer) {
      clearTimeout(this.phaseTimer);
    }

    this.currentPhase = 'match_end';

    // Notify callback
    await this.callbacks.onGameEnd(this.scoreBoard);
  }

  /**
   * Reset state for a new round
   */
  private resetRoundState(): void {
    // Clear action log for new round
    this.actionLog = [];

    // Reset turn index
    this.turnIndex = 0;

    // Game-specific reset happens in game implementations
  }

  /**
   * Add a player to the game
   */
  addPlayer(player: Player): void {
    if (this.currentPhase !== 'lobby') {
      throw new Error('Cannot add players after game has started');
    }

    if (this.players.length >= GAME_RULES[this.gameType].maxPlayers) {
      // Add as spectator instead
      this.spectators.push(player);
    } else {
      this.players.push(player);
      this.scoreBoard[player.id] = 0;
    }
  }

  /**
   * Remove a player from the game
   */
  removePlayer(playerId: string): void {
    this.players = this.players.filter((p) => p.id !== playerId);
    this.spectators = this.spectators.filter((p) => p.id !== playerId);
    delete this.scoreBoard[playerId];
  }

  /**
   * Update a player's score
   */
  updatePlayerScore(playerId: string, delta: number): void {
    if (this.scoreBoard[playerId] === undefined) {
      this.scoreBoard[playerId] = 0;
    }
    this.scoreBoard[playerId] += delta;
  }

  /**
   * Check if game should end
   */
  shouldEndGame(): boolean {
    // Override in specific game implementations
    // Default: end after round limit
    return this.roundIndex >= 5;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.phaseTimer) {
      clearTimeout(this.phaseTimer);
    }
  }
}
