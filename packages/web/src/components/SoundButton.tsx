import { Button } from "@/components/Button";

export function SoundButton({ label }: { label: string }) {
  return (
    <Button variant="ghost" size="sm">
      🔊 {label}
    </Button>
  );
}
