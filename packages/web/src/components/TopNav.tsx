import Link from "next/link";
import { Button } from "@/components/Button";

export function TopNav() {
  return (
    <nav className="mt-4 flex items-center justify-between gap-4 rounded-3xl border-[3px] border-black bg-yellow-300 px-4 py-4 text-black shadow-[8px_8px_0_0_#000]">
      <Link href="/" className="text-xl font-black uppercase">
        Yapzi
      </Link>
      <div className="hidden items-center gap-4 text-sm font-bold md:flex">
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
