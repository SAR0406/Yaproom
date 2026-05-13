/**
 * Guess Who Said It Game Engine
 * 3-phase: submit → guess → reveal
 * Anonymous answer storage, randomized display order
 */

import type {
  GuessWhoSaidItGameState,
  GWSIPhase,
  Player,
} from '@yapzi/shared';
import {
  GUESS_WHO_SAID_IT_CONFIG,
  GUESS_WHO_SAID_IT_PROMPTS,
} from '@yapzi/shared';

export class GuessWhoSaidItGame {
  private gameState: GuessWhoSaidItGameState = {
    currentPrompt: null,
    phase: 'submit',
    answers: {},
    guesses: {},
    scores: {},
    usedPromptIds: [],
    roundNumber: 0,
    totalRounds: GUESS_WHO_SAID_IT_CONFIG.DEFAULT_ROUNDS,
    revealedAnswerIds: [],
  };

  private players: Player[] = [];

  async setup(players: Player[]): Promise<void> {
    this.players = players;
    this.gameState.roundNumber = 0;
    this.gameState.usedPromptIds = [];
    this.gameState.scores = {};

    // Initialize scores
    for (const p of players) {
      this.gameState.scores[p.id] = 0;
    }

    this.nextRound();
  }

  /**
   * Start a new round
   */
  nextRound(): { prompt: string; phase: GWSIPhase } | null {
    this.gameState.roundNumber++;
    this.gameState.answers = {};
    this.gameState.guesses = {};
    this.gameState.revealedAnswerIds = [];

    if (this.gameState.roundNumber > this.gameState.totalRounds) {
      this.gameState.currentPrompt = null;
      this.gameState.phase = 'reveal';
      return null; // Game over
    }

    const prompt = this.pickPrompt();
    this.gameState.currentPrompt = prompt;
    this.gameState.phase = 'submit';

    return { prompt, phase: 'submit' };
  }

  private pickPrompt(): string {
    const available = GUESS_WHO_SAID_IT_PROMPTS.filter(
      (_, i) => !this.gameState.usedPromptIds.includes(i)
    );

    const pool = available.length > 0 ? available : GUESS_WHO_SAID_IT_PROMPTS;
    if (available.length === 0) {
      this.gameState.usedPromptIds = [];
    }

    const index = Math.floor(Math.random() * pool.length);
    const prompt = pool[index];
    const globalIndex = GUESS_WHO_SAID_IT_PROMPTS.indexOf(prompt);
    this.gameState.usedPromptIds.push(globalIndex);

    return prompt;
  }

  /**
   * Phase 1: Submit an anonymous answer
   */
  submitAnswer(playerId: string, text: string): void {
    if (this.gameState.phase !== 'submit') {
      throw new Error('Not in submit phase');
    }

    if (text.length > 200) {
      throw new Error('Answer too long (max 200 characters)');
    }

    if (this.gameState.answers[playerId]) {
      throw new Error('Already submitted an answer');
    }

    this.gameState.answers[playerId] = text.trim();
  }

  /**
   * Check if all players have submitted answers
   */
  allAnswersSubmitted(): boolean {
    return Object.keys(this.gameState.answers).length >= this.players.length;
  }

  /**
   * Transition to guess phase
   */
  startGuessPhase(): { answers: Array<{ id: string; text: string }>; phase: GWSIPhase } {
    this.gameState.phase = 'guess';

    // Create anonymized, shuffled answer list
    const answerList = Object.entries(this.gameState.answers).map(([playerId, text]) => ({
      id: playerId, // This is the internal ID, NOT sent to clients
      text,
    }));

    // Shuffle for display
    const shuffled = [...answerList].sort(() => Math.random() - 0.5);

    // Return sanitized list (no player IDs)
    return {
      answers: shuffled.map((a, i) => ({ id: `answer-${i}`, text: a.text })),
      phase: 'guess',
    };
  }

  /**
   * Phase 2: Submit guesses for who said each answer
   * guesses: { answerDisplayId -> guessedPlayerId }
   */
  submitGuess(playerId: string, guesses: Record<string, string>): void {
    if (this.gameState.phase !== 'guess') {
      throw new Error('Not in guess phase');
    }

    if (this.gameState.guesses[playerId]) {
      throw new Error('Already submitted guesses');
    }

    this.gameState.guesses[playerId] = guesses;
  }

  /**
   * Check if all players have submitted guesses
   */
  allGuessesSubmitted(): boolean {
    return Object.keys(this.gameState.guesses).length >= this.players.length;
  }

  /**
   * Phase 3: Reveal answers and calculate scores
   */
  reveal(): {
    answers: Array<{ displayId: string; text: string; authorId: string }>;
    scores: Record<string, number>;
  } {
    this.gameState.phase = 'reveal';

    // Build reveal data
    const answerEntries = Object.entries(this.gameState.answers);
    const shuffled = [...answerEntries].sort(() => Math.random() - 0.5);

    const revealedAnswers = shuffled.map(([authorId, text], i) => ({
      displayId: `answer-${i}`,
      text,
      authorId,
    }));

    this.gameState.revealedAnswerIds = revealedAnswers.map((a) => a.displayId);

    // Calculate scores
    // Map display IDs back to author IDs for scoring
    const displayToAuthor: Record<string, string> = {};
    for (const ans of revealedAnswers) {
      displayToAuthor[ans.displayId] = ans.authorId;
    }

    for (const [guesserId, guesses] of Object.entries(this.gameState.guesses)) {
      for (const [displayId, guessedAuthorId] of Object.entries(guesses)) {
        const actualAuthorId = displayToAuthor[displayId];
        if (actualAuthorId && guessedAuthorId === actualAuthorId) {
          // Correct guess
          this.gameState.scores[guesserId] =
            (this.gameState.scores[guesserId] || 0) +
            GUESS_WHO_SAID_IT_CONFIG.POINTS_CORRECT_GUESS;
        } else if (actualAuthorId) {
          // Fooled someone — the actual author gets points
          this.gameState.scores[actualAuthorId] =
            (this.gameState.scores[actualAuthorId] || 0) +
            GUESS_WHO_SAID_IT_CONFIG.POINTS_FOOLED_SOMEONE;
        }
      }
    }

    return {
      answers: revealedAnswers,
      scores: { ...this.gameState.scores },
    };
  }

  getState(): GuessWhoSaidItGameState {
    return { ...this.gameState };
  }

  /**
   * Get sanitized state for a specific player
   * Hides other players' answers during submit phase
   */
  getPlayerState(playerId: string): GuessWhoSaidItGameState {
    const state = { ...this.gameState };

    // During submit phase, only show if this player has submitted
    if (state.phase === 'submit') {
      // Don't reveal other players' answers
      const hasSubmitted = !!state.answers[playerId];
      state.answers = hasSubmitted
        ? { [playerId]: state.answers[playerId] }
        : {};
    }

    // During guess phase, don't reveal answer authors
    if (state.phase === 'guess') {
      // Keep answers but strip author info (already done via display IDs)
    }

    return state;
  }
}