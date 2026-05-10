import { cn } from "@/lib/cn";
import { Avatar } from "@/components/Avatar";

interface PlayerChipProps {
  name: string;
  color?: string;
  isHost?: boolean;
  isReady?: boolean;
}

export function PlayerChip({ name, color, isHost, isReady }: PlayerChipProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-white/10 bg-surface-muted px-4 py-3",
        isReady && "border-positive/50 bg-positive/10"
      )}
    >
      <Avatar name={name} color={color} />
      <div className="flex flex-col">
        <span className="font-semibold text-foreground">{name}</span>
        <span className="text-xs text-muted">
          {isHost ? "Host" : isReady ? "Ready" : "Chilling"}
        </span>
      </div>
    </div>
  );
}
