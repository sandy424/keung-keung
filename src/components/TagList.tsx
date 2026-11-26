import type { Store } from "../types/store";

// 카테고리 + 사용자 태그
export default function TagList({ store, max = 99 }: { store: Store; max?: number }) {
  const items = [
    ...(store.category ?? []).map((t) => ({ t, kind: "cat" })),
    ...(store.tags ?? []).map((t) => ({ t, kind: "tag" })),
  ].slice(0, max);
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(({ t, kind }) => (
        <span key={kind + t}
          className={`rounded-md px-2 py-0.5 text-xs font-medium ${kind === "cat" ? "bg-amber-950 text-white" : "border border-amber-900/15 text-amber-900/70"}`}>
          {kind === "tag" ? `#${t}` : t}
        </span>
      ))}
    </div>
  );
}
