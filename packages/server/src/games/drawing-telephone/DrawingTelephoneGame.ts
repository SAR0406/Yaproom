/**
 * Drawing Telephone Game Implementation
 * A chain game mixing writing, drawing, and guessing
 */

import { nanoid } from 'nanoid';
import type {
  DrawingTelephoneGameState,
  DrawingChain,
  DrawingStep,
  DrawingData,
  Player,
} from '@yapzi/shared';
import { DRAWING_TELEPHONE_PROMPTS, DRAWING_TELEPHONE_CONFIG } from '@yapzi/shared';

/**
 * Drawing Telephone Game Logic
 */
export class DrawingTelephoneGame {
  private gameState: DrawingTelephoneGameState = {
    chains: [],
    currentChainIndex: 0,
    currentTurnPlayerId: '',
    turnType: 'write',
  };

  private currentChainParticipants: string[] = [];

  /**
   * Initialize game setup
   */
  async setup(players: Player[]): Promise<void> {
    // Create chains
    const chains: DrawingChain[] = [];

    // Single chain with all players (more chaos!)
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    chains.push({
      participants: shuffled.map((p) => p.id),
      steps: [],
    });

    this.gameState.chains = chains;
    this.currentChainParticipants = shuffled.map((p) => p.id);

    // Start with a prompt
    const promptIndex = Math.floor(Math.random() * DRAWING_TELEPHONE_PROMPTS.length);
    const prompt = DRAWING_TELEPHONE_PROMPTS[promptIndex];

    // First player writes the prompt
    this.gameState.currentTurnPlayerId = this.currentChainParticipants[0];
    this.gameState.turnType = 'write';

    // Seed with initial prompt
    this.gameState.chains[0].steps.push({
      playerId: '__system__',
      type: 'write',
      content: prompt,
      timestamp: Date.now(),
    });
  }

  /**
   * Submit a written prompt
   */
  submitPrompt(playerId: string, text: string): void {
    if (this.gameState.currentTurnPlayerId !== playerId) {
      throw new Error('Not your turn');
    }

    if (this.gameState.turnType !== 'write') {
      throw new Error('Wrong phase for writing');
    }

    if (text.length === 0 || text.length > 200) {
      throw new Error('Invalid prompt length');
    }

    const chain = this.gameState.chains[this.gameState.currentChainIndex];
    chain.steps.push({
      playerId,
      type: 'write',
      content: text.trim(),
      timestamp: Date.now(),
    });

    this.advanceTurn();
  }

  /**
   * Submit a drawing
   */
  submitDrawing(playerId: string, drawing: DrawingData): void {
    if (this.gameState.currentTurnPlayerId !== playerId) {
      throw new Error('Not your turn');
    }

    if (this.gameState.turnType !== 'draw') {
      throw new Error('Wrong phase for drawing');
    }

    const chain = this.gameState.chains[this.gameState.currentChainIndex];
    chain.steps.push({
      playerId,
      type: 'draw',
      content: drawing,
      timestamp: Date.now(),
    });

    this.advanceTurn();
  }

  /**
   * Submit a guess
   */
  submitGuess(playerId: string, text: string): void {
    if (this.gameState.currentTurnPlayerId !== playerId) {
      throw new Error('Not your turn');
    }

    if (this.gameState.turnType !== 'guess') {
      throw new Error('Wrong phase for guessing');
    }

    if (text.length === 0 || text.length > 200) {
      throw new Error('Invalid guess length');
    }

    const chain = this.gameState.chains[this.gameState.currentChainIndex];
    chain.steps.push({
      playerId,
      type: 'guess',
      content: text.trim(),
      timestamp: Date.now(),
    });

    this.advanceTurn();
  }

  /**
   * Advance to next turn
   */
  private advanceTurn(): void {
    const chain = this.gameState.chains[this.gameState.currentChainIndex];
    const stepIndex = chain.steps.length - 1;

    // Rotate through: write -> draw -> guess -> write (repeats)
    let nextTurnType: 'write' | 'draw' | 'guess' = 'write';
    if (this.gameState.turnType === 'write') {
      nextTurnType = 'draw';
    } else if (this.gameState.turnType === 'draw') {
      nextTurnType = 'guess';
    }

    // Move to next player
    const currentPlayerIndex = this.currentChainParticipants.indexOf(
      this.gameState.currentTurnPlayerId
    );
    const nextPlayerIndex = (currentPlayerIndex + 1) % this.currentChainParticipants.length;
    const nextPlayer = this.currentChainParticipants[nextPlayerIndex];

    this.gameState.currentTurnPlayerId = nextPlayer;
    this.gameState.turnType = nextTurnType;

    // Check if we've completed the chain
    if (nextPlayerIndex === 0 && this.gameState.turnType === 'write') {
      // Chain complete, might move to next chain or end game
    }
  }

  /**
   * Get the last step for display (what the current player needs to work with)
   */
  getLastStep(): DrawingStep | null {
    const chain = this.gameState.chains[this.gameState.currentChainIndex];
    if (chain.steps.length === 0) return null;
    return chain.steps[chain.steps.length - 1];
  }

  /**
   * Check if game should end
   */
  shouldEnd(): boolean {
    // End after 2 full rotations through the chain
    const chain = this.gameState.chains[this.gameState.currentChainIndex];
    return chain.steps.length > this.currentChainParticipants.length * 6;
  }

  /**
   * Calculate scores (based on close guesses)
   */
  calculateRoundScores(players: Player[]): Record<string, number> {
    const scores: Record<string, number> = {};

    for (const player of players) {
      scores[player.id] = 0;
    }

    // Award points for participation
    for (const chain of this.gameState.chains) {
      for (const step of chain.steps) {
        if (step.playerId !== '__system__') {
          scores[step.playerId] = (scores[step.playerId] || 0) + 10;
        }
      }
    }

    return scores;
  }

  /**
   * Get public state
   */
  getPublicState(): Partial<DrawingTelephoneGameState> {
    return {
      currentTurnPlayerId: this.gameState.currentTurnPlayerId,
      turnType: this.gameState.turnType,
      // Don't show other steps until reveal
    };
  }

  /**
   * Get reveal state (full chain)
   */
  getRevealState(): DrawingTelephoneGameState {
    return { ...this.gameState };
  }
}

/**
 * Export game factory
 */
export const drawingTelephoneGameFactory = {
  create: () => new DrawingTelephoneGame(),
};
