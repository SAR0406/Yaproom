/**
 * Split or Steal Prisoner's Dilemma Game Scene
 * Features: Decision phase, locked choices, simultaneous reveal, scoring
 */

export interface SplitOrStealPair {
  players: [string, string]; // Two player IDs in the pair
  decisions: Map<string, 'split' | 'steal' | null>;
  revealed: boolean;
  outcomes: Map<
    string,
    {
      decision: 'split' | 'steal';
      earnedScore: number;
      reason: string;
    }
  >;
}

export interface SplitOrStealGameState {
  playerId: string;
  players: Array<{
    id: string;
    nickname: string;
    color: string;
    score: number;
    currentPairId?: string;
    hasDecided: boolean;
  }>;
  phase: 'pairing' | 'decision' | 'reveal' | 'recap';
  pairs: SplitOrStealPair[];
  currentPair: SplitOrStealPair | null;
  myCurrentDecision: 'split' | 'steal' | null;
  isDecisionLocked: boolean;
  elapsedTime: number;
  totalDuration: number;
  pot: number; // Money/points in current pot
  roundNumber: number;
  totalRounds: number;
}

/**
 * Split or Steal Game Scene Manager
 * Handles decision logic, reveal timing, pairing, and scoring
 */
export class SplitOrStealGameScene {
  private gameState: SplitOrStealGameState | null = null;
  private myDecision: 'split' | 'steal' | null = null;
  private isLocked: boolean = false;
  private revealDelay: number = 1500; // ms to show decision reveal animation

  constructor(private onStateChange: (state: SplitOrStealGameState) => void) {}

  /**
   * Initialize game state from server
   */
  initializeGame(state: SplitOrStealGameState) {
    this.gameState = state;
    this.myDecision = null;
    this.isLocked = false;

    this.onStateChange(state);
  }

  /**
   * Make decision: Split or Steal
   */
  makeDecision(decision: 'split' | 'steal'): boolean {
    if (this.isLocked || this.gameState?.phase !== 'decision') {
      return false;
    }

    this.myDecision = decision;

    if (this.gameState) {
      this.gameState.myCurrentDecision = decision;
      const player = this.gameState.players.find((p) => p.id === this.gameState!.playerId);
      if (player) {
        player.hasDecided = true;
      }
      this.onStateChange(this.gameState);
    }

    return true;
  }

  /**
   * Lock decision (no more changes allowed)
   */
  lockDecision(): boolean {
    if (!this.myDecision) return false;

    this.isLocked = true;

    if (this.gameState) {
      this.gameState.isDecisionLocked = true;
      this.onStateChange(this.gameState);
    }

    return true;
  }

  /**
   * Check if both players have decided (ready to reveal)
   */
  bothPlayersReady(): boolean {
    if (!this.gameState?.currentPair) return false;

    const [player1Id, player2Id] = this.gameState.currentPair.players;
    const p1 = this.gameState.players.find((p) => p.id === player1Id);
    const p2 = this.gameState.players.find((p) => p.id === player2Id);

    return (p1?.hasDecided ?? false) && (p2?.hasDecided ?? false);
  }

  /**
   * Reveal decisions and calculate outcomes
   */
  revealAndScore(): { outcomes: Map<string, number>; explanation: string } {
    if (!this.gameState?.currentPair) {
      return { outcomes: new Map(), explanation: 'No active pair' };
    }

    const [player1Id, player2Id] = this.gameState.currentPair.players;
    const p1 = this.gameState.players.find((p) => p.id === player1Id);
    const p2 = this.gameState.players.find((p) => p.id === player2Id);

    if (!p1 || !p2) {
      return { outcomes: new Map(), explanation: 'Missing players' };
    }

    const p1Decision = this.gameState.myCurrentDecision === null ? 'split' : this.gameState.myCurrentDecision; // Placeholder
    const p2Decision = 'split'; // Would come from server

    const outcomes = new Map<string, number>();
    let explanation = '';

    // Payoff matrix
    if (p1Decision === 'split' && p2Decision === 'split') {
      // Both split: equal split
      outcomes.set(player1Id, this.gameState.pot / 2);
      outcomes.set(player2Id, this.gameState.pot / 2);
      explanation = `${p1?.nickname} and ${p2?.nickname} both split the pot!`;
    } else if (p1Decision === 'steal' && p2Decision === 'split') {
      // P1 steals: P1 takes all
      outcomes.set(player1Id, this.gameState.pot);
      outcomes.set(player2Id, 0);
      explanation = `${p1?.nickname} stole the pot! ${p2?.nickname} got nothing.`;
    } else if (p1Decision === 'split' && p2Decision === 'steal') {
      // P2 steals: P2 takes all
      outcomes.set(player1Id, 0);
      outcomes.set(player2Id, this.gameState.pot);
      explanation = `${p2?.nickname} stole the pot! ${p1?.nickname} got nothing.`;
    } else {
      // Both steal: nobody gets anything
      outcomes.set(player1Id, 0);
      outcomes.set(player2Id, 0);
      explanation = 'Both players stole! Nobody gets anything.';
    }

    // Update player scores
    outcomes.forEach((score, playerId) => {
      const player = this.gameState!.players.find((p) => p.id === playerId);
      if (player) {
        player.score += score;
      }
    });

    this.gameState.currentPair.revealed = true;

    if (this.gameState) {
      this.onStateChange(this.gameState);
    }

    return { outcomes, explanation };
  }

  /**
   * Get current pair opponent nickname
   */
  getOpponentNickname(): string {
    if (!this.gameState?.currentPair) return 'Unknown';

    const [player1Id, player2Id] = this.gameState.currentPair.players;
    const opponentId = player1Id === this.gameState.playerId ? player2Id : player1Id;
    const opponent = this.gameState.players.find((p) => p.id === opponentId);

    return opponent?.nickname || 'Unknown';
  }

  /**
   * Get current decision status
   */
  getDecisionStatus(): {
    myDecision: string | null;
    bothReady: boolean;
    isLocked: boolean;
  } {
    return {
      myDecision: this.myDecision,
      bothReady: this.bothPlayersReady(),
      isLocked: this.isLocked
    };
  }

  /**
   * Get game state
   */
  getGameState(): SplitOrStealGameState | null {
    return this.gameState;
  }

  /**
   * Get current player score
   */
  getPlayerScore(): number {
    if (!this.gameState) return 0;

    const player = this.gameState.players.find((p) => p.id === this.gameState!.playerId);
    return player?.score ?? 0;
  }

  /**
   * Get all player scores sorted
   */
  getAllPlayerScores(): Array<{ nickname: string; score: number }> {
    if (!this.gameState) return [];

    return this.gameState.players
      .map((p) => ({
        nickname: p.nickname,
        score: p.score
      }))
      .sort((a, b) => b.score - a.score);
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
   * Get round info
   */
  getRoundInfo(): { current: number; total: number; progress: string } {
    if (!this.gameState) {
      return { current: 0, total: 0, progress: '0/0' };
    }

    return {
      current: this.gameState.roundNumber,
      total: this.gameState.totalRounds,
      progress: `${this.gameState.roundNumber}/${this.gameState.totalRounds}`
    };
  }

  /**
   * Get pot amount
   */
  getPot(): number {
    return this.gameState?.pot ?? 0;
  }

  /**
   * Get reveal delay for animation timing
   */
  getRevealDelay(): number {
    return this.revealDelay;
  }
}

/**
 * Split or Steal UI Builder
 */
export function buildSplitOrStealGameUI(scene: SplitOrStealGameScene) {
  const state = scene.getGameState();
  if (!state) return null;

  const decisionStatus = scene.getDecisionStatus();

  return {
    phase: state.phase,
    pot: scene.getPot(),
    opponentName: scene.getOpponentNickname(),
    myDecision: decisionStatus.myDecision,
    bothReady: decisionStatus.bothReady,
    isLocked: decisionStatus.isLocked,
    scores: scene.getAllPlayerScores(),
    myScore: scene.getPlayerScore(),
    roundInfo: scene.getRoundInfo(),
    phaseProgress: scene.getPhaseProgress(),
    timeRemaining: Math.max(0, state.totalDuration - state.elapsedTime),
    players: state.players
  };
}
