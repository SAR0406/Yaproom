import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Modal({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
      <div
        className={cn(
          "w-full max-w-lg rounded-3xl border border-white/10 bg-surface p-6",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
