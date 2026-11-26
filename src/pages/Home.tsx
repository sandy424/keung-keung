import { useEffect, useMemo, useRef, useState } from "react";
import type { Store } from "../types/store";
import { CURRENT_REGION } from "../config/region";
import { ALL } from "../config/categories";
import useStores, { addStoreLocal } from "../hooks/useStores";
import { searchStores } from "../utils/search";

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
        LatLngBounds: any;
        Marker: any;
        Event: any;
        Service: any;
      };
    };
  }
}

function Home({ query, onClearQuery }: { query: string; onClearQuery: () => void }) {
  const { stores: allStores } = useStores();
  const [selected, setSelected] = useState(ALL);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [addModal, setAddModal] = useState(false);

  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any[]>([]);

  // 카테고리 + 검색(이름·태그·메뉴) 필터
  const stores = useMemo(() => {
    let filtered = allStores;
    if (selected !== ALL) {
      filtered = filtered.filter((store) => (store.category ?? []).includes(selected));
    }
    if (query.trim()) {
      filtered = searchStores(filtered, query).map((hit) => hit.store);
    }
    return filtered;
  }, [allStores, selected, query]);

  // 지도 생성
  useEffect(() => {
    if (!window.naver?.maps || !mapDivRef.current || mapRef.current) return;
    mapRef.current = new window.naver.maps.Map(mapDivRef.current, {
      center: new window.naver.maps.LatLng(CURRENT_REGION.center.lat, CURRENT_REGION.center.lng),
      zoom: CURRENT_REGION.zoom,
    });
  }, []);

  // 마커 생성
  useEffect(() => {
    if (!mapRef.current) return;
    const { maps } = window.naver;

    markerRef.current.forEach((marker) => marker.setMap(null));
    markerRef.current = [];

    stores.forEach((store) => {
      const marker = new maps.Marker({
        position: new maps.LatLng(store.lat, store.lng),
        map: mapRef.current,
        title: store.name,
      });
      maps.Event.addListener(marker, "click", () => {
        setSelectedStore(store);
        mapRef.current?.panTo(marker.getPosition());
      });
      markerRef.current.push(marker);
    });

    // 검색 중이면 결과가 모두 보이도록 지도 범위 조정
    if (query.trim() && stores.length > 0) {
      if (stores.length === 1) {
        mapRef.current.morph(new maps.LatLng(stores[0].lat, stores[0].lng), 16);
        setSelectedStore(stores[0]);
      } else {
        const bounds = new maps.LatLngBounds(
          new maps.LatLng(stores[0].lat, stores[0].lng),
          new maps.LatLng(stores[0].lat, stores[0].lng)
        );
        stores.forEach((s) => bounds.extend(new maps.LatLng(s.lat, s.lng)));
        mapRef.current.fitBounds(bounds, { top: 80, right: 60, bottom: 140, left: 60 });
      }
    }
  }, [stores, query]);

  return (
    <div className="relative mx-auto h-full w-full max-w-175">
      <div ref={mapDivRef} className="h-full w-full" />

      {/* 검색 결과 안내 */}
      {query.trim() && (
        <div className="absolute left-1/2 top-4 z-10 flex max-w-[calc(100%-7rem)] -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-amber-900/10 bg-white py-2 pl-4 pr-2 text-sm text-amber-950 shadow-md">
          <span className="truncate">
            ‘<b>{query}</b>’ {stores.length > 0 ? <>검색 결과 <b>{stores.length}곳</b></> : "검색 결과가 없어요"}
          </span>
          <button onClick={onClearQuery} className="shrink-0 rounded-full bg-amber-900/5 px-2.5 py-0.5 text-xs text-amber-900/60 hover:bg-amber-900/10">
            해제
          </button>
        </div>
      )}

      <StoreCard store={selectedStore} onClose={() => setSelectedStore(null)} />

      <Category selected={selected} onSelect={setSelected} />

      {/* 추천 가게 등록 버튼 */}
      <button
        onClick={() => setAddModal(true)}
        className="absolute bottom-28 right-5 z-10 flex h-12 items-center gap-1.5 rounded-full bg-amber-950 px-5 font-semibold text-white shadow-lg shadow-amber-950/20 transition hover:bg-amber-900 active:scale-95"
        aria-label="내가 추천하는 가게 등록"
      >
        <span className="text-lg leading-none">＋</span>
        <span className="text-sm">가게 추천</span>
      </button>

      {addModal && <AddStoreCard onClose={() => setAddModal(false)} onAdded={addStoreLocal} />}
      <Bottombar />
    </div>
  );
}

export default Home;
