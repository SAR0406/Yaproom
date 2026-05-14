/**
 * Never Have I Ever Game Scene
 * Features: Prompt statements, Yes/No voting, player elimination
 */

export interface Statement {
  id: string;
  text: string;
  responses: Map<string, boolean>; // playerId -> hasDonet
}

export interface NeverHaveIEverGameState {
  playerId: string;
  players: Array<{
    id: string;
    nickname: string;
    color: string;
    isEliminated: boolean;
    eliminatedAt?: number;
  }>;
  phase: 'prompt' | 'vote' | 'reveal' | 'recap';
  statements: Statement[];
  currentStatementIndex: number;
  totalStatements: number;
  hasVoted: boolean;
  eliminations: Array<{ playerId: string; statementId: string; round: number }>;
  elapsedTime: number;
  totalDuration: number;
}

/**
 * Never Have I Ever Scene Manager
 */
export class NeverHaveIEverGameScene {
  private gameState: NeverHaveIEverGameState | null = null;

  constructor(private onStateChange: (state: NeverHaveIEverGameState) => void) {}

  initializeGame(state: NeverHaveIEverGameState) {
    this.gameState = state;
    this.onStateChange(state);
  }

  getCurrentStatement(): Statement | null {
    if (!this.gameState) return null;
    return this.gameState.statements[this.gameState.currentStatementIndex] ?? null;
  }

  submitResponse(hasExperienced: boolean): boolean {
    if (this.gameState?.phase !== 'vote' || this.gameState.hasVoted) {
      return false;
    }

    const statement = this.getCurrentStatement();
    if (!statement) return false;

    statement.responses.set(this.gameState.playerId, hasExperienced);

    if (!hasExperienced) {
      // Player gets eliminated if they haven't done the thing
      const player = this.gameState.players.find((p) => p.id === this.gameState!.playerId);
      if (player) {
        player.isEliminated = true;
        player.eliminatedAt = Date.now();
        this.gameState.eliminations.push({
          playerId: this.gameState.playerId,
          statementId: statement.id,
          round: this.gameState.currentStatementIndex
        });
      }
    }

    this.gameState.hasVoted = true;
    this.onStateChange(this.gameState);
    return true;
  }

  getSurvivingPlayers(): number {
    if (!this.gameState) return 0;
    return this.gameState.players.filter((p) => !p.isEliminated).length;
  }

  getVoteDistribution(): { yes: number; no: number } {
    const statement = this.getCurrentStatement();
    if (!statement) return { yes: 0, no: 0 };

    let yes = 0;
    let no = 0;

    statement.responses.forEach((hasExperienced) => {
      if (hasExperienced) yes++;
      else no++;
    });

    return { yes, no };
  }

  getGameState(): NeverHaveIEverGameState | null {
    return this.gameState;
  }

  getProgress(): { current: number; total: number } {
    return {
      current: (this.gameState?.currentStatementIndex ?? 0) + 1,
      total: this.gameState?.totalStatements ?? 0
    };
  }
}

/**
 * Never Have I Ever UI Builder
 */
export function buildNeverHaveIEverGameUI(scene: NeverHaveIEverGameScene) {
  const state = scene.getGameState();
  if (!state) return null;

  return {
    phase: state.phase,
    currentStatement: scene.getCurrentStatement(),
    progress: scene.getProgress(),
    survivors: scene.getSurvivingPlayers(),
    voteDistribution: scene.getVoteDistribution(),
    players: state.players,
    eliminations: state.eliminations
  };
}
