import { Badge } from "@/components/Badge";

export function RoomCodeBlock({ code }: { code: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border-[2px] border-black bg-orange-200 px-4 py-3 shadow-[3px_3px_0_0_#000]">
      <span className="text-sm font-bold text-black/70">Room code</span>
      <Badge className="text-base">{code}</Badge>
    </div>
  );
}
