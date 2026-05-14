/**
 * Confession Card Game Scene
 * Features: Anonymous confession submission, card reveal animations, voting/rating, scoring
 */

export interface ConfessionCard {
  id: string;
  confession: string;
  authorId?: string; // Only revealed at end
  authorNickname?: string;
  revealsAt?: number; // Timestamp for reveal animation
  reactions: Array<{ playerId: string; emoji: string }>;
  votes: number; // For best confession
}

export interface ConfessionGameState {
  playerId: string;
  players: Array<{
    id: string;
    nickname: string;
    color: string;
    hasSubmitted: boolean;
    confessionScore: number;
  }>;
  phase: 'submit' | 'reveal' | 'vote' | 'recap';
  cards: ConfessionCard[];
  currentRevealingCardId: string | null;
  selectedVoteCardId: string | null;
  hasVoted: boolean;
  elapsedTime: number;
  totalDuration: number;
}

/**
 * Confession Game Scene Manager
 * Handles card state, submissions, reveal animations, voting logic
 */
export class ConfessionGameScene {
  private gameState: ConfessionGameState | null = null;
  private revealQueue: string[] = [];
  private isRevealAnimating: boolean = false;
  private selectedVoteCard: string | null = null;

  constructor(private onStateChange: (state: ConfessionGameState) => void) {}

  /**
   * Initialize game state from server
   */
  initializeGame(state: ConfessionGameState) {
    this.gameState = state;

    // Build reveal queue (random order)
    this.revealQueue = state.cards.map((c) => c.id).sort(() => Math.random() - 0.5);

    this.onStateChange(state);
  }

  /**
   * Submit confession (anonymous)
   */
  submitConfession(confession: string): boolean {
    if (this.gameState?.phase !== 'submit') {
      return false;
    }

    const player = this.gameState.players.find((p) => p.id === this.gameState!.playerId);
    if (!player || player.hasSubmitted) {
      return false;
    }

    // Create anonymous card
    const newCard: ConfessionCard = {
      id: `confession-${Date.now()}-${Math.random()}`,
      confession,
      reactions: [],
      votes: 0
    };

    this.gameState.cards.push(newCard);
    player.hasSubmitted = true;

    // Add to reveal queue
    this.revealQueue.push(newCard.id);

    this.onStateChange(this.gameState);
    return true;
  }

  /**
   * Trigger next card reveal with animation
   */
  revealNextCard(): { cardId: string; delay: number } | null {
    if (this.revealQueue.length === 0 || this.isRevealAnimating) {
      return null;
    }

    const cardId = this.revealQueue.shift();
    if (!cardId || !this.gameState) return null;

    this.gameState.currentRevealingCardId = cardId;
    this.isRevealAnimating = true;

    // Find card and set reveal timestamp for animation
    const card = this.gameState.cards.find((c) => c.id === cardId);
    if (card) {
      card.revealsAt = Date.now() + 300; // Stagger animation start
    }

    this.onStateChange(this.gameState);

    return {
      cardId,
      delay: 300 // ms delay for animation
    };
  }

  /**
   * Complete card reveal animation
   */
  completeCardReveal() {
    this.isRevealAnimating = false;
  }

  /**
   * Add reaction/emoji to confession card
   */
  addReaction(cardId: string, emoji: string): boolean {
    if (!this.gameState) return false;

    const card = this.gameState.cards.find((c) => c.id === cardId);
    if (!card) return false;

    // Check if player already reacted
    const existing = card.reactions.find((r) => r.playerId === this.gameState!.playerId);
    if (existing) {
      existing.emoji = emoji; // Update reaction
    } else {
      card.reactions.push({
        playerId: this.gameState.playerId,
        emoji
      });
    }

    this.onStateChange(this.gameState);
    return true;
  }

  /**
   * Vote for best confession
   */
  voteForCard(cardId: string): boolean {
    if (this.gameState?.phase !== 'vote' || this.gameState.hasVoted) {
      return false;
    }

    const card = this.gameState.cards.find((c) => c.id === cardId);
    if (!card) return false;

    card.votes += 1;
    this.gameState.hasVoted = true;
    this.selectedVoteCard = cardId;

    this.onStateChange(this.gameState);
    return true;
  }

  /**
   * Get game state
   */
  getGameState(): ConfessionGameState | null {
    return this.gameState;
  }

  /**
   * Get all cards (visible in current phase)
   */
  getVisibleCards(): ConfessionCard[] {
    if (!this.gameState) return [];

    if (this.gameState.phase === 'submit') {
      return []; // No cards visible during submission
    }

    if (this.gameState.phase === 'reveal') {
      // Show revealed cards
      return this.gameState.cards.filter(
        (c) =>
          c.revealsAt !== undefined && Date.now() > (c.revealsAt || 0)
      );
    }

    return this.gameState.cards; // Show all in vote/recap
  }

  /**
   * Get cards ranked by votes
   */
  getRankedCards(): ConfessionCard[] {
    if (!this.gameState) return [];

    return [...this.gameState.cards].sort((a, b) => b.votes - a.votes);
  }

  /**
   * Get top confession winner
   */
  getWinningCard(): ConfessionCard | null {
    const ranked = this.getRankedCards();
    return ranked.length > 0 ? ranked[0] : null;
  }

  /**
   * Calculate scores based on confession votes
   */
  calculateScores(): Array<{ playerId: string; nickname: string; score: number }> {
    if (!this.gameState) return [];

    const scoreMap = new Map<string, number>();

    // Initialize all players with 0 score
    this.gameState.players.forEach((p) => {
      scoreMap.set(p.id, 0);
    });

    // Award points for confession votes (if author is known)
    this.gameState.cards.forEach((card) => {
      if (card.authorId && scoreMap.has(card.authorId)) {
        const currentScore = scoreMap.get(card.authorId) || 0;
        scoreMap.set(card.authorId, currentScore + card.votes);
      }
    });

    return Array.from(scoreMap.entries())
      .map(([playerId, score]) => ({
        playerId,
        nickname:
          this.gameState!.players.find((p) => p.id === playerId)?.nickname || 'Unknown',
        score
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
   * Check if current user can react
   */
  canReact(): boolean {
    return (
      this.gameState?.phase !== 'submit' &&
      this.gameState?.phase !== 'recap'
    );
  }

  /**
   * Check if current user can vote
   */
  canVote(): boolean {
    return this.gameState?.phase === 'vote' && !this.gameState.hasVoted;
  }

  /**
   * Get total submission count
   */
  getSubmissionCount(): number {
    return this.gameState?.cards.length || 0;
  }
}

/**
 * Confession Game UI Builder
 */
export function buildConfessionGameUI(scene: ConfessionGameScene) {
  const state = scene.getGameState();
  if (!state) return null;

  return {
    phase: state.phase,
    visibleCards: scene.getVisibleCards(),
    rankedCards: state.phase === 'recap' ? scene.getRankedCards() : [],
    winningCard: state.phase === 'recap' ? scene.getWinningCard() : null,
    scores: state.phase === 'recap' ? scene.calculateScores() : [],
    players: state.players,
    submissionCount: scene.getSubmissionCount(),
    canReact: scene.canReact(),
    canVote: scene.canVote(),
    currentPlayerVoted: state.hasVoted,
    phaseProgress: scene.getPhaseProgress(),
    timeRemaining: Math.max(0, state.totalDuration - state.elapsedTime)
  };
}
