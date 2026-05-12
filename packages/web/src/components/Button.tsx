"use client";

import { type ButtonHTMLAttributes, useRef, type MouseEvent } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";
import { tapScale } from "@/lib/animations";

type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Whether to show a loading spinner */
  loading?: boolean;
  /** Icon to show before the label */
  icon?: React.ReactNode;
  /** Icon to show after the label */
  trailingIcon?: React.ReactNode;
  /** Disable the ripple effect */
  noRipple?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    "bg-neon-cyan/12 border-neon-cyan/30 text-neon-cyan",
    "hover:bg-neon-cyan/20 hover:border-neon-cyan/50",
    "hover:shadow-[0_0_20px_rgba(0,245,255,0.35),0_0_50px_rgba(0,245,255,0.15)]",
    "active:shadow-[0_0_30px_rgba(0,245,255,0.5),0_0_70px_rgba(0,245,255,0.25)]",
  ].join(" "),
  secondary: [
    "bg-neon-magenta/12 border-neon-magenta/30 text-neon-magenta",
    "hover:bg-neon-magenta/20 hover:border-neon-magenta/50",
    "hover:shadow-[0_0_20px_rgba(255,0,110,0.35),0_0_50px_rgba(255,0,110,0.15)]",
    "active:shadow-[0_0_30px_rgba(255,0,110,0.5),0_0_70px_rgba(255,0,110,0.25)]",
  ].join(" "),
  success: [
    "bg-neon-lime/12 border-neon-lime/30 text-neon-lime",
    "hover:bg-neon-lime/20 hover:border-neon-lime/50",
    "hover:shadow-[0_0_20px_rgba(57,255,20,0.35),0_0_50px_rgba(57,255,20,0.15)]",
    "active:shadow-[0_0_30px_rgba(57,255,20,0.5),0_0_70px_rgba(57,255,20,0.25)]",
  ].join(" "),
  danger: [
    "bg-neon-red/12 border-neon-red/30 text-neon-red",
    "hover:bg-neon-red/20 hover:border-neon-red/50",
    "hover:shadow-[0_0_20px_rgba(255,23,68,0.35),0_0_50px_rgba(255,23,68,0.15)]",
    "active:shadow-[0_0_30px_rgba(255,23,68,0.5),0_0_70px_rgba(255,23,68,0.25)]",
  ].join(" "),
  ghost: [
    "bg-transparent border-white/10 text-text-secondary",
    "hover:bg-white/5 hover:border-neon-cyan/25 hover:text-text-primary",
    "hover:shadow-[0_0_15px_rgba(0,245,255,0.15)]",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs gap-1.5 rounded-lg",
  md: "px-6 py-3 text-sm gap-2 rounded-xl",
  lg: "px-8 py-4 text-base gap-2.5 rounded-2xl",
  xl: "px-10 py-5 text-lg gap-3 rounded-2xl",
};

/**
 * Gaming Button — neon cyberpunk style with ripple effect, glow states,
 * and snappy spring animations. Uses gaming vernacular for labels.
 */
export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  trailingIcon,
  noRipple = false,
  disabled,
  onClick,
  children,
  ...props
}: ButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Ripple effect
    if (!noRipple && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      ripple.className = "ripple";
      btnRef.current.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    }

    onClick?.(e);
  };

  return (
    <motion.button
      ref={btnRef}
      whileTap={disabled || loading ? undefined : tapScale}
      className={cn(
        // Base gaming button styles
        "btn-game relative inline-flex items-center justify-center",
        "font-display font-bold uppercase tracking-[0.06em]",
        "select-none outline-none",
        "transition-all duration-200",
        "focus-visible:ring-2 focus-visible:ring-neon-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-space-black",
        // Variant & size
        variantStyles[variant],
        sizeStyles[size],
        // Disabled
        (disabled || loading) && "opacity-35 cursor-not-allowed pointer-events-none grayscale-[0.5]",
        className,
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      {...(props as HTMLMotionProps<"button">)}
    >
      {/* Loading spinner */}
      {loading && (
        <svg
          className="animate-spin-slow h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="32"
            strokeLinecap="round"
            className="opacity-25"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="32"
            strokeDashoffset="10"
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* Leading icon */}
      {icon && !loading && <span className="shrink-0">{icon}</span>}

      {/* Label */}
      <span>{children}</span>

      {/* Trailing icon */}
      {trailingIcon && <span className="shrink-0">{trailingIcon}</span>}
    </motion.button>
  );
}
