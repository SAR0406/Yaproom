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
  RoomStatus,
  ChatSendPayload,
  VoiceSignalPayload,
  TruthOrDareSpinPayload,
  TruthOrDareChoicePayload,
  TruthOrDareCompletePayload,
  TruthOrDareSkipPayload,
  TruthOrDareCustomPromptPayload,
  TruthOrDareSetSpicePayload,
  WouldYouRatherVotePayload,
  WouldYouRatherCustomPromptPayload,
  NeverHaveIEverFingerPayload,
  NeverHaveIEverCustomPromptPayload,
  WhosMostLikelyVotePayload,
  WhosMostLikelyCustomPromptPayload,
  GuessWhoSaidItAnswerPayload,
  GuessWhoSaidItGuessPayload,
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


export function sendChat(payload: ChatSendPayload) {
  const socket = getSocket();
  socket?.emit('chat:send', payload);
}

export function sendVoiceSignal(payload: VoiceSignalPayload) {
  const socket = getSocket();
  socket?.emit('voice:signal', payload);
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

// ============================================================================
// PHASE 1 GAME ACTIONS
// ============================================================================

// Truth or Dare
export function truthOrDareSpin(payload: TruthOrDareSpinPayload) {
  const socket = getSocket();
  socket?.emit('game:truth-or-dare:spin', payload);
}

export function truthOrDareChoose(payload: TruthOrDareChoicePayload) {
  const socket = getSocket();
  socket?.emit('game:truth-or-dare:choose', payload);
}

export function truthOrDareComplete(payload: TruthOrDareCompletePayload) {
  const socket = getSocket();
  socket?.emit('game:truth-or-dare:complete', payload);
}

export function truthOrDareSkip(payload: TruthOrDareSkipPayload) {
  const socket = getSocket();
  socket?.emit('game:truth-or-dare:skip', payload);
}

export function truthOrDareCustomPrompt(payload: TruthOrDareCustomPromptPayload) {
  const socket = getSocket();
  socket?.emit('game:truth-or-dare:custom-prompt', payload);
}

export function truthOrDareSetSpice(payload: TruthOrDareSetSpicePayload) {
  const socket = getSocket();
  socket?.emit('game:truth-or-dare:set-spice', payload);
}

// Would You Rather
export function wouldYouRatherVote(payload: WouldYouRatherVotePayload) {
  const socket = getSocket();
  socket?.emit('game:would-you-rather:vote', payload);
}

export function wouldYouRatherCustomPrompt(payload: WouldYouRatherCustomPromptPayload) {
  const socket = getSocket();
  socket?.emit('game:would-you-rather:custom-prompt', payload);
}

// Never Have I Ever
export function neverHaveIEverFingerDown(payload: NeverHaveIEverFingerPayload) {
  const socket = getSocket();
  socket?.emit('game:never-have-i-ever:finger-down', payload);
}

export function neverHaveIEverCustomPrompt(payload: NeverHaveIEverCustomPromptPayload) {
  const socket = getSocket();
  socket?.emit('game:never-have-i-ever:custom-prompt', payload);
}

// Who's Most Likely To
export function whosMostLikelyVote(payload: WhosMostLikelyVotePayload) {
  const socket = getSocket();
  socket?.emit('game:whos-most-likely:vote', payload);
}

export function whosMostLikelyCustomPrompt(payload: WhosMostLikelyCustomPromptPayload) {
  const socket = getSocket();
  socket?.emit('game:whos-most-likely:custom-prompt', payload);
}

// Guess Who Said It
export function guessWhoSaidItSubmitAnswer(payload: GuessWhoSaidItAnswerPayload) {
  const socket = getSocket();
  socket?.emit('game:guess-who-said-it:submit-answer', payload);
}

export function guessWhoSaidItSubmitGuess(payload: GuessWhoSaidItGuessPayload) {
  const socket = getSocket();
  socket?.emit('game:guess-who-said-it:submit-guess', payload);
}
