import type { GameMode, GamePhase } from "@yapzi/shared";

export const phaseOrder: GamePhase[] = [
  "instructions",
  "role",
  "action",
  "timer",
  "vote",
  "guess",
  "reveal",
  "recap",
];

export const gameModeLabels: Record<GameMode, string> = {
  imposter: "Imposter",
  drawing: "Cursed Drawing",
  expose: "Expose Vote",
  confession: "Confession",
  split: "Split or Steal",
};

export function describePhase(phase: GamePhase) {
  const labels: Record<GamePhase, string> = {
    lobby: "Lobby",
    instructions: "Instructions",
    role: "Role",
    action: "Action",
    timer: "Timer",
    vote: "Vote",
    guess: "Guess",
    reveal: "Reveal",
    recap: "Recap",
    results: "Results",
  };
  return labels[phase];
}
