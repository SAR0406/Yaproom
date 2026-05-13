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
  undercover: "Undercover",
  imposter: "Imposter",
  drawing: "Cursed Drawing",
  "drawing-telephone": "Drawing Telephone",
  quiplash: "Quiplash",
  codenames: "Codenames",
  expose: "Expose Vote",
  confession: "Confession",
  split: "Split or Steal",
  "truth-or-dare": "Truth or Dare",
  "would-you-rather": "Would You Rather",
  "never-have-i-ever": "Never Have I Ever",
  "whos-most-likely": "Who's Most Likely To",
  "guess-who-said-it": "Guess Who Said It",
};

export function describePhase(phase: GamePhase) {
  const labels: Record<GamePhase, string> = {
    lobby: "Lobby",
    setup: "Setup",
    instructions: "Instructions",
    round_start: "Round Start",
    role: "Role",
    action: "Action",
    player_action: "Player Action",
    timer: "Timer",
    voting: "Voting",
    vote: "Vote",
    guess: "Guess",
    reveal: "Reveal",
    recap: "Recap",
    scoring: "Scoring",
    next_round: "Next Round",
    match_end: "Match End",
  };
  return labels[phase];
}
