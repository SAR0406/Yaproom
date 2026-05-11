import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-black">
      {label ? <span>{label}</span> : null}
      <input
        className={cn(
          "brutal-input w-full",
          className
        )}
        {...props}
      />
    </label>
  );
}
