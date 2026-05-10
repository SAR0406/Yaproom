import { Badge } from "@/components/Badge";

export function RoomCodeBlock({ code }: { code: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-surface px-4 py-3">
      <span className="text-sm text-muted">Room code</span>
      <Badge className="text-base">{code}</Badge>
    </div>
  );
}
