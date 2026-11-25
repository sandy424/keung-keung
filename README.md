# 🍰 킁킁 (keung-keung)

> 달콤한 냄새를 따라가면, 부산의 디저트 맛집이 나와요.

**킁킁**은 부산 지역 디저트 맛집을 지도에서 찾고, 직접 추천하고, 후기와 별점으로 기록하는 웹 서비스입니다.
사용자가 아는 맛집을 등록하면 지도에 핀으로 표시되고, 킁킁 안에서 남긴 후기로 랭킹이 만들어집니다.

- **서비스:** https://keung-keung.vercel.app
- **대상 사용자:** 디저트를 좋아하고, 요즘 유행하는 디저트를 경험해 보고 싶은 사람
- **서비스 지역:** 부산 (지역 확장 예정)

<br />

## 주요 기능

### 🗺️ 지도에서 맛집 탐색
- 네이버 지도 위에 사용자가 추천한 가게를 핀으로 표시
- 핀을 누르면 가게 카드가 화면 가운데에 표시됨 (평균 별점, 후기 수, 영업시간, 한 줄 후기, 항목별 점수)
- 카테고리 필터 (빵 · 케이크 · 타르트 · 구움과자 · 기타)

### 🔍 통합 검색
- 가게 이름, 카테고리·태그, **메뉴 이름**, 추천 한마디를 부분 일치로 검색
- **초성 검색** 지원 (`ㅋㅇㅋ` → 케이크), 띄어쓰기·`#` 무시
- 입력하는 동안 결과를 드롭다운으로 미리 보여주고, 어디서 일치했는지(태그·메뉴) 표시
- Enter를 누르면 지도에 검색 결과만 남기고 결과가 모두 보이게 지도 범위 조정
- 키보드 조작 지원 (↑↓ / Enter / Esc, `/` 키로 검색창 포커스)

### 💌 맛집 추천 등록
- 가게 이름을 입력하면 **네이버 장소 검색**으로 실제 가게를 찾아 주소·전화번호·카테고리 자동 입력
- 추천 메뉴(이름·가격·**사진**), 태그, 추천 한마디, 영업시간 입력
- 메뉴 사진은 업로드 전 브라우저에서 긴 변 800px WebP로 압축
- 주소를 좌표로 바꿔 부산 지역인지 확인하고, 같은 이름의 가게 중복 등록 방지

### ✍️ 후기와 별점
- 맛 · 분위기 · 친절 · 가격을 각각 1~5점으로 평가, 500자 후기
- 등록하면 가게의 평균 별점과 항목별 평균, 후기 수가 바로 갱신됨

### 🔥 핫플레이스
- 인스타그램 프로필 형태의 **3x3 랭킹 그리드** (평균 별점 → 후기 수 순)
- 첫 번째 메뉴 사진을 대표 사진으로 사용, 칸을 누르면 가게 상세로 이동
- **킁킁이의 추천:** 기분이나 상황(비 오는 날, 데이트, 선물용 등)에 맞는 가게 추천

### 👤 마이페이지 · 저장
- 찜한 가게 목록, 내가 쓴 후기 모아보기
- 헤더 프로필 메뉴에서 마이페이지 이동, 로그아웃

### ✨ 인트로
- 첫 방문 시 "냄새를 따라가는" 콘셉트의 인트로 애니메이션 (세션당 1회, `/intro`에서 다시 보기)
- `prefers-reduced-motion` 설정을 켠 사용자에게는 애니메이션 생략

<br />

## 기술 스택

| 구분 | 사용 기술 |
|---|---|
| Frontend | React 19, TypeScript, Vite 7, React Router 7 |
| Styling | Tailwind CSS 4 |
| Map | Naver Maps JavaScript API v3 (지도, 지오코딩) |
| Backend (BaaS) | Firebase Authentication, Cloud Firestore, Cloud Storage |
| Serverless | Vercel Functions (`api/`) |
| 외부 API | 네이버 검색 API(지역), Claude API(선택) |
| 배포 | Vercel (PR마다 미리보기 배포) |

> 처음에는 Node.js + Express + MySQL 백엔드를 계획했지만, 프론트엔드에 집중하기 위해 서버 없이 인증·DB·파일 저장을 제공하는 **Firebase**로 바꿨습니다.
> API 키처럼 브라우저에 노출되면 안 되는 값이 필요한 기능만 **Vercel 서버리스 함수**로 분리했습니다.

<br />

## 화면 구성

| 경로 | 화면 |
|---|---|
| `/` | 메인 지도 (검색, 카테고리 필터, 가게 카드, 가게 추천 등록) |
| `/intro` | 인트로 다시 보기 |
| `/shop/:id` | 가게 상세 (정보 · 메뉴 · 리뷰, 저장) |
| `/shop/:id/review` | 후기 작성 |
| `/hotplace` | 핫플레이스 랭킹 + 킁킁이의 추천 |
| `/saved` | 찜한 가게 |
| `/mypage` | 마이페이지 |
| `/login`, `/signup` | 로그인 (닉네임 + 비밀번호), 회원가입 |

<br />

## 프로젝트 구조

```
├── api/                    # Vercel 서버리스 함수
│   ├── places.ts           # 네이버 장소 검색 프록시
│   └── recommend.ts        # 킁킁이의 추천 (Claude API, 키가 있을 때만)
├── public/                 # 아이콘, 캐릭터 이미지
├── src/
│   ├── components/         # Header, StoreCard, AddStoreCard, ProfileMenu ...
│   │   ├── hotplace/       # 킁킁이의 추천, 그리드 비주얼
│   │   └── intro/          # 인트로 화면
│   ├── config/region.ts    # 서비스 지역 설정 (지도 중심, 주소 검증)
│   ├── hooks/              # useAuth, useStores, useShop, useSaved
│   ├── pages/              # 라우트별 페이지
│   ├── types/store.ts      # Store, Review, Menu 타입
│   ├── utils/              # 검색(초성), 별점 계산, 이미지 압축, 네이버 유틸
│   └── firebase.ts
├── storage.rules           # Firebase Storage 보안 규칙
└── vercel.json             # SPA 라우팅 rewrite
```

<br />

## 데이터 구조 (Firestore)

```
shops/{shopId}
├── name, address, tel, hours, description
├── category: string[]        // 빵, 케이크 ...
├── tags: string[]            // 오션뷰, 데이트 ...
├── menus: { name, price, photo }[]
├── lat, lng, region          // region: "busan"
├── avgRating, reviewCount    // 후기 등록 시 갱신
├── taste, atmosphere, kindness, price   // 항목별 평균
├── createdBy, recommender, createdAt
└── reviews/{reviewId}
    ├── rating: { taste, mood, kind, price }
    ├── text, userId, nickname, createdAt

users/{uid}
├── email, nickname, createAt
├── saved/{shopId}            // 찜
└── reviews/{reviewId}        // 내 후기 (마이페이지용)
```

<br />

## 기술적 고민과 트러블슈팅

### 1. 상세 페이지가 새로고침하면 사라지는 문제
- **문제:** 가게 데이터를 `navigate("/detail", { state: { store } })`로 넘겨서, 새로고침하거나 링크를 공유하면 `state`가 사라져 빈 화면이 됐습니다.
- **해결:** 경로를 `/shop/:id`로 바꾸고, 상세 페이지가 URL의 id로 Firestore에서 직접 데이터를 불러오도록 `useShop` 훅을 만들었습니다. 맛집을 "공유"하는 서비스 목적에도 맞게 됐습니다.

### 2. "Rendered more hooks than during the previous render" 에러
- **문제:** 상세 페이지에서 `if (!store) return null` 같은 early return 뒤에 `useRef`를 호출해, 렌더링마다 hook 개수가 달라졌습니다.
- **해결:** 모든 hook을 컴포넌트 최상단에서 같은 순서로 호출하고, early return은 그 뒤로 옮겼습니다.

### 3. 여러 화면에서 같은 데이터를 중복으로 불러오는 문제
- **문제:** 헤더 검색, 지도, 핫플레이스가 각자 `shops` 컬렉션을 불러와 같은 요청이 반복됐습니다.
- **해결:** `useSyncExternalStore`로 모듈 단위 저장소를 만든 `useStores` 훅으로 한 번만 불러와 공유하고, 새 가게 등록이나 후기 작성 후에만 다시 불러오게 했습니다.

### 4. 한글 검색 경험
- 단순 `includes`로는 "케이크"를 "케 이크"로 치거나 초성만 입력하면 찾을 수 없었습니다.
- 공백·`#`을 제거해 정규화하고, 유니코드 계산(`(code - 0xAC00) / 588`)으로 초성을 뽑아 초성 검색을 지원했습니다.
- 이름 > 태그 > 메뉴 > 소개 순으로 점수를 매겨 정렬하고, 한글 조합 중 Enter가 두 번 처리되지 않도록 `isComposing`을 확인했습니다.

### 5. API 키를 브라우저에 노출하지 않기
- 네이버 검색 API의 Client Secret은 클라이언트 코드에 넣으면 누구나 볼 수 있고, 브라우저에서 직접 호출하면 CORS에도 막힙니다.
- Vercel 서버리스 함수(`api/places.ts`)가 대신 호출하고, 키는 Vercel 환경변수에만 둡니다. 같은 검색어는 1시간 캐시해 호출 수를 줄였습니다.

### 6. 이미지 업로드 용량
- 휴대폰 사진은 수 MB라 그대로 올리면 업로드가 느리고 저장 용량도 빨리 찹니다.
- 업로드 전에 `createImageBitmap` + `canvas`로 긴 변 800px의 WebP로 압축합니다. WebP를 지원하지 않는 브라우저는 JPEG로 대체합니다.
- Storage 보안 규칙으로 로그인 사용자만, 5MB 이하의 이미지 파일만 올릴 수 있게 제한했습니다.

### 7. Vercel 배포 실패 (`vite: Permission denied`)
- **문제:** Windows에서 커밋된 `node_modules`가 레포에 포함돼 있었고, `node_modules/.bin/vite`에 실행 권한이 없어 Linux 빌드 환경에서 실패했습니다.
- **해결:** `node_modules`를 git 추적에서 제외해, 배포 환경에서 항상 새로 설치하도록 했습니다.

### 8. 지역 확장을 고려한 설계
- 지도 중심 좌표, 화면 문구, 주소 검증 규칙을 `src/config/region.ts` 한곳에서 관리합니다.
- 가게에 `region` 필드를 저장해 두어, 지역을 늘릴 때 설정만 추가하면 됩니다.

<br />

## 로컬에서 실행하기

```bash
npm install
npm run dev
```

`http://localhost:5173`에서 확인할 수 있습니다.

### 환경 변수
서버리스 함수(`api/`)가 쓰는 값입니다. 로컬에서는 프로젝트 루트의 `.env.local`에, 배포 환경에서는 Vercel 프로젝트 설정의 Environment Variables에 넣습니다. (`.env*` 파일은 git에 올라가지 않습니다.)

| 이름 | 용도 | 필수 |
|---|---|---|
| `NAVER_SEARCH_CLIENT_ID` | 네이버 검색 API(지역) | 장소 검색을 쓸 때 |
| `NAVER_SEARCH_CLIENT_SECRET` | 네이버 검색 API(지역) | 장소 검색을 쓸 때 |
| `ANTHROPIC_API_KEY` | 킁킁이의 추천을 Claude로 생성 | 선택 (없으면 키워드·별점 기반 추천) |

- `npm run dev`는 화면만 실행하고 `api/` 함수는 실행하지 않습니다. 이때 장소 검색은 직접 입력으로, 킁킁이의 추천은 키워드 기반 추천으로 동작합니다.
- 서버리스 함수까지 함께 테스트하려면 Vercel CLI로 실행합니다.

```bash
npx vercel dev
```

### 외부 서비스 설정
- **네이버 클라우드 Maps:** Web Dynamic Map 애플리케이션의 서비스 URL에 `http://localhost:5173`과 배포 주소를 등록해야 지도가 표시됩니다.
- **Firebase Storage:** 콘솔에서 Storage를 시작하고 `storage.rules`의 내용을 규칙 탭에 적용합니다.

<br />

## 앞으로 할 일
- [ ] 이미 등록된 가게에 메뉴·사진 추가 및 정보 수정
- [ ] 후기에 사진 첨부 (포토 후기)
- [ ] 내 위치 기반 주변 맛집 보기
- [ ] 부산 외 지역 확장
- [ ] 남은 JSX 파일(`main.jsx`, `Category.jsx`) TypeScript 전환
