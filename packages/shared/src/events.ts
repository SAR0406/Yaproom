import type {
  ChatMessage,
  ErrorPayload,
  GameMode,
  GamePhase,
  PlayerState,
  RoomSettings,
  RoomState,
  RoundState,
  RoomStatus
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
}
