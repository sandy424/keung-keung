// 디저트 카테고리 설정
// 카테고리를 추가·수정할 때는 이 파일만 고치면 지도 필터, 가게 추천,
// 핫플레이스, 자동 분류에 모두 반영됨.

export type CategoryInfo = {
  name: string;
  emoji: string;
  // 마이페이지 취향 타입 이름 (이 카테고리를 제일 많이 즐긴 사람)
  fan: string;
  // 핫플레이스 게시물 일러스트 (가게 사진이 없을 때)
  look: { emoji: string[]; bg: string };
  // 네이버 업종·가게 이름·메뉴·소개글에 이 단어가 있으면 자동으로 추천
  keywords: RegExp;
};

export const CATEGORY_LIST: CategoryInfo[] = [
  {
    name: "빵",
    emoji: "🥐",
    fan: "빵지순례자",
    look: { emoji: ["🥐", "🥖", "🍞"], bg: "from-amber-200 via-orange-100 to-yellow-50" },
    keywords: /베이커리|제과|빵|브레드|bread|bakery|크루아상|크로와상|소금빵|바게트|베이글|식빵|깜빠뉴|캄파뉴|치아바타|브리오슈|프레첼|단팥|모닝빵/i,
  },
  {
    name: "케이크",
    emoji: "🍰",
    fan: "케이크 수집가",
    look: { emoji: ["🍰", "🎂", "🍓"], bg: "from-rose-200 via-pink-100 to-amber-50" },
    keywords: /케이크|케익|cake|티라미수|롤케|치즈케|생크림|쇼트|크레이프|레터링/i,
  },
  {
    name: "타르트",
    emoji: "🥧",
    fan: "타르트 감별사",
    look: { emoji: ["🥧", "🍋", "🫐"], bg: "from-yellow-200 via-amber-100 to-rose-50" },
    keywords: /타르트|tart|파이|pie|에그타르트|키슈/i,
  },
  {
    name: "구움과자",
    emoji: "🍪",
    fan: "구움과자 러버",
    look: { emoji: ["🍪", "🧈", "🥮"], bg: "from-orange-200 via-amber-100 to-stone-50" },
    keywords: /쿠키|cookie|구움|(?<!화)과자|휘낭시에|피낭시에|마들렌|스콘|scone|마카롱|다쿠아즈|까눌레|카눌레|브라우니|비스킷|쿠키샵/i,
  },
  {
    name: "도넛",
    emoji: "🍩",
    fan: "도넛 홀릭",
    look: { emoji: ["🍩", "🍫", "🍓"], bg: "from-pink-200 via-rose-100 to-amber-50" },
    keywords: /도넛|도너츠|도나쓰|donut|doughnut|크룰러|꽈배기|츄러스|베니에/i,
  },
  {
    name: "빙수",
    emoji: "🍧",
    fan: "빙수 원정대",
    look: { emoji: ["🍧", "🥭", "🍓"], bg: "from-sky-200 via-blue-50 to-rose-50" },
    keywords: /빙수|팥빙|설빙|bingsu|셰이브드|shaved/i,
  },
  {
    name: "젤라또",
    emoji: "🍨",
    fan: "젤라또 탐험가",
    look: { emoji: ["🍨", "🍦", "🍒"], bg: "from-emerald-100 via-sky-50 to-pink-100" },
    keywords: /젤라또|젤라토|gelato|아이스크림|ice ?cream|소프트콘|소프트 ?아이스|요거트 ?아이스|샤베트|소르베/i,
  },
  {
    name: "떡·한과",
    emoji: "🍡",
    fan: "K-디저트 마니아",
    look: { emoji: ["🍡", "🍵", "🌰"], bg: "from-lime-100 via-amber-50 to-rose-100" },
    keywords: /떡|한과|약과|양갱|화과자|모찌|찹쌀|인절미|개성주악|주악|전통 ?디저트|다식|정과|경단/i,
  },
  {
    name: "기타",
    emoji: "🧁",
    fan: "디저트 잡식가",
    look: { emoji: ["🧁", "🍮", "🍫"], bg: "from-violet-200 via-pink-100 to-amber-50" },
    // 다른 카테고리에 안 맞는 디저트 (컵케이크, 푸딩, 크로플, 와플 등)
    keywords: /푸딩|크로플|와플|waffle|크레페|수플레|팬케이크|초콜릿|쇼콜라|컵케이크|에클레어|슈크림/i,
  },
];

// 카테고리 이름만 모은 배열
export const CATEGORIES = CATEGORY_LIST.map((c) => c.name);
export const ALL = "전체";
export const FILTER_CATEGORIES = [ALL, ...CATEGORIES];

const BY_NAME = Object.fromEntries(CATEGORY_LIST.map((c) => [c.name, c]));
const FALLBACK = BY_NAME["기타"];

export const categoryInfo = (name?: string): CategoryInfo => BY_NAME[name ?? ""] ?? FALLBACK;

// 가게 정보(네이버 업종, 가게 이름, 메뉴, 소개글)를 보고 카테고리를 추정
// 여러 개가 맞으면 모두 돌려줌 (예: 케이크와 빵을 함께 파는 베이커리)
export function guessCategories(...texts: (string | undefined | null)[]): string[] {
  const text = texts.filter(Boolean).join(" ");
  if (!text.trim()) return [];
  const found = CATEGORY_LIST.filter((c) => c.name !== "기타" && c.keywords.test(text)).map((c) => c.name);
  if (found.length) return found;
  // 디저트 관련 단어만 있고 어디에도 안 맞으면 기타
  return FALLBACK.keywords.test(text) ? ["기타"] : [];
}
