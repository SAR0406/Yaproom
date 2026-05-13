import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "cyan" | "magenta" | "lime" | "amber" | "red" | "ghost";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Whether to add a pulsing glow animation */
  pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  cyan: "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30",
  magenta: "bg-neon-magenta/15 text-neon-magenta border-neon-magenta/30",
  lime: "bg-neon-lime/15 text-neon-lime border-neon-lime/30",
  amber: "bg-neon-amber/15 text-neon-amber border-neon-amber/30",
  red: "bg-neon-red/15 text-neon-red border-neon-red/30",
  ghost: "bg-white/5 text-text-secondary border-white/10",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-3 py-1 text-xs gap-1.5",
  lg: "px-4 py-1.5 text-sm gap-2",
};

/**
 * Gaming Badge — neon-tinted pill for status, tags, and labels.
 * Supports pulse animation for "live" states.
 */
export function Badge({
  className,
  variant = "cyan",
  size = "md",
  pulse = false,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "badge inline-flex items-center rounded-full border font-display font-bold uppercase tracking-[0.08em] select-none backdrop-blur-xl",
        variantStyles[variant],
        sizeStyles[size],
        pulse && "animate-status-pulse",
        className,
      )}
      {...props}
    />
  );
}
