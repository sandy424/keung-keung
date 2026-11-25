# 🍰 킁킁 (keung-keung)

> 달콤한 냄새를 따라가면, 부산의 디저트 맛집이 나와요.

부산 디저트 맛집을 지도에서 찾고, 직접 추천하고, 후기로 기록하는 웹 서비스입니다.

**🔗 https://keung-keung.vercel.app**

## 주요 기능

- **지도 탐색:** 사용자가 추천한 가게를 네이버 지도에 표시, 카테고리 필터
- **통합 검색:** 가게 이름·태그·메뉴로 검색, 초성 검색 지원 (`ㅋㅇㅋ` → 케이크)
- **맛집 추천:** 네이버 장소 검색으로 주소 자동 입력, 메뉴 사진 업로드
- **후기·별점:** 맛·분위기·친절·가격 항목별 평가
- **핫플레이스:** 별점 기반 3x3 랭킹, 기분에 맞는 가게 추천

## 기술 스택

React 19 · TypeScript · Vite · Tailwind CSS · Firebase (Auth, Firestore, Storage) · Naver Maps API · Vercel Functions

## 트러블슈팅

**새로고침하면 상세 페이지가 사라지는 문제**
`location.state`로 데이터를 넘기던 방식을 `/shop/:id` 경로로 바꾸고, URL의 id로 데이터를 직접 불러오게 했습니다.

**API 키 노출**
네이버 검색 API의 Secret 키를 브라우저에 두지 않도록, Vercel 서버리스 함수에서 대신 호출하게 했습니다.

**이미지 업로드 용량**
업로드 전에 브라우저에서 긴 변 800px의 WebP로 압축해 업로드 시간과 저장 용량을 줄였습니다.

## 실행

```bash
npm install
npm run dev
```

장소 검색을 쓰려면 `.env.local`에 `NAVER_SEARCH_CLIENT_ID`, `NAVER_SEARCH_CLIENT_SECRET`을 넣고 `npx vercel dev`로 실행합니다.
