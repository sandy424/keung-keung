// 서비스 지역 설정
// 지금은 부산만 운영. 지역을 넓힐 때는 REGIONS에 항목을 추가하고
// 지역 선택 UI에서 CURRENT_REGION 대신 선택된 지역을 쓰면 됨.

export type Region = {
  id: string;
  name: string; // 화면 표시용 (부산)
  nameEn: string; // 인트로 영문 표기
  center: { lat: number; lng: number };
  zoom: number;
  // 지오코딩 결과 주소가 이 접두어로 시작해야 등록 가능
  addressPrefixes: string[];
};

export const REGIONS: Record<string, Region> = {
  busan: {
    id: "busan",
    name: "부산",
    nameEn: "BUSAN",
    center: { lat: 35.1796, lng: 129.0756 },
    zoom: 12,
    addressPrefixes: ["부산광역시", "부산"],
  },
};

export const CURRENT_REGION: Region = REGIONS.busan;

// region 필드가 없는 기존 가게 데이터는 부산으로 취급
export const regionOf = (store: { region?: string }) => store.region ?? "busan";

export const isInRegion = (address: string, region: Region = CURRENT_REGION) =>
  region.addressPrefixes.some((p) => address.trim().startsWith(p));
