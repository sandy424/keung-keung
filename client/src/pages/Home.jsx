import { useEffect } from "react";
import style from '../css/Home.module.css';
import FireIcon from '../assets/icons/Fire.svg?react';
import HeartIcon from '../assets/icons/Heart.svg?react';
import ProfileIcon from '../assets/icons/Profile.svg?react';

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
    <div className={style.container}>
      <div
        id="map"
        style={{ width: "100%", height: "100%" }}/>
      
      <div className={style.menu}>
        <button className={style.menuIcon}>
          <FireIcon width={35} height={35} />
          <div>핫플레이스</div>
        </button>
        <button className={style.menuIcon}>
          <HeartIcon width={30} height={30} />
          <div>저장</div>
        </button>
        <button className={style.menuIcon}>
          <ProfileIcon width={35} height={35}/>
          <div>마이페이지</div>
        </button>
      </div>
    </div>
  );
}

export default Home;
