export function ChaosOverlay({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-secondary/40 bg-secondary/10 p-6 text-secondary shadow-lg">
      <p className="text-sm uppercase tracking-[0.3em]">Chaos event</p>
      <h3 className="text-xl font-semibold">{message}</h3>
    </div>
  );
}
