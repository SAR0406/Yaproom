/**
 * Quiplash Game Implementation
 * A funny answer battle game where players vote for the funniest responses
 */

import { nanoid } from 'nanoid';
import type {
  QuiplashGameState,
  QuiplashPrompt,
  Matchup,
  Player,
} from '@yapzi/shared';
import { QUIPLASH_PROMPTS, QUIPLASH_CONFIG } from '@yapzi/shared';

/**
 * Quiplash Game Logic
 */
export class QuiplashGame {
  private gameState: QuiplashGameState = {
    prompts: [],
    currentPromptIndex: 0,
    answers: {},
    votes: {},
    matchups: [],
    activePlayers: [],
    audiencePlayers: [],
    rotation: 0,
  };

  /**
   * Initialize game setup
   */
  async setup(players: Player[]): Promise<void> {
    // Select random prompts
    const prompts: QuiplashPrompt[] = [];
    const selectedIndices = new Set<number>();

    // Get 5 prompts minimum
    while (prompts.length < Math.max(5, players.length)) {
      const idx = Math.floor(Math.random() * QUIPLASH_PROMPTS.length);
      if (!selectedIndices.has(idx)) {
        selectedIndices.add(idx);
        prompts.push({
          id: nanoid(),
          text: QUIPLASH_PROMPTS[idx],
          difficulty: Math.random() > 0.7 ? 'hard' : Math.random() > 0.5 ? 'medium' : 'easy',
        });
      }
    }

    this.gameState.prompts = prompts;

    // Split players: most are active, some are audience
    const totalPlayers = players.length;
    const maxActive = Math.min(totalPlayers, 8); // Max 8 active
    const shuffled = [...players].sort(() => Math.random() - 0.5);

    this.gameState.activePlayers = shuffled.slice(0, maxActive).map((p) => p.id);
    this.gameState.audiencePlayers = shuffled.slice(maxActive).map((p) => p.id);
  }

  /**
   * Submit an answer for the current prompt
   */
  submitAnswer(playerId: string, answer: string): void {
    if (!this.gameState.activePlayers.includes(playerId)) {
      throw new Error('Player is not active');
    }

    if (answer.length > 200) {
      throw new Error('Answer too long');
    }

    this.gameState.answers[playerId] = answer.trim();
  }

  /**
   * Get answers for voting
   */
  getAnswersForVoting(): Array<{ playerId: string; text: string }> {
    const answers = Object.entries(this.gameState.answers).map(([playerId, text]) => ({
      playerId,
      text: text as string,
    }));

    // Shuffle for anonymity
    return answers.sort(() => Math.random() - 0.5);
  }

  /**
   * Submit a vote for best answer
   */
  submitVote(voterId: string, answerId: string): void {
    if (this.gameState.votes[voterId]) {
      throw new Error('Player has already voted');
    }

    if (!(answerId in this.gameState.answers)) {
      throw new Error('Invalid answer');
    }

    // Cannot vote for own answer
    if (voterId === answerId) {
      throw new Error('Cannot vote for yourself');
    }

    this.gameState.votes[voterId] = answerId;
  }

  /**
   * Calculate round winner
   */
  calculateRoundWinner(): string | null {
    const voteCount: Record<string, number> = {};

    for (const votedFor of Object.values(this.gameState.votes)) {
      voteCount[votedFor] = (voteCount[votedFor] || 0) + 1;
    }

    if (Object.keys(voteCount).length === 0) return null;

    return Object.entries(voteCount).sort(([_, a], [__, b]) => b - a)[0][0];
  }

  /**
   * Rotate players between active and audience
   */
  rotatePlayerRotation(): void {
    if (this.gameState.activePlayers.length === 0) return;

    this.gameState.rotation++;

    // Move one active to audience, one audience to active
    if (this.gameState.audiencePlayers.length > 0) {
      const activePlayer = this.gameState.activePlayers.shift();
      const audiencePlayer = this.gameState.audiencePlayers.shift();

      if (activePlayer && audiencePlayer) {
        this.gameState.activePlayers.push(audiencePlayer);
        this.gameState.audiencePlayers.push(activePlayer);
      }
    }
  }

  /**
   * Move to next prompt
   */
  nextPrompt(): void {
    this.gameState.currentPromptIndex++;
    this.gameState.answers = {};
    this.gameState.votes = {};
  }

  /**
   * Check if game should end
   */
  shouldEnd(): boolean {
    return this.gameState.currentPromptIndex >= this.gameState.prompts.length;
  }

  /**
   * Get current prompt
   */
  getCurrentPrompt(): QuiplashPrompt | null {
    if (this.gameState.currentPromptIndex >= this.gameState.prompts.length) {
      return null;
    }
    return this.gameState.prompts[this.gameState.currentPromptIndex];
  }

  /**
   * Calculate scores
   */
  calculateRoundScores(players: Player[]): Record<string, number> {
    const scores: Record<string, number> = {};

    // Initialize
    for (const player of players) {
      scores[player.id] = 0;
    }

    // Points for votes received
    const voteCount: Record<string, number> = {};
    for (const votedFor of Object.values(this.gameState.votes)) {
      voteCount[votedFor] = (voteCount[votedFor] || 0) + 1;
    }

    for (const [playerId, votes] of Object.entries(voteCount)) {
      scores[playerId] = (scores[playerId] || 0) + votes * QUIPLASH_CONFIG.POINTS_FOR_WIN;
    }

    // Bonus for audience appeal
    for (const audiencePlayerId of this.gameState.audiencePlayers) {
      if (this.gameState.votes[audiencePlayerId]) {
        scores[this.gameState.votes[audiencePlayerId]] =
          (scores[this.gameState.votes[audiencePlayerId]] || 0) +
          QUIPLASH_CONFIG.POINTS_FOR_AUDIENCE;
      }
    }

    return scores;
  }

  /**
   * Get public state
   */
  getPublicState(): Partial<QuiplashGameState> {
    return {
      currentPromptIndex: this.gameState.currentPromptIndex,
      activePlayers: this.gameState.activePlayers,
      audiencePlayers: this.gameState.audiencePlayers,
      // Don't send answers/votes until reveal
    };
  }

  /**
   * Get reveal state
   */
  getRevealState(): Partial<QuiplashGameState> {
    return {
      answers: this.gameState.answers,
      votes: this.gameState.votes,
      currentPromptIndex: this.gameState.currentPromptIndex,
    };
  }
}

/**
 * Export game factory
 */
export const quiplashGameFactory = {
  create: () => new QuiplashGame(),
};
