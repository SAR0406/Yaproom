/**
 * Never Have I Ever Game Engine
 * 5-finger system, animated finger lowering, themed decks
 */

import type {
  NeverHaveIEverGameState,
  Player,
} from '@yapzi/shared';
import {
  NEVER_HAVE_I_EVER_CONFIG,
  NEVER_HAVE_I_EVER_PROMPTS,
} from '@yapzi/shared';

export type NHIESpiceLevel = keyof typeof NEVER_HAVE_I_EVER_PROMPTS;

export class NeverHaveIEverGame {
  private gameState: NeverHaveIEverGameState = {
    currentPrompt: null,
    currentPlayerId: null,
    playerFingers: {},
    eliminatedPlayers: [],
    usedPromptIds: [],
    customPrompts: [],
    playerOrder: [],
    turnIndex: 0,
    roundNumber: 0,
    winner: null,
  };

  private players: Player[] = [];
  private spiceLevel: NHIESpiceLevel = 'friendship';

  async setup(players: Player[]): Promise<void> {
    this.players = players;
    this.gameState.playerOrder = players.map((p) => p.id);
    this.gameState.turnIndex = 0;
    this.gameState.roundNumber = 0;
    this.gameState.usedPromptIds = [];
    this.gameState.eliminatedPlayers = [];
    this.gameState.winner = null;

    // Initialize fingers
    this.gameState.playerFingers = {};
    for (const p of players) {
      this.gameState.playerFingers[p.id] = NEVER_HAVE_I_EVER_CONFIG.STARTING_FINGERS;
    }
  }

  setSpiceLevel(level: NHIESpiceLevel): void {
    this.spiceLevel = level;
  }

  /**
   * Start a new turn: pick next player and prompt
   */
  startTurn(): { playerId: string; prompt: string } | null {
    // Get non-eliminated players
    const active = this.players.filter(
      (p) => !this.gameState.eliminatedPlayers.includes(p.id)
    );

    if (active.length <= 1) {
      this.gameState.winner = active[0]?.id || null;
      return null;
    }

    // Pick next player in rotation
    const playerIndex = this.gameState.turnIndex % active.length;
    const player = active[playerIndex];
    this.gameState.currentPlayerId = player.id;

    // Pick a prompt
    const prompt = this.pickPrompt();
    this.gameState.currentPrompt = prompt;
    this.gameState.roundNumber++;

    return { playerId: player.id, prompt };
  }

  private pickPrompt(): string {
    const deck = NEVER_HAVE_I_EVER_PROMPTS[this.spiceLevel];
    const available = deck.filter(
      (_, i) => !this.gameState.usedPromptIds.includes(`${this.spiceLevel}-${i}`)
    );

    const pool = available.length > 0 ? available : deck;
    if (available.length === 0) {
      this.gameState.usedPromptIds = this.gameState.usedPromptIds.filter(
        (id) => !id.startsWith(this.spiceLevel)
      );
    }

    const index = Math.floor(Math.random() * pool.length);
    const text = pool[index];
    const promptIndex = deck.indexOf(text);
    this.gameState.usedPromptIds.push(`${this.spiceLevel}-${promptIndex}`);

    return text;
  }

  /**
   * Player puts a finger down
   */
  fingerDown(playerId: string): { playerId: string; fingers: number; eliminated: boolean } {
    if (this.gameState.eliminatedPlayers.includes(playerId)) {
      throw new Error('Player is already eliminated');
    }

    const currentFingers = this.gameState.playerFingers[playerId] ?? 0;
    const newFingers = Math.max(0, currentFingers - 1);
    this.gameState.playerFingers[playerId] = newFingers;

    const eliminated = newFingers === 0;
    if (eliminated) {
      this.gameState.eliminatedPlayers.push(playerId);
    }

    return { playerId, fingers: newFingers, eliminated };
  }

  /**
   * Advance to next turn
   */
  advanceTurn(): void {
    this.gameState.turnIndex++;
    this.gameState.currentPlayerId = null;
    this.gameState.currentPrompt = null;
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

  getState(): NeverHaveIEverGameState {
    return { ...this.gameState };
  }

  getPlayerState(_playerId: string): NeverHaveIEverGameState {
    return this.getState();
  }
}