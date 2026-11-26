import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import type { Review, Store } from "../types/store";
import { EMPTY_RATING, RATING_ITEMS, formatScore, summarize } from "../utils/rating";
import useAuth from "../hooks/useAuth";
import useSaved from "../hooks/useSaved";
import HeartIcon from "./HeartIcon";
import StarIcon from "./StarIcon";
import TagList from "./TagList";

type Props = { store: Store | null; onClose: () => void };

// 지도 핀 클릭 시 뜨는 미니 카드
export default function StoreCard({ store, onClose }: Props) {
  const nav = useNavigate();
  const { user } = useAuth();
  const { saved, toggle } = useSaved(store, user);

  const [summary, setSummary] = useState({
    avg: null as number | null,
    items: EMPTY_RATING,
    count: 0,
    latest: "",
  });

  // 리뷰 한 번만 불러와서 평균·개수·항목별 점수·한 줄 후기 계산
  useEffect(() => {
    if (!store?.id) return;
    let alive = true;
    const fetchReviews = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "shops", store.id, "reviews"), orderBy("createdAt", "desc"))
        );
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Review);
        if (!alive) return;
        setSummary({ ...summarize(list), latest: list.find((r) => r.text)?.text ?? "" });
      } catch (e) {
        console.error("리뷰 불러오기 실패", e);
      }
    };
    fetchReviews();
    return () => {
      alive = false;
    };
  }, [store?.id]);

  useEffect(() => {
    if (!store) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [store, onClose]);

  if (!store) return null;

  return (
    // 지도 정가운데에 카드 표시, 바깥(배경) 클릭 시 닫기
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-amber-950/10 p-4" onClick={onClose}>
      <div role="dialog" aria-label={`${store.name} 정보`} onClick={(e) => e.stopPropagation()}
        className="max-h-full w-full max-w-[360px] animate-[cardPop_.3s_cubic-bezier(.2,.9,.3,1.2)] overflow-y-auto rounded-2xl border border-amber-900/10 bg-white p-6 shadow-xl shadow-amber-950/10">
        <div className="flex items-center justify-between">
          <TagList store={store} max={5} />
          <button className="text-amber-900/40 hover:text-amber-950" onClick={onClose} aria-label="닫기">✕</button>
        </div>
  
        <div className="mt-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-amber-950">{store.name}</h2>
          <button type="button" onClick={toggle} aria-label={saved ? "저장 취소" : "저장하기"}
            className="rounded-full p-1.5 text-amber-900/50 transition hover:bg-amber-50 active:scale-90">
            <HeartIcon filled={saved} />
          </button>
        </div>
  
        {store.recommender && <p className="mt-0.5 text-xs text-amber-900/50">{store.recommender}님의 추천</p>}
  
        <div className="mt-2 flex items-center gap-3 text-sm text-amber-900/60">
          <span className="flex items-center gap-1 font-semibold text-amber-950">
            <StarIcon /> {formatScore(summary.avg ?? store.avgRating)}
          </span>
          <span>후기 {summary.count}개</span>
          <span className="text-amber-900/20">|</span>
          <span className="truncate">{store.hours || "영업시간 정보 없음"}</span>
        </div>
  
        {/* 한 줄 후기 */}
        <p className="mt-4 truncate border-l-2 border-amber-400 bg-amber-50/60 px-4 py-3 text-sm text-amber-900/80">
          {summary.latest ? `“${summary.latest}”` : "아직 후기가 없어요. 첫 후기를 남겨주세요!"}
        </p>
  
        {/* 항목별 점수 */}
        <div className="mt-4 space-y-2">
          {RATING_ITEMS.map(({ label, key }) => {
            const pct = Math.round((summary.items[key] / 5) * 100);
            return (
              <div key={key} className="flex items-center gap-3">
                <p className="w-12 text-xs text-amber-900/60">{label}</p>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-amber-900/10">
                  <div className="h-full rounded-full bg-amber-950 transition-all duration-700"
                    style={{ width: `${pct}%` }} />
                </div>
                <span className="w-10 text-right text-xs tabular-nums text-amber-900/50">{pct}%</span>
              </div>
            );
          })}
        </div>
  
        <button onClick={() => nav(`/shop/${store.id}`)}
          className="mt-5 w-full rounded-xl bg-amber-950 py-3 text-sm font-semibold text-white transition hover:bg-amber-900">
          상세보기
        </button>
      </div>
    </div>
  );
}
