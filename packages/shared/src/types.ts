export type ChaosLevel = 'low' | 'medium' | 'high';

export type GameMode =
  | 'imposter'
  | 'drawing'
  | 'expose'
  | 'confession'
  | 'split';

export type GamePhase =
  | 'lobby'
  | 'instructions'
  | 'role'
  | 'action'
  | 'timer'
  | 'vote'
  | 'guess'
  | 'reveal'
  | 'recap'
  | 'results';

export type RoomStatus = 'open' | 'locked' | 'in_game' | 'ended';

export interface RoomSettings {
  maxPlayers: number;
  language: string;
  voiceEnabled: boolean;
  anonymousMode: boolean;
  chaosLevel: ChaosLevel;
  roundLengthSec: number;
  autoRotate: boolean;
  allowLateJoin: boolean;
  allowSpectators: boolean;
  audienceMode: boolean;
}

export interface PlayerState {
  id: string;
  nickname: string;
  avatarKey: string | null;
  color: string;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  isMuted: boolean;
  isBanned: boolean;
  score: number;
  lastActiveAt: string;
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

export interface ErrorPayload {
  code:
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
  message: string;
}
