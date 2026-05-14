/**
 * Truth or Dare Game Scene
 * Features: Challenge prompt display, response submission, peer ratings, scoring
 */

export interface Challenge {
  id: string;
  type: 'truth' | 'dare';
  prompt: string;
  assignedPlayerId: string;
  response?: string;
  responseSubmittedAt?: number;
  ratings: Array<{ playerId: string; score: number }>; // 1-5 scale
  averageRating: number;
}

export interface TruthOrDareGameState {
  playerId: string;
  players: Array<{
    id: string;
    nickname: string;
    color: string;
    score: number;
    completedChallenges: number;
  }>;
  phase: 'challenge' | 'respond' | 'rate' | 'recap';
  challenges: Challenge[];
  currentChallenge: Challenge | null;
  currentChallengeIndex: number;
  totalChallenges: number;
  hasResponded: boolean;
  hasRated: boolean;
  elapsedTime: number;
  totalDuration: number;
}

/**
 * Truth or Dare Game Scene Manager
 * Handles challenge assignment, response submission, peer ratings
 */
export class TruthOrDareGameScene {
  private gameState: TruthOrDareGameState | null = null;
  private currentResponse: string = '';
  private hasRatedChallenges = new Set<string>();

  constructor(private onStateChange: (state: TruthOrDareGameState) => void) {}

  /**
   * Initialize game state from server
   */
  initializeGame(state: TruthOrDareGameState) {
    this.gameState = state;
    this.currentResponse = '';
    this.hasRatedChallenges.clear();

    this.onStateChange(state);
  }

  /**
   * Get current challenge
   */
  getCurrentChallenge(): Challenge | null {
    return this.gameState?.currentChallenge ?? null;
  }

  /**
   * Get challenge target (who must respond)
   */
  getChallengeTarget(): { name: string; isMe: boolean } {
    if (!this.gameState?.currentChallenge) {
      return { name: 'Unknown', isMe: false };
    }

    const target = this.gameState.players.find(
      (p) => p.id === this.gameState!.currentChallenge!.assignedPlayerId
    );
    const isMe = this.gameState.currentChallenge.assignedPlayerId === this.gameState.playerId;

    return {
      name: target?.nickname ?? 'Unknown',
      isMe
    };
  }

  /**
   * Check if current user is the respondent
   */
  isCurrentUserRespondent(): boolean {
    return (
      this.gameState?.currentChallenge?.assignedPlayerId === this.gameState?.playerId
    );
  }

  /**
   * Submit response to current challenge
   */
  submitResponse(response: string): boolean {
    if (this.gameState?.phase !== 'respond' || this.gameState.hasResponded) {
      return false;
    }

    if (!this.isCurrentUserRespondent()) {
      return false;
    }

    if (!this.gameState.currentChallenge) {
      return false;
    }

    // Clean and validate response
    const cleanResponse = response.trim();
    if (cleanResponse.length === 0) {
      return false;
    }

    // Update challenge with response
    this.gameState.currentChallenge.response = cleanResponse;
    this.gameState.currentChallenge.responseSubmittedAt = Date.now();
    this.gameState.hasResponded = true;

    this.onStateChange(this.gameState);
    return true;
  }

  /**
   * Rate challenge response (1-5 scale)
   */
  rateChallenge(challengeId: string, rating: number): boolean {
    if (
      this.gameState?.phase !== 'rate' ||
      rating < 1 ||
      rating > 5 ||
      this.hasRatedChallenges.has(challengeId)
    ) {
      return false;
    }

    const challenge = this.gameState.challenges.find((c) => c.id === challengeId);
    if (!challenge || !challenge.response) {
      return false;
    }

    // Can't rate own response
    if (challenge.assignedPlayerId === this.gameState.playerId) {
      return false;
    }

    // Add rating
    challenge.ratings.push({
      playerId: this.gameState.playerId,
      score: rating
    });

    // Recalculate average
    challenge.averageRating =
      challenge.ratings.reduce((sum, r) => sum + r.score, 0) / challenge.ratings.length;

    this.hasRatedChallenges.add(challengeId);

    this.onStateChange(this.gameState);
    return true;
  }

  /**
   * Get rating summary for a challenge
   */
  getChallengeRatings(challengeId: string): {
    averageRating: number;
    ratingCount: number;
    breakdown: Record<number, number>;
  } {
    const challenge = this.gameState?.challenges.find((c) => c.id === challengeId);
    if (!challenge) {
      return { averageRating: 0, ratingCount: 0, breakdown: {} };
    }

    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    challenge.ratings.forEach((r) => {
      breakdown[r.score] = (breakdown[r.score] || 0) + 1;
    });

    return {
      averageRating: challenge.averageRating,
      ratingCount: challenge.ratings.length,
      breakdown
    };
  }

  /**
   * Get all challenges for rating (those that have responses)
   */
  getChallengesForRating(): Challenge[] {
    if (!this.gameState) return [];

    return this.gameState.challenges.filter(
      (c) =>
        c.response && // Must have response
        c.assignedPlayerId !== this.gameState!.playerId && // Can't rate own
        !this.hasRatedChallenges.has(c.id) // Haven't rated yet
    );
  }

  /**
   * Get challenge progress
   */
  getChallengeProgress(): {
    current: number;
    total: number;
    percentage: number;
  } {
    if (!this.gameState) {
      return { current: 0, total: 0, percentage: 0 };
    }

    const current = this.gameState.currentChallengeIndex + 1;
    const total = this.gameState.totalChallenges;
    const percentage = Math.round((current / total) * 100);

    return { current, total, percentage };
  }

  /**
   * Calculate scores based on response ratings
   */
  calculateFinalScores(): Array<{ nickname: string; score: number; completedCount: number }> {
    if (!this.gameState) return [];

    const scoreMap = new Map<string, { score: number; count: number }>();

    // Initialize all players
    this.gameState.players.forEach((p) => {
      scoreMap.set(p.id, { score: 0, count: 0 });
    });

    // Award points based on ratings received
    this.gameState.challenges.forEach((challenge) => {
      if (challenge.response && challenge.averageRating > 0) {
        const authorScore = scoreMap.get(challenge.assignedPlayerId);
        if (authorScore) {
          // Points = average rating * number of raters
          authorScore.score += challenge.averageRating * challenge.ratings.length;
        }
      }
    });

    // Build final scores
    return Array.from(scoreMap.entries())
      .map(([playerId, data]) => {
        const player = this.gameState!.players.find((p) => p.id === playerId);
        return {
          nickname: player?.nickname ?? 'Unknown',
          score: Math.round(data.score),
          completedCount: data.count
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Get game state
   */
  getGameState(): TruthOrDareGameState | null {
    return this.gameState;
  }

  /**
   * Get phase progress
   */
  getPhaseProgress(): number {
    if (!this.gameState) return 0;
    const total = this.gameState.totalDuration;
    const elapsed = this.gameState.elapsedTime;
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  }

  /**
   * Check if all challenges completed
   */
  allChallengesCompleted(): boolean {
    if (!this.gameState) return false;

    return this.gameState.challenges.every((c) => c.response);
  }

  /**
   * Get time remaining
   */
  getTimeRemaining(): number {
    return Math.max(0, (this.gameState?.totalDuration ?? 0) - (this.gameState?.elapsedTime ?? 0));
  }
}

/**
 * Truth or Dare UI Builder
 */
export function buildTruthOrDareGameUI(scene: TruthOrDareGameScene) {
  const state = scene.getGameState();
  if (!state) return null;

  const challenge = scene.getCurrentChallenge();
  const target = scene.getChallengeTarget();
  const progress = scene.getChallengeProgress();

  return {
    phase: state.phase,
    currentChallenge: challenge,
    challengeType: challenge?.type ?? 'truth',
    challengePrompt: challenge?.prompt ?? '',
    targetName: target.name,
    isCurrentUserTarget: target.isMe,
    response: challenge?.response ?? null,
    ratings: challenge ? scene.getChallengeRatings(challenge.id) : null,
    challengesForRating: scene.getChallengesForRating(),
    progress,
    allCompleted: scene.allChallengesCompleted(),
    finalScores: state.phase === 'recap' ? scene.calculateFinalScores() : [],
    players: state.players,
    phaseProgress: scene.getPhaseProgress(),
    timeRemaining: scene.getTimeRemaining()
  };
}
