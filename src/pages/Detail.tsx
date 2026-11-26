import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useSaved from "../hooks/useSaved";
import useShop from "../hooks/useShop";
import { formatScore, summarize } from "../utils/rating";
import StoreDoc from "../components/StoreDoc";
import StoreMenu from "../components/StoreMenu";
import StoreReview from "../components/StoreReview";
import HeartIcon from "../components/HeartIcon";
import StarIcon from "../components/StarIcon";
import TagList from "../components/TagList";

const TABS = ["정보", "메뉴", "리뷰"] as const;
type Tab = (typeof TABS)[number];

export default function Detail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { store, reviews, status } = useShop(id);
  const { saved, toggle } = useSaved(store, user);
  const [tab, setTab] = useState<Tab>("정보");

  // hook은 항상 early return 위에서 호출
  const sectionRefs = {
    정보: useRef<HTMLElement>(null),
    메뉴: useRef<HTMLElement>(null),
    리뷰: useRef<HTMLElement>(null),
  };

  const handleTab = (t: Tab) => {
    setTab(t);
    sectionRefs[t].current?.scrollIntoView({ behavior: "smooth" });
  };

  if (status === "loading") {
    return (
      <div className="mx-auto flex h-full max-w-175 items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-900/10 border-t-amber-950" />
      </div>
    );
  }

  if (status !== "ready" || !store) {
    return (
      <div className="mx-auto flex h-full max-w-175 flex-col items-center justify-center gap-4 bg-white">
        <img src="/dessert1.png" alt="" className="w-24 rounded-full" />
        <p className="font-bold text-amber-950">
          {status === "notfound" ? "가게를 찾을 수 없어요" : "불러오기에 실패했어요"}
        </p>
        <button onClick={() => nav("/")} className="rounded-xl bg-amber-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-900">
          지도로 돌아가기
        </button>
      </div>
    );
  }

  const { avg, count } = summarize(reviews);

  return (
    <div className="relative mx-auto h-full w-full max-w-175 overflow-y-auto bg-white pb-28">
      <div className="flex items-center justify-between p-5">
        <button onClick={() => nav(-1)} className="rounded-full border border-amber-900/10 p-2 hover:bg-amber-50" aria-label="뒤로가기">
          <img src="/Last.svg" width={24} height={24} alt="" />
        </button>
      </div>

      <div className="px-6 sm:px-12">
        {/* 상단 - 가게 이름, 카테고리, 평균 별점, 후기 개수 */}
        <TagList store={store} />
        <div className="mt-3 flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-amber-950">{store.name}</h1>
          <button type="button" onClick={toggle}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-sm font-medium transition active:scale-95 ${
              saved ? "border-amber-950 bg-amber-950 text-white" : "border-amber-900/15 text-amber-950 hover:bg-amber-50"
            }`}>
            <HeartIcon filled={saved} size={18} />
            {saved ? "저장됨" : "저장하기"}
          </button>
        </div>
        <div className="mt-3 flex items-center gap-4 text-amber-950">
          <span className="flex items-center gap-1 text-lg font-bold">
            <StarIcon size={20} /> {formatScore(avg ?? store.avgRating)}
          </span>
          <span className="text-sm text-amber-900/50">후기 {count}개</span>
          {store.recommender && <span className="text-sm text-amber-900/40">· {store.recommender}님의 추천</span>}
        </div>

        {/* 탭 */}
        <div className="sticky top-0 z-10 mt-8 flex border-b border-amber-900/10 bg-white">
          {TABS.map((t) => (
            <button key={t} onClick={() => handleTab(t)}
              className={`flex-1 border-b-2 py-3 text-sm font-semibold transition ${
                tab === t ? "border-amber-950 text-amber-950" : "border-transparent text-amber-900/40"
              }`}>
              {t}
            </button>
          ))}
        </div>

        <section ref={sectionRefs.정보} className="scroll-mt-16 pt-8">
          <h2 className="mb-4 text-lg font-bold text-amber-950">정보</h2>
          <StoreDoc store={store} />
        </section>
        <section ref={sectionRefs.메뉴} className="scroll-mt-16 pt-14">
          <h2 className="mb-6 text-lg font-bold text-amber-950">메뉴</h2>
          <StoreMenu menus={store.menus} />
        </section>
        <section ref={sectionRefs.리뷰} className="scroll-mt-16 pt-14">
          <h2 className="mb-2 text-lg font-bold text-amber-950">리뷰 <span className="ml-1 text-base font-semibold text-amber-900/40">{count}</span></h2>
          <StoreReview reviews={reviews} />
        </section>
      </div>

      {/* 하단 - 후기 작성하기 */}
      <div className="sticky bottom-0 mt-10 bg-gradient-to-t from-white via-white to-transparent px-6 pb-6 pt-6">
        <button onClick={() => nav(`/shop/${store.id}/review`)}
          className="w-full rounded-xl bg-amber-950 py-4 font-semibold text-white transition hover:bg-amber-900 active:scale-[.98]">
          후기 작성하기
        </button>
      </div>
    </div>
  );
}
