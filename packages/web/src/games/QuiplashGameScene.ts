/**
 * Quiplash Game Scene
 * Features: Prompt-based answer submission, votable display, scoring by votes
 */

export interface Quip {
  id: string;
  prompt: string;
  authorId: string;
  authorNickname: string;
  answer: string;
  votes: number;
  votedBy: string[];
}

export interface QuiplashGameState {
  playerId: string;
  players: Array<{
    id: string;
    nickname: string;
    color: string;
    score: number;
  }>;
  phase: 'submit' | 'display' | 'vote' | 'recap';
  quips: Quip[];
  currentQuipIndex: number;
  totalQuips: number;
  hasSubmitted: boolean;
  hasVoted: boolean;
  elapsedTime: number;
  totalDuration: number;
}

/**
 * Quiplash Scene Manager
 */
export class QuiplashGameScene {
  private gameState: QuiplashGameState | null = null;

  constructor(private onStateChange: (state: QuiplashGameState) => void) {}

  initializeGame(state: QuiplashGameState) {
    this.gameState = state;
    this.onStateChange(state);
  }

  submitAnswer(prompt: string, answer: string): boolean {
    if (this.gameState?.phase !== 'submit' || this.gameState.hasSubmitted) {
      return false;
    }

    const newQuip: Quip = {
      id: `quip-${Date.now()}-${Math.random()}`,
      prompt,
      authorId: this.gameState.playerId,
      authorNickname:
        this.gameState.players.find((p) => p.id === this.gameState!.playerId)?.nickname ??
        'Unknown',
      answer,
      votes: 0,
      votedBy: []
    };

    this.gameState.quips.push(newQuip);
    this.gameState.hasSubmitted = true;

    this.onStateChange(this.gameState);
    return true;
  }

  voteForQuip(quipId: string): boolean {
    if (this.gameState?.phase !== 'vote' || this.gameState.hasVoted) {
      return false;
    }

    const quip = this.gameState.quips.find((q) => q.id === quipId);
    if (!quip || quip.votedBy.includes(this.gameState.playerId)) {
      return false;
    }

    quip.votes += 1;
    quip.votedBy.push(this.gameState.playerId);
    this.gameState.hasVoted = true;

    // Award points to quip author
    const author = this.gameState.players.find((p) => p.id === quip.authorId);
    if (author) {
      author.score += 10; // 10 points per vote
    }

    this.onStateChange(this.gameState);
    return true;
  }

  getCurrentQuip(): Quip | null {
    if (!this.gameState) return null;
    return this.gameState.quips[this.gameState.currentQuipIndex] ?? null;
  }

  getGameState(): QuiplashGameState | null {
    return this.gameState;
  }

  getRankedQuips(): Quip[] {
    if (!this.gameState) return [];
    return [...this.gameState.quips].sort((a, b) => b.votes - a.votes);
  }

  getProgress(): { current: number; total: number } {
    return {
      current: (this.gameState?.currentQuipIndex ?? 0) + 1,
      total: this.gameState?.totalQuips ?? 0
    };
  }
}

/**
 * Quiplash UI Builder
 */
export function buildQuiplashGameUI(scene: QuiplashGameScene) {
  const state = scene.getGameState();
  if (!state) return null;

  return {
    phase: state.phase,
    currentQuip: scene.getCurrentQuip(),
    rankedQuips: state.phase === 'recap' ? scene.getRankedQuips() : [],
    progress: scene.getProgress(),
    players: state.players
  };
}
