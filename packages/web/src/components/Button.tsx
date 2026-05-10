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
    "inline-flex items-center justify-center rounded-2xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";
  const variants: Record<string, string> = {
    primary: "bg-primary text-white shadow-lg shadow-primary/30 hover:-translate-y-0.5",
    secondary:
      "bg-surface-muted text-foreground hover:bg-surface/90 border border-white/10",
    ghost: "bg-transparent text-foreground hover:bg-white/10",
    danger: "bg-danger text-white hover:bg-danger/90",
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
