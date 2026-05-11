import { randomUUID } from 'node:crypto';
import { customAlphabet } from 'nanoid';
import type { GameMode, GamePhase, PlayerState, RoomSettings, RoomState } from '@yapzi/shared';

const roomCodeGenerator = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 4);

export const defaultSettings: RoomSettings = {
  maxPlayers: 10,
  language: 'en',
  voiceEnabled: false,
  anonymousMode: false,
  chaosLevel: 'medium',
  roundLengthSec: 60,
  autoRotate: true,
  allowLateJoin: true,
  allowSpectators: false,
  audienceMode: false
};

export const defaultGamePhases: GamePhase[] = [
  'instructions',
  'role',
  'action',
  'timer',
  'vote',
  'reveal',
  'recap'
];

export const defaultQueue: GameMode[] = [
  'imposter',
  'drawing',
  'expose',
  'confession',
  'split'
];

export function createRoomCode(): string {
  return roomCodeGenerator();
}

export function createPlayer(
  nickname: string,
  isHost: boolean,
  options?: Partial<PlayerState> & { id?: string }
): PlayerState {
  const now = new Date().toISOString();
  return {
    id: options?.id ?? randomUUID(),
    nickname,
    avatarKey: null,
    color: options?.color ?? randomPlayerColor(),
    isHost,
    isReady: false,
    isConnected: true,
    isMuted: false,
    isBanned: false,
    score: 0,
    lastActiveAt: now
  };
}

export function createRoom(
  host: PlayerState,
  settings: RoomSettings,
  queue: GameMode[]
): RoomState {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    code: createRoomCode(),
    status: 'open',
    createdAt: now,
    hostId: host.id,
    settings,
    queue,
    players: [host],
    bannedPlayerIds: [],
    chatFeed: [],
    game: null
  };
}

export function randomPlayerColor(): string {
  const palette = ['#8B5CF6', '#22D3EE', '#F59E0B', '#10B981', '#EF4444'];
  return palette[Math.floor(Math.random() * palette.length)] ?? '#8B5CF6';
}
