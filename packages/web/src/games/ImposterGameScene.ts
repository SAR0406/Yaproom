/**
 * Imposter Social Deduction Game Scene (Phaser-based)
 * Features: Role reveal, voting board, discussion phase, timer, accusation UI
 */

export interface ImposterGameState {
  playerId: string;
  players: Array<{
    id: string;
    nickname: string;
    color: string;
    isHost: boolean;
    isAlive: boolean;
    hasVoted: boolean;
    voteCount: number;
  }>;
  phase: 'role' | 'discussion' | 'vote' | 'reveal' | 'recap';
  myRole: 'imposter' | 'crew' | null;
  commonWord: string;
  imposterWord: string;
  elapsedTime: number;
  totalDuration: number;
  voteLeaders: Array<{ targetId: string; nickname: string; count: number }>;
  discussionMessages: Array<{
    playerId: string;
    nickname: string;
    text: string;
    timestamp: number;
  }>;
}

/**
 * Imposter Game Scene Manager
 * Handles real-time game state, voting logic, role management, and UI rendering
 */
export class ImposterGameScene {
  private gameState: ImposterGameState | null = null;
  private selectedVoteTarget: string | null = null;
  private isVoteLocked: boolean = false;
  private phaseStartTime: number = Date.now();

  constructor(private onStateChange: (state: ImposterGameState) => void) {}

  /**
   * Initialize game state from server payload
   */
  initializeGame(state: ImposterGameState) {
    this.gameState = state;
    this.phaseStartTime = Date.now();
    this.onStateChange(state);
  }

  /**
   * Handle phase transitions with animations
   */
  transitionPhase(newPhase: ImposterGameState['phase']) {
    if (!this.gameState) return;

    const oldPhase = this.gameState.phase;
    this.gameState.phase = newPhase;
    this.isVoteLocked = false;

    // Lock voting during reveal/recap
    if (newPhase === 'reveal' || newPhase === 'recap') {
      this.isVoteLocked = true;
    }

    // Reset vote selection on phase change
    if (oldPhase === 'vote' && newPhase !== 'vote') {
      this.selectedVoteTarget = null;
    }

    this.onStateChange(this.gameState);
  }

  /**
   * Cast vote for target player
   */
  castVote(targetId: string): boolean {
    if (this.isVoteLocked || !this.gameState) return false;

    const voter = this.gameState.players.find((p) => p.id === this.gameState!.playerId);
    if (!voter || voter.hasVoted) return false;

    this.selectedVoteTarget = targetId;

    // Update vote count for target
    const target = this.gameState.players.find((p) => p.id === targetId);
    if (target) {
      target.voteCount += 1;
      target.hasVoted = true; // Mark voter as voted

      // Recalculate vote leaders
      this.gameState.voteLeaders = this.gameState.players
        .filter((p) => p.voteCount > 0)
        .sort((a, b) => b.voteCount - a.voteCount)
        .slice(0, 3)
        .map((p) => ({
          targetId: p.id,
          nickname: p.nickname,
          count: p.voteCount
        }));

      this.onStateChange(this.gameState);
      return true;
    }

    return false;
  }

  /**
   * Get current game state for rendering
   */
  getGameState(): ImposterGameState | null {
    return this.gameState;
  }

  /**
   * Get selected vote target
   */
  getSelectedVoteTarget(): string | null {
    return this.selectedVoteTarget;
  }

  /**
   * Check if voting is locked
   */
  isVotingLocked(): boolean {
    return this.isVoteLocked;
  }

  /**
   * Get role reveal data
   */
  getRoleRevealData(): { myRole: string; myWord: string; isImposter: boolean } {
    if (!this.gameState) {
      return { myRole: 'unknown', myWord: '', isImposter: false };
    }

    return {
      myRole: this.gameState.myRole || 'unknown',
      myWord:
        this.gameState.myRole === 'imposter'
          ? this.gameState.imposterWord
          : this.gameState.commonWord,
      isImposter: this.gameState.myRole === 'imposter'
    };
  }

  /**
   * Calculate time remaining for current phase
   */
  getTimeRemaining(): number {
    return Math.max(0, this.gameState?.totalDuration ?? 0 - this.gameState?.elapsedTime ?? 0);
  }

  /**
   * Get player status (alive, voted, role)
   */
  getPlayerStatus(playerId: string): { isAlive: boolean; hasVoted: boolean; role?: string } {
    const player = this.gameState?.players.find((p) => p.id === playerId);
    if (!player) {
      return { isAlive: false, hasVoted: false };
    }

    return {
      isAlive: player.isAlive,
      hasVoted: player.hasVoted,
      role: playerId === this.gameState?.playerId ? this.gameState?.myRole : undefined
    };
  }

  /**
   * Calculate elimination vote (majority wins)
   */
  calculateElimination(): string | null {
    if (!this.gameState || this.gameState.voteLeaders.length === 0) {
      return null;
    }

    const topVote = this.gameState.voteLeaders[0];
    const totalVotes = this.gameState.players.filter((p) => p.hasVoted).length;

    // Majority rule: more than 50% needed
    if (topVote.count > totalVotes / 2) {
      return topVote.targetId;
    }

    return null;
  }

  /**
   * Reveal imposter role and calculate round outcome
   */
  revealImposter(eliminatedId: string): {
    wasCorrect: boolean;
    imposterNickname: string;
    crewScore: number;
    imposterScore: number;
  } {
    if (!this.gameState) {
      return { wasCorrect: false, imposterNickname: 'Unknown', crewScore: 0, imposterScore: 0 };
    }

    const eliminated = this.gameState.players.find((p) => p.id === eliminatedId);
    const wasImposter = eliminatedId === this.gameState.playerId
      ? this.gameState.myRole === 'imposter'
      : false; // Server would provide this

    return {
      wasCorrect: wasImposter,
      imposterNickname: eliminated?.nickname || 'Unknown',
      crewScore: wasImposter ? 4 : -1,
      imposterScore: wasImposter ? -1 : 4
    };
  }
}

/**
 * Imposter Game Rendering Logic
 * Returns structured data for React component to render
 */
export function buildImposterGameUI(scene: ImposterGameScene) {
  const state = scene.getGameState();
  if (!state) return null;

  const roleData = scene.getRoleRevealData();
  const timeRemaining = scene.getTimeRemaining();
  const progress = Math.max(0, Math.min(100, 100 - (timeRemaining / state.totalDuration) * 100));

  return {
    phase: state.phase,
    timeRemaining,
    progress,
    roleData,
    players: state.players.map((p) => ({
      id: p.id,
      nickname: p.nickname,
      color: p.color,
      isHost: p.isHost,
      isAlive: p.isAlive,
      hasVoted: p.hasVoted,
      voteCount: p.voteCount,
      isSelected: scene.getSelectedVoteTarget() === p.id
    })),
    voteLeaders: state.voteLeaders,
    discussionMessages: state.discussionMessages,
    canVote: !scene.isVotingLocked() && state.phase === 'vote',
    selectedTarget: scene.getSelectedVoteTarget()
  };
}
