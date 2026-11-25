import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import useAuth from "../hooks/useAuth";
import useShop from "../hooks/useShop";
import { loadStores } from "../hooks/useStores";
import type { Rating, RatingKey, Review } from "../types/store";
import { EMPTY_RATING, RATING_ITEMS, reviewAvg, summarize } from "../utils/rating";
import StarIcon from "../components/StarIcon";

const MAX_LENGTH = 500;
const SCORE_LABEL = ["", "별로예요", "그저 그래요", "괜찮아요", "맛있어요", "최고예요!"];

export default function ReviewWrite() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, nickname, loading } = useAuth();
  const { store, status } = useShop(id);

  const [rating, setRating] = useState<Rating>(EMPTY_RATING);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (loading || status === "loading") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
      </div>
    );
  }

  // 후기는 로그인 사용자만 작성 (마이페이지 '내 리뷰'와 연결하기 위해)
  if (!user) {
    return <Navigate to="/login" replace state={{ from: `/shop/${id}/review` }} />;
  }
  if (!store) return <Navigate to="/" replace />;

  const allRated = RATING_ITEMS.every(({ key }) => rating[key] > 0);
  const canSubmit = allRated && text.trim().length > 0 && !submitting;

  const handleRating = (key: RatingKey, n: number) => setRating((prev) => ({ ...prev, [key]: n }));

  const handleSubmit = async () => {
    if (!canSubmit || !id) return;
    setSubmitting(true);
    setError("");

    try {
      const reviewRef = await addDoc(collection(db, "shops", id, "reviews"), {
        text: text.trim(),
        rating,
        userId: user.uid,
        nickname: nickname ?? "익명",
        createdAt: serverTimestamp(),
      });

      // 전체 후기 기준으로 가게 평균 다시 계산 → shops 문서에 반영 (지도 카드·랭킹에서 재사용)
      const snap = await getDocs(collection(db, "shops", id, "reviews"));
      const { avg, items, count } = summarize(snap.docs.map((d) => d.data() as Review));
      await updateDoc(doc(db, "shops", id), {
        avgRating: avg,
        reviewCount: count,
        taste: items.taste,
        atmosphere: items.mood,
        kindness: items.kind,
        price: items.price,
      });

      // 내 리뷰 (users/{uid}/reviews) - 마이페이지용
      await setDoc(doc(db, "users", user.uid, "reviews", reviewRef.id), {
        shopId: id,
        shopName: store.name,
        reviewId: reviewRef.id,
        text: text.trim(),
        avg: reviewAvg(rating),
        createdAt: serverTimestamp(),
      });

      loadStores(true); // 지도·랭킹의 평균 별점 갱신
      nav(`/shop/${id}`, { replace: true });
    } catch (e) {
      console.error("리뷰 저장 실패", e);
      setError("리뷰 저장에 실패했어요. 다시 시도해 주세요.");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto h-full w-full max-w-175 overflow-y-auto bg-white">
      <div className="flex items-center gap-3 p-5">
        <button onClick={() => nav(-1)} className="rounded-full bg-gray-100 p-2" aria-label="뒤로가기">
          <img src="/Last.svg" width={24} height={24} alt="" />
        </button>
        <span className="font-semibold text-gray-500">후기 작성</span>
      </div>

      <div className="px-6 pb-10 sm:px-12">
        <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
        <p className="mt-1 text-gray-500">어떠셨나요? 솔직한 후기를 들려주세요 🍰</p>

        {/* 별점 입력 (1~5) */}
        <div className="mt-8 space-y-5 rounded-3xl bg-amber-50/70 p-6">
          {RATING_ITEMS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="w-14 font-semibold text-gray-800">{label}</span>
              <div className="flex gap-1" role="radiogroup" aria-label={`${label} 별점`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" role="radio" aria-checked={rating[key] === n}
                    aria-label={`${n}점`} onClick={() => handleRating(key, n)}
                    className="transition hover:scale-110 active:scale-90">
                    <StarIcon filled={n <= rating[key]} size={30} />
                  </button>
                ))}
              </div>
              <span className="hidden w-20 text-right text-sm text-amber-700 sm:block">
                {SCORE_LABEL[rating[key]]}
              </span>
            </div>
          ))}
        </div>

        {/* 후기 텍스트 (최대 500자) */}
        <div className="mt-6">
          <textarea value={text} maxLength={MAX_LENGTH}
            onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
            placeholder="디저트 맛, 분위기, 추천 메뉴를 자유롭게 적어주세요"
            className="h-44 w-full resize-none rounded-2xl border border-gray-200 p-4 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100" />
          <p className={`mt-1 text-right text-sm ${text.length >= MAX_LENGTH ? "text-rose-500" : "text-gray-400"}`}>
            {text.length} / {MAX_LENGTH}
          </p>
        </div>

        {!allRated && <p className="text-sm text-gray-400">모든 항목의 별점을 선택해 주세요.</p>}
        {error && <p className="text-sm text-rose-500">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button onClick={() => nav(-1)} className="flex-1 rounded-2xl bg-gray-100 py-4 font-semibold text-gray-600 hover:bg-gray-200">
            취소
          </button>
          <button onClick={handleSubmit} disabled={!canSubmit}
            className="flex-[2] rounded-2xl bg-amber-500 py-4 font-bold text-white transition hover:bg-amber-600 disabled:opacity-40">
            {submitting ? "등록 중..." : "등록하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
