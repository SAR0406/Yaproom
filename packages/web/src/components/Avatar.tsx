"use client";

import { cn } from "@/lib/cn";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  name: string;
  color?: string;
  size?: AvatarSize;
  /** Whether to show a status dot */
  status?: "online" | "away" | "offline";
  /** URL for an image avatar (falls back to initials) */
  src?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
};

const statusDotStyles: Record<string, string> = {
  online: "bg-neon-lime shadow-[0_0_6px_rgba(57,255,20,0.6)]",
  away: "bg-neon-amber shadow-[0_0_6px_rgba(255,184,0,0.6)]",
  offline: "bg-text-muted",
};

const statusSizes: Record<AvatarSize, string> = {
  sm: "w-2.5 h-2.5 ring-1",
  md: "w-3 h-3 ring-1",
  lg: "w-3.5 h-3.5 ring-2",
  xl: "w-4 h-4 ring-2",
};

/**
 * Gaming Avatar — neon-bordered circle with initials or image.
 * Supports status dot for online/away/offline.
 */
export function Avatar({ name, color, size = "md", status, src }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="player-chip" style={{ display: 'inline-flex', alignItems: 'center' }}>
      <div
        className={cn('avatar', sizeStyles[size])}
        style={{ backgroundColor: color ?? 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full rounded-full object-cover" />
        ) : (
          initials
        )}
      </div>

      {status && (
        <span className={cn('status-dot', status)} aria-hidden />
      )}
    </div>
  );
}
