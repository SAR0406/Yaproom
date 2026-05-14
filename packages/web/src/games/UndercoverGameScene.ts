/**
 * Undercover Game Scene
 * Features: Secret roles (agent/undercover/civilian), voting elimination, role reveals
 */

export interface UndercoverPlayer {
  id: string;
  nickname: string;
  color: string;
  role: 'agent' | 'undercover' | 'civilian';
  isEliminated: boolean;
  word?: string;
  voteCount: number;
}

export interface UndercoverGameState {
  playerId: string;
  players: UndercoverPlayer[];
  phase: 'role' | 'discussion' | 'vote' | 'reveal' | 'recap';
  commonWord: string;
  undercoverWord: string;
  myRole: 'agent' | 'undercover' | 'civilian' | null;
  myWord: string;
  voteLeaders: Array<{ playerId: string; nickname: string; count: number }>;
  discussionMessages: Array<{ playerId: string; nickname: string; text: string }>;
  eliminated: Array<{
    playerId: string;
    nickname: string;
    role: string;
    round: number;
  }>;
  elapsedTime: number;
  totalDuration: number;
}

/**
 * Undercover Scene Manager
 */
export class UndercoverGameScene {
  private gameState: UndercoverGameState | null = null;
  private selectedVoteTarget: string | null = null;

  constructor(private onStateChange: (state: UndercoverGameState) => void) {}

  initializeGame(state: UndercoverGameState) {
    this.gameState = state;
    this.onStateChange(state);
  }

  getMyRole(): string {
    return this.gameState?.myRole ?? 'unknown';
  }

  getMyWord(): string {
    return this.gameState?.myWord ?? '';
  }

  castVote(targetId: string): boolean {
    if (this.gameState?.phase !== 'vote') {
      return false;
    }

    const target = this.gameState.players.find((p) => p.id === targetId);
    if (!target || target.isEliminated) {
      return false;
    }

    target.voteCount += 1;
    this.selectedVoteTarget = targetId;

    // Recalculate vote leaders
    this.gameState.voteLeaders = this.gameState.players
      .filter((p) => p.voteCount > 0 && !p.isEliminated)
      .sort((a, b) => b.voteCount - a.voteCount)
      .slice(0, 3)
      .map((p) => ({
        playerId: p.id,
        nickname: p.nickname,
        count: p.voteCount
      }));

    this.onStateChange(this.gameState);
    return true;
  }

  calculateElimination(): string | null {
    if (!this.gameState || this.gameState.voteLeaders.length === 0) {
      return null;
    }

    const topVote = this.gameState.voteLeaders[0];
    const votingPlayers = this.gameState.players.filter((p) => !p.isEliminated).length;

    // Majority rule: more than 50%
    if (topVote.count > votingPlayers / 2) {
      return topVote.playerId;
    }

    return null;
  }

  eliminatePlayer(playerId: string): boolean {
    if (!this.gameState) return false;

    const player = this.gameState.players.find((p) => p.id === playerId);
    if (!player) return false;

    player.isEliminated = true;

    this.gameState.eliminated.push({
      playerId: player.id,
      nickname: player.nickname,
      role: player.role,
      round: this.gameState.eliminated.length
    });

    this.onStateChange(this.gameState);
    return true;
  }

  getGameState(): UndercoverGameState | null {
    return this.gameState;
  }

  getAlivePlayersCount(): number {
    if (!this.gameState) return 0;
    return this.gameState.players.filter((p) => !p.isEliminated).length;
  }

  getAlivePlayers(): UndercoverPlayer[] {
    if (!this.gameState) return [];
    return this.gameState.players.filter((p) => !p.isEliminated);
  }

  isGameOver(): boolean {
    if (!this.gameState) return false;

    const alivePlayers = this.getAlivePlayers();
    const undercoverAlive = alivePlayers.filter((p) => p.role === 'undercover');
    const agentAlive = alivePlayers.filter((p) => p.role === 'agent');

    // Game ends if undercover or agent eliminated, or too few left
    return undercoverAlive.length === 0 || agentAlive.length === 0 || alivePlayers.length <= 2;
  }

  determineWinner(): 'agent' | 'undercover' | 'civilian' | null {
    const alivePlayers = this.getAlivePlayers();
    const undercoverAlive = alivePlayers.filter((p) => p.role === 'undercover');
    const agentAlive = alivePlayers.filter((p) => p.role === 'agent');

    if (undercoverAlive.length === 0 && agentAlive.length > 0) return 'agent';
    if (agentAlive.length === 0 && undercoverAlive.length > 0) return 'undercover';

    // If no one is alive (unlikely), civilians win
    return 'civilian';
  }
}

/**
 * Undercover UI Builder
 */
export function buildUndercoverGameUI(scene: UndercoverGameScene) {
  const state = scene.getGameState();
  if (!state) return null;

  return {
    phase: state.phase,
    myRole: scene.getMyRole(),
    myWord: scene.getMyWord(),
    players: state.players,
    alivePlayers: scene.getAlivePlayers(),
    eliminated: state.eliminated,
    voteLeaders: state.voteLeaders,
    isGameOver: scene.isGameOver(),
    winner: state.phase === 'recap' ? scene.determineWinner() : null,
    discussionMessages: state.discussionMessages
  };
}
