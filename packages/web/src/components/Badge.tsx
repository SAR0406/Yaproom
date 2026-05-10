import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-foreground",
        className
      )}
      {...props}
    />
  );
}
