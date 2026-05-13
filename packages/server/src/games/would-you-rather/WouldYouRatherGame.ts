/**
 * Would You Rather Game Engine
 * Simultaneous-reveal voting, live progress bar, Hot Takes Mode
 */

import type {
  WouldYouRatherGameState,
  Player,
} from '@yapzi/shared';
import {
  WOULD_YOU_RATHER_CONFIG,
  WOULD_YOU_RATHER_PROMPTS,
} from '@yapzi/shared';

export class WouldYouRatherGame {
  private gameState: WouldYouRatherGameState = {
    currentPrompt: null,
    votes: {},
    voteCounts: { A: 0, B: 0 },
    usedPromptIds: [],
    customPrompts: [],
    roundNumber: 0,
    totalRounds: WOULD_YOU_RATHER_CONFIG.DEFAULT_ROUNDS,
    revealed: false,
  };

  private players: Player[] = [];

  async setup(players: Player[]): Promise<void> {
    this.players = players;
    this.gameState.roundNumber = 0;
    this.gameState.usedPromptIds = [];
    this.gameState.votes = {};
    this.gameState.voteCounts = { A: 0, B: 0 };
    this.gameState.revealed = false;
    this.nextRound();
  }

  /**
   * Advance to next round with a new prompt
   */
  nextRound(): { optionA: string; optionB: string } | null {
    this.gameState.roundNumber++;
    this.gameState.votes = {};
    this.gameState.voteCounts = { A: 0, B: 0 };
    this.gameState.revealed = false;

    if (this.gameState.roundNumber > this.gameState.totalRounds) {
      this.gameState.currentPrompt = null;
      return null; // Game over
    }

    const prompt = this.pickPrompt();
    this.gameState.currentPrompt = prompt;
    return prompt;
  }

  private pickPrompt(): { optionA: string; optionB: string } {
    const available = WOULD_YOU_RATHER_PROMPTS.filter(
      (_, i) => !this.gameState.usedPromptIds.includes(i)
    );

    const pool = available.length > 0 ? available : WOULD_YOU_RATHER_PROMPTS;
    if (available.length === 0) {
      this.gameState.usedPromptIds = [];
    }

    const index = Math.floor(Math.random() * pool.length);
    const prompt = pool[index];
    const globalIndex = WOULD_YOU_RATHER_PROMPTS.indexOf(prompt);
    this.gameState.usedPromptIds.push(globalIndex);

    return prompt;
  }

  /**
   * Submit a vote for option A or B
   */
  vote(playerId: string, choice: 'A' | 'B'): void {
    if (this.gameState.revealed) {
      throw new Error('Voting is closed for this round');
    }

    // Allow changing vote
    const previousVote = this.gameState.votes[playerId];
    if (previousVote) {
      this.gameState.voteCounts[previousVote]--;
    }

    this.gameState.votes[playerId] = choice;
    this.gameState.voteCounts[choice]++;
  }

  /**
   * Reveal the results for the current round
   */
  reveal(): { votes: Record<string, string>; voteCounts: { A: number; B: number } } {
    this.gameState.revealed = true;
    return {
      votes: { ...this.gameState.votes },
      voteCounts: { ...this.gameState.voteCounts },
    };
  }

  /**
   * Add a custom prompt
   */
  addCustomPrompt(playerId: string, optionA: string, optionB: string): void {
    if (optionA.length > 150 || optionB.length > 150) {
      throw new Error('Options too long (max 150 characters each)');
    }

    this.gameState.customPrompts.push({
      id: `custom-${Date.now()}`,
      optionA: optionA.trim(),
      optionB: optionB.trim(),
      authorId: playerId,
    });
  }

  /**
   * Check if all players have voted
   */
  allVoted(): boolean {
    return Object.keys(this.gameState.votes).length >= this.players.length;
  }

  getState(): WouldYouRatherGameState {
    return { ...this.gameState };
  }

  getPlayerState(_playerId: string): WouldYouRatherGameState {
    return this.getState();
  }
}