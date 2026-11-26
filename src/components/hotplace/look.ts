import { categoryInfo } from "../../config/categories";

// 카테고리별 게시물 비주얼 (가게 사진이 없어서 일러스트 톤으로 표현)
export const lookOf = (category?: string[]) => categoryInfo(category?.[0]).look;

// 첫 번째 메뉴 사진을 대표 사진으로 사용
export const coverPhoto = (store: { menus?: { photo?: string | null }[] }) =>
  store.menus?.find((m) => m.photo)?.photo ?? null;
