import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import style from "../css/Storecard.module.css";
import RateStar from "../assets/icons/RateStar.svg?react";
import SaveHeart from '../assets/icons/SaveHeart.svg?react';

function StoreCard({ store, onClose }) {
  const [saved, setSaved] = useState(false);
  const nav = useNavigate();

  if (!store) return null;

  const toggleSaved = () => {
    setSaved(prev => !prev);
  };

  return (
    <div className={style.card}> 
      {/* header */}
      <div className={style.header}>
        <p>{store.category}</p>
        <button className={style.closeBtn} onClick={onClose}>✕</button>
      </div>
      {/* 두 번째 header */}
      <div className={style.secondHeader}>
        <h2>{store.name}</h2>
        <button type="button" onClick={toggleSaved} className={style.heartBtn}>
          <SaveHeart width={35} height={35} color={saved ? 'red' : 'transparent'} />
        </button>
      </div>
      {/* 별점 */}
      <div className={style.star}>
        <RateStar width={24} height={24}/>
        <span>{store.rating}</span>
      </div>
      <div className={style.explain}>
        가게 설명
      </div>
      
      {/* 점수표 */}
      <div className={style.progressWrap}>
        <p>맛</p>
        <progress value={(store.rating / 5) * 100} max={100} />
        <div className={style.progressLabel}>{Math.round((store.rating / 5) * 100)}%</div>
      </div>
      <div className={style.progressWrap}>
        <p>분위기</p>
        <progress value={(store.rating / 5) * 100} max={100} />
        <div className={style.progressLabel}>{Math.round((store.rating / 5) * 100)}%</div>
      </div>
      <div className={style.progressWrap}>
        <p>친절</p>
        <progress value={(store.rating / 5) * 100} max={100} />
        <div className={style.progressLabel}>{Math.round((store.rating / 5) * 100)}%</div>
      </div>
      <div className={style.progressWrap}>
        <p>가격</p>
        <progress value={(store.rating / 5) * 100} max={100} />
        <div className={style.progressLabel}>{Math.round((store.rating / 5) * 100)}%</div>
      </div>
      <div className={style.detailpage}>
        <button onClick={() => nav("/detail")}>상세페이지</button>
      </div>
    </div>
  );
}

export default StoreCard;
