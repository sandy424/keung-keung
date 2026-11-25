import type { Rating, RatingKey, Review } from "../types/store";

export const RATING_ITEMS: { key: RatingKey; label: string }[] = [
  { key: "taste", label: "맛" },
  { key: "mood", label: "분위기" },
  { key: "kind", label: "친절" },
  { key: "price", label: "가격" },
];

export const EMPTY_RATING: Rating = { taste: 0, mood: 0, kind: 0, price: 0 };

// 리뷰 1개의 평균 별점
export function reviewAvg(rating?: Rating): number | null {
  if (!rating) return null;
  const values = RATING_ITEMS.map(({ key }) => Number(rating[key]) || 0);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// 리뷰 목록 → 전체 평균, 항목별 평균, 개수
export function summarize(list: Review[]) {
  const rated = list.filter((r) => r.rating);
  const items = { ...EMPTY_RATING };
  if (rated.length === 0) {
    return { avg: null as number | null, items, count: list.length };
  }
  RATING_ITEMS.forEach(({ key }) => {
    const sum = rated.reduce((acc, r) => acc + (Number(r.rating![key]) || 0), 0);
    items[key] = round1(sum / rated.length);
  });
  const total = rated.reduce((acc, r) => acc + (reviewAvg(r.rating) ?? 0), 0);
  return { avg: round1(total / rated.length), items, count: list.length };
}

export const round1 = (n: number) => Math.round(n * 10) / 10;

// Firestore에 문자열/숫자/null 섞여 저장된 avgRating을 숫자로 통일
export const toScore = (v: unknown): number | null => {
  const n = Number(v);
  return v === null || v === undefined || v === "" || Number.isNaN(n) ? null : n;
};

export const formatScore = (v: unknown) => {
  const n = toScore(v);
  return n === null ? "-" : n.toFixed(1);
};

export const formatDate = (ts?: { toDate: () => Date } | null) =>
  ts?.toDate?.().toLocaleDateString("ko-KR") ?? "";
