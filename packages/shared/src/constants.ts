/**
 * Game Constants and Rules
 * Centralized configuration for all games
 */

import type { GameType, GamePhase, GameRules } from './types.js';

// ============================================================================
// GAME RULES
// ============================================================================

export const GAME_RULES: Record<GameType, GameRules> = {
  undercover: {
    minPlayers: 3,
    maxPlayers: 20,
    defaultPlayers: 10,
    roundDuration: 300000, // 5 minutes
    phaseTimeouts: {
      lobby: 0,
      setup: 2000,
      instructions: 2000,
      role: 4000,
      round_start: 3000,
      action: 120000,
      player_action: 120000, // 2 min per description round
      timer: 30000,
      guess: 60000,
      voting: 60000, // 1 min voting
      vote: 60000,
      reveal: 10000,
      recap: 5000,
      scoring: 5000,
      next_round: 3000,
      match_end: 10000,
    },
  },
  imposter: {
    minPlayers: 3,
    maxPlayers: 20,
    defaultPlayers: 8,
    roundDuration: 300000,
    phaseTimeouts: {
      lobby: 0,
      setup: 2000,
      instructions: 2000,
      role: 4000,
      round_start: 3000,
      action: 90000,
      player_action: 90000,
      timer: 30000,
      guess: 45000,
      voting: 60000,
      vote: 60000,
      reveal: 10000,
      recap: 5000,
      scoring: 5000,
      next_round: 3000,
      match_end: 10000,
    },
  },
  drawing: {
    minPlayers: 3,
    maxPlayers: 12,
    defaultPlayers: 8,
    roundDuration: 300000,
    phaseTimeouts: {
      lobby: 0,
      setup: 2000,
      instructions: 2000,
      role: 3000,
      round_start: 3000,
      action: 90000,
      player_action: 90000,
      timer: 30000,
      guess: 60000,
      voting: 0,
      vote: 0,
      reveal: 15000,
      recap: 5000,
      scoring: 5000,
      next_round: 3000,
      match_end: 10000,
    },
  },
  'drawing-telephone': {
    minPlayers: 3,
    maxPlayers: 12,
    defaultPlayers: 10,
    roundDuration: 600000, // 10 minutes
    phaseTimeouts: {
      lobby: 0,
      setup: 2000,
      instructions: 2000,
      role: 3000,
      round_start: 3000,
      action: 90000,
      player_action: 90000, // 1.5 min per turn
      timer: 30000,
      guess: 60000,
      voting: 0,
      vote: 0,
      reveal: 20000,
      recap: 5000,
      scoring: 5000,
      next_round: 3000,
      match_end: 10000,
    },
  },
  quiplash: {
    minPlayers: 3,
    maxPlayers: 20,
    defaultPlayers: 10,
    roundDuration: 480000, // 8 minutes
    phaseTimeouts: {
      lobby: 0,
      setup: 2000,
      instructions: 2000,
      role: 3000,
      round_start: 3000,
      action: 60000,
      player_action: 60000, // 1 min to answer
      timer: 30000,
      guess: 45000,
      voting: 45000, // 45 sec to vote
      vote: 45000,
      reveal: 10000,
      recap: 5000,
      scoring: 5000,
      next_round: 3000,
      match_end: 10000,
    },
  },
  codenames: {
    minPlayers: 4,
    maxPlayers: 20,
    defaultPlayers: 10,
    roundDuration: 600000, // 10 minutes
    phaseTimeouts: {
      lobby: 0,
      setup: 2000,
      instructions: 2000,
      role: 3000,
      round_start: 3000,
      action: 120000,
      player_action: 120000, // 2 min per turn (clue + guesses)
      timer: 30000,
      guess: 60000,
      voting: 0,
      vote: 0,
      reveal: 5000,
      recap: 5000,
      scoring: 5000,
      next_round: 3000,
      match_end: 10000,
    },
  },
  confession: {
    minPlayers: 3,
    maxPlayers: 20,
    defaultPlayers: 10,
    roundDuration: 360000, // 6 minutes
    phaseTimeouts: {
      lobby: 0,
      setup: 2000,
      instructions: 2000,
      role: 3000,
      round_start: 3000,
      action: 90000,
      player_action: 90000, // 1.5 min to submit confession
      timer: 30000,
      guess: 60000,
      voting: 60000, // 1 min to vote
      vote: 60000,
      reveal: 30000, // Reveal all confessions
      recap: 5000,
      scoring: 5000,
      next_round: 3000,
      match_end: 10000,
    },
  },
  expose: {
    minPlayers: 3,
    maxPlayers: 20,
    defaultPlayers: 8,
    roundDuration: 240000,
    phaseTimeouts: {
      lobby: 0,
      setup: 2000,
      instructions: 2000,
      role: 3000,
      round_start: 3000,
      action: 60000,
      player_action: 60000,
      timer: 30000,
      guess: 45000,
      voting: 45000,
      vote: 45000,
      reveal: 15000,
      recap: 5000,
      scoring: 5000,
      next_round: 3000,
      match_end: 10000,
    },
  },
  split: {
    minPlayers: 2,
    maxPlayers: 20,
    defaultPlayers: 8,
    roundDuration: 240000,
    phaseTimeouts: {
      lobby: 0,
      setup: 2000,
      instructions: 2000,
      round_start: 3000,
      action: 60000,
      player_action: 60000,
      timer: 30000,
      guess: 45000,
      voting: 30000,
      vote: 30000,
      reveal: 10000,
      recap: 5000,
      scoring: 5000,
      next_round: 3000,
      match_end: 10000,
    },
  },
};

// ============================================================================
// PHASE ORDERING
// ============================================================================

export const PHASE_ORDER: GamePhase[] = [
  'lobby',
  'setup',
  'round_start',
  'player_action',
  'voting',
  'reveal',
  'scoring',
  'next_round',
  'match_end',
];

// ============================================================================
// GAME DESCRIPTIONS
// ============================================================================

export const GAME_DESCRIPTIONS: Record<GameType, { name: string; description: string }> = {
  undercover: {
    name: 'Undercover',
    description:
      'A hidden-role deduction game. One word divides civilians from spies. Can you spot the imposters?',
  },
  imposter: {
    name: 'Imposter',
    description:
      'One player gets a slightly different word. Blend in, discuss, and vote out the imposter.',
  },
  drawing: {
    name: 'Drawing',
    description:
      'One player draws while everyone else races to guess the prompt before time runs out.',
  },
  'drawing-telephone': {
    name: 'Drawing Telephone',
    description:
      'Write a prompt, draw a drawing, guess the picture. Watch chaos unfold with each step!',
  },
  quiplash: {
    name: 'Quiplash',
    description:
      'Answer wacky prompts with funny responses. Battle for laughs in head-to-head comedy duels.',
  },
  codenames: {
    name: 'Codenames',
    description:
      'Spymaster gives one-word clues to find secret agents. Can your team decode the message?',
  },
  confession: {
    name: 'Confession',
    description:
      'Submit anonymous confessions, vote on the wildest, then guess who said what. Full of surprises!',
  },
  expose: {
    name: 'Expose',
    description:
      'Cast suspicion, expose the most suspicious player, and survive the social chaos.',
  },
  split: {
    name: 'Split or Steal',
    description:
      'Choose split or steal in tense pairs. Trust can earn points, betrayal can win it all.',
  },
};

// ============================================================================
// PROMPTS & WORD LISTS
// ============================================================================

export const UNDERCOVER_WORD_PAIRS = [
  { civilian: 'penguin', undercover: 'puffin' },
  { civilian: 'lion', undercover: 'tiger' },
  { civilian: 'sunrise', undercover: 'sunset' },
  { civilian: 'book', undercover: 'magazine' },
  { civilian: 'piano', undercover: 'guitar' },
  { civilian: 'summer', undercover: 'winter' },
  { civilian: 'coffee', undercover: 'tea' },
  { civilian: 'laptop', undercover: 'tablet' },
  { civilian: 'hotel', undercover: 'motel' },
  { civilian: 'train', undercover: 'bus' },
  { civilian: 'bicycle', undercover: 'motorcycle' },
  { civilian: 'coin', undercover: 'token' },
  { civilian: 'doctor', undercover: 'nurse' },
  { civilian: 'soup', undercover: 'stew' },
  { civilian: 'ocean', undercover: 'sea' },
  { civilian: 'blanket', undercover: 'quilt' },
  { civilian: 'bread', undercover: 'toast' },
  { civilian: 'hat', undercover: 'cap' },
  { civilian: 'fork', undercover: 'spoon' },
  { civilian: 'eagle', undercover: 'hawk' },
];

export const DRAWING_TELEPHONE_PROMPTS = [
  'A cat wearing sunglasses',
  'Someone eating spaghetti at midnight',
  'A confused astronaut',
  'A birthday cake that went wrong',
  'A dancing dinosaur',
  'Someone stuck in an elevator',
  'A pizza delivery disaster',
  'A robot learning to smile',
  'Someone fighting an invisible enemy',
  'A very sad pizza',
  'A dog driving a car',
  'Someone being attacked by confetti',
  'A ghost trying on clothes',
  'Someone hiding from vegetables',
  'A confused penguin with a jetpack',
];

export const QUIPLASH_PROMPTS = [
  'What would you text to your crush after 3 drinks?',
  'What would a pirate put on their dating profile?',
  'What would a ghost say at a job interview?',
  'If you had to describe your ex in one sentence, what would you say?',
  'What would a cat write in their diary?',
  'What would you tell your younger self?',
  'What is the worst advice you could give someone?',
  'What would a time traveler be shocked to learn about 2024?',
  'What would you send to the group chat at 2am?',
  'What would you write on your tombstone?',
  'If you won the lottery, what\'s the dumbest thing you\'d buy?',
  'What would a potato say if it could talk?',
  'What would your pet say about you if they could text?',
  'What\'s the worst pickup line you\'ve heard?',
  'If you were a cereal, what would you be called?',
];

export const CODENAMES_WORDS = [
  'apple', 'band', 'cake', 'desk', 'eagle', 'fish', 'green', 'house', 'iron', 'jacket',
  'kite', 'lemon', 'mouse', 'noodle', 'orange', 'piano', 'queen', 'river', 'stone', 'tiger',
  'umbrella', 'violin', 'wallet', 'xylophone', 'yellow', 'zebra', 'anchor', 'balloon', 'candle', 'diamond',
  'engine', 'flower', 'galaxy', 'hammer', 'island', 'jungle', 'knight', 'ladder', 'mermaid', 'network',
  'octopus', 'palace', 'quartz', 'rocket', 'shadow', 'temple', 'universe', 'volcano', 'wizard', 'yankee',
];

export const CONFESSION_PROMPTS = [
  'What\'s something you\'ve lied to your best friend about?',
  'What do you secretly judge people for?',
  'What\'s your most embarrassing moment?',
  'What would you do if no one found out?',
  'Who in this room reminds you of someone?',
  'What\'s your biggest fear?',
  'What do you procrastinate on the most?',
  'What\'s a talent you secretly have?',
  'What do you spend way too much money on?',
  'What\'s your hottest take?',
];

// ============================================================================
// AVATAR COLORS
// ============================================================================

export const AVATAR_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Light Blue
  '#F8B88B', // Orange
  '#A8E6CF', // Light Green
  '#FFD3B6', // Peach
  '#FFAAA5', // Pink
  '#AA96DA', // Lavender
  '#FCBAD3', // Light Pink
  '#A8D8EA', // Sky Blue
  '#AA96DA', // Grape
];

export const AVATAR_EMOJIS = [
  '😀', '😎', '🤓', '😍', '🤔', '😂', '🤪', '😎',
  '👽', '🤖', '👻', '🎭', '🦄', '🦊', '🐱', '🐶',
];

// ============================================================================
// TIMEOUTS & LIMITS
// ============================================================================

export const RECONNECT_WINDOW_MS = 30000; // 30 seconds to reconnect
export const PLAYER_IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
export const ROOM_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
export const MAX_ACTIONS_PER_SECOND = 10;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_ANSWER_LENGTH = 200;
export const MAX_GUESS_LENGTH = 100;
export const MAX_CONFESSIONS_PER_PLAYER = 1;
export const MAX_DRAWING_STROKES = 10000;

// ============================================================================
// GAME-SPECIFIC CONFIG
// ============================================================================

export const UNDERCOVER_CONFIG = {
  CIVILIANS: 7,
  UNDERCOVER: 2,
  MR_WHITE: 1,
  ELIMINATION_ROUNDS: 3, // How many eliminations before game ends
  MR_WHITE_GUESS_TIME_MS: 15000, // 15 seconds for Mr. White final guess
};

export const QUIPLASH_CONFIG = {
  ANSWERS_PER_PROMPT: 2, // Head-to-head
  VOTING_TIME_MS: 45000, // 45 seconds to vote
  ANSWER_TIME_MS: 60000, // 1 minute to submit answer
  POINTS_FOR_WIN: 10,
  POINTS_FOR_AUDIENCE: 5,
  ROTATION_ROUNDS: 2, // Rotate audience every 2 rounds
};

export const CODENAMES_CONFIG = {
  GRID_SIZE: 5, // 5x5 grid
  RED_AGENTS: 9,
  BLUE_AGENTS: 8,
  BYSTANDERS: 7,
  ASSASSIN: 1,
  CLUE_TIME_MS: 30000, // 30 seconds
  GUESS_TIME_MS: 120000, // 2 minutes
};

export const DRAWING_TELEPHONE_CONFIG = {
  WRITE_TIME_MS: 45000, // 45 seconds to write prompt
  DRAW_TIME_MS: 90000, // 1.5 minutes to draw
  GUESS_TIME_MS: 30000, // 30 seconds to guess
};

export const CONFESSION_CONFIG = {
  SUBMISSION_TIME_MS: 90000, // 1.5 minutes to write confession
  VOTING_TIME_MS: 60000, // 1 minute to vote
  GUESS_TIME_MS: 45000, // 45 seconds to guess author
  REVEAL_DELAY_MS: 2000, // 2 seconds between reveals
};

// ============================================================================
// ERROR CODES
// ============================================================================

export const ERROR_CODES = {
  INVALID_ROOM_CODE: 'INVALID_ROOM_CODE',
  ROOM_FULL: 'ROOM_FULL',
  INVALID_GAME_TYPE: 'INVALID_GAME_TYPE',
  NOT_HOST: 'NOT_HOST',
  NOT_YOUR_TURN: 'NOT_YOUR_TURN',
  INVALID_ACTION: 'INVALID_ACTION',
  INVALID_PHASE: 'INVALID_PHASE',
  PLAYER_NOT_FOUND: 'PLAYER_NOT_FOUND',
  INVALID_STATE: 'INVALID_STATE',
  UNAUTHORIZED: 'UNAUTHORIZED',
  RATE_LIMITED: 'RATE_LIMITED',
  DUPLICATE_SUBMISSION: 'DUPLICATE_SUBMISSION',
  INVALID_INPUT: 'INVALID_INPUT',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;
