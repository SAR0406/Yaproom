/**
 * Unified Game Mode Manager
 * Routes game state to appropriate game scene (Imposter, Drawing, Confession, etc.)
 * Maintains single source of truth for game state across all modes
 */

import { ImposterGameScene, buildImposterGameUI } from './ImposterGameScene';
import { DrawingGameScene, buildDrawingGameUI } from './DrawingGameScene';
import { ConfessionGameScene, buildConfessionGameUI } from './ConfessionGameScene';
import { SplitOrStealGameScene, buildSplitOrStealGameUI } from './SplitOrStealGameScene';
import { TruthOrDareGameScene, buildTruthOrDareGameUI } from './TruthOrDareGameScene';
import { GuessWhoSaidItGameScene, buildGuessWhoGameUI } from './GuessWhoSaidItGameScene';
import { NeverHaveIEverGameScene, buildNeverHaveIEverGameUI } from './NeverHaveIEverGameScene';
import { WouldYouRatherGameScene, buildWouldYouRatherGameUI } from './WouldYouRatherGameScene';
import { QuiplashGameScene, buildQuiplashGameUI } from './QuiplashGameScene';
import { UndercoverGameScene, buildUndercoverGameUI } from './UndercoverGameScene';
import { WhosMostLikelyGameScene, buildWhosMostLikelyGameUI } from './WhosMostLikelyGameScene';

export type GameMode =
  | 'imposter'
  | 'drawing'
  | 'confession'
  | 'split-or-steal'
  | 'truth-or-dare'
  | 'guess-who-said-it'
  | 'never-have-i-ever'
  | 'would-you-rather'
  | 'quiplash'
  | 'undercover'
  | 'whos-most-likely';

export interface GameState {
  mode: GameMode;
  roomCode: string;
  playerId: string;
  [key: string]: unknown;
}

/**
 * Master Game Manager - Orchestrates all game modes and scene management
 */
export class GameModeManager {
  private currentMode: GameMode | null = null;
  private sceneInstances = new Map<
    GameMode,
    ImposterGameScene |
    DrawingGameScene |
    ConfessionGameScene |
    SplitOrStealGameScene |
    TruthOrDareGameScene |
    GuessWhoSaidItGameScene |
    NeverHaveIEverGameScene |
    WouldYouRatherGameScene |
    QuiplashGameScene |
    UndercoverGameScene |
    WhosMostLikelyGameScene
  >();

  private gameState: GameState | null = null;

  constructor(
    private onGameStateChange: (mode: GameMode, uiData: unknown) => void,
    private onModeSwitch: (from: GameMode | null, to: GameMode) => void
  ) {}

  /**
   * Initialize game manager with mode and initial state
   */
  initializeGame(mode: GameMode, gameState: GameState) {
    const previousMode = this.currentMode;
    this.currentMode = mode;
    this.gameState = gameState;

    if (previousMode !== mode) {
      this.onModeSwitch(previousMode, mode);
    }

    // Get or create scene for this mode
    let scene = this.sceneInstances.get(mode);

    if (!scene) {
      scene = this.createScene(mode);
      this.sceneInstances.set(mode, scene);
    }

    // Initialize scene with game state
    this.initializeScene(scene, mode, gameState);
  }

  /**
   * Factory: Create appropriate scene for game mode
   */
  private createScene(
    mode: GameMode
  ):
    | ImposterGameScene
    | DrawingGameScene
    | ConfessionGameScene
    | SplitOrStealGameScene
    | TruthOrDareGameScene
    | GuessWhoSaidItGameScene
    | NeverHaveIEverGameScene
    | WouldYouRatherGameScene
    | QuiplashGameScene
    | UndercoverGameScene
    | WhosMostLikelyGameScene {
    switch (mode) {
      case 'imposter':
        return new ImposterGameScene((state) => this.handleSceneStateChange(mode, state));
      case 'drawing':
        return new DrawingGameScene((state) => this.handleSceneStateChange(mode, state));
      case 'confession':
        return new ConfessionGameScene((state) => this.handleSceneStateChange(mode, state));
      case 'split-or-steal':
        return new SplitOrStealGameScene((state) => this.handleSceneStateChange(mode, state));
      case 'truth-or-dare':
        return new TruthOrDareGameScene((state) => this.handleSceneStateChange(mode, state));
      case 'guess-who-said-it':
        return new GuessWhoSaidItGameScene((state) => this.handleSceneStateChange(mode, state));
      case 'never-have-i-ever':
        return new NeverHaveIEverGameScene((state) => this.handleSceneStateChange(mode, state));
      case 'would-you-rather':
        return new WouldYouRatherGameScene((state) => this.handleSceneStateChange(mode, state));
      case 'quiplash':
        return new QuiplashGameScene((state) => this.handleSceneStateChange(mode, state));
      case 'undercover':
        return new UndercoverGameScene((state) => this.handleSceneStateChange(mode, state));
      case 'whos-most-likely':
        return new WhosMostLikelyGameScene((state) => this.handleSceneStateChange(mode, state));
      default:
        throw new Error(`Unknown game mode: ${mode}`);
    }
  }

  /**
   * Initialize scene with proper typed state
   */
  private initializeScene(scene: any, mode: GameMode, gameState: GameState) {
    // Scene.initializeGame() expects mode-specific state type
    // The type casting is safe here because gameState is validated by caller
    scene.initializeGame(gameState);
  }

  /**
   * Get current scene
   */
  getCurrentScene():
    | ImposterGameScene
    | DrawingGameScene
    | ConfessionGameScene
    | SplitOrStealGameScene
    | TruthOrDareGameScene
    | GuessWhoSaidItGameScene
    | NeverHaveIEverGameScene
    | WouldYouRatherGameScene
    | QuiplashGameScene
    | UndercoverGameScene
    | WhosMostLikelyGameScene
    | null {
    if (!this.currentMode) return null;
    return this.sceneInstances.get(this.currentMode) ?? null;
  }

  /**
   * Get current UI data for rendering
   */
  getCurrentUIData(): unknown {
    const scene = this.getCurrentScene();
    if (!scene || !this.currentMode) return null;

    switch (this.currentMode) {
      case 'imposter':
        return buildImposterGameUI(scene as ImposterGameScene);
      case 'drawing':
        return buildDrawingGameUI(scene as DrawingGameScene);
      case 'confession':
        return buildConfessionGameUI(scene as ConfessionGameScene);
      case 'split-or-steal':
        return buildSplitOrStealGameUI(scene as SplitOrStealGameScene);
      case 'truth-or-dare':
        return buildTruthOrDareGameUI(scene as TruthOrDareGameScene);
      case 'guess-who-said-it':
        return buildGuessWhoGameUI(scene as GuessWhoSaidItGameScene);
      case 'never-have-i-ever':
        return buildNeverHaveIEverGameUI(scene as NeverHaveIEverGameScene);
      case 'would-you-rather':
        return buildWouldYouRatherGameUI(scene as WouldYouRatherGameScene);
      case 'quiplash':
        return buildQuiplashGameUI(scene as QuiplashGameScene);
      case 'undercover':
        return buildUndercoverGameUI(scene as UndercoverGameScene);
      case 'whos-most-likely':
        return buildWhosMostLikelyGameUI(scene as WhosMostLikelyGameScene);
      default:
        return null;
    }
  }

  /**
   * Handle scene state change and propagate UI update
   */
  private handleSceneStateChange(mode: GameMode, state: any) {
    if (mode === this.currentMode) {
      const uiData = this.getCurrentUIData();
      this.onGameStateChange(mode, uiData);
    }
  }

  /**
   * Get current game mode
   */
  getMode(): GameMode | null {
    return this.currentMode;
  }

  /**
   * Switch to different game mode (for multi-round games)
   */
  switchMode(newMode: GameMode, newState: GameState) {
    this.initializeGame(newMode, newState);
  }

  /**
   * Clean up current scene
   */
  dispose() {
    this.sceneInstances.clear();
    this.currentMode = null;
    this.gameState = null;
  }
}

/**
 * Game Mode Metadata
 * Used for UI display, difficulty, player count recommendations
 */
export const GAME_MODE_METADATA: Record<
  GameMode,
  {
    name: string;
    description: string;
    minPlayers: number;
    maxPlayers: number;
    duration: number; // in seconds
    difficulty: 'easy' | 'medium' | 'hard';
    bestFor: string[];
  }
> = {
  imposter: {
    name: 'Imposter',
    description: 'Find the imposter who has a different word',
    minPlayers: 4,
    maxPlayers: 12,
    duration: 300,
    difficulty: 'medium',
    bestFor: ['deduction', 'social', 'mystery']
  },
  drawing: {
    name: 'Drawing Telephone',
    description: 'Draw and guess as stories become hilarious',
    minPlayers: 3,
    maxPlayers: 10,
    duration: 480,
    difficulty: 'easy',
    bestFor: ['creativity', 'humor', 'casual']
  },
  confession: {
    name: 'Confession',
    description: 'Submit anonymous confessions and vote for the best',
    minPlayers: 3,
    maxPlayers: 20,
    duration: 300,
    difficulty: 'medium',
    bestFor: ['humor', 'social', 'icebreaker']
  },
  'split-or-steal': {
    name: 'Split or Steal',
    description: 'Cooperate or betray in the classic prisoners dilemma',
    minPlayers: 2,
    maxPlayers: 6,
    duration: 240,
    difficulty: 'hard',
    bestFor: ['strategy', 'psychology', 'competitive']
  },
  'truth-or-dare': {
    name: 'Truth or Dare',
    description: 'Answer truths or complete dares for points',
    minPlayers: 3,
    maxPlayers: 15,
    duration: 600,
    difficulty: 'medium',
    bestFor: ['icebreaker', 'social', 'party']
  },
  'guess-who-said-it': {
    name: 'Guess Who Said It',
    description: 'Match quotes to the players who said them',
    minPlayers: 4,
    maxPlayers: 12,
    duration: 300,
    difficulty: 'medium',
    bestFor: ['memory', 'social', 'casual']
  },
  'never-have-i-ever': {
    name: 'Never Have I Ever',
    description: 'Confess experiences and eliminate players',
    minPlayers: 3,
    maxPlayers: 15,
    duration: 360,
    difficulty: 'easy',
    bestFor: ['icebreaker', 'casual', 'party']
  },
  'would-you-rather': {
    name: 'Would You Rather',
    description: 'Choose between two options and discuss',
    minPlayers: 2,
    maxPlayers: 20,
    duration: 480,
    difficulty: 'easy',
    bestFor: ['casual', 'icebreaker', 'social']
  },
  quiplash: {
    name: 'Quiplash',
    description: 'Write funny answers and vote for the best',
    minPlayers: 2,
    maxPlayers: 8,
    duration: 360,
    difficulty: 'medium',
    bestFor: ['humor', 'creativity', 'casual']
  },
  undercover: {
    name: 'Undercover',
    description: 'Discover hidden roles through strategic voting',
    minPlayers: 4,
    maxPlayers: 12,
    duration: 300,
    difficulty: 'hard',
    bestFor: ['deduction', 'strategy', 'social']
  },
  'whos-most-likely': {
    name: "Who's Most Likely",
    description: 'Vote on who most fits each trait',
    minPlayers: 3,
    maxPlayers: 15,
    duration: 300,
    difficulty: 'easy',
    bestFor: ['humor', 'social', 'casual']
  }
};
