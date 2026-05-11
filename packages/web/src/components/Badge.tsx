import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border-[2px] border-black bg-white px-3 py-1 text-xs font-black text-black shadow-[2px_2px_0_0_#000]",
        className
      )}
      {...props}
    />
  );
}
