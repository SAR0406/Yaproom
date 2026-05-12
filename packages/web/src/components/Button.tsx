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
    "inline-flex items-center justify-center rounded-2xl border px-4 font-black uppercase tracking-[0.08em] text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none";
  const variants: Record<string, string> = {
    primary:
      "border-cyan-300/60 bg-cyan-400/15 shadow-[0_0_0_1px_rgba(0,245,255,0.25),0_0_24px_rgba(0,245,255,0.22)] hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-cyan-300/20 active:translate-y-0 active:scale-[0.99]",
    secondary:
      "border-fuchsia-300/60 bg-fuchsia-500/16 shadow-[0_0_0_1px_rgba(255,0,110,0.24),0_0_24px_rgba(255,0,110,0.2)] hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-fuchsia-400/22 active:translate-y-0 active:scale-[0.99]",
    ghost:
      "border-slate-300/30 bg-slate-500/10 text-slate-100 shadow-[0_0_0_1px_rgba(148,163,184,0.2)] hover:-translate-y-0.5 hover:bg-slate-500/18",
    danger:
      "border-rose-300/60 bg-rose-500/16 shadow-[0_0_0_1px_rgba(255,77,109,0.24),0_0_24px_rgba(255,77,109,0.16)] hover:-translate-y-0.5 hover:bg-rose-400/22",
  };
  const sizes: Record<string, string> = {
    sm: "py-2 text-xs",
    md: "py-2.5 text-sm",
    lg: "py-3 text-base",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
