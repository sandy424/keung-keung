import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Review, Store } from "../../types/store";
import { formatScore, reviewAvg } from "../../utils/rating";
import useAuth from "../../hooks/useAuth";
import useSaved from "../../hooks/useSaved";
import HeartIcon from "../HeartIcon";
import StarIcon from "../StarIcon";
import { lookOf } from "./look";

type Props = { store: Store; rank: number; review?: Review | null };

const RANK_STYLE = ["bg-amber-400 text-white", "bg-slate-300 text-slate-800", "bg-orange-300 text-orange-950"];

// 인스타그램 게시물 형태의 랭킹 카드
export default function PostCard({ store, rank, review }: Props) {
  const nav = useNavigate();
  const { user } = useAuth();
  const { saved, toggle } = useSaved(store, user);
  const [copied, setCopied] = useState(false);
  const look = lookOf(store.category);
  const go = () => nav(`/shop/${store.id}`);

  const share = async () => {
    const url = `${window.location.origin}/shop/${store.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `킁킁 · ${store.name}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      /* 공유 취소 */
    }
  };

  return (
    <article className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-amber-900/5">
      {/* 게시물 헤더 */}
      <header className="flex items-center gap-3 px-4 py-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xl ${look.bg}`}>
          {look.emoji[0]}
        </span>
        <div className="min-w-0 flex-1">
          <button onClick={go} className="block truncate text-left font-bold text-gray-900 hover:underline">{store.name}</button>
          <p className="truncate text-xs text-gray-500">
            {store.recommender ? `💌 ${store.recommender}님의 추천` : store.address}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${RANK_STYLE[rank - 1] ?? "bg-amber-950/5 text-amber-950/60"}`}>
          {rank <= 3 ? `TOP ${rank}` : `${rank}위`}
        </span>
      </header>

      {/* 비주얼 */}
      <button onClick={go} className={`relative block aspect-[4/3] w-full overflow-hidden bg-gradient-to-br ${look.bg}`} aria-label={`${store.name} 상세보기`}>
        <span className="absolute left-[12%] top-[18%] rotate-[-12deg] text-6xl opacity-70 sm:text-7xl">{look.emoji[1]}</span>
        <span className="absolute bottom-[14%] right-[12%] rotate-[10deg] text-5xl opacity-60 sm:text-6xl">{look.emoji[2]}</span>
        <span className="absolute inset-0 flex items-center justify-center text-[96px] drop-shadow-xl sm:text-[120px]">{look.emoji[0]}</span>
        <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-sm font-extrabold text-gray-900 shadow">
          <StarIcon size={16} /> {formatScore(store.avgRating)}
        </span>
        {store.hours && (
          <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white backdrop-blur">🕐 {store.hours}</span>
        )}
      </button>

      {/* 액션 */}
      <div className="flex items-center gap-1 px-3 pt-2">
        <button onClick={toggle} className="rounded-full p-2 text-gray-700 transition hover:bg-rose-50 active:scale-90" aria-label={saved ? "저장 취소" : "저장하기"}>
          <HeartIcon filled={saved} size={24} />
        </button>
        <button onClick={() => nav(`/shop/${store.id}/review`)} className="rounded-full p-2 text-gray-700 hover:bg-amber-50" aria-label="후기 쓰기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.9-.9L3 21l2-4.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.4-8.5h.5a8.5 8.5 0 0 1 8 8z" />
          </svg>
        </button>
        <button onClick={share} className="rounded-full p-2 text-gray-700 hover:bg-amber-50" aria-label="공유하기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
        {copied && <span className="text-xs text-amber-700">링크 복사됨!</span>}
        <button onClick={go} className="ml-auto rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100">
          상세보기
        </button>
      </div>

      {/* 본문 */}
      <div className="px-5 pb-5 pt-1">
        <p className="text-sm font-semibold text-gray-900">후기 {store.reviewCount ?? 0}개</p>
        {store.description && <p className="mt-1 text-sm text-gray-700">{store.description}</p>}
        {review?.text && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-700">
            <b className="mr-1.5">{review.nickname ?? "익명"}</b>
            {reviewAvg(review.rating) !== null && <span className="mr-1 text-amber-600">★{reviewAvg(review.rating)!.toFixed(1)}</span>}
            {review.text}
          </p>
        )}
        {(store.tags?.length || store.category?.length) ? (
          <p className="mt-2 text-sm text-sky-700">
            {[...(store.category ?? []), ...(store.tags ?? [])].map((t) => `#${t}`).join(" ")}
          </p>
        ) : null}
        {store.menus && store.menus.length > 0 && (
          <p className="mt-1 truncate text-xs text-gray-400">추천 메뉴 · {store.menus.map((m) => m.name).join(", ")}</p>
        )}
      </div>
    </article>
  );
}
