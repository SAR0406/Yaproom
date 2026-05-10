import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Drawer({
  open,
  children,
  className,
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40">
      <div
        className={cn(
          "rounded-t-3xl border border-white/10 bg-surface p-6 shadow-2xl",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
