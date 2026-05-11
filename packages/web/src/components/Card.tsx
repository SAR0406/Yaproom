import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border-[3px] border-black bg-yellow-300 p-6 text-black shadow-[8px_8px_0_0_#000]",
        className
      )}
      {...props}
    />
  );
}
