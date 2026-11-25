import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import type { Review, Store } from "../types/store";
import { formatScore, toScore } from "../utils/rating";
import { CURRENT_REGION } from "../config/region";
import useStores from "../hooks/useStores";
import Bottombar from "../components/Bottombar";
import StarIcon from "../components/StarIcon";
import PostCard from "../components/hotplace/PostCard";
import AiRecommend from "../components/hotplace/AiRecommend";
import { lookOf } from "../components/hotplace/look";

const CATEGORIES = ["전체", "빵", "케이크", "타르트", "구움과자", "기타"];
const GRID = 9; // 3 x 3

// 핫플레이스 - 인스타그램 프로필 형태의 3x3 랭킹 + 킁킁이의 추천
export default function Hotplace() {
  const nav = useNavigate();
  const { stores, status } = useStores();
  const [category, setCategory] = useState("전체");
  const [openId, setOpenId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Record<string, Review | null>>({});

  // 평균 별점 → 후기 수 순
  const ranking = useMemo(
    () =>
      stores
        .filter((s) => toScore(s.avgRating) !== null)
        .filter((s) => category === "전체" || (s.category ?? []).includes(category))
        .sort(
          (a, b) =>
            (toScore(b.avgRating) ?? 0) - (toScore(a.avgRating) ?? 0) ||
            (b.reviewCount ?? 0) - (a.reviewCount ?? 0)
        )
        .slice(0, GRID),
    [stores, category]
  );

  const totalReviews = stores.reduce((acc, s) => acc + (s.reviewCount ?? 0), 0);
  const openIndex = ranking.findIndex((s) => s.id === openId);
  const openStore = openIndex >= 0 ? ranking[openIndex] : null;

  // 게시물을 열 때 최신 후기 1개 불러오기
  useEffect(() => {
    if (!openId || openId in reviews) return;
    getDocs(query(collection(db, "shops", openId, "reviews"), orderBy("createdAt", "desc"), limit(1)))
      .then((snap) => {
        const d = snap.docs[0];
        setReviews((prev) => ({ ...prev, [openId]: d ? ({ id: d.id, ...d.data() } as Review) : null }));
      })
      .catch(() => setReviews((prev) => ({ ...prev, [openId]: null })));
  }, [openId, reviews]);

  // 팝업: Esc 닫기, ←/→ 이전·다음 게시물
  useEffect(() => {
    if (!openStore) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
      if (e.key === "ArrowRight" && ranking[openIndex + 1]) setOpenId(ranking[openIndex + 1].id);
      if (e.key === "ArrowLeft" && ranking[openIndex - 1]) setOpenId(ranking[openIndex - 1].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openStore, openIndex, ranking]);

  const loading = status === "idle" || status === "loading";

  return (
    <div className="relative mx-auto h-full w-full max-w-175">
      <div className="h-full overflow-y-auto pb-36 pt-6">
        <div className="mx-auto max-w-lg px-4">
          {/* 프로필 영역 */}
          <section className="flex items-center gap-5">
            <div className="rounded-full bg-gradient-to-tr from-amber-300 via-rose-300 to-rose-400 p-[3px]">
              <img src="/dessert2.png" alt="" className="h-20 w-20 rounded-full border-[3px] border-[#fff9d4] object-cover sm:h-24 sm:w-24" />
            </div>
            <div className="flex flex-1 justify-around text-center">
              <div><p className="text-lg font-bold text-amber-950">{stores.length}</p><p className="text-xs text-amber-900/60">맛집</p></div>
              <div><p className="text-lg font-bold text-amber-950">{totalReviews}</p><p className="text-xs text-amber-900/60">후기</p></div>
              <div><p className="text-lg font-bold text-amber-950">TOP {GRID}</p><p className="text-xs text-amber-900/60">랭킹</p></div>
            </div>
          </section>
          <div className="mt-3">
            <h1 className="font-bold text-amber-950">🔥 지금 {CURRENT_REGION.name}에서 제일 달콤한 곳</h1>
            <p className="text-sm text-amber-900/60">킁킁 유저들의 별점으로 매긴 디저트 맛집 랭킹이에요</p>
          </div>

          {/* 카테고리 = 하이라이트 */}
          <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  category === c ? "bg-amber-950 text-white" : "bg-white text-amber-950/70 hover:bg-amber-100"
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 3 x 3 그리드 */}
        <div className="mx-auto mt-4 grid max-w-lg grid-cols-3 gap-1 border-t border-amber-900/10 pt-1 sm:gap-1.5">
          {loading
            ? Array.from({ length: GRID }, (_, i) => <div key={i} className="aspect-square animate-pulse bg-amber-100" />)
            : Array.from({ length: GRID }, (_, i) => {
                const s = ranking[i];
                return s ? <Tile key={s.id} store={s} rank={i + 1} onOpen={() => setOpenId(s.id)} /> : <EmptyTile key={`empty-${i}`} onClick={() => nav("/")} />;
              })}
        </div>
        {!loading && status === "error" && (
          <p className="mt-3 text-center text-sm text-amber-900/60">가게 정보를 불러오지 못했어요</p>
        )}

        {/* 킁킁이의 추천 */}
        <div className="mx-auto mt-8 max-w-lg px-4">
          <AiRecommend stores={stores} />
        </div>
      </div>

      {/* 게시물 팝업 */}
      {openStore && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={() => setOpenId(null)}
          role="dialog" aria-modal="true" aria-label={`${openStore.name} 게시물`}>
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[28px]" onClick={(e) => e.stopPropagation()}>
            <PostCard store={openStore} rank={openIndex + 1} review={reviews[openStore.id]} />
          </div>
          <button onClick={() => setOpenId(null)} className="absolute right-4 top-4 text-3xl text-white/80 hover:text-white" aria-label="닫기">✕</button>
          {ranking[openIndex - 1] && (
            <button onClick={(e) => { e.stopPropagation(); setOpenId(ranking[openIndex - 1].id); }}
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl shadow sm:left-6" aria-label="이전 게시물">‹</button>
          )}
          {ranking[openIndex + 1] && (
            <button onClick={(e) => { e.stopPropagation(); setOpenId(ranking[openIndex + 1].id); }}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl shadow sm:right-6" aria-label="다음 게시물">›</button>
          )}
        </div>
      )}

      <Bottombar />
    </div>
  );
}

function Tile({ store, rank, onOpen }: { store: Store; rank: number; onOpen: () => void }) {
  const look = lookOf(store.category);
  return (
    <button onClick={onOpen} aria-label={`${rank}위 ${store.name}`}
      className={`group relative aspect-square overflow-hidden bg-gradient-to-br ${look.bg}`}>
      <span className="absolute inset-0 flex items-center justify-center text-5xl transition duration-300 group-hover:scale-110 sm:text-6xl">
        {look.emoji[0]}
      </span>
      <span className={`absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
        rank === 1 ? "bg-amber-400 text-white" : rank <= 3 ? "bg-white text-amber-950" : "bg-white/70 text-amber-950/70"
      }`}>
        {rank}
      </span>
      {/* 이름은 항상, 별점·후기는 호버 시 */}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-2 pb-1.5 pt-5 text-left">
        <span className="block truncate text-xs font-bold text-white sm:text-sm">{store.name}</span>
      </span>
      <span className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 text-sm font-bold text-white opacity-0 transition group-hover:opacity-100">
        <span className="flex items-center gap-1"><StarIcon size={16} /> {formatScore(store.avgRating)}</span>
        <span>💬 {store.reviewCount ?? 0}</span>
      </span>
    </button>
  );
}

function EmptyTile({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex aspect-square flex-col items-center justify-center gap-1 bg-white/50 text-amber-900/40 transition hover:bg-white hover:text-amber-900/70">
      <span className="text-2xl">＋</span>
      <span className="text-[11px] font-medium">맛집 추천하기</span>
    </button>
  );
}
