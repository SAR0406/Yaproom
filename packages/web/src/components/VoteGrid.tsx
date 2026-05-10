import type { PlayerState } from "@yapzi/shared";

interface VoteGridProps {
  players: PlayerState[];
  onSelect?: (playerId: string) => void;
}

export function VoteGrid({ players, onSelect }: VoteGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {players.map((player) => (
        <button
          key={player.id}
          onClick={() => onSelect?.(player.id)}
          className="rounded-2xl border border-white/10 bg-surface px-4 py-3 text-left transition hover:border-primary/60"
        >
          <p className="font-semibold text-foreground">{player.nickname}</p>
          <p className="text-xs text-muted">Tap to vote</p>
        </button>
      ))}
    </div>
  );
}
