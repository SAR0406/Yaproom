/**
 * Drawing Telephone Game Scene
 * Features: Canvas drawing board, stroke sync, guessing interface, progression
 */

export interface DrawingStroke {
  points: Array<{ x: number; y: number }>;
  color: string;
  width: number;
  timestamp: number;
}

export interface DrawingGameState {
  playerId: string;
  players: Array<{
    id: string;
    nickname: string;
    color: string;
    hasDrawn: boolean;
    hasGuessed: boolean;
  }>;
  phase: 'draw' | 'guess' | 'reveal' | 'recap';
  currentDrawerId: string;
  currentGuesser: string;
  strokes: DrawingStroke[];
  prompt: string;
  guesses: Array<{ playerId: string; guess: string }>;
  correctAnswer: string;
  roundNumber: number;
  totalRounds: number;
  elapsedTime: number;
  totalDuration: number;
}

/**
 * Drawing Game Scene Manager
 * Handles canvas state, stroke management, guessing logic
 */
export class DrawingGameScene {
  private gameState: DrawingGameState | null = null;
  private currentStroke: DrawingStroke | null = null;
  private isDrawingLocked: boolean = false;
  private canvasHistory: DrawingStroke[] = [];

  constructor(private onStateChange: (state: DrawingGameState) => void) {}

  /**
   * Initialize game state from server
   */
  initializeGame(state: DrawingGameState) {
    this.gameState = state;
    this.canvasHistory = [...state.strokes];
    this.onStateChange(state);
  }

  /**
   * Start drawing a new stroke
   */
  startStroke(x: number, y: number, color: string = '#111111', width: number = 4) {
    if (this.isDrawingLocked || this.gameState?.phase !== 'draw') {
      return false;
    }

    this.currentStroke = {
      points: [{ x, y }],
      color,
      width,
      timestamp: Date.now()
    };

    return true;
  }

  /**
   * Add point to current stroke (real-time)
   */
  addStrokePoint(x: number, y: number): boolean {
    if (!this.currentStroke) return false;

    this.currentStroke.points.push({ x, y });
    return true;
  }

  /**
   * End current stroke and add to canvas history
   */
  endStroke(): DrawingStroke | null {
    if (!this.currentStroke || this.currentStroke.points.length < 2) {
      this.currentStroke = null;
      return null;
    }

    const finalStroke = this.currentStroke;
    this.canvasHistory.push(finalStroke);

    if (this.gameState) {
      this.gameState.strokes = this.canvasHistory;
      this.onStateChange(this.gameState);
    }

    this.currentStroke = null;
    return finalStroke;
  }

  /**
   * Clear entire canvas
   */
  clearCanvas() {
    this.canvasHistory = [];
    this.currentStroke = null;

    if (this.gameState) {
      this.gameState.strokes = [];
      this.onStateChange(this.gameState);
    }
  }

  /**
   * Undo last stroke
   */
  undoLastStroke(): boolean {
    if (this.canvasHistory.length === 0) return false;

    this.canvasHistory.pop();

    if (this.gameState) {
      this.gameState.strokes = this.canvasHistory;
      this.onStateChange(this.gameState);
    }

    return true;
  }

  /**
   * Submit guess for the drawing
   */
  submitGuess(guess: string): boolean {
    if (this.gameState?.phase !== 'guess') {
      return false;
    }

    const guesser = this.gameState.players.find((p) => p.id === this.gameState!.playerId);
    if (!guesser || guesser.hasGuessed) {
      return false;
    }

    if (this.gameState.guesses) {
      this.gameState.guesses.push({
        playerId: this.gameState.playerId,
        guess
      });
    }

    guesser.hasGuessed = true;
    this.onStateChange(this.gameState);
    return true;
  }

  /**
   * Lock drawing phase (prevent more strokes)
   */
  lockDrawing() {
    this.isDrawingLocked = true;
  }

  /**
   * Unlock drawing phase
   */
  unlockDrawing() {
    this.isDrawingLocked = false;
  }

  /**
   * Get current game state
   */
  getGameState(): DrawingGameState | null {
    return this.gameState;
  }

  /**
   * Get canvas strokes for rendering
   */
  getCanvasStrokes(): DrawingStroke[] {
    return [...this.canvasHistory, ...(this.currentStroke ? [this.currentStroke] : [])];
  }

  /**
   * Get current drawing artist
   */
  getArtistNickname(): string {
    if (!this.gameState) return 'Unknown';
    const artist = this.gameState.players.find((p) => p.id === this.gameState!.currentDrawerId);
    return artist?.nickname || 'Unknown';
  }

  /**
   * Check if current user is the artist
   */
  isCurrentUserArtist(): boolean {
    return this.gameState?.currentDrawerId === this.gameState?.playerId;
  }

  /**
   * Check if current user is guesser
   */
  isCurrentUserGuesser(): boolean {
    return this.gameState?.currentGuesser === this.gameState?.playerId;
  }

  /**
   * Get progress through drawing/guessing phases
   */
  getPhaseProgress(): number {
    if (!this.gameState) return 0;
    const total = this.gameState.totalDuration;
    const elapsed = this.gameState.elapsedTime;
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  }

  /**
   * Calculate guess accuracy
   */
  evaluateGuess(guess: string): { isCorrect: boolean; similarity: number } {
    if (!this.gameState) return { isCorrect: false, similarity: 0 };

    const correct = this.gameState.correctAnswer.toLowerCase().trim();
    const submitted = guess.toLowerCase().trim();

    const isCorrect = correct === submitted;

    // Calculate similarity (simple Levenshtein-like comparison)
    const similarity = this.calculateStringSimilarity(submitted, correct);

    return { isCorrect, similarity };
  }

  /**
   * Helper: Simple string similarity (0-100%)
   */
  private calculateStringSimilarity(a: string, b: string): number {
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;

    if (longer.length === 0) return 100;

    const editDistance = this.getLevenshteinDistance(longer, shorter);
    return ((longer.length - editDistance) / longer.length) * 100;
  }

  /**
   * Helper: Levenshtein distance
   */
  private getLevenshteinDistance(s1: string, s2: string): number {
    const costs = [];

    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;

      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];

          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }

          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }

      if (i > 0) costs[s2.length] = lastValue;
    }

    return costs[s2.length];
  }
}

/**
 * Drawing Game UI Builder
 */
export function buildDrawingGameUI(scene: DrawingGameScene) {
  const state = scene.getGameState();
  if (!state) return null;

  return {
    phase: state.phase,
    prompt: state.prompt,
    artistName: scene.getArtistNickname(),
    isCurrentUserArtist: scene.isCurrentUserArtist(),
    isCurrentUserGuesser: scene.isCurrentUserGuesser(),
    canvasStrokes: scene.getCanvasStrokes(),
    guesses: state.guesses,
    correctAnswer: state.phase === 'reveal' || state.phase === 'recap' ? state.correctAnswer : null,
    players: state.players,
    roundNumber: state.roundNumber,
    totalRounds: state.totalRounds,
    phaseProgress: scene.getPhaseProgress(),
    timeRemaining: Math.max(0, state.totalDuration - state.elapsedTime)
  };
}
