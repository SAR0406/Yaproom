import type { RoomState } from '@yapzi/shared';

const roastLines = [
  'Bro voted like a politician with no evidence.',
  'This defense was legally weak.',
  'Peak suspicious behavior.',
  'Certified chaos performance.'
];

export function buildRecap(room: RoomState): { summary: string; roast: string } {
  const mode = room.game?.mode ?? 'imposter';
  const leader = [...room.players].sort((a, b) => b.score - a.score)[0]?.nickname ?? 'Unknown';
  const summary =
    mode === 'imposter'
      ? `Room ${room.code} witnessed betrayal, panic, and undercover energy.`
      : mode === 'drawing'
        ? `Room ${room.code} turned doodles into a speedrun of wrong guesses.`
        : mode === 'expose'
          ? `Room ${room.code} delivered votes, roasts, and pure allegation vibes.`
          : mode === 'confession'
            ? `Room ${room.code} dropped anonymous tea and guessed with confidence.`
            : `Room ${room.code} tested trust and someone absolutely sold.`;

  const roast = `${pickRandom(roastLines)} MVP right now: ${leader}.`;
  return { summary, roast };
}

function pickRandom<T>(items: readonly T[]): T {
  if (!items.length) {
    throw new Error('Cannot pick a random value from an empty collection.');
  }
  const value = items[Math.floor(Math.random() * items.length)];
  if (typeof value === 'undefined') {
    throw new Error('Failed to select a recap line.');
  }
  return value;
}
