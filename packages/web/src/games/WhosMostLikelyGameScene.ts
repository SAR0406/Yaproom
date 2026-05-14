/**
 * Who's Most Likely Game Scene
 * Features: Photo/player matching, trait voting, consensus scoring
 */

export interface LikelyliestQuestion {
  id: string;
  question: string;
  votes: Map<string, string>; // playerId -> playerIdGuess
  correctAnswerId?: string;
}

export interface WhosMostLikelyGameState {
  playerId: string;
  players: Array<{
    id: string;
    nickname: string;
    color: string;
    photo?: string;
    score: number;
  }>;
  phase: 'question' | 'vote' | 'reveal' | 'recap';
  questions: LikelyliestQuestion[];
  currentQuestionIndex: number;
  totalQuestions: number;
  hasVoted: boolean;
  elapsedTime: number;
  totalDuration: number;
}

/**
 * Who's Most Likely Scene Manager
 */
export class WhosMostLikelyGameScene {
  private gameState: WhosMostLikelyGameState | null = null;

  constructor(private onStateChange: (state: WhosMostLikelyGameState) => void) {}

  initializeGame(state: WhosMostLikelyGameState) {
    this.gameState = state;
    this.onStateChange(state);
  }

  getCurrentQuestion(): LikelyliestQuestion | null {
    if (!this.gameState) return null;
    return this.gameState.questions[this.gameState.currentQuestionIndex] ?? null;
  }

  submitVote(playerNickname: string): boolean {
    if (this.gameState?.phase !== 'vote' || this.gameState.hasVoted) {
      return false;
    }

    const question = this.getCurrentQuestion();
    if (!question) return false;

    const targetPlayer = this.gameState.players.find(
      (p) => p.nickname === playerNickname
    );
    if (!targetPlayer) return false;

    question.votes.set(this.gameState.playerId, targetPlayer.id);
    this.gameState.hasVoted = true;

    this.onStateChange(this.gameState);
    return true;
  }

  getVoteDistribution(): Map<string, number> {
    const question = this.getCurrentQuestion();
    if (!question) return new Map();

    const distribution = new Map<string, number>();

    question.votes.forEach((playerId) => {
      distribution.set(playerId, (distribution.get(playerId) ?? 0) + 1);
    });

    return distribution;
  }

  getConsensusResult(): {
    playerId: string | null;
    nickname: string | null;
    percentage: number;
  } {
    const distribution = this.getVoteDistribution();
    if (distribution.size === 0) {
      return { playerId: null, nickname: null, percentage: 0 };
    }

    let maxVotes = 0;
    let winner: string | null = null;

    distribution.forEach((votes, playerId) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        winner = playerId;
      }
    });

    if (!winner || !this.gameState) {
      return { playerId: null, nickname: null, percentage: 0 };
    }

    const totalVotes = this.gameState.players.filter((p) => !p.id.startsWith('bot')).length;
    const percentage = Math.round((maxVotes / totalVotes) * 100);

    const winnerPlayer = this.gameState.players.find((p) => p.id === winner);

    return {
      playerId: winner,
      nickname: winnerPlayer?.nickname ?? null,
      percentage
    };
  }

  calculateCorrectness(actualPlayerId: string): number {
    const distribution = this.getVoteDistribution();
    const votesForCorrectPlayer = distribution.get(actualPlayerId) ?? 0;
    const totalVotes = Array.from(distribution.values()).reduce((a, b) => a + b, 0);

    return totalVotes > 0 ? Math.round((votesForCorrectPlayer / totalVotes) * 100) : 0;
  }

  awardPoints(): number {
    const question = this.getCurrentQuestion();
    if (!question || !question.correctAnswerId) return 0;

    const consensus = this.getConsensusResult();
    const correctness = this.calculateCorrectness(question.correctAnswerId);

    // Points based on accuracy and consensus
    if (consensus.playerId === question.correctAnswerId) {
      return Math.round((consensus.percentage / 100) * 20); // Up to 20 points
    }

    return Math.round((correctness / 100) * 5); // Partial credit
  }

  getGameState(): WhosMostLikelyGameState | null {
    return this.gameState;
  }

  getProgress(): { current: number; total: number } {
    return {
      current: (this.gameState?.currentQuestionIndex ?? 0) + 1,
      total: this.gameState?.totalQuestions ?? 0
    };
  }
}

/**
 * Who's Most Likely UI Builder
 */
export function buildWhosMostLikelyGameUI(scene: WhosMostLikelyGameScene) {
  const state = scene.getGameState();
  if (!state) return null;

  const question = scene.getCurrentQuestion();

  return {
    phase: state.phase,
    currentQuestion: question?.question ?? '',
    players: state.players,
    voteDistribution: scene.getVoteDistribution(),
    consensus: scene.getConsensusResult(),
    progress: scene.getProgress()
  };
}
