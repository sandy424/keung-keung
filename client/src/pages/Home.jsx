import { useEffect } from "react";
import Header from "../components/Header";

function Home() {

  useEffect(() => {
    const { naver } = window;

    if (!naver) return; // 네이버 스크립트 로드 전 보호 코드

    const location = new naver.maps.LatLng(35.1795543, 129.0756416);

    const mapOptions = {
      center: location,
      zoom: 17,
    };

    const map = new naver.maps.Map("map", mapOptions);

    new naver.maps.Marker({
      map,
      position: location,
    });
  }, []); // 처음 렌더링 한 번만 실행

  return (
    <div>
      <Header />
      <div
        id="map"
        style={{ width: "500px", height: "500px" }}
      />
    </div>
  );
}

export default Home;
