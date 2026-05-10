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
          className="flex items-center justify-between rounded-2xl border border-white/10 bg-surface px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">#{index + 1}</span>
            <span className="font-semibold text-foreground">{player.nickname}</span>
          </div>
          <span className="text-sm font-semibold text-secondary">
            {player.score} pts
          </span>
        </div>
      ))}
    </div>
  );
}
