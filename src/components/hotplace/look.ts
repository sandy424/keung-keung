// 카테고리별 게시물 비주얼 (가게 사진이 없어서 일러스트 톤으로 표현)
const LOOKS: Record<string, { emoji: string[]; bg: string }> = {
  빵: { emoji: ["🥐", "🥖", "🍞"], bg: "from-amber-200 via-orange-100 to-yellow-50" },
  케이크: { emoji: ["🍰", "🎂", "🍓"], bg: "from-rose-200 via-pink-100 to-amber-50" },
  타르트: { emoji: ["🥧", "🍋", "🫐"], bg: "from-yellow-200 via-amber-100 to-rose-50" },
  구움과자: { emoji: ["🍪", "🧈", "🥮"], bg: "from-orange-200 via-amber-100 to-stone-50" },
  기타: { emoji: ["🧁", "🍮", "🍩"], bg: "from-violet-200 via-pink-100 to-amber-50" },
};

export const lookOf = (category?: string[]) => LOOKS[category?.[0] ?? "기타"] ?? LOOKS.기타;

// 첫 번째 메뉴 사진을 대표 사진으로 사용
export const coverPhoto = (store: { menus?: { photo?: string | null }[] }) =>
  store.menus?.find((m) => m.photo)?.photo ?? null;
