import type { Store } from "../types/store";

// 한글 초성 검색 지원 ("ㅋㅇㅋ" → 케이크)
const CHOSUNG = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;

const toChosung = (text: string) =>
  Array.from(text)
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code < HANGUL_START || code > HANGUL_END) return ch;
      return CHOSUNG[Math.floor((code - HANGUL_START) / 588)];
    })
    .join("");

const isChosungOnly = (text: string) => /^[ㄱ-ㅎ]+$/.test(text);

// 대소문자·공백·# 무시
export const normalize = (text: string) => text.toLowerCase().replace(/[\s#]/g, "");

const matches = (target: string, q: string) => {
  const t = normalize(target);
  if (!q) return false;
  return isChosungOnly(q) ? toChosung(t).includes(q) : t.includes(q);
};

export type MatchField = "이름" | "태그" | "메뉴" | "소개";
export type SearchHit = { store: Store; field: MatchField; text: string; score: number };

// 가게 이름 > 태그(카테고리 포함) > 메뉴 > 소개 순으로 우선순위
export function searchStores(stores: Store[], query: string): SearchHit[] {
  const q = normalize(query);
  if (!q) return [];

  const hits: SearchHit[] = [];
  for (const store of stores) {
    const candidates: { field: MatchField; text: string; score: number }[] = [
      { field: "이름", text: store.name ?? "", score: 4 },
      ...[...(store.category ?? []), ...(store.tags ?? [])].map((t) => ({ field: "태그" as const, text: t, score: 3 })),
      ...(store.menus ?? []).map((m) => ({ field: "메뉴" as const, text: m.name, score: 2 })),
      { field: "소개", text: store.description ?? "", score: 1 },
    ];
    const best = candidates.find((c) => c.text && matches(c.text, q));
    if (best) {
      // 이름이 검색어로 시작하면 가산점
      const bonus = normalize(best.text).startsWith(q) ? 0.5 : 0;
      hits.push({ store, field: best.field, text: best.text, score: best.score + bonus });
    }
  }
  return hits.sort((a, b) => b.score - a.score || a.store.name.localeCompare(b.store.name, "ko"));
}
