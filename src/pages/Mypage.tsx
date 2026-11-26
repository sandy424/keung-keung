import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { auth, db } from "../firebase";
import useAuth from "../hooks/useAuth";
import useStores from "../hooks/useStores";
import type { Store } from "../types/store";
import { formatDate, formatScore } from "../utils/rating";
import { levelOf, ratingStyle, stampsOf, tasteOf } from "../utils/taste";
import { coverPhoto, lookOf } from "../components/hotplace/look";
import Bottombar from "../components/Bottombar";
import StarIcon from "../components/StarIcon";

type MyReview = {
  id: string;
  shopId: string;
  shopName: string;
  text: string;
  avg: number | null;
  createdAt?: { toDate: () => Date } | null;
};

const RECENT_REVIEWS = 3;

export default function Mypage() {
  const nav = useNavigate();
  const { user, nickname, loading } = useAuth();
  const { stores } = useStores();
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    Promise.all([
      getDocs(query(collection(db, "users", uid, "reviews"), orderBy("createdAt", "desc"))),
      getDocs(collection(db, "users", uid, "saved")),
    ])
      .then(([reviewSnap, savedSnap]) => {
        setReviews(reviewSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as MyReview));
        setSavedIds(savedSnap.docs.map((d) => d.data().shopId as string));
      })
      .catch((e) => console.error("마이페이지 불러오기 실패", e));
  }, [user]);

  // 가게 id → 가게 정보 (카테고리를 알아내기 위해)
  const storeById = useMemo(() => new Map(stores.map((s) => [s.id, s])), [stores]);
  const recommended = useMemo(() => stores.filter((s) => user && s.createdBy === user.uid), [stores, user]);

  const catsOf = (id: string) => storeById.get(id)?.category ?? [];
  const reviewedCats = reviews.map((r) => catsOf(r.shopId));

  const level = levelOf({ reviews: reviews.length, recommends: recommended.length, saves: savedIds.length });
  const stamp = stampsOf(reviewedCats);
  const taste = tasteOf([
    ...reviewedCats.map((categories) => ({ categories, weight: 2 })),
    ...recommended.map((s) => ({ categories: s.category ?? [], weight: 2 })),
    ...savedIds.map((id) => ({ categories: catsOf(id), weight: 1 })),
  ]);
  const style = ratingStyle(reviews.map((r) => r.avg));

  const handleLogout = async () => {
    await signOut(auth);
    nav("/");
  };

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, RECENT_REVIEWS);

  return (
    <div className="relative mx-auto h-full w-full max-w-175">
      <div className="h-full overflow-y-auto px-6 pb-36 pt-8">
        {loading ? null : !user ? (
          <div className="flex flex-col items-center gap-4 pt-20 text-center">
            <img src="/dessert2.png" alt="" className="w-36 rounded-full shadow-lg" />
            <p className="text-lg font-bold text-amber-950">로그인하고 나만의 디저트 지도를 만들어요</p>
            <p className="text-sm text-amber-900/60">디저트 도장을 모으고, 내 취향 리포트를 받아보세요</p>
            <div className="mt-2 flex gap-2">
              <button onClick={() => nav("/login", { state: { from: "/mypage" } })}
                className="rounded-full bg-amber-500 px-6 py-2.5 font-semibold text-white hover:bg-amber-600">로그인</button>
              <button onClick={() => nav("/signup")}
                className="rounded-full bg-white px-6 py-2.5 font-semibold text-amber-900 hover:bg-amber-100">회원가입</button>
            </div>
          </div>
        ) : (
          <>
            {/* 프로필 + 레벨 */}
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <img src="/dessert2.png" alt="" className="h-16 w-16 rounded-full object-cover" />
                  <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-base shadow" aria-hidden="true">
                    {level.current.emoji}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-amber-600">Lv.{level.level} {level.current.name}</p>
                  <p className="truncate text-xl font-bold text-gray-900">{nickname ?? "디저트 탐험가"}님</p>
                  <p className="truncate text-sm text-gray-500">{user.email}</p>
                </div>
                <button onClick={handleLogout} className="shrink-0 text-sm text-gray-400 hover:text-gray-700">로그아웃</button>
              </div>

              <div className="mt-5">
                <div className="h-2.5 overflow-hidden rounded-full bg-amber-100" role="progressbar"
                  aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level.progress * 100)} aria-label="다음 레벨까지 진행률">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-400 transition-all" style={{ width: `${level.progress * 100}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  {level.next
                    ? <>다음 레벨 <b className="text-gray-700">{level.next.emoji} {level.next.name}</b>까지 {level.remaining}점</>
                    : "최고 레벨이에요! 부산 디저트는 당신이 접수했어요 👑"}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400">후기·추천 +2점, 찜 +1점</p>
              </div>

              {/* 활동 숫자 */}
              <div className="mt-5 grid grid-cols-3 divide-x divide-gray-100 text-center">
                <button onClick={() => nav("/saved")} className="rounded-xl py-1 hover:bg-rose-50">
                  <p className="text-xl font-extrabold text-rose-500">{savedIds.length}</p>
                  <p className="text-xs text-gray-500">찜</p>
                </button>
                <a href="#my-reviews" className="rounded-xl py-1 hover:bg-amber-50">
                  <p className="text-xl font-extrabold text-amber-500">{reviews.length}</p>
                  <p className="text-xs text-gray-500">후기</p>
                </a>
                <a href="#my-recommends" className="rounded-xl py-1 hover:bg-emerald-50">
                  <p className="text-xl font-extrabold text-emerald-500">{recommended.length}</p>
                  <p className="text-xs text-gray-500">추천한 가게</p>
                </a>
              </div>
            </section>

            {/* 디저트 도장판 */}
            <section className="mt-4 rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-bold text-amber-950">디저트 도장판</h2>
                <span className="text-sm font-semibold text-rose-500">{stamp.count} / {stamp.total}</span>
              </div>
              <p className="text-xs text-gray-500">후기를 남기면 그 가게의 카테고리 도장이 찍혀요</p>
              <ul className="mt-4 grid grid-cols-3 gap-3">
                {stamp.stamps.map((s) => (
                  <li key={s.name} className="flex flex-col items-center gap-1">
                    <span className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl transition ${
                      s.stamped ? `bg-gradient-to-br ${s.look.bg} shadow-sm ring-2 ring-rose-300` : "border-2 border-dashed border-gray-200 grayscale opacity-30"
                    }`} aria-hidden="true">
                      {s.emoji}
                    </span>
                    <span className={`text-xs ${s.stamped ? "font-semibold text-gray-800" : "text-gray-400"}`}>
                      {s.name}<span className="sr-only">{s.stamped ? " 도장 받음" : " 아직 없음"}</span>
                    </span>
                  </li>
                ))}
              </ul>
              {stamp.count === stamp.total && (
                <p className="mt-4 rounded-2xl bg-rose-50 py-2 text-center text-sm font-semibold text-rose-500">🎉 모든 도장을 모았어요!</p>
              )}
            </section>

            {/* 취향 리포트 */}
            <section className="mt-4 rounded-3xl bg-gradient-to-br from-rose-50 to-amber-50 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-amber-950">나의 디저트 취향</h2>
              {taste ? (
                <>
                  <p className="mt-3 text-sm text-gray-600">나는</p>
                  <p className="text-2xl font-extrabold text-amber-950">
                    <span aria-hidden="true">{taste.type.emoji}</span> {taste.type.fan}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {taste.ranking.map((t) => (
                      <li key={t.name} className="flex items-center gap-3 text-sm">
                        <span className="w-20 shrink-0 text-gray-700">{t.emoji} {t.name}</span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                          <span className="block h-full rounded-full bg-rose-400" style={{ width: `${t.ratio * 100}%` }} />
                        </span>
                        <span className="w-10 shrink-0 text-right font-semibold text-gray-700">{Math.round(t.ratio * 100)}%</span>
                      </li>
                    ))}
                  </ul>
                  {style && (
                    <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/80 p-3">
                      <span className="text-2xl" aria-hidden="true">{style.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900">
                          {style.label} <span className="font-normal text-gray-500">· 평균 ★ {style.avg.toFixed(1)}</span>
                        </p>
                        <p className="text-xs text-gray-500">{style.desc}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  가게를 찜하거나 후기를 남기면 어떤 디저트를 좋아하는지 분석해 드려요 🔍
                </p>
              )}
            </section>

            {/* 내가 추천한 가게 */}
            <section id="my-recommends" className="mt-8 scroll-mt-4">
              <h2 className="mb-3 text-lg font-bold text-amber-950">내가 지도에 올린 가게</h2>
              {recommended.length === 0 ? (
                <button onClick={() => nav("/")}
                  className="w-full rounded-3xl border-2 border-dashed border-amber-200 bg-white/60 py-6 text-sm text-gray-500 hover:bg-white">
                  나만 아는 맛집이 있다면 지도에서 <b className="text-amber-700">＋ 추천하기</b>를 눌러보세요
                </button>
              ) : (
                <ul className="no-scrollbar -mx-6 flex gap-3 overflow-x-auto px-6 pb-1">
                  {recommended.map((s) => <RecommendCard key={s.id} store={s} onOpen={() => nav(`/shop/${s.id}`)} />)}
                </ul>
              )}
            </section>

            {/* 내 후기 */}
            <section id="my-reviews" className="mt-8 scroll-mt-4">
              <h2 className="mb-3 text-lg font-bold text-amber-950">내 후기</h2>
              {reviews.length === 0 ? (
                <p className="break-keep rounded-3xl bg-white/60 px-6 py-10 text-center text-sm text-gray-500">
                  아직 작성한 후기가 없어요. 첫 후기로 도장을 받아보세요!
                </p>
              ) : (
                <>
                  <ul className="space-y-3">
                    {visibleReviews.map((r) => (
                      <li key={r.id}>
                        <button onClick={() => nav(`/shop/${r.shopId}`)}
                          className="w-full rounded-3xl bg-white p-5 text-left shadow-sm transition hover:shadow-md">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-bold text-gray-900">{r.shopName}</span>
                            <span className="shrink-0 text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                          </div>
                          {r.avg != null && (
                            <span className="mt-1 flex items-center gap-1 text-sm font-semibold text-gray-700">
                              <StarIcon size={14} /> {Number(r.avg).toFixed(1)}
                            </span>
                          )}
                          <p className="mt-2 line-clamp-2 text-sm text-gray-600">{r.text}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {reviews.length > RECENT_REVIEWS && (
                    <button onClick={() => setShowAllReviews((v) => !v)}
                      className="mt-3 w-full rounded-full bg-white/70 py-2.5 text-sm font-medium text-amber-900 hover:bg-white">
                      {showAllReviews ? "접기" : `후기 ${reviews.length - RECENT_REVIEWS}개 더 보기`}
                    </button>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </div>
      <Bottombar />
    </div>
  );
}

function RecommendCard({ store, onOpen }: { store: Store; onOpen: () => void }) {
  const look = lookOf(store.category);
  const photo = coverPhoto(store);
  return (
    <li className="w-36 shrink-0">
      <button onClick={onOpen} className="w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm transition hover:shadow-md">
        <span className={`relative flex h-20 items-center justify-center overflow-hidden bg-gradient-to-br text-4xl ${look.bg}`} aria-hidden="true">
          {photo ? <img src={photo} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" /> : look.emoji[0]}
        </span>
        <span className="block p-3">
          <span className="block truncate text-sm font-bold text-gray-900">{store.name}</span>
          <span className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-0.5"><StarIcon size={12} /> {formatScore(store.avgRating)}</span>
            <span>💬 {store.reviewCount ?? 0}</span>
          </span>
        </span>
      </button>
    </li>
  );
}
