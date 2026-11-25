import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import type { Store } from "../types/store";
import { formatScore, toScore } from "../utils/rating";
import Bottombar from "../components/Bottombar";
import StarIcon from "../components/StarIcon";

const CATEGORIES = ["전체", "빵", "케이크", "타르트", "구움과자", "기타"];
const MEDAL = ["🥇", "🥈", "🥉"];

// 핫플레이스 - 평점 랭킹 (평균 별점 → 후기 수 순)
export default function Hotplace() {
  const nav = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("전체");

  useEffect(() => {
    getDocs(collection(db, "shops"))
      .then((snap) => setStores(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Store, "id">) }))))
      .catch((e) => console.error("랭킹 불러오기 실패", e))
      .finally(() => setLoading(false));
  }, []);

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

  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <div className="relative mx-auto h-full w-full max-w-175">
      <div className="h-full overflow-y-auto px-6 pb-36 pt-8">
        <p className="text-sm font-semibold text-rose-500">🔥 HOT PLACE</p>
        <h1 className="mt-1 text-2xl font-bold text-amber-950">지금 부산에서 제일 달콤한 곳</h1>
        <p className="mt-1 text-sm text-amber-900/60">킁킁 유저들의 별점으로 매긴 디저트 맛집 랭킹이에요</p>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                category === c ? "bg-amber-950 text-white" : "bg-white text-amber-950/70 hover:bg-amber-100"
              }`}>
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-3xl bg-amber-100" />)}
          </div>
        ) : ranking.length === 0 ? (
          <div className="flex flex-col items-center gap-4 pt-16 text-center">
            <img src="/dessert1.png" alt="" className="w-32 rounded-full" />
            <p className="font-bold text-amber-950">아직 랭킹에 오른 가게가 없어요</p>
            <p className="text-sm text-amber-900/60">후기를 남기면 랭킹에 반영돼요!</p>
          </div>
        ) : (
          <>
            {/* TOP 3 */}
            <ol className="mt-6 space-y-3">
              {top3.map((s, i) => (
                <li key={s.id}>
                  <button onClick={() => nav(`/shop/${s.id}`)}
                    className={`flex w-full items-center gap-4 rounded-3xl p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      i === 0 ? "bg-gradient-to-br from-amber-300 to-rose-300" : "bg-white"
                    }`}>
                    <span className="text-4xl">{MEDAL[i]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-bold text-gray-900">{s.name}</p>
                      <p className="truncate text-sm text-gray-700/80">{(s.category ?? []).join(" · ")}</p>
                    </div>
                    <div className="text-right">
                      <p className="flex items-center justify-end gap-1 text-xl font-extrabold text-gray-900">
                        <StarIcon size={20} /> {formatScore(s.avgRating)}
                      </p>
                      <p className="text-xs text-gray-700/70">후기 {s.reviewCount ?? 0}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ol>

            {rest.length > 0 && (
              <ol start={4} className="mt-6 divide-y divide-amber-100 rounded-3xl bg-white px-5">
                {rest.map((s, i) => (
                  <li key={s.id}>
                    <button onClick={() => nav(`/shop/${s.id}`)} className="flex w-full items-center gap-4 py-4 text-left">
                      <span className="w-6 text-center font-bold text-amber-900/50">{i + 4}</span>
                      <span className="flex-1 truncate font-medium text-gray-900">{s.name}</span>
                      <span className="flex items-center gap-1 text-sm font-semibold">
                        <StarIcon size={14} /> {formatScore(s.avgRating)}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </div>
      <Bottombar />
    </div>
  );
}
