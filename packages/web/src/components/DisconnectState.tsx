import { EmptyState } from "@/components/EmptyState";

export function DisconnectState() {
  return (
    <EmptyState
      title="Disconnected"
      description="We lost the vibe. Reconnect to jump back in."
    />
  );
}
