/**
 * Would You Rather Game Scene
 * Features: A vs B choice voting, poll visualization, discussion
 */

export interface Choice {
  id: string;
  optionA: string;
  optionB: string;
  votes: Map<string, 'a' | 'b'>;
}

export interface WouldYouRatherGameState {
  playerId: string;
  players: Array<{
    id: string;
    nickname: string;
    color: string;
    score: number;
  }>;
  phase: 'vote' | 'poll' | 'discuss' | 'recap';
  choices: Choice[];
  currentChoiceIndex: number;
  totalChoices: number;
  hasVoted: boolean;
  elapsedTime: number;
  totalDuration: number;
}

/**
 * Would You Rather Scene Manager
 */
export class WouldYouRatherGameScene {
  private gameState: WouldYouRatherGameState | null = null;
  private myVote: 'a' | 'b' | null = null;

  constructor(private onStateChange: (state: WouldYouRatherGameState) => void) {}

  initializeGame(state: WouldYouRatherGameState) {
    this.gameState = state;
    this.myVote = null;
    this.onStateChange(state);
  }

  getCurrentChoice(): Choice | null {
    if (!this.gameState) return null;
    return this.gameState.choices[this.gameState.currentChoiceIndex] ?? null;
  }

  submitVote(choice: 'a' | 'b'): boolean {
    if (this.gameState?.phase !== 'vote' || this.gameState.hasVoted) {
      return false;
    }

    const currentChoice = this.getCurrentChoice();
    if (!currentChoice) return false;

    currentChoice.votes.set(this.gameState.playerId, choice);
    this.myVote = choice;
    this.gameState.hasVoted = true;

    this.onStateChange(this.gameState);
    return true;
  }

  getPollResults(): { percentA: number; percentB: number; countA: number; countB: number } {
    const choice = this.getCurrentChoice();
    if (!choice) return { percentA: 0, percentB: 0, countA: 0, countB: 0 };

    const countA = Array.from(choice.votes.values()).filter((v) => v === 'a').length;
    const countB = Array.from(choice.votes.values()).filter((v) => v === 'b').length;
    const total = countA + countB;

    return {
      percentA: total > 0 ? Math.round((countA / total) * 100) : 0,
      percentB: total > 0 ? Math.round((countB / total) * 100) : 0,
      countA,
      countB
    };
  }

  getGameState(): WouldYouRatherGameState | null {
    return this.gameState;
  }

  getProgress(): { current: number; total: number } {
    return {
      current: (this.gameState?.currentChoiceIndex ?? 0) + 1,
      total: this.gameState?.totalChoices ?? 0
    };
  }

  getMyVote(): 'a' | 'b' | null {
    return this.myVote;
  }
}

/**
 * Would You Rather UI Builder
 */
export function buildWouldYouRatherGameUI(scene: WouldYouRatherGameScene) {
  const state = scene.getGameState();
  if (!state) return null;

  const choice = scene.getCurrentChoice();
  const results = scene.getPollResults();

  return {
    phase: state.phase,
    currentChoice: choice,
    optionA: choice?.optionA ?? '',
    optionB: choice?.optionB ?? '',
    pollResults: results,
    myVote: scene.getMyVote(),
    progress: scene.getProgress(),
    players: state.players
  };
}
