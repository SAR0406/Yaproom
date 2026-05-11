import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CareerGL_interface {
  children: ReactNode;
  className?: string;
}

export function CareerGL({ children, className }: CareerGL_interface) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-[#0B0F1A] text-[#F8FAFC] overflow-x-hidden relative", className)}>
      {children}
    </div>
  );
}
