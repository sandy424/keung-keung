import { useEffect,useRef } from "react";
import style from '../css/Home.module.css';

import Bottombar from "../components/Bottombar";
import Category from "../components/Category";

function Home() {

  const mapRef = useRef(null);

  useEffect(() => {
    const { naver } = window;

    if (!naver?.maps || !mapRef.current) return; // 네이버 스크립트 로드 전 보호 코드

    const location = new naver.maps.LatLng(35.1796, 129.0756);

    const map = new naver.maps.Map(mapRef.current, {
      center: location,
      zoom: 15,
    });

    new naver.maps.Marker({
      map,
      position: location,
    });
  }, []); // 처음 렌더링 한 번만 실행
  
  return (
    <div className={style.container}>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}/>
      <Category />
      <Bottombar />
    </div>
  );
}

export default Home;
