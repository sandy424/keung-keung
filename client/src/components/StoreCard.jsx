import style from "../css/Storecard.module.css";
import RateStar from "../assets/icons/RateStar.svg?react";
import SaveHeart from '../assets/icons/SaveHeart.svg?react';

function StoreCard({ store, onClose }) {
  if (!store) return null;


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
        <button >
          <SaveHeart width={35} height={35}/>
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
        <button>상세페이지</button>
      </div>
    </div>
  );
}

export default StoreCard;
