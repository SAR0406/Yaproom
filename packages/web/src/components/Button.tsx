import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-2xl border-[3px] border-black font-black text-black transition-all active:translate-x-1 active:translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:translate-x-0 disabled:active:translate-y-0";
  const variants: Record<string, string> = {
    primary: "bg-cyan-300 shadow-[6px_6px_0_0_#000] hover:-translate-y-0.5",
    secondary:
      "bg-lime-300 shadow-[6px_6px_0_0_#000] hover:-translate-y-0.5",
    ghost: "bg-white shadow-[6px_6px_0_0_#000] hover:-translate-y-0.5",
    danger: "bg-rose-300 shadow-[6px_6px_0_0_#000] hover:-translate-y-0.5",
  };
  const sizes: Record<string, string> = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
