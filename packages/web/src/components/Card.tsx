"use client";

import { type HTMLAttributes, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";
import { hoverLift, tapScale } from "@/lib/animations";

type CardVariant = "default" | "cyan" | "magenta" | "lime" | "amber";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: CardVariant;
  padding?: CardPadding;
  /** Whether the card is interactive (clickable) */
  interactive?: boolean;
  /** Whether to show the corner accent gradient */
  accent?: boolean;
  /** Card title — renders in the terminal-box header style */
  title?: ReactNode;
  /** Action buttons in the header */
  actions?: ReactNode;
  /** Whether the card is currently highlighted/selected */
  highlighted?: boolean;
  /** Glow intensity on hover (0-1) */
  glowIntensity?: number;
}

const variantBorders: Record<CardVariant, string> = {
  default: "border-white/10 hover:border-white/20",
  cyan: "border-neon-cyan/20 hover:border-neon-cyan/40",
  magenta: "border-neon-magenta/20 hover:border-neon-magenta/40",
  lime: "border-neon-lime/20 hover:border-neon-lime/40",
  amber: "border-neon-amber/20 hover:border-neon-amber/40",
};

const variantGlows: Record<CardVariant, string> = {
  default: "",
  cyan: "hover:shadow-[0_0_25px_rgba(0,245,255,0.12),0_0_60px_rgba(0,245,255,0.06)]",
  magenta: "hover:shadow-[0_0_25px_rgba(255,0,110,0.12),0_0_60px_rgba(255,0,110,0.06)]",
  lime: "hover:shadow-[0_0_25px_rgba(57,255,20,0.12),0_0_60px_rgba(57,255,20,0.06)]",
  amber: "hover:shadow-[0_0_25px_rgba(255,184,0,0.12),0_0_60px_rgba(255,184,0,0.06)]",
};

const variantAccents: Record<CardVariant, string> = {
  default: "from-white/5 to-transparent",
  cyan: "from-neon-cyan/15 to-transparent",
  magenta: "from-neon-magenta/15 to-transparent",
  lime: "from-neon-lime/15 to-transparent",
  amber: "from-neon-amber/15 to-transparent",
};

const paddingStyles: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

/**
 * Gaming Card — glass-morphism panel with neon border glow, corner accent,
 * and perspective hover lift. Used for game cards, info panels, and
 * interactive selections.
 */
export function Card({
  className,
  variant = "default",
  padding = "md",
  interactive = false,
  accent = true,
  title,
  actions,
  highlighted = false,
  glowIntensity = 1,
  children,
  onClick,
  ...props
}: CardProps) {
  const Component = interactive ? motion.div : "div";
  const motionProps = interactive
    ? {
        whileHover: hoverLift,
        whileTap: tapScale,
      }
    : {};

  const content = (
    <>
      {/* Corner accent gradient */}
      {accent && (
        <div
          className={cn(
            "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl pointer-events-none",
            variantAccents[variant],
          )}
          style={{ opacity: glowIntensity }}
        />
      )}

      {/* Scanline overlay */}
      <div className="scanlines pointer-events-none" />

      {/* Header */}
      {(title || actions) && (
        <div className="relative flex items-center justify-between mb-4">
          {title && (
            <h3 className="font-display text-lg font-bold text-text-primary tracking-wide">
              {title}
            </h3>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Content */}
      <div className="relative">{children}</div>
    </>
  );

  const classNameValue = cn(
    "card-game relative overflow-hidden",
    "border backdrop-blur-xl",
    "transition-all duration-300",
    variantBorders[variant],
    variantGlows[variant],
    paddingStyles[padding],
    interactive && "cursor-pointer",
    highlighted && [
      "border-neon-cyan/50",
      "shadow-[0_0_30px_rgba(0,245,255,0.2),0_0_80px_rgba(0,245,255,0.08)]",
      "ring-1 ring-neon-cyan/30",
    ],
    className,
  );

  if (interactive) {
    return (
      <motion.div
        className={classNameValue}
        onClick={onClick}
        whileHover={hoverLift}
        whileTap={tapScale}
        {...(props as HTMLMotionProps<"div">)}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div className={classNameValue} onClick={onClick} {...props}>
      {content}
    </div>
  );
}
