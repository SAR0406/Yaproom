interface TimerRingProps {
  progress: number;
  label?: string;
}

export function TimerRing({ progress, label }: TimerRingProps) {
  const clamped = Math.min(Math.max(progress, 0), 100);
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full bg-surface"
        style={{
          background: `conic-gradient(#8B5CF6 ${clamped}%, rgba(255,255,255,0.1) ${clamped}% 100%)`,
        }}
      >
        <span className="text-sm font-semibold text-foreground">
          {Math.round(clamped)}%
        </span>
      </div>
      {label ? <span className="text-xs text-muted">{label}</span> : null}
    </div>
  );
}
