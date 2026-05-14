import type { GameMode, GamePhase } from "@yapzi/shared";
import { modeCatalog } from "@/lib/modeCatalog";

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

export const gameModeLabels = Object.fromEntries(
  modeCatalog.map((entry) => [entry.mode, entry.title])
) as Record<GameMode, string>;

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
