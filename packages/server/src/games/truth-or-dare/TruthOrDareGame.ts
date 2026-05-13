/**
 * Truth or Dare Game Engine
 * Tiered spice levels (Family/Spicy/Savage), spin-wheel mechanic, custom prompts
 */

import type {
  TruthOrDareGameState,
  TruthOrDareChoice,
  TruthOrDareSpiceLevel,
  Player,
} from '@yapzi/shared';
import {
  TRUTH_OR_DARE_CONFIG,
  TRUTH_OR_DARE_PROMPTS,
} from '@yapzi/shared';

export class TruthOrDareGame {
  private gameState: TruthOrDareGameState = {
    spiceLevel: TRUTH_OR_DARE_CONFIG.DEFAULT_SPICE,
    currentPlayerId: null,
    currentChoice: null,
    currentPrompt: null,
    usedPromptIds: [],
    customPrompts: [],
    playerOrder: [],
    turnIndex: 0,
    skippedThisTurn: false,
    completedActions: [],
  };

  private players: Player[] = [];

  /**
   * Initialize game setup
   */
  async setup(players: Player[]): Promise<void> {
    this.players = players;
    this.gameState.playerOrder = players.map((p) => p.id);
    this.gameState.turnIndex = 0;
    this.gameState.usedPromptIds = [];
    this.gameState.completedActions = [];
  }

  /**
   * Set the spice level for the game
   */
  setSpiceLevel(level: TruthOrDareSpiceLevel): void {
    this.gameState.spiceLevel = level;
  }

  /**
   * Spin the wheel to select a random player
   */
  spin(playerId: string): string {
    // Pick a random player who hasn't been skipped this turn
    const eligible = this.players.filter(
      (p) => p.id !== playerId || this.players.length === 1
    );

    const target = eligible[Math.floor(Math.random() * eligible.length)];
    this.gameState.currentPlayerId = target.id;
    this.gameState.currentChoice = null;
    this.gameState.currentPrompt = null;
    this.gameState.skippedThisTurn = false;

    return target.id;
  }

  /**
   * Player chooses truth or dare
   */
  choose(playerId: string, choice: TruthOrDareChoice): void {
    if (this.gameState.currentPlayerId !== playerId) {
      throw new Error('Not your turn to choose');
    }

    this.gameState.currentChoice = choice;

    // Pick a prompt
    const prompt = this.pickPrompt(choice);
    this.gameState.currentPrompt = prompt;
  }

  /**
   * Pick a random unused prompt for the given choice type
   */
  private pickPrompt(choice: TruthOrDareChoice): { id: string; text: string; type: TruthOrDareChoice } {
    const deck = TRUTH_OR_DARE_PROMPTS[this.gameState.spiceLevel];
    const prompts = deck[choice];

    // Filter out used prompts
    const available = prompts.filter(
      (_, i) => !this.gameState.usedPromptIds.includes(`${choice}-${i}`)
    );

    // If all used, reset
    const pool = available.length > 0 ? available : prompts;
    if (available.length === 0) {
      this.gameState.usedPromptIds = this.gameState.usedPromptIds.filter(
        (id) => !id.startsWith(choice)
      );
    }

    const index = Math.floor(Math.random() * pool.length);
    const text = pool[index];
    const promptIndex = prompts.indexOf(text);

    this.gameState.usedPromptIds.push(`${choice}-${promptIndex}`);

    return {
      id: `${choice}-${promptIndex}`,
      text,
      type: choice,
    };
  }

  /**
   * Add a custom prompt to the deck
   */
  addCustomPrompt(playerId: string, text: string, type: TruthOrDareChoice): void {
    if (text.length > 200) {
      throw new Error('Prompt too long (max 200 characters)');
    }

    this.gameState.customPrompts.push({
      id: `custom-${Date.now()}`,
      text: text.trim(),
      type,
      authorId: playerId,
    });
  }

  /**
   * Mark the current action as completed
   */
  complete(playerId: string): void {
    if (this.gameState.currentPlayerId !== playerId) {
      throw new Error('Not your turn to complete');
    }

    this.gameState.completedActions.push({
      playerId,
      choice: this.gameState.currentChoice!,
      promptId: this.gameState.currentPrompt!.id,
      timestamp: Date.now(),
    });

    this.advanceTurn();
  }

  /**
   * Skip the current player's turn
   */
  skip(playerId: string): void {
    if (this.gameState.currentPlayerId !== playerId) {
      throw new Error('Not your turn to skip');
    }

    this.gameState.skippedThisTurn = true;
    this.advanceTurn();
  }

  /**
   * Advance to the next player's turn
   */
  private advanceTurn(): void {
    this.gameState.turnIndex++;
    this.gameState.currentPlayerId = null;
    this.gameState.currentChoice = null;
    this.gameState.currentPrompt = null;
    this.gameState.skippedThisTurn = false;
  }

  /**
   * Get the current game state (sanitized for clients)
   */
  getState(): TruthOrDareGameState {
    return { ...this.gameState };
  }

  /**
   * Get sanitized state for a specific player
   */
  getPlayerState(_playerId: string): TruthOrDareGameState {
    return this.getState();
  }
}