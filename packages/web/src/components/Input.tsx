import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-2 text-sm text-muted">
      {label ? <span>{label}</span> : null}
      <input
        className={cn(
          "w-full rounded-2xl border border-white/10 bg-surface px-4 py-3 text-foreground placeholder:text-muted focus:border-primary focus:outline-none",
          className
        )}
        {...props}
      />
    </label>
  );
}
