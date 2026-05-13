import type {
  ChatMessage,
  ErrorPayload,
  GameMode,
  GamePhase,
  PlayerState,
  RoomSettings,
  RoomState,
  RoundState,
  RoomStatus,
  TruthOrDareChoice,
  TruthOrDareSpiceLevel,
  GWSIPhase,
} from './types';

export interface RoomCreatePayload {
  nickname: string;
  settings: RoomSettings;
  queue?: GameMode[];
}

export interface RoomJoinPayload {
  code: string;
  nickname: string;
  playerId?: string;
}

export interface RoomSyncPayload {
  room: RoomState;
  playerId: string;
}

export interface PlayerReadyPayload {
  playerId: string;
  isReady: boolean;
}

export interface GameStartPayload {
  mode: GameMode;
}

export interface QueueUpdatePayload {
  queue: GameMode[];
}

export interface RoomStatusPayload {
  status: RoomStatus;
}

export interface RoundUpdatePayload {
  round: RoundState;
  phase: GamePhase;
}

export interface VoteSubmitPayload {
  playerId: string;
  targetId: string;
}

export interface GuessSubmitPayload {
  playerId: string;
  guess: string;
}

export interface ConfessionSubmitPayload {
  playerId: string;
  confession: string;
}

export interface DrawPathPayload {
  playerId: string;
  path: Array<{ x: number; y: number }>;
}

export interface ReactionSendPayload {
  playerId: string;
  reaction: string;
}

export interface ChatSendPayload {
  playerId: string;
  text: string;
  memeUrl?: string;
}

export type VoiceSignalKind = 'join' | 'offer' | 'answer' | 'ice' | 'leave';

export interface VoiceSessionDescription {
  type: 'offer' | 'answer' | 'pranswer' | 'rollback';
  sdp?: string;
}

export interface VoiceIceCandidate {
  candidate: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  usernameFragment?: string | null;
}

export interface VoiceSignalPayload {
  fromPlayerId: string;
  toPlayerId?: string;
  kind: VoiceSignalKind;
  sdp?: VoiceSessionDescription;
  candidate?: VoiceIceCandidate;
}

export interface AdminActionPayload {
  adminId: string;
  targetId: string;
  reason?: string;
}

// ============================================================================
// PHASE 1 GAME EVENT PAYLOADS
// ============================================================================

// Truth or Dare
export interface TruthOrDareSpinPayload {
  playerId: string;
}

export interface TruthOrDareChoicePayload {
  playerId: string;
  choice: TruthOrDareChoice;
}

export interface TruthOrDareCompletePayload {
  playerId: string;
}

export interface TruthOrDareSkipPayload {
  playerId: string;
}

export interface TruthOrDareCustomPromptPayload {
  playerId: string;
  text: string;
  type: TruthOrDareChoice;
}

export interface TruthOrDareSetSpicePayload {
  spiceLevel: TruthOrDareSpiceLevel;
}

// Would You Rather
export interface WouldYouRatherVotePayload {
  playerId: string;
  choice: 'A' | 'B';
}

export interface WouldYouRatherCustomPromptPayload {
  playerId: string;
  optionA: string;
  optionB: string;
}

// Never Have I Ever
export interface NeverHaveIEverFingerPayload {
  playerId: string;
}

export interface NeverHaveIEverCustomPromptPayload {
  playerId: string;
  text: string;
}

// Who's Most Likely To
export interface WhosMostLikelyVotePayload {
  playerId: string;
  targetPlayerId: string;
}

export interface WhosMostLikelyCustomPromptPayload {
  playerId: string;
  text: string;
}

// Guess Who Said It
export interface GuessWhoSaidItAnswerPayload {
  playerId: string;
  text: string;
}

export interface GuessWhoSaidItGuessPayload {
  playerId: string;
  guesses: Record<string, string>; // answerId -> guessedPlayerId
}

export interface ClientToServerEvents {
  'room:create': (payload: RoomCreatePayload) => void;
  'room:join': (payload: RoomJoinPayload) => void;
  'room:leave': () => void;
  'room:ready': (payload: PlayerReadyPayload) => void;
  'room:settings': (payload: RoomSettings) => void;
  'room:status': (payload: RoomStatusPayload) => void;
  'room:queue': (payload: QueueUpdatePayload) => void;
  'game:start': (payload: GameStartPayload) => void;
  'round:next': () => void;
  'vote:submit': (payload: VoteSubmitPayload) => void;
  'guess:submit': (payload: GuessSubmitPayload) => void;
  'confession:submit': (payload: ConfessionSubmitPayload) => void;
  'draw:path': (payload: DrawPathPayload) => void;
  'reaction:send': (payload: ReactionSendPayload) => void;
  'chat:send': (payload: ChatSendPayload) => void;
  'voice:signal': (payload: VoiceSignalPayload) => void;
  'admin:kick': (payload: AdminActionPayload) => void;
  'admin:mute': (payload: AdminActionPayload) => void;
  'admin:ban': (payload: AdminActionPayload) => void;
  // Phase 1 game events
  'game:truth-or-dare:spin': (payload: TruthOrDareSpinPayload) => void;
  'game:truth-or-dare:choose': (payload: TruthOrDareChoicePayload) => void;
  'game:truth-or-dare:complete': (payload: TruthOrDareCompletePayload) => void;
  'game:truth-or-dare:skip': (payload: TruthOrDareSkipPayload) => void;
  'game:truth-or-dare:custom-prompt': (payload: TruthOrDareCustomPromptPayload) => void;
  'game:truth-or-dare:set-spice': (payload: TruthOrDareSetSpicePayload) => void;
  'game:would-you-rather:vote': (payload: WouldYouRatherVotePayload) => void;
  'game:would-you-rather:custom-prompt': (payload: WouldYouRatherCustomPromptPayload) => void;
  'game:never-have-i-ever:finger-down': (payload: NeverHaveIEverFingerPayload) => void;
  'game:never-have-i-ever:custom-prompt': (payload: NeverHaveIEverCustomPromptPayload) => void;
  'game:whos-most-likely:vote': (payload: WhosMostLikelyVotePayload) => void;
  'game:whos-most-likely:custom-prompt': (payload: WhosMostLikelyCustomPromptPayload) => void;
  'game:guess-who-said-it:submit-answer': (payload: GuessWhoSaidItAnswerPayload) => void;
  'game:guess-who-said-it:submit-guess': (payload: GuessWhoSaidItGuessPayload) => void;
}

export interface ServerToClientEvents {
  'room:sync': (payload: RoomSyncPayload) => void;
  'room:update': (room: RoomState) => void;
  'room:error': (payload: ErrorPayload) => void;
  'player:update': (player: PlayerState) => void;
  'game:phase': (payload: RoundUpdatePayload) => void;
  'game:mode': (mode: GameMode) => void;
  'game:ended': (room: RoomState) => void;
  'reaction:receive': (payload: ReactionSendPayload) => void;
  'chat:receive': (payload: ChatMessage) => void;
  'voice:signal': (payload: VoiceSignalPayload) => void;
  'reconnect:sync': (payload: RoomSyncPayload) => void;
  // Phase 1 game events
  'game:truth-or-dare:state': (state: Record<string, unknown>) => void;
  'game:truth-or-dare:spin-result': (payload: { playerId: string }) => void;
  'game:truth-or-dare:prompt': (payload: { prompt: Record<string, unknown>; playerId: string }) => void;
  'game:would-you-rather:state': (state: Record<string, unknown>) => void;
  'game:would-you-rather:reveal': (payload: { votes: Record<string, string>; voteCounts: { A: number; B: number } }) => void;
  'game:never-have-i-ever:state': (state: Record<string, unknown>) => void;
  'game:never-have-i-ever:finger-update': (payload: { playerId: string; fingers: number }) => void;
  'game:never-have-i-ever:eliminated': (payload: { playerId: string }) => void;
  'game:whos-most-likely:state': (state: Record<string, unknown>) => void;
  'game:whos-most-likely:reveal': (payload: { voteCounts: Record<string, number>; prompt: Record<string, unknown> }) => void;
  'game:guess-who-said-it:state': (state: Record<string, unknown>) => void;
  'game:guess-who-said-it:phase': (payload: { phase: GWSIPhase }) => void;
  'game:guess-who-said-it:reveal': (payload: { answers: Record<string, unknown>[] }) => void;
}
