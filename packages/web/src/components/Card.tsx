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

const variantClass: Record<CardVariant, string> = {
  default: "",
  cyan: "card-cyan",
  magenta: "card-magenta",
  lime: "card-lime",
  amber: "card-amber",
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
            // keep a subtle corner accent; global CSS provides hover accents too
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ opacity: glowIntensity }} />
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
    paddingStyles[padding],
    interactive && "cursor-pointer",
    highlighted && "highlighted",
    variantClass[variant],
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
