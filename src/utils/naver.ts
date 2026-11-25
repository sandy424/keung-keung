import type { Store } from "../types/store";

// 네이버 지도에서 가게 검색 결과 열기 (영업시간·메뉴·사진은 네이버에서 확인)
export const naverMapUrl = (store: Pick<Store, "name" | "address">) => {
  const district = store.address?.split(" ").slice(0, 2).join(" ") ?? "";
  return `https://map.naver.com/p/search/${encodeURIComponent(`${district} ${store.name}`.trim())}`;
};

// 네이버 업종 분류 → 킁킁 카테고리 추정
export function guessCategories(naverCategory: string): string[] {
  const c = naverCategory;
  const result = new Set<string>();
  if (/케이크/.test(c)) result.add("케이크");
  if (/타르트|파이/.test(c)) result.add("타르트");
  if (/쿠키|마카롱|구움|과자|휘낭시에|스콘/.test(c)) result.add("구움과자");
  if (/베이커리|제과|빵|도넛|베이글/.test(c)) result.add("빵");
  return [...result];
}
