import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { TopNav } from "@/components/TopNav";

export function PageLayout({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 md:px-6 md:py-6", className)}>
      <TopNav />
      <main className="grid gap-6">{children}</main>
    </div>
  );
}
