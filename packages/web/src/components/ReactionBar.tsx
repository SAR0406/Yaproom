const reactions = ["🔥", "��", "😱", "💀", "😈", "💜"];

export function ReactionBar({
  onReact,
}: {
  onReact?: (reaction: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {reactions.map((reaction) => (
        <button
          key={reaction}
          onClick={() => onReact?.(reaction)}
          className="rounded-full bg-white/10 px-3 py-2 text-lg transition hover:bg-white/20"
        >
          {reaction}
        </button>
      ))}
    </div>
  );
}
