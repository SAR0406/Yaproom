export function GameReveal({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-surface p-8 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-muted">Reveal</p>
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted">{subtitle}</p>
    </div>
  );
}
