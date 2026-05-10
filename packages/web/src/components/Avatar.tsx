import { cn } from "@/lib/cn";

interface AvatarProps {
  name: string;
  color?: string;
}

export function Avatar({ name, color }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
        "text-white"
      )}
      style={{ backgroundColor: color ?? "#8B5CF6" }}
    >
      {initials}
    </div>
  );
}
