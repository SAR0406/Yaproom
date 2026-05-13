"use client";

import { type InputHTMLAttributes, useState, useId, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { shake } from "@/lib/animations";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Label text above the input */
  label?: string;
  /** Helper text below the input */
  helperText?: string;
  /** Error message — also sets aria-invalid */
  error?: string;
  /** Leading icon inside the input */
  icon?: ReactNode;
  /** Trailing action (button, icon) */
  trailingAction?: ReactNode;
  /** Input size variant */
  inputSize?: "sm" | "md" | "lg";
  /** Whether to show a character count (requires maxLength) */
  showCharCount?: boolean;
}

const sizeStyles = {
  sm: "px-3 py-2 text-xs h-9",
  md: "px-4 py-3 text-sm h-11",
  lg: "px-5 py-4 text-base h-14",
};

const iconSizeStyles = {
  sm: "pl-9",
  md: "pl-11",
  lg: "pl-13",
};

/**
 * Gaming Input — neon cyberpunk text input with focus glow, error shake,
 * typing state indicator, and character count. Feels like a terminal prompt.
 */
export function Input({
  label,
  helperText,
  error,
  icon,
  trailingAction,
  inputSize = "md",
  showCharCount = false,
  className,
  id: externalId,
  maxLength,
  value,
  onChange,
  disabled,
  ...props
}: InputProps) {
  const generatedId = useId();
  const id = externalId || generatedId;
  const [isFocused, setIsFocused] = useState(false);
  const hasError = Boolean(error);

  const charCount =
    showCharCount && maxLength
      ? typeof value === "string"
        ? value.length
        : String(value ?? "").length
      : null;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "font-display text-xs font-bold uppercase tracking-[0.1em] transition-colors duration-200",
            hasError
              ? "text-neon-red"
              : isFocused
                ? "text-neon-cyan"
                : "text-text-secondary",
          )}
        >
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <motion.div className="relative" variants={shake} animate={hasError ? "shake" : undefined}>
        {/* Leading icon */}
        {icon && (
          <div
            className={cn(
              "absolute left-0 top-0 h-full flex items-center pointer-events-none transition-colors duration-200",
              inputSize === "sm" ? "pl-3" : inputSize === "lg" ? "pl-4" : "pl-3.5",
              hasError
                ? "text-neon-red/60"
                : isFocused
                  ? "text-neon-cyan/70"
                  : "text-text-muted/50",
            )}
          >
            {icon}
          </div>
        )}

        <input
          id={id}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={
            hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined
          }
          className={cn(
            // Base input styles use the global .input-game
            "input-game w-full",
            // Size mapping
            inputSize === "lg" ? "input-lg" : undefined,
            // Icon offset
            icon ? iconSizeStyles[inputSize] : undefined,
            // Trailing action offset
            trailingAction ? "pr-12" : undefined,
            // Error state maps to the global .input-game.error
            hasError && "error",
            // Disabled
            disabled && "opacity-40 cursor-not-allowed",
            className,
          )}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {/* Trailing action */}
        {trailingAction && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2">
            {trailingAction}
          </div>
        )}
      </motion.div>

      {/* Bottom row: helper text + char count */}
      <AnimatePresence mode="wait">
        {(helperText || error || charCount !== null) && (
          <motion.div
            key={error ? "error" : "info"}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center justify-between px-1"
          >
            {/* Error / Helper text */}
            <p
              id={hasError ? `${id}-error` : `${id}-helper`}
              className={cn(
                "text-xs font-medium",
                hasError ? "text-neon-red" : "text-text-muted",
              )}
              role={hasError ? "alert" : undefined}
            >
              {error || helperText}
            </p>

            {/* Character count */}
            {charCount !== null && (
              <p
                className={cn(
                  "text-xs font-mono tabular-nums",
                  charCount >= (maxLength ?? Infinity) * 0.9
                    ? "text-neon-amber"
                    : "text-text-muted",
                )}
              >
                {charCount}/{maxLength}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
