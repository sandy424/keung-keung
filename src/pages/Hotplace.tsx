import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Store } from "../types/store";
import { formatScore, rankStores } from "../utils/rating";
import { CURRENT_REGION } from "../config/region";
import { ALL, FILTER_CATEGORIES } from "../config/categories";
import useStores from "../hooks/useStores";
import Bottombar from "../components/Bottombar";
import StarIcon from "../components/StarIcon";
import AiRecommend from "../components/hotplace/AiRecommend";
import { coverPhoto, lookOf } from "../components/hotplace/look";

const GRID = 9; // 3 x 3

// 핫플레이스 - 인스타그램 프로필 형태의 3x3 랭킹 (칸 클릭 → 가게 상세) + 킁킁이의 추천
export default function Hotplace() {
  const nav = useNavigate();
  const { stores, status } = useStores();
  const [category, setCategory] = useState(ALL);

  // 평균 별점 → 후기 수 순
  const ranking = useMemo(
    () =>
      rankStores(stores.filter((s) => category === ALL || (s.category ?? []).includes(category))).slice(0, GRID),
    [stores, category]
  );

  const totalReviews = stores.reduce((acc, s) => acc + (s.reviewCount ?? 0), 0);
  const loading = status === "idle" || status === "loading";

  return (
    <div className="relative mx-auto h-full w-full max-w-175">
      <div className="no-scrollbar h-full overflow-y-auto pb-36 pt-6">
        <div className="mx-auto max-w-lg px-4">
          {/* 프로필 영역 */}
          <section className="flex items-center gap-5">
            <img src="/dessert2.png" alt="" className="h-20 w-20 shrink-0 rounded-full object-cover ring-1 ring-amber-900/10 sm:h-24 sm:w-24" />
            <div className="flex flex-1 justify-around text-center">
              <div><p className="text-lg font-bold text-amber-950">{stores.length}</p><p className="text-xs text-amber-900/60">맛집</p></div>
              <div><p className="text-lg font-bold text-amber-950">{totalReviews}</p><p className="text-xs text-amber-900/60">후기</p></div>
              <div><p className="text-lg font-bold text-amber-950">TOP {GRID}</p><p className="text-xs text-amber-900/60">랭킹</p></div>
            </div>
          </section>
          <div className="mt-3">
            <h1 className="font-bold text-amber-950">지금 {CURRENT_REGION.name}에서 제일 달콤한 곳</h1>
            <p className="text-sm text-amber-900/60">킁킁 유저들의 별점으로 매긴 디저트 맛집 랭킹이에요</p>
          </div>

          {/* 카테고리 = 하이라이트 */}
          <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {FILTER_CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`shrink-0 rounded-lg border px-3.5 py-1.5 text-sm font-medium transition ${
                  category === c ? "border-amber-950 bg-amber-950 text-white" : "border-amber-900/15 bg-white text-amber-900/70 hover:bg-amber-50"
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 3 x 3 그리드 */}
        <div className="mx-auto mt-4 grid max-w-lg grid-cols-3 gap-1 border-t border-amber-900/10 pt-1 sm:gap-1.5">
          {loading
            ? Array.from({ length: GRID }, (_, i) => <div key={i} className="aspect-square animate-pulse bg-amber-900/5" />)
            : Array.from({ length: GRID }, (_, i) => {
                const s = ranking[i];
                return s ? <Tile key={s.id} store={s} rank={i + 1} onOpen={() => nav(`/shop/${s.id}`)} /> : <EmptyTile key={`empty-${i}`} onClick={() => nav("/")} />;
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

      <Bottombar />
    </div>
  );
}

function Tile({ store, rank, onOpen }: { store: Store; rank: number; onOpen: () => void }) {
  const look = lookOf(store.category);
  const photo = coverPhoto(store);
  return (
    <button onClick={onOpen} aria-label={`${rank}위 ${store.name}`}
      className={`group relative aspect-square overflow-hidden bg-gradient-to-br ${look.bg}`}>
      {photo ? (
        <img src={photo} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-110" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-5xl transition duration-300 group-hover:scale-110 sm:text-6xl">
          {look.emoji[0]}
        </span>
      )}
      <span className={`absolute left-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${
        rank <= 3 ? "bg-amber-950 text-white" : "bg-white/80 text-amber-950/70"
      }`}>
        {rank}
      </span>
      {/* 이름은 항상, 별점·후기는 호버 시 */}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-2 pb-1.5 pt-5 text-left">
        <span className="block truncate text-xs font-bold text-white sm:text-sm">{store.name}</span>
      </span>
      <span className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 text-sm font-bold text-white opacity-0 transition group-hover:opacity-100">
        <span className="flex items-center gap-1"><StarIcon size={16} /> {formatScore(store.avgRating)}</span>
        <span>후기 {store.reviewCount ?? 0}</span>
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
