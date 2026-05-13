import { Badge } from "@/components/Badge";

export function RoomCodeBlock({ code }: { code: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_0_30px_rgba(0,245,255,0.08)] backdrop-blur-xl">
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-text-secondary">Room code</span>
      <Badge variant="cyan" size="lg" className="text-base">{code}</Badge>
    </div>
  );
}
