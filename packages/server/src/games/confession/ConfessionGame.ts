/**
 * Confession Game Implementation
 * Anonymous confessions with voting and identity guessing
 */

import { nanoid } from 'nanoid';
import type { ConfessionGameState, Confession, Player } from '@yapzi/shared';
import { CONFESSION_CONFIG, CONFESSION_PROMPTS } from '@yapzi/shared';

/**
 * Confession Game Logic
 */
export class ConfessionGame {
  private gameState: ConfessionGameState = {
    confessions: [],
    votes: {},
    guesses: {},
    revealed: false,
    revealIndex: 0,
  };

  private authorMapping: Map<string, string> = new Map(); // confession id -> player id

  /**
   * Initialize game setup
   */
  async setup(players: Player[]): Promise<void> {
    // Select a random prompt
    const promptIndex = Math.floor(Math.random() * CONFESSION_PROMPTS.length);
    // Store prompt in game state (game-specific)
  }

  /**
   * Submit a confession
   */
  submitConfession(playerId: string, text: string): void {
    // Check player hasn't submitted yet
    if (Array.from(this.authorMapping.values()).includes(playerId)) {
      throw new Error('Player already submitted a confession');
    }

    if (text.length === 0 || text.length > 500) {
      throw new Error('Invalid confession length');
    }

    // Remove profanity/content check could go here
    const confessionId = nanoid();
    const confession: Confession = {
      id: confessionId,
      text: text.trim(),
      authorId: playerId, // Server-side only
      votes: 0,
      correctGuesses: [],
    };

    this.gameState.confessions.push(confession);
    this.authorMapping.set(confessionId, playerId);
  }

  /**
   * Submit a vote for best confession
   */
  submitVote(voterId: string, confessionId: string): void {
    if (this.gameState.votes[voterId]) {
      throw new Error('Player has already voted');
    }

    const confession = this.gameState.confessions.find((c) => c.id === confessionId);
    if (!confession) {
      throw new Error('Invalid confession');
    }

    this.gameState.votes[voterId] = confessionId;
    confession.votes++;
  }

  /**
   * Submit a guess for who wrote a confession
   */
  submitGuess(guesser: string, confessionId: string, guessedAuthorId: string): void {
    if (this.gameState.guesses[guesser]) {
      throw new Error('Player has already submitted guesses');
    }

    const confession = this.gameState.confessions.find((c) => c.id === confessionId);
    if (!confession) {
      throw new Error('Invalid confession');
    }

    // Store guess (server-side validation)
    this.gameState.guesses[guesser] = guessedAuthorId;

    // Check if correct
    if (this.authorMapping.get(confessionId) === guessedAuthorId) {
      confession.correctGuesses.push(guesser);
    }
  }

  /**
   * Lock confessions (stop accepting new ones)
   */
  lockConfessions(): void {
    // Shuffle confessions for anonymity
    this.gameState.confessions.sort(() => Math.random() - 0.5);
  }

  /**
   * Start reveal phase
   */
  startReveal(): void {
    this.gameState.revealed = true;
    this.gameState.revealIndex = 0;
  }

  /**
   * Move to next confession in reveal
   */
  nextReveal(): void {
    this.gameState.revealIndex++;
  }

  /**
   * Get current confession being revealed
   */
  getCurrentRevealConfession(): Confession | null {
    if (this.gameState.revealIndex >= this.gameState.confessions.length) {
      return null;
    }
    return this.gameState.confessions[this.gameState.revealIndex];
  }

  /**
   * Get author of a confession (only during reveal or after game ends)
   */
  getConfessionAuthor(confessionId: string): string | null {
    return this.authorMapping.get(confessionId) || null;
  }

  /**
   * Calculate scores
   */
  calculateRoundScores(players: Player[]): Record<string, number> {
    const scores: Record<string, number> = {};

    for (const player of players) {
      scores[player.id] = 0;
    }

    // Points for votes received
    for (const [voterId, confessionId] of Object.entries(this.gameState.votes)) {
      const authorId = this.authorMapping.get(confessionId);
      if (authorId && authorId in scores) {
        scores[authorId] += 50; // Base points for funny confession
      }
    }

    // Bonus for correct guesses
    for (const confession of this.gameState.confessions) {
      for (const guesser of confession.correctGuesses) {
        if (guesser in scores) {
          scores[guesser] += 25; // Points for correct guess
        }
      }
    }

    return scores;
  }

  /**
   * Get public state (safe for clients)
   */
  getPublicState(): Partial<ConfessionGameState> {
    // Return confessions without author info
    const safeConfessions = this.gameState.confessions.map((c) => ({
      ...c,
      authorId: '', // Hide author
    }));

    return {
      confessions: safeConfessions,
      revealed: this.gameState.revealed,
      revealIndex: this.gameState.revealIndex,
    };
  }

  /**
   * Get reveal state (with authors)
   */
  getRevealState(): ConfessionGameState {
    return { ...this.gameState };
  }

  /**
   * Check if ready to vote (all confessions submitted)
   */
  canStartVoting(totalPlayers: number): boolean {
    return this.gameState.confessions.length === totalPlayers;
  }

  /**
   * Check if reveal is complete
   */
  isRevealComplete(): boolean {
    return this.gameState.revealIndex >= this.gameState.confessions.length;
  }
}

/**
 * Export game factory
 */
export const confessionGameFactory = {
  create: () => new ConfessionGame(),
};
