import { randomUUID } from 'node:crypto';
import type { GameMode, GamePhase, GameSessionState, RoomState, RoundState } from '@yapzi/shared';
import { defaultGamePhases } from './roomUtils';

const modePhaseOverrides: Partial<Record<GameMode, GamePhase[]>> = {
  drawing: ['instructions', 'action', 'timer', 'guess', 'reveal', 'recap'],
  expose: ['instructions', 'vote', 'reveal', 'recap'],
  confession: ['instructions', 'action', 'guess', 'reveal', 'recap'],
  split: ['instructions', 'action', 'reveal', 'recap']
};

export function createGameSession(
  mode: GameMode,
  queue: GameMode[],
  room: RoomState
): GameSessionState {
  const phases = modePhaseOverrides[mode] ?? defaultGamePhases;
  const round: RoundState = {
    id: randomUUID(),
    number: 1,
    mode,
    phase: phases[0] ?? 'instructions',
    prompt: null,
    startedAt: new Date().toISOString(),
    endsAt: null,
    payload: {}
  };

  return {
    id: randomUUID(),
    mode,
    phases,
    round,
    queue,
    scoreboard: room.players.reduce<Record<string, number>>((acc, player) => {
      acc[player.id] = player.score;
      return acc;
    }, {}),
    chaosEvents: []
  };
}

export function advancePhase(room: RoomState): RoomState {
  if (!room.game) return room;
  const { phases, round } = room.game;
  const currentIndex = phases.indexOf(round.phase);
  const nextIndex = currentIndex + 1;

  if (nextIndex >= phases.length) {
    const nextMode = room.game.queue[0] ?? room.game.mode;
    const newQueue = room.game.queue.length > 1 ? room.game.queue.slice(1) : room.game.queue;
    if (nextMode === room.game.mode) {
      room.game.round = {
        ...round,
        number: round.number + 1,
        phase: phases[0] ?? 'instructions',
        startedAt: new Date().toISOString(),
        endsAt: null
      };
      room.game.queue = newQueue;
      room.queue = newQueue;
    } else {
      room.game = createGameSession(nextMode, newQueue, room);
      room.queue = newQueue;
    }
    return room;
  }

  room.game.round = {
    ...round,
    phase: phases[nextIndex] ?? round.phase,
    endsAt: null
  };

  return room;
}
