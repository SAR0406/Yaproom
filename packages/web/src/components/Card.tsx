import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "terminal-panel p-6 text-white backdrop-blur-xl",
        className
      )}
      {...props}
    />
  );
}
