/**
 * Guess Who Said It Game Scene
 * Features: Quote matching, player guessing, voting accuracy scoring
 */

export interface Quote {
  id: string;
  text: string;
  authorId: string;
  authorNickname: string;
  guesses: Array<{ playerId: string; guess: string; isCorrect: boolean }>;
  revealedAt?: number;
}

export interface GuessWhoGameState {
  playerId: string;
  players: Array<{
    id: string;
    nickname: string;
    color: string;
    score: number;
  }>;
  phase: 'collect' | 'guess' | 'reveal' | 'recap';
  quotes: Quote[];
  currentQuoteIndex: number;
  totalQuotes: number;
  hasGuessed: boolean;
  elapsedTime: number;
  totalDuration: number;
}

/**
 * Guess Who Said It Scene Manager
 */
export class GuessWhoSaidItGameScene {
  private gameState: GuessWhoGameState | null = null;
  private myGuess: string | null = null;

  constructor(private onStateChange: (state: GuessWhoGameState) => void) {}

  initializeGame(state: GuessWhoGameState) {
    this.gameState = state;
    this.myGuess = null;
    this.onStateChange(state);
  }

  getCurrentQuote(): Quote | null {
    if (!this.gameState) return null;
    return this.gameState.quotes[this.gameState.currentQuoteIndex] ?? null;
  }

  submitGuess(playerNickname: string): boolean {
    if (this.gameState?.phase !== 'guess' || this.gameState.hasGuessed) {
      return false;
    }

    const quote = this.getCurrentQuote();
    if (!quote) return false;

    const isCorrect = playerNickname === quote.authorNickname;
    this.myGuess = playerNickname;

    quote.guesses.push({
      playerId: this.gameState.playerId,
      guess: playerNickname,
      isCorrect
    });

    const player = this.gameState.players.find((p) => p.id === this.gameState!.playerId);
    if (player && isCorrect) {
      player.score += 5;
    }

    this.gameState.hasGuessed = true;
    this.onStateChange(this.gameState);
    return true;
  }

  getQuoteProgress(): { current: number; total: number } {
    return {
      current: (this.gameState?.currentQuoteIndex ?? 0) + 1,
      total: this.gameState?.totalQuotes ?? 0
    };
  }

  calculateAccuracy(): number {
    if (!this.gameState || this.gameState.quotes.length === 0) return 0;

    const correctGuesses = this.gameState.quotes
      .flatMap((q) => q.guesses)
      .filter((g) => g.isCorrect).length;

    return Math.round((correctGuesses / this.gameState.quotes.length) * 100);
  }

  getGameState(): GuessWhoGameState | null {
    return this.gameState;
  }

  getTimeRemaining(): number {
    return Math.max(0, (this.gameState?.totalDuration ?? 0) - (this.gameState?.elapsedTime ?? 0));
  }
}

/**
 * Guess Who Said It UI Builder
 */
export function buildGuessWhoGameUI(scene: GuessWhoSaidItGameScene) {
  const state = scene.getGameState();
  if (!state) return null;

  return {
    phase: state.phase,
    currentQuote: scene.getCurrentQuote(),
    progress: scene.getQuoteProgress(),
    accuracy: state.phase === 'recap' ? scene.calculateAccuracy() : null,
    players: state.players,
    timeRemaining: scene.getTimeRemaining()
  };
}
