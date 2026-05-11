import type {
  AdminActionPayload,
  GameMode,
  PlayerReadyPayload,
  RoomCreatePayload,
  RoomJoinPayload,
  RoomSettings,
  VoteSubmitPayload,
  GuessSubmitPayload,
  ConfessionSubmitPayload,
  DrawPathPayload,
  RoomStatus
} from '@yapzi/shared';
import { getSocket } from '@/lib/socket';

export function createRoom(payload: RoomCreatePayload) {
  const socket = getSocket();
  socket?.emit('room:create', payload);
}

export function joinRoom(payload: RoomJoinPayload) {
  const socket = getSocket();
  const storedPlayerId =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('yapzi:playerId')
      : null;
  socket?.emit('room:join', {
    ...payload,
    playerId: payload.playerId ?? storedPlayerId ?? undefined
  });
}

export function leaveRoom() {
  const socket = getSocket();
  socket?.emit('room:leave');
}

export function setReady(payload: PlayerReadyPayload) {
  const socket = getSocket();
  socket?.emit('room:ready', payload);
}

export function updateSettings(payload: RoomSettings) {
  const socket = getSocket();
  socket?.emit('room:settings', payload);
}

export function updateRoomStatus(status: RoomStatus) {
  const socket = getSocket();
  socket?.emit('room:status', { status });
}

export function updateQueue(queue: GameMode[]) {
  const socket = getSocket();
  socket?.emit('room:queue', { queue });
}

export function startGame(mode: GameMode) {
  const socket = getSocket();
  socket?.emit('game:start', { mode });
}

export function nextRound() {
  const socket = getSocket();
  socket?.emit('round:next');
}

export function sendReaction(playerId: string, reaction: string) {
  const socket = getSocket();
  socket?.emit('reaction:send', { playerId, reaction });
}

export function submitVote(payload: VoteSubmitPayload) {
  const socket = getSocket();
  socket?.emit('vote:submit', payload);
}

export function submitGuess(payload: GuessSubmitPayload) {
  const socket = getSocket();
  socket?.emit('guess:submit', payload);
}

export function submitConfession(payload: ConfessionSubmitPayload) {
  const socket = getSocket();
  socket?.emit('confession:submit', payload);
}

export function sendDrawPath(payload: DrawPathPayload) {
  const socket = getSocket();
  socket?.emit('draw:path', payload);
}

export function adminKick(payload: AdminActionPayload) {
  const socket = getSocket();
  socket?.emit('admin:kick', payload);
}

export function adminMute(payload: AdminActionPayload) {
  const socket = getSocket();
  socket?.emit('admin:mute', payload);
}

export function adminBan(payload: AdminActionPayload) {
  const socket = getSocket();
  socket?.emit('admin:ban', payload);
}
