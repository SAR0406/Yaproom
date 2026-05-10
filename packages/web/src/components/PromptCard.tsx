import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function PromptCard({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-gradient-to-br from-surface to-surface-muted p-8 text-center shadow-xl",
        className
      )}
      {...props}
    />
  );
}
