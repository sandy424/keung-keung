// Vercel 서버리스 함수: GET /api/place-info
// Google Places API (New)로 가게의 전화번호·영업시간을 불러온다.
//
// - placeId가 있으면 바로 상세 조회, 없으면 이름·주소·좌표로 검색해 placeId부터 찾는다.
// - 전화번호·영업시간은 Place Details Enterprise 요금 등급 (매달 무료 사용량 이후 과금).
//   → 필요한 필드만 field mask로 요청하고, 클라이언트는 찾은 placeId를 저장해 검색을 반복하지 않는다.
// - Google 약관상 placeId 외의 내용(전화번호·영업시간)은 저장·캐시하지 않고 매번 새로 받는다.
// - API 키(GOOGLE_PLACES_API_KEY)는 서버 환경변수에만 둔다.
//   Google Cloud 콘솔에서 키를 Places API (New)로 제한하고, 하루 요청 한도를 걸어 둘 것.

const PLACES_URL = "https://places.googleapis.com/v1";
const PLACE_ID_RE = /^[A-Za-z0-9_-]{10,300}$/;

export type PlaceInfo = {
  placeId: string | null;
  phone: string | null;
  weekdayText: string[]; // ["월요일: 오전 10:00~오후 9:00", ...]
  openNow: boolean | null;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const EMPTY: PlaceInfo = { placeId: null, phone: null, weekdayText: [], openNow: null };

// 이름·주소로 placeId 찾기 (id만 요청)
async function findPlaceId(key: string, name: string, address: string, lat: number | null, lng: number | null) {
  const body: Record<string, unknown> = {
    textQuery: `${name} ${address}`.trim(),
    languageCode: "ko",
    regionCode: "KR",
    pageSize: 1,
  };
  if (lat !== null && lng !== null) {
    body.locationBias = { circle: { center: { latitude: lat, longitude: lng }, radius: 300 } };
  }
  const res = await fetch(`${PLACES_URL}/places:searchText`, {
    method: "POST",
    headers: { "content-type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": "places.id" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`searchText ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { places?: { id: string }[] };
  return data.places?.[0]?.id ?? null;
}

// placeId로 전화번호·영업시간 조회
async function fetchDetails(key: string, placeId: string): Promise<PlaceInfo> {
  const url = `${PLACES_URL}/places/${encodeURIComponent(placeId)}?languageCode=ko&regionCode=KR`;
  const res = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "id,nationalPhoneNumber,regularOpeningHours.weekdayDescriptions,currentOpeningHours.openNow",
    },
  });
  if (res.status === 404) return EMPTY;
  if (!res.ok) throw new Error(`details ${res.status}: ${await res.text()}`);
  const p = (await res.json()) as {
    id?: string;
    nationalPhoneNumber?: string;
    regularOpeningHours?: { weekdayDescriptions?: string[] };
    currentOpeningHours?: { openNow?: boolean };
  };
  return {
    placeId: p.id ?? placeId,
    phone: p.nationalPhoneNumber ?? null,
    weekdayText: p.regularOpeningHours?.weekdayDescriptions ?? [],
    openNow: p.currentOpeningHours?.openNow ?? null,
  };
}

export async function GET(request: Request) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return json({ error: "Google 장소 정보가 아직 설정되지 않았어요." }, 503);

  const params = new URL(request.url).searchParams;
  const placeIdParam = params.get("placeId")?.trim() ?? "";
  const name = params.get("name")?.trim() ?? "";
  const address = params.get("address")?.trim() ?? "";
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  const hasCoord = Number.isFinite(lat) && Number.isFinite(lng) && params.has("lat") && params.has("lng");

  if (placeIdParam && !PLACE_ID_RE.test(placeIdParam)) return json({ error: "잘못된 placeId예요." }, 400);
  if (!placeIdParam && (name.length < 1 || name.length > 60 || address.length > 120)) {
    return json({ error: "가게 이름과 주소를 확인해 주세요." }, 400);
  }

  try {
    const placeId = placeIdParam || (await findPlaceId(key, name, address, hasCoord ? lat : null, hasCoord ? lng : null));
    if (!placeId) return json(EMPTY);
    return json(await fetchDetails(key, placeId));
  } catch (error) {
    // 하루 한도 초과(429) 등은 클라이언트가 네이버 지도 링크로 대체
    console.error("Google Places 조회 실패", error);
    return json({ error: "장소 정보를 불러오지 못했어요." }, 502);
  }
}
