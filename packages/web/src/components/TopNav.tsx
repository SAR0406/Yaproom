import Link from "next/link";
import { Button } from "@/components/Button";

export function TopNav() {
  return (
    <nav className="flex items-center justify-between py-6">
      <Link href="/" className="text-xl font-semibold text-foreground">
        Yapzi
      </Link>
      <div className="hidden items-center gap-6 text-sm text-muted md:flex">
        <Link href="/how-it-works">How it works</Link>
        <Link href="/game-modes">Game modes</Link>
        <Link href="/join">Join room</Link>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/create">
          <Button size="sm">Create room</Button>
        </Link>
      </div>
    </nav>
  );
}
