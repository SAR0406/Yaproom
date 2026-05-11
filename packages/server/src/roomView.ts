import type { GameMode, GamePhase, RoomState } from '@yapzi/shared';

const HIDDEN_IMPOSTER_PHASES: ReadonlySet<GamePhase> = new Set([
  'role',
  'action',
  'timer',
  'vote'
]);

export function createRoomViewForPlayer(room: RoomState, playerId?: string | null): RoomState {
  if (!room.game) {
    return room;
  }

  const round = room.game.round;
  const payload = sanitizeRoundPayload(
    round.mode,
    round.phase,
    round.payload,
    playerId ?? undefined
  );

  return {
    ...room,
    game: {
      ...room.game,
      round: {
        ...round,
        payload
      }
    }
  };
}

function sanitizeRoundPayload(
  mode: GameMode,
  phase: GamePhase,
  payload: Record<string, unknown> | undefined,
  playerId?: string
): Record<string, unknown> | undefined {
  if (!payload) {
    return payload;
  }

  const nextPayload: Record<string, unknown> = { ...payload };
  if (phase === 'vote') {
    delete nextPayload.votes;
  }
  if (mode === 'split' && phase === 'action') {
    delete nextPayload.choices;
  }

  if (mode !== 'imposter' || !HIDDEN_IMPOSTER_PHASES.has(phase)) {
    return nextPayload;
  }

  const imposterId = typeof payload.imposterId === 'string' ? payload.imposterId : '';
  const isImposter = Boolean(playerId && imposterId && playerId === imposterId);
  if (!isImposter) {
    delete nextPayload.imposterId;
    delete nextPayload.imposterWord;
  }

  return nextPayload;
}
