/**
 * Codenames Game Implementation
 * A team-based word deduction game with spymasters
 */

import { nanoid } from 'nanoid';
import type {
  CodenamesGameState,
  Player,
  KeyCard,
  CodeNamesGuess,
} from '@yapzi/shared';
import { CODENAMES_WORDS, CODENAMES_CONFIG } from '@yapzi/shared';

/**
 * Codenames Game Logic
 */
export class CodenamesGame {
  private gameState: CodenamesGameState = {
    words: [],
    keyCard: { assignments: [] },
    team1: {
      name: 'Team Red',
      spymaster: '',
      operatives: [],
      revealedCards: [],
      score: 0,
    },
    team2: {
      name: 'Team Blue',
      spymaster: '',
      operatives: [],
      revealedCards: [],
      score: 0,
    },
    currentTeam: 'team1',
    guesses: [],
    assassinHit: false,
    winner: undefined,
  };

  /**
   * Initialize game setup
   */
  async setup(players: Player[]): Promise<void> {
    // Select 25 random words
    const selectedWords: string[] = [];
    const selectedIndices = new Set<number>();

    while (selectedWords.length < CODENAMES_CONFIG.GRID_SIZE * CODENAMES_CONFIG.GRID_SIZE) {
      const idx = Math.floor(Math.random() * CODENAMES_WORDS.length);
      if (!selectedIndices.has(idx)) {
        selectedIndices.add(idx);
        selectedWords.push(CODENAMES_WORDS[idx]);
      }
    }

    this.gameState.words = selectedWords;

    // Generate key card
    this.gameState.keyCard = this.generateKeyCard();

    // Assign teams
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const half = Math.floor(shuffled.length / 2);

    // Team 1 (Red)
    this.gameState.team1.spymaster = shuffled[0].id;
    this.gameState.team1.operatives = shuffled.slice(1, half).map((p) => p.id);

    // Team 2 (Blue)
    this.gameState.team2.spymaster = shuffled[half].id;
    this.gameState.team2.operatives = shuffled.slice(half + 1).map((p) => p.id);
  }

  /**
   * Generate a random key card
   */
  private generateKeyCard(): KeyCard {
    const total = CODENAMES_CONFIG.GRID_SIZE * CODENAMES_CONFIG.GRID_SIZE;
    const assignments: Array<'red' | 'blue' | 'bystander' | 'assassin'> = [];

    // Add red agents
    for (let i = 0; i < CODENAMES_CONFIG.RED_AGENTS; i++) {
      assignments.push('red');
    }

    // Add blue agents
    for (let i = 0; i < CODENAMES_CONFIG.BLUE_AGENTS; i++) {
      assignments.push('blue');
    }

    // Add bystanders
    for (let i = 0; i < CODENAMES_CONFIG.BYSTANDERS; i++) {
      assignments.push('bystander');
    }

    // Add assassin
    assignments.push('assassin');

    // Shuffle
    for (let i = assignments.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [assignments[i], assignments[j]] = [assignments[j], assignments[i]];
    }

    return { assignments };
  }

  /**
   * Submit a clue
   */
  submitClue(spymasterId: string, clueWord: string, clueNumber: number): void {
    const team = this.isSpymasterForTeam(spymasterId);
    if (!team) {
      throw new Error('Only spymasters can submit clues');
    }

    if (clueWord.length === 0 || clueWord.length > 20) {
      throw new Error('Invalid clue');
    }

    if (clueNumber < 1 || clueNumber > 9) {
      throw new Error('Clue number must be 1-9');
    }

    this.gameState.clue = {
      word: clueWord,
      number: clueNumber,
      submittedBy: spymasterId,
      timestamp: Date.now(),
    };

    // Reset guesses for this turn
    this.gameState.guesses = [];
  }

  /**
   * Submit a guess
   */
  submitGuess(guesser: string, wordIndex: number): void {
    if (wordIndex < 0 || wordIndex >= this.gameState.words.length) {
      throw new Error('Invalid word index');
    }

    // Check if card already revealed
    if (
      this.gameState.team1.revealedCards.includes(wordIndex) ||
      this.gameState.team2.revealedCards.includes(wordIndex)
    ) {
      throw new Error('Card already revealed');
    }

    const guess: CodeNamesGuess = {
      guessedBy: guesser,
      wordIndex: wordIndex,
      timestamp: Date.now(),
    };

    this.gameState.guesses.push(guess);

    // Process guess
    this.processGuess(wordIndex);
  }

  /**
   * Process a single guess
   */
  private processGuess(wordIndex: number): void {
    const card = this.gameState.keyCard.assignments[wordIndex];
    const team = this.gameState.currentTeam;

    if (card === 'assassin') {
      // Instant loss
      this.gameState.assassinHit = true;
      this.gameState.winner = team === 'team1' ? 'team2' : 'team1';
      return;
    }

    if (card === 'red') {
      this.gameState.team1.revealedCards.push(wordIndex);
      this.gameState.team1.score++;

      // Wrong team guessed
      if (team === 'team2') {
        this.endTurn();
      }
    } else if (card === 'blue') {
      this.gameState.team2.revealedCards.push(wordIndex);
      this.gameState.team2.score++;

      // Wrong team guessed
      if (team === 'team1') {
        this.endTurn();
      }
    } else if (card === 'bystander') {
      this.endTurn();
    }

    // Check win conditions
    if (this.gameState.team1.score === CODENAMES_CONFIG.RED_AGENTS) {
      this.gameState.winner = 'team1';
    } else if (this.gameState.team2.score === CODENAMES_CONFIG.BLUE_AGENTS) {
      this.gameState.winner = 'team2';
    }
  }

  /**
   * End the current turn
   */
  endTurn(): void {
    this.gameState.currentTeam = this.gameState.currentTeam === 'team1' ? 'team2' : 'team1';
  }

  /**
   * Check if player is a spymaster
   */
  private isSpymasterForTeam(playerId: string): 'team1' | 'team2' | null {
    if (this.gameState.team1.spymaster === playerId) return 'team1';
    if (this.gameState.team2.spymaster === playerId) return 'team2';
    return null;
  }

  /**
   * Get the key card (server-only, only shown to spymasters)
   */
  getKeyCardForSpymaster(spymasterId: string): KeyCard | null {
    if (this.isSpymasterForTeam(spymasterId)) {
      return this.gameState.keyCard;
    }
    return null;
  }

  /**
   * Calculate scores
   */
  calculateRoundScores(players: Player[]): Record<string, number> {
    const scores: Record<string, number> = {};

    for (const player of players) {
      scores[player.id] = 0;
    }

    // Determine winner
    if (this.gameState.winner === 'team1') {
      for (const playerId of [
        this.gameState.team1.spymaster,
        ...this.gameState.team1.operatives,
      ]) {
        scores[playerId] = 100;
      }
    } else if (this.gameState.winner === 'team2') {
      for (const playerId of [
        this.gameState.team2.spymaster,
        ...this.gameState.team2.operatives,
      ]) {
        scores[playerId] = 100;
      }
    }

    return scores;
  }

  /**
   * Get public state
   */
  getPublicState(): Partial<CodenamesGameState> {
    return {
      words: this.gameState.words,
      team1: {
        ...this.gameState.team1,
        spymaster: this.gameState.team1.spymaster,
        operatives: this.gameState.team1.operatives,
      },
      team2: {
        ...this.gameState.team2,
        spymaster: this.gameState.team2.spymaster,
        operatives: this.gameState.team2.operatives,
      },
      currentTeam: this.gameState.currentTeam,
      clue: this.gameState.clue,
      guesses: this.gameState.guesses,
      assassinHit: this.gameState.assassinHit,
      winner: this.gameState.winner,
    };
  }

  /**
   * Get current game state
   */
  getCurrentState(): CodenamesGameState {
    return { ...this.gameState };
  }
}

/**
 * Export game factory
 */
export const codenamesGameFactory = {
  create: () => new CodenamesGame(),
};
