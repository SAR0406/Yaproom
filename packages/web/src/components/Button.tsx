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
  primary: "btn-primary",
  secondary: "btn-secondary",
  success: "btn-success",
  danger: "btn-danger",
  ghost: "btn-ghost",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
  xl: "btn-xl",
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
        "btn-game brutalBtn btn relative inline-flex items-center justify-center",
        "font-display font-bold uppercase tracking-[0.06em]",
        "select-none outline-none",
        "transition-all duration-200",
        // Variant & size mapped to global CSS helpers
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
