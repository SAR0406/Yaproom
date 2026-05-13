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
    <div className={cn("brutal-shell", className)}>
      <TopNav />
      <main className="brutal-main">
        <section className="brutal-topbar brutal-panel">
          <div>
            <p className="eyebrow">YAPROOM FRONTEND</p>
            <h2>Neubrutal Experience Layer</h2>
          </div>
          <div className="flex gap-2">
            <span className="brutal-chip cyan">LIVE</span>
            <span className="brutal-chip dark">SYNC</span>
          </div>
        </section>
        {children}
      </main>
    </div>
  );
}
