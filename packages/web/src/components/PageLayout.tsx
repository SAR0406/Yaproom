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
    <div className={cn("flex min-h-screen flex-col", className)}>
      <div className="mx-auto w-full max-w-6xl px-6">
        <TopNav />
      </div>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 pb-16">
        {children}
      </main>
    </div>
  );
}
