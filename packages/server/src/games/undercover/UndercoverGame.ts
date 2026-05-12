/**
 * Undercover Game Implementation
 * A social deduction game with hidden roles: Civilians, Undercover, Mr. White
 */

import { nanoid } from 'nanoid';
import type {
  GamePhase,
  UndercoverGameState,
  UndercoverRole,
  Player,
  GameAction,
} from '@yapzi/shared';
import {
  UNDERCOVER_CONFIG,
  UNDERCOVER_WORD_PAIRS,
} from '@yapzi/shared';
import { GameEngine } from '../core/engine/GameEngine.js';

/**
 * Undercover Game Logic
 */
export class UndercoverGame {
  private gameState: UndercoverGameState = {
    wordPair: { civilianWord: '', undercoverWord: '' },
    roles: {},
    descriptions: {},
    eliminatedPlayers: [],
    survivingRoles: {},
    winner: undefined,
  };

  /**
   * Initialize game setup phase
   */
  async setup(players: Player[]): Promise<void> {
    // Select random word pair
    const wordPair =
      UNDERCOVER_WORD_PAIRS[Math.floor(Math.random() * UNDERCOVER_WORD_PAIRS.length)];
    this.gameState.wordPair = wordPair;

    // Assign roles
    const roleAssignments = this.assignRoles(players);
    this.gameState.roles = roleAssignments;
    this.gameState.survivingRoles = { ...roleAssignments };

    // Initialize descriptions map
    for (const player of players) {
      this.gameState.descriptions[player.id] = '';
    }
  }

  /**
   * Assign roles to players
   * Server-only: roles are secret!
   */
  private assignRoles(players: Player[]): Record<string, UndercoverRole> {
    const roles: Record<string, UndercoverRole> = {};
    const shuffled = [...players].sort(() => Math.random() - 0.5);

    // Assign roles based on player count
    let roleIndex = 0;

    // Civilians
    for (let i = 0; i < UNDERCOVER_CONFIG.CIVILIANS && roleIndex < shuffled.length; i++) {
      roles[shuffled[roleIndex++].id] = 'civilian';
    }

    // Undercover
    for (let i = 0; i < UNDERCOVER_CONFIG.UNDERCOVER && roleIndex < shuffled.length; i++) {
      roles[shuffled[roleIndex++].id] = 'undercover';
    }

    // Mr. White
    if (roleIndex < shuffled.length) {
      roles[shuffled[roleIndex].id] = 'mr_white';
    }

    return roles;
  }

  /**
   * Get the word a player should describe
   * Server-side only - never send full data to client
   */
  getPlayerWord(playerId: string): string | null {
    const role = this.gameState.roles[playerId];
    if (!role) return null;

    if (role === 'civilian') return this.gameState.wordPair.civilianWord;
    if (role === 'undercover') return this.gameState.wordPair.undercoverWord;
    return null; // Mr. White gets nothing
  }

  /**
   * Submit a description for the current word
   */
  submitDescription(playerId: string, description: string): void {
    if (description.length > 500) {
      throw new Error('Description too long');
    }

    if (this.gameState.eliminatedPlayers.includes(playerId)) {
      throw new Error('Player has been eliminated');
    }

    this.gameState.descriptions[playerId] = description.trim();
  }

  /**
   * Submit a vote to eliminate a player
   */
  submitVote(voterId: string, targetPlayerId: string): void {
    if (!this.gameState.votes) {
      this.gameState.votes = {};
    }

    // Voter must not be eliminated
    if (this.gameState.eliminatedPlayers.includes(voterId)) {
      throw new Error('Eliminated player cannot vote');
    }

    // Cannot vote for self
    if (voterId === targetPlayerId) {
      throw new Error('Cannot vote for yourself');
    }

    // Target must exist
    if (!(targetPlayerId in this.gameState.roles)) {
      throw new Error('Invalid target');
    }

    this.gameState.votes![voterId] = targetPlayerId;
  }

  /**
   * Calculate votes and eliminate a player
   */
  determineElimination(): string | null {
    if (!this.gameState.votes || Object.keys(this.gameState.votes).length === 0) {
      return null;
    }

    // Count votes
    const voteCount: Record<string, number> = {};
    for (const voted of Object.values(this.gameState.votes)) {
      voteCount[voted] = (voteCount[voted] || 0) + 1;
    }

    // Find player with most votes
    let maxVotes = 0;
    let elimintedPlayer: string | null = null;
    for (const [playerId, votes] of Object.entries(voteCount)) {
      if (votes > maxVotes) {
        maxVotes = votes;
        elimintedPlayer = playerId;
      }
    }

    if (elimintedPlayer) {
      this.gameState.eliminatedPlayers.push(elimintedPlayer);
      delete this.gameState.survivingRoles[elimintedPlayer];

      // Check if eliminated player was Mr. White
      if (this.gameState.roles[elimintedPlayer] === 'mr_white') {
        // Mr. White gets a final guess attempt
        return elimintedPlayer;
      }
    }

    // Clear votes for next round
    this.gameState.votes = {};
    return elimintedPlayer;
  }

  /**
   * Mr. White makes a final guess
   */
  submitFinalGuess(guess: string): void {
    this.gameState.mrWhiteFinalGuess = guess.trim().toLowerCase();
  }

  /**
   * Check if Mr. White's guess is correct
   */
  isMrWhiteGuessCorrect(): boolean {
    if (!this.gameState.mrWhiteFinalGuess) return false;

    // Fuzzy match (client could do typos)
    const guess = this.gameState.mrWhiteFinalGuess.toLowerCase();
    const civilianWord = this.gameState.wordPair.civilianWord.toLowerCase();
    const undercoverWord = this.gameState.wordPair.undercoverWord.toLowerCase();

    return guess === civilianWord || guess === undercoverWord;
  }

  /**
   * Determine game end condition
   */
  checkGameEnd(): 'civilians' | 'undercover' | 'mr_white' | null {
    const activeCivilians = Object.entries(this.gameState.survivingRoles).filter(
      ([_, role]) => role === 'civilian'
    ).length;

    const activeUndercover = Object.entries(this.gameState.survivingRoles).filter(
      ([_, role]) => role === 'undercover'
    ).length;

    const activeMrWhite = Object.entries(this.gameState.survivingRoles).filter(
      ([_, role]) => role === 'mr_white'
    ).length;

    // All undercover and Mr. White eliminated - civilians win
    if (activeUndercover === 0 && activeMrWhite === 0) {
      return 'civilians';
    }

    // Undercover >= Civilians - undercover wins
    if (activeUndercover + activeMrWhite >= activeCivilians) {
      return 'undercover';
    }

    // Mr. White made correct guess
    if (
      activeMrWhite === 0 &&
      this.gameState.eliminatedPlayers.includes(
        Object.entries(this.gameState.roles).find(([_, r]) => r === 'mr_white')?.[0] || ''
      )
    ) {
      if (this.isMrWhiteGuessCorrect()) {
        return 'mr_white';
      }
    }

    return null;
  }

  /**
   * Calculate scores
   */
  calculateRoundScores(players: Player[]): Record<string, number> {
    const scores: Record<string, number> = {};

    const winner = this.checkGameEnd();

    for (const player of players) {
      scores[player.id] = 0;

      const role = this.gameState.roles[player.id];

      if (winner === 'civilians' && role === 'civilian') {
        scores[player.id] = 50; // Base score for civilians winning
      } else if (winner === 'undercover' && (role === 'undercover' || role === 'mr_white')) {
        scores[player.id] = 100; // Undercover/Mr.White win more
      } else if (winner === 'mr_white' && role === 'mr_white') {
        scores[player.id] = 150; // Mr. White guessed correctly - big bonus
      }

      // Bonus for not being eliminated
      if (!this.gameState.eliminatedPlayers.includes(player.id)) {
        scores[player.id] += 20;
      }
    }

    return scores;
  }

  /**
   * Get game state (filtered for clients)
   */
  getPublicState(): Partial<UndercoverGameState> {
    return {
      descriptions: this.gameState.descriptions,
      eliminatedPlayers: this.gameState.eliminatedPlayers,
      // Don't send roles, words, or votes yet
    };
  }

  /**
   * Get secret state for a specific player
   */
  getSecretState(playerId: string): any {
    const role = this.gameState.roles[playerId];
    const word = this.getPlayerWord(playerId);

    return {
      yourRole: role,
      yourWord: word,
      // Mr. White sees nothing
    };
  }

  /**
   * Reveal all information at end
   */
  getRevealState(): UndercoverGameState {
    return this.gameState;
  }
}

/**
 * Export game implementation
 */
export const undercoverGameFactory = {
  create: () => new UndercoverGame(),
};
