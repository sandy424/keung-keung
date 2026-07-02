import { useEffect, useRef, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Store } from "../types/store";

import Bottombar from "../components/Bottombar";
import Category from "../components/Category";
import StoreCard from "../components/StoreCard";
import AddStoreCard from "../components/AddStoreCard";

// 네이버 맵 타입 선언
declare global {
  interface Window {
    naver: {
      maps: {
        Map: any;
        LatLng: any;
        Marker: any;
        Event: any;
        Service: any;
      };
    };
  }
}

function Home({ query }: { query: string }) {
  const [stores, setStores] = useState<Store[]>([]);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [selected, setSelected] = useState("전체");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [addModal, setAddModal] = useState(false);

  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any[]>([]);

  // 데이터 불러오기
  useEffect(() => {
    const fetchStores = async () => {
      const snapshot = await getDocs(collection(db, "shops"));

      const parsedStores: Store[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Store, "id">),
      }));

      setAllStores(parsedStores);
      setStores(parsedStores);
    };

    fetchStores();
  }, []);

  // 지도 생성
  useEffect(() => {
    if (!window.naver?.maps || !mapDivRef.current || mapRef.current) return;

    const location = new window.naver.maps.LatLng(35.1796, 129.0756);

    mapRef.current = new window.naver.maps.Map(mapDivRef.current, {
      center: location,
      zoom: 12,
    });
  }, []);

  // 마커 생성
  useEffect(() => {
    if (!mapRef.current) return;

    // 기존 마커 제거
    markerRef.current.forEach((marker) => marker.setMap(null));
    markerRef.current = [];

    stores.forEach((store) => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(store.lat, store.lng),
        map: mapRef.current,
      });

      // 마커 클릭
      window.naver.maps.Event.addListener(marker, "click", () => {
        setSelectedStore(store);
      });

      markerRef.current.push(marker);
    });
  }, [stores]);

  // 카테고리 및 검색 필터
  useEffect(() => {
    let filtered = allStores;

    if (selected !== "전체") {
      filtered = filtered.filter((store) =>
        store.category.includes(selected)
      );
    }

    if (query.trim() !== "") {
      filtered = filtered.filter((store) =>
        store.name.includes(query.trim())
      );
    }

    setStores(filtered);
  }, [selected, allStores, query]);

  const handleSelected = (category: string) => {
    setSelected(category);
  };

  // 새 가게 등록 시 로컬 state에도 바로 반영
  const handleStoreAdded = (newStore: Store) => {
    setAllStores((prev) => [...prev, newStore]);
  };

  return (
    <div className="relative mx-auto w-full max-w-175 min-h-[calc(100vh-5rem)]">
      <div
        ref={mapDivRef}
        className="w-full h-full min-h-[calc(100vh-5rem)]"
      />

      <StoreCard
        store={selectedStore}
        onClose={() => setSelectedStore(null)}
      />

      <Category
        selected={selected}
        onSelect={handleSelected}
      />

      {/* 가게 등록 버튼 */}
      <button
        onClick={() => setAddModal(true)}
        className="absolute right-5 bottom-24 h-12 w-12 flex items-center justify-center rounded-full bg-rose-400 text-white text-2xl shadow-md hover:bg-rose-500"
      >
        +
      </button>

      {addModal && (
        <AddStoreCard
          onClose={() => setAddModal(false)}
          onAdded={handleStoreAdded}
        />
      )}
      <Bottombar />
    </div>
  );
}

export default Home;