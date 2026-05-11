import { randomUUID } from 'node:crypto';
import type {
  ChaosEvent,
  ChaosLevel,
  GameMode,
  GamePhase,
  GameSessionState,
  RoomState,
  RoundState,
  VoteSubmitPayload,
  GuessSubmitPayload,
  ConfessionSubmitPayload
} from '@yapzi/shared';
import { defaultGamePhases } from './roomUtils.js';

const modePhaseOverrides: Partial<Record<GameMode, GamePhase[]>> = {
  drawing: ['instructions', 'action', 'timer', 'guess', 'reveal', 'recap'],
  expose: ['instructions', 'vote', 'reveal', 'recap'],
  confession: ['instructions', 'action', 'guess', 'reveal', 'recap'],
  split: ['instructions', 'action', 'reveal', 'recap']
};

const imposterWordPairs = [
  ['pizza', 'burger'],
  ['beach', 'pool'],
  ['cat', 'dog'],
  ['spotify', 'youtube']
] as const;

const drawingPrompts = ['alien selfie', 'late class sprint', 'group chat drama'];
const exposePrompts = [
  'Who is most likely to ghost the plan and still ask for pics?',
  'Who is most likely to start drama then go offline?',
  'Who is most likely to get banned for posting memes at 3AM?'
];
const confessionPrompts = [
  'Drop a harmless secret from school or the group chat.',
  'Confess your most chaotic but non-harmful moment.',
  'Share one thing your friends would never guess.'
];

const chaosCatalog: ReadonlyArray<Pick<ChaosEvent, 'type' | 'label' | 'description'>> = [
  { type: 'screen_shake', label: 'Aura Surge', description: 'The room shakes for dramatic effect.' },
  { type: 'fake_ping', label: 'Fake Ping', description: 'Everyone gets baited by a fake alert.' },
  { type: 'bonus_round', label: 'Bonus Energy', description: 'Current round grants bonus points.' },
  { type: 'double_points', label: 'Cooked Mode', description: 'All points are doubled this phase.' },
  { type: 'reverse_vote', label: 'Reverse Vote', description: 'Most suspicious now looks least suspicious.' }
];

export function createGameSession(
  mode: GameMode,
  queue: GameMode[],
  room: RoomState
): GameSessionState {
  const phases = modePhaseOverrides[mode] ?? defaultGamePhases;
  const round = createRound(mode, phases, 1, room);

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
    const nextMode = selectNextMode(room);
    if (nextMode === room.game.mode) {
      const nextRoundNumber = round.number + 1;
      room.game.round = createRound(room.game.mode, phases, nextRoundNumber, room);
    } else {
      room.game = createGameSession(nextMode, room.queue, room);
    }
    syncScoreboard(room);
    return room;
  }

  const nextPhase = phases[nextIndex] ?? round.phase;
  const nextRound: RoundState = {
    ...round,
    phase: nextPhase,
    endsAt: null
  };

  if (nextPhase === 'reveal' || nextPhase === 'recap') {
    scoreRound(room, round);
    syncScoreboard(room);
  }

  maybeTriggerChaosEvent(room, nextPhase);
  room.game.round = nextRound;
  return room;
}

function createRound(
  mode: GameMode,
  phases: GamePhase[],
  number: number,
  room: RoomState
): RoundState {
  const startedAt = new Date().toISOString();
  const round: RoundState = {
    id: randomUUID(),
    number,
    mode,
    phase: phases[0] ?? 'instructions',
    prompt: selectPrompt(mode),
    startedAt,
    endsAt: null,
    payload: {}
  };

  if (mode === 'imposter') {
    const [commonWord, imposterWord] = pickRandom(imposterWordPairs);
    const playerIds = room.players.map((player) => player.id);
    const imposter = playerIds.length ? pickRandom(playerIds) : room.hostId;
    round.payload = {
      commonWord,
      imposterWord,
      imposterId: imposter,
      votes: []
    };
  }

  if (mode === 'drawing') {
    round.payload = {
      drawerId: room.players.length
        ? room.players[number % room.players.length]?.id ?? room.hostId
        : room.hostId,
      guesses: [],
      drawPaths: []
    };
  }

  if (mode === 'expose') {
    round.payload = {
      votes: []
    };
  }

  if (mode === 'confession') {
    round.payload = {
      confessions: [],
      guesses: []
    };
  }

  if (mode === 'split') {
    const pair = pickSplitPair(room);
    round.payload = {
      pair,
      choices: []
    };
  }

  return round;
}

function selectPrompt(mode: GameMode): string {
  if (mode === 'drawing') return pickRandom(drawingPrompts);
  if (mode === 'expose') return pickRandom(exposePrompts);
  if (mode === 'confession') return pickRandom(confessionPrompts);
  if (mode === 'imposter') return 'Blend in without over-acting. One of you is undercover.';
  return 'Choose split or steal. Trust is optional.';
}

function pickSplitPair(room: RoomState): [string, string] {
  if (room.players.length < 2) {
    throw new Error('Split mode requires at least two players.');
  }
  const first = room.players[0]?.id ?? room.hostId;
  const second = room.players[1]?.id ?? room.hostId;
  return [first, second];
}

function scoreRound(room: RoomState, round: RoundState): void {
  if (!room.game) return;

  if (round.mode === 'imposter') {
    const votes = (round.payload?.votes as VoteSubmitPayload[] | undefined) ?? [];
    const imposterId = readString(round.payload?.imposterId);
    const votesForImposter = votes.filter((vote) => vote.targetId === imposterId).length;
    const votedOut = votesForImposter > Math.floor(Math.max(votes.length, 1) / 2);

    if (votedOut) {
      for (const player of room.players) {
        if (player.id !== imposterId) applyScore(room, player.id, 2);
      }
    } else if (imposterId) {
      applyScore(room, imposterId, 4);
    }
  }

  if (round.mode === 'drawing') {
    const guesses = (round.payload?.guesses as GuessSubmitPayload[] | undefined) ?? [];
    const prompt = (round.prompt ?? '').toLowerCase();
    const firstCorrect = guesses.find((guess) => guess.guess.toLowerCase().trim() === prompt.trim());
    if (firstCorrect) {
      applyScore(room, firstCorrect.playerId, 3);
      const drawerId = readString(round.payload?.drawerId);
      if (drawerId) applyScore(room, drawerId, 2);
    }
  }

  if (round.mode === 'expose') {
    const votes = (round.payload?.votes as VoteSubmitPayload[] | undefined) ?? [];
    const tally = new Map<string, number>();
    for (const vote of votes) {
      tally.set(vote.targetId, (tally.get(vote.targetId) ?? 0) + 1);
    }
    for (const [targetId, count] of tally.entries()) {
      applyScore(room, targetId, count);
    }
  }

  if (round.mode === 'confession') {
    const confessions = (round.payload?.confessions as ConfessionSubmitPayload[] | undefined) ?? [];
    const guesses = (round.payload?.guesses as GuessSubmitPayload[] | undefined) ?? [];
    for (const confession of confessions) {
      applyScore(room, confession.playerId, 1);
    }
    for (const guess of guesses) {
      applyScore(room, guess.playerId, 1);
    }
  }

  if (round.mode === 'split') {
    const choices = (round.payload?.choices as GuessSubmitPayload[] | undefined) ?? [];
    const pair = (round.payload?.pair as [string, string] | undefined) ?? [];
    const first = choices.find((choice) => choice.playerId === pair[0]);
    const second = choices.find((choice) => choice.playerId === pair[1]);
    const a = first?.guess.toLowerCase();
    const b = second?.guess.toLowerCase();

    if (a === 'split' && b === 'split') {
      if (pair[0]) applyScore(room, pair[0], 2);
      if (pair[1]) applyScore(room, pair[1], 2);
    } else if (a === 'steal' && b === 'split') {
      if (pair[0]) applyScore(room, pair[0], 4);
    } else if (a === 'split' && b === 'steal') {
      if (pair[1]) applyScore(room, pair[1], 4);
    }
  }
}

function applyScore(room: RoomState, playerId: string, delta: number) {
  room.players = room.players.map((player) =>
    player.id === playerId
      ? {
          ...player,
          score: player.score + delta
        }
      : player
  );
}

function selectNextMode(room: RoomState): GameMode {
  if (!room.game || !room.queue.length || !room.settings.autoRotate) {
    return room.game?.mode ?? 'imposter';
  }

  const currentIndex = room.queue.indexOf(room.game.mode);
  if (currentIndex < 0) return room.queue[0] ?? room.game.mode;
  return room.queue[(currentIndex + 1) % room.queue.length] ?? room.game.mode;
}

function syncScoreboard(room: RoomState) {
  if (!room.game) return;
  room.game.scoreboard = room.players.reduce<Record<string, number>>((acc, player) => {
    acc[player.id] = player.score;
    return acc;
  }, {});
}

function maybeTriggerChaosEvent(room: RoomState, nextPhase: GamePhase) {
  if (!room.game) return;
  const probability = chaosProbability(room.settings.chaosLevel);
  const activePhase = nextPhase === 'action' || nextPhase === 'vote' || nextPhase === 'guess';
  if (!activePhase || Math.random() > probability) return;

  const event = pickRandom(chaosCatalog);
  const chaos: ChaosEvent = {
    id: randomUUID(),
    type: event.type,
    label: event.label,
    description: event.description,
    triggeredAt: new Date().toISOString()
  };
  room.game.chaosEvents = [...room.game.chaosEvents.slice(-4), chaos];
}

const CHAOS_PROBABILITY: Record<ChaosLevel, number> = {
  low: 0.08,
  medium: 0.16,
  high: 0.28
};

function chaosProbability(level: ChaosLevel): number {
  return CHAOS_PROBABILITY[level];
}

function pickRandom<T>(items: readonly T[]): T {
  if (!items.length) {
    throw new Error('Cannot pick a random value from an empty collection.');
  }
  const value = items[Math.floor(Math.random() * items.length)];
  if (typeof value === 'undefined') {
    throw new Error('Failed to select a random item.');
  }
  return value;
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
