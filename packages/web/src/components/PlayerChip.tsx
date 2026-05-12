"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { listItem } from "@/lib/animations";

interface PlayerChipProps {
  name: string;
  color?: string;
  isHost?: boolean;
  isReady?: boolean;
  isCurrentPlayer?: boolean;
  score?: number;
  /** Index for staggered animation */
  index?: number;
}

/**
 * Gaming PlayerChip — neon-styled player card with avatar, status badges,
 * and staggered entry animation. Shows host crown, ready state, and score.
 */
export function PlayerChip({
  name,
  color,
  isHost,
  isReady,
  isCurrentPlayer,
  score,
  index = 0,
}: PlayerChipProps) {
  return (
    <motion.div
      variants={listItem}
      custom={index}
      className={cn(
        "player-chip flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200",
        "bg-surface/60 backdrop-blur-md",
        isReady
          ? "border-neon-lime/40 shadow-[0_0_15px_rgba(57,255,20,0.1)]"
          : "border-white/10",
        isCurrentPlayer && "ring-1 ring-neon-cyan/40 shadow-[0_0_20px_rgba(0,245,255,0.1)]",
      )}
    >
      <Avatar
        name={name}
        color={color}
        size="sm"
        status={isReady ? "online" : "offline"}
      />

      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-display font-bold text-sm truncate",
              isCurrentPlayer ? "text-neon-cyan" : "text-text-primary",
            )}
          >
            {name}
          </span>
          {isHost && (
            <Badge variant="amber" size="sm">
              👑 Host
            </Badge>
          )}
        </div>
        <span className="text-xs text-text-muted">
          {isReady ? "Ready" : "Not ready"}
        </span>
      </div>

      {score !== undefined && (
        <div className="score-badge shrink-0">
          <span className="font-mono font-bold text-sm tabular-nums">{score}</span>
        </div>
      )}
    </motion.div>
  );
}
