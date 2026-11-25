import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import type { Review } from "../types/store";
import { toScore } from "../utils/rating";
import { CURRENT_REGION } from "../config/region";
import useStores from "../hooks/useStores";
import Bottombar from "../components/Bottombar";
import PostCard from "../components/hotplace/PostCard";
import AiRecommend from "../components/hotplace/AiRecommend";

const CATEGORIES = ["전체", "빵", "케이크", "타르트", "구움과자", "기타"];
const PAGE = 5;

// 핫플레이스 - 평점 랭킹 피드 + AI 추천
export default function Hotplace() {
  const { stores, status } = useStores();
  const [category, setCategory] = useState("전체");
  const [visible, setVisible] = useState(PAGE);
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
        ),
    [stores, category]
  );
  const posts = useMemo(() => ranking.slice(0, visible), [ranking, visible]);

  // 보이는 게시물의 최신 후기 1개씩 (게시물 본문용)
  useEffect(() => {
    const missing = posts.filter((s) => !(s.id in reviews));
    if (missing.length === 0) return;
    Promise.all(
      missing.map(async (s) => {
        try {
          const snap = await getDocs(query(collection(db, "shops", s.id, "reviews"), orderBy("createdAt", "desc"), limit(1)));
          const d = snap.docs[0];
          return [s.id, d ? ({ id: d.id, ...d.data() } as Review) : null] as const;
        } catch {
          return [s.id, null] as const;
        }
      })
    ).then((entries) => setReviews((prev) => ({ ...prev, ...Object.fromEntries(entries) })));
  }, [posts, reviews]);

  return (
    <div className="relative mx-auto h-full w-full max-w-175">
      <div className="h-full overflow-y-auto px-4 pb-36 pt-8 sm:px-6">
        <p className="text-sm font-semibold text-rose-500">🔥 HOT PLACE</p>
        <h1 className="mt-1 text-2xl font-bold text-amber-950">지금 {CURRENT_REGION.name}에서 제일 달콤한 곳</h1>
        <p className="mt-1 text-sm text-amber-900/60">킁킁 유저들의 별점으로 매긴 디저트 맛집 랭킹이에요</p>

        <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => { setCategory(c); setVisible(PAGE); }}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                category === c ? "bg-amber-950 text-white" : "bg-white text-amber-950/70 hover:bg-amber-100"
              }`}>
              {c}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-5 max-w-lg space-y-6">
          {/* 랭킹 피드 */}
          {status === "idle" || status === "loading" ? (
            [0, 1].map((i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-[28px] bg-amber-100" />)
          ) : ranking.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-[28px] bg-white/60 py-12 text-center">
              <img src="/dessert1.png" alt="" className="w-28 rounded-full" />
              <p className="font-bold text-amber-950">
                {status === "error" ? "가게 정보를 불러오지 못했어요" : "아직 랭킹에 오른 가게가 없어요"}
              </p>
              <p className="text-sm text-amber-900/60">후기를 남기면 랭킹에 반영돼요!</p>
            </div>
          ) : (
            <>
              {posts.map((s, i) => <PostCard key={s.id} store={s} rank={i + 1} review={reviews[s.id]} />)}
              {visible < ranking.length && (
                <button onClick={() => setVisible((v) => v + PAGE)}
                  className="w-full rounded-full bg-white py-3 text-sm font-semibold text-amber-900 shadow-sm hover:bg-amber-50">
                  랭킹 더 보기 ({ranking.length - visible}곳 남음)
                </button>
              )}
            </>
          )}

          {/* AI 추천 */}
          <div className="pt-4">
            <AiRecommend stores={stores} />
          </div>
        </div>
      </div>
      <Bottombar />
    </div>
  );
}
