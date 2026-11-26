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

// 받침 유무에 따라 을/를
const objectJosa = (word: string) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0 ? "을" : "를";
};

const card = "rounded-2xl border border-amber-900/10 bg-white";

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
      <div className="no-scrollbar h-full overflow-y-auto px-5 pb-36 pt-10 sm:px-8">
        {loading ? null : !user ? (
          <div className="flex flex-col items-center pt-24 text-center">
            <img src="/dessert2.png" alt="" className="h-20 w-20 rounded-full object-cover" />
            <p className="mt-6 text-lg font-bold text-amber-950">로그인하고 나만의 디저트 지도를 만들어요</p>
            <p className="mt-1 text-sm text-amber-900/60">다녀온 가게와 취향을 한곳에 모아볼 수 있어요</p>
            <div className="mt-8 flex w-full max-w-xs flex-col gap-2">
              <button onClick={() => nav("/login", { state: { from: "/mypage" } })}
                className="rounded-xl bg-amber-950 py-3 text-sm font-semibold text-white hover:bg-amber-900">로그인</button>
              <button onClick={() => nav("/signup")}
                className="rounded-xl border border-amber-900/15 bg-white py-3 text-sm font-semibold text-amber-950 hover:bg-amber-50">회원가입</button>
            </div>
          </div>
        ) : (
          <>
            {/* 프로필 */}
            <header className="flex items-center gap-4">
              <img src="/dessert2.png" alt="" className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-amber-900/10" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xl font-bold text-amber-950">{nickname ?? "디저트 탐험가"}</p>
                <p className="truncate text-sm text-amber-900/50">{user.email}</p>
              </div>
              <button onClick={handleLogout} className="shrink-0 text-sm text-amber-900/40 underline-offset-4 hover:text-amber-950 hover:underline">
                로그아웃
              </button>
            </header>

            {/* 레벨 + 활동 */}
            <section className={`${card} mt-6`}>
              <div className="p-5">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-semibold text-amber-950">
                    Lv.{level.level} <span className="ml-1 font-normal text-amber-900/60">{level.current.name}</span>
                  </p>
                  <p className="text-xs tabular-nums text-amber-900/40">{level.points}점</p>
                </div>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-amber-900/10" role="progressbar"
                  aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level.progress * 100)} aria-label="다음 레벨까지 진행률">
                  <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${Math.max(level.progress * 100, 2)}%` }} />
                </div>
                <p className="mt-2 text-xs text-amber-900/50">
                  {level.next ? `다음 레벨 '${level.next.name}'까지 ${level.remaining}점 · 후기·추천 2점, 찜 1점` : "최고 레벨에 도달했어요"}
                </p>
              </div>
              <div className="grid grid-cols-3 divide-x divide-amber-900/10 border-t border-amber-900/10">
                <Stat label="찜" value={savedIds.length} onClick={() => nav("/saved")} />
                <Stat label="후기" value={reviews.length} href="#my-reviews" />
                <Stat label="추천한 가게" value={recommended.length} href="#my-recommends" />
              </div>
            </section>

            {/* 취향 분석 */}
            <Section title="취향 분석">
              <div className={`${card} p-5`}>
                {taste ? (
                  <>
                    <p className="text-xs font-medium text-amber-900/50">나의 디저트 타입</p>
                    <p className="mt-1 text-2xl font-extrabold tracking-tight text-amber-950">
                      {taste.type.fan}<span className="ml-1.5 text-xl" aria-hidden="true">{taste.type.emoji}</span>
                    </p>
                    <p className="mt-1 text-sm text-amber-900/60">
                      주로 <b className="font-semibold text-amber-700">{taste.type.name}</b>{objectJosa(taste.type.name)} 즐겨요
                    </p>
                    <ul className="mt-5 space-y-3">
                      {taste.ranking.map((t) => (
                        <li key={t.name}>
                          <div className="flex justify-between text-sm">
                            <span className="text-amber-950">{t.name}</span>
                            <span className="tabular-nums text-amber-900/50">{Math.round(t.ratio * 100)}%</span>
                          </div>
                          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-amber-900/10">
                            <div className="h-full rounded-full bg-amber-950" style={{ width: `${t.ratio * 100}%` }} />
                          </div>
                        </li>
                      ))}
                    </ul>
                    {style && (
                      <div className="mt-5 flex items-center justify-between border-t border-amber-900/10 pt-4 text-sm">
                        <div>
                          <p className="font-semibold text-amber-950">{style.label}</p>
                          <p className="text-xs text-amber-900/50">{style.desc}</p>
                        </div>
                        <span className="flex shrink-0 items-center gap-1 font-semibold tabular-nums text-amber-950">
                          <StarIcon size={14} /> {style.avg.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-amber-900/50">가게를 찜하거나 후기를 남기면 취향을 분석해 드려요.</p>
                )}
              </div>
            </Section>

            {/* 카테고리 컬렉션 */}
            <Section title="카테고리 컬렉션" meta={`${stamp.count} / ${stamp.total}`}>
              <div className={`${card} p-5`}>
                <p className="text-xs text-amber-900/50">후기를 남긴 가게의 카테고리가 채워져요</p>
                <ul className="mt-4 grid grid-cols-3 gap-2">
                  {stamp.stamps.map((s) => (
                    <li key={s.name}
                      className={`rounded-xl py-2.5 text-center text-sm transition ${
                        s.stamped ? "bg-amber-950 font-semibold text-white" : "border border-dashed border-amber-900/15 text-amber-900/35"
                      }`}>
                      {s.name}
                      <span className="sr-only">{s.stamped ? " 완료" : " 미완료"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Section>

            {/* 내가 추천한 가게 */}
            <Section id="my-recommends" title="내가 지도에 올린 가게" meta={recommended.length ? `${recommended.length}곳` : undefined}>
              {recommended.length === 0 ? (
                <EmptyRow text="아직 추천한 가게가 없어요" action="지도에서 추천하기" onClick={() => nav("/")} />
              ) : (
                <ul className={`${card} divide-y divide-amber-900/10`}>
                  {recommended.map((s) => <StoreRow key={s.id} store={s} onOpen={() => nav(`/shop/${s.id}`)} />)}
                </ul>
              )}
            </Section>

            {/* 내 후기 */}
            <Section id="my-reviews" title="내 후기" meta={reviews.length ? `${reviews.length}개` : undefined}>
              {reviews.length === 0 ? (
                <EmptyRow text="아직 작성한 후기가 없어요" action="가게 둘러보기" onClick={() => nav("/hotplace")} />
              ) : (
                <div className={card}>
                  <ul className="divide-y divide-amber-900/10">
                    {visibleReviews.map((r) => (
                      <li key={r.id}>
                        <button onClick={() => nav(`/shop/${r.shopId}`)} className="w-full px-5 py-4 text-left transition hover:bg-amber-50/60">
                          <div className="flex items-center justify-between gap-3">
                            <span className="truncate font-semibold text-amber-950">{r.shopName}</span>
                            {r.avg != null && (
                              <span className="flex shrink-0 items-center gap-1 text-sm font-semibold tabular-nums text-amber-950">
                                <StarIcon size={13} /> {Number(r.avg).toFixed(1)}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm text-amber-900/70">{r.text}</p>
                          <p className="mt-2 text-xs text-amber-900/40">{formatDate(r.createdAt)}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {reviews.length > RECENT_REVIEWS && (
                    <button onClick={() => setShowAllReviews((v) => !v)}
                      className="w-full border-t border-amber-900/10 py-3 text-sm text-amber-900/60 hover:text-amber-950">
                      {showAllReviews ? "접기" : `${reviews.length - RECENT_REVIEWS}개 더 보기`}
                    </button>
                  )}
                </div>
              )}
            </Section>
          </>
        )}
      </div>
      <Bottombar />
    </div>
  );
}

function Section({ id, title, meta, children }: { id?: string; title: string; meta?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-10 scroll-mt-4">
      <div className="mb-3 flex items-baseline justify-between px-1">
        <h2 className="text-base font-bold text-amber-950">{title}</h2>
        {meta && <span className="text-sm tabular-nums text-amber-900/50">{meta}</span>}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, href, onClick }: { label: string; value: number; href?: string; onClick?: () => void }) {
  const inner = (
    <>
      <span className="block text-xl font-bold tabular-nums text-amber-950">{value}</span>
      <span className="mt-0.5 block text-xs text-amber-900/50">{label}</span>
    </>
  );
  const cls = "block py-4 text-center transition hover:bg-amber-50/60";
  return href ? <a href={href} className={cls}>{inner}</a> : <button onClick={onClick} className={`${cls} w-full`}>{inner}</button>;
}

function EmptyRow({ text, action, onClick }: { text: string; action: string; onClick: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-dashed border-amber-900/15 px-5 py-4 text-sm">
      <span className="text-amber-900/50">{text}</span>
      <button onClick={onClick} className="shrink-0 font-semibold text-amber-950 underline-offset-4 hover:underline">{action}</button>
    </div>
  );
}

function StoreRow({ store, onOpen }: { store: Store; onOpen: () => void }) {
  const look = lookOf(store.category);
  const photo = coverPhoto(store);
  return (
    <li>
      <button onClick={onOpen} className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-amber-50/60">
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-amber-50 text-xl" aria-hidden="true">
          {photo ? <img src={photo} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" /> : look.emoji[0]}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-amber-950">{store.name}</span>
          <span className="block truncate text-xs text-amber-900/50">{(store.category ?? []).join(" · ")}</span>
        </span>
        <span className="shrink-0 text-right text-xs tabular-nums text-amber-900/50">
          <span className="flex items-center justify-end gap-1 text-sm font-semibold text-amber-950"><StarIcon size={13} /> {formatScore(store.avgRating)}</span>
          후기 {store.reviewCount ?? 0}
        </span>
      </button>
    </li>
  );
}
