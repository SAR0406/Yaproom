"use client";

import { type InputHTMLAttributes, useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { tweenFast } from "@/lib/animations";

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Label text next to the toggle */
  label?: string;
  /** Description text below the label */
  description?: string;
  /** Toggle size */
  toggleSize?: "sm" | "md" | "lg";
  /** Color theme */
  variant?: "cyan" | "magenta" | "lime" | "amber";
}

const trackSizes = {
  sm: "w-9 h-5",
  md: "w-11 h-6",
  lg: "w-14 h-8",
};

const knobSizes = {
  sm: "w-3.5 h-3.5",
  md: "w-4.5 h-4.5",
  lg: "w-6 h-6",
};

const knobOffsets = {
  sm: { off: "left-0.5", on: "left-[calc(100%-1rem)]" },
  md: { off: "left-0.5", on: "left-[calc(100%-1.25rem)]" },
  lg: { off: "left-1", on: "left-[calc(100%-1.75rem)]" },
};

const variantColors = {
  cyan: {
    track: "bg-neon-cyan/20 border-neon-cyan/30",
    trackActive: "bg-neon-cyan/30 border-neon-cyan/50 shadow-[0_0_15px_rgba(0,245,255,0.3)]",
    knob: "bg-neon-cyan",
    knobActive: "bg-neon-cyan shadow-[0_0_10px_rgba(0,245,255,0.5)]",
  },
  magenta: {
    track: "bg-neon-magenta/20 border-neon-magenta/30",
    trackActive: "bg-neon-magenta/30 border-neon-magenta/50 shadow-[0_0_15px_rgba(255,0,110,0.3)]",
    knob: "bg-neon-magenta",
    knobActive: "bg-neon-magenta shadow-[0_0_10px_rgba(255,0,110,0.5)]",
  },
  lime: {
    track: "bg-neon-lime/20 border-neon-lime/30",
    trackActive: "bg-neon-lime/30 border-neon-lime/50 shadow-[0_0_15px_rgba(57,255,20,0.3)]",
    knob: "bg-neon-lime",
    knobActive: "bg-neon-lime shadow-[0_0_10px_rgba(57,255,20,0.5)]",
  },
  amber: {
    track: "bg-neon-amber/20 border-neon-amber/30",
    trackActive: "bg-neon-amber/30 border-neon-amber/50 shadow-[0_0_15px_rgba(255,184,0,0.3)]",
    knob: "bg-neon-amber",
    knobActive: "bg-neon-amber shadow-[0_0_10px_rgba(255,184,0,0.5)]",
  },
};

/**
 * Gaming Toggle — neon cyberpunk switch with animated knob, glow states,
 * and label/description support. Feels tactile and responsive.
 */
export function Toggle({
  label,
  description,
  toggleSize = "md",
  variant = "cyan",
  className,
  id: externalId,
  checked = false,
  disabled,
  onChange,
  ...props
}: ToggleProps) {
  const generatedId = useId();
  const id = externalId || generatedId;
  const colors = variantColors[variant];

  return (
    <div className={cn("flex items-start gap-3", className)}>
      {/* Hidden native checkbox for accessibility */}
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="sr-only"
        role="switch"
        aria-checked={checked}
        {...props}
      />

      {/* Visible toggle track + knob */}
      <label
        htmlFor={id}
        className={cn(
          "relative inline-flex shrink-0 cursor-pointer items-center rounded-full border transition-all duration-200",
          trackSizes[toggleSize],
          disabled && "opacity-40 cursor-not-allowed",
          checked ? colors.trackActive : colors.track,
        )}
      >
        <motion.span
          className={cn(
            "absolute rounded-full transition-colors duration-200",
            knobSizes[toggleSize],
            checked ? colors.knobActive : colors.knob,
          )}
          animate={{
            left: checked
              ? knobOffsets[toggleSize].on
              : knobOffsets[toggleSize].off,
          }}
          transition={tweenFast}
        />
      </label>

      {/* Label + description */}
      {(label || description) && (
        <label htmlFor={id} className={cn("flex flex-col", disabled && "opacity-40 cursor-not-allowed")}>
          {label && (
            <span className="font-display text-sm font-bold text-text-primary tracking-wide cursor-pointer select-none">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-text-muted mt-0.5">{description}</span>
          )}
        </label>
      )}
    </div>
  );
}