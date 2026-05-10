export function LoadingState({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-muted">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
      <p className="text-sm">{label ?? "Loading chaos..."}</p>
    </div>
  );
}
