/**
 * Who's Most Likely To Game Engine
 * Simultaneous voting, bar chart results, screenshot-friendly
 */

import type {
  WhosMostLikelyGameState,
  Player,
} from '@yapzi/shared';
import {
  WHOS_MOST_LIKELY_CONFIG,
  WHOS_MOST_LIKELY_PROMPTS,
} from '@yapzi/shared';

export class WhosMostLikelyGame {
  private gameState: WhosMostLikelyGameState = {
    currentPrompt: null,
    votes: {},
    voteCounts: {},
    usedPromptIds: [],
    customPrompts: [],
    roundNumber: 0,
    totalRounds: WHOS_MOST_LIKELY_CONFIG.DEFAULT_ROUNDS,
    revealed: false,
  };

  private players: Player[] = [];

  async setup(players: Player[]): Promise<void> {
    this.players = players;
    this.gameState.roundNumber = 0;
    this.gameState.usedPromptIds = [];
    this.gameState.votes = {};
    this.gameState.voteCounts = {};
    this.gameState.revealed = false;
    this.nextRound();
  }

  /**
   * Advance to next round with a new prompt
   */
  nextRound(): string | null {
    this.gameState.roundNumber++;
    this.gameState.votes = {};
    this.gameState.voteCounts = {};
    this.gameState.revealed = false;

    // Initialize vote counts for all players
    for (const p of this.players) {
      this.gameState.voteCounts[p.id] = 0;
    }

    if (this.gameState.roundNumber > this.gameState.totalRounds) {
      this.gameState.currentPrompt = null;
      return null; // Game over
    }

    const prompt = this.pickPrompt();
    this.gameState.currentPrompt = prompt;
    return prompt;
  }

  private pickPrompt(): string {
    const available = WHOS_MOST_LIKELY_PROMPTS.filter(
      (_, i) => !this.gameState.usedPromptIds.includes(i)
    );

    const pool = available.length > 0 ? available : WHOS_MOST_LIKELY_PROMPTS;
    if (available.length === 0) {
      this.gameState.usedPromptIds = [];
    }

    const index = Math.floor(Math.random() * pool.length);
    const prompt = pool[index];
    const globalIndex = WHOS_MOST_LIKELY_PROMPTS.indexOf(prompt);
    this.gameState.usedPromptIds.push(globalIndex);

    return prompt;
  }

  /**
   * Vote for who is most likely
   */
  vote(voterId: string, targetPlayerId: string): void {
    if (this.gameState.revealed) {
      throw new Error('Voting is closed for this round');
    }

    if (!this.players.find((p) => p.id === targetPlayerId)) {
      throw new Error('Invalid target player');
    }

    // Allow changing vote
    const previousVote = this.gameState.votes[voterId];
    if (previousVote && this.gameState.voteCounts[previousVote] !== undefined) {
      this.gameState.voteCounts[previousVote] = Math.max(
        0,
        (this.gameState.voteCounts[previousVote] || 1) - 1
      );
    }

    this.gameState.votes[voterId] = targetPlayerId;
    this.gameState.voteCounts[targetPlayerId] =
      (this.gameState.voteCounts[targetPlayerId] || 0) + 1;
  }

  /**
   * Reveal results for the current round
   */
  reveal(): { voteCounts: Record<string, number>; prompt: string } {
    this.gameState.revealed = true;
    return {
      voteCounts: { ...this.gameState.voteCounts },
      prompt: this.gameState.currentPrompt!,
    };
  }

  addCustomPrompt(playerId: string, text: string): void {
    if (text.length > 200) {
      throw new Error('Prompt too long (max 200 characters)');
    }

    this.gameState.customPrompts.push({
      id: `custom-${Date.now()}`,
      text: text.trim(),
      authorId: playerId,
    });
  }

  allVoted(): boolean {
    return Object.keys(this.gameState.votes).length >= this.players.length;
  }

  getState(): WhosMostLikelyGameState {
    return { ...this.gameState };
  }

  getPlayerState(_playerId: string): WhosMostLikelyGameState {
    return this.getState();
  }
}