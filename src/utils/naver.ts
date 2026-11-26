import type { Store } from "../types/store";

// 네이버 지도에서 가게 검색 결과 열기 (영업시간·메뉴·사진은 네이버에서 확인)
export const naverMapUrl = (store: Pick<Store, "name" | "address">) => {
  const district = store.address?.split(" ").slice(0, 2).join(" ") ?? "";
  return `https://map.naver.com/p/search/${encodeURIComponent(`${district} ${store.name}`.trim())}`;
};
