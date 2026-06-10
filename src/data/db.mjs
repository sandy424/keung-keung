import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// 🔥 여기에 본인 Firebase 설정 넣기
const firebaseConfig = {
  apiKey: "AIzaSyC8x86MQfCPaVHVBlcE-yyfSspPJk6o7ns",
  authDomain: "keung-keung.firebaseapp.com",
  projectId: "keung-keung",
  storageBucket: "keung-keung.firebasestorage.app",
  messagingSenderId: "957104321141",
  appId: "1:957104321141:web:2311e55c49918b40a73e3c",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const shops = [
  {
    name: "릴리케이크카페",
    category: ["케이크"],
    address: "부산광역시 수영구 수영로388번길 25-11",
    tel: "010-3822-5509",
    lat: 35.143449,
    lng: 129.107838,
    avgRating: 4.8,
    menus: [
      { name: "딸기 케이크", price: 7500 },
      { name: "레몬 케이크", price: 6500 },
      { name: "초코 케이크", price: 7000 },
    ],
  },
  {
    name: "이앤디스튜디오",
    category: ["케이크"],
    address: "부산광역시 수영구 수영로540번길 26",
    tel: "",
    lat: 35.155941,
    lng: 129.114189,
    avgRating: 3.6,
    menus: [
      { name: "커스텀 케이크", price: 45000 },
      { name: "미니 케이크", price: 18000 },
    ],
  },
  {
    name: "오감베이커리",
    category: ["빵"],
    address: "부산광역시 연제구 연산동 353-4",
    tel: "051-996-6600",
    lat: 35.195775,
    lng: 129.10117,
    avgRating: 4.4,
    menus: [
      { name: "크루아상", price: 3500 },
      { name: "식빵", price: 5000 },
      { name: "단팥빵", price: 2500 },
    ],
  },
  {
    name: "자연도소금빵",
    category: ["빵"],
    address: "부산광역시 해운대구 달맞이길62번길 12-1",
    tel: "051-741-2245",
    lat: 35.163987,
    lng: 129.171001,
    avgRating: 4.6,
    menus: [
      { name: "소금빵", price: 2800 },
      { name: "버터 소금빵", price: 3200 },
      { name: "치즈 소금빵", price: 3500 },
    ],
  },
  {
    name: "연의양과",
    category: ["구움과자", "타르트"],
    address: "부산광역시 부산진구 동천로 56 1층",
    tel: "051-804-0923",
    lat: 35.153847,
    lng: 129.062751,
    avgRating: 4.9,
    menus: [
      { name: "에그 타르트", price: 3500 },
      { name: "피낭시에", price: 2500 },
      { name: "마들렌", price: 2000 },
    ],
  },
  {
    name: "바게트 제작소",
    category: ["빵"],
    address: "부산광역시 부산진구 전포대로199번길 19",
    tel: "",
    lat: 35.154654,
    lng: 129.064103,
    avgRating: 4.7,
    menus: [
      { name: "바게트", price: 4500 },
      { name: "캄파뉴", price: 6000 },
    ],
  },
  {
    name: "고메",
    category: ["타르트", "케이크"],
    address: "부산광역시 부산진구 서전로46번길 90 카페 gourmet 메리온시티 1층",
    tel: "010-8779-1809",
    lat: 35.154238,
    lng: 129.064808,
    avgRating: 4.8,
    menus: [
      { name: "과일 타르트", price: 6500 },
      { name: "가나슈 타르트", price: 6000 },
      { name: "시즌 케이크", price: 8000 },
    ],
  },
  {
    name: "화이트콩",
    category: ["케이크"],
    address: "부산광역시 사하구 당리동 341-45",
    tel: "051-291-0403",
    lat: 35.101646,
    lng: 128.977797,
    avgRating: 4.5,
    menus: [
      { name: "콩가루 케이크", price: 7000 },
      { name: "크림치즈 케이크", price: 7500 },
    ],
  },
  {
    name: "오븐의 온도",
    category: ["구움과자"],
    address: "부산광역시 부산진구 서전로38번길 43-13 101호",
    tel: "050-7134-85179",
    lat: 35.156133,
    lng: 129.064566,
    avgRating: 4.3,
    menus: [
      { name: "버터쿠키", price: 3000 },
      { name: "초코칩쿠키", price: 3000 },
      { name: "아몬드 튀일", price: 4000 },
    ],
  },
  {
    name: "젤라송 부산송도점",
    category: ["기타"],
    address: "부산광역시 서구 암남동 등대로 9 송도유림 스카이오션 더퍼스트 301동 102호",
    tel: "050-7141-02302",
    lat: 35.076386,
    lng: 129.023868,
    avgRating: 4.4,
    menus: [
      { name: "젤라토 1스쿱", price: 3500 },
      { name: "젤라토 2스쿱", price: 6000 },
    ],
  },
];

async function seed() {
  console.log("🌱 Firestore에 데이터 업로드 시작...");

  for (const store of shops) {
    const { id, ...data } = store;
    await addDoc(collection(db, "shops"), store);
    console.log(`✅ ${store.name} 업로드 완료`);
  }

  console.log("🎉 전체 업로드 완료!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ 오류 발생:", err);
  process.exit(1);
});
