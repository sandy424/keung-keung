import { CATEGORY_LIST, categoryInfo } from "../config/categories";

// 마이페이지 계산 로직 (활동 레벨, 디저트 도장판, 취향 리포트)
// 화면과 분리해 두어 규칙을 바꾸기 쉽게 함

// ---------- 활동 레벨 ----------
export const POINTS = { review: 2, recommend: 2, save: 1 } as const;

export const LEVELS = [
  { min: 0, emoji: "🌱", name: "새싹 킁킁이" },
  { min: 5, emoji: "🍪", name: "디저트 입문자" },
  { min: 15, emoji: "🧁", name: "디저트 탐험가" },
  { min: 30, emoji: "🎂", name: "디저트 미식가" },
  { min: 60, emoji: "👑", name: "전설의 킁킁이" },
];

export type Activity = { reviews: number; recommends: number; saves: number };

export function levelOf({ reviews, recommends, saves }: Activity) {
  const points = reviews * POINTS.review + recommends * POINTS.recommend + saves * POINTS.save;
  const index = LEVELS.reduce((acc, l, i) => (points >= l.min ? i : acc), 0);
  const current = LEVELS[index];
  const next = LEVELS[index + 1] ?? null;
  // 다음 레벨까지 진행률 (0~1). 최고 레벨이면 1
  const progress = next ? (points - current.min) / (next.min - current.min) : 1;
  return { points, level: index + 1, current, next, progress, remaining: next ? next.min - points : 0 };
}

// ---------- 디저트 도장판 ----------
// 후기를 남긴 가게의 카테고리마다 도장 1개 (직접 가 본 곳만 인정)
export function stampsOf(reviewedCategories: string[][]) {
  const got = new Set(reviewedCategories.flat());
  const stamps = CATEGORY_LIST.map((c) => ({ ...c, stamped: got.has(c.name) }));
  return { stamps, count: stamps.filter((s) => s.stamped).length, total: stamps.length };
}

// ---------- 취향 리포트 ----------
// 후기·추천은 2점, 찜은 1점으로 카테고리별 점수를 매겨 비율 계산
export type Weighted = { categories: string[]; weight: number };

export function tasteOf(items: Weighted[]) {
  const score = new Map<string, number>();
  items.forEach(({ categories, weight }) =>
    categories.forEach((c) => score.set(c, (score.get(c) ?? 0) + weight))
  );
  const total = [...score.values()].reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  const ranking = [...score.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ ...categoryInfo(name), ratio: value / total }));

  return { type: ranking[0], ranking: ranking.slice(0, 3) };
}

// 내가 준 별점 평균으로 평가 스타일
export function ratingStyle(avgs: (number | null | undefined)[]) {
  const list = avgs.map(Number).filter((n) => Number.isFinite(n) && n > 0);
  if (list.length === 0) return null;
  const avg = list.reduce((a, b) => a + b, 0) / list.length;
  if (avg >= 4.3) return { avg, emoji: "😇", label: "칭찬 요정", desc: "웬만하면 별을 듬뿍 주는 편이에요" };
  if (avg <= 3.2) return { avg, emoji: "🧐", label: "깐깐한 미식가", desc: "별 하나도 쉽게 주지 않아요" };
  return { avg, emoji: "⚖️", label: "균형 잡힌 평가자", desc: "좋은 건 좋다, 아쉬운 건 아쉽다고 말해요" };
}
