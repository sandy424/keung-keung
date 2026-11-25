import { useState } from "react";
import type { Menu } from "../types/store";

export default function StoreMenu({ menus = [] }: { menus?: Menu[] }) {
  const [zoom, setZoom] = useState<Menu | null>(null);

  if (menus.length === 0) {
    return <p className="py-10 text-center text-gray-400">메뉴 준비 중이에요</p>;
  }

  return (
    <>
      <ul className="flex flex-col gap-4">
        {menus.map((m, i) => (
          <li key={`${m.name}-${i}`} className="flex items-center gap-4">
            {m.photo ? (
              <button onClick={() => setZoom(m)} className="shrink-0 overflow-hidden rounded-2xl" aria-label={`${m.name} 사진 크게 보기`}>
                <img src={m.photo} alt={m.name} loading="lazy" className="h-20 w-20 object-cover transition hover:scale-105" />
              </button>
            ) : (
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-3xl" aria-hidden="true">🍰</span>
            )}
            <div className="flex min-w-0 flex-1 items-baseline gap-3">
              <span className="truncate text-lg font-semibold">{m.name}</span>
              <span className="flex-1 border-b border-dotted border-gray-300" />
              <span className="whitespace-nowrap text-gray-600">{m.price ? `${Number(m.price).toLocaleString()}원` : "가격 정보 없음"}</span>
            </div>
          </li>
        ))}
      </ul>

      {/* 사진 크게 보기 */}
      {zoom?.photo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-6" onClick={() => setZoom(null)} role="dialog" aria-label={`${zoom.name} 사진`}>
          <figure className="max-w-md" onClick={(e) => e.stopPropagation()}>
            <img src={zoom.photo} alt={zoom.name} className="max-h-[70vh] w-full rounded-2xl object-contain" />
            <figcaption className="mt-3 text-center font-semibold text-white">{zoom.name}</figcaption>
          </figure>
          <button onClick={() => setZoom(null)} className="absolute right-5 top-5 text-3xl text-white/80" aria-label="닫기">✕</button>
        </div>
      )}
    </>
  );
}
