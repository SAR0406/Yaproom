import Link from "next/link";
import { Button } from "@/components/Button";

export function TopNav() {
  return (
    <nav className="glass-panel card-game p-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-2xl font-display text-shimmer">
          Yapzi
        </Link>
        <div className="hidden md:flex items-center gap-3 text-sm text-text-secondary">
          <Link href="/how-it-works">How it works</Link>
          <Link href="/game-modes">Game modes</Link>
          <Link href="/join">Join room</Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/create">
          <Button size="sm">Create room</Button>
        </Link>
      </div>
    </nav>
  );
}
