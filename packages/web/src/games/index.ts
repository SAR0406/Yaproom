/**
 * Game Architecture Index
 * Central export point for all game-related modules
 */

// Game Scene Classes
export {
  ImposterGameScene,
  buildImposterGameUI,
  type ImposterGameState
} from './ImposterGameScene';

export {
  DrawingGameScene,
  buildDrawingGameUI,
  type DrawingGameState,
  type DrawingStroke
} from './DrawingGameScene';

export {
  ConfessionGameScene,
  buildConfessionGameUI,
  type ConfessionGameState,
  type ConfessionCard
} from './ConfessionGameScene';

export {
  SplitOrStealGameScene,
  buildSplitOrStealGameUI,
  type SplitOrStealGameState,
  type SplitOrStealPair
} from './SplitOrStealGameScene';

export {
  TruthOrDareGameScene,
  buildTruthOrDareGameUI,
  type TruthOrDareGameState,
  type Challenge
} from './TruthOrDareGameScene';

export {
  GuessWhoSaidItGameScene,
  buildGuessWhoGameUI,
  type GuessWhoGameState,
  type Quote
} from './GuessWhoSaidItGameScene';

export {
  NeverHaveIEverGameScene,
  buildNeverHaveIEverGameUI,
  type NeverHaveIEverGameState,
  type Statement
} from './NeverHaveIEverGameScene';

export {
  WouldYouRatherGameScene,
  buildWouldYouRatherGameUI,
  type WouldYouRatherGameState,
  type Choice
} from './WouldYouRatherGameScene';

export {
  QuiplashGameScene,
  buildQuiplashGameUI,
  type QuiplashGameState,
  type Quip
} from './QuiplashGameScene';

export {
  UndercoverGameScene,
  buildUndercoverGameUI,
  type UndercoverGameState,
  type UndercoverPlayer
} from './UndercoverGameScene';

export {
  WhosMostLikelyGameScene,
  buildWhosMostLikelyGameUI,
  type WhosMostLikelyGameState,
  type LikelyliestQuestion
} from './WhosMostLikelyGameScene';

// Game Manager
export {
  GameModeManager,
  GAME_MODE_METADATA,
  type GameMode,
  type GameState
} from './GameModeManager';

/**
 * Usage Example:
 * 
 * import {
 *   GameModeManager,
 *   GAME_MODE_METADATA,
 *   ImposterGameScene,
 *   type GameMode
 * } from '@/games';
 * 
 * // Initialize game manager
 * const manager = new GameModeManager(
 *   (mode, uiData) => {
 *     console.log('UI updated:', uiData);
 *   },
 *   (from, to) => {
 *     console.log(`Switching from ${from} to ${to}`);
 *   }
 * );
 * 
 * // Start game
 * manager.initializeGame('imposter', {
 *   mode: 'imposter',
 *   roomCode: 'ABCD',
 *   playerId: 'player-1',
 *   // ... imposter-specific state
 * });
 * 
 * // Get UI data for rendering
 * const uiData = manager.getCurrentUIData();
 * 
 * // Get scene for direct access (if needed)
 * const scene = manager.getCurrentScene();
 */
