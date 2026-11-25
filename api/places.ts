// Vercel 서버리스 함수: GET /api/places?query=가게이름
// 네이버 검색 API(지역)로 실제 가게를 찾아 이름·주소·전화번호·업종을 돌려준다.
// Client Secret은 서버 환경변수에만 두고 브라우저에는 노출하지 않는다.

const NAVER_LOCAL_URL = "https://openapi.naver.com/v1/search/local.json";
const REGION_NAME = "부산";

type NaverLocalItem = {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
};

export type Place = {
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  telephone: string;
  link: string;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // 같은 검색어는 잠시 캐시해서 호출 수를 줄임
      "cache-control": status === 200 ? "public, s-maxage=3600" : "no-store",
    },
  });

// 검색 결과 제목의 <b>강조</b> 태그와 HTML 엔티티 제거
export const stripHtml = (text: string) =>
  text
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

export async function GET(request: Request) {
  const clientId = process.env.NAVER_SEARCH_CLIENT_ID;
  const clientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return json({ error: "장소 검색이 아직 설정되지 않았어요." }, 503);
  }

  const raw = new URL(request.url).searchParams.get("query")?.trim() ?? "";
  if (raw.length < 2 || raw.length > 50) {
    return json({ error: "검색어는 2~50자로 입력해 주세요." }, 400);
  }
  // 서비스 지역 결과가 먼저 나오도록 지역명을 붙여 검색
  const query = raw.includes(REGION_NAME) ? raw : `${REGION_NAME} ${raw}`;

  try {
    const url = `${NAVER_LOCAL_URL}?${new URLSearchParams({ query, display: "5", sort: "random" })}`;
    const res = await fetch(url, {
      headers: { "X-Naver-Client-Id": clientId, "X-Naver-Client-Secret": clientSecret },
    });
    if (!res.ok) {
      console.error("Naver local search failed", res.status, await res.text());
      return json({ error: "장소 검색에 실패했어요." }, 502);
    }
    const data = (await res.json()) as { items?: NaverLocalItem[] };
    const places: Place[] = (data.items ?? [])
      .map((item) => ({
        name: stripHtml(item.title),
        category: item.category ?? "",
        address: item.address ?? "",
        roadAddress: item.roadAddress ?? "",
        telephone: item.telephone ?? "",
        link: item.link ?? "",
      }))
      .filter((p) => (p.roadAddress || p.address).startsWith(REGION_NAME));

    return json({ places });
  } catch (error) {
    console.error(error);
    return json({ error: "장소 검색 중 오류가 발생했어요." }, 500);
  }
}
