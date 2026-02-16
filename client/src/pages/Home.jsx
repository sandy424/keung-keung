import { useEffect,useRef, useState } from "react";
import style from '../css/Home.module.css';
import data from '../data/db.json';

import Bottombar from "../components/Bottombar";
import Category from "../components/Category";
import StoreCard from "../components/StoreCard";

function Home() {
  const [stores, setStores] = useState([]);
  const [allStores, setAllStores] = useState([]);
  const [selected, setSelected] = useState("전체");
  const [selectedStore, setSelectedStore] = useState(null);

  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef([]);

  //데이터 불러오기
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAllStores(data.stores);
    setStores(data.stores);
  }, []);
  
  // 지도 불러오기
  useEffect(() => {
    const { naver } = window;
    if (!naver?.maps || !mapDivRef.current) return; // 네이버 스크립트 로드 전 보호 코드

    const location = new naver.maps.LatLng(35.1796, 129.0756);
    mapRef.current = new naver.maps.Map(mapDivRef.current, {
      center: location,
      zoom: 12,
    });
  }, []); // 처음 렌더링 한 번만 실행

  //마커 생성
  useEffect(() => {
    if(!mapRef.current) return;
    // 기존 마커 제거
    markerRef.current.forEach(marker => marker.setMap(null));
    markerRef.current = [];

    stores.forEach(store => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(store.lat, store.lng),
        map: mapRef.current,
      });
      // 마커 클릭 -> 선택된 가게
      window.naver.maps.Event.addListener(marker, "click", () => {
        setSelectedStore(store);
      })
      markerRef.current.push(marker);
    });
  }, [stores]);
  
  //카테고리 필터
  useEffect(() => {
    if (selected === "전체") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStores(allStores);
    }else {
      setStores(
        allStores.filter(store => store.category.includes(selected))
      );
    }
  }, [selected, allStores]);

  const handleSelected = (category) => {
    setSelected(category);
  }

  return (
    <div className={style.container}>
      <div
        ref={mapDivRef}
        style={{ width: "100%", height: "100%" }}/>
        
      <StoreCard 
      store={selectedStore}
      onClose={() => setSelectedStore(null)}/>
      <Category 
      selected={selected}
      onSelect={handleSelected}/>
      <Bottombar />
    </div>
  );
}

export default Home;
