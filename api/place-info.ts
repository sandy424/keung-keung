// Vercel 서버리스 함수: GET /api/place-info?name=&address=&lat=&lng=
// 카카오 로컬 API(키워드 장소 검색)로 가게 전화번호를 불러온다.
//
// - 네이버 지역 검색 API는 전화번호를 주지 않아서(telephone 필드는 빈 값) 카카오를 사용.
// - 카카오 로컬 API는 결과를 저장하지 않고 실시간으로 호출해야 하므로 DB에 저장하지 않는다.
// - 가게 좌표 주변(반경 300m)에서 이름이 맞는 장소만 사용해, 엉뚱한 가게 번호가 나오지 않게 한다.
// - REST API 키(KAKAO_REST_API_KEY)는 서버 환경변수에만 둔다.

const KAKAO_KEYWORD_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";
const RADIUS_M = 300;

export type PlaceInfo = {
  phone: string | null;
  placeUrl: string | null; // 카카오맵 장소 페이지 (출처 링크)
};

export type KakaoDoc = {
  place_name: string;
  phone: string;
  place_url: string;
  distance: string;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

// 업종을 나타내는 말은 가게마다 붙였다 뗐다 해서 비교에서 뺌
const GENERIC = ["카페", "cafe", "커피", "coffee", "베이커리", "bakery", "디저트", "dessert", "제과점", "제과"];

// 단어 하나 정리: 업종 단어 자체면 버리고, 앞에 붙어 있으면 떼어냄 ("카페달조리법" → "달조리법")
// 떼고 남는 게 너무 짧으면 원래 이름의 일부로 보고 유지 ("커피빈" → 그대로)
const stripGeneric = (t: string) => {
  if (GENERIC.includes(t)) return "";
  const g = GENERIC.find((w) => t.startsWith(w));
  return g && t.length - g.length >= 2 ? t.slice(g.length) : t;
};

// 이름 핵심만 남기기
// "카페달조리법 부산전포본점" → "달조리법부산전포", "달조리법 부산전포점" → "달조리법부산전포"
export const normalize = (s: string) => {
  const raw = s.toLowerCase().replace(/[^0-9a-z가-힣\s]/g, " ");
  const tokens = raw.split(/\s+/).map(stripGeneric).filter(Boolean);
  if (tokens.length > 1) {
    // 마지막 지점명의 "본점·지점·직영점·점" 제거 ("부산전포본점" → "부산전포")
    const last = tokens.length - 1;
    tokens[last] = tokens[last].replace(/(본점|지점|직영점|점)$/, "") || tokens[last];
  }
  return tokens.join("") || raw.replace(/\s/g, "");
};

// 핵심 이름이 같거나, 한쪽이 다른 쪽을 포함하면 같은 가게로 봄 ("옵스" ⊂ "옵스 해운대점")
export const sameName = (a: string, b: string) => {
  const x = normalize(a);
  const y = normalize(b);
  return !!x && !!y && (x === y || x.includes(y) || y.includes(x));
};

const NEAR_M = 50; // 이름이 달라도 이 거리 안이면 같은 가게로 봄 ("OPS" vs "옵스" 같은 표기 차이)

// 후보 중 같은 가게 고르기: 이름이 맞는 곳 → (좌표가 있으면) 아주 가까운 곳
export function pickMatch(docs: KakaoDoc[], name: string, hasCoord: boolean) {
  const byName = docs.find((d) => sameName(d.place_name, name));
  if (byName) return byName;
  if (!hasCoord) return undefined;
  const near = docs
    .filter((d) => d.distance !== "" && Number(d.distance) <= NEAR_M)
    .sort((a, b) => Number(a.distance) - Number(b.distance));
  return near[0];
}

async function search(key: string, q: string, lat: number, lng: number, hasCoord: boolean) {
  const query = new URLSearchParams({ query: q, size: "15" });
  if (hasCoord) {
    query.set("x", String(lng));
    query.set("y", String(lat));
    query.set("radius", String(RADIUS_M));
    query.set("sort", "distance");
  }
  const res = await fetch(`${KAKAO_KEYWORD_URL}?${query}`, { headers: { Authorization: `KakaoAK ${key}` } });
  if (!res.ok) throw new Error(`Kakao ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { documents?: KakaoDoc[] };
  return data.documents ?? [];
}

export async function GET(request: Request) {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) return json({ error: "카카오 장소 정보가 아직 설정되지 않았어요." }, 503);

  const params = new URL(request.url).searchParams;
  const name = params.get("name")?.trim() ?? "";
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  const hasCoord = params.has("lat") && params.has("lng") && Number.isFinite(lat) && Number.isFinite(lng);
  const debug = params.get("debug") === "1";

  if (name.length < 1 || name.length > 60) return json({ error: "가게 이름을 확인해 주세요." }, 400);

  // 1차: 가게 이름 그대로, 2차: 지점명을 뺀 첫 단어 ("옵스 해운대점" → "옵스")
  const queries = [name];
  const brand = name.split(/\s+/)[0];
  if (hasCoord && brand && brand !== name && brand.length >= 2) queries.push(brand); // 좌표 반경 안에서만 (다른 지점 방지)

  try {
    const tried: { query: string; candidates: { name: string; distance: string; hasPhone: boolean }[] }[] = [];
    let match: KakaoDoc | undefined;
    for (const q of queries) {
      const docs = await search(key, q, lat, lng, hasCoord);
      tried.push({ query: q, candidates: docs.map((d) => ({ name: d.place_name, distance: d.distance, hasPhone: !!d.phone })) });
      match = pickMatch(docs, name, hasCoord);
      if (match) break;
    }
    const info: PlaceInfo = { phone: match?.phone?.trim() || null, placeUrl: match?.place_url || null };
    // debug=1: 어떤 후보가 왔는지 확인용 (공개 장소 정보만, 키는 포함하지 않음)
    return json(debug ? { ...info, matched: match?.place_name ?? null, hasCoord, tried } : info);
  } catch (error) {
    console.error("Kakao keyword search failed", error);
    return json({ error: "장소 정보를 불러오지 못했어요." }, 502);
  }
}
