import type { PlayerState } from "@yapzi/shared";

interface ScoreBoardProps {
  players: PlayerState[];
}

export function ScoreBoard({ players }: ScoreBoardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  return (
    <div className="space-y-2">
      {sorted.map((player, index) => (
        <div
          key={player.id}
          className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <span className="badge badge-ghost">#{index + 1}</span>
            <span className="font-semibold text-text-primary">{player.nickname}</span>
          </div>
          <span className="score-badge">
            {player.score} pts
          </span>
        </div>
      ))}
    </div>
  );
}
