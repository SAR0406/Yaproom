/**
 * Shared Types for Yaproom Platform
 * This file defines the contract between client and server
 */

// ============================================================================
// GAME TYPES
// ============================================================================

export type GameType = 'undercover' | 'drawing-telephone' | 'quiplash' | 'codenames' | 'confession';

export type GamePhase =
  | 'lobby'
  | 'setup'
  | 'round_start'
  | 'player_action'
  | 'voting'
  | 'reveal'
  | 'scoring'
  | 'next_round'
  | 'match_end';

export interface GameRules {
  minPlayers: number;
  maxPlayers: number;
  defaultPlayers: number;
  roundDuration: number; // milliseconds
  phaseTimeouts: Record<GamePhase, number>;
}

// ============================================================================
// PLAYER TYPES
// ============================================================================

export type PlayerRole = 'host' | 'player' | 'spectator';
export type PlayerStatus = 'connected' | 'disconnected' | 'reconnecting' | 'eliminated' | 'idle';

export interface Player {
  id: string;
  name: string;
  avatar: number; // 0-15, represents avatar index
  role: PlayerRole;
  status: PlayerStatus;
  joinedAt: number; // timestamp
  lastSeenAt: number; // timestamp
  score: number; // current round score
  totalScore: number; // cumulative score
  isReady: boolean;
  color: string; // hex color for UI
  sessionToken?: string; // For reconnection
}

export interface PlayerSecret {
  playerId: string;
  secretRole?: string; // game-specific: 'civilian', 'undercover', etc.
  secretData?: any; // game-specific: hidden word, board, etc.
  receivedAt: number;
}

// ============================================================================
// ROOM TYPES
// ============================================================================

export interface RoomConfig {
  roomId: string;
  roomCode: string; // 4-6 char alphanumeric
  hostId: string;
  gameType: GameType;
  maxPlayers: number;
  isPublic: boolean;
  createdAt: number;
  expiresAt: number; // Auto-delete after X hours
}

export interface RoomState {
  config: RoomConfig;
  phase: GamePhase;
  phaseStartedAt: number;
  phaseEndsAt: number; // For client-side timers
  roundIndex: number;
  turnIndex: number;
  players: Player[];
  spectators: Player[];
  currentTurnPlayerId?: string;
  
  // Game-specific state (varies per game)
  gameState: Record<string, any>;
  
  // Server-only state
  secretState?: {
    roles?: Record<string, string>;
    board?: any;
    answers?: Record<string, string>;
    votes?: Record<string, string[]>;
  };
  
  // Audit
  actionLog: GameAction[];
  scoreBoard: Record<string, number>;
  completedRounds: RoundSummary[];
}

export interface RoundSummary {
  roundIndex: number;
  winner?: string;
  scores: Record<string, number>;
  highlights: string[]; // memorable moments
  duration: number;
}

// ============================================================================
// ACTION TYPES
// ============================================================================

export type ActionType =
  | 'submit_description'
  | 'submit_answer'
  | 'submit_vote'
  | 'submit_guess'
  | 'submit_clue'
  | 'draw_stroke'
  | 'ready_up'
  | 'host_action';

export interface GameAction {
  id: string;
  type: ActionType;
  playerId: string;
  roomId: string;
  timestamp: number;
  phase: GamePhase;
  payload: any;
  validated: boolean;
  validationError?: string;
}

// ============================================================================
// SOCKET EVENT TYPES
// ============================================================================

// Client → Server Events
export interface ClientToServerEvents {
  // Connection
  'join_room': (data: {
    roomCode: string;
    playerName: string;
    avatarIndex: number;
  }, callback?: (error?: string | null, playerId?: string) => void) => void;
  
  'leave_room': (data: { reason: string }, callback?: () => void) => void;
  
  'reconnect_player': (data: {
    roomCode: string;
    playerId: string;
    sessionToken: string;
  }, callback?: (error?: string | null, state?: RoomState) => void) => void;
  
  // Actions
  'ready_up': (data: { ready: boolean }, callback?: () => void) => void;
  'start_game': (callback?: () => void) => void;
  'next_round': (callback?: () => void) => void;
  
  // Game Actions
  'submit_action': (data: {
    type: string;
    payload: any;
  }, callback?: (error?: string | null) => void) => void;
  
  'submit_vote': (data: {
    votedPlayerId: string;
    reason?: string;
  }, callback?: () => void) => void;
  
  'submit_guess': (data: {
    guessText: string;
  }, callback?: () => void) => void;
  
  'submit_drawing': (data: {
    strokes: Stroke[];
    isComplete: boolean;
  }, callback?: () => void) => void;
  
  // Host Actions
  'host_kick_player': (data: { playerId: string }, callback?: () => void) => void;
  'host_promote_player': (data: { playerId: string }, callback?: () => void) => void;
  'host_skip_phase': (callback?: () => void) => void;
  'host_restart_game': (callback?: () => void) => void;
  
  // Reactions
  'send_reaction': (data: { emoji: string }, callback?: () => void) => void;
  
  // Sync
  'request_state_sync': (callback?: (state?: RoomState) => void) => void;
}

// Server → Client Events
export interface ServerToClientEvents {
  // Connection
  'connection_established': (data: {
    playerId: string;
    sessionToken: string;
  }) => void;
  
  'player_joined': (player: Player) => void;
  'player_left': (data: { playerId: string; reason: string }) => void;
  'player_reconnected': (player: Player) => void;
  'player_disconnected': (data: { playerId: string; willReconnectIn: number }) => void;
  
  // State Updates
  'room_state_updated': (state: RoomState) => void;
  'phase_changed': (data: {
    oldPhase: GamePhase;
    newPhase: GamePhase;
    phaseEndsAt: number;
  }) => void;
  
  'player_updated': (player: Player) => void;
  'players_list': (players: Player[]) => void;
  
  // Game Events
  'round_started': (data: {
    roundIndex: number;
    phaseEndsAt: number;
  }) => void;
  
  'turn_changed': (data: {
    currentTurnPlayerId: string;
    phaseEndsAt: number;
  }) => void;
  
  'action_received': (data: {
    actionId: string;
    playerId: string;
    success: boolean;
  }) => void;
  
  'reveal_started': (data: any) => void;
  'round_summary': (summary: RoundSummary) => void;
  'match_ended': (data: {
    winner?: string;
    finalScores: Record<string, number>;
    duration: number;
  }) => void;
  
  // Reactions
  'reaction_received': (data: {
    playerId: string;
    emoji: string;
  }) => void;
  
  // Errors
  'error': (data: {
    code: string;
    message: string;
  }) => void;
  
  // Chat (if enabled)
  'chat_message': (data: {
    playerId: string;
    playerName: string;
    message: string;
    timestamp: number;
  }) => void;
}

// ============================================================================
// DRAWING TYPES
// ============================================================================

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface Stroke {
  points: Point[];
  color: string;
  width: number;
  timestamp: number;
}

export interface DrawingData {
  strokes: Stroke[];
  width: number;
  height: number;
  timestamp: number;
}

// ============================================================================
// GAME-SPECIFIC TYPES
// ============================================================================

// Undercover
export type UndercoverRole = 'civilian' | 'undercover' | 'mr_white';

export interface UndercoverGameState {
  wordPair: {
    civilianWord: string;
    undercoverWord: string;
  };
  roles: Record<string, UndercoverRole>; // server only
  descriptions: Record<string, string>;
  votes?: Record<string, string>; // voter -> voted
  eliminatedPlayers: string[];
  survivingRoles: Record<string, UndercoverRole>;
  mrWhiteFinalGuess?: string;
  winner?: 'civilians' | 'undercover' | 'mr_white';
}

// Drawing Telephone
export interface DrawingTelephoneGameState {
  chains: DrawingChain[];
  currentChainIndex: number;
  currentTurnPlayerId: string;
  turnType: 'write' | 'draw' | 'guess';
}

export interface DrawingChain {
  participants: string[];
  steps: DrawingStep[];
}

export interface DrawingStep {
  playerId: string;
  type: 'write' | 'draw' | 'guess';
  content: string | DrawingData;
  timestamp: number;
}

// Quiplash
export interface QuiplashGameState {
  prompts: QuiplashPrompt[];
  currentPromptIndex: number;
  answers: Record<string, string>; // playerId -> answer
  votes: Record<string, string>; // playerId -> voted answer id
  matchups: Matchup[];
  activePlayers: string[];
  audiencePlayers: string[];
  rotation: number; // which players are in audience
}

export interface QuiplashPrompt {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Matchup {
  answerId1: string;
  answerId2: string;
  votes1: number;
  votes2: number;
  winner?: string;
}

// Codenames
export interface CodenamesGameState {
  words: string[]; // 25 words
  keyCard: KeyCard;
  team1: {
    name: string;
    spymaster: string;
    operatives: string[];
    revealedCards: number[];
    score: number;
  };
  team2: {
    name: string;
    spymaster: string;
    operatives: string[];
    revealedCards: number[];
    score: number;
  };
  currentTeam: 'team1' | 'team2';
  clue?: {
    word: string;
    number: number;
    submittedBy: string;
    timestamp: number;
  };
  guesses: CodeNamesGuess[];
  assassinHit?: boolean;
  winner?: 'team1' | 'team2';
}

export interface KeyCard {
  assignments: ('red' | 'blue' | 'bystander' | 'assassin')[]; // 25 items
}

export interface CodeNamesGuess {
  guessedBy: string;
  wordIndex: number;
  timestamp: number;
}

// Confession
export interface ConfessionGameState {
  confessions: Confession[];
  votes: Record<string, string>; // playerId -> confessionId
  guesses: Record<string, string>; // playerId -> guessed author
  revealed: boolean;
  revealIndex: number; // which confession being revealed
}

export interface Confession {
  id: string;
  text: string;
  authorId: string; // server-only until reveal
  votes: number;
  correctGuesses: string[]; // players who guessed correctly
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface CreateRoomResponse {
  roomId: string;
  roomCode: string;
  playerId: string;
  sessionToken: string;
}

export interface JoinRoomResponse {
  roomId: string;
  playerId: string;
  sessionToken: string;
  state: RoomState;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// ============================================================================
// DATABASE TYPES
// ============================================================================

export interface DatabaseRoom {
  id: string;
  code: string;
  host_id: string;
  game_type: GameType;
  max_players: number;
  is_public: boolean;
  created_at: Date;
  expires_at: Date;
  state_json: string; // Serialized RoomState
}

export interface DatabasePlayer {
  id: string;
  room_id: string;
  name: string;
  avatar_index: number;
  role: PlayerRole;
  status: PlayerStatus;
  score: number;
  total_score: number;
  joined_at: Date;
  last_seen_at: Date;
  session_token: string;
}

export interface DatabaseGameSession {
  id: string;
  room_id: string;
  game_type: GameType;
  host_id: string;
  status: 'active' | 'completed' | 'abandoned';
  started_at: Date;
  ended_at?: Date;
  final_scores_json: string;
}

export interface DatabaseAction {
  id: string;
  game_session_id: string;
  player_id: string;
  action_type: ActionType;
  phase: GamePhase;
  payload_json: string;
  validated: boolean;
  validation_error?: string;
  created_at: Date;
}

export interface DatabaseAuditLog {
  id: string;
  event_type: string;
  player_id: string;
  room_id: string;
  metadata_json: string;
  created_at: Date;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  nickname: string;
  text: string;
  memeUrl: string | null;
  createdAt: string;
}

export interface RoundState {
  id: string;
  number: number;
  mode: GameMode;
  phase: GamePhase;
  prompt: string | null;
  startedAt: string | null;
  endsAt: string | null;
  payload?: Record<string, unknown>;
}

export interface GameSessionState {
  id: string;
  mode: GameMode;
  phases: GamePhase[];
  round: RoundState;
  queue: GameMode[];
  scoreboard: Record<string, number>;
  chaosEvents: ChaosEvent[];
}

export interface RoomState {
  id: string;
  code: string;
  status: RoomStatus;
  createdAt: string;
  hostId: string;
  settings: RoomSettings;
  queue: GameMode[];
  players: PlayerState[];
  bannedPlayerIds: string[];
  chatFeed: ChatMessage[];
  game: GameSessionState | null;
}

export interface ChaosEvent {
  id: string;
  type: ChaosEventType;
  label: string;
  description: string;
  triggeredAt: string;
}

export type ChaosEventType =
  | 'screen_shake'
  | 'fake_ping'
  | 'bonus_round'
  | 'anonymous_mode'
  | 'role_swap'
  | 'double_points'
  | 'silence_player'
  | 'reverse_vote'
  | 'aura_surge'
  | 'cooked_mode';

export type ErrorCode =
  | 'ROOM_FULL'
  | 'ROOM_LOCKED'
  | 'INVALID_CODE'
  | 'HOST_DISCONNECTED'
  | 'GAME_IN_PROGRESS'
  | 'PLAYER_KICKED'
  | 'PLAYER_BANNED'
  | 'INSUFFICIENT_PLAYERS'
  | 'ABUSIVE_LANGUAGE'
  | 'RATE_LIMIT'
  | 'UNKNOWN';

export interface ErrorPayload {
  code: ErrorCode;
  message: string;
}

export interface AiRecapInput {
  roomCode: string;
  mode: GameMode;
  players: Array<{ nickname: string; score: number }>;
  highlights?: string[];
}

export interface AiRecapResult {
  summary: string;
  roast: string;
  source: 'nim' | 'fallback';
}

export type AiPromptKind = 'truth' | 'dare' | 'roast' | 'icebreaker';

export interface AiPromptInput {
  kind: AiPromptKind;
  count?: number;
  tone?: 'chaotic' | 'playful' | 'spicy';
  topic?: string;
}

export interface AiPromptResult {
  prompts: string[];
  source: 'nim' | 'fallback';
}
