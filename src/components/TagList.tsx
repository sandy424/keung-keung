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
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${kind === "cat" ? "bg-rose-50 text-rose-500" : "bg-amber-50 text-amber-700"}`}>
          {kind === "tag" ? `#${t}` : t}
        </span>
      ))}
    </div>
  );
}
