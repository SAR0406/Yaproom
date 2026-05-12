import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, ...props }: InputProps) {
  const hasError = Boolean(props["aria-invalid"]);

  return (
    <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.08em] text-cyan-100/90">
      {label ? <span className="text-cyan-100/85">{label}</span> : null}
      <input
        className={cn(
          "brutal-input w-full",
          hasError &&
            "border-rose-400/80 shadow-[inset_0_0_0_1px_rgba(255,77,109,0.35),0_0_0_1px_rgba(255,77,109,0.3),0_0_26px_rgba(255,77,109,0.24)]",
          className
        )}
        {...props}
      />
    </label>
  );
}
